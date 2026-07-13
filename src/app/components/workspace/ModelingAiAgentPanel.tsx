import { translateCurrent as t } from "../../lib/i18n";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { AiAgentContextSummary } from "../../lib/aiAgentContext";
import { buildAiAgentImpactPreview, type AiAgentImpactPreview } from "../../lib/aiAgentApply";
import {
  clearAiAgentInstructionHistory,
  clearAiAgentLocalData,
  DEFAULT_AI_AGENT_PANEL_PREFERENCES,
  readAiAgentInstructionHistory,
  readAiAgentPanelPreferences,
  rememberAiAgentInstruction,
  writeAiAgentPanelPreferences,
  type AiAgentMode
} from "../../lib/aiAgentPanelPreferences";
import type {
  AiAgentOperationPermissions,
  AiAgentOperationValidationResult,
  AiAgentScope,
  AiAgentSupportedOperation
} from "../../lib/aiAgentOperationContract";
import type { AiProviderReadiness } from "../../lib/aiSettings";

interface ModelingAiAgentPanelProps {
  providerReadiness: AiProviderReadiness;
  experimentalDirectExecutionEnabled: boolean;
  contextSummaries: Record<AiAgentScope, AiAgentContextSummary>;
  onPrepareProposal: (request: {
    scope: AiAgentScope;
    instruction: string;
    permissions: AiAgentOperationPermissions;
  }) => Promise<{ summary: string; validation: AiAgentOperationValidationResult; rawResponse?: string }>;
  onApplyProposal: (validation: AiAgentOperationValidationResult) => {
    appliedCount: number;
    skippedCount: number;
    impactPreview: AiAgentImpactPreview;
    canRollback: boolean;
  };
  onRollbackLastSession: () => boolean;
}

function formatAiAgentValue(value: unknown): string {
  if (typeof value === "string") {
    return `"${value}"`;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === undefined) {
    return "cleared";
  }
  try {
    return JSON.stringify(value) ?? "unserializable value";
  } catch {
    return "unserializable value";
  }
}

function formatAiAgentOperationDetails(operation: AiAgentSupportedOperation): string {
  if (operation.type === "update_entity") {
    const fieldSummary = Object.entries(operation.fields)
      .map(([fieldName, value]) => `${fieldName}: ${formatAiAgentValue(value)}`)
      .join(", ");
    return `${operation.entityKind} ${operation.entityId}${fieldSummary.length > 0 ? ` · ${fieldSummary}` : ""}`;
  }
  if (operation.type === "move_entity") {
    return `${operation.entityKind} ${operation.entityId}${
      operation.position === undefined ? "" : ` · x: ${operation.position.x}, y: ${operation.position.y}`
    }`;
  }
  if (operation.type === "place_entity_relative_to_entity") {
    return `${operation.entityKind} ${operation.entityId} ${operation.placement} ${operation.referenceEntityKind} ${operation.referenceEntityId}`;
  }
  if (operation.type === "batch_move_entities") {
    return `${operation.moves.length} canvas move${operation.moves.length === 1 ? "" : "s"}`;
  }
  if (operation.type === "add_connector") {
    return `${operation.id === undefined ? "" : `${operation.id} · `}${operation.technicalId} · ${operation.name} · ${operation.cavityCount} ways`;
  }
  if (operation.type === "add_splice") {
    return `${operation.id === undefined ? "" : `${operation.id} · `}${operation.technicalId} · ${operation.name} · ${operation.portCount} ports`;
  }
  if (operation.type === "add_node") {
    return `${operation.id === undefined ? "" : `${operation.id} · `}${operation.label} · x: ${operation.position.x}, y: ${operation.position.y}`;
  }
  if (operation.type === "add_segment") {
    return `${operation.nodeA} -> ${operation.nodeB} · ${operation.lengthMm} mm`;
  }
  if (operation.type === "add_wire") {
    return `${operation.technicalId} · ${operation.name} · ${operation.sectionMm2} mm2`;
  }
  if (operation.type === "delete_entity") {
    return `${operation.entityKind} ${operation.entityId}${operation.mode === "cascade" ? " · cascade" : ""}`;
  }
  if (operation.type === "create_catalog_item") {
    return `${operation.manufacturerReference} · ${operation.connectionCount} connections`;
  }
  if (operation.type === "assign_catalog_item") {
    return `${operation.entityKind} ${operation.entityId} -> ${operation.catalogItemId}`;
  }
  if (operation.type === "update_catalog_connector_layout") {
    return `${operation.catalogItemId} · ${operation.connectorLayout.ways.length} ways layout`;
  }
  if (operation.type === "set_connector_terminal_material") {
    return `${operation.connectorId} · way ${operation.cavityIndex}`;
  }
  if (operation.type === "lock_wire_route") {
    return `${operation.wireId} · ${operation.segmentIds.join(", ")}`;
  }
  if (operation.type === "clarification_required") {
    return operation.question;
  }
  return `${operation.wireIds.length} wire${operation.wireIds.length === 1 ? "" : "s"}`;
}

function formatCountLabel(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

type EntityCountEntry = {
  key: string;
  count: number;
  singular: string;
  plural?: string;
};

export function ModelingAiAgentPanel({
  providerReadiness,
  experimentalDirectExecutionEnabled,
  contextSummaries,
  onPrepareProposal,
  onApplyProposal,
  onRollbackLastSession
}: ModelingAiAgentPanelProps): ReactElement {
  const [initialPreferences] = useState(() => readAiAgentPanelPreferences());
  const [instruction, setInstruction] = useState(initialPreferences.instruction);
  const [targetScope, setTargetScope] = useState<AiAgentScope>(initialPreferences.targetScope);
  const [agentMode, setAgentMode] = useState<AiAgentMode>(initialPreferences.agentMode);
  const [permissions, setPermissions] = useState<AiAgentOperationPermissions>(initialPreferences.permissions);
  const [instructionHistory, setInstructionHistory] = useState(() => readAiAgentInstructionHistory());
  const [draftStatus, setDraftStatus] = useState<string | null>(null);
  const [draftRawResponse, setDraftRawResponse] = useState<string | null>(null);
  const [proposalValidation, setProposalValidation] = useState<AiAgentOperationValidationResult | null>(null);
  const [lastAppliedImpactPreview, setLastAppliedImpactPreview] = useState<AiAgentImpactPreview | null>(null);
  const [canRollbackLastSession, setCanRollbackLastSession] = useState(false);
  const [isPreparingProposal, setIsPreparingProposal] = useState(false);
  const selectedMode = agentMode === "direct" && !experimentalDirectExecutionEnabled ? "assisted" : agentMode;
  const selectedContextSummary = contextSummaries[targetScope];
  const canPrepareProposal =
    providerReadiness.isReady && selectedContextSummary.isAvailable && instruction.trim().length > 0 && !isPreparingProposal;
  const primaryActionLabel = selectedMode === "direct" ? "Run direct" : "Prepare";
  const enabledPermissionCount = useMemo(() => Object.values(permissions).filter(Boolean).length, [permissions]);
  const proposalImpactPreview = useMemo(
    () => (proposalValidation === null ? null : buildAiAgentImpactPreview(proposalValidation)),
    [proposalValidation]
  );
  const entityCountEntries: EntityCountEntry[] = [
    { key: "connectors", count: selectedContextSummary.counts.connectors, singular: "connector" },
    { key: "splices", count: selectedContextSummary.counts.splices, singular: "splice" },
    { key: "nodes", count: selectedContextSummary.counts.nodes, singular: "node" },
    { key: "segments", count: selectedContextSummary.counts.segments, singular: "segment" },
    { key: "wires", count: selectedContextSummary.counts.wires, singular: "wire" },
    {
      key: "catalog-items",
      count: selectedContextSummary.counts.catalogItems,
      singular: "catalog item",
      plural: "catalog items"
    }
  ];
  const updatePermission = (key: keyof AiAgentOperationPermissions, value: boolean) => {
    setPermissions((current) => ({
      ...current,
      [key]: value
    }));
    setProposalValidation(null);
    setDraftStatus(null);
    setDraftRawResponse(null);
  };

  useEffect(() => {
    if (agentMode === "direct" && !experimentalDirectExecutionEnabled) {
      setAgentMode("assisted");
    }
  }, [agentMode, experimentalDirectExecutionEnabled]);

  useEffect(() => {
    writeAiAgentPanelPreferences({
      instruction,
      targetScope,
      agentMode: selectedMode,
      permissions
    });
  }, [agentMode, instruction, permissions, selectedMode, targetScope]);

  return (
    <article className="panel ai-agent-panel" data-ai-agent-panel="true" aria-label={t("ui.modelingaiagentpanelAiAgentModelingWorkspace")}>
      <header className="list-panel-header">
        <div>
          <h2>{t("ui.modelingaiagentpanelAiAgent")}</h2>
          <p className="meta-line">{t("ui.modelingaiagentpanelPrepareControlledModelingOperationsFromAScopedInstruction")}</p>
        </div>
      </header>
      <div className="settings-import-summary" role="region" aria-label={t("ui.modelingaiagentpanelAiContextSummary")}>
        <p className="meta-line">
          <span>{t("ui.modelingaiagentpanelContext")}</span> <strong>{selectedContextSummary.scopeLabel}</strong>
        </p>
        <p className="meta-line">
          <span>{t("ui.networksummaryexportmenuNetwork")}</span> <strong>{selectedContextSummary.networkName ?? t("ui.none")}</strong>
        </p>
        <p className="meta-line ai-agent-context-entities">
          <span>{t("ui.modelingaiagentpanelEntities")}</span>
          <strong className="ai-agent-entity-counts" aria-label={t("ui.modelingaiagentpanelAiContextEntityCounts")}>
            {entityCountEntries.map(({ key, count, singular, plural }) => {
              const countLabel = `${count} ${formatCountLabel(count, singular, plural)}`;
              return (
                <span className="ai-agent-entity-count" key={key} aria-label={countLabel}>
                  <span className="ai-agent-entity-count-value">{count}</span>
                  <span>{formatCountLabel(count, singular, plural)}</span>
                </span>
              );
            })}
          </strong>
        </p>
        {selectedContextSummary.selectionLabel !== null ? (
          <p className="meta-line ai-agent-context-selection">
            <span>{t("ui.modelingaiagentpanelSelection")}</span> <strong>{selectedContextSummary.selectionLabel}</strong>
          </p>
        ) : null}
        {!selectedContextSummary.isAvailable && selectedContextSummary.unavailableReason !== null ? (
          <p className="meta-line">
            <span>{t("ui.modelingaiagentpanelStatus")}</span> <strong>{selectedContextSummary.unavailableReason}</strong>
          </p>
        ) : null}
      </div>

      <form className="stack-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          {t("ui.modelingaiagentpanelInstruction")}<textarea
            rows={5}
            value={instruction}
            onChange={(event) => {
              setInstruction(event.target.value);
              setDraftStatus(null);
              setDraftRawResponse(null);
              setProposalValidation(null);
            }}
            placeholder={t("ui.modelingaiagentpanelAddARoutingNodeNearTheDashboardConnectorAndPrepare")}
          />
        </label>
        <div className="form-split">
          <label>
            {t("ui.modelingaiagentpanelInstructionHistory")}<select
              aria-label={t("ui.modelingaiagentpanelInstructionHistory")}
              value=""
              disabled={instructionHistory.length === 0}
              onChange={(event) => {
                if (event.target.value.length === 0) {
                  return;
                }
                setInstruction(event.target.value);
                setDraftStatus(null);
                setDraftRawResponse(null);
                setProposalValidation(null);
              }}
            >
              <option value="">{t("ui.modelingaiagentpanelRecentInstructions")}</option>
              {instructionHistory.map((historyInstruction) => (
                <option value={historyInstruction} key={historyInstruction}>
                  {historyInstruction}
                </option>
              ))}
            </select>
          </label>
          <div className="row-actions settings-actions ai-agent-history-actions">
            <button
              type="button"
              disabled={instructionHistory.length === 0}
              onClick={() => {
                clearAiAgentInstructionHistory();
                setInstructionHistory([]);
                setDraftStatus("AI instruction history cleared.");
              }}
            >
              {t("ui.modelingaiagentpanelClearHistory")}</button>
            <button
              type="button"
              onClick={() => {
                clearAiAgentLocalData();
                setInstruction(DEFAULT_AI_AGENT_PANEL_PREFERENCES.instruction);
                setTargetScope(DEFAULT_AI_AGENT_PANEL_PREFERENCES.targetScope);
                setAgentMode(DEFAULT_AI_AGENT_PANEL_PREFERENCES.agentMode);
                setPermissions(DEFAULT_AI_AGENT_PANEL_PREFERENCES.permissions);
                setInstructionHistory([]);
                setDraftStatus("AI Agent local data reset.");
                setDraftRawResponse(null);
                setProposalValidation(null);
                setLastAppliedImpactPreview(null);
                setCanRollbackLastSession(false);
              }}
            >
              {t("ui.modelingaiagentpanelResetAIAgentLocalData")}</button>
          </div>
        </div>
        <div className="form-split">
          <label>
            {t("ui.modelingaiagentpanelTargetScope")}<select
              value={targetScope}
              onChange={(event) => {
                setTargetScope(event.target.value as AiAgentScope);
                setProposalValidation(null);
                setDraftStatus(null);
                setDraftRawResponse(null);
              }}
            >
              <option value="activeNetwork">{t("ui.functionalschematicpanelActiveNetwork")}</option>
              <option value="currentSelection">{t("ui.modelingaiagentpanelCurrentSelection")}</option>
              <option value="selectedHarness">{t("ui.modelingaiagentpanelSelectedHarness")}</option>
              <option value="allNetworks">{t("ui.modelingaiagentpanelAllNetworks")}</option>
            </select>
          </label>
          <label>
            {t("ui.modelingaiagentpanelAgentMode")}<select
              value={selectedMode}
              onChange={(event) => {
                setAgentMode(event.target.value as AiAgentMode);
                setProposalValidation(null);
                setDraftStatus(null);
                setDraftRawResponse(null);
              }}
            >
              <option value="assisted">{t("ui.modelingaiagentpanelAssistedProposal")}</option>
              <option value="direct" disabled={!experimentalDirectExecutionEnabled}>
                {t("ui.modelingaiagentpanelExperimentalDirectExecution")}</option>
            </select>
          </label>
        </div>
        {selectedMode === "direct" ? (
          <div className="settings-import-summary" role="region" aria-label={t("ui.modelingaiagentpanelExperimentalDirectExecutionWarning")}>
            <p className="meta-line">
              <span>{t("ui.modelingaiagentpanelExperimental")}</span>
              <strong>{t("ui.modelingaiagentpanelDirectExecutionAppliesLocallyValidOperationsImmediatelyAfterProviderValidation")}</strong>
            </p>
          </div>
        ) : null}

        <fieldset className="inline-fieldset ai-agent-permissions-fieldset">
          <legend>{t("ui.modelingaiagentpanelOperationPermissions")}</legend>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={permissions.add}
              onChange={(event) => updatePermission("add", event.target.checked)}
            />
            {t("ui.modelingaiagentpanelAddConnectorsSplicesNodesSegmentsOrValidWires")}</label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={permissions.move}
              onChange={(event) => updatePermission("move", event.target.checked)}
            />
            {t("ui.modelingaiagentpanelMoveSupportedCanvasEntities")}</label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={permissions.update}
              onChange={(event) => updatePermission("update", event.target.checked)}
            />
            {t("ui.modelingaiagentpanelUpdateSafeScalarFields")}</label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={permissions.route}
              onChange={(event) => updatePermission("route", event.target.checked)}
            />
            {t("ui.modelingaiagentpanelRegenerateRoutes")}</label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={permissions.delete}
              onChange={(event) => updatePermission("delete", event.target.checked)}
            />
            {t("ui.modelingaiagentpanelDeleteEntities")}</label>
        </fieldset>

        {draftStatus !== null ? (
          <p className="meta-line ai-agent-draft-status">
            {draftStatus}
            {isPreparingProposal ? <span className="ai-agent-status-loader" aria-label={t("ui.modelingaiagentpanelPreparingProposal")} /> : null}
            {draftRawResponse !== null ? (
              <span className="ai-agent-response-hover">
                <button type="button" className="ai-agent-response-info" aria-label={t("ui.modelingaiagentpanelShowAIResponse")}>
                  i
                </button>
                <span className="ai-agent-response-popover" role="tooltip">
                  <span className="ai-agent-response-popover-title">{t("ui.modelingaiagentpanelAiResponse")}</span>
                  <code>{draftRawResponse}</code>
                </span>
              </span>
            ) : null}
          </p>
        ) : null}

        <div className="row-actions settings-actions">
          <button
            type="button"
            disabled={!canPrepareProposal}
            onClick={() => {
              setIsPreparingProposal(true);
              setInstructionHistory(rememberAiAgentInstruction(instruction));
              setDraftStatus(
                selectedMode === "direct"
                  ? "Requesting and validating direct execution from configured provider..."
                  : "Requesting proposal from configured provider..."
              );
              setDraftRawResponse(null);
              void onPrepareProposal({
                scope: targetScope,
                instruction,
                permissions
              })
                .then((draft) => {
                  setDraftRawResponse(draft.rawResponse ?? null);
                  if (selectedMode === "direct") {
                    const result =
                      draft.validation.accepted.length === 0
                        ? {
                            appliedCount: 0,
                            skippedCount: 0,
                            impactPreview: buildAiAgentImpactPreview(draft.validation),
                            canRollback: false
                          }
                        : onApplyProposal(draft.validation);
                    setProposalValidation(draft.validation);
                    setLastAppliedImpactPreview(result.canRollback ? result.impactPreview : null);
                    setCanRollbackLastSession(result.canRollback);
                    setDraftStatus(
                      `${draft.summary} Direct execution applied ${result.appliedCount} accepted operation${
                        result.appliedCount === 1 ? "" : "s"
                      }, skipped ${result.skippedCount}, rejected ${draft.validation.rejected.length}, unsupported ${
                        draft.validation.unsupported.length
                      }, failed 0.`
                    );
                    return;
                  }
                  setProposalValidation(draft.validation);
                  setDraftStatus(
                    `${draft.summary} ${selectedContextSummary.scopeLabel} scope, ${enabledPermissionCount} enabled permission groups.`
                  );
                })
                .catch((error: unknown) => {
                  setProposalValidation(null);
                  setDraftStatus(error instanceof Error ? error.message : "Proposal generation failed.");
                  setDraftRawResponse(null);
                })
                .finally(() => {
                  setIsPreparingProposal(false);
                });
            }}
          >
            {isPreparingProposal ? (selectedMode === "direct" ? "Running..." : "Preparing...") : primaryActionLabel}
          </button>
          <button
            type="button"
            disabled={selectedMode === "direct" || proposalValidation === null || proposalValidation.accepted.length === 0}
            onClick={() => {
              if (proposalValidation === null) {
                return;
              }
              const result = onApplyProposal(proposalValidation);
              setProposalValidation(null);
              setDraftRawResponse(null);
              setLastAppliedImpactPreview(result.impactPreview);
              setCanRollbackLastSession(result.canRollback);
              setDraftStatus(
                `Applied ${result.appliedCount} accepted operation${result.appliedCount === 1 ? "" : "s"}. ${result.skippedCount} accepted operation${result.skippedCount === 1 ? "" : "s"} skipped.`
              );
            }}
          >
            {t("ui.modelingaiagentpanelApply")}</button>
          <button
            type="button"
            disabled={selectedMode === "direct" || proposalValidation === null}
            onClick={() => {
              setProposalValidation(null);
              setDraftStatus("Proposal rejected. Modeling state was not changed.");
              setDraftRawResponse(null);
            }}
          >
            {t("ui.modelingaiagentpanelReject")}</button>
          <button
            type="button"
            disabled={!canRollbackLastSession}
            onClick={() => {
              const didRollback = onRollbackLastSession();
              setCanRollbackLastSession(false);
              setLastAppliedImpactPreview(null);
              setProposalValidation(null);
              setDraftRawResponse(null);
              setDraftStatus(didRollback ? "Rolled back the last applied AI session." : "No AI session is available to roll back.");
            }}
          >
            {t("ui.modelingaiagentpanelRollback")}</button>
        </div>
      </form>
      {proposalValidation !== null ? (
        <div className="settings-import-summary ai-agent-proposal-summary" role="region" aria-label={t("ui.modelingaiagentpanelAiProposalSummary")}>
          {proposalImpactPreview !== null ? (
            <p className="meta-line">
              <span>{t("ui.modelingaiagentpanelImpact")}</span>
              <strong>
                {proposalImpactPreview.addCount} {t("ui.modelingaiagentpanelAdd")}{proposalImpactPreview.updateCount} {t("ui.modelingaiagentpanelUpdate")}{proposalImpactPreview.moveCount} {t("ui.modelingaiagentpanelMove")}{" "}
                {proposalImpactPreview.routeCount} {t("ui.modelingaiagentpanelRoute")}{proposalImpactPreview.deleteCount} {t("ui.modelingaiagentpanelDelete")}</strong>
            </p>
          ) : null}
          <p className="meta-line">
            <span>{t("ui.modelingaiagentpanelAccepted")}</span> <strong>{proposalValidation.accepted.length}</strong>
          </p>
          <p className="meta-line">
            <span>{t("ui.modelingaiagentpanelRejected")}</span> <strong>{proposalValidation.rejected.length}</strong>
          </p>
          <p className="meta-line">
            <span>{t("ui.modelingaiagentpanelUnsupported")}</span> <strong>{proposalValidation.unsupported.length}</strong>
          </p>
          <p className="meta-line">
            <span>{t("ui.warnings2")}</span> <strong>{proposalValidation.warnings.length}</strong>
          </p>
          {proposalValidation.accepted.map((operation, index) => (
            <p className="meta-line ai-agent-operation-line" key={`${operation.type}-${index}`}>
              <span>{t("ui.modelingaiagentpanelAcceptedOperation")}</span>
              <strong>{operation.type}</strong>
              <small>{formatAiAgentOperationDetails(operation)}</small>
            </p>
          ))}
          {proposalValidation.rejected.map((issue) => (
            <p className="meta-line ai-agent-operation-line" key={`rejected-${issue.operationType}-${issue.operationIndex}`}>
              <span>{t("ui.modelingaiagentpanelRejectedOperation")}</span> <strong>{issue.message}</strong>
            </p>
          ))}
          {proposalValidation.unsupported.map((issue) => (
            <p className="meta-line ai-agent-operation-line" key={`${issue.operationType}-${issue.operationIndex}`}>
              <span>{t("ui.modelingaiagentpanelUnsupportedOperation")}</span> <strong>{issue.operationType}</strong>
            </p>
          ))}
        </div>
      ) : null}
      {lastAppliedImpactPreview !== null ? (
        <div className="settings-import-summary ai-agent-proposal-summary" role="region" aria-label={t("ui.modelingaiagentpanelLastAISessionImpact")}>
          <p className="meta-line">
            <span>{t("ui.modelingaiagentpanelLastImpact")}</span>
            <strong>
              {lastAppliedImpactPreview.addCount} {t("ui.modelingaiagentpanelAdd")}{lastAppliedImpactPreview.updateCount} {t("ui.modelingaiagentpanelUpdate")}{lastAppliedImpactPreview.moveCount} {t("ui.modelingaiagentpanelMove")}{" "}
              {lastAppliedImpactPreview.routeCount} {t("ui.modelingaiagentpanelRoute")}{lastAppliedImpactPreview.deleteCount} {t("ui.modelingaiagentpanelDelete")}</strong>
          </p>
        </div>
      ) : null}
    </article>
  );
}

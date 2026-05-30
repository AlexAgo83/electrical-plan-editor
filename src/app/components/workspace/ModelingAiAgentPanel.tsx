import { useMemo, useState, type ReactElement } from "react";
import type { AiAgentContextSummary } from "../../lib/aiAgentContext";
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
  onApplyProposal: (validation: AiAgentOperationValidationResult) => { appliedCount: number; skippedCount: number };
}

type AgentMode = "assisted" | "direct";

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
  onApplyProposal
}: ModelingAiAgentPanelProps): ReactElement {
  const [instruction, setInstruction] = useState("");
  const [targetScope, setTargetScope] = useState<AiAgentScope>("activeNetwork");
  const [agentMode, setAgentMode] = useState<AgentMode>("assisted");
  const [permissions, setPermissions] = useState<AiAgentOperationPermissions>({
    add: true,
    move: true,
    update: true,
    route: true,
    delete: false
  });
  const [draftStatus, setDraftStatus] = useState<string | null>(null);
  const [draftRawResponse, setDraftRawResponse] = useState<string | null>(null);
  const [proposalValidation, setProposalValidation] = useState<AiAgentOperationValidationResult | null>(null);
  const [isPreparingProposal, setIsPreparingProposal] = useState(false);
  const selectedMode = agentMode === "direct" && !experimentalDirectExecutionEnabled ? "assisted" : agentMode;
  const selectedContextSummary = contextSummaries[targetScope];
  const canPrepareProposal =
    providerReadiness.isReady && selectedContextSummary.isAvailable && instruction.trim().length > 0 && !isPreparingProposal;
  const enabledPermissionCount = useMemo(() => Object.values(permissions).filter(Boolean).length, [permissions]);
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

  return (
    <article className="panel ai-agent-panel" aria-label="AI Agent modeling workspace">
      <header className="list-panel-header">
        <div>
          <h2>AI Agent</h2>
          <p className="meta-line">Prepare controlled modeling operations from a scoped instruction.</p>
        </div>
      </header>
      <div className="settings-import-summary" role="region" aria-label="AI context summary">
        <p className="meta-line">
          <span>Context</span> <strong>{selectedContextSummary.scopeLabel}</strong>
        </p>
        <p className="meta-line">
          <span>Network</span> <strong>{selectedContextSummary.networkName ?? "None"}</strong>
        </p>
        <p className="meta-line ai-agent-context-entities">
          <span>Entities</span>
          <strong className="ai-agent-entity-counts" aria-label="AI context entity counts">
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
            <span>Selection</span> <strong>{selectedContextSummary.selectionLabel}</strong>
          </p>
        ) : null}
        {!selectedContextSummary.isAvailable && selectedContextSummary.unavailableReason !== null ? (
          <p className="meta-line">
            <span>Status</span> <strong>{selectedContextSummary.unavailableReason}</strong>
          </p>
        ) : null}
      </div>

      <form className="stack-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Instruction
          <textarea
            rows={5}
            value={instruction}
            onChange={(event) => {
              setInstruction(event.target.value);
              setDraftStatus(null);
              setDraftRawResponse(null);
              setProposalValidation(null);
            }}
            placeholder="Add a routing node near the dashboard connector and prepare route updates for selected wires."
          />
        </label>
        <div className="form-split">
          <label>
            Target scope
            <select
              value={targetScope}
              onChange={(event) => {
                setTargetScope(event.target.value as AiAgentScope);
                setProposalValidation(null);
                setDraftStatus(null);
                setDraftRawResponse(null);
              }}
            >
              <option value="activeNetwork">Active network</option>
              <option value="currentSelection">Current selection</option>
              <option value="selectedHarness">Selected harness</option>
              <option value="allNetworks">All networks</option>
            </select>
          </label>
          <label>
            Agent mode
            <select
              value={selectedMode}
              onChange={(event) => {
                setAgentMode(event.target.value as AgentMode);
                setProposalValidation(null);
                setDraftStatus(null);
                setDraftRawResponse(null);
              }}
            >
              <option value="assisted">Assisted proposal</option>
              <option value="direct" disabled={!experimentalDirectExecutionEnabled}>
                Experimental direct execution
              </option>
            </select>
          </label>
        </div>

        <fieldset className="inline-fieldset">
          <legend>Operation permissions</legend>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={permissions.add}
              onChange={(event) => updatePermission("add", event.target.checked)}
            />
            Add connectors, splices, nodes, segments, or valid wires
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={permissions.move}
              onChange={(event) => updatePermission("move", event.target.checked)}
            />
            Move supported canvas entities
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={permissions.update}
              onChange={(event) => updatePermission("update", event.target.checked)}
            />
            Update safe scalar fields
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={permissions.route}
              onChange={(event) => updatePermission("route", event.target.checked)}
            />
            Regenerate routes
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={permissions.delete}
              onChange={(event) => updatePermission("delete", event.target.checked)}
            />
            Delete entities
          </label>
        </fieldset>

        {draftStatus !== null ? (
          <p className="meta-line ai-agent-draft-status">
            {draftStatus}
            {isPreparingProposal ? <span className="ai-agent-status-loader" aria-label="Preparing proposal" /> : null}
            {draftRawResponse !== null ? (
              <span className="ai-agent-response-hover">
                <button type="button" className="ai-agent-response-info" aria-label="Show AI response">
                  i
                </button>
                <span className="ai-agent-response-popover" role="tooltip">
                  <span className="ai-agent-response-popover-title">AI response</span>
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
              setDraftStatus("Requesting proposal from configured provider...");
              setDraftRawResponse(null);
              void onPrepareProposal({
                scope: targetScope,
                instruction,
                permissions
              })
                .then((draft) => {
                  setProposalValidation(draft.validation);
                  setDraftStatus(
                    `${draft.summary} ${selectedContextSummary.scopeLabel} scope, ${enabledPermissionCount} enabled permission groups.`
                  );
                  setDraftRawResponse(draft.rawResponse ?? null);
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
            {isPreparingProposal ? "Preparing..." : "Prepare proposal"}
          </button>
          <button
            type="button"
            disabled={proposalValidation === null || proposalValidation.accepted.length === 0}
            onClick={() => {
              if (proposalValidation === null) {
                return;
              }
              const result = onApplyProposal(proposalValidation);
              setProposalValidation(null);
              setDraftRawResponse(null);
              setDraftStatus(
                `Applied ${result.appliedCount} accepted operation${result.appliedCount === 1 ? "" : "s"}. ${result.skippedCount} accepted operation${result.skippedCount === 1 ? "" : "s"} skipped.`
              );
            }}
          >
            Apply proposal
          </button>
          <button
            type="button"
            disabled={proposalValidation === null}
            onClick={() => {
              setProposalValidation(null);
              setDraftStatus("Proposal rejected. Modeling state was not changed.");
              setDraftRawResponse(null);
            }}
          >
            Reject proposal
          </button>
        </div>
      </form>
      {proposalValidation !== null ? (
        <div className="settings-import-summary ai-agent-proposal-summary" role="region" aria-label="AI proposal summary">
          <p className="meta-line">
            <span>Accepted</span> <strong>{proposalValidation.accepted.length}</strong>
          </p>
          <p className="meta-line">
            <span>Rejected</span> <strong>{proposalValidation.rejected.length}</strong>
          </p>
          <p className="meta-line">
            <span>Unsupported</span> <strong>{proposalValidation.unsupported.length}</strong>
          </p>
          <p className="meta-line">
            <span>Warnings</span> <strong>{proposalValidation.warnings.length}</strong>
          </p>
          {proposalValidation.accepted.map((operation, index) => (
            <p className="meta-line ai-agent-operation-line" key={`${operation.type}-${index}`}>
              <span>Accepted operation</span>
              <strong>{operation.type}</strong>
              <small>{formatAiAgentOperationDetails(operation)}</small>
            </p>
          ))}
          {proposalValidation.rejected.map((issue) => (
            <p className="meta-line ai-agent-operation-line" key={`rejected-${issue.operationType}-${issue.operationIndex}`}>
              <span>Rejected operation</span> <strong>{issue.message}</strong>
            </p>
          ))}
          {proposalValidation.unsupported.map((issue) => (
            <p className="meta-line ai-agent-operation-line" key={`${issue.operationType}-${issue.operationIndex}`}>
              <span>Unsupported operation</span> <strong>{issue.operationType}</strong>
            </p>
          ))}
        </div>
      ) : null}
    </article>
  );
}

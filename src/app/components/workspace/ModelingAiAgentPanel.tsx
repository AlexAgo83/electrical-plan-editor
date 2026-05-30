import { useMemo, useState, type ReactElement } from "react";
import type { AiAgentContextSummary } from "../../lib/aiAgentContext";
import type { AiAgentOperationPermissions, AiAgentOperationValidationResult, AiAgentScope } from "../../lib/aiAgentOperationContract";
import type { AiProviderReadiness } from "../../lib/aiSettings";

interface ModelingAiAgentPanelProps {
  providerReadiness: AiProviderReadiness;
  experimentalDirectExecutionEnabled: boolean;
  contextSummaries: Record<AiAgentScope, AiAgentContextSummary>;
  onOpenSettings: () => void;
  onPrepareProposal: (request: {
    scope: AiAgentScope;
    instruction: string;
    permissions: AiAgentOperationPermissions;
  }) => Promise<{ summary: string; validation: AiAgentOperationValidationResult }>;
  onApplyProposal: (validation: AiAgentOperationValidationResult) => { appliedCount: number; skippedCount: number };
}

type AgentMode = "assisted" | "direct";

export function ModelingAiAgentPanel({
  providerReadiness,
  experimentalDirectExecutionEnabled,
  contextSummaries,
  onOpenSettings,
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
  const [proposalValidation, setProposalValidation] = useState<AiAgentOperationValidationResult | null>(null);
  const [isPreparingProposal, setIsPreparingProposal] = useState(false);
  const selectedMode = agentMode === "direct" && !experimentalDirectExecutionEnabled ? "assisted" : agentMode;
  const selectedContextSummary = contextSummaries[targetScope];
  const canPrepareProposal =
    providerReadiness.isReady && selectedContextSummary.isAvailable && instruction.trim().length > 0 && !isPreparingProposal;
  const enabledPermissionCount = useMemo(() => Object.values(permissions).filter(Boolean).length, [permissions]);
  const updatePermission = (key: keyof AiAgentOperationPermissions, value: boolean) => {
    setPermissions((current) => ({
      ...current,
      [key]: value
    }));
    setProposalValidation(null);
    setDraftStatus(null);
  };

  return (
    <article className="panel" aria-label="AI Agent modeling workspace">
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
        <p className="meta-line">
          <span>Entities</span>{" "}
          <strong>
            {selectedContextSummary.counts.connectors} connectors, {selectedContextSummary.counts.splices} splices,{" "}
            {selectedContextSummary.counts.nodes} nodes, {selectedContextSummary.counts.segments} segments,{" "}
            {selectedContextSummary.counts.wires} wires
          </strong>
        </p>
        {selectedContextSummary.selectionLabel !== null ? (
          <p className="meta-line">
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
              }}
            >
              <option value="activeNetwork">Active network</option>
              <option value="currentSelection">Current selection</option>
              <option value="selectedHarness" disabled>
                Selected harness (V2)
              </option>
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
            <input type="checkbox" checked={permissions.delete} disabled />
            Delete entities
          </label>
        </fieldset>

        {draftStatus !== null ? <p className="meta-line">{draftStatus}</p> : null}

        <div className="row-actions settings-actions">
          <button
            type="button"
            disabled={!canPrepareProposal}
            onClick={() => {
              setIsPreparingProposal(true);
              setDraftStatus("Requesting proposal from configured provider...");
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
                })
                .catch((error: unknown) => {
                  setProposalValidation(null);
                  setDraftStatus(error instanceof Error ? error.message : "Proposal generation failed.");
                })
                .finally(() => {
                  setIsPreparingProposal(false);
                });
            }}
          >
            {isPreparingProposal ? "Preparing..." : "Prepare proposal"}
          </button>
          <button type="button" onClick={onOpenSettings}>
            Open AI settings
          </button>
        </div>
      </form>
      {proposalValidation !== null ? (
        <div className="settings-import-summary" role="region" aria-label="AI proposal summary">
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
            <p className="meta-line" key={`${operation.type}-${index}`}>
              <span>Accepted operation</span> <strong>{operation.type}</strong>
            </p>
          ))}
          {proposalValidation.unsupported.map((issue) => (
            <p className="meta-line" key={`${issue.operationType}-${issue.operationIndex}`}>
              <span>Unsupported operation</span> <strong>{issue.operationType}</strong>
            </p>
          ))}
        </div>
      ) : null}
      <div className="row-actions settings-actions">
        <button
          type="button"
          disabled={proposalValidation === null || proposalValidation.accepted.length === 0}
          onClick={() => {
            if (proposalValidation === null) {
              return;
            }
            const result = onApplyProposal(proposalValidation);
            setProposalValidation(null);
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
          }}
        >
          Reject proposal
        </button>
      </div>
    </article>
  );
}

import { useMemo, useState, type ReactElement } from "react";
import type { AiAgentContextSummary } from "../../lib/aiAgentContext";
import type { AiAgentScope } from "../../lib/aiAgentOperationContract";
import type { AiProviderReadiness } from "../../lib/aiSettings";

interface ModelingAiAgentPanelProps {
  providerReadiness: AiProviderReadiness;
  experimentalDirectExecutionEnabled: boolean;
  contextSummaries: Record<AiAgentScope, AiAgentContextSummary>;
  onOpenSettings: () => void;
}

type AgentMode = "assisted" | "direct";

interface AgentPermissions {
  add: boolean;
  move: boolean;
  update: boolean;
  route: boolean;
  delete: boolean;
}

export function ModelingAiAgentPanel({
  providerReadiness,
  experimentalDirectExecutionEnabled,
  contextSummaries,
  onOpenSettings
}: ModelingAiAgentPanelProps): ReactElement {
  const [instruction, setInstruction] = useState("");
  const [targetScope, setTargetScope] = useState<AiAgentScope>("activeNetwork");
  const [agentMode, setAgentMode] = useState<AgentMode>("assisted");
  const [permissions, setPermissions] = useState<AgentPermissions>({
    add: true,
    move: true,
    update: true,
    route: true,
    delete: false
  });
  const [draftStatus, setDraftStatus] = useState<string | null>(null);
  const selectedMode = agentMode === "direct" && !experimentalDirectExecutionEnabled ? "assisted" : agentMode;
  const selectedContextSummary = contextSummaries[targetScope];
  const canPrepareProposal = providerReadiness.isReady && selectedContextSummary.isAvailable && instruction.trim().length > 0;
  const enabledPermissionCount = useMemo(
    () => Object.values(permissions).filter(Boolean).length,
    [permissions]
  );
  const updatePermission = (key: keyof AgentPermissions, value: boolean) => {
    setPermissions((current) => ({
      ...current,
      [key]: value
    }));
  };

  return (
    <article className="panel" aria-label="AI Agent modeling workspace">
      <header className="list-panel-header">
        <div>
          <h2>AI Agent</h2>
          <p className="meta-line">Prepare controlled modeling operations from a scoped instruction.</p>
        </div>
        <span className={providerReadiness.isReady ? "settings-state-chip is-ok" : "settings-state-chip is-warn"}>
          {providerReadiness.isReady ? "Provider ready" : "Provider required"}
        </span>
      </header>
      <div className="settings-import-summary">
        <p className="meta-line">
          <span>Provider</span> <strong>{providerReadiness.provider === "openai" ? "OpenAI" : "Gemini"}</strong>
        </p>
        <p className="meta-line">
          <span>Status</span> <strong>{providerReadiness.message}</strong>
        </p>
        <p className="meta-line">
          <span>Mode</span> <strong>{selectedMode === "assisted" ? "Assisted proposal" : "Experimental direct execution"}</strong>
        </p>
        <p className="meta-line">
          <span>Permissions</span> <strong>{enabledPermissionCount} enabled</strong>
        </p>
      </div>
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
            }}
            placeholder="Add a routing node near the dashboard connector and prepare route updates for selected wires."
          />
        </label>
        <div className="form-split">
          <label>
            Target scope
            <select value={targetScope} onChange={(event) => setTargetScope(event.target.value as AiAgentScope)}>
              <option value="activeNetwork">Active network</option>
              <option value="currentSelection">Current selection</option>
              <option value="selectedHarness" disabled>
                Selected harness (V2)
              </option>
            </select>
          </label>
          <label>
            Agent mode
            <select value={selectedMode} onChange={(event) => setAgentMode(event.target.value as AgentMode)}>
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
              setDraftStatus(
                `Draft ready for ${selectedContextSummary.scopeLabel.toLowerCase()} scope with ${enabledPermissionCount} enabled permission groups. Provider execution will be connected with the operation contract.`
              );
            }}
          >
            Prepare proposal
          </button>
          <button type="button" onClick={onOpenSettings}>
            Open AI settings
          </button>
        </div>
      </form>
      <div className="row-actions settings-actions">
        <button type="button" disabled>
          Apply proposal
        </button>
        <button type="button" disabled>
          Reject proposal
        </button>
      </div>
    </article>
  );
}

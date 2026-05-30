import type { ReactElement } from "react";
import type { AiProviderReadiness } from "../../lib/aiSettings";

interface ModelingAiAgentPanelProps {
  providerReadiness: AiProviderReadiness;
  onOpenSettings: () => void;
}

export function ModelingAiAgentPanel({ providerReadiness, onOpenSettings }: ModelingAiAgentPanelProps): ReactElement {
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
      <p className="empty-copy">
        The first AI Agent implementation starts with provider setup and readiness gating. Assisted proposals and operation
        validation will appear here in the next implementation slice.
      </p>
      <div className="settings-import-summary">
        <p className="meta-line">
          <span>Provider</span> <strong>{providerReadiness.provider === "openai" ? "OpenAI" : "Gemini"}</strong>
        </p>
        <p className="meta-line">
          <span>Status</span> <strong>{providerReadiness.message}</strong>
        </p>
      </div>
      <div className="row-actions settings-actions">
        <button type="button" onClick={onOpenSettings}>
          Open AI settings
        </button>
      </div>
    </article>
  );
}

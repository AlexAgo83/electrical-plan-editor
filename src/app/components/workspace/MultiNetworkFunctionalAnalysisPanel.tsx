import type { ReactElement } from "react";
import type {
  MultiNetworkFunctionalAnalysisFinding,
  MultiNetworkFunctionalAnalysisModel,
  MultiNetworkFunctionalAnalysisScope
} from "../../lib/multiNetworkFunctionalAnalysis";
import { TableEntryCountFooter } from "./TableEntryCountFooter";

interface MultiNetworkFunctionalAnalysisPanelProps {
  model: MultiNetworkFunctionalAnalysisModel;
  scope: MultiNetworkFunctionalAnalysisScope;
  setScope: (value: MultiNetworkFunctionalAnalysisScope) => void;
}

export function MultiNetworkFunctionalAnalysisPanel({
  model,
  scope,
  setScope
}: MultiNetworkFunctionalAnalysisPanelProps): ReactElement {
  const assemblyDisabled = model.activeAssemblyName === null;
  const activeScopeLabel = scope === "assembly" && model.activeAssemblyName !== null
    ? model.activeAssemblyName
    : model.selectedNetworkLabels[0] ?? "Current network";

  return (
    <section className="panel">
      <header className="list-panel-header">
        <h2>Multi-network functional analysis</h2>
        <div className="list-panel-header-tools">
          <div className="chip-group list-panel-filters" role="group" aria-label="Functional analysis scope">
            <button
              type="button"
              className={scope === "current" ? "filter-chip is-active" : "filter-chip"}
              aria-pressed={scope === "current"}
              onClick={() => setScope("current")}
            >
              Current network
            </button>
            <button
              type="button"
              className={scope === "assembly" ? "filter-chip is-active" : "filter-chip"}
              aria-pressed={scope === "assembly"}
              disabled={assemblyDisabled}
              onClick={() => setScope("assembly")}
            >
              Active assembly
              <span className="filter-chip-count">{model.availableNetworkCount}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="chip-group list-panel-filters" aria-label="Functional analysis summary">
        <span className="status-chip is-error">Errors {model.summary.errors}</span>
        <span className="status-chip is-warning">Warnings {model.summary.warnings}</span>
        <span className="status-chip">Info {model.summary.info}</span>
        <span className="status-chip">L1 {model.summary.l1}</span>
      </div>

      <p className="empty-copy">
        Scope: {activeScopeLabel}
        {model.selectedNetworkLabels.length > 1 ? ` (${model.selectedNetworkLabels.join(", ")})` : ""}
      </p>

      {model.findings.length === 0 ? (
        <p className="empty-copy">No functional analysis findings for this scope.</p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Family</th>
                <th>Scope</th>
                <th>Finding</th>
              </tr>
            </thead>
            <tbody>
              {model.findings.map((finding) => (
                <FindingRow key={finding.id} finding={finding} />
              ))}
            </tbody>
          </table>
          <TableEntryCountFooter count={model.findings.length} />
        </>
      )}
    </section>
  );
}

function FindingRow({ finding }: { finding: MultiNetworkFunctionalAnalysisFinding }): ReactElement {
  const chipClass = finding.severity === "error"
    ? "status-chip is-error"
    : finding.severity === "warning"
      ? "status-chip is-warning"
      : "status-chip";
  return (
    <tr>
      <td>
        <span className={chipClass}>{severityLabel(finding.severity)}</span>
      </td>
      <td>{finding.family}</td>
      <td>{finding.networkLabel}</td>
      <td>{finding.message}</td>
    </tr>
  );
}

function severityLabel(severity: MultiNetworkFunctionalAnalysisFinding["severity"]): string {
  return severity === "error" ? "Error" : severity === "warning" ? "Warning" : "Info";
}

import type { ReactElement } from "react";
import type { NetworkId } from "../../../core/entities";
import type {
  MultiNetworkFunctionalAnalysisFinding,
  MultiNetworkFunctionalAnalysisModel,
  MultiNetworkFunctionalAnalysisScope,
  MultiNetworkFunctionalAnalysisTarget
} from "../../lib/multiNetworkFunctionalAnalysis";
import { TableEntryCountFooter } from "./TableEntryCountFooter";

interface MultiNetworkFunctionalAnalysisPanelProps {
  model: MultiNetworkFunctionalAnalysisModel;
  scope: MultiNetworkFunctionalAnalysisScope;
  setScope: (value: MultiNetworkFunctionalAnalysisScope) => void;
  onToggleCustomNetwork: (networkId: NetworkId) => void;
  onGoToFinding: (target: MultiNetworkFunctionalAnalysisTarget) => void;
}

export function MultiNetworkFunctionalAnalysisPanel({
  model,
  scope,
  setScope,
  onToggleCustomNetwork,
  onGoToFinding
}: MultiNetworkFunctionalAnalysisPanelProps): ReactElement {
  const assemblyDisabled = model.activeAssemblyName === null;
  const activeScopeLabel = scope === "assembly" && model.activeAssemblyName !== null
    ? model.activeAssemblyName
    : model.selectedNetworkLabels[0] ?? "Current network";

  return (
    <div className="multi-network-functional-analysis-panel">
      <div className="multi-network-functional-analysis-section">
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
          <button
            type="button"
            className={scope === "custom" ? "filter-chip is-active" : "filter-chip"}
            aria-pressed={scope === "custom"}
            disabled={assemblyDisabled}
            onClick={() => setScope("custom")}
          >
            Custom
            <span className="filter-chip-count">{model.networkOptions.filter((option) => option.selected).length}</span>
          </button>
        </div>
      </div>

      <div className="chip-group list-panel-filters multi-network-functional-analysis-summary" aria-label="Functional analysis summary">
        <span className="status-chip is-error">Errors {model.summary.errors}</span>
        <span className="status-chip is-warning">Warnings {model.summary.warnings}</span>
        <span className="status-chip">Info {model.summary.info}</span>
        <span className="status-chip">L1 {model.summary.l1}</span>
        <span className="status-chip">Loops {model.summary.loops}</span>
      </div>

      <p className="empty-copy">
        Scope: {activeScopeLabel}
        {model.selectedNetworkLabels.length > 1 ? ` (${model.selectedNetworkLabels.join(", ")})` : ""}
      </p>

      {scope === "custom" && model.networkOptions.length > 0 ? (
        <div className="chip-group list-panel-filters multi-network-functional-analysis-section" aria-label="Custom functional analysis networks">
          {model.networkOptions.map((option) => (
            <label key={option.id} className="filter-chip">
              <input
                type="checkbox"
                checked={option.selected}
                onChange={() => onToggleCustomNetwork(option.id)}
              />
              {option.label}
            </label>
          ))}
        </div>
      ) : null}

      {model.schematic !== null ? (
        <p className="empty-copy multi-network-functional-analysis-section">
          Union graph: {model.schematic.nodeCount} nodes, {model.schematic.edgeCount} edges.
          {model.schematic.warnings.length > 0 ? ` ${model.schematic.warnings.join(" ")}` : ""}
        </p>
      ) : null}

      {model.findings.length === 0 ? (
        <p className="empty-copy">No functional analysis findings for this scope.</p>
      ) : (
        <>
          <div className="table-scroll-container">
            <table className="data-table multi-network-functional-analysis-table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Family</th>
                  <th>Scope</th>
                  <th>Finding</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {model.findings.map((finding) => (
                  <FindingRow key={finding.id} finding={finding} onGoToFinding={onGoToFinding} />
                ))}
              </tbody>
            </table>
          </div>
          <TableEntryCountFooter count={model.findings.length} />
        </>
      )}
    </div>
  );
}

function FindingRow({
  finding,
  onGoToFinding
}: {
  finding: MultiNetworkFunctionalAnalysisFinding;
  onGoToFinding: (target: MultiNetworkFunctionalAnalysisTarget) => void;
}): ReactElement {
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
      <td>
        {finding.target === undefined ? (
          <span className="empty-copy">-</span>
        ) : (
          <button
            type="button"
            className="validation-row-go-to-button button-with-icon"
            onClick={() => {
              if (finding.target !== undefined) {
                onGoToFinding(finding.target);
              }
            }}
          >
            <span className="action-button-icon is-open" aria-hidden="true" />
            Go to
          </button>
        )}
      </td>
    </tr>
  );
}

function severityLabel(severity: MultiNetworkFunctionalAnalysisFinding["severity"]): string {
  return severity === "error" ? "Error" : severity === "warning" ? "Warning" : "Info";
}

import { translateCurrent as t } from "../../lib/i18n";
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
        <div className="chip-group list-panel-filters" role="group" aria-label={t("ui.multinetworkfunctionalanalysispanelFunctionalAnalysisScope")}>
          <button
            type="button"
            className={scope === "current" ? "filter-chip is-active" : "filter-chip"}
            aria-pressed={scope === "current"}
            onClick={() => setScope("current")}
          >
            {t("ui.multinetworkfunctionalanalysispanelCurrentNetwork")}</button>
          <button
            type="button"
            className={scope === "assembly" ? "filter-chip is-active" : "filter-chip"}
            aria-pressed={scope === "assembly"}
            disabled={assemblyDisabled}
            onClick={() => setScope("assembly")}
          >
            {t("ui.multinetworkfunctionalanalysispanelActiveAssembly")}<span className="filter-chip-count">{model.availableNetworkCount}</span>
          </button>
          <button
            type="button"
            className={scope === "custom" ? "filter-chip is-active" : "filter-chip"}
            aria-pressed={scope === "custom"}
            disabled={assemblyDisabled}
            onClick={() => setScope("custom")}
          >
            {t("ui.multinetworkfunctionalanalysispanelCustom")}<span className="filter-chip-count">{model.networkOptions.filter((option) => option.selected).length}</span>
          </button>
        </div>
      </div>

      <div className="chip-group list-panel-filters multi-network-functional-analysis-summary" aria-label={t("ui.multinetworkfunctionalanalysispanelFunctionalAnalysisSummary")}>
        <span className="status-chip is-error">{t("ui.errors2")} {model.summary.errors}</span>
        <span className="status-chip is-warning">{t("ui.warnings2")} {model.summary.warnings}</span>
        <span className="status-chip">{t("ui.info")} {model.summary.info}</span>
        <span className="status-chip">{t("ui.multinetworkfunctionalanalysispanelL1")}{model.summary.l1}</span>
        <span className="status-chip">{t("ui.multinetworkfunctionalanalysispanelLoops")}{model.summary.loops}</span>
      </div>

      <p className="empty-copy">
        
        {t("ui.scope")} {activeScopeLabel}
        {model.selectedNetworkLabels.length > 1 ? ` (${model.selectedNetworkLabels.join(", ")})` : ""}
      </p>

      {scope === "custom" && model.networkOptions.length > 0 ? (
        <div className="chip-group list-panel-filters multi-network-functional-analysis-section" aria-label={t("ui.multinetworkfunctionalanalysispanelCustomFunctionalAnalysisNetworks")}>
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
          {t("ui.multinetworkfunctionalanalysispanelUnionGraph")}{model.schematic.nodeCount} {t("ui.multinetworkfunctionalanalysispanelNodes")}{model.schematic.edgeCount} {t("ui.multinetworkfunctionalanalysispanelEdges")}{model.schematic.warnings.length > 0 ? ` ${model.schematic.warnings.join(" ")}` : ""}
        </p>
      ) : null}

      {model.findings.length === 0 ? (
        <p className="empty-copy">{t("ui.multinetworkfunctionalanalysispanelNoFunctionalAnalysisFindingsForThisScope")}</p>
      ) : (
        <>
          <div className="table-scroll-container">
            <table className="data-table multi-network-functional-analysis-table">
              <thead>
                <tr>
                  <th>{t("ui.severity")}</th>
                  <th>{t("ui.multinetworkfunctionalanalysispanelFamily")}</th>
                  <th>{t("ui.multinetworkfunctionalanalysispanelScope")}</th>
                  <th>{t("ui.multinetworkfunctionalanalysispanelFinding")}</th>
                  <th>{t("ui.multinetworkfunctionalanalysispanelAction")}</th>
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
            
            {t("ui.goTo")}
          </button>
        )}
      </td>
    </tr>
  );
}

function severityLabel(severity: MultiNetworkFunctionalAnalysisFinding["severity"]): string {
  return severity === "error" ? t("ui.error") : severity === "warning" ? "Warning" : t("ui.info");
}

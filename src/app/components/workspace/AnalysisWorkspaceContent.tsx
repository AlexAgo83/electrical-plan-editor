import type { ReactElement } from "react";
import { AnalysisConnectorWorkspacePanels } from "./AnalysisConnectorWorkspacePanels";
import { AnalysisSpliceWorkspacePanels } from "./AnalysisSpliceWorkspacePanels";
import { AnalysisWireWorkspacePanels } from "./AnalysisWireWorkspacePanels";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";

export type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";

export function AnalysisWorkspaceContent(props: AnalysisWorkspaceContentProps): ReactElement {
  const { networkSummaryPanel } = props;

  return (
    <section className="panel-grid analysis-panel-grid">
      <AnalysisConnectorWorkspacePanels {...props} />
      <AnalysisSpliceWorkspacePanels {...props} />
      <AnalysisWireWorkspacePanels {...props} />
      <section className="analysis-network-summary-row">{networkSummaryPanel}</section>
    </section>
  );
}

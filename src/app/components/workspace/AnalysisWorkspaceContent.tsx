import type { ReactElement } from "react";
import { AnalysisConnectorWorkspacePanels } from "./AnalysisConnectorWorkspacePanels";
import { AnalysisNodeSegmentWorkspacePanels } from "./AnalysisNodeSegmentWorkspacePanels";
import { AnalysisSpliceWorkspacePanels } from "./AnalysisSpliceWorkspacePanels";
import { AnalysisWireWorkspacePanels } from "./AnalysisWireWorkspacePanels";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";
import { MultiNetworkFunctionalAnalysisPanel } from "./MultiNetworkFunctionalAnalysisPanel";

export type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";

export function AnalysisWorkspaceContent(props: AnalysisWorkspaceContentProps): ReactElement {
  return (
    <section className="panel-grid analysis-panel-grid">
      <MultiNetworkFunctionalAnalysisPanel
        model={props.multiNetworkFunctionalAnalysis}
        scope={props.multiNetworkFunctionalAnalysisScope}
        setScope={props.setMultiNetworkFunctionalAnalysisScope}
        onGoToFinding={props.onGoToMultiNetworkFunctionalAnalysisFinding}
      />
      <AnalysisConnectorWorkspacePanels {...props} />
      <AnalysisSpliceWorkspacePanels {...props} />
      <AnalysisNodeSegmentWorkspacePanels {...props} />
      <AnalysisWireWorkspacePanels {...props} />
    </section>
  );
}

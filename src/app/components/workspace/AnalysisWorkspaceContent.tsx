import type { ReactElement } from "react";
import { AnalysisConnectorWorkspacePanels } from "./AnalysisConnectorWorkspacePanels";
import { AnalysisNodeSegmentWorkspacePanels } from "./AnalysisNodeSegmentWorkspacePanels";
import { AnalysisSpliceWorkspacePanels } from "./AnalysisSpliceWorkspacePanels";
import { AnalysisWireWorkspacePanels } from "./AnalysisWireWorkspacePanels";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";
import { MultiNetworkFunctionalAnalysisDialog } from "./MultiNetworkFunctionalAnalysisDialog";

export type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";

export function AnalysisWorkspaceContent(props: AnalysisWorkspaceContentProps): ReactElement {
  return (
    <section className="panel-grid analysis-panel-grid">
      {props.showMultiNetworkFunctionalAnalysisPanel !== false ? (
        <MultiNetworkFunctionalAnalysisDialog
          isOpen={props.isMultiNetworkFunctionalAnalysisOpen}
          model={props.multiNetworkFunctionalAnalysis}
          scope={props.multiNetworkFunctionalAnalysisScope}
          setScope={props.setMultiNetworkFunctionalAnalysisScope}
          onToggleCustomNetwork={props.onToggleMultiNetworkFunctionalAnalysisCustomNetwork}
          onGoToFinding={props.onGoToMultiNetworkFunctionalAnalysisFinding}
          onClose={props.onCloseMultiNetworkFunctionalAnalysis}
        />
      ) : null}
      <AnalysisConnectorWorkspacePanels {...props} />
      <AnalysisSpliceWorkspacePanels {...props} />
      <AnalysisNodeSegmentWorkspacePanels {...props} />
      <AnalysisWireWorkspacePanels {...props} />
    </section>
  );
}

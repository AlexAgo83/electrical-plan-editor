import type { ReactElement, ReactNode } from "react";
import type { ScreenContainerComponent } from "./screenContainer.shared";

interface ModelingWorkspaceContainerProps {
  ScreenComponent: ScreenContainerComponent;
  isActive: boolean;
  leftColumnContent: ReactNode;
  formsColumnContent: ReactNode;
  networkSummaryPanel: ReactNode;
  analysisWorkspaceContent?: ReactNode;
  isAnalysisFocused?: boolean;
}

export function ModelingWorkspaceContainer({
  ScreenComponent,
  isActive,
  leftColumnContent,
  formsColumnContent,
  networkSummaryPanel,
  analysisWorkspaceContent = null,
  isAnalysisFocused = false
}: ModelingWorkspaceContainerProps): ReactElement {
  return (
    <ScreenComponent isActive={isActive}>
      <section className="workspace-stage">
        <section className="panel-grid workspace-column workspace-column-center">{networkSummaryPanel}</section>
        <section className="panel-grid workspace-column workspace-column-left">
          {isAnalysisFocused && analysisWorkspaceContent !== null ? analysisWorkspaceContent : leftColumnContent}
        </section>
        {!isAnalysisFocused ? formsColumnContent : null}
      </section>
    </ScreenComponent>
  );
}

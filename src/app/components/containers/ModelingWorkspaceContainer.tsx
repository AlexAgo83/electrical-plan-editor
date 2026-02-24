import type { ReactElement, ReactNode } from "react";
import type { ScreenContainerComponent } from "./screenContainer.shared";

interface ModelingWorkspaceContainerProps {
  ScreenComponent: ScreenContainerComponent;
  isActive: boolean;
  leftColumnContent: ReactNode;
  formsColumnContent: ReactNode;
  networkSummaryPanel: ReactNode;
  analysisWorkspaceContent?: ReactNode;
}

export function ModelingWorkspaceContainer({
  ScreenComponent,
  isActive,
  leftColumnContent,
  formsColumnContent,
  networkSummaryPanel,
  analysisWorkspaceContent = null
}: ModelingWorkspaceContainerProps): ReactElement {
  const hasAnalysisWorkspaceContent = analysisWorkspaceContent !== null;

  return (
    <ScreenComponent isActive={isActive}>
      <section className="workspace-stage">
        <section className="panel-grid workspace-column workspace-column-center">{networkSummaryPanel}</section>
        <section className="panel-grid workspace-column workspace-column-left">
          {leftColumnContent}
        </section>
        {hasAnalysisWorkspaceContent ? (
          <section className="panel-grid workspace-column workspace-column-left">
            {analysisWorkspaceContent}
          </section>
        ) : null}
        {formsColumnContent}
      </section>
    </ScreenComponent>
  );
}

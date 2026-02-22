import type { ReactElement, ReactNode } from "react";
import type { ScreenContainerComponent } from "./screenContainer.shared";

interface ModelingWorkspaceContainerProps {
  ScreenComponent: ScreenContainerComponent;
  isActive: boolean;
  leftColumnContent: ReactNode;
  formsColumnContent: ReactNode;
  networkSummaryPanel: ReactNode;
}

export function ModelingWorkspaceContainer({
  ScreenComponent,
  isActive,
  leftColumnContent,
  formsColumnContent,
  networkSummaryPanel
}: ModelingWorkspaceContainerProps): ReactElement {
  return (
    <ScreenComponent isActive={isActive}>
      <section className="workspace-stage">
        <section className="panel-grid workspace-column workspace-column-left">{leftColumnContent}</section>
        {formsColumnContent}
        <section className="panel-grid workspace-column workspace-column-center">{networkSummaryPanel}</section>
      </section>
    </ScreenComponent>
  );
}


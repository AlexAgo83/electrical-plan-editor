import type { ReactElement, ReactNode } from "react";
import type { ScreenContainerComponent } from "./screenContainer.shared";

interface AnalysisWorkspaceContainerProps {
  ScreenComponent: ScreenContainerComponent;
  isActive: boolean;
  workspaceContent: ReactNode;
}

export function AnalysisWorkspaceContainer({
  ScreenComponent,
  isActive,
  workspaceContent
}: AnalysisWorkspaceContainerProps): ReactElement {
  return <ScreenComponent isActive={isActive}>{workspaceContent}</ScreenComponent>;
}


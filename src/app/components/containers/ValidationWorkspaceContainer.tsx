import type { ReactElement, ReactNode } from "react";
import type { ScreenContainerComponent } from "./screenContainer.shared";

interface ValidationWorkspaceContainerProps {
  ScreenComponent: ScreenContainerComponent;
  isActive: boolean;
  workspaceContent: ReactNode;
}

export function ValidationWorkspaceContainer({
  ScreenComponent,
  isActive,
  workspaceContent
}: ValidationWorkspaceContainerProps): ReactElement {
  return <ScreenComponent isActive={isActive}>{workspaceContent}</ScreenComponent>;
}


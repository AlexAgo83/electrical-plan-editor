import type { ReactElement, ReactNode } from "react";
import type { ScreenContainerComponent } from "./screenContainer.shared";

interface NetworkScopeWorkspaceContainerProps {
  ScreenComponent: ScreenContainerComponent;
  isActive: boolean;
  workspaceContent: ReactNode;
}

export function NetworkScopeWorkspaceContainer({
  ScreenComponent,
  isActive,
  workspaceContent
}: NetworkScopeWorkspaceContainerProps): ReactElement {
  return <ScreenComponent isActive={isActive}>{workspaceContent}</ScreenComponent>;
}


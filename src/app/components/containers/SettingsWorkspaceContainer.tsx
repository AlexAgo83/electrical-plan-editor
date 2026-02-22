import type { ReactElement, ReactNode } from "react";
import type { ScreenContainerComponent } from "./screenContainer.shared";

interface SettingsWorkspaceContainerProps {
  ScreenComponent: ScreenContainerComponent;
  isActive: boolean;
  workspaceContent: ReactNode;
}

export function SettingsWorkspaceContainer({
  ScreenComponent,
  isActive,
  workspaceContent
}: SettingsWorkspaceContainerProps): ReactElement {
  return <ScreenComponent isActive={isActive}>{workspaceContent}</ScreenComponent>;
}


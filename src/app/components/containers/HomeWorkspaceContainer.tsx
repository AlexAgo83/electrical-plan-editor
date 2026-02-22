import type { ReactElement, ReactNode } from "react";
import type { ScreenContainerComponent } from "./screenContainer.shared";

interface HomeWorkspaceContainerProps {
  ScreenComponent: ScreenContainerComponent;
  isActive: boolean;
  workspaceContent: ReactNode;
}

export function HomeWorkspaceContainer({
  ScreenComponent,
  isActive,
  workspaceContent
}: HomeWorkspaceContainerProps): ReactElement {
  return <ScreenComponent isActive={isActive}>{workspaceContent}</ScreenComponent>;
}

import type { ComponentType, ReactNode } from "react";

export interface ScreenContainerComponentProps {
  isActive: boolean;
  children: ReactNode;
}

export type ScreenContainerComponent = ComponentType<ScreenContainerComponentProps>;

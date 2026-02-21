import type { ReactElement, ReactNode } from "react";

interface ModelingScreenProps {
  isActive: boolean;
  children: ReactNode;
}

export function ModelingScreen({ isActive, children }: ModelingScreenProps): ReactElement | null {
  if (!isActive) {
    return null;
  }

  return <>{children}</>;
}

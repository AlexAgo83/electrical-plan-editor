import type { ReactElement, ReactNode } from "react";

interface ValidationScreenProps {
  isActive: boolean;
  children: ReactNode;
}

export function ValidationScreen({ isActive, children }: ValidationScreenProps): ReactElement | null {
  if (!isActive) {
    return null;
  }

  return <>{children}</>;
}

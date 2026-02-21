import type { ReactElement, ReactNode } from "react";

interface AnalysisScreenProps {
  isActive: boolean;
  children: ReactNode;
}

export function AnalysisScreen({ isActive, children }: AnalysisScreenProps): ReactElement | null {
  if (!isActive) {
    return null;
  }

  return <>{children}</>;
}

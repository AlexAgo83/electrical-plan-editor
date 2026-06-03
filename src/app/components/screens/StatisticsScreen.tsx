import type { ReactElement, ReactNode } from "react";

interface StatisticsScreenProps {
  isActive: boolean;
  children: ReactNode;
}

export function StatisticsScreen({ isActive, children }: StatisticsScreenProps): ReactElement | null {
  if (!isActive) {
    return null;
  }

  return <>{children}</>;
}

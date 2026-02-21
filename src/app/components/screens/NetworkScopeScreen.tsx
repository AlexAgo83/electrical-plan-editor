import type { ReactElement, ReactNode } from "react";

interface NetworkScopeScreenProps {
  isActive: boolean;
  children: ReactNode;
}

export function NetworkScopeScreen({ isActive, children }: NetworkScopeScreenProps): ReactElement | null {
  if (!isActive) {
    return null;
  }

  return <>{children}</>;
}

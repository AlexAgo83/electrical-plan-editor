import type { ReactElement, ReactNode } from "react";

interface SettingsScreenProps {
  isActive: boolean;
  children: ReactNode;
}

export function SettingsScreen({ isActive, children }: SettingsScreenProps): ReactElement | null {
  if (!isActive) {
    return null;
  }

  return <>{children}</>;
}

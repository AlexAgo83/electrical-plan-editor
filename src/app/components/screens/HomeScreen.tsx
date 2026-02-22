import type { ReactElement, ReactNode } from "react";

interface HomeScreenProps {
  isActive: boolean;
  children: ReactNode;
}

export function HomeScreen({ isActive, children }: HomeScreenProps): ReactElement | null {
  if (!isActive) {
    return null;
  }

  return <>{children}</>;
}

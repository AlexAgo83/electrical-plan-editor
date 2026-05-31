import { type ReactElement, type ReactNode } from "react";
import { SettingsSearchDockContext, type SettingsSearchDockContextValue } from "./SettingsSearchDock";

export function SettingsSearchDockProvider({
  value,
  children
}: {
  value: SettingsSearchDockContextValue;
  children: ReactNode;
}): ReactElement {
  return <SettingsSearchDockContext.Provider value={value}>{children}</SettingsSearchDockContext.Provider>;
}

import { createContext, useContext } from "react";

export interface SettingsSearchDockContextValue {
  settingsSearchQuery: string;
  setSettingsSearchQuery: (value: string) => void;
}

export const SettingsSearchDockContext = createContext<SettingsSearchDockContextValue>({
  settingsSearchQuery: "",
  setSettingsSearchQuery: () => undefined
});

export function useSettingsSearchDock(): SettingsSearchDockContextValue {
  return useContext(SettingsSearchDockContext);
}

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_AI_SETTINGS,
  resolveAiProviderReadiness,
  type AiProviderConfig,
  type AiProviderId,
  type AiSettings
} from "../lib/aiSettings";
import { readAiSettings, writeAiSettings } from "./aiSettingsStorage";

function mergeAiSettingsPatch(current: AiSettings, patch: Partial<AiSettings>): AiSettings {
  return {
    ...current,
    ...patch,
    providers: patch.providers ?? current.providers
  };
}

export function useAiSettings() {
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readAiSettings();
    if (stored !== null) {
      setSettings(stored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    writeAiSettings(settings);
  }, [hydrated, settings]);

  const readiness = useMemo(() => resolveAiProviderReadiness(settings), [settings]);

  const updateSettings = (patch: Partial<AiSettings>) => {
    setSettings((current) => mergeAiSettingsPatch(current, patch));
  };

  const updateProviderConfig = (provider: AiProviderId, patch: Partial<AiProviderConfig>) => {
    setSettings((current) => ({
      ...current,
      providers: {
        ...current.providers,
        [provider]: {
          ...current.providers[provider],
          ...patch
        }
      }
    }));
  };

  return {
    settings,
    readiness,
    hydrated,
    setProvider: (provider: AiProviderId) => updateSettings({ provider }),
    updateProviderConfig,
    setTimeoutMs: (timeoutMs: number) => updateSettings({ timeoutMs }),
    setStrictMode: (strictMode: boolean) => updateSettings({ strictMode }),
    setExperimentalDirectExecutionEnabled: (experimentalDirectExecutionEnabled: boolean) =>
      updateSettings({ experimentalDirectExecutionEnabled })
  };
}

export type AiSettingsModel = ReturnType<typeof useAiSettings>;

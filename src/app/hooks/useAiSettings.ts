import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_AI_SETTINGS,
  resolveAiProviderReadiness,
  type AiProviderConfig,
  type AiProviderId,
  type AiSettings
} from "../lib/aiSettings";
import { readAiSettings, writeAiSettings } from "./aiSettingsStorage";

type AiConnectionTestStatus = "idle" | "testing" | "success" | "error";

interface AiConnectionTestState {
  status: AiConnectionTestStatus;
  message: string;
}

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
  const [connectionTest, setConnectionTest] = useState<AiConnectionTestState>({
    status: "idle",
    message: "Connection has not been tested."
  });

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
    setConnectionTest({
      status: "idle",
      message: "Connection has not been tested."
    });
    setSettings((current) => mergeAiSettingsPatch(current, patch));
  };

  const updateProviderConfig = (provider: AiProviderId, patch: Partial<AiProviderConfig>) => {
    setConnectionTest({
      status: "idle",
      message: "Connection has not been tested."
    });
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

  const testConnection = async (): Promise<void> => {
    const currentReadiness = resolveAiProviderReadiness(settings);
    if (!currentReadiness.isReady) {
      setConnectionTest({
        status: "error",
        message: currentReadiness.message
      });
      return;
    }

    const providerConfig = settings.providers[settings.provider];
    const endpoint = providerConfig.endpoint.replace(/\/+$/, "");
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), settings.timeoutMs);
    setConnectionTest({
      status: "testing",
      message: `Testing ${settings.provider === "openai" ? "OpenAI" : "Gemini"} connection...`
    });

    try {
      const response =
        settings.provider === "openai"
          ? await fetch(`${endpoint}/models/${encodeURIComponent(providerConfig.model)}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${providerConfig.apiKey}`,
                "Content-Type": "application/json"
              },
              signal: controller.signal
            })
          : await fetch(`${endpoint}/models/${encodeURIComponent(providerConfig.model)}?key=${encodeURIComponent(providerConfig.apiKey)}`, {
              method: "GET",
              signal: controller.signal
            });

      if (!response.ok) {
        setConnectionTest({
          status: "error",
          message: `Connection failed with HTTP ${response.status}. Check the API key, model, and endpoint.`
        });
        return;
      }

      setConnectionTest({
        status: "success",
        message: `${settings.provider === "openai" ? "OpenAI" : "Gemini"} connection succeeded.`
      });
    } catch (error) {
      setConnectionTest({
        status: "error",
        message:
          error instanceof DOMException && error.name === "AbortError"
            ? "Connection test timed out."
            : "Connection test failed. Check browser network access, API key, model, and endpoint."
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  return {
    settings,
    readiness,
    hydrated,
    connectionTest,
    testConnection,
    setProvider: (provider: AiProviderId) => updateSettings({ provider }),
    updateProviderConfig,
    setTimeoutMs: (timeoutMs: number) => updateSettings({ timeoutMs }),
    setStrictMode: (strictMode: boolean) => updateSettings({ strictMode }),
    setExperimentalDirectExecutionEnabled: (experimentalDirectExecutionEnabled: boolean) =>
      updateSettings({ experimentalDirectExecutionEnabled })
  };
}

export type AiSettingsModel = ReturnType<typeof useAiSettings>;

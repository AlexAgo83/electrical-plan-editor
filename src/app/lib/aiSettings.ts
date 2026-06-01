export type AiProviderId = "openai" | "gemini";

export type AiProviderReadinessStatus = "missingApiKey" | "missingModel" | "ready";

export interface AiProviderConfig {
  apiKey: string;
  model: string;
  endpoint: string;
}

export interface AiSettings {
  provider: AiProviderId;
  providers: Record<AiProviderId, AiProviderConfig>;
  timeoutMs: number;
  strictMode: boolean;
  experimentalDirectExecutionEnabled: boolean;
}

export interface AiProviderReadiness {
  provider: AiProviderId;
  status: AiProviderReadinessStatus;
  isReady: boolean;
  message: string;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: "openai",
  providers: {
    openai: {
      apiKey: "",
      model: "gpt-5.5",
      endpoint: "https://api.openai.com/v1"
    },
    gemini: {
      apiKey: "",
      model: "gemini-2.0-flash",
      endpoint: "https://generativelanguage.googleapis.com/v1beta"
    }
  },
  timeoutMs: 30000,
  strictMode: true,
  experimentalDirectExecutionEnabled: false
};

export function getAiProviderLabel(provider: AiProviderId): string {
  return provider === "openai" ? "OpenAI" : "Gemini";
}

export function resolveAiProviderReadiness(settings: AiSettings): AiProviderReadiness {
  const config = settings.providers[settings.provider];
  const providerLabel = getAiProviderLabel(settings.provider);
  if (config.apiKey.trim().length === 0) {
    return {
      provider: settings.provider,
      status: "missingApiKey",
      isReady: false,
      message: `${providerLabel} API key is required.`
    };
  }
  if (config.model.trim().length === 0) {
    return {
      provider: settings.provider,
      status: "missingModel",
      isReady: false,
      message: `${providerLabel} model name is required.`
    };
  }
  return {
    provider: settings.provider,
    status: "ready",
    isReady: true,
    message: `${providerLabel} provider is ready.`
  };
}

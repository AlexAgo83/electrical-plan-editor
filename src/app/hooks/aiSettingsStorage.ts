import { DEFAULT_AI_SETTINGS, type AiProviderConfig, type AiProviderId, type AiSettings } from "../lib/aiSettings";

const AI_SETTINGS_SCHEMA_VERSION = 1;
const AI_SETTINGS_STORAGE_KEY = "electrical-plan-editor.ai-settings.v1";

interface AiSettingsPayload extends AiSettings {
  schemaVersion: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeProviderId(value: unknown): AiProviderId {
  return value === "gemini" ? "gemini" : "openai";
}

function normalizeString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeProviderConfig(value: unknown, fallback: AiProviderConfig): AiProviderConfig {
  if (!isRecord(value)) {
    return fallback;
  }
  return {
    apiKey: normalizeString(value.apiKey, fallback.apiKey),
    model: normalizeString(value.model, fallback.model),
    endpoint: normalizeString(value.endpoint, fallback.endpoint)
  };
}

function normalizeTimeoutMs(value: unknown): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(parsed)) {
    return DEFAULT_AI_SETTINGS.timeoutMs;
  }
  return Math.min(120000, Math.max(5000, Math.round(Number(parsed))));
}

function normalizeAiSettingsPayload(parsed: unknown): AiSettings | null {
  if (!isRecord(parsed)) {
    return null;
  }
  const rawSchemaVersion = parsed.schemaVersion;
  if (typeof rawSchemaVersion === "number" && rawSchemaVersion > AI_SETTINGS_SCHEMA_VERSION) {
    return null;
  }
  const rawProviders = isRecord(parsed.providers) ? parsed.providers : {};
  return {
    provider: normalizeProviderId(parsed.provider),
    providers: {
      openai: normalizeProviderConfig(rawProviders.openai, DEFAULT_AI_SETTINGS.providers.openai),
      gemini: normalizeProviderConfig(rawProviders.gemini, DEFAULT_AI_SETTINGS.providers.gemini)
    },
    timeoutMs: normalizeTimeoutMs(parsed.timeoutMs),
    strictMode: typeof parsed.strictMode === "boolean" ? parsed.strictMode : DEFAULT_AI_SETTINGS.strictMode,
    experimentalDirectExecutionEnabled:
      typeof parsed.experimentalDirectExecutionEnabled === "boolean"
        ? parsed.experimentalDirectExecutionEnabled
        : DEFAULT_AI_SETTINGS.experimentalDirectExecutionEnabled
  };
}

export function readAiSettings(): AiSettings | null {
  try {
    const raw = localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    return normalizeAiSettingsPayload(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeAiSettings(settings: AiSettings): void {
  try {
    const payload: AiSettingsPayload = {
      schemaVersion: AI_SETTINGS_SCHEMA_VERSION,
      ...settings
    };
    localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage write failures to preserve runtime behavior.
  }
}

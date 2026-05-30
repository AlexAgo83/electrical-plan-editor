import type { AiAgentOperationPermissions, AiAgentScope } from "./aiAgentOperationContract";

const AI_AGENT_PANEL_PREFERENCES_SCHEMA_VERSION = 1;
export const AI_AGENT_PANEL_PREFERENCES_STORAGE_KEY = "electrical-plan-editor.ai-agent-panel-preferences.v1";

export type AiAgentMode = "assisted" | "direct";

export interface AiAgentPanelPreferences {
  instruction: string;
  targetScope: AiAgentScope;
  agentMode: AiAgentMode;
  permissions: AiAgentOperationPermissions;
}

interface AiAgentPanelPreferencesPayload extends AiAgentPanelPreferences {
  schemaVersion: number;
}

export const DEFAULT_AI_AGENT_PANEL_PREFERENCES: AiAgentPanelPreferences = {
  instruction: "",
  targetScope: "activeNetwork",
  agentMode: "assisted",
  permissions: {
    add: true,
    move: true,
    update: true,
    route: true,
    delete: false
  }
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeTargetScope(value: unknown): AiAgentScope {
  return value === "currentSelection" || value === "selectedHarness" || value === "allNetworks"
    ? value
    : DEFAULT_AI_AGENT_PANEL_PREFERENCES.targetScope;
}

function normalizeAgentMode(value: unknown): AiAgentMode {
  return value === "direct" ? "direct" : DEFAULT_AI_AGENT_PANEL_PREFERENCES.agentMode;
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizePermissions(value: unknown): AiAgentOperationPermissions {
  const fallback = DEFAULT_AI_AGENT_PANEL_PREFERENCES.permissions;
  if (!isRecord(value)) {
    return fallback;
  }
  return {
    add: normalizeBoolean(value.add, fallback.add),
    move: normalizeBoolean(value.move, fallback.move),
    update: normalizeBoolean(value.update, fallback.update),
    route: normalizeBoolean(value.route, fallback.route),
    delete: normalizeBoolean(value.delete, fallback.delete)
  };
}

function normalizeAiAgentPanelPreferencesPayload(parsed: unknown): AiAgentPanelPreferences | null {
  if (!isRecord(parsed)) {
    return null;
  }
  const rawSchemaVersion = parsed.schemaVersion;
  if (typeof rawSchemaVersion === "number" && rawSchemaVersion > AI_AGENT_PANEL_PREFERENCES_SCHEMA_VERSION) {
    return null;
  }
  return {
    instruction: normalizeString(parsed.instruction, DEFAULT_AI_AGENT_PANEL_PREFERENCES.instruction),
    targetScope: normalizeTargetScope(parsed.targetScope),
    agentMode: normalizeAgentMode(parsed.agentMode),
    permissions: normalizePermissions(parsed.permissions)
  };
}

export function readAiAgentPanelPreferences(): AiAgentPanelPreferences {
  try {
    const raw = localStorage.getItem(AI_AGENT_PANEL_PREFERENCES_STORAGE_KEY);
    if (raw === null) {
      return DEFAULT_AI_AGENT_PANEL_PREFERENCES;
    }
    return normalizeAiAgentPanelPreferencesPayload(JSON.parse(raw)) ?? DEFAULT_AI_AGENT_PANEL_PREFERENCES;
  } catch {
    return DEFAULT_AI_AGENT_PANEL_PREFERENCES;
  }
}

export function writeAiAgentPanelPreferences(preferences: AiAgentPanelPreferences): void {
  try {
    const payload: AiAgentPanelPreferencesPayload = {
      schemaVersion: AI_AGENT_PANEL_PREFERENCES_SCHEMA_VERSION,
      ...preferences
    };
    localStorage.setItem(AI_AGENT_PANEL_PREFERENCES_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage write failures to preserve runtime behavior.
  }
}

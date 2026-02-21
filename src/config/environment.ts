export interface RuntimeEnvironmentInput {
  APP_HOST?: string;
  APP_PORT?: string;
  PREVIEW_PORT?: string;
  E2E_BASE_URL?: string;
  VITE_STORAGE_KEY?: string;
}

export interface RuntimeEnvironment {
  appHost: string;
  appPort: number;
  previewPort: number;
  e2eBaseUrl: string;
  storageKey: string;
  warnings: string[];
}

export const DEFAULT_APP_HOST = "127.0.0.1";
export const DEFAULT_APP_PORT = 5284;
export const DEFAULT_PREVIEW_PORT = 5285;
export const DEFAULT_STORAGE_KEY = "electrical-plan-editor.state";

function parsePort(
  value: string | undefined,
  fallback: number,
  variableName: "APP_PORT" | "PREVIEW_PORT",
  warnings: string[]
): number {
  if (value === undefined) {
    return fallback;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    warnings.push(`${variableName} is empty. Falling back to ${fallback}.`);
    return fallback;
  }

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    warnings.push(`${variableName}="${trimmed}" is invalid. Falling back to ${fallback}.`);
    return fallback;
  }

  return parsed;
}

function parseHost(value: string | undefined): string {
  if (value === undefined) {
    return DEFAULT_APP_HOST;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? DEFAULT_APP_HOST : trimmed;
}

function parseE2EBaseUrl(value: string | undefined, fallback: string, warnings: string[]): string {
  if (value === undefined) {
    return fallback;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return fallback;
  }

  try {
    // Normalizes format and rejects malformed URLs deterministically.
    return new URL(trimmed).toString().replace(/\/$/, "");
  } catch {
    warnings.push(`E2E_BASE_URL="${trimmed}" is invalid. Falling back to ${fallback}.`);
    return fallback;
  }
}

export function resolveStorageKey(value: string | undefined): string {
  if (value === undefined) {
    return DEFAULT_STORAGE_KEY;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? DEFAULT_STORAGE_KEY : trimmed;
}

export function resolveRuntimeEnvironment(input: RuntimeEnvironmentInput): RuntimeEnvironment {
  const warnings: string[] = [];
  const appHost = parseHost(input.APP_HOST);
  const appPort = parsePort(input.APP_PORT, DEFAULT_APP_PORT, "APP_PORT", warnings);
  const previewPort = parsePort(input.PREVIEW_PORT, DEFAULT_PREVIEW_PORT, "PREVIEW_PORT", warnings);
  const defaultE2EBaseUrl = `http://${appHost}:${appPort}`;
  const e2eBaseUrl = parseE2EBaseUrl(input.E2E_BASE_URL, defaultE2EBaseUrl, warnings);
  const storageKey = resolveStorageKey(input.VITE_STORAGE_KEY);

  return {
    appHost,
    appPort,
    previewPort,
    e2eBaseUrl,
    storageKey,
    warnings
  };
}

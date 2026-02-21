export interface RuntimeEnvironmentInput {
  APP_HOST?: string;
  APP_PORT?: string;
  PREVIEW_PORT?: string;
  E2E_BASE_URL?: string;
}

export interface RuntimeEnvironment {
  appHost: string;
  appPort: number;
  previewPort: number;
  e2eBaseUrl: string;
}

const DEFAULT_APP_HOST = "127.0.0.1";
const DEFAULT_APP_PORT = 5284;
const DEFAULT_PREVIEW_PORT = 5285;

function parsePort(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return fallback;
  }

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
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

function parseE2EBaseUrl(value: string | undefined, fallback: string): string {
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
    return fallback;
  }
}

export function resolveRuntimeEnvironment(input: RuntimeEnvironmentInput): RuntimeEnvironment {
  const appHost = parseHost(input.APP_HOST);
  const appPort = parsePort(input.APP_PORT, DEFAULT_APP_PORT);
  const previewPort = parsePort(input.PREVIEW_PORT, DEFAULT_PREVIEW_PORT);
  const defaultE2EBaseUrl = `http://${appHost}:${appPort}`;
  const e2eBaseUrl = parseE2EBaseUrl(input.E2E_BASE_URL, defaultE2EBaseUrl);

  return {
    appHost,
    appPort,
    previewPort,
    e2eBaseUrl
  };
}

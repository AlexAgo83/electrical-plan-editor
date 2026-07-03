import { APP_RELEASE_VERSION, APP_SCHEMA_VERSION } from "../../core/schema";
import type { AppState } from "../../store";
import {
  PERSISTED_STATE_PAYLOAD_KIND,
  PERSISTED_STATE_SCHEMA_VERSION,
  migratePersistedPayloadDetailed
} from "../../adapters/persistence/migrations";
import { parseJsonSafe } from "../../adapters/persistence/json";
import { toFilesystemSafeTimestamp } from "./exportFileName";

export const WORKSPACE_FILE_PAYLOAD_KIND = "electrical-plan-editor.workspace-file";
export const WORKSPACE_FILE_SCHEMA_VERSION = 1;

export interface WorkspaceFilePayloadV1 {
  payloadKind: typeof WORKSPACE_FILE_PAYLOAD_KIND;
  schemaVersion: typeof WORKSPACE_FILE_SCHEMA_VERSION;
  appVersion: string;
  appSchemaVersion: number;
  workspaceId: string;
  revisionId: string;
  createdAtIso: string;
  updatedAtIso: string;
  state: AppState;
}

export interface WorkspaceFileParseResult {
  payload: WorkspaceFilePayloadV1 | null;
  state: AppState | null;
  error: string | null;
}

function createPortableId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function createStablePortableId(prefix: string, source: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return `${prefix}_${(hash >>> 0).toString(36)}`;
}

function isValidIsoDate(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function readStringField(source: Record<string, unknown>, key: string, fallback: string): string {
  const value = source[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function buildPersistenceSnapshotFromWorkspacePayload(payload: WorkspaceFilePayloadV1): Record<string, unknown> {
  return {
    payloadKind: PERSISTED_STATE_PAYLOAD_KIND,
    schemaVersion: PERSISTED_STATE_SCHEMA_VERSION,
    appVersion: payload.appVersion,
    appSchemaVersion: payload.appSchemaVersion,
    createdAtIso: payload.createdAtIso,
    updatedAtIso: payload.updatedAtIso,
    state: payload.state
  };
}

export function buildWorkspaceFilePayload(
  state: AppState,
  previousPayload?: WorkspaceFilePayloadV1 | null,
  nowIso: string = new Date().toISOString()
): WorkspaceFilePayloadV1 {
  return {
    payloadKind: WORKSPACE_FILE_PAYLOAD_KIND,
    schemaVersion: WORKSPACE_FILE_SCHEMA_VERSION,
    appVersion: APP_RELEASE_VERSION,
    appSchemaVersion: APP_SCHEMA_VERSION,
    workspaceId: previousPayload?.workspaceId ?? createPortableId("workspace"),
    revisionId: createPortableId("rev"),
    createdAtIso: previousPayload?.createdAtIso ?? nowIso,
    updatedAtIso: nowIso,
    state
  };
}

export function serializeWorkspaceFilePayload(payload: WorkspaceFilePayloadV1): string {
  return JSON.stringify(payload, null, 2);
}

export function parseWorkspaceFilePayload(rawJson: string, nowIso: string = new Date().toISOString()): WorkspaceFileParseResult {
  const parsedResult = parseJsonSafe<unknown>(rawJson);
  if (!parsedResult.ok) {
    return {
      payload: null,
      state: null,
      error: "Workspace file is not valid JSON."
    };
  }

  const parsed = parsedResult.value;
  if (typeof parsed !== "object" || parsed === null) {
    return {
      payload: null,
      state: null,
      error: "Workspace file must contain a JSON object."
    };
  }

  const candidate = parsed as Record<string, unknown>;
  if (candidate.payloadKind === WORKSPACE_FILE_PAYLOAD_KIND) {
    if (candidate.schemaVersion !== WORKSPACE_FILE_SCHEMA_VERSION || typeof candidate.state !== "object" || candidate.state === null) {
      return {
        payload: null,
        state: null,
        error: "Unsupported or malformed workspace file."
      };
    }

    const rawPayload = candidate as unknown as WorkspaceFilePayloadV1;
    const fallbackCreatedAtIso = isValidIsoDate(rawPayload.createdAtIso) ? rawPayload.createdAtIso : nowIso;
    const fallbackUpdatedAtIso = isValidIsoDate(rawPayload.updatedAtIso) ? rawPayload.updatedAtIso : nowIso;
    const normalizedPayload: WorkspaceFilePayloadV1 = {
      payloadKind: WORKSPACE_FILE_PAYLOAD_KIND,
      schemaVersion: WORKSPACE_FILE_SCHEMA_VERSION,
      appVersion: readStringField(candidate, "appVersion", APP_RELEASE_VERSION),
      appSchemaVersion: typeof candidate.appSchemaVersion === "number" ? candidate.appSchemaVersion : APP_SCHEMA_VERSION,
      workspaceId: readStringField(candidate, "workspaceId", createPortableId("workspace")),
      revisionId: readStringField(candidate, "revisionId", createPortableId("rev")),
      createdAtIso: fallbackCreatedAtIso,
      updatedAtIso: fallbackUpdatedAtIso,
      state: rawPayload.state
    };
    const migration = migratePersistedPayloadDetailed(buildPersistenceSnapshotFromWorkspacePayload(normalizedPayload), nowIso);
    if (!migration.ok) {
      return {
        payload: null,
        state: null,
        error: migration.error.message
      };
    }

    return {
      payload: {
        ...normalizedPayload,
        appSchemaVersion: migration.snapshot.appSchemaVersion,
        state: migration.snapshot.state
      },
      state: migration.snapshot.state,
      error: null
    };
  }

  if (candidate.payloadKind === PERSISTED_STATE_PAYLOAD_KIND) {
    const migration = migratePersistedPayloadDetailed(parsed, nowIso);
    if (!migration.ok) {
      return {
        payload: null,
        state: null,
        error: migration.error.message
      };
    }

    const payload = buildWorkspaceFilePayload(migration.snapshot.state, null, nowIso);
    return {
      payload: {
        ...payload,
        workspaceId: createStablePortableId("workspace", rawJson),
        revisionId: createStablePortableId("rev", rawJson),
        createdAtIso: migration.snapshot.createdAtIso,
        updatedAtIso: migration.snapshot.updatedAtIso
      },
      state: migration.snapshot.state,
      error: null
    };
  }

  return {
    payload: null,
    state: null,
    error: "File is not an Electrical Plan Editor workspace file."
  };
}

export function buildWorkspaceFileName(
  exportedAtIso: string = new Date().toISOString()
): string {
  return `electrical-workspace-${toFilesystemSafeTimestamp(exportedAtIso)}.epe.json`;
}

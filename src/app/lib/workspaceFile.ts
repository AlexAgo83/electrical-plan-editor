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
/**
 * Schema 2 adds optional named-lineage metadata (`lineage`), working-copy ancestry (`working`)
 * and immutable milestone metadata (`version`). Schema 1 files remain readable.
 */
export const WORKSPACE_FILE_SCHEMA_VERSION = 2;
export const SUPPORTED_WORKSPACE_FILE_SCHEMA_VERSIONS: readonly number[] = [1, 2];
/** Number of previous technical revisions kept in a working file to prove fast-forward ancestry. */
export const WORKING_ANCESTOR_REVISION_LIMIT = 64;

export interface WorkspaceLineageIdentity {
  displayName: string;
  slug: string;
}

export interface WorkspaceWorkingMeta {
  baseVersionId: string | null;
  restoredFromVersionId: string | null;
  ancestorRevisionIds: string[];
}

export type WorkspaceVersionProvenance =
  | { kind: "created" }
  | {
      kind: "legacy-import";
      originalFileName: string;
      originalDigest: string;
      sourceWorkspaceId: string | null;
      sourceRevisionId: string | null;
      orderingSource: "embedded-date" | "filename-timestamp" | "manual";
      orderingDateIso: string | null;
    };

export interface WorkspaceVersionMeta {
  versionId: string;
  displayNumber: number;
  parentVersionId: string | null;
  restoredFromVersionId: string | null;
  title: string;
  comment: string;
  createdAtIso: string;
  deviceLabel: string | null;
  operationId: string | null;
  provenance: WorkspaceVersionProvenance;
}

export interface WorkspaceFilePayload {
  payloadKind: typeof WORKSPACE_FILE_PAYLOAD_KIND;
  schemaVersion: number;
  appVersion: string;
  appSchemaVersion: number;
  workspaceId: string;
  revisionId: string;
  createdAtIso: string;
  updatedAtIso: string;
  lineage?: WorkspaceLineageIdentity;
  working?: WorkspaceWorkingMeta;
  version?: WorkspaceVersionMeta;
  state: AppState;
}

/** @deprecated Kept for call sites written against schema 1; schema 2 is a superset. */
export type WorkspaceFilePayloadV1 = WorkspaceFilePayload;

export type WorkspaceFileParseErrorKind = "invalid-json" | "not-workspace" | "future-schema" | "malformed" | "migration-failed";

export interface WorkspaceFileParseResult {
  payload: WorkspaceFilePayload | null;
  state: AppState | null;
  error: string | null;
  errorKind?: WorkspaceFileParseErrorKind;
}

export function createPortableId(prefix: string): string {
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

function readLineageIdentity(value: unknown): WorkspaceLineageIdentity | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.displayName !== "string" || typeof record.slug !== "string" || record.slug.length === 0) {
    return undefined;
  }
  return { displayName: record.displayName, slug: record.slug };
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readWorkingMeta(value: unknown): WorkspaceWorkingMeta | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const ancestors = Array.isArray(record.ancestorRevisionIds)
    ? record.ancestorRevisionIds.filter((entry): entry is string => typeof entry === "string")
    : [];
  return {
    baseVersionId: readNullableString(record.baseVersionId),
    restoredFromVersionId: readNullableString(record.restoredFromVersionId),
    ancestorRevisionIds: ancestors.slice(0, WORKING_ANCESTOR_REVISION_LIMIT)
  };
}

function readProvenance(value: unknown): WorkspaceVersionProvenance {
  if (typeof value === "object" && value !== null && (value as Record<string, unknown>).kind === "legacy-import") {
    const record = value as Record<string, unknown>;
    const orderingSource = record.orderingSource;
    return {
      kind: "legacy-import",
      originalFileName: typeof record.originalFileName === "string" ? record.originalFileName : "",
      originalDigest: typeof record.originalDigest === "string" ? record.originalDigest : "",
      sourceWorkspaceId: readNullableString(record.sourceWorkspaceId),
      sourceRevisionId: readNullableString(record.sourceRevisionId),
      orderingSource:
        orderingSource === "embedded-date" || orderingSource === "filename-timestamp" ? orderingSource : "manual",
      orderingDateIso: readNullableString(record.orderingDateIso)
    };
  }
  return { kind: "created" };
}

/** Returns `null` when the value is absent and throws when a version block is present but unusable. */
function readVersionMeta(value: unknown): WorkspaceVersionMeta | null {
  if (value === undefined) {
    return null;
  }
  if (typeof value !== "object" || value === null) {
    throw new Error("malformed version metadata");
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.versionId !== "string" ||
    record.versionId.length === 0 ||
    typeof record.displayNumber !== "number" ||
    !Number.isInteger(record.displayNumber) ||
    record.displayNumber < 1 ||
    typeof record.createdAtIso !== "string" ||
    !isValidIsoDate(record.createdAtIso)
  ) {
    throw new Error("malformed version metadata");
  }
  return {
    versionId: record.versionId,
    displayNumber: record.displayNumber,
    parentVersionId: readNullableString(record.parentVersionId),
    restoredFromVersionId: readNullableString(record.restoredFromVersionId),
    title: typeof record.title === "string" ? record.title : "",
    comment: typeof record.comment === "string" ? record.comment : "",
    createdAtIso: record.createdAtIso,
    deviceLabel: readNullableString(record.deviceLabel),
    operationId: readNullableString(record.operationId),
    provenance: readProvenance(record.provenance)
  };
}

function buildPersistenceSnapshotFromWorkspacePayload(payload: WorkspaceFilePayload): Record<string, unknown> {
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

/**
 * Builds the next ordinary-save payload. A save always produces a new technical `revisionId`
 * but never allocates or consumes a business version number: any `version` block is dropped.
 */
export function buildWorkspaceFilePayload(
  state: AppState,
  previousPayload?: WorkspaceFilePayload | null,
  nowIso: string = new Date().toISOString()
): WorkspaceFilePayload {
  const payload: WorkspaceFilePayload = {
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
  if (previousPayload?.lineage !== undefined) {
    payload.lineage = { ...previousPayload.lineage };
  }
  if (previousPayload?.lineage !== undefined || previousPayload?.working !== undefined) {
    const previousWorking = previousPayload.working;
    payload.working = {
      baseVersionId: previousWorking?.baseVersionId ?? null,
      restoredFromVersionId: previousWorking?.restoredFromVersionId ?? null,
      ancestorRevisionIds: [previousPayload.revisionId, ...(previousWorking?.ancestorRevisionIds ?? [])].slice(
        0,
        WORKING_ANCESTOR_REVISION_LIMIT
      )
    };
  }
  return payload;
}

export function serializeWorkspaceFilePayload(payload: WorkspaceFilePayload): string {
  return JSON.stringify(payload, null, 2);
}

export function parseWorkspaceFilePayload(rawJson: string, nowIso: string = new Date().toISOString()): WorkspaceFileParseResult {
  const parsedResult = parseJsonSafe<unknown>(rawJson);
  if (!parsedResult.ok) {
    return {
      payload: null,
      state: null,
      error: "Workspace file is not valid JSON.",
      errorKind: "invalid-json"
    };
  }

  const parsed = parsedResult.value;
  if (typeof parsed !== "object" || parsed === null) {
    return {
      payload: null,
      state: null,
      error: "Workspace file must contain a JSON object.",
      errorKind: "not-workspace"
    };
  }

  const candidate = parsed as Record<string, unknown>;
  if (candidate.payloadKind === WORKSPACE_FILE_PAYLOAD_KIND) {
    if (
      typeof candidate.schemaVersion === "number" &&
      Number.isInteger(candidate.schemaVersion) &&
      candidate.schemaVersion > WORKSPACE_FILE_SCHEMA_VERSION
    ) {
      return {
        payload: null,
        state: null,
        error: `Workspace file schema ${candidate.schemaVersion} was written by a newer application version. Update the application before opening it.`,
        errorKind: "future-schema"
      };
    }
    if (
      typeof candidate.schemaVersion !== "number" ||
      !SUPPORTED_WORKSPACE_FILE_SCHEMA_VERSIONS.includes(candidate.schemaVersion) ||
      typeof candidate.state !== "object" ||
      candidate.state === null
    ) {
      return {
        payload: null,
        state: null,
        error: "Unsupported or malformed workspace file.",
        errorKind: "malformed"
      };
    }

    let versionMeta: WorkspaceVersionMeta | null;
    try {
      versionMeta = readVersionMeta(candidate.version);
    } catch {
      return {
        payload: null,
        state: null,
        error: "Workspace version metadata is malformed.",
        errorKind: "malformed"
      };
    }

    const rawPayload = candidate as unknown as WorkspaceFilePayload;
    const fallbackCreatedAtIso = isValidIsoDate(rawPayload.createdAtIso) ? rawPayload.createdAtIso : nowIso;
    const fallbackUpdatedAtIso = isValidIsoDate(rawPayload.updatedAtIso) ? rawPayload.updatedAtIso : nowIso;
    const normalizedPayload: WorkspaceFilePayload = {
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
    const lineage = readLineageIdentity(candidate.lineage);
    if (lineage !== undefined) {
      normalizedPayload.lineage = lineage;
    }
    const working = readWorkingMeta(candidate.working);
    if (working !== undefined) {
      normalizedPayload.working = working;
    }
    if (versionMeta !== null) {
      normalizedPayload.version = versionMeta;
    }
    const migration = migratePersistedPayloadDetailed(buildPersistenceSnapshotFromWorkspacePayload(normalizedPayload), nowIso);
    if (!migration.ok) {
      return {
        payload: null,
        state: null,
        error: migration.error.message,
        errorKind: "migration-failed"
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
        error: migration.error.message,
        errorKind: "migration-failed"
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
    error: "File is not an Electrical Plan Editor workspace file.",
    errorKind: "not-workspace"
  };
}

export function buildWorkspaceFileName(
  exportedAtIso: string = new Date().toISOString()
): string {
  return `electrical-workspace-${toFilesystemSafeTimestamp(exportedAtIso)}.epe.json`;
}

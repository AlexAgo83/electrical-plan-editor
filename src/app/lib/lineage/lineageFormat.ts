/**
 * Portable named-workspace lineage format (manifest, immutable versions, supplier handoffs).
 *
 * Folder layout of one lineage root (identical inside a ZIP package):
 *
 *   workspace-manifest.json
 *   <slug>-travail.epe.json                      working copy (ordinary saves)
 *   Versions/<slug>-vNNN[-<label>]-<short>.epe.json  immutable milestones
 *   Handoffs/<handoffId>/handoff.json            immutable supplier handoff record
 *   Handoffs/<handoffId>/files/<nn>-<name>       exact delivered bytes
 *   Recovery/...                                 explicit pre-restore / interrupted / divergent copies
 *
 * IDs are authoritative. Slugs and file names are presentation only; the slug is frozen at
 * creation so a later rename never moves files. See docs/workspace-lineages.md.
 */
import { getActiveLocale } from "../i18n";
import { createPortableId } from "../workspaceFile";

export const LINEAGE_MANIFEST_FILE_NAME = "workspace-manifest.json";
export const LINEAGE_MANIFEST_PAYLOAD_KIND = "electrical-plan-editor.workspace-manifest";
export const LINEAGE_MANIFEST_SCHEMA_VERSION = 1;
export const HANDOFF_RECORD_PAYLOAD_KIND = "electrical-plan-editor.supplier-handoff";
export const HANDOFF_RECORD_SCHEMA_VERSION = 1;
export const VERSIONS_DIRECTORY = "Versions";
export const HANDOFFS_DIRECTORY = "Handoffs";
export const RECOVERY_DIRECTORY = "Recovery";
export const WORKING_PREVIOUS_RECOVERY_PATH = `${RECOVERY_DIRECTORY}/working-previous.epe.json`;
export const WORKING_FILE_SUFFIX = "-travail.epe.json";
const SLUG_MAX_LENGTH = 40;
const LABEL_SLUG_MAX_LENGTH = 32;

export interface LineageVersionEntry {
  versionId: string;
  displayNumber: number;
  fileName: string;
  title: string;
  comment: string;
  createdAtIso: string;
  parentVersionId: string | null;
  restoredFromVersionId: string | null;
  revisionId: string;
  contentDigest: string;
  byteLength: number;
  deviceLabel: string | null;
  operationId: string | null;
  provenanceKind: "created" | "legacy-import";
  /** Chronological ordering hint for imported legacy snapshots (no fabricated parentage). */
  orderingDateIso: string | null;
  originalFileName: string | null;
}

export interface HandoffAttachment {
  attachmentId: string;
  originalFileName: string;
  storagePath: string;
  mimeHint: string;
  byteLength: number;
  sha256: string;
}

export interface HandoffRecord {
  payloadKind: typeof HANDOFF_RECORD_PAYLOAD_KIND;
  schemaVersion: typeof HANDOFF_RECORD_SCHEMA_VERSION;
  handoffId: string;
  workspaceId: string;
  versionId: string;
  recipient: string;
  /** Declared handoff date (YYYY-MM-DD), as stated by the user; never verified by the app. */
  handoffDate: string;
  note: string;
  createdAtIso: string;
  supersedesHandoffId: string | null;
  attachments: HandoffAttachment[];
}

export interface LineageHandoffEntry {
  handoffId: string;
  versionId: string;
  recipient: string;
  handoffDate: string;
  recordPath: string;
  recordDigest: string;
  attachmentCount: number;
  supersedesHandoffId: string | null;
  createdAtIso: string;
}

export interface LineageRecoveryEntry {
  recoveryId: string;
  kind: "pre-restore" | "interrupted-save" | "divergent-head" | "quarantine";
  fileName: string;
  createdAtIso: string;
  note: string;
}

export interface LineageDivergentHead {
  headId: string;
  revisionId: string;
  baseVersionId: string | null;
  fileName: string;
  updatedAtIso: string;
  sourceLabel: string;
}

export interface LineageManifest {
  payloadKind: typeof LINEAGE_MANIFEST_PAYLOAD_KIND;
  schemaVersion: number;
  workspaceId: string;
  displayName: string;
  slug: string;
  manifestRevisionId: string;
  createdAtIso: string;
  updatedAtIso: string;
  workingFileName: string;
  versions: LineageVersionEntry[];
  handoffs: LineageHandoffEntry[];
  recovery: LineageRecoveryEntry[];
  /** Alternative working heads awaiting an explicit continuation choice. */
  divergentHeads: LineageDivergentHead[];
}

export type LineageManifestParseResult =
  | { ok: true; manifest: LineageManifest }
  | { ok: false; errorKind: "invalid-json" | "not-manifest" | "future-schema" | "malformed"; error: string };

export function createWorkspaceLineageId(): string {
  return createPortableId("workspace");
}

export function createVersionId(): string {
  return createPortableId("ver");
}

export function createHandoffId(): string {
  return createPortableId("handoff");
}

export function createOperationId(): string {
  return createPortableId("op");
}

/** Short, filename-safe disambiguator derived from an immutable ID. */
export function shortId(id: string): string {
  const compact = id.replace(/^[a-z]+_/i, "").replace(/[^a-z0-9]/gi, "").toLowerCase();
  return compact.slice(0, 6).padEnd(6, "0");
}

function toAsciiSlug(value: string, maxLength: number): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

/**
 * Builds a stable, filesystem-safe slug. The slug is frozen at lineage creation:
 * renaming the display name later never changes it.
 */
export function createLineageSlug(displayName: string, existingSlugs: Iterable<string> = []): string {
  const base = toAsciiSlug(displayName, SLUG_MAX_LENGTH) || "workspace";
  const taken = new Set(existingSlugs);
  if (!taken.has(base)) {
    return base;
  }
  for (let suffix = 2; ; suffix += 1) {
    const candidate = `${base.slice(0, SLUG_MAX_LENGTH - String(suffix).length - 1)}-${suffix}`;
    if (!taken.has(candidate)) {
      return candidate;
    }
  }
}

export function isSafeSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= SLUG_MAX_LENGTH;
}

export function formatVersionNumber(displayNumber: number): string {
  return `v${String(displayNumber).padStart(3, "0")}`;
}

export function buildWorkingFileName(slug: string): string {
  return `${slug}${WORKING_FILE_SUFFIX}`;
}

export function buildVersionFileName(slug: string, displayNumber: number, title: string, versionId: string): string {
  const label = toAsciiSlug(title, LABEL_SLUG_MAX_LENGTH);
  const parts = [slug, formatVersionNumber(displayNumber), ...(label.length > 0 ? [label] : []), shortId(versionId)];
  return `${VERSIONS_DIRECTORY}/${parts.join("-")}.epe.json`;
}

/** Next number is max known committed number + 1 (never count + 1), so gaps and duplicates are safe. */
export function allocateNextDisplayNumber(knownNumbers: Iterable<number>): number {
  let highest = 0;
  for (const value of knownNumbers) {
    if (Number.isInteger(value) && value > highest) {
      highest = value;
    }
  }
  return highest + 1;
}

/**
 * Display labels for versions. A number shared by distinct immutable versions (offline
 * divergence) is disambiguated with a short ID and the device label when known.
 */
export function buildVersionDisplayLabels(versions: readonly LineageVersionEntry[]): Map<string, string> {
  const countsByNumber = new Map<number, number>();
  for (const version of versions) {
    countsByNumber.set(version.displayNumber, (countsByNumber.get(version.displayNumber) ?? 0) + 1);
  }
  const labels = new Map<string, string>();
  for (const version of versions) {
    const base = formatVersionNumber(version.displayNumber);
    if ((countsByNumber.get(version.displayNumber) ?? 0) > 1) {
      const device = version.deviceLabel === null ? "" : ` · ${version.deviceLabel}`;
      labels.set(version.versionId, `${base} · ${shortId(version.versionId)}${device}`);
    } else {
      labels.set(version.versionId, base);
    }
  }
  return labels;
}

export function sortVersionsForHistory(versions: readonly LineageVersionEntry[]): LineageVersionEntry[] {
  return [...versions].sort(
    (left, right) =>
      right.displayNumber - left.displayNumber ||
      right.createdAtIso.localeCompare(left.createdAtIso) ||
      left.versionId.localeCompare(right.versionId)
  );
}

export interface LineageAncestryIssue {
  versionId: string;
  kind: "unknown-parent" | "unknown-restore-source" | "cycle" | "duplicate-id";
}

/** Validates ancestry references without inventing parentage for imported legacy snapshots. */
export function validateLineageAncestry(versions: readonly LineageVersionEntry[]): LineageAncestryIssue[] {
  const issues: LineageAncestryIssue[] = [];
  const byId = new Map<string, LineageVersionEntry>();
  for (const version of versions) {
    if (byId.has(version.versionId)) {
      issues.push({ versionId: version.versionId, kind: "duplicate-id" });
      continue;
    }
    byId.set(version.versionId, version);
  }
  for (const version of byId.values()) {
    if (version.parentVersionId !== null && !byId.has(version.parentVersionId)) {
      issues.push({ versionId: version.versionId, kind: "unknown-parent" });
    }
    if (version.restoredFromVersionId !== null && !byId.has(version.restoredFromVersionId)) {
      issues.push({ versionId: version.versionId, kind: "unknown-restore-source" });
    }
    const seen = new Set<string>([version.versionId]);
    let cursor = version.parentVersionId === null ? undefined : byId.get(version.parentVersionId);
    while (cursor !== undefined) {
      if (seen.has(cursor.versionId)) {
        issues.push({ versionId: version.versionId, kind: "cycle" });
        break;
      }
      seen.add(cursor.versionId);
      cursor = cursor.parentVersionId === null ? undefined : byId.get(cursor.parentVersionId);
    }
  }
  return issues;
}

export function createLineageManifest(input: {
  workspaceId: string;
  displayName: string;
  slug: string;
  nowIso: string;
}): LineageManifest {
  return {
    payloadKind: LINEAGE_MANIFEST_PAYLOAD_KIND,
    schemaVersion: LINEAGE_MANIFEST_SCHEMA_VERSION,
    workspaceId: input.workspaceId,
    displayName: input.displayName,
    slug: input.slug,
    manifestRevisionId: createPortableId("mrev"),
    createdAtIso: input.nowIso,
    updatedAtIso: input.nowIso,
    workingFileName: buildWorkingFileName(input.slug),
    versions: [],
    handoffs: [],
    recovery: [],
    divergentHeads: []
  };
}

export function serializeLineageManifest(manifest: LineageManifest): string {
  return JSON.stringify(manifest, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableStr(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readVersionEntry(value: unknown): LineageVersionEntry | null {
  if (!isRecord(value)) {
    return null;
  }
  if (
    typeof value.versionId !== "string" ||
    typeof value.fileName !== "string" ||
    typeof value.contentDigest !== "string" ||
    typeof value.displayNumber !== "number" ||
    !Number.isInteger(value.displayNumber) ||
    value.displayNumber < 1
  ) {
    return null;
  }
  return {
    versionId: value.versionId,
    displayNumber: value.displayNumber,
    fileName: value.fileName,
    title: str(value.title),
    comment: str(value.comment),
    createdAtIso: str(value.createdAtIso),
    parentVersionId: nullableStr(value.parentVersionId),
    restoredFromVersionId: nullableStr(value.restoredFromVersionId),
    revisionId: str(value.revisionId),
    contentDigest: value.contentDigest,
    byteLength: typeof value.byteLength === "number" ? value.byteLength : 0,
    deviceLabel: nullableStr(value.deviceLabel),
    operationId: nullableStr(value.operationId),
    provenanceKind: value.provenanceKind === "legacy-import" ? "legacy-import" : "created",
    orderingDateIso: nullableStr(value.orderingDateIso),
    originalFileName: nullableStr(value.originalFileName)
  };
}

function readHandoffEntry(value: unknown): LineageHandoffEntry | null {
  if (!isRecord(value) || typeof value.handoffId !== "string" || typeof value.versionId !== "string" || typeof value.recordPath !== "string") {
    return null;
  }
  return {
    handoffId: value.handoffId,
    versionId: value.versionId,
    recipient: str(value.recipient),
    handoffDate: str(value.handoffDate),
    recordPath: value.recordPath,
    recordDigest: str(value.recordDigest),
    attachmentCount: typeof value.attachmentCount === "number" ? value.attachmentCount : 0,
    supersedesHandoffId: nullableStr(value.supersedesHandoffId),
    createdAtIso: str(value.createdAtIso)
  };
}

function readRecoveryEntry(value: unknown): LineageRecoveryEntry | null {
  if (!isRecord(value) || typeof value.recoveryId !== "string" || typeof value.fileName !== "string") {
    return null;
  }
  const kind = value.kind;
  return {
    recoveryId: value.recoveryId,
    kind: kind === "pre-restore" || kind === "divergent-head" || kind === "quarantine" ? kind : "interrupted-save",
    fileName: value.fileName,
    createdAtIso: str(value.createdAtIso),
    note: str(value.note)
  };
}

function readDivergentHead(value: unknown): LineageDivergentHead | null {
  if (!isRecord(value) || typeof value.headId !== "string" || typeof value.fileName !== "string" || typeof value.revisionId !== "string") {
    return null;
  }
  return {
    headId: value.headId,
    revisionId: value.revisionId,
    baseVersionId: nullableStr(value.baseVersionId),
    fileName: value.fileName,
    updatedAtIso: str(value.updatedAtIso),
    sourceLabel: str(value.sourceLabel)
  };
}

function readList<T>(value: unknown, reader: (entry: unknown) => T | null): T[] | null {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    return null;
  }
  const result: T[] = [];
  for (const entry of value) {
    const parsed = reader(entry);
    if (parsed === null) {
      return null;
    }
    result.push(parsed);
  }
  return result;
}

export function parseLineageManifest(rawJson: string): LineageManifestParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { ok: false, errorKind: "invalid-json", error: "Workspace manifest is not valid JSON." };
  }
  if (!isRecord(parsed) || parsed.payloadKind !== LINEAGE_MANIFEST_PAYLOAD_KIND) {
    return { ok: false, errorKind: "not-manifest", error: "File is not a workspace manifest." };
  }
  if (typeof parsed.schemaVersion === "number" && parsed.schemaVersion > LINEAGE_MANIFEST_SCHEMA_VERSION) {
    return {
      ok: false,
      errorKind: "future-schema",
      error: `Workspace manifest schema ${parsed.schemaVersion} was written by a newer application version.`
    };
  }
  if (
    parsed.schemaVersion !== LINEAGE_MANIFEST_SCHEMA_VERSION ||
    typeof parsed.workspaceId !== "string" ||
    parsed.workspaceId.length === 0 ||
    typeof parsed.slug !== "string" ||
    !isSafeSlug(parsed.slug)
  ) {
    return { ok: false, errorKind: "malformed", error: "Workspace manifest is malformed." };
  }
  const versions = readList(parsed.versions, readVersionEntry);
  const handoffs = readList(parsed.handoffs, readHandoffEntry);
  const recovery = readList(parsed.recovery, readRecoveryEntry);
  const divergentHeads = readList(parsed.divergentHeads, readDivergentHead);
  if (versions === null || handoffs === null || recovery === null || divergentHeads === null) {
    return { ok: false, errorKind: "malformed", error: "Workspace manifest index is malformed." };
  }
  return {
    ok: true,
    manifest: {
      payloadKind: LINEAGE_MANIFEST_PAYLOAD_KIND,
      schemaVersion: LINEAGE_MANIFEST_SCHEMA_VERSION,
      workspaceId: parsed.workspaceId,
      displayName: str(parsed.displayName, parsed.slug),
      slug: parsed.slug,
      manifestRevisionId: str(parsed.manifestRevisionId, "mrev_unknown"),
      createdAtIso: str(parsed.createdAtIso),
      updatedAtIso: str(parsed.updatedAtIso),
      workingFileName: str(parsed.workingFileName, buildWorkingFileName(parsed.slug)),
      versions,
      handoffs,
      recovery,
      divergentHeads
    }
  };
}

export function parseHandoffRecord(rawJson: string): HandoffRecord | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return null;
  }
  if (
    !isRecord(parsed) ||
    parsed.payloadKind !== HANDOFF_RECORD_PAYLOAD_KIND ||
    parsed.schemaVersion !== HANDOFF_RECORD_SCHEMA_VERSION ||
    typeof parsed.handoffId !== "string" ||
    typeof parsed.versionId !== "string" ||
    !Array.isArray(parsed.attachments)
  ) {
    return null;
  }
  const attachments: HandoffAttachment[] = [];
  for (const entry of parsed.attachments) {
    if (
      !isRecord(entry) ||
      typeof entry.attachmentId !== "string" ||
      typeof entry.storagePath !== "string" ||
      typeof entry.sha256 !== "string" ||
      typeof entry.byteLength !== "number"
    ) {
      return null;
    }
    attachments.push({
      attachmentId: entry.attachmentId,
      originalFileName: str(entry.originalFileName),
      storagePath: entry.storagePath,
      mimeHint: str(entry.mimeHint, "application/octet-stream"),
      byteLength: entry.byteLength,
      sha256: entry.sha256
    });
  }
  return {
    payloadKind: HANDOFF_RECORD_PAYLOAD_KIND,
    schemaVersion: HANDOFF_RECORD_SCHEMA_VERSION,
    handoffId: parsed.handoffId,
    workspaceId: str(parsed.workspaceId),
    versionId: parsed.versionId,
    recipient: str(parsed.recipient),
    handoffDate: str(parsed.handoffDate),
    note: str(parsed.note),
    createdAtIso: str(parsed.createdAtIso),
    supersedesHandoffId: nullableStr(parsed.supersedesHandoffId),
    attachments
  };
}

/** Safe file name for a stored attachment; the original name is kept separately in metadata. */
export function buildAttachmentStorageName(index: number, originalFileName: string): string {
  const baseName = originalFileName.split(/[\\/]/).pop() ?? "";
  return buildStorageNameFromBase(index, baseName);
}

function buildStorageNameFromBase(index: number, originalFileName: string): string {
  const lastDot = originalFileName.lastIndexOf(".");
  const stem = lastDot > 0 ? originalFileName.slice(0, lastDot) : originalFileName;
  const extension = lastDot > 0 ? toAsciiSlug(originalFileName.slice(lastDot + 1), 8) : "";
  const safeStem = toAsciiSlug(stem, 48) || "attachment";
  return `${String(index + 1).padStart(2, "0")}-${safeStem}${extension.length > 0 ? `.${extension}` : ""}`;
}

/** Medium date and short time in the viewer locale; "—" when unknown. */
export function formatLineageDateTime(iso: string | null): string {
  if (iso === null || iso.length === 0) {
    return "—";
  }
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString(getActiveLocale(), { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Previewable adoption of legacy timestamped workspace files into a named lineage.
 *
 * - Lineage is never inferred from legacy workspace IDs; the user assigns each batch explicitly.
 * - Dates are suggested from the embedded timestamp first, then the filename timestamp; the
 *   filesystem copy date is never used. Undated entries require manual placement; ties require review.
 * - Identical project content is reported for an explicit skip/keep decision.
 * - Original files are only read. Accepted entries become numbered versions in the confirmed order
 *   with provenance (original filename, source IDs, original bytes digest, ordering source) and no
 *   fabricated parentage. Operation IDs scoped to the preview batch make retries idempotent.
 */
import type { AppState } from "../../../store";
import { parseJsonSafe } from "../../../adapters/persistence/json";
import { parseWorkspaceFilePayload, type WorkspaceFilePayload } from "../workspaceFile";
import { createPortableId } from "../workspaceFile";
import { decodeText, encodeText, sha256Hex } from "./lineageDirectory";
import type { LineageVersionEntry } from "./lineageFormat";
import { LineageError, type LineageRepository } from "./lineageRepository";

export interface LegacyFileInput {
  name: string;
  bytes: Uint8Array;
}

export interface LegacyAdoptionEntry {
  entryId: string;
  fileName: string;
  byteLength: number;
  originalDigest: string;
  status: "valid" | "invalid";
  error: string | null;
  state: AppState | null;
  payload: WorkspaceFilePayload | null;
  suggestedDateIso: string | null;
  dateSource: "embedded-date" | "filename-timestamp" | null;
  contentDigest: string | null;
  sourceWorkspaceId: string | null;
  sourceRevisionId: string | null;
  networkCount: number;
  wireCount: number;
  /** Other entries with identical project content. */
  duplicateOfEntryIds: string[];
  /** Other entries with the same suggested date. */
  tiedWithEntryIds: string[];
}

export interface LegacyAdoptionPreview {
  batchId: string;
  /** Valid dated entries in suggested order, then undated, then invalid entries. */
  entries: LegacyAdoptionEntry[];
  suggestedWorkingEntryId: string | null;
}

export interface LegacyAdoptionPlan {
  orderedEntryIds: string[];
  skippedEntryIds: string[];
  /** Entry whose content becomes the working state; `null` keeps the current working copy. */
  workingEntryId: string | null;
  labels: Record<string, string>;
  tiesReviewed: boolean;
}

const FILENAME_TIMESTAMP = /(\d{4})-(\d{2})-(\d{2})[_T ](\d{2})[-:h](\d{2})[-:m](\d{2})/;

export function readFileNameTimestamp(fileName: string): string | null {
  const match = FILENAME_TIMESTAMP.exec(fileName);
  if (match === null) {
    return null;
  }
  const [, year, month, day, hour, minute, second] = match;
  const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
  return Number.isFinite(Date.parse(iso)) && new Date(iso).toISOString() === iso ? iso : null;
}

function readEmbeddedDate(rawJson: string): string | null {
  const parsed = parseJsonSafe<unknown>(rawJson);
  if (!parsed.ok || typeof parsed.value !== "object" || parsed.value === null) {
    return null;
  }
  const value = (parsed.value as Record<string, unknown>).updatedAtIso;
  return typeof value === "string" && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
}

export async function buildLegacyAdoptionPreview(files: readonly LegacyFileInput[]): Promise<LegacyAdoptionPreview> {
  const entries: LegacyAdoptionEntry[] = [];
  for (const [index, file] of files.entries()) {
    const raw = decodeText(file.bytes);
    const parsed = parseWorkspaceFilePayload(raw);
    const originalDigest = await sha256Hex(file.bytes);
    const embedded = parsed.payload === null ? null : readEmbeddedDate(raw);
    const fromName = readFileNameTimestamp(file.name);
    const state = parsed.state;
    entries.push({
      entryId: `legacy_${index + 1}_${originalDigest.slice(0, 8)}`,
      fileName: file.name,
      byteLength: file.bytes.byteLength,
      originalDigest,
      status: parsed.payload === null ? "invalid" : "valid",
      error: parsed.payload === null ? parsed.error : null,
      state,
      payload: parsed.payload,
      suggestedDateIso: parsed.payload === null ? null : embedded ?? fromName,
      dateSource: parsed.payload === null ? null : embedded !== null ? "embedded-date" : fromName !== null ? "filename-timestamp" : null,
      contentDigest: state === null ? null : await sha256Hex(encodeText(JSON.stringify(state))),
      sourceWorkspaceId: parsed.payload?.workspaceId ?? null,
      sourceRevisionId: parsed.payload?.revisionId ?? null,
      networkCount: state?.networks.allIds.length ?? 0,
      wireCount: state?.wires.allIds.length ?? 0,
      duplicateOfEntryIds: [],
      tiedWithEntryIds: []
    });
  }
  for (const entry of entries) {
    entry.duplicateOfEntryIds = entries
      .filter((other) => other !== entry && other.contentDigest !== null && other.contentDigest === entry.contentDigest)
      .map((other) => other.entryId);
    entry.tiedWithEntryIds = entries
      .filter((other) => other !== entry && other.suggestedDateIso !== null && other.suggestedDateIso === entry.suggestedDateIso)
      .map((other) => other.entryId);
  }
  const rank = (entry: LegacyAdoptionEntry): number => (entry.status === "invalid" ? 2 : entry.suggestedDateIso === null ? 1 : 0);
  entries.sort(
    (left, right) =>
      rank(left) - rank(right) ||
      (left.suggestedDateIso ?? "").localeCompare(right.suggestedDateIso ?? "") ||
      left.fileName.localeCompare(right.fileName)
  );
  const newest = [...entries].reverse().find((entry) => entry.status === "valid" && entry.suggestedDateIso !== null) ?? null;
  return { batchId: createPortableId("batch"), entries, suggestedWorkingEntryId: newest?.entryId ?? null };
}

/** The default plan places dated valid entries in suggested order; undated ones still need placement. */
export function buildDefaultLegacyAdoptionPlan(preview: LegacyAdoptionPreview): LegacyAdoptionPlan {
  return {
    orderedEntryIds: preview.entries.filter((entry) => entry.status === "valid" && entry.suggestedDateIso !== null).map((entry) => entry.entryId),
    skippedEntryIds: [],
    workingEntryId: preview.suggestedWorkingEntryId,
    labels: {},
    tiesReviewed: false
  };
}

export type LegacyAdoptionPlanIssue =
  | { kind: "unplaced"; entryId: string }
  | { kind: "invalid-in-order"; entryId: string }
  | { kind: "duplicate-in-order"; entryId: string }
  | { kind: "unknown-entry"; entryId: string }
  | { kind: "ties-not-reviewed" }
  | { kind: "working-not-ordered"; entryId: string }
  | { kind: "empty" };

export function validateLegacyAdoptionPlan(preview: LegacyAdoptionPreview, plan: LegacyAdoptionPlan): LegacyAdoptionPlanIssue[] {
  const issues: LegacyAdoptionPlanIssue[] = [];
  const byId = new Map(preview.entries.map((entry) => [entry.entryId, entry]));
  const ordered = new Set<string>();
  for (const entryId of plan.orderedEntryIds) {
    const entry = byId.get(entryId);
    if (entry === undefined) {
      issues.push({ kind: "unknown-entry", entryId });
    } else if (entry.status !== "valid") {
      issues.push({ kind: "invalid-in-order", entryId });
    } else if (ordered.has(entryId)) {
      issues.push({ kind: "duplicate-in-order", entryId });
    }
    ordered.add(entryId);
  }
  const skipped = new Set(plan.skippedEntryIds);
  for (const entry of preview.entries) {
    if (entry.status === "valid" && !ordered.has(entry.entryId) && !skipped.has(entry.entryId)) {
      issues.push({ kind: "unplaced", entryId: entry.entryId });
    }
  }
  const hasTies = preview.entries.some((entry) => ordered.has(entry.entryId) && entry.tiedWithEntryIds.some((other) => ordered.has(other)));
  if (hasTies && !plan.tiesReviewed) {
    issues.push({ kind: "ties-not-reviewed" });
  }
  if (plan.workingEntryId !== null && !ordered.has(plan.workingEntryId)) {
    issues.push({ kind: "working-not-ordered", entryId: plan.workingEntryId });
  }
  if (ordered.size === 0) {
    issues.push({ kind: "empty" });
  }
  return issues;
}

/**
 * Publishes the confirmed entries as versions. Versions already published by a previous attempt of
 * the same batch are reused (idempotent retry). Existing lineages append with the next numbers.
 */
export async function applyLegacyAdoption(
  repository: LineageRepository,
  preview: LegacyAdoptionPreview,
  plan: LegacyAdoptionPlan,
  options: { currentState: AppState; preserveDisplacedWork: boolean }
): Promise<{ versions: LineageVersionEntry[]; workingState: AppState | null }> {
  const issues = validateLegacyAdoptionPlan(preview, plan);
  if (issues.length > 0) {
    throw new LineageError("invalid-input", "The legacy import plan still needs review.");
  }
  const byId = new Map(preview.entries.map((entry) => [entry.entryId, entry]));
  const versions: LineageVersionEntry[] = [];
  let workingVersionId: string | null = null;
  for (const entryId of plan.orderedEntryIds) {
    const entry = byId.get(entryId);
    if (entry?.state == null) {
      continue;
    }
    const version = await repository.createVersion(entry.state, {
      operationId: `legacy:${preview.batchId}:${entry.entryId}`,
      title: plan.labels[entryId] ?? "",
      parentVersionId: null,
      rebaseWorking: false,
      provenance: {
        kind: "legacy-import",
        originalFileName: entry.fileName,
        originalDigest: entry.originalDigest,
        sourceWorkspaceId: entry.sourceWorkspaceId,
        sourceRevisionId: entry.sourceRevisionId,
        orderingSource: entry.dateSource ?? "manual",
        orderingDateIso: entry.suggestedDateIso
      }
    });
    versions.push(version);
    if (entryId === plan.workingEntryId) {
      workingVersionId = version.versionId;
    }
  }
  if (workingVersionId === null) {
    return { versions, workingState: null };
  }
  if (options.preserveDisplacedWork) {
    const restored = await repository.restoreVersion(workingVersionId, options.currentState);
    return { versions, workingState: restored.state };
  }
  const workingEntry = byId.get(plan.workingEntryId ?? "");
  if (workingEntry?.state == null) {
    return { versions, workingState: null };
  }
  await repository.saveWorking(workingEntry.state, { force: true, baseVersionId: workingVersionId });
  return { versions, workingState: workingEntry.state };
}

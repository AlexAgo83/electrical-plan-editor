/**
 * Lineage repository: commit protocol for one named workspace lineage over a LineageDirectory.
 *
 * Failure semantics (see docs/workspace-lineages.md):
 * - Every write is read back and compared before it counts as durable.
 * - Writes are serialized per repository (one lineage); callers capture the repository instance.
 * - Ordinary saves first copy the previous valid working file to Recovery/working-previous, so an
 *   interrupted replacement is recovered on the next open.
 * - Immutable files (versions, handoff records and attachments) are staged before the manifest
 *   is published. A failure between staging and publication leaves an orphan that is reported and
 *   adopted on retry (operation IDs make create-version and handoffs idempotent).
 * - Published version and handoff files are never rewritten or deleted; nothing is pruned.
 */
import type { AppState } from "../../../store";
import {
  buildWorkspaceFilePayload,
  createPortableId,
  parseWorkspaceFilePayload,
  serializeWorkspaceFilePayload,
  WORKING_ANCESTOR_REVISION_LIMIT,
  type WorkspaceFilePayload,
  type WorkspaceVersionMeta,
  type WorkspaceVersionProvenance
} from "../workspaceFile";
import { bytesEqual, decodeText, encodeText, sha256Hex, type LineageDirectory } from "./lineageDirectory";
import {
  HANDOFF_RECORD_PAYLOAD_KIND,
  HANDOFF_RECORD_SCHEMA_VERSION,
  HANDOFFS_DIRECTORY,
  LINEAGE_MANIFEST_FILE_NAME,
  RECOVERY_DIRECTORY,
  VERSIONS_DIRECTORY,
  WORKING_FILE_SUFFIX,
  WORKING_PREVIOUS_RECOVERY_PATH,
  allocateNextDisplayNumber,
  buildAttachmentStorageName,
  buildVersionFileName,
  createLineageManifest,
  createLineageSlug,
  createVersionId,
  createWorkspaceLineageId,
  parseHandoffRecord,
  parseLineageManifest,
  serializeLineageManifest,
  shortId,
  validateLineageAncestry,
  type HandoffAttachment,
  type HandoffRecord,
  type LineageAncestryIssue,
  type LineageHandoffEntry,
  type LineageManifest,
  type LineageRecoveryEntry,
  type LineageVersionEntry
} from "./lineageFormat";
import { LINEAGE_LIMITS } from "./lineageLimits";

export type LineageIssue =
  | { kind: "manifest-reconstructed" }
  | { kind: "working-recovered-from-previous" }
  | { kind: "working-recovered-from-version"; versionId: string }
  | { kind: "version-missing"; versionId: string; fileName: string }
  | { kind: "orphan-version"; fileName: string }
  | { kind: "orphan-handoff"; handoffId: string }
  | { kind: "handoff-record-missing"; handoffId: string }
  | { kind: "ancestry"; issue: LineageAncestryIssue }
  | { kind: "divergent-heads"; count: number };

export type LineageErrorCode =
  | "future-schema"
  | "unreadable"
  | "write-verification-failed"
  | "conflict"
  | "not-found"
  | "corrupt"
  | "invalid-input"
  | "too-large"
  | "immutable";

export class LineageError extends Error {
  readonly code: LineageErrorCode;

  constructor(code: LineageErrorCode, message: string) {
    super(message);
    this.name = "LineageError";
    this.code = code;
  }
}

export interface LineageOpenResult {
  manifest: LineageManifest;
  working: WorkspaceFilePayload;
  issues: LineageIssue[];
}

export interface LineageRepositoryOptions {
  now?: () => string;
  deviceLabel?: string | null;
}

export interface CreateVersionInput {
  title?: string;
  comment?: string;
  operationId: string;
  provenance?: WorkspaceVersionProvenance;
  /** Explicit parent; defaults to the working copy base version. `null` records no parent. */
  parentVersionId?: string | null;
  /** When false, the working copy is not rebased on the new version (bulk legacy import). */
  rebaseWorking?: boolean;
}

export interface HandoffAttachmentInput {
  fileName: string;
  bytes: Uint8Array;
  mimeHint?: string;
}

export interface CreateHandoffInput {
  versionId: string;
  recipient: string;
  handoffDate: string;
  note?: string;
  attachments: HandoffAttachmentInput[];
  supersedesHandoffId?: string | null;
  operationId: string;
}

export type HandoffAttachmentStatus = "ok" | "missing" | "corrupt";

export interface HandoffVerification {
  record: HandoffRecord;
  attachments: Array<{ attachment: HandoffAttachment; status: HandoffAttachmentStatus }>;
  complete: boolean;
}

export async function writeVerifiedFile(directory: LineageDirectory, path: string, bytes: Uint8Array): Promise<void> {
  await directory.writeFile(path, bytes);
  const readBack = await directory.readFile(path);
  if (readBack === null || !bytesEqual(readBack, bytes)) {
    throw new LineageError("write-verification-failed", `Written file could not be verified: ${path}`);
  }
}

function isVersionFilePath(path: string): boolean {
  return path.startsWith(`${VERSIONS_DIRECTORY}/`) && path.endsWith(".epe.json");
}

function handoffIdFromRecordPath(path: string): string | null {
  const match = /^Handoffs\/([^/]+)\/handoff\.json$/.exec(path);
  return match?.[1] ?? null;
}

function handoffIdForOperation(operationId: string): string {
  return `handoff_${operationId.replace(/^op_/, "").replace(/[^A-Za-z0-9_-]/g, "")}`;
}

function cloneManifest(manifest: LineageManifest): LineageManifest {
  return JSON.parse(JSON.stringify(manifest)) as LineageManifest;
}

export function versionEntryFromPayload(
  payload: WorkspaceFilePayload,
  fileName: string,
  contentDigest: string,
  byteLength: number
): LineageVersionEntry | null {
  const meta = payload.version;
  if (meta === undefined) {
    return null;
  }
  return {
    versionId: meta.versionId,
    displayNumber: meta.displayNumber,
    fileName,
    title: meta.title,
    comment: meta.comment,
    createdAtIso: meta.createdAtIso,
    parentVersionId: meta.parentVersionId,
    restoredFromVersionId: meta.restoredFromVersionId,
    revisionId: payload.revisionId,
    contentDigest,
    byteLength,
    deviceLabel: meta.deviceLabel,
    operationId: meta.operationId,
    provenanceKind: meta.provenance.kind,
    orderingDateIso: meta.provenance.kind === "legacy-import" ? meta.provenance.orderingDateIso : null,
    originalFileName: meta.provenance.kind === "legacy-import" ? meta.provenance.originalFileName : null
  };
}

export class LineageRepository {
  readonly directory: LineageDirectory;
  private readonly now: () => string;
  private readonly deviceLabel: string | null;
  private queue: Promise<unknown> = Promise.resolve();
  private manifest: LineageManifest | null = null;
  private working: WorkspaceFilePayload | null = null;

  constructor(directory: LineageDirectory, options: LineageRepositoryOptions = {}) {
    this.directory = directory;
    this.now = options.now ?? (() => new Date().toISOString());
    this.deviceLabel = options.deviceLabel ?? null;
  }

  /** Creates a new lineage root with an empty history and the given working state. */
  static async initialize(
    directory: LineageDirectory,
    input: { displayName: string; state: AppState; slug?: string; workspaceId?: string; existingSlugs?: Iterable<string> },
    options: LineageRepositoryOptions = {}
  ): Promise<LineageRepository> {
    const repository = new LineageRepository(directory, options);
    const nowIso = repository.now();
    const existing = await directory.readFile(LINEAGE_MANIFEST_FILE_NAME);
    if (existing !== null) {
      throw new LineageError("invalid-input", "The selected folder already contains a workspace manifest.");
    }
    const displayName = input.displayName.trim().length > 0 ? input.displayName.trim() : "Workspace";
    const manifest = createLineageManifest({
      workspaceId: input.workspaceId ?? createWorkspaceLineageId(),
      displayName,
      slug: input.slug ?? createLineageSlug(displayName, input.existingSlugs),
      nowIso
    });
    const working = buildWorkspaceFilePayload(input.state, null, nowIso);
    working.workspaceId = manifest.workspaceId;
    working.lineage = { displayName: manifest.displayName, slug: manifest.slug };
    working.working = { baseVersionId: null, restoredFromVersionId: null, ancestorRevisionIds: [] };
    await writeVerifiedFile(directory, manifest.workingFileName, encodeText(serializeWorkspaceFilePayload(working)));
    await writeVerifiedFile(directory, LINEAGE_MANIFEST_FILE_NAME, encodeText(serializeLineageManifest(manifest)));
    repository.manifest = manifest;
    repository.working = working;
    return repository;
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation, operation);
    this.queue = result.catch(() => undefined);
    return result;
  }

  getManifest(): LineageManifest {
    if (this.manifest === null) {
      throw new LineageError("not-found", "Lineage repository is not open.");
    }
    return this.manifest;
  }

  getWorking(): WorkspaceFilePayload {
    if (this.working === null) {
      throw new LineageError("not-found", "Lineage repository is not open.");
    }
    return this.working;
  }

  /**
   * Opens the lineage. Only the manifest and working copy are parsed; version snapshots and
   * attachments are read lazily. Missing/corrupt entries are isolated and reported as issues.
   */
  open(): Promise<LineageOpenResult> {
    return this.enqueue(async () => {
      const issues: LineageIssue[] = [];
      const files = await this.directory.listFiles();
      const fileSet = new Set(files);
      const manifestBytes = await this.directory.readFile(LINEAGE_MANIFEST_FILE_NAME);
      let manifest: LineageManifest;
      if (manifestBytes === null) {
        manifest = await this.reconstructManifest(files);
        issues.push({ kind: "manifest-reconstructed" });
      } else {
        const parsed = parseLineageManifest(decodeText(manifestBytes));
        if (!parsed.ok) {
          if (parsed.errorKind === "future-schema") {
            throw new LineageError("future-schema", parsed.error);
          }
          await this.directory.writeFile(`${RECOVERY_DIRECTORY}/manifest-unreadable-${Date.now()}.json`, manifestBytes);
          manifest = await this.reconstructManifest(files);
          issues.push({ kind: "manifest-reconstructed" });
        } else {
          manifest = parsed.manifest;
        }
      }
      if (issues.some((issue) => issue.kind === "manifest-reconstructed")) {
        await writeVerifiedFile(this.directory, LINEAGE_MANIFEST_FILE_NAME, encodeText(serializeLineageManifest(manifest)));
      }

      const working = await this.loadWorkingWithRecovery(manifest, issues);
      for (const version of manifest.versions) {
        if (!fileSet.has(version.fileName)) {
          issues.push({ kind: "version-missing", versionId: version.versionId, fileName: version.fileName });
        }
      }
      const referencedVersionFiles = new Set(manifest.versions.map((version) => version.fileName));
      for (const path of files) {
        if (isVersionFilePath(path) && !referencedVersionFiles.has(path)) {
          issues.push({ kind: "orphan-version", fileName: path });
        }
      }
      const knownHandoffs = new Set(manifest.handoffs.map((handoff) => handoff.handoffId));
      for (const path of files) {
        const handoffId = handoffIdFromRecordPath(path);
        if (handoffId !== null && !knownHandoffs.has(handoffId)) {
          issues.push({ kind: "orphan-handoff", handoffId });
        }
      }
      for (const handoff of manifest.handoffs) {
        if (!fileSet.has(handoff.recordPath)) {
          issues.push({ kind: "handoff-record-missing", handoffId: handoff.handoffId });
        }
      }
      for (const issue of validateLineageAncestry(manifest.versions)) {
        issues.push({ kind: "ancestry", issue });
      }
      if (manifest.divergentHeads.length > 0) {
        issues.push({ kind: "divergent-heads", count: manifest.divergentHeads.length });
      }
      this.manifest = manifest;
      this.working = working;
      return { manifest, working, issues };
    });
  }

  private async reconstructManifest(files: string[]): Promise<LineageManifest> {
    const workingPath = files.find((path) => !path.includes("/") && path.endsWith(WORKING_FILE_SUFFIX)) ?? null;
    const versionEntries: LineageVersionEntry[] = [];
    let identity: { workspaceId: string; displayName: string; slug: string } | null = null;
    for (const path of files.filter(isVersionFilePath)) {
      const bytes = await this.directory.readFile(path);
      if (bytes === null) {
        continue;
      }
      const parsed = parseWorkspaceFilePayload(decodeText(bytes));
      if (parsed.payload === null) {
        continue;
      }
      const entry = versionEntryFromPayload(parsed.payload, path, await sha256Hex(bytes), bytes.byteLength);
      if (entry !== null) {
        versionEntries.push(entry);
        identity ??= parsed.payload.lineage === undefined ? null : { workspaceId: parsed.payload.workspaceId, ...parsed.payload.lineage };
      }
    }
    if (workingPath !== null) {
      const bytes = await this.directory.readFile(workingPath);
      const parsed = bytes === null ? null : parseWorkspaceFilePayload(decodeText(bytes));
      if (parsed?.payload?.lineage !== undefined) {
        identity = { workspaceId: parsed.payload.workspaceId, ...parsed.payload.lineage };
      }
    }
    if (identity === null) {
      throw new LineageError("unreadable", "No workspace manifest or identifiable lineage files were found.");
    }
    const manifest = createLineageManifest({ ...identity, nowIso: this.now() });
    if (workingPath !== null) {
      manifest.workingFileName = workingPath;
    }
    manifest.versions = versionEntries;
    return manifest;
  }

  private parseWorkingBytes(bytes: Uint8Array | null, manifest: LineageManifest): WorkspaceFilePayload | null {
    if (bytes === null) {
      return null;
    }
    const parsed = parseWorkspaceFilePayload(decodeText(bytes));
    if (parsed.payload === null || parsed.payload.workspaceId !== manifest.workspaceId) {
      return null;
    }
    return parsed.payload;
  }

  private async loadWorkingWithRecovery(manifest: LineageManifest, issues: LineageIssue[]): Promise<WorkspaceFilePayload> {
    const current = this.parseWorkingBytes(await this.directory.readFile(manifest.workingFileName), manifest);
    if (current !== null) {
      return current;
    }
    const previous = this.parseWorkingBytes(await this.directory.readFile(WORKING_PREVIOUS_RECOVERY_PATH), manifest);
    if (previous !== null) {
      issues.push({ kind: "working-recovered-from-previous" });
      return previous;
    }
    const newest = [...manifest.versions].sort((left, right) => right.displayNumber - left.displayNumber)[0];
    if (newest !== undefined) {
      const bytes = await this.directory.readFile(newest.fileName);
      const parsed = bytes === null ? null : parseWorkspaceFilePayload(decodeText(bytes));
      if (parsed?.payload != null && parsed.state !== null) {
        issues.push({ kind: "working-recovered-from-version", versionId: newest.versionId });
        const payload = buildWorkspaceFilePayload(parsed.state, null, this.now());
        payload.workspaceId = manifest.workspaceId;
        payload.lineage = { displayName: manifest.displayName, slug: manifest.slug };
        payload.working = { baseVersionId: newest.versionId, restoredFromVersionId: null, ancestorRevisionIds: [] };
        return payload;
      }
    }
    throw new LineageError("unreadable", "The working copy and its recovery copy are missing or unreadable.");
  }

  /** Re-reads the manifest before a mutation so concurrent writers' entries are kept. */
  private async readManifestForWrite(): Promise<LineageManifest> {
    const bytes = await this.directory.readFile(LINEAGE_MANIFEST_FILE_NAME);
    if (bytes === null) {
      return cloneManifest(this.getManifest());
    }
    const parsed = parseLineageManifest(decodeText(bytes));
    if (!parsed.ok) {
      if (parsed.errorKind === "future-schema") {
        throw new LineageError("future-schema", parsed.error);
      }
      return cloneManifest(this.getManifest());
    }
    return parsed.manifest;
  }

  private async publishManifest(manifest: LineageManifest): Promise<LineageManifest> {
    const next: LineageManifest = {
      ...manifest,
      manifestRevisionId: createPortableId("mrev"),
      updatedAtIso: this.now()
    };
    await writeVerifiedFile(this.directory, LINEAGE_MANIFEST_FILE_NAME, encodeText(serializeLineageManifest(next)));
    this.manifest = next;
    return next;
  }

  private async replaceWorking(nextPayload: WorkspaceFilePayload, manifest: LineageManifest): Promise<void> {
    const currentBytes = await this.directory.readFile(manifest.workingFileName);
    if (currentBytes !== null && this.parseWorkingBytes(currentBytes, manifest) !== null) {
      await writeVerifiedFile(this.directory, WORKING_PREVIOUS_RECOVERY_PATH, currentBytes);
    }
    const bytes = encodeText(serializeWorkspaceFilePayload(nextPayload));
    await writeVerifiedFile(this.directory, manifest.workingFileName, bytes);
    this.working = nextPayload;
  }

  private buildNextWorking(
    state: AppState,
    overrides?: { baseVersionId?: string | null; restoredFromVersionId?: string | null }
  ): WorkspaceFilePayload {
    const manifest = this.getManifest();
    const previous = this.getWorking();
    const next = buildWorkspaceFilePayload(state, previous, this.now());
    next.workspaceId = manifest.workspaceId;
    next.lineage = { displayName: manifest.displayName, slug: manifest.slug };
    next.working = {
      baseVersionId: overrides?.baseVersionId !== undefined ? overrides.baseVersionId : previous.working?.baseVersionId ?? null,
      restoredFromVersionId:
        overrides?.restoredFromVersionId !== undefined
          ? overrides.restoredFromVersionId
          : previous.working?.restoredFromVersionId ?? null,
      ancestorRevisionIds: [previous.revisionId, ...(previous.working?.ancestorRevisionIds ?? [])].slice(
        0,
        WORKING_ANCESTOR_REVISION_LIMIT
      )
    };
    return next;
  }

  /**
   * Ordinary save: replaces the working copy, producing a new technical revision. Never allocates
   * a version number. Returns `conflict` when another writer changed the working file.
   */
  saveWorking(
    state: AppState,
    options: { force?: boolean; baseVersionId?: string | null } = {}
  ): Promise<{ status: "saved"; working: WorkspaceFilePayload } | { status: "conflict"; diskWorking: WorkspaceFilePayload | null }> {
    return this.enqueue(async () => {
      const manifest = this.getManifest();
      if (options.force !== true) {
        const disk = this.parseWorkingBytes(await this.directory.readFile(manifest.workingFileName), manifest);
        if (disk !== null && disk.revisionId !== this.getWorking().revisionId) {
          return { status: "conflict" as const, diskWorking: disk };
        }
      }
      const next = this.buildNextWorking(
        state,
        options.baseVersionId === undefined ? undefined : { baseVersionId: options.baseVersionId, restoredFromVersionId: null }
      );
      await this.replaceWorking(next, manifest);
      return { status: "saved" as const, working: next };
    });
  }

  private async findOrphanVersionByOperation(manifest: LineageManifest, operationId: string): Promise<LineageVersionEntry | null> {
    const referenced = new Set(manifest.versions.map((version) => version.fileName));
    for (const path of await this.directory.listFiles()) {
      if (!isVersionFilePath(path) || referenced.has(path)) {
        continue;
      }
      const bytes = await this.directory.readFile(path);
      if (bytes === null) {
        continue;
      }
      const parsed = parseWorkspaceFilePayload(decodeText(bytes));
      if (parsed.payload?.version?.operationId === operationId && parsed.payload.workspaceId === manifest.workspaceId) {
        return versionEntryFromPayload(parsed.payload, path, await sha256Hex(bytes), bytes.byteLength);
      }
    }
    return null;
  }

  private async listOrphanVersionNumbers(manifest: LineageManifest): Promise<number[]> {
    const referenced = new Set(manifest.versions.map((version) => version.fileName));
    const numbers: number[] = [];
    for (const path of await this.directory.listFiles()) {
      if (!isVersionFilePath(path) || referenced.has(path)) {
        continue;
      }
      const match = /-v(\d{3,})(?:-|\.)/.exec(path.slice(VERSIONS_DIRECTORY.length + 1));
      if (match?.[1] !== undefined) {
        numbers.push(Number.parseInt(match[1], 10));
      }
    }
    return numbers;
  }

  /**
   * Freezes `state` as a new immutable version (max known number + 1). Idempotent per
   * operationId: a retry after a partial failure adopts the staged file instead of duplicating it.
   */
  createVersion(state: AppState, input: CreateVersionInput): Promise<LineageVersionEntry> {
    return this.enqueue(async () => {
      const manifest = await this.readManifestForWrite();
      const existing = manifest.versions.find((version) => version.operationId === input.operationId);
      if (existing !== undefined) {
        this.manifest = manifest;
        return existing;
      }
      let entry = await this.findOrphanVersionByOperation(manifest, input.operationId);
      const working = this.getWorking();
      if (entry === null) {
        const displayNumber = allocateNextDisplayNumber([
          ...manifest.versions.map((version) => version.displayNumber),
          ...(await this.listOrphanVersionNumbers(manifest))
        ]);
        const versionId = createVersionId();
        const title = (input.title ?? "").trim();
        const meta: WorkspaceVersionMeta = {
          versionId,
          displayNumber,
          parentVersionId: input.parentVersionId !== undefined ? input.parentVersionId : working.working?.baseVersionId ?? null,
          restoredFromVersionId: input.rebaseWorking === false ? null : working.working?.restoredFromVersionId ?? null,
          title,
          comment: (input.comment ?? "").trim(),
          createdAtIso: this.now(),
          deviceLabel: this.deviceLabel,
          operationId: input.operationId,
          provenance: input.provenance ?? { kind: "created" }
        };
        const payload = buildWorkspaceFilePayload(state, null, meta.createdAtIso);
        payload.workspaceId = manifest.workspaceId;
        payload.createdAtIso = manifest.createdAtIso || meta.createdAtIso;
        payload.lineage = { displayName: manifest.displayName, slug: manifest.slug };
        payload.version = meta;
        const fileName = buildVersionFileName(manifest.slug, displayNumber, title, versionId);
        const bytes = encodeText(serializeWorkspaceFilePayload(payload));
        await writeVerifiedFile(this.directory, fileName, bytes);
        entry = versionEntryFromPayload(payload, fileName, await sha256Hex(bytes), bytes.byteLength);
        if (entry === null) {
          throw new LineageError("corrupt", "Version metadata could not be built.");
        }
      }
      const published = await this.publishManifest({ ...manifest, versions: [...manifest.versions, entry] });
      if (input.rebaseWorking !== false) {
        const next = this.buildNextWorking(state, { baseVersionId: entry.versionId, restoredFromVersionId: null });
        await this.replaceWorking(next, published);
      }
      return entry;
    });
  }

  /** Lazily reads one immutable version and verifies its declared digest. */
  readVersion(versionId: string): Promise<{ entry: LineageVersionEntry; payload: WorkspaceFilePayload; state: AppState; bytes: Uint8Array }> {
    return this.enqueue(() => this.readVersionUnqueued(versionId));
  }

  private async readVersionUnqueued(
    versionId: string
  ): Promise<{ entry: LineageVersionEntry; payload: WorkspaceFilePayload; state: AppState; bytes: Uint8Array }> {
    const entry = this.getManifest().versions.find((version) => version.versionId === versionId);
    if (entry === undefined) {
      throw new LineageError("not-found", `Version ${versionId} is not part of this workspace.`);
    }
    const bytes = await this.directory.readFile(entry.fileName);
    if (bytes === null) {
      throw new LineageError("not-found", `Version file is missing: ${entry.fileName}`);
    }
    if ((await sha256Hex(bytes)) !== entry.contentDigest) {
      throw new LineageError("corrupt", `Version file does not match its recorded digest: ${entry.fileName}`);
    }
    const parsed = parseWorkspaceFilePayload(decodeText(bytes));
    if (parsed.payload === null || parsed.state === null) {
      throw new LineageError(parsed.errorKind === "future-schema" ? "future-schema" : "corrupt", parsed.error ?? "Version file is unreadable.");
    }
    return { entry, payload: parsed.payload, state: parsed.state, bytes };
  }

  /**
   * Resumes work from a historical version. The displaced working state is first written and
   * verified in Recovery/; any failure aborts before the working copy is touched. Published
   * versions are never modified, and the next version records `restoredFromVersionId`.
   */
  restoreVersion(versionId: string, displacedState: AppState): Promise<{ working: WorkspaceFilePayload; state: AppState; recovery: LineageRecoveryEntry }> {
    return this.enqueue(async () => {
      const source = await this.readVersionUnqueued(versionId);
      const manifest = await this.readManifestForWrite();
      const nowIso = this.now();
      const displaced = buildWorkspaceFilePayload(displacedState, this.getWorking(), nowIso);
      const recoveryId = createPortableId("recovery");
      const fileName = `${RECOVERY_DIRECTORY}/pre-restore-${nowIso.replace(/[:.]/g, "-")}-${shortId(recoveryId)}.epe.json`;
      const displacedBytes = encodeText(serializeWorkspaceFilePayload(displaced));
      await writeVerifiedFile(this.directory, fileName, displacedBytes);
      if (parseWorkspaceFilePayload(decodeText(displacedBytes)).payload === null) {
        throw new LineageError("write-verification-failed", "Recovery copy could not be validated.");
      }
      const recovery: LineageRecoveryEntry = {
        recoveryId,
        kind: "pre-restore",
        fileName,
        createdAtIso: nowIso,
        note: `Working copy displaced by resuming ${source.entry.versionId}`
      };
      const published = await this.publishManifest({ ...manifest, recovery: [...manifest.recovery, recovery] });
      const next = this.buildNextWorking(source.state, { baseVersionId: versionId, restoredFromVersionId: versionId });
      await this.replaceWorking(next, published);
      return { working: next, state: source.state, recovery };
    });
  }

  rename(displayName: string): Promise<LineageManifest> {
    return this.enqueue(async () => {
      const trimmed = displayName.trim();
      if (trimmed.length === 0) {
        throw new LineageError("invalid-input", "Workspace name cannot be empty.");
      }
      const manifest = await this.readManifestForWrite();
      // Slug and file names stay frozen: only the display name changes.
      return this.publishManifest({ ...manifest, displayName: trimmed });
    });
  }

  /** Publishes orphan version files left by an interrupted publication. */
  adoptOrphanVersions(): Promise<LineageVersionEntry[]> {
    return this.enqueue(async () => {
      const manifest = await this.readManifestForWrite();
      const referenced = new Set(manifest.versions.map((version) => version.fileName));
      const knownIds = new Set(manifest.versions.map((version) => version.versionId));
      const adopted: LineageVersionEntry[] = [];
      for (const path of await this.directory.listFiles()) {
        if (!isVersionFilePath(path) || referenced.has(path)) {
          continue;
        }
        const bytes = await this.directory.readFile(path);
        const parsed = bytes === null ? null : parseWorkspaceFilePayload(decodeText(bytes));
        if (bytes === null || parsed?.payload == null || parsed.payload.workspaceId !== manifest.workspaceId) {
          continue;
        }
        const entry = versionEntryFromPayload(parsed.payload, path, await sha256Hex(bytes), bytes.byteLength);
        if (entry !== null && !knownIds.has(entry.versionId)) {
          adopted.push(entry);
          knownIds.add(entry.versionId);
        }
      }
      if (adopted.length > 0) {
        await this.publishManifest({ ...manifest, versions: [...manifest.versions, ...adopted] });
      }
      return adopted;
    });
  }

  /**
   * Records a supplier handoff bound to a frozen version. Attachments are stored byte-for-byte and
   * verified before the record and the manifest entry are published. Idempotent per operationId.
   */
  createHandoff(input: CreateHandoffInput): Promise<LineageHandoffEntry> {
    return this.enqueue(async () => {
      const manifest = await this.readManifestForWrite();
      const handoffId = handoffIdForOperation(input.operationId);
      const existing = manifest.handoffs.find((handoff) => handoff.handoffId === handoffId);
      if (existing !== undefined) {
        this.manifest = manifest;
        return existing;
      }
      if (!manifest.versions.some((version) => version.versionId === input.versionId)) {
        throw new LineageError("not-found", "A handoff must reference a frozen version of this workspace.");
      }
      if (input.recipient.trim().length === 0 || !/^\d{4}-\d{2}-\d{2}$/.test(input.handoffDate)) {
        throw new LineageError("invalid-input", "A handoff requires a recipient and a declared date (YYYY-MM-DD).");
      }
      const supersedes = input.supersedesHandoffId ?? null;
      if (supersedes !== null && !manifest.handoffs.some((handoff) => handoff.handoffId === supersedes)) {
        throw new LineageError("not-found", "The superseded handoff does not exist.");
      }
      const attachments: HandoffAttachment[] = [];
      for (const [index, attachment] of input.attachments.entries()) {
        if (attachment.bytes.byteLength > LINEAGE_LIMITS.maxAttachmentBytes) {
          throw new LineageError("too-large", `Attachment exceeds the ${LINEAGE_LIMITS.maxAttachmentBytes} byte limit: ${attachment.fileName}`);
        }
        const storagePath = `${HANDOFFS_DIRECTORY}/${handoffId}/files/${buildAttachmentStorageName(index, attachment.fileName)}`;
        await writeVerifiedFile(this.directory, storagePath, attachment.bytes);
        attachments.push({
          attachmentId: `${handoffId}_a${index + 1}`,
          originalFileName: attachment.fileName,
          storagePath,
          mimeHint: attachment.mimeHint ?? "application/octet-stream",
          byteLength: attachment.bytes.byteLength,
          sha256: await sha256Hex(attachment.bytes)
        });
      }
      const record: HandoffRecord = {
        payloadKind: HANDOFF_RECORD_PAYLOAD_KIND,
        schemaVersion: HANDOFF_RECORD_SCHEMA_VERSION,
        handoffId,
        workspaceId: manifest.workspaceId,
        versionId: input.versionId,
        recipient: input.recipient.trim(),
        handoffDate: input.handoffDate,
        note: (input.note ?? "").trim(),
        createdAtIso: this.now(),
        supersedesHandoffId: supersedes,
        attachments
      };
      const recordPath = `${HANDOFFS_DIRECTORY}/${handoffId}/handoff.json`;
      const recordBytes = encodeText(JSON.stringify(record, null, 2));
      await writeVerifiedFile(this.directory, recordPath, recordBytes);
      const entry: LineageHandoffEntry = {
        handoffId,
        versionId: record.versionId,
        recipient: record.recipient,
        handoffDate: record.handoffDate,
        recordPath,
        recordDigest: await sha256Hex(recordBytes),
        attachmentCount: attachments.length,
        supersedesHandoffId: supersedes,
        createdAtIso: record.createdAtIso
      };
      await this.publishManifest({ ...manifest, handoffs: [...manifest.handoffs, entry] });
      return entry;
    });
  }

  readHandoffRecord(handoffId: string): Promise<HandoffRecord> {
    return this.enqueue(() => this.readHandoffRecordUnqueued(handoffId));
  }

  private async readHandoffRecordUnqueued(handoffId: string): Promise<HandoffRecord> {
    const entry = this.getManifest().handoffs.find((handoff) => handoff.handoffId === handoffId);
    if (entry === undefined) {
      throw new LineageError("not-found", `Handoff ${handoffId} is not part of this workspace.`);
    }
    const bytes = await this.directory.readFile(entry.recordPath);
    if (bytes === null) {
      throw new LineageError("not-found", `Handoff record is missing: ${entry.recordPath}`);
    }
    if (entry.recordDigest.length > 0 && (await sha256Hex(bytes)) !== entry.recordDigest) {
      throw new LineageError("corrupt", `Handoff record does not match its recorded digest: ${entry.recordPath}`);
    }
    const record = parseHandoffRecord(decodeText(bytes));
    if (record === null) {
      throw new LineageError("corrupt", `Handoff record is unreadable: ${entry.recordPath}`);
    }
    return record;
  }

  verifyHandoff(handoffId: string): Promise<HandoffVerification> {
    return this.enqueue(async () => {
      const record = await this.readHandoffRecordUnqueued(handoffId);
      const attachments: HandoffVerification["attachments"] = [];
      for (const attachment of record.attachments) {
        const bytes = await this.directory.readFile(attachment.storagePath);
        const status: HandoffAttachmentStatus =
          bytes === null ? "missing" : (await sha256Hex(bytes)) === attachment.sha256 ? "ok" : "corrupt";
        attachments.push({ attachment, status });
      }
      return { record, attachments, complete: attachments.every((entry) => entry.status === "ok") };
    });
  }

  readAttachment(handoffId: string, attachmentId: string): Promise<{ attachment: HandoffAttachment; bytes: Uint8Array }> {
    return this.enqueue(async () => {
      const record = await this.readHandoffRecordUnqueued(handoffId);
      const attachment = record.attachments.find((entry) => entry.attachmentId === attachmentId);
      if (attachment === undefined) {
        throw new LineageError("not-found", "Attachment not found.");
      }
      const bytes = await this.directory.readFile(attachment.storagePath);
      if (bytes === null) {
        throw new LineageError("not-found", `Attachment file is missing: ${attachment.storagePath}`);
      }
      if ((await sha256Hex(bytes)) !== attachment.sha256) {
        throw new LineageError("corrupt", `Attachment does not match its recorded digest: ${attachment.originalFileName}`);
      }
      return { attachment, bytes };
    });
  }

  /** Reads an alternative working head recorded during divergent reconciliation. */
  readDivergentHead(headId: string): Promise<{ payload: WorkspaceFilePayload; state: AppState }> {
    return this.enqueue(async () => {
      const head = this.getManifest().divergentHeads.find((entry) => entry.headId === headId);
      if (head === undefined) {
        throw new LineageError("not-found", "Divergent head not found.");
      }
      const bytes = await this.directory.readFile(head.fileName);
      const parsed = bytes === null ? null : parseWorkspaceFilePayload(decodeText(bytes));
      if (parsed?.payload == null || parsed.state === null) {
        throw new LineageError("corrupt", "Divergent head file is missing or unreadable.");
      }
      return { payload: parsed.payload, state: parsed.state };
    });
  }

  /**
   * Resolves divergence explicitly. `null` keeps the current working copy; otherwise the chosen
   * head becomes the working copy and the displaced one is retained as a recovery head file.
   * Both variants remain on disk; no model entities are merged.
   */
  chooseWorkingHead(headId: string | null): Promise<WorkspaceFilePayload> {
    return this.enqueue(async () => {
      const manifest = await this.readManifestForWrite();
      if (headId === null) {
        await this.publishManifest({ ...manifest, divergentHeads: [] });
        return this.getWorking();
      }
      const head = manifest.divergentHeads.find((entry) => entry.headId === headId);
      if (head === undefined) {
        throw new LineageError("not-found", "Divergent head not found.");
      }
      const bytes = await this.directory.readFile(head.fileName);
      const parsed = bytes === null ? null : parseWorkspaceFilePayload(decodeText(bytes));
      if (parsed?.payload == null || parsed.state === null) {
        throw new LineageError("corrupt", "Divergent head file is missing or unreadable.");
      }
      const current = this.getWorking();
      const nowIso = this.now();
      const displacedPath = `${RECOVERY_DIRECTORY}/heads/displaced-${current.revisionId}.epe.json`;
      await writeVerifiedFile(this.directory, displacedPath, encodeText(serializeWorkspaceFilePayload(current)));
      const recovery: LineageRecoveryEntry = {
        recoveryId: createPortableId("recovery"),
        kind: "divergent-head",
        fileName: displacedPath,
        createdAtIso: nowIso,
        note: `Working head ${current.revisionId} displaced by explicit head choice`
      };
      const published = await this.publishManifest({
        ...manifest,
        divergentHeads: [],
        recovery: [...manifest.recovery, recovery]
      });
      const next = buildWorkspaceFilePayload(parsed.state, current, nowIso);
      next.workspaceId = manifest.workspaceId;
      next.lineage = { displayName: manifest.displayName, slug: manifest.slug };
      next.working = {
        baseVersionId: parsed.payload.working?.baseVersionId ?? null,
        restoredFromVersionId: parsed.payload.working?.restoredFromVersionId ?? null,
        ancestorRevisionIds: [
          current.revisionId,
          parsed.payload.revisionId,
          ...(parsed.payload.working?.ancestorRevisionIds ?? [])
        ].slice(0, WORKING_ANCESTOR_REVISION_LIMIT)
      };
      await this.replaceWorking(next, published);
      return next;
    });
  }

  /** Internal hook used by reconciliation to publish an updated manifest under the queue. */
  runExclusive<T>(operation: (context: { readManifestForWrite: () => Promise<LineageManifest>; publishManifest: (manifest: LineageManifest) => Promise<LineageManifest>; replaceWorking: (payload: WorkspaceFilePayload, manifest: LineageManifest) => Promise<void> }) => Promise<T>): Promise<T> {
    return this.enqueue(() =>
      operation({
        readManifestForWrite: () => this.readManifestForWrite(),
        publishManifest: (manifest) => this.publishManifest(manifest),
        replaceWorking: (payload, manifest) => this.replaceWorking(payload, manifest)
      })
    );
  }
}

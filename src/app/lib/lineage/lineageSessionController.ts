/**
 * Named-workspace session controller (framework independent, observed by React through
 * subscribe/getSnapshot).
 *
 * Boundaries it enforces:
 * - Every asynchronous save captures the workspace session token; a switch, a historical
 *   consultation or a return advances the token, so stale callbacks drop their writes.
 * - Switching first preserves unsaved work in the lineage-scoped local session; if that cannot be
 *   made durable the switch is refused.
 * - Historical consultation suspends the working session, blocks project mutations and background
 *   persistence through the central session gate, and restores it unchanged on return.
 * - Undo/redo history is reset at every workspace boundary.
 */
import type { AppState } from "../../../store";
import { translateCurrent as t } from "../i18n";
import { toFilesystemSafeTimestamp } from "../exportFileName";
import { parseJsonSafe } from "../../../adapters/persistence/json";
import { createPortableId } from "../workspaceFile";
import {
  advanceWorkspaceSessionToken,
  getWorkspaceSessionToken,
  setProjectMutationBlocked
} from "../workspaceSessionGate";
import { decodeText, type LineageDirectory } from "./lineageDirectory";
import {
  LINEAGE_MANIFEST_FILE_NAME,
  buildVersionDisplayLabels,
  createLineageSlug,
  createOperationId,
  formatVersionNumber,
  parseLineageManifest,
  type LineageManifest
} from "./lineageFormat";
import { applyLegacyAdoption, type LegacyAdoptionPlan, type LegacyAdoptionPreview } from "./lineageLegacyImport";
import {
  FolderLineageDirectory,
  ensureFolderPermission,
  isDirectoryAccessSupported,
  pickLineageFolder,
  type FolderDirectoryHandle,
  type LineageLibraryStore,
  type LineageRegistryRecord
} from "./lineageLibrary";
import { exportLineagePackage, readLineagePackage, validateLineageFiles, type ValidatedLineagePackage } from "./lineagePackage";
import { reconcileLineagePackage, type LineageReconcileReport } from "./lineageReconcile";
import {
  LineageError,
  LineageRepository,
  type HandoffAttachmentInput,
  type HandoffVerification,
  type LineageIssue
} from "./lineageRepository";

export const LINEAGE_AUTOSAVE_DELAY_MS = 1500;

export type LineageDurability = "disk-verified" | "browser-stored" | "none";

export interface LineageSaveStatus {
  /** In-memory changes not yet written to the lineage working copy. */
  dirty: boolean;
  saving: boolean;
  durability: LineageDurability;
  lastDurableSaveIso: string | null;
  /** Lineage-scoped local recovery copy of unsaved work. */
  localRecovery: "none" | "cached" | "recovered" | "failed";
  pendingPortableExport: boolean;
  downloadInitiatedIso: string | null;
  permission: "granted" | "prompt" | "denied" | "not-applicable";
  conflict: boolean;
  error: string | null;
}

export interface ActiveLineageView {
  workspaceId: string;
  displayName: string;
  slug: string;
  storage: "browser" | "folder";
  folderName: string | null;
  manifest: LineageManifest | null;
  versionLabels: Map<string, string>;
  baseVersionId: string | null;
  restoredFromVersionId: string | null;
  issues: LineageIssue[];
}

export interface HistoricalSessionView {
  versionId: string;
  label: string;
  title: string;
  createdAtIso: string;
}

export interface LineageSessionSnapshot {
  ready: boolean;
  libraryDurable: boolean;
  directoryAccessSupported: boolean;
  records: LineageRegistryRecord[];
  active: ActiveLineageView | null;
  save: LineageSaveStatus;
  historical: HistoricalSessionView | null;
  busy: boolean;
  preservedLegacySnapshot: boolean;
  lastReconcileReport: LineageReconcileReport | null;
}

export interface LineageSessionHost {
  getState(): AppState;
  /** Replaces the project state without recording an undo entry. */
  replaceState(state: AppState): void;
  resetHistory(): void;
  isWorkspaceEmpty(state: AppState): boolean;
  downloadBytes(fileName: string, bytes: Uint8Array, mimeType: string): boolean;
  now?(): string;
}

export type LineageResult<T = void> = { ok: true; value: T } | { ok: false; error: string };

function initialSaveStatus(): LineageSaveStatus {
  return {
    dirty: false,
    saving: false,
    durability: "none",
    lastDurableSaveIso: null,
    localRecovery: "none",
    pendingPortableExport: false,
    downloadInitiatedIso: null,
    permission: "not-applicable",
    conflict: false,
    error: null
  };
}

// `ui` holds transient selection/errors and `meta.revision` is bumped by UI-only actions too.
const PROJECT_STATE_KEYS_IGNORED = new Set<string>(["ui", "meta"]);

/** True when any project slice (everything except transient UI state) changed by reference. */
export function hasProjectContentChanged(previous: AppState, next: AppState): boolean {
  if (previous === next) {
    return false;
  }
  for (const key of Object.keys(next) as Array<keyof AppState>) {
    if (!PROJECT_STATE_KEYS_IGNORED.has(key) && previous[key] !== next[key]) {
      return true;
    }
  }
  return false;
}

/** Deep comparison of project content, ignoring transient UI state. Used only at activation. */
export function projectContentEquals(left: AppState, right: AppState): boolean {
  if (left === right) {
    return true;
  }
  const strip = (state: AppState): string => JSON.stringify({ ...state, ui: null, meta: null });
  return strip(left) === strip(right);
}

function errorMessage(error: unknown): string {
  if (error instanceof LineageError) {
    return error.message;
  }
  if (error instanceof DOMException) {
    if (error.name === "QuotaExceededError") {
      return t("ui.workspaceLineageErrorQuota");
    }
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return t("ui.workspaceLineageErrorPermission");
    }
    if (error.name === "NotFoundError") {
      return t("ui.workspaceLineageErrorMissingFolder");
    }
  }
  return error instanceof Error && error.message.length > 0 ? error.message : t("ui.workspaceLineageErrorUnknown");
}

interface ActiveContext {
  record: LineageRegistryRecord;
  repository: LineageRepository | null;
  issues: LineageIssue[];
}

export class LineageSessionController {
  private readonly library: LineageLibraryStore;
  private readonly host: LineageSessionHost;
  private readonly deviceLabel: string;
  private readonly listeners = new Set<() => void>();
  private snapshot: LineageSessionSnapshot;
  private active: ActiveContext | null = null;
  private suspendedWorkingState: AppState | null = null;
  private lastSavedState: AppState | null = null;
  private autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  private busyCount = 0;

  constructor(library: LineageLibraryStore, host: LineageSessionHost, options: { deviceLabel?: string } = {}) {
    this.library = library;
    this.host = host;
    this.deviceLabel = options.deviceLabel ?? "device";
    this.snapshot = {
      ready: false,
      libraryDurable: library.durable,
      directoryAccessSupported: isDirectoryAccessSupported(),
      records: [],
      active: null,
      save: initialSaveStatus(),
      historical: null,
      busy: false,
      preservedLegacySnapshot: false,
      lastReconcileReport: null
    };
  }

  // ---------------------------------------------------------------- observation

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): LineageSessionSnapshot => this.snapshot;

  private update(patch: Partial<LineageSessionSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
    for (const listener of this.listeners) {
      listener();
    }
  }

  private updateSave(patch: Partial<LineageSaveStatus>): void {
    this.update({ save: { ...this.snapshot.save, ...patch } });
  }

  private now(): string {
    return this.host.now?.() ?? new Date().toISOString();
  }

  private async withBusy<T>(operation: () => Promise<T>): Promise<T> {
    this.busyCount += 1;
    this.update({ busy: true });
    try {
      return await operation();
    } finally {
      this.busyCount -= 1;
      this.update({ busy: this.busyCount > 0 });
    }
  }

  private async refreshRecords(): Promise<void> {
    const records = (await this.library.listRecords()).sort((left, right) => left.displayName.localeCompare(right.displayName));
    this.update({ records });
  }

  private publishActive(): void {
    if (this.active === null) {
      this.update({ active: null });
      return;
    }
    const manifest = this.active.repository?.getManifest() ?? null;
    const working = this.active.repository?.getWorking() ?? null;
    this.update({
      active: {
        workspaceId: this.active.record.workspaceId,
        displayName: manifest?.displayName ?? this.active.record.displayName,
        slug: this.active.record.slug,
        storage: this.active.record.storage,
        folderName: this.active.record.folderName,
        manifest,
        versionLabels: buildVersionDisplayLabels(manifest?.versions ?? []),
        baseVersionId: working?.working?.baseVersionId ?? null,
        restoredFromVersionId: working?.working?.restoredFromVersionId ?? null,
        issues: this.active.issues
      }
    });
  }

  private async persistRecord(patch: Partial<LineageRegistryRecord>): Promise<void> {
    if (this.active === null) {
      return;
    }
    const manifest = this.active.repository?.getManifest() ?? null;
    const latest = manifest === null ? null : [...manifest.versions].sort((left, right) => right.displayNumber - left.displayNumber)[0] ?? null;
    this.active.record = {
      ...this.active.record,
      displayName: manifest?.displayName ?? this.active.record.displayName,
      versionCount: manifest?.versions.length ?? this.active.record.versionCount,
      latestVersionLabel: latest === null ? null : formatVersionNumber(latest.displayNumber),
      ...patch
    };
    try {
      await this.library.putRecord(this.active.record);
    } catch {
      // Registry metadata is a cache of the lineage files; failing to update it loses no project data.
    }
    await this.refreshRecords();
  }

  // ---------------------------------------------------------------- directories

  private async resolveDirectory(record: LineageRegistryRecord, requestPermission: boolean): Promise<{ directory: LineageDirectory | null; permission: LineageSaveStatus["permission"] }> {
    if (record.storage === "browser") {
      return { directory: this.library.browserDirectory(record.workspaceId, record.displayName), permission: "not-applicable" };
    }
    const handle = await this.library.readFolderHandle(record.workspaceId);
    if (handle === null) {
      return { directory: null, permission: "denied" };
    }
    const permission = await ensureFolderPermission(handle, requestPermission);
    return { directory: permission === "granted" ? new FolderLineageDirectory(handle) : null, permission };
  }

  // ---------------------------------------------------------------- lifecycle

  async initialize(): Promise<void> {
    try {
      await this.refreshRecords();
      this.update({ preservedLegacySnapshot: (await this.library.readPreservedLegacySnapshot()) !== null });
      const activeId = await this.library.getActiveWorkspaceId();
      const record = this.snapshot.records.find((entry) => entry.workspaceId === activeId) ?? null;
      if (record !== null) {
        // The current browser state (legacy persistence) mirrors the active lineage session.
        await this.activate(record, { loadState: false, requestPermission: false });
      }
    } catch (error) {
      this.updateSave({ error: errorMessage(error) });
    } finally {
      this.update({ ready: true });
    }
  }

  dispose(): void {
    if (this.autosaveTimer !== null) {
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = null;
    }
    this.listeners.clear();
  }

  /**
   * Activates a registered lineage. With `loadState`, its working (or locally recovered) state is
   * loaded into the editor; otherwise the editor's current state is kept as the session state.
   */
  private async activate(record: LineageRegistryRecord, options: { loadState: boolean; requestPermission: boolean }): Promise<void> {
    const { directory, permission } = await this.resolveDirectory(record, options.requestPermission);
    let repository: LineageRepository | null = null;
    let issues: LineageIssue[] = [];
    let openError: string | null = null;
    if (directory !== null) {
      repository = new LineageRepository(directory, { deviceLabel: this.deviceLabel });
      try {
        issues = (await repository.open()).issues;
      } catch (error) {
        repository = null;
        openError = errorMessage(error);
      }
    }
    advanceWorkspaceSessionToken();
    this.active = { record, repository, issues };
    const session = await this.library.readSession(record.workspaceId).catch(() => null);
    const working = repository?.getWorking() ?? null;
    let state: AppState | null = null;
    let localRecovery: LineageSaveStatus["localRecovery"] = "none";
    if (session !== null && (working === null || session.baseRevisionId === working.revisionId || session.baseRevisionId === null)) {
      const parsed = parseJsonSafe<AppState>(session.stateJson);
      if (parsed.ok) {
        state = parsed.value;
        localRecovery = "recovered";
      }
    }
    if (options.loadState) {
      const nextState = state ?? working?.state ?? null;
      if (nextState !== null) {
        this.host.replaceState(nextState);
      }
      this.host.resetHistory();
    }
    const currentState = this.host.getState();
    const dirty = working === null || !projectContentEquals(working.state, currentState);
    this.lastSavedState = dirty ? working?.state ?? null : currentState;
    this.update({
      save: {
        ...initialSaveStatus(),
        dirty,
        durability: working === null ? "none" : record.storage === "folder" ? "disk-verified" : "browser-stored",
        lastDurableSaveIso: working?.updatedAtIso ?? null,
        localRecovery: dirty && localRecovery === "none" ? "cached" : localRecovery,
        pendingPortableExport: record.storage === "browser" && record.pendingPortableExport,
        permission,
        error:
          openError ??
          (record.storage === "folder" && directory === null
            ? permission === "prompt"
              ? t("ui.workspaceLineageFolderPermissionRequired")
              : t("ui.workspaceLineageErrorMissingFolder")
            : null)
      },
      historical: null
    });
    await this.library.setActiveWorkspaceId(record.workspaceId).catch(() => undefined);
    await this.persistRecord({ lastOpenedAtIso: this.now() });
    this.publishActive();
  }

  /** Called on every editor state change. Schedules the lineage-scoped autosave. */
  notifyStateChanged(previous: AppState, next: AppState): void {
    if (this.active === null || this.snapshot.historical !== null || !hasProjectContentChanged(previous, next)) {
      return;
    }
    if (!this.snapshot.save.dirty) {
      this.updateSave({ dirty: true });
    }
    if (this.autosaveTimer !== null) {
      clearTimeout(this.autosaveTimer);
    }
    const token = getWorkspaceSessionToken();
    this.autosaveTimer = setTimeout(() => {
      this.autosaveTimer = null;
      void this.autosave(token);
    }, LINEAGE_AUTOSAVE_DELAY_MS);
  }

  private async writeLocalSession(state: AppState): Promise<boolean> {
    if (this.active === null) {
      return false;
    }
    try {
      await this.library.writeSession({
        workspaceId: this.active.record.workspaceId,
        stateJson: JSON.stringify(state),
        baseRevisionId: this.active.repository?.getWorking().revisionId ?? null,
        savedAtIso: this.now()
      });
      if (!this.library.durable) {
        this.updateSave({ localRecovery: "failed" });
        return false;
      }
      this.updateSave({ localRecovery: "cached" });
      return true;
    } catch (error) {
      this.updateSave({ localRecovery: "failed", error: errorMessage(error) });
      return false;
    }
  }

  private async autosave(token: number): Promise<void> {
    if (token !== getWorkspaceSessionToken() || this.snapshot.historical !== null) {
      return;
    }
    const state = this.host.getState();
    await this.writeLocalSession(state);
    if (token !== getWorkspaceSessionToken()) {
      return;
    }
    await this.writeWorking(state, token, { explicit: false });
  }

  private async writeWorking(state: AppState, token: number, options: { explicit: boolean }): Promise<boolean> {
    const context = this.active;
    if (context === null || context.repository === null) {
      return false;
    }
    if (this.lastSavedState !== null && !hasProjectContentChanged(this.lastSavedState, state) && !options.explicit) {
      this.updateSave({ dirty: false });
      return true;
    }
    this.updateSave({ saving: true });
    try {
      const result = await context.repository.saveWorking(state);
      if (token !== getWorkspaceSessionToken() || this.active !== context) {
        return false;
      }
      if (result.status === "conflict") {
        this.updateSave({ saving: false, conflict: true, error: t("ui.workspaceLineageErrorConflict") });
        return false;
      }
      this.lastSavedState = state;
      const stillDirty = this.host.getState() !== state && hasProjectContentChanged(state, this.host.getState());
      const isBrowser = context.record.storage === "browser";
      this.updateSave({
        saving: false,
        dirty: stillDirty,
        conflict: false,
        error: null,
        durability: isBrowser ? "browser-stored" : "disk-verified",
        lastDurableSaveIso: result.working.updatedAtIso,
        pendingPortableExport: isBrowser ? true : this.snapshot.save.pendingPortableExport
      });
      if (!stillDirty) {
        await this.library.clearSession(context.record.workspaceId).catch(() => undefined);
        this.updateSave({ localRecovery: "none" });
      }
      await this.persistRecord({ lastDurableSaveIso: result.working.updatedAtIso, pendingPortableExport: isBrowser });
      this.publishActive();
      return true;
    } catch (error) {
      if (token === getWorkspaceSessionToken()) {
        this.updateSave({ saving: false, error: errorMessage(error) });
      }
      return false;
    }
  }

  // ---------------------------------------------------------------- commands

  hasActiveLineage(): boolean {
    return this.active !== null;
  }

  /**
   * Ordinary save (Save button, Ctrl/Cmd+S). Updates the working copy and never creates a version.
   * Without a writable folder it commits to the browser library and initiates a portable package
   * download, reported as "download initiated" rather than a verified file.
   */
  async saveNow(): Promise<LineageResult> {
    if (this.active === null) {
      return { ok: false, error: t("ui.workspaceLineageErrorNoActive") };
    }
    if (this.snapshot.historical !== null) {
      return { ok: false, error: t("ui.workspaceLineageReadOnlyBlocked") };
    }
    if (this.autosaveTimer !== null) {
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = null;
    }
    const token = getWorkspaceSessionToken();
    const state = this.host.getState();
    if (this.active.repository === null) {
      const relinked = this.active.record.storage === "folder" ? await this.relinkFolder() : { ok: false as const, error: "" };
      if (!relinked.ok || this.active?.repository == null) {
        await this.writeLocalSession(state);
        return { ok: false, error: this.snapshot.save.error ?? t("ui.workspaceLineageErrorMissingFolder") };
      }
    }
    const saved = await this.writeWorking(state, token, { explicit: true });
    if (!saved) {
      await this.writeLocalSession(state);
      return { ok: false, error: this.snapshot.save.error ?? t("ui.workspaceLineageErrorUnknown") };
    }
    if (this.active?.record.storage === "browser") {
      // The browser commit succeeded; if the download cannot start, the status keeps showing the
      // pending portable export instead of reporting the save itself as failed.
      await this.exportPackage();
    }
    return { ok: true, value: undefined };
  }

  /** Preserves the current session before leaving it; returns false when unsaved work is at risk. */
  private async preserveCurrentSession(): Promise<boolean> {
    if (this.active === null) {
      return true;
    }
    if (this.autosaveTimer !== null) {
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = null;
    }
    const state = this.snapshot.historical !== null && this.suspendedWorkingState !== null ? this.suspendedWorkingState : this.host.getState();
    if (this.lastSavedState !== null && !hasProjectContentChanged(this.lastSavedState, state)) {
      return true;
    }
    const cached = await this.writeLocalSession(state);
    const saved = await this.writeWorking(state, getWorkspaceSessionToken(), { explicit: false });
    return cached || saved;
  }

  private leaveHistoricalMode(): void {
    if (this.snapshot.historical === null) {
      return;
    }
    setProjectMutationBlocked(null);
    advanceWorkspaceSessionToken();
    if (this.suspendedWorkingState !== null) {
      this.host.replaceState(this.suspendedWorkingState);
    }
    this.suspendedWorkingState = null;
    this.host.resetHistory();
    this.update({ historical: null });
  }

  /**
   * First-registry migration: a valid legacy browser workspace is preserved before any lineage
   * activation replaces the editor state.
   */
  private async preserveLegacyStateIfNeeded(): Promise<void> {
    if (this.active !== null || this.snapshot.records.length > 0) {
      return;
    }
    const state = this.host.getState();
    if (this.host.isWorkspaceEmpty(state)) {
      return;
    }
    await this.library.writePreservedLegacySnapshot({ stateJson: JSON.stringify(state), preservedAtIso: this.now() });
    this.update({ preservedLegacySnapshot: true });
  }

  async createLineage(input: { displayName: string; start: "current" | "empty"; storage: "browser" | "folder"; emptyState: AppState }): Promise<LineageResult> {
    return this.withBusy(async () => {
      const displayName = input.displayName.trim();
      if (displayName.length === 0) {
        return { ok: false, error: t("ui.workspaceLineageErrorNameRequired") };
      }
      let parentHandle: FolderDirectoryHandle | null = null;
      if (input.storage === "folder") {
        parentHandle = await pickLineageFolder().catch(() => null);
        if (parentHandle === null) {
          return { ok: false, error: t("ui.workspaceLineageErrorFolderNotSelected") };
        }
      }
      try {
        await this.preserveLegacyStateIfNeeded();
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
      if (this.active !== null) {
        if (!(await this.preserveCurrentSession())) {
          return { ok: false, error: t("ui.workspaceLineageErrorCannotPreserve") };
        }
      }
      const initialState = input.start === "current" ? this.snapshot.historical !== null && this.suspendedWorkingState !== null ? this.suspendedWorkingState : this.host.getState() : input.emptyState;
      this.leaveHistoricalMode();
      const slug = createLineageSlug(displayName, this.snapshot.records.map((record) => record.slug));
      let directory: LineageDirectory;
      let workspaceId: string = createPortableId("workspace");
      let folderName: string | null = null;
      if (parentHandle !== null) {
        const rootHandle = await parentHandle.getDirectoryHandle(slug, { create: true });
        directory = new FolderLineageDirectory(rootHandle);
        folderName = `${parentHandle.name}/${slug}`;
        await this.library.writeFolderHandle(workspaceId, rootHandle);
      } else {
        directory = this.library.browserDirectory(workspaceId, displayName);
      }
      try {
        const repository = await LineageRepository.initialize(directory, { displayName, state: initialState, slug, workspaceId }, { deviceLabel: this.deviceLabel });
        workspaceId = repository.getManifest().workspaceId;
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
      const nowIso = this.now();
      const record: LineageRegistryRecord = {
        workspaceId,
        displayName,
        slug,
        storage: input.storage,
        folderName,
        createdAtIso: nowIso,
        lastOpenedAtIso: nowIso,
        pendingPortableExport: input.storage === "browser",
        lastDurableSaveIso: nowIso,
        versionCount: 0,
        latestVersionLabel: null
      };
      await this.library.putRecord(record);
      await this.activate(record, { loadState: true, requestPermission: false });
      return { ok: true, value: undefined };
    });
  }

  async switchTo(workspaceId: string): Promise<LineageResult> {
    if (this.active?.record.workspaceId === workspaceId && this.snapshot.historical === null) {
      return { ok: true, value: undefined };
    }
    return this.withBusy(async () => {
      const record = this.snapshot.records.find((entry) => entry.workspaceId === workspaceId);
      if (record === undefined) {
        return { ok: false, error: t("ui.workspaceLineageErrorNotFound") };
      }
      try {
        await this.preserveLegacyStateIfNeeded();
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
      if (!(await this.preserveCurrentSession())) {
        return { ok: false, error: t("ui.workspaceLineageErrorCannotPreserve") };
      }
      const leavingHistorical = this.snapshot.historical !== null;
      if (leavingHistorical) {
        setProjectMutationBlocked(null);
        this.suspendedWorkingState = null;
        this.update({ historical: null });
      }
      await this.activate(record, { loadState: true, requestPermission: true });
      return { ok: true, value: undefined };
    });
  }

  async rename(displayName: string): Promise<LineageResult> {
    const repository = this.active?.repository ?? null;
    if (repository === null) {
      return { ok: false, error: t("ui.workspaceLineageErrorNoActive") };
    }
    return this.withBusy(async () => {
      try {
        await repository.rename(displayName);
        await this.persistRecord({});
        this.publishActive();
        return { ok: true, value: undefined };
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
    });
  }

  async relinkFolder(): Promise<LineageResult> {
    const context = this.active;
    if (context === null || context.record.storage !== "folder") {
      return { ok: false, error: t("ui.workspaceLineageErrorNoActive") };
    }
    let { directory, permission } = await this.resolveDirectory(context.record, true);
    if (directory === null) {
      const picked = await pickLineageFolder().catch(() => null);
      if (picked === null) {
        this.updateSave({ permission });
        return { ok: false, error: t("ui.workspaceLineageErrorFolderNotSelected") };
      }
      const manifestBytes = await new FolderLineageDirectory(picked).readFile(LINEAGE_MANIFEST_FILE_NAME);
      const parsed = manifestBytes === null ? null : parseLineageManifest(decodeText(manifestBytes));
      if (parsed === null || !parsed.ok || parsed.manifest.workspaceId !== context.record.workspaceId) {
        return { ok: false, error: t("ui.workspaceLineageErrorWrongFolder") };
      }
      await this.library.writeFolderHandle(context.record.workspaceId, picked);
      directory = new FolderLineageDirectory(picked);
      permission = "granted";
    }
    const repository = new LineageRepository(directory, { deviceLabel: this.deviceLabel });
    try {
      context.issues = (await repository.open()).issues;
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }
    context.repository = repository;
    this.updateSave({ permission, error: null });
    this.publishActive();
    return { ok: true, value: undefined };
  }

  /** Creates a numbered milestone of the current working state. Idempotent per operationId. */
  async createVersion(input: { title: string; comment: string; operationId: string }): Promise<LineageResult<{ versionId: string; label: string }>> {
    const context = this.active;
    if (context?.repository == null) {
      return { ok: false, error: t("ui.workspaceLineageErrorNoActive") };
    }
    if (this.snapshot.historical !== null) {
      return { ok: false, error: t("ui.workspaceLineageReadOnlyBlocked") };
    }
    const repository = context.repository;
    return this.withBusy(async () => {
      const state = this.host.getState();
      const token = getWorkspaceSessionToken();
      try {
        const entry = await repository.createVersion(state, { ...input });
        if (token === getWorkspaceSessionToken()) {
          this.lastSavedState = state;
          const isBrowser = context.record.storage === "browser";
          this.updateSave({
            dirty: hasProjectContentChanged(state, this.host.getState()),
            error: null,
            durability: isBrowser ? "browser-stored" : "disk-verified",
            lastDurableSaveIso: this.now(),
            pendingPortableExport: isBrowser ? true : this.snapshot.save.pendingPortableExport
          });
        }
        await this.persistRecord({ pendingPortableExport: context.record.storage === "browser" });
        this.publishActive();
        return { ok: true, value: { versionId: entry.versionId, label: formatVersionNumber(entry.displayNumber) } };
      } catch (error) {
        this.updateSave({ error: errorMessage(error) });
        return { ok: false, error: errorMessage(error) };
      }
    });
  }

  /** Opens a frozen version read-only. The working session is suspended and preserved first. */
  async openHistorical(versionId: string): Promise<LineageResult> {
    const context = this.active;
    if (context?.repository == null) {
      return { ok: false, error: t("ui.workspaceLineageErrorNoActive") };
    }
    const repository = context.repository;
    return this.withBusy(async () => {
      let version;
      try {
        version = await repository.readVersion(versionId);
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
      if (this.snapshot.historical === null) {
        const working = this.host.getState();
        if (!(await this.preserveCurrentSession())) {
          return { ok: false, error: t("ui.workspaceLineageErrorCannotPreserve") };
        }
        this.suspendedWorkingState = working;
      }
      if (this.autosaveTimer !== null) {
        clearTimeout(this.autosaveTimer);
        this.autosaveTimer = null;
      }
      setProjectMutationBlocked(t("ui.workspaceLineageReadOnlyBlocked"));
      advanceWorkspaceSessionToken();
      this.host.replaceState(version.state);
      this.host.resetHistory();
      const label = buildVersionDisplayLabels(repository.getManifest().versions).get(versionId) ?? formatVersionNumber(version.entry.displayNumber);
      this.update({
        historical: { versionId, label, title: version.entry.title, createdAtIso: version.entry.createdAtIso }
      });
      return { ok: true, value: undefined };
    });
  }

  returnToWorking(): void {
    this.leaveHistoricalMode();
  }

  /**
   * Resumes work from a version. The displaced working state is durably preserved in Recovery
   * first; failure or cancellation aborts without changing anything.
   */
  async restoreFromVersion(versionId: string): Promise<LineageResult> {
    const context = this.active;
    if (context?.repository == null) {
      return { ok: false, error: t("ui.workspaceLineageErrorNoActive") };
    }
    const repository = context.repository;
    return this.withBusy(async () => {
      const displaced = this.snapshot.historical !== null && this.suspendedWorkingState !== null ? this.suspendedWorkingState : this.host.getState();
      try {
        const restored = await repository.restoreVersion(versionId, displaced);
        setProjectMutationBlocked(null);
        advanceWorkspaceSessionToken();
        this.suspendedWorkingState = null;
        this.host.replaceState(restored.state);
        this.host.resetHistory();
        this.lastSavedState = this.host.getState();
        await this.library.clearSession(context.record.workspaceId).catch(() => undefined);
        this.update({ historical: null });
        this.updateSave({ dirty: false, localRecovery: "none", error: null, lastDurableSaveIso: restored.working.updatedAtIso, pendingPortableExport: context.record.storage === "browser" || this.snapshot.save.pendingPortableExport });
        await this.persistRecord({ pendingPortableExport: context.record.storage === "browser" });
        this.publishActive();
        return { ok: true, value: undefined };
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
    });
  }

  async createHandoff(input: {
    versionId: string | null;
    freezeTitle?: string;
    recipient: string;
    handoffDate: string;
    note: string;
    attachments: HandoffAttachmentInput[];
    supersedesHandoffId: string | null;
    operationId: string;
  }): Promise<LineageResult<{ handoffId: string }>> {
    const context = this.active;
    if (context?.repository == null) {
      return { ok: false, error: t("ui.workspaceLineageErrorNoActive") };
    }
    const repository = context.repository;
    let versionId = input.versionId;
    if (versionId === null) {
      const created = await this.createVersion({ title: input.freezeTitle ?? input.recipient, comment: "", operationId: `${input.operationId}:version` });
      if (!created.ok) {
        return created;
      }
      versionId = created.value.versionId;
    }
    const frozenVersionId = versionId;
    return this.withBusy(async () => {
      try {
        const entry = await repository.createHandoff({ ...input, versionId: frozenVersionId });
        await this.persistRecord({ pendingPortableExport: context.record.storage === "browser" });
        if (context.record.storage === "browser") {
          this.updateSave({ pendingPortableExport: true });
        }
        this.publishActive();
        return { ok: true, value: { handoffId: entry.handoffId } };
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
    });
  }

  async verifyHandoff(handoffId: string): Promise<LineageResult<HandoffVerification>> {
    const repository = this.active?.repository ?? null;
    if (repository === null) {
      return { ok: false, error: t("ui.workspaceLineageErrorNoActive") };
    }
    try {
      return { ok: true, value: await repository.verifyHandoff(handoffId) };
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }
  }

  /** Downloads exact attachment bytes. Content is never rendered or opened by the application. */
  async downloadAttachment(handoffId: string, attachmentId: string): Promise<LineageResult> {
    const repository = this.active?.repository ?? null;
    if (repository === null) {
      return { ok: false, error: t("ui.workspaceLineageErrorNoActive") };
    }
    try {
      const { attachment, bytes } = await repository.readAttachment(handoffId, attachmentId);
      this.host.downloadBytes(attachment.originalFileName, bytes, "application/octet-stream");
      return { ok: true, value: undefined };
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }
  }

  /** Downloads one version file exactly as stored; it opens on its own as a workspace file. */
  async downloadVersion(versionId: string): Promise<LineageResult> {
    const repository = this.active?.repository ?? null;
    if (repository === null) {
      return { ok: false, error: t("ui.workspaceLineageErrorNoActive") };
    }
    try {
      const { entry, bytes } = await repository.readVersion(versionId);
      this.host.downloadBytes(entry.fileName.split("/").pop() ?? `${versionId}.epe.json`, bytes, "application/json");
      return { ok: true, value: undefined };
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }
  }

  async exportPackage(): Promise<LineageResult> {
    const context = this.active;
    if (context?.repository == null) {
      return { ok: false, error: t("ui.workspaceLineageErrorNoActive") };
    }
    const repository = context.repository;
    return this.withBusy(async () => {
      try {
        const nowIso = this.now();
        const archive = await exportLineagePackage(repository.directory, context.record.slug);
        const fileName = `${context.record.slug}-${toFilesystemSafeTimestamp(nowIso)}.zip`;
        if (!this.host.downloadBytes(fileName, archive, "application/zip")) {
          return { ok: false, error: t("ui.workspaceLineageErrorDownloadUnavailable") };
        }
        this.updateSave({ pendingPortableExport: false, downloadInitiatedIso: nowIso });
        await this.persistRecord({ pendingPortableExport: false });
        return { ok: true, value: undefined };
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
    });
  }

  private async integratePackage(validated: ValidatedLineagePackage, sourceLabel: string): Promise<LineageResult<{ workspaceId: string; report: LineageReconcileReport | null; created: boolean }>> {
    const workspaceId = validated.manifest.workspaceId;
    const known = this.snapshot.records.find((record) => record.workspaceId === workspaceId) ?? null;
    if (known === null) {
      const directory = this.library.browserDirectory(workspaceId, validated.manifest.displayName);
      const staged: string[] = [];
      try {
        for (const [path, bytes] of validated.files) {
          await directory.writeFile(path, bytes);
          staged.push(path);
        }
        const repository = new LineageRepository(directory);
        await repository.open();
      } catch (error) {
        for (const path of staged) {
          await directory.removeFile(path).catch(() => undefined);
        }
        return { ok: false, error: errorMessage(error) };
      }
      const nowIso = this.now();
      await this.library.putRecord({
        workspaceId,
        displayName: validated.manifest.displayName,
        slug: createLineageSlug(validated.manifest.slug, this.snapshot.records.map((record) => record.slug)),
        storage: "browser",
        folderName: null,
        createdAtIso: validated.manifest.createdAtIso || nowIso,
        lastOpenedAtIso: nowIso,
        pendingPortableExport: false,
        lastDurableSaveIso: validated.working.updatedAtIso,
        versionCount: validated.manifest.versions.length,
        latestVersionLabel: null
      });
      await this.refreshRecords();
      return { ok: true, value: { workspaceId, report: null, created: true } };
    }
    const isActive = this.active?.record.workspaceId === workspaceId;
    if (isActive && this.snapshot.historical !== null) {
      return { ok: false, error: t("ui.workspaceLineageReadOnlyBlocked") };
    }
    let repository: LineageRepository | null = isActive ? this.active?.repository ?? null : null;
    if (repository === null) {
      const { directory } = await this.resolveDirectory(known, true);
      if (directory === null) {
        return { ok: false, error: t("ui.workspaceLineageErrorMissingFolder") };
      }
      repository = new LineageRepository(directory, { deviceLabel: this.deviceLabel });
      await repository.open();
    }
    if (isActive && this.snapshot.save.dirty) {
      const saved = await this.writeWorking(this.host.getState(), getWorkspaceSessionToken(), { explicit: true });
      if (!saved) {
        return { ok: false, error: t("ui.workspaceLineageErrorCannotPreserve") };
      }
    }
    try {
      const report = await reconcileLineagePackage(repository, validated, sourceLabel);
      if (isActive && this.active !== null) {
        this.active.issues = (await repository.open()).issues;
        if (report.working === "fast-forward") {
          advanceWorkspaceSessionToken();
          this.host.replaceState(repository.getWorking().state);
          this.host.resetHistory();
          this.lastSavedState = this.host.getState();
          this.updateSave({ dirty: false });
        }
        this.publishActive();
        await this.persistRecord({});
      }
      this.update({ lastReconcileReport: report });
      return { ok: true, value: { workspaceId, report, created: false } };
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }
  }

  /** Imports a portable ZIP package. Everything is validated before any registry activation. */
  async importPackage(fileName: string, bytes: Uint8Array): Promise<LineageResult<{ workspaceId: string; report: LineageReconcileReport | null; created: boolean }>> {
    return this.withBusy(async () => {
      const read = await readLineagePackage(bytes);
      if (!read.ok) {
        return { ok: false, error: read.message };
      }
      return this.integratePackage(read.package, fileName);
    });
  }

  /**
   * Opens lineage folders: either a lineage root or a common parent containing several lineages
   * (for example a copied folder holding both Series and Prototypes). Known lineages are reconciled.
   */
  async openFolder(): Promise<LineageResult<{ opened: string[] }>> {
    const handle = await pickLineageFolder().catch(() => null);
    if (handle === null) {
      return { ok: false, error: t("ui.workspaceLineageErrorFolderNotSelected") };
    }
    return this.withBusy(async () => {
      const candidates: FolderDirectoryHandle[] = [];
      const rootDirectory = new FolderLineageDirectory(handle);
      if ((await rootDirectory.readFile(LINEAGE_MANIFEST_FILE_NAME)) !== null) {
        candidates.push(handle);
      } else if (handle.values !== undefined) {
        for await (const entry of handle.values()) {
          if ("getDirectoryHandle" in entry && (await new FolderLineageDirectory(entry).readFile(LINEAGE_MANIFEST_FILE_NAME)) !== null) {
            candidates.push(entry);
          }
        }
      }
      if (candidates.length === 0) {
        return { ok: false, error: t("ui.workspaceLineageErrorNoLineageInFolder") };
      }
      const opened: string[] = [];
      for (const candidate of candidates) {
        const directory = new FolderLineageDirectory(candidate);
        const repository = new LineageRepository(directory, { deviceLabel: this.deviceLabel });
        let manifest: LineageManifest;
        try {
          manifest = (await repository.open()).manifest;
        } catch (error) {
          return { ok: false, error: errorMessage(error) };
        }
        const known = this.snapshot.records.find((record) => record.workspaceId === manifest.workspaceId) ?? null;
        if (known !== null && !(known.storage === "folder" && known.folderName === candidate.name)) {
          const files = new Map<string, Uint8Array>();
          for (const path of await directory.listFiles()) {
            const bytes = await directory.readFile(path);
            if (bytes !== null) {
              files.set(path, bytes);
            }
          }
          const validated = await validateLineageFiles(files);
          if (!validated.ok) {
            return { ok: false, error: validated.message };
          }
          const integrated = await this.integratePackage(validated.package, candidate.name);
          if (!integrated.ok) {
            return integrated;
          }
        } else {
          await this.library.writeFolderHandle(manifest.workspaceId, candidate);
          const nowIso = this.now();
          await this.library.putRecord({
            workspaceId: manifest.workspaceId,
            displayName: manifest.displayName,
            slug: manifest.slug,
            storage: "folder",
            folderName: candidate.name,
            createdAtIso: manifest.createdAtIso || nowIso,
            lastOpenedAtIso: nowIso,
            pendingPortableExport: false,
            lastDurableSaveIso: repository.getWorking().updatedAtIso,
            versionCount: manifest.versions.length,
            latestVersionLabel: null
          });
        }
        opened.push(manifest.workspaceId);
      }
      await this.refreshRecords();
      return { ok: true, value: { opened } };
    });
  }

  async chooseWorkingHead(headId: string | null): Promise<LineageResult> {
    const context = this.active;
    if (context?.repository == null) {
      return { ok: false, error: t("ui.workspaceLineageErrorNoActive") };
    }
    if (this.snapshot.historical !== null) {
      return { ok: false, error: t("ui.workspaceLineageReadOnlyBlocked") };
    }
    const repository = context.repository;
    return this.withBusy(async () => {
      try {
        if (headId !== null && this.snapshot.save.dirty) {
          await this.writeWorking(this.host.getState(), getWorkspaceSessionToken(), { explicit: true });
        }
        const working = await repository.chooseWorkingHead(headId);
        if (headId !== null) {
          advanceWorkspaceSessionToken();
          this.host.replaceState(working.state);
          this.host.resetHistory();
          this.lastSavedState = this.host.getState();
          this.updateSave({ dirty: false });
        }
        context.issues = context.issues.filter((issue) => issue.kind !== "divergent-heads");
        this.publishActive();
        return { ok: true, value: undefined };
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
    });
  }

  async adoptOrphanVersions(): Promise<LineageResult<number>> {
    const context = this.active;
    if (context?.repository == null) {
      return { ok: false, error: t("ui.workspaceLineageErrorNoActive") };
    }
    const repository = context.repository;
    return this.withBusy(async () => {
      try {
        const adopted = await repository.adoptOrphanVersions();
        context.issues = (await repository.open()).issues;
        await this.persistRecord({});
        this.publishActive();
        return { ok: true, value: adopted.length };
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
    });
  }

  async applyLegacyImport(
    preview: LegacyAdoptionPreview,
    plan: LegacyAdoptionPlan,
    target: { kind: "existing"; workspaceId: string } | { kind: "new"; displayName: string; emptyState: AppState }
  ): Promise<LineageResult<{ versionCount: number }>> {
    if (target.kind === "new") {
      const created = await this.createLineage({ displayName: target.displayName, start: "empty", storage: "browser", emptyState: target.emptyState });
      if (!created.ok) {
        return created;
      }
    } else if (this.active?.record.workspaceId !== target.workspaceId) {
      const switched = await this.switchTo(target.workspaceId);
      if (!switched.ok) {
        return switched;
      }
    }
    const context = this.active;
    if (context?.repository == null) {
      return { ok: false, error: t("ui.workspaceLineageErrorNoActive") };
    }
    if (this.snapshot.historical !== null) {
      this.leaveHistoricalMode();
    }
    const repository = context.repository;
    return this.withBusy(async () => {
      try {
        const result = await applyLegacyAdoption(repository, preview, plan, {
          currentState: this.host.getState(),
          preserveDisplacedWork: target.kind === "existing"
        });
        if (result.workingState !== null) {
          advanceWorkspaceSessionToken();
          this.host.replaceState(repository.getWorking().state);
          this.host.resetHistory();
          this.lastSavedState = this.host.getState();
          this.updateSave({ dirty: false });
        }
        await this.persistRecord({ pendingPortableExport: context.record.storage === "browser" });
        this.publishActive();
        return { ok: true, value: { versionCount: result.versions.length } };
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
    });
  }

  async downloadPreservedLegacySnapshot(buildFileContent: (state: AppState) => string): Promise<LineageResult> {
    const snapshot = await this.library.readPreservedLegacySnapshot();
    if (snapshot === null) {
      return { ok: false, error: t("ui.workspaceLineageErrorNotFound") };
    }
    const parsed = parseJsonSafe<AppState>(snapshot.stateJson);
    if (!parsed.ok) {
      return { ok: false, error: t("ui.workspaceLineageErrorUnknown") };
    }
    const content = new TextEncoder().encode(buildFileContent(parsed.value));
    this.host.downloadBytes(`electrical-workspace-preserved-${toFilesystemSafeTimestamp(snapshot.preservedAtIso)}.epe.json`, content, "application/json");
    return { ok: true, value: undefined };
  }

  async discardPreservedLegacySnapshot(): Promise<void> {
    await this.library.writePreservedLegacySnapshot(null);
    this.update({ preservedLegacySnapshot: false });
  }

  newOperationId(): string {
    return createOperationId();
  }
}

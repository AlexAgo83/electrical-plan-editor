import { getActiveLocale, translateCurrent as t } from "../i18n";
import type { LineageRegistryRecord } from "./lineageLibrary";
import type { LineageSessionSnapshot } from "./lineageSessionController";

/** A browser-only workspace not exported for longer than this escalates its export hint to a warning. */
export const EXPORT_REMINDER_WARNING_AFTER_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

function formatTime(iso: string | null): string {
  if (iso === null) {
    return "";
  }
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleTimeString(getActiveLocale(), { hour: "2-digit", minute: "2-digit" });
}

/** Named workspace mode hides the single-file tools; a session without an active named workspace keeps them. */
export function isNamedWorkspaceStorageMode(snapshot: LineageSessionSnapshot | undefined): boolean {
  return snapshot?.active != null;
}

export interface LineageStatusDescription {
  label: string;
  tone: "neutral" | "success" | "warning" | "danger";
}

/**
 * Distinguishes dirty, locally recovered, verified disk save, browser save and failures. A browser
 * save is the normal state of that mode and reads as success; the export reminder is separate.
 */
export function describeLineageSaveStatus(snapshot: LineageSessionSnapshot): LineageStatusDescription {
  const { save, active, historical } = snapshot;
  if (active === null) {
    return { label: t("ui.workspaceLineageStatusNoNamedWorkspace"), tone: "neutral" };
  }
  if (historical !== null) {
    return { label: t("ui.workspaceLineageStatusReadOnly", { version: historical.label }), tone: "warning" };
  }
  if (save.conflict) {
    return { label: t("ui.workspaceLineageStatusConflict"), tone: "danger" };
  }
  if (save.error !== null) {
    return { label: t("ui.workspaceLineageStatusError", { message: save.error }), tone: "danger" };
  }
  if (save.saving) {
    return { label: t("ui.workspaceLineageStatusSaving"), tone: "neutral" };
  }
  if (save.dirty) {
    if (save.localRecovery === "recovered") {
      return { label: t("ui.workspaceLineageStatusRecovered"), tone: "warning" };
    }
    if (save.localRecovery === "failed") {
      return { label: t("ui.workspaceLineageStatusDirtyUnprotected"), tone: "danger" };
    }
    if (save.localRecovery === "cached") {
      return { label: t("ui.workspaceLineageStatusDirtyCached"), tone: "warning" };
    }
    return { label: t("ui.workspaceLineageStatusDirty"), tone: "warning" };
  }
  if (active.storage === "folder") {
    return save.durability === "disk-verified"
      ? { label: t("ui.workspaceLineageStatusDiskVerified", { time: formatTime(save.lastDurableSaveIso) }), tone: "success" }
      : { label: t("ui.workspaceLineageStatusNotOnDisk"), tone: "warning" };
  }
  if (save.downloadInitiatedIso !== null && !save.pendingPortableExport) {
    return { label: t("ui.workspaceLineageStatusDownloadInitiated", { time: formatTime(save.downloadInitiatedIso) }), tone: "success" };
  }
  return { label: t("ui.workspaceLineageStatusBrowserStored", { time: formatTime(save.lastDurableSaveIso) }), tone: "success" };
}

export interface LineageExportReminder {
  label: string;
  tone: "neutral" | "warning";
}

type ExportReminderRecord = Pick<LineageRegistryRecord, "storage" | "pendingPortableExport" | "createdAtIso" | "lastPortableExportIso">;

/**
 * Neutral hint while a browser-only workspace has changes not exported as a package; a warning once
 * the last export (or the creation, when never exported) is older than EXPORT_REMINDER_WARNING_AFTER_DAYS.
 */
export function describeLineageExportReminder(record: ExportReminderRecord | null | undefined, nowMs: number = Date.now()): LineageExportReminder | null {
  if (record == null || record.storage !== "browser" || !record.pendingPortableExport) {
    return null;
  }
  const sinceMs = Date.parse(record.lastPortableExportIso ?? record.createdAtIso);
  const elapsedMs = Number.isNaN(sinceMs) ? 0 : nowMs - sinceMs;
  if (elapsedMs > EXPORT_REMINDER_WARNING_AFTER_DAYS * DAY_MS) {
    const days = Math.floor(elapsedMs / DAY_MS);
    return {
      label: record.lastPortableExportIso == null ? t("ui.workspaceLineageExportReminderNeverOverdue", { days }) : t("ui.workspaceLineageExportReminderOverdue", { days }),
      tone: "warning"
    };
  }
  return { label: t("ui.workspaceLineageExportReminderHint"), tone: "neutral" };
}

/** The registry record of the active workspace, with the live pending-export flag of the session. */
export function activeExportReminderRecord(snapshot: LineageSessionSnapshot): ExportReminderRecord | null {
  const active = snapshot.active;
  if (active === null || snapshot.historical !== null) {
    return null;
  }
  const record = snapshot.records.find((entry) => entry.workspaceId === active.workspaceId) ?? null;
  return record === null ? null : { ...record, storage: active.storage, pendingPortableExport: snapshot.save.pendingPortableExport };
}

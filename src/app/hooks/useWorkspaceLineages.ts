import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { AppState, AppStore } from "../../store";
import { createEmptyWorkspaceState, isUnmodifiedBuiltInSample, isWorkspaceEmpty } from "../../store";
import { translateCurrent as t } from "../lib/i18n";
import { downloadBinaryFile } from "../lib/binaryDownload";
import { buildWorkspaceFilePayload, serializeWorkspaceFilePayload } from "../lib/workspaceFile";
import { subscribeBlockedMutationAttempts } from "../lib/workspaceSessionGate";
import { createDefaultLineageLibraryStore, type LineageLibraryStore } from "../lib/lineage/lineageLibrary";
import {
  buildLegacyAdoptionPreview,
  type LegacyAdoptionPlan,
  type LegacyAdoptionPreview
} from "../lib/lineage/lineageLegacyImport";
import {
  LineageSessionController,
  type LineageResult,
  type LineageSessionSnapshot
} from "../lib/lineage/lineageSessionController";
import type { HandoffAttachmentInput, HandoffVerification } from "../lib/lineage/lineageRepository";

type NotifyToast = (title: string, options?: { message?: string; variant?: "success" | "info" | "warning" | "error" }) => void;

export type WorkspaceLineageDialog =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "rename" }
  | { kind: "version"; operationId: string }
  | { kind: "history" }
  | { kind: "handoff"; versionId: string | null; supersedesHandoffId: string | null; operationId: string }
  | { kind: "legacy" }
  | { kind: "divergence" };

export interface WorkspaceLineageModel {
  snapshot: LineageSessionSnapshot;
  dialog: WorkspaceLineageDialog;
  openDialog: (dialog: WorkspaceLineageDialog["kind"], options?: { versionId?: string | null; supersedesHandoffId?: string | null }) => void;
  closeDialog: () => void;
  switchTo: (workspaceId: string) => Promise<boolean>;
  saveNow: () => Promise<boolean>;
  createLineage: (input: { displayName: string; start: "current" | "empty"; storage: "browser" | "folder" }) => Promise<boolean>;
  rename: (displayName: string) => Promise<boolean>;
  createVersion: (input: { title: string; comment: string; operationId: string }) => Promise<boolean>;
  openHistorical: (versionId: string) => Promise<boolean>;
  returnToWorking: () => void;
  restoreFromVersion: (versionId: string) => Promise<boolean>;
  createHandoff: (input: {
    versionId: string | null;
    recipient: string;
    handoffDate: string;
    note: string;
    attachments: HandoffAttachmentInput[];
    supersedesHandoffId: string | null;
    operationId: string;
  }) => Promise<boolean>;
  verifyHandoff: (handoffId: string) => Promise<HandoffVerification | null>;
  downloadAttachment: (handoffId: string, attachmentId: string) => Promise<boolean>;
  downloadVersion: (versionId: string) => Promise<boolean>;
  exportPackage: () => Promise<boolean>;
  importPackageFile: (file: File) => Promise<boolean>;
  openFolder: () => Promise<boolean>;
  relinkFolder: () => Promise<boolean>;
  chooseWorkingHead: (headId: string | null) => Promise<boolean>;
  adoptOrphanVersions: () => Promise<boolean>;
  previewLegacyFiles: (files: File[]) => Promise<LegacyAdoptionPreview>;
  applyLegacyImport: (
    preview: LegacyAdoptionPreview,
    plan: LegacyAdoptionPlan,
    target: { kind: "existing"; workspaceId: string } | { kind: "new"; displayName: string }
  ) => Promise<boolean>;
  downloadPreservedLegacySnapshot: () => Promise<boolean>;
  discardPreservedLegacySnapshot: () => Promise<void>;
}

interface UseWorkspaceLineagesParams {
  store: AppStore;
  resetHistory: () => void;
  notifyToast: NotifyToast;
  requestConfirmation: (request: { title: string; message: string; intent?: "neutral" | "warning" | "danger"; confirmLabel?: string }) => Promise<boolean>;
  libraryStore?: LineageLibraryStore;
}

const DEVICE_LABEL_STORAGE_KEY = "electrical-plan-editor.device-label";

function resolveDeviceLabel(): string {
  try {
    const existing = window.localStorage.getItem(DEVICE_LABEL_STORAGE_KEY);
    if (existing !== null && existing.length > 0) {
      return existing;
    }
    const created = `device-${Math.random().toString(36).slice(2, 6)}`;
    window.localStorage.setItem(DEVICE_LABEL_STORAGE_KEY, created);
    return created;
  } catch {
    return "device";
  }
}

async function readFileBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

export function useWorkspaceLineages({ store, resetHistory, notifyToast, requestConfirmation, libraryStore }: UseWorkspaceLineagesParams): WorkspaceLineageModel {
  const [controller] = useState(
    () =>
      new LineageSessionController(
        libraryStore ?? createDefaultLineageLibraryStore(),
        {
          getState: () => store.getState(),
          replaceState: (state: AppState) => store.replaceState(state),
          resetHistory: () => resetHistory(),
          isWorkspaceEmpty: (state: AppState) => isWorkspaceEmpty(state),
          isUnmodifiedBuiltInSample: (state: AppState) => isUnmodifiedBuiltInSample(state),
          downloadBytes: (fileName, bytes, mimeType) => downloadBinaryFile(fileName, bytes, mimeType)
        },
        { deviceLabel: typeof window === "undefined" ? "device" : resolveDeviceLabel() }
      )
  );
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const [dialog, setDialog] = useState<WorkspaceLineageDialog>({ kind: "none" });

  useEffect(() => {
    void controller.initialize();
    return () => controller.dispose();
  }, [controller]);

  useEffect(() => {
    let previous = store.getState();
    return store.subscribe(() => {
      const next = store.getState();
      controller.notifyStateChanged(previous, next);
      previous = next;
    });
  }, [controller, store]);

  useEffect(
    () =>
      subscribeBlockedMutationAttempts((reason) => {
        notifyToast(t("ui.workspaceLineageReadOnlyTitle"), { message: reason, variant: "warning" });
      }),
    [notifyToast]
  );

  const report = useCallback(
    <T,>(result: LineageResult<T>, successTitle: string | null, successMessage?: string): boolean => {
      if (!result.ok) {
        notifyToast(t("ui.workspaceLineageActionFailed"), { message: result.error, variant: "error" });
        return false;
      }
      if (successTitle !== null) {
        notifyToast(successTitle, { message: successMessage, variant: "success" });
      }
      return true;
    },
    [notifyToast]
  );

  const openDialog = useCallback<WorkspaceLineageModel["openDialog"]>(
    (kind, options) => {
      switch (kind) {
        case "version":
          setDialog({ kind, operationId: controller.newOperationId() });
          return;
        case "handoff":
          setDialog({
            kind,
            versionId: options?.versionId ?? null,
            supersedesHandoffId: options?.supersedesHandoffId ?? null,
            operationId: controller.newOperationId()
          });
          return;
        default:
          setDialog({ kind });
      }
    },
    [controller]
  );
  const closeDialog = useCallback(() => setDialog({ kind: "none" }), []);

  return useMemo<WorkspaceLineageModel>(
    () => ({
      snapshot,
      dialog,
      openDialog,
      closeDialog,
      switchTo: async (workspaceId) => report(await controller.switchTo(workspaceId), null),
      saveNow: async () => {
        const storage = controller.getSnapshot().active?.storage;
        return report(
          await controller.saveNow(),
          t("ui.workspaceLineageSaved"),
          storage === "browser" ? t("ui.workspaceLineageSavedBrowserDownloadInitiated") : t("ui.workspaceLineageSavedFolder")
        );
      },
      createLineage: async (input) =>
        report(await controller.createLineage({ ...input, emptyState: createEmptyWorkspaceState() }), t("ui.workspaceLineageCreated"), input.displayName),
      rename: async (displayName) => report(await controller.rename(displayName), t("ui.workspaceLineageRenamed"), displayName),
      createVersion: async (input) => {
        const result = await controller.createVersion(input);
        return report(result, t("ui.workspaceLineageVersionCreated"), result.ok ? result.value.label : undefined);
      },
      openHistorical: async (versionId) => report(await controller.openHistorical(versionId), null),
      returnToWorking: () => controller.returnToWorking(),
      restoreFromVersion: async (versionId) => {
        const label = controller.getSnapshot().active?.versionLabels.get(versionId) ?? versionId;
        const confirmed = await requestConfirmation({
          title: t("ui.workspaceLineageRestoreTitle"),
          message: t("ui.workspaceLineageRestoreMessage", { version: label }),
          intent: "warning",
          confirmLabel: t("ui.workspaceLineageRestoreConfirm")
        });
        if (!confirmed) {
          return false;
        }
        return report(await controller.restoreFromVersion(versionId), t("ui.workspaceLineageRestored"), label);
      },
      createHandoff: async (input) => report(await controller.createHandoff(input), t("ui.workspaceLineageHandoffRecorded"), input.recipient),
      verifyHandoff: async (handoffId) => {
        const result = await controller.verifyHandoff(handoffId);
        return report(result, null) && result.ok ? result.value : null;
      },
      downloadAttachment: async (handoffId, attachmentId) => report(await controller.downloadAttachment(handoffId, attachmentId), null),
      downloadVersion: async (versionId) => report(await controller.downloadVersion(versionId), null),
      exportPackage: async () => report(await controller.exportPackage(), t("ui.workspaceLineagePackageDownloadInitiated")),
      importPackageFile: async (file) => {
        const result = await controller.importPackage(file.name, await readFileBytes(file));
        if (!report(result, t("ui.workspaceLineagePackageImported"), file.name) || !result.ok) {
          return false;
        }
        if (result.value.report?.working === "divergent") {
          setDialog({ kind: "divergence" });
        }
        return true;
      },
      openFolder: async () => {
        const result = await controller.openFolder();
        return report(result, t("ui.workspaceLineageFolderOpened"), result.ok ? String(result.value.opened.length) : undefined);
      },
      relinkFolder: async () => report(await controller.relinkFolder(), t("ui.workspaceLineageFolderReconnected")),
      chooseWorkingHead: async (headId) => report(await controller.chooseWorkingHead(headId), t("ui.workspaceLineageHeadChosen")),
      adoptOrphanVersions: async () => {
        const result = await controller.adoptOrphanVersions();
        return report(result, t("ui.workspaceLineageOrphansRecovered"), result.ok ? String(result.value) : undefined);
      },
      previewLegacyFiles: async (files) =>
        buildLegacyAdoptionPreview(await Promise.all(files.map(async (file) => ({ name: file.name, bytes: await readFileBytes(file) })))),
      applyLegacyImport: async (preview, plan, target) => {
        const result = await controller.applyLegacyImport(
          preview,
          plan,
          target.kind === "new" ? { ...target, emptyState: createEmptyWorkspaceState() } : target
        );
        return report(result, t("ui.workspaceLineageLegacyImported"), result.ok ? String(result.value.versionCount) : undefined);
      },
      downloadPreservedLegacySnapshot: async () =>
        report(
          await controller.downloadPreservedLegacySnapshot((state) => serializeWorkspaceFilePayload(buildWorkspaceFilePayload(state))),
          null
        ),
      discardPreservedLegacySnapshot: () => controller.discardPreservedLegacySnapshot()
    }),
    [closeDialog, controller, dialog, openDialog, report, requestConfirmation, snapshot]
  );
}

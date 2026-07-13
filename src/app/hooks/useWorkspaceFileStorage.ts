import { translateCurrent as t } from "../lib/i18n";
import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { consumeLastSpliceMigrationReport } from "../../adapters/persistence";
import { downloadJsonFile } from "./useNetworkImportExport";
import { buildWorkspaceFileName, buildWorkspaceFilePayload, parseWorkspaceFilePayload, serializeWorkspaceFilePayload, type WorkspaceFilePayloadV1 } from "../lib/workspaceFile";
import {
  WORKSPACE_FILE_TYPES,
  buildStatusLabel,
  buildWorkspaceFileSummary,
  clearStoredWorkspaceFileHandle,
  readHandleText,
  readStoredWorkspaceFileHandle,
  resolveWorkspaceFileWindow,
  resolveWritePermission,
  writeHandleText,
  writeStoredWorkspaceFileHandle,
  type WorkspaceFileHandle,
  type WorkspaceFileStorageStatus
} from "../lib/workspaceFileAccess";
import { openWorkspaceHandleWithFeedback } from "../lib/workspaceFileOpenActions";
import { AUTOSAVE_DELAY_MS, createDownloadedWorkspaceFileStatus, createLinkedWorkspaceFileStatus, createLocalWorkspaceFileStatus, createOpenedWorkspaceFileStatus, type WorkspaceFileStatusBase } from "../lib/workspaceFileStorageStatus";
import type { UseWorkspaceFileStorageParams, UseWorkspaceFileStorageResult } from "./workspaceFileStorageTypes";

export type { WorkspaceFileStorageStatus } from "../lib/workspaceFileAccess";
export type { UseWorkspaceFileStorageModel } from "./workspaceFileStorageTypes";

export function useWorkspaceFileStorage({
  store,
  replaceStateWithHistory,
  requestConfirmation,
  notifyToast,
  showSpliceMigrationReport
}: UseWorkspaceFileStorageParams): UseWorkspaceFileStorageResult {
  const workspaceFileInputRef = useRef<HTMLInputElement | null>(null);
  const linkedHandleRef = useRef<WorkspaceFileHandle | null>(null);
  const lastLoadedPayloadRef = useRef<WorkspaceFilePayloadV1 | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isWritingRef = useRef(false);
  const [statusBase, setStatusBase] = useState<WorkspaceFileStatusBase>(createLocalWorkspaceFileStatus);
  const status = useMemo<WorkspaceFileStorageStatus>(
    () => ({
      ...statusBase,
      label: buildStatusLabel(statusBase)
    }),
    [statusBase]
  );

  const applyWorkspaceFile = useCallback(
    async (rawJson: string, sourceLabel: string, handle: WorkspaceFileHandle | null): Promise<void> => {
      const parsed = parseWorkspaceFilePayload(rawJson);
      if (parsed.error !== null || parsed.state === null || parsed.payload === null) {
        setStatusBase((current) => ({
          ...current,
          message: parsed.error ?? "Workspace file could not be loaded.",
          conflict: false
        }));
        notifyToast("Workspace file not opened", {
          message: parsed.error ?? "The selected file is not a valid workspace.",
          variant: "error"
        });
        return;
      }

      const shouldReplace = await requestConfirmation({
        title: t("ui.operationshealthpanelOpenWorkspaceFile"),
        message: t("ui.useworkspacefilestorageReplaceTheCurrentWorkspaceWithTheSelectedFile"),
        details: `${sourceLabel}\n\n${buildWorkspaceFileSummary(parsed.payload)}`,
        confirmLabel: "Open file",
        intent: "neutral"
      });
      if (!shouldReplace) {
        return;
      }

      linkedHandleRef.current = null;
      replaceStateWithHistory(parsed.state);
      lastLoadedPayloadRef.current = parsed.payload;
      linkedHandleRef.current = handle;
      const spliceMigrationReport = consumeLastSpliceMigrationReport().map((entry) => entry.message);
      const nextPermission = handle === null ? "unavailable" : await resolveWritePermission(handle);
      if (handle !== null) {
        void writeStoredWorkspaceFileHandle(handle);
      }
      setStatusBase(createOpenedWorkspaceFileStatus(sourceLabel, handle, parsed.payload, nextPermission));
      if (spliceMigrationReport.length > 0) {
        showSpliceMigrationReport?.(spliceMigrationReport);
      }
      notifyToast("Workspace file opened", {
        message: sourceLabel,
        variant: "success"
      });
    },
    [notifyToast, replaceStateWithHistory, requestConfirmation, showSpliceMigrationReport]
  );

  useEffect(() => {
    void (async () => {
      const storedHandle = await readStoredWorkspaceFileHandle();
      if (storedHandle === null) {
        return;
      }

      setStatusBase((current) => ({
        ...current,
        resumeFileName: storedHandle.name,
        canResume: true,
        resumeStatus: "available",
        fileAvailability: "unknown",
        message:
          current.mode === "linked"
            ? current.message
            : `A previous workspace file can be resumed: ${storedHandle.name}.`
      }));
    })();
  }, []);

  const resumeWorkspaceFile = useCallback((): void => {
    void (async () => {
      const handle = await readStoredWorkspaceFileHandle();
      if (handle === null) {
        setStatusBase((current) => ({
          ...current,
          canResume: false,
          resumeFileName: null,
          resumeStatus: "unavailable",
          fileAvailability: "unavailable",
          message: t("ui.useworkspacefilestorageNoPreviousWorkspaceFileHandleIsAvailableInThisBrowser")
        }));
        notifyToast("Workspace file cannot be resumed", {
          message: t("ui.useworkspacefilestorageOpenTheWorkspaceFileOnceToCreateAResumableLink"),
          variant: "warning"
        });
        return;
      }

      try {
        await applyWorkspaceFile(await readHandleText(handle), handle.name, handle);
      } catch {
        setStatusBase((current) => ({
          ...current,
          canResume: true,
          resumeFileName: handle.name,
          fileAvailability: "unavailable",
          message: t("ui.useworkspacefilestorageThePreviousWorkspaceFileCouldNotBeResumedTryOpening")
        }));
        notifyToast("Workspace file cannot be resumed", {
          message: t("ui.useworkspacefilestorageTheBrowserCouldNotReadThePreviousFileHandle"),
          variant: "error"
        });
      }
    })();
  }, [applyWorkspaceFile, notifyToast]);

  const openWorkspaceFile = useCallback((): void => {
    const fileWindow = resolveWorkspaceFileWindow();
    const openFilePicker = fileWindow?.showOpenFilePicker;
    if (typeof openFilePicker === "function") {
      void (async () => {
        try {
          const [handle] = await openFilePicker({
            multiple: false,
            types: WORKSPACE_FILE_TYPES
          });
          if (handle === undefined) {
            return;
          }
          await applyWorkspaceFile(await readHandleText(handle), handle.name, handle);
        } catch (error) {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            notifyToast("Workspace file not opened", {
              message: t("ui.useworkspacefilestorageTheFilePickerCouldNotReadTheSelectedWorkspace"),
              variant: "error"
            });
          }
        }
      })();
      return;
    }

    workspaceFileInputRef.current?.click();
  }, [applyWorkspaceFile, notifyToast]);

  const relinkWorkspaceFile = useCallback((): void => {
    openWorkspaceFile();
  }, [openWorkspaceFile]);

  const handleWorkspaceFileInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = event.target.files?.[0] ?? null;
      event.target.value = "";
      if (file === null) {
        return;
      }

      await applyWorkspaceFile(await file.text(), file.name, null);
    },
    [applyWorkspaceFile]
  );

  const writeCurrentStateToHandle = useCallback(
    async (handle: WorkspaceFileHandle, options?: { ignoreConflict?: boolean }): Promise<"saved" | "conflict" | "failed"> => {
      try {
        const previousPayload = lastLoadedPayloadRef.current;
        if (!options?.ignoreConflict && previousPayload !== null) {
          const currentFile = parseWorkspaceFilePayload(await readHandleText(handle));
          if (currentFile.payload === null) {
            setStatusBase((current) => ({
              ...current,
              conflict: true,
              isSaving: false,
              message: t("ui.useworkspacefilestorageTheLinkedWorkspaceFileCouldNotBeReadAsA")
            }));
            return "conflict";
          }
          if (
            currentFile.payload.revisionId !== previousPayload.revisionId
          ) {
            setStatusBase((current) => ({
              ...current,
              conflict: true,
              isSaving: false,
              message: t("ui.useworkspacefilestorageTheLinkedWorkspaceFileChangedOutsideThisTabChooseWhich")
            }));
            return "conflict";
          }
        }

        const nextPayload = buildWorkspaceFilePayload(store.getState(), previousPayload);
        await writeHandleText(handle, serializeWorkspaceFilePayload(nextPayload));
        lastLoadedPayloadRef.current = nextPayload;
        setStatusBase((current) => ({
          ...current,
          mode: "linked",
          fileName: handle.name,
          lastSavedAtIso: nextPayload.updatedAtIso,
          permission: current.permission === "unavailable" ? "unknown" : current.permission,
          conflict: false,
          isSaving: false,
          message: t("ui.useworkspacefilestorageWorkspaceFileSaved")
        }));
        return "saved";
      } catch {
        setStatusBase((current) => ({
          ...current,
          fileAvailability: "unavailable",
          isSaving: false,
          message: t("ui.useworkspacefilestorageTheLinkedWorkspaceFileCouldNotBeWrittenItMay")
        }));
        return "failed";
      }
    },
    [store]
  );

  const saveWorkspaceFileAs = useCallback((): void => {
    void (async () => {
      const nowIso = new Date().toISOString();
      const payload = buildWorkspaceFilePayload(store.getState(), lastLoadedPayloadRef.current, nowIso);
      const serialized = serializeWorkspaceFilePayload(payload);
      const fileName = buildWorkspaceFileName(nowIso);
      const fileWindow = resolveWorkspaceFileWindow();

      if (typeof fileWindow?.showSaveFilePicker === "function") {
        try {
          const handle = await fileWindow.showSaveFilePicker({
            suggestedName: fileName,
            types: WORKSPACE_FILE_TYPES
          });
          await writeHandleText(handle, serialized);
          linkedHandleRef.current = handle;
          lastLoadedPayloadRef.current = payload;
          void writeStoredWorkspaceFileHandle(handle);
          const permission = await resolveWritePermission(handle);
          setStatusBase(createLinkedWorkspaceFileStatus(handle.name, payload, permission));
          notifyToast("Workspace file saved", {
            message: handle.name,
            variant: "success"
          });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
        }
      }

      const downloaded = downloadJsonFile(fileName, serialized);
      if (!downloaded) {
        notifyToast("Workspace file not saved", {
          message: t("ui.useworkspacefilestorageFileDownloadIsNotAvailableInThisEnvironment"),
          variant: "error"
        });
        return;
      }

      linkedHandleRef.current = null;
      lastLoadedPayloadRef.current = payload;
      setStatusBase((current) => createDownloadedWorkspaceFileStatus(current, fileName, payload));
      notifyToast("Workspace file downloaded", {
        message: fileName,
        variant: "success"
      });
    })();
  }, [notifyToast, store]);

  const saveWorkspaceFileNow = useCallback((): void => {
    const handle = linkedHandleRef.current;
    if (handle !== null) {
      void (async () => {
        setStatusBase((current) => ({ ...current, isSaving: true, message: t("ui.useworkspacefilestorageSavingLinkedWorkspaceFileNow") }));
        const result = await writeCurrentStateToHandle(handle, { ignoreConflict: false });
        if (result === "saved") {
          notifyToast("Workspace file saved", {
            message: handle.name,
            variant: "success"
          });
        } else if (result === "conflict") {
          notifyToast("Workspace file conflict", {
            message: t("ui.useworkspacefilestorageTheLinkedFileChangedOutsideThisTab"),
            variant: "warning"
          });
        } else {
          notifyToast("Workspace file not saved", {
            message: t("ui.useworkspacefilestorageTheLinkedFileCouldNotBeWritten"),
            variant: "error"
          });
        }
      })();
      return;
    }

    saveWorkspaceFileAs();
  }, [notifyToast, saveWorkspaceFileAs, writeCurrentStateToHandle]);

  const unlinkWorkspaceFile = useCallback((): void => {
    linkedHandleRef.current = null;
    void clearStoredWorkspaceFileHandle();
    setStatusBase(createLocalWorkspaceFileStatus());
    notifyToast("Workspace file unlinked", {
      message: t("ui.useworkspacefilestorageLocalBrowserPersistenceRemainsActive"),
      variant: "info"
    });
  }, [notifyToast]);

  const openLinkedWorkspaceFile = useCallback((): void => {
    const handle = linkedHandleRef.current;
    if (handle === null) {
      notifyToast("Workspace file cannot be opened", {
        message: t("ui.useworkspacefilestorageTheBrowserDoesNotCurrentlyHaveALinkedFileHandle"),
        variant: "warning"
      });
      return;
    }

    void openWorkspaceHandleWithFeedback({
      handle,
      blockedMessage: "The browser blocked opening the linked file in a new tab.",
      unavailableMessage: "The linked file could not be read. It may have been moved or deleted; relink it from Workspace storage.",
      notifyToast,
      onUnavailable: () => {
        setStatusBase((current) => ({
          ...current,
          fileAvailability: "unavailable",
          message: t("ui.useworkspacefilestorageTheLinkedFileCouldNotBeReadItMayHave")
        }));
      }
    });
  }, [notifyToast]);

  const openResumableWorkspaceFile = useCallback((): void => {
    void (async () => {
      const handle = linkedHandleRef.current ?? await readStoredWorkspaceFileHandle();
      if (handle === null) {
        notifyToast("Workspace file cannot be opened", {
          message: t("ui.useworkspacefilestorageNoResumableWorkspaceFileHandleIsAvailableInThisBrowser"),
          variant: "warning"
        });
        return;
      }

      await openWorkspaceHandleWithFeedback({
        handle,
        blockedMessage: "The browser blocked opening the workspace file in a new tab.",
        unavailableMessage: "The resumable file could not be read. It may have been moved or deleted; relink it from Workspace storage.",
        notifyToast,
        onUnavailable: () => {
          setStatusBase((current) => ({
            ...current,
            fileAvailability: "unavailable",
            resumeStatus: "unavailable",
            message: t("ui.useworkspacefilestorageTheResumableFileCouldNotBeReadItMayHave")
          }));
        }
      });
    })();
  }, [notifyToast]);

  const loadLinkedFileVersion = useCallback((): void => {
    const handle = linkedHandleRef.current;
    if (handle === null) {
      return;
    }

    void (async () => {
      await applyWorkspaceFile(await readHandleText(handle), handle.name, handle);
    })();
  }, [applyWorkspaceFile]);

  const keepLocalWorkspaceVersion = useCallback((): void => {
    const handle = linkedHandleRef.current;
    if (handle === null) {
      return;
    }

    void (async () => {
      setStatusBase((current) => ({ ...current, isSaving: true, message: t("ui.useworkspacefilestorageOverwritingLinkedFileWithLocalWorkspace") }));
      const result = await writeCurrentStateToHandle(handle, { ignoreConflict: true });
      if (result === "failed") {
        notifyToast("Workspace file not saved", {
          message: t("ui.useworkspacefilestorageTheLinkedFileCouldNotBeOverwritten"),
          variant: "error"
        });
        return;
      }
      notifyToast("Workspace file overwritten", {
        message: handle.name,
        variant: "success"
      });
    })();
  }, [notifyToast, writeCurrentStateToHandle]);

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current !== null) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return store.subscribe(() => {
      const handle = linkedHandleRef.current;
      if (handle === null || isWritingRef.current) {
        return;
      }

      if (autosaveTimerRef.current !== null) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(() => {
        const currentHandle = linkedHandleRef.current;
        if (currentHandle === null) {
          return;
        }

        void (async () => {
          isWritingRef.current = true;
          setStatusBase((current) => ({ ...current, isSaving: true, message: current.message }));
          try {
            const result = await writeCurrentStateToHandle(currentHandle);
            if (result === "failed") {
              setStatusBase((current) => ({
                ...current,
                isSaving: false,
                message: t("ui.useworkspacefilestorageAutosaveToTheLinkedWorkspaceFileFailedLocalBrowserPersistence")
              }));
            }
          } catch {
            setStatusBase((current) => ({
              ...current,
              isSaving: false,
              message: t("ui.useworkspacefilestorageAutosaveToTheLinkedWorkspaceFileFailedLocalBrowserPersistence")
            }));
          } finally {
            isWritingRef.current = false;
          }
        })();
      }, AUTOSAVE_DELAY_MS);
    });
  }, [store, writeCurrentStateToHandle]);

  return {
    workspaceFileInputRef,
    workspaceFileStatus: status,
    openWorkspaceFile,
    relinkWorkspaceFile,
    resumeWorkspaceFile,
    saveWorkspaceFileNow,
    saveWorkspaceFileAs,
    unlinkWorkspaceFile,
    openLinkedWorkspaceFile,
    openResumableWorkspaceFile,
    loadLinkedFileVersion,
    keepLocalWorkspaceVersion,
    handleWorkspaceFileInputChange
  };
}

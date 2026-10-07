import { translateCurrent as t } from "../lib/i18n";
import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import type { AppStore } from "../../store";
import type { WorkspaceFileHandle } from "../lib/workspaceFileAccess";
import { AUTOSAVE_DELAY_MS, createLocalWorkspaceFileStatus, type WorkspaceFileStatusBase } from "../lib/workspaceFileStorageStatus";
import { getWorkspaceSessionToken, isWorkspacePersistenceSuspended } from "../lib/workspaceSessionGate";

interface UseLinkedWorkspaceFileAutosaveParams {
  store: AppStore;
  linkedHandleRef: MutableRefObject<WorkspaceFileHandle | null>;
  linkedSessionTokenRef: MutableRefObject<number>;
  autosaveTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  isWritingRef: MutableRefObject<boolean>;
  setStatusBase: Dispatch<SetStateAction<WorkspaceFileStatusBase>>;
  writeCurrentStateToHandle: (handle: WorkspaceFileHandle) => Promise<"saved" | "conflict" | "failed">;
}

/**
 * Debounced autosave to a linked standalone workspace file. It is suspended while a historical
 * version is consulted, and the link is dropped when the named-workspace session changes so a
 * delayed write can never put another workspace's state into this file.
 */
export function useLinkedWorkspaceFileAutosave({
  store,
  linkedHandleRef,
  linkedSessionTokenRef,
  autosaveTimerRef,
  isWritingRef,
  setStatusBase,
  writeCurrentStateToHandle
}: UseLinkedWorkspaceFileAutosaveParams): void {
  useEffect(() => {
    const detachIfSessionChanged = (): boolean => {
      const stale = linkedHandleRef.current !== null && linkedSessionTokenRef.current !== getWorkspaceSessionToken();
      if (stale) {
        linkedHandleRef.current = null;
        setStatusBase({ ...createLocalWorkspaceFileStatus(), message: t("ui.workspaceLineageLinkedFileDetached") });
      }
      return stale;
    };
    const reportAutosaveFailure = (): void => {
      setStatusBase((current) => ({
        ...current,
        isSaving: false,
        message: t("ui.useworkspacefilestorageAutosaveToTheLinkedWorkspaceFileFailedLocalBrowserPersistence")
      }));
    };
    return store.subscribe(() => {
      const handle = linkedHandleRef.current;
      if (handle === null || isWritingRef.current || isWorkspacePersistenceSuspended() || detachIfSessionChanged()) {
        return;
      }

      if (autosaveTimerRef.current !== null) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(() => {
        const currentHandle = linkedHandleRef.current;
        if (currentHandle === null || isWorkspacePersistenceSuspended() || detachIfSessionChanged()) {
          return;
        }

        void (async () => {
          isWritingRef.current = true;
          setStatusBase((current) => ({ ...current, isSaving: true, message: current.message }));
          try {
            if ((await writeCurrentStateToHandle(currentHandle)) === "failed") {
              reportAutosaveFailure();
            }
          } catch {
            reportAutosaveFailure();
          } finally {
            isWritingRef.current = false;
          }
        })();
      }, AUTOSAVE_DELAY_MS);
    });
  }, [autosaveTimerRef, isWritingRef, linkedHandleRef, linkedSessionTokenRef, setStatusBase, store, writeCurrentStateToHandle]);
}

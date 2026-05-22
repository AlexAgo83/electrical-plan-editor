import { useRef } from "react";
import type { BeforeInstallPromptEventLike } from "../useWorkspaceShellChrome";

export function useAppControllerRefs() {
  return {
    panStartRef: useRef<{
      clientX: number;
      clientY: number;
      offsetX: number;
      offsetY: number;
    } | null>(null),
    undoActionRef: useRef<() => void>(() => {}),
    redoActionRef: useRef<() => void>(() => {}),
    exportActiveNetworkRef: useRef<() => void>(() => {}),
    fitNetworkToContentRef: useRef<() => void>(() => {}),
    previousValidationIssueRef: useRef<() => void>(() => {}),
    nextValidationIssueRef: useRef<() => void>(() => {}),
    navigationDrawerRef: useRef<HTMLDivElement | null>(null),
    navigationToggleButtonRef: useRef<HTMLButtonElement | null>(null),
    operationsPanelRef: useRef<HTMLDivElement | null>(null),
    operationsButtonRef: useRef<HTMLButtonElement | null>(null),
    deferredInstallPromptRef: useRef<BeforeInstallPromptEventLike | null>(null)
  };
}

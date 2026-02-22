import { useEffect, type MutableRefObject } from "react";

type ScreenId = "home" | "networkScope" | "modeling" | "analysis" | "validation" | "settings";
type SubScreenId = "connector" | "splice" | "node" | "segment" | "wire";

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }

  return target.isContentEditable;
}

interface UseKeyboardShortcutsOptions {
  keyboardShortcutsEnabled: boolean;
  activeScreenRef: MutableRefObject<ScreenId>;
  undoActionRef: MutableRefObject<() => void>;
  redoActionRef: MutableRefObject<() => void>;
  fitNetworkToContentRef: MutableRefObject<() => void>;
  previousValidationIssueRef: MutableRefObject<() => void>;
  nextValidationIssueRef: MutableRefObject<() => void>;
  setActiveScreen: (screen: ScreenId) => void;
  setActiveSubScreen: (subScreen: SubScreenId) => void;
}

export function useKeyboardShortcuts({
  keyboardShortcutsEnabled,
  activeScreenRef,
  undoActionRef,
  redoActionRef,
  fitNetworkToContentRef,
  previousValidationIssueRef,
  nextValidationIssueRef,
  setActiveScreen,
  setActiveSubScreen
}: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    if (!keyboardShortcutsEnabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (isEditableElement(event.target)) {
        return;
      }

      const normalizedKey = event.key.toLocaleLowerCase();
      const hasCommandModifier = event.metaKey || event.ctrlKey;
      if (hasCommandModifier) {
        if (normalizedKey === "z") {
          event.preventDefault();
          if (event.shiftKey) {
            redoActionRef.current();
            return;
          }

          undoActionRef.current();
          return;
        }

        if (normalizedKey === "y") {
          event.preventDefault();
          redoActionRef.current();
        }
        return;
      }

      if (!event.altKey) {
        return;
      }

      if (event.shiftKey) {
        const subScreenByKey: Record<string, SubScreenId | undefined> = {
          "1": "connector",
          "2": "splice",
          "3": "node",
          "4": "segment",
          "5": "wire"
        };
        const targetSubScreen = subScreenByKey[normalizedKey];
        if (targetSubScreen !== undefined) {
          event.preventDefault();
          const nextScreenForSubScreen =
            activeScreenRef.current === "analysis" && (targetSubScreen === "node" || targetSubScreen === "segment")
              ? "modeling"
              : activeScreenRef.current === "analysis"
                ? "analysis"
                : "modeling";
          setActiveScreen(nextScreenForSubScreen);
          setActiveSubScreen(targetSubScreen);
          return;
        }
      } else {
        const screenByKey: Record<string, ScreenId | undefined> = {
          "1": "home",
          "2": "networkScope",
          "3": "modeling",
          "4": "analysis",
          "5": "validation",
          "6": "settings"
        };
        const targetScreen = screenByKey[normalizedKey];
        if (targetScreen !== undefined) {
          event.preventDefault();
          setActiveScreen(targetScreen);
          return;
        }
      }

      if (normalizedKey === "f") {
        if (activeScreenRef.current === "modeling" || activeScreenRef.current === "analysis") {
          event.preventDefault();
          fitNetworkToContentRef.current();
        }
        return;
      }

      if (normalizedKey === "j") {
        event.preventDefault();
        previousValidationIssueRef.current();
        return;
      }

      if (normalizedKey === "k") {
        event.preventDefault();
        nextValidationIssueRef.current();
        return;
      }

    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    activeScreenRef,
    fitNetworkToContentRef,
    keyboardShortcutsEnabled,
    nextValidationIssueRef,
    previousValidationIssueRef,
    redoActionRef,
    setActiveScreen,
    setActiveSubScreen,
    undoActionRef
  ]);
}

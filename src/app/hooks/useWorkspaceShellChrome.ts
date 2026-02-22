import { useCallback, useEffect, useRef, useState, type MutableRefObject, type RefObject } from "react";
import { applyRegisteredServiceWorkerUpdate } from "../pwa/registerServiceWorker";

export interface BeforeInstallPromptEventLike extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

interface UseWorkspaceShellChromeArgs {
  activeScreen: "networkScope" | "modeling" | "analysis" | "validation" | "settings";
  setActiveScreen: (screen: "networkScope" | "modeling" | "analysis" | "validation" | "settings") => void;
  navigationDrawerRef: RefObject<HTMLDivElement | null>;
  navigationToggleButtonRef: RefObject<HTMLButtonElement | null>;
  operationsPanelRef: RefObject<HTMLDivElement | null>;
  operationsButtonRef: RefObject<HTMLButtonElement | null>;
  deferredInstallPromptRef: MutableRefObject<BeforeInstallPromptEventLike | null>;
}

export function useWorkspaceShellChrome({
  activeScreen,
  setActiveScreen,
  navigationDrawerRef,
  navigationToggleButtonRef,
  operationsPanelRef,
  operationsButtonRef,
  deferredInstallPromptRef
}: UseWorkspaceShellChromeArgs) {
  const [isInstallPromptAvailable, setIsInstallPromptAvailable] = useState(false);
  const [isPwaUpdateReady, setIsPwaUpdateReady] = useState(false);
  const [isNavigationDrawerOpen, setIsNavigationDrawerOpen] = useState(false);
  const [isOperationsPanelOpen, setIsOperationsPanelOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth
  );
  const [isDialogFocusActive, setIsDialogFocusActive] = useState(false);
  const previousNonSettingsScreenRef = useRef<"networkScope" | "modeling" | "analysis" | "validation">("modeling");

  useEffect(() => {
    if (activeScreen !== "settings") {
      previousNonSettingsScreenRef.current = activeScreen;
    }
  }, [activeScreen]);

  const closeNavigationDrawer = useCallback(() => {
    setIsNavigationDrawerOpen(false);
  }, []);

  const handleToggleNavigationDrawer = useCallback(() => {
    setIsNavigationDrawerOpen((current) => {
      const next = !current;
      if (next) {
        setIsOperationsPanelOpen(false);
      }
      return next;
    });
  }, []);

  const closeOperationsPanel = useCallback(() => {
    setIsOperationsPanelOpen(false);
  }, []);

  const handleToggleOperationsPanel = useCallback(() => {
    setIsOperationsPanelOpen((current) => {
      const next = !current;
      if (next) {
        setIsNavigationDrawerOpen(false);
      }
      return next;
    });
  }, []);

  const handleOpenSettingsScreen = useCallback(() => {
    if (activeScreen === "settings") {
      setActiveScreen(previousNonSettingsScreenRef.current);
    } else {
      setActiveScreen("settings");
    }
    setIsNavigationDrawerOpen(false);
    setIsOperationsPanelOpen(false);
  }, [activeScreen, setActiveScreen]);

  const handleInstallApp = useCallback(() => {
    const promptEvent = deferredInstallPromptRef.current;
    if (promptEvent === null) {
      return;
    }

    void (async () => {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        deferredInstallPromptRef.current = null;
        setIsInstallPromptAvailable(false);
      }
    })();
  }, [deferredInstallPromptRef]);

  const handleApplyPwaUpdate = useCallback(() => {
    void (async () => {
      await applyRegisteredServiceWorkerUpdate();
      setIsPwaUpdateReady(false);
    })();
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event): void => {
      const promptEvent = event as BeforeInstallPromptEventLike;
      if (typeof promptEvent.prompt !== "function") {
        return;
      }

      promptEvent.preventDefault();
      deferredInstallPromptRef.current = promptEvent;
      setIsInstallPromptAvailable(true);
    };

    const handleAppInstalled = (): void => {
      deferredInstallPromptRef.current = null;
      setIsInstallPromptAvailable(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [deferredInstallPromptRef]);

  useEffect(() => {
    const handlePwaUpdateAvailable = (): void => {
      setIsPwaUpdateReady(true);
    };

    const handlePwaRegistrationError = (): void => {
      setIsPwaUpdateReady(false);
    };

    window.addEventListener("app:pwa-update-available", handlePwaUpdateAvailable);
    window.addEventListener("app:pwa-registration-error", handlePwaRegistrationError);
    return () => {
      window.removeEventListener("app:pwa-update-available", handlePwaUpdateAvailable);
      window.removeEventListener("app:pwa-registration-error", handlePwaRegistrationError);
    };
  }, []);

  useEffect(() => {
    if (!isNavigationDrawerOpen) {
      return;
    }

    const handlePointerInteraction = (event: MouseEvent | TouchEvent): void => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (navigationDrawerRef.current?.contains(event.target)) {
        return;
      }

      if (navigationToggleButtonRef.current?.contains(event.target)) {
        return;
      }

      setIsNavigationDrawerOpen(false);
    };

    const handleFocusIn = (event: FocusEvent): void => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (navigationDrawerRef.current?.contains(event.target)) {
        return;
      }

      if (navigationToggleButtonRef.current?.contains(event.target)) {
        return;
      }

      setIsNavigationDrawerOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }

      setIsNavigationDrawerOpen(false);
      navigationToggleButtonRef.current?.focus();
    };

    document.addEventListener("mousedown", handlePointerInteraction);
    document.addEventListener("touchstart", handlePointerInteraction, { passive: true });
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerInteraction);
      document.removeEventListener("touchstart", handlePointerInteraction);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNavigationDrawerOpen, navigationDrawerRef, navigationToggleButtonRef]);

  useEffect(() => {
    if (!isOperationsPanelOpen) {
      return;
    }

    const handlePointerInteraction = (event: MouseEvent | TouchEvent): void => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (operationsPanelRef.current?.contains(event.target)) {
        return;
      }

      if (operationsButtonRef.current?.contains(event.target)) {
        return;
      }

      setIsOperationsPanelOpen(false);
    };

    const handleFocusIn = (event: FocusEvent): void => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (operationsPanelRef.current?.contains(event.target)) {
        return;
      }

      if (operationsButtonRef.current?.contains(event.target)) {
        return;
      }

      setIsOperationsPanelOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }

      setIsOperationsPanelOpen(false);
      operationsButtonRef.current?.focus();
    };

    document.addEventListener("mousedown", handlePointerInteraction);
    document.addEventListener("touchstart", handlePointerInteraction, { passive: true });
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerInteraction);
      document.removeEventListener("touchstart", handlePointerInteraction);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOperationsPanelOpen, operationsButtonRef, operationsPanelRef]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = (): void => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const updateDialogFocusState = (): void => {
      const activeElement = document.activeElement;
      if (!(activeElement instanceof HTMLElement)) {
        setIsDialogFocusActive(false);
        return;
      }

      setIsDialogFocusActive(activeElement.closest('[role="dialog"], [aria-modal="true"]') !== null);
    };

    updateDialogFocusState();
    document.addEventListener("focusin", updateDialogFocusState);
    return () => {
      document.removeEventListener("focusin", updateDialogFocusState);
    };
  }, []);

  return {
    isInstallPromptAvailable,
    isPwaUpdateReady,
    isNavigationDrawerOpen,
    isOperationsPanelOpen,
    viewportWidth,
    isDialogFocusActive,
    closeNavigationDrawer,
    handleToggleNavigationDrawer,
    closeOperationsPanel,
    handleToggleOperationsPanel,
    handleOpenSettingsScreen,
    handleInstallApp,
    handleApplyPwaUpdate
  };
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ONBOARDING_STEPS,
  getOnboardingStepById,
  readOnboardingAutoOpenEnabled,
  writeOnboardingAutoOpenEnabled,
  type OnboardingStepDefinition,
  type OnboardingStepId
} from "../../lib/onboarding";
import type { SubScreenId } from "../../types/app-controller";

type ScreenId = "home" | "networkScope" | "modeling" | "analysis" | "validation" | "settings";
type OnboardingStepTarget = OnboardingStepDefinition["target"];

interface OnboardingTargetAction {
  label: string;
  onClick: () => void;
}

interface UseOnboardingControllerOptions {
  activeScreen: ScreenId;
  activeSubScreen: SubScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  setActiveSubScreen: (subScreen: SubScreenId) => void;
}

interface UseOnboardingControllerResult {
  openFullOnboarding: () => void;
  openSingleStepOnboarding: (stepId: OnboardingStepId, targetOverride?: OnboardingStepTarget) => void;
  activeOnboardingStep: OnboardingStepDefinition | undefined;
  isOnboardingOpen: boolean;
  onboardingModalMode: "full" | "single";
  onboardingStepIndex: number;
  onboardingStepDisplayIndex: number;
  onboardingTotalSteps: number;
  onboardingAutoOpenEnabled: boolean;
  setOnboardingAutoOpenEnabledPersisted: (enabled: boolean) => void;
  closeOnboarding: () => void;
  handleOnboardingNext: () => void;
  canGoNext: boolean;
  onboardingTargetActions: OnboardingTargetAction[];
}

export function useOnboardingController({
  activeScreen,
  activeSubScreen,
  setActiveScreen,
  setActiveSubScreen
}: UseOnboardingControllerOptions): UseOnboardingControllerResult {
  const onboardingAutoOpenAttemptedRef = useRef(false);
  const pendingOnboardingFocusRequestRef = useRef<{ rafId: number | null; canceled: boolean } | null>(null);
  const [onboardingModalMode, setOnboardingModalMode] = useState<"full" | "single">("full");
  const [onboardingStepIndex, setOnboardingStepIndex] = useState(0);
  const [onboardingSingleStepId, setOnboardingSingleStepId] = useState<OnboardingStepId>("networkScope");
  const [onboardingSingleStepTargetOverride, setOnboardingSingleStepTargetOverride] = useState<OnboardingStepTarget | null>(
    null
  );
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingAutoOpenEnabled, setOnboardingAutoOpenEnabled] = useState<boolean>(() => readOnboardingAutoOpenEnabled());

  const setOnboardingAutoOpenEnabledPersisted = useCallback((enabled: boolean) => {
    setOnboardingAutoOpenEnabled(enabled);
    writeOnboardingAutoOpenEnabled(enabled);
  }, []);

  const cancelPendingOnboardingTargetFocus = useCallback(() => {
    const pendingRequest = pendingOnboardingFocusRequestRef.current;
    if (pendingRequest === null) {
      return;
    }
    pendingRequest.canceled = true;
    if (pendingRequest.rafId !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(pendingRequest.rafId);
    }
    pendingOnboardingFocusRequestRef.current = null;
  }, []);

  const openFullOnboarding = useCallback(() => {
    cancelPendingOnboardingTargetFocus();
    setOnboardingModalMode("full");
    setOnboardingStepIndex(0);
    setOnboardingSingleStepTargetOverride(null);
    setIsOnboardingOpen(true);
  }, [cancelPendingOnboardingTargetFocus]);

  const openSingleStepOnboarding = useCallback((stepId: OnboardingStepId, targetOverride?: OnboardingStepTarget) => {
    cancelPendingOnboardingTargetFocus();
    setOnboardingModalMode("single");
    setOnboardingSingleStepId(stepId);
    setOnboardingSingleStepTargetOverride(targetOverride ?? null);
    setIsOnboardingOpen(true);
  }, [cancelPendingOnboardingTargetFocus]);

  useEffect(() => {
    if (onboardingAutoOpenAttemptedRef.current) {
      return;
    }
    onboardingAutoOpenAttemptedRef.current = true;
    if (!onboardingAutoOpenEnabled) {
      return;
    }
    openFullOnboarding();
  }, [onboardingAutoOpenEnabled, openFullOnboarding]);

  const focusOnboardingTargetPanel = useCallback((panelSelector: string) => {
    if (typeof document === "undefined") {
      return;
    }

    cancelPendingOnboardingTargetFocus();
    const focusRequest = { rafId: null as number | null, canceled: false };
    pendingOnboardingFocusRequestRef.current = focusRequest;
    let attempts = 0;

    const clearFocusRequest = () => {
      if (pendingOnboardingFocusRequestRef.current === focusRequest) {
        pendingOnboardingFocusRequestRef.current = null;
      }
      focusRequest.rafId = null;
      focusRequest.canceled = true;
    };

    const tryFocus = () => {
      focusRequest.rafId = null;
      if (focusRequest.canceled || pendingOnboardingFocusRequestRef.current !== focusRequest) {
        return;
      }
      const panel = document.querySelector(panelSelector);
      if (panel instanceof HTMLElement) {
        panel.scrollIntoView({ block: "start", behavior: "smooth" });
        const focusTarget =
          panel.querySelector<HTMLElement>("button, [tabindex], input, select, textarea") ??
          panel.querySelector<HTMLElement>("h2");
        focusTarget?.focus?.();
        clearFocusRequest();
        return;
      }

      attempts += 1;
      if (attempts < 10 && typeof window !== "undefined") {
        focusRequest.rafId = window.requestAnimationFrame(tryFocus);
        return;
      }
      clearFocusRequest();
    };

    if (typeof window !== "undefined") {
      focusRequest.rafId = window.requestAnimationFrame(tryFocus);
    } else {
      tryFocus();
    }
  }, [cancelPendingOnboardingTargetFocus]);

  useEffect(() => () => {
    cancelPendingOnboardingTargetFocus();
  }, [cancelPendingOnboardingTargetFocus]);

  const activeOnboardingStep =
    onboardingModalMode === "full" ? ONBOARDING_STEPS[onboardingStepIndex] : getOnboardingStepById(onboardingSingleStepId);
  const activeOnboardingPrimaryTarget =
    onboardingModalMode === "single" && onboardingSingleStepTargetOverride !== null
      ? onboardingSingleStepTargetOverride
      : activeOnboardingStep?.target;

  const isOnboardingStepAlreadyInContext =
    activeOnboardingPrimaryTarget !== undefined &&
    activeScreen === activeOnboardingPrimaryTarget.screen &&
    (activeOnboardingPrimaryTarget.subScreen === undefined || activeSubScreen === activeOnboardingPrimaryTarget.subScreen);

  const openOnboardingTarget = useCallback(
    (target: OnboardingStepTarget) => {
      if (target.screen === "networkScope") {
        setActiveScreen("networkScope");
      } else if (target.screen === "settings") {
        setActiveScreen("settings");
      } else {
        setActiveScreen("modeling");
        if (target.subScreen !== undefined) {
          setActiveSubScreen(target.subScreen);
        }
      }

      focusOnboardingTargetPanel(target.panelSelector);
    },
    [focusOnboardingTargetPanel, setActiveScreen, setActiveSubScreen]
  );

  const handleOnboardingOpenTarget = useCallback(() => {
    if (activeOnboardingPrimaryTarget === undefined) {
      return;
    }
    openOnboardingTarget(activeOnboardingPrimaryTarget);
  }, [activeOnboardingPrimaryTarget, openOnboardingTarget]);

  const onboardingConnectorSpliceTargetActions = useMemo(() => {
    if (activeOnboardingStep?.id !== "connectorSpliceLibrary") {
      return null;
    }
    const connectorsTarget: OnboardingStepTarget = {
      screen: "modeling",
      subScreen: "connector",
      panelSelector: '[data-onboarding-panel="modeling-connectors"]',
      panelLabel: "Connectors"
    };
    const splicesTarget: OnboardingStepTarget = {
      screen: "modeling",
      subScreen: "splice",
      panelSelector: '[data-onboarding-panel="modeling-splices"]',
      panelLabel: "Splices"
    };
    const primaryIsSplices = activeOnboardingPrimaryTarget?.subScreen === "splice";
    const primaryTarget = primaryIsSplices ? splicesTarget : connectorsTarget;
    const secondaryTarget = primaryIsSplices ? connectorsTarget : splicesTarget;
    const isPrimaryAlreadyInContext =
      activeScreen === primaryTarget.screen &&
      (primaryTarget.subScreen === undefined || activeSubScreen === primaryTarget.subScreen);
    const isSecondaryAlreadyInContext =
      activeScreen === secondaryTarget.screen &&
      (secondaryTarget.subScreen === undefined || activeSubScreen === secondaryTarget.subScreen);
    return [
      {
        label: isPrimaryAlreadyInContext ? `Scroll to ${primaryTarget.panelLabel}` : `Open ${primaryTarget.panelLabel}`,
        onClick: () => openOnboardingTarget(primaryTarget)
      },
      {
        label: isSecondaryAlreadyInContext
          ? `Scroll to ${secondaryTarget.panelLabel}`
          : `Open ${secondaryTarget.panelLabel}`,
        onClick: () => openOnboardingTarget(secondaryTarget)
      }
    ];
  }, [activeOnboardingPrimaryTarget?.subScreen, activeOnboardingStep?.id, activeScreen, activeSubScreen, openOnboardingTarget]);

  const onboardingCatalogTargetActions = useMemo(() => {
    if (activeOnboardingStep?.id !== "catalog") {
      return null;
    }
    const catalogListTarget: OnboardingStepTarget = {
      screen: "modeling",
      subScreen: "catalog",
      panelSelector: '[data-onboarding-panel="modeling-catalog"]',
      panelLabel: "Catalog"
    };
    const isListInContext = activeScreen === catalogListTarget.screen && activeSubScreen === catalogListTarget.subScreen;
    return [
      {
        label: isListInContext ? "Scroll to Catalog" : "Open Catalog",
        onClick: () => openOnboardingTarget(catalogListTarget)
      }
    ];
  }, [activeOnboardingStep?.id, activeScreen, activeSubScreen, openOnboardingTarget]);

  const onboardingTargetActionLabel =
    activeOnboardingPrimaryTarget === undefined
      ? "Open target"
      : isOnboardingStepAlreadyInContext
        ? `Scroll to ${activeOnboardingPrimaryTarget.panelLabel}`
        : `Open ${activeOnboardingPrimaryTarget.panelLabel}`;

  const onboardingTargetActions = useMemo(() => {
    if (activeOnboardingStep === undefined) {
      return [] as OnboardingTargetAction[];
    }
    if (activeOnboardingStep.id === "catalog") {
      return onboardingCatalogTargetActions ?? [];
    }
    if (activeOnboardingStep.id === "connectorSpliceLibrary") {
      return onboardingConnectorSpliceTargetActions ?? [];
    }
    return [{ label: onboardingTargetActionLabel, onClick: handleOnboardingOpenTarget }];
  }, [
    activeOnboardingStep,
    handleOnboardingOpenTarget,
    onboardingCatalogTargetActions,
    onboardingConnectorSpliceTargetActions,
    onboardingTargetActionLabel
  ]);

  const handleOnboardingNext = useCallback(() => {
    if (onboardingModalMode !== "full") {
      cancelPendingOnboardingTargetFocus();
      setIsOnboardingOpen(false);
      return;
    }

    setOnboardingStepIndex((current) => {
      if (current >= ONBOARDING_STEPS.length - 1) {
        cancelPendingOnboardingTargetFocus();
        setIsOnboardingOpen(false);
        return current;
      }
      return current + 1;
    });
  }, [cancelPendingOnboardingTargetFocus, onboardingModalMode]);

  const closeOnboarding = useCallback(() => {
    cancelPendingOnboardingTargetFocus();
    setIsOnboardingOpen(false);
  }, [cancelPendingOnboardingTargetFocus]);

  const onboardingStepDisplayIndex =
    onboardingModalMode === "full"
      ? onboardingStepIndex
      : activeOnboardingStep === undefined
        ? 0
        : ONBOARDING_STEPS.findIndex((step) => step.id === activeOnboardingStep.id);

  return {
    openFullOnboarding,
    openSingleStepOnboarding,
    activeOnboardingStep,
    isOnboardingOpen,
    onboardingModalMode,
    onboardingStepIndex,
    onboardingStepDisplayIndex,
    onboardingTotalSteps: ONBOARDING_STEPS.length,
    onboardingAutoOpenEnabled,
    setOnboardingAutoOpenEnabledPersisted,
    closeOnboarding,
    handleOnboardingNext,
    canGoNext: onboardingModalMode !== "full" || onboardingStepIndex < ONBOARDING_STEPS.length - 1,
    onboardingTargetActions
  };
}

export type OnboardingControllerModel = ReturnType<typeof useOnboardingController>;

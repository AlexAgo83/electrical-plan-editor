import type { ReactElement } from "react";
import { ConfirmDialog } from "../dialogs/ConfirmDialog";
import { OnboardingModal } from "../onboarding/OnboardingModal";
import type { ActiveConfirmDialogState } from "../../hooks/controller/useConfirmDialogController";
import type { OnboardingControllerModel } from "../../hooks/controller/useOnboardingController";

interface AppControllerOverlaysProps {
  appShellClassName: string;
  activeConfirmDialog: ActiveConfirmDialogState | null;
  closeActiveConfirmDialog: (confirmed: boolean) => void;
  onboarding: Pick<
    OnboardingControllerModel,
    | "activeOnboardingStep"
    | "isOnboardingOpen"
    | "onboardingModalMode"
    | "onboardingStepDisplayIndex"
    | "onboardingTotalSteps"
    | "onboardingAutoOpenEnabled"
    | "setOnboardingAutoOpenEnabledPersisted"
    | "closeOnboarding"
    | "handleOnboardingNext"
    | "canGoNext"
    | "onboardingTargetActions"
  >;
}

export function AppControllerOverlays({
  appShellClassName,
  activeConfirmDialog,
  closeActiveConfirmDialog,
  onboarding
}: AppControllerOverlaysProps): ReactElement | null {
  if (activeConfirmDialog === null && onboarding.activeOnboardingStep === undefined) {
    return null;
  }

  return (
    <>
      {activeConfirmDialog !== null ? (
        <ConfirmDialog
          isOpen={activeConfirmDialog !== null}
          themeHostClassName={appShellClassName}
          title={activeConfirmDialog.title}
          message={activeConfirmDialog.message}
          details={activeConfirmDialog.details}
          confirmLabel={activeConfirmDialog.confirmLabel}
          cancelLabel={activeConfirmDialog.cancelLabel}
          intent={activeConfirmDialog.intent}
          closeOnBackdrop={activeConfirmDialog.closeOnBackdrop}
          onConfirm={() => closeActiveConfirmDialog(true)}
          onCancel={() => closeActiveConfirmDialog(false)}
        />
      ) : null}
      {onboarding.activeOnboardingStep !== undefined ? (
        <OnboardingModal
          isOpen={onboarding.isOnboardingOpen}
          themeHostClassName={appShellClassName}
          mode={onboarding.onboardingModalMode}
          step={onboarding.activeOnboardingStep}
          stepIndex={onboarding.onboardingStepDisplayIndex}
          totalSteps={onboarding.onboardingTotalSteps}
          autoOpenEnabled={onboarding.onboardingAutoOpenEnabled}
          onSetAutoOpenEnabled={onboarding.setOnboardingAutoOpenEnabledPersisted}
          onClose={onboarding.closeOnboarding}
          onNext={onboarding.handleOnboardingNext}
          canGoNext={onboarding.canGoNext}
          targetActions={onboarding.onboardingTargetActions}
        />
      ) : null}
    </>
  );
}

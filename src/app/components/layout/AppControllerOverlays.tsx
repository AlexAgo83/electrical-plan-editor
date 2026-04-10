import type { ReactElement } from "react";
import { ConfirmDialog } from "../dialogs/ConfirmDialog";
import { ChoiceDialog } from "../dialogs/ChoiceDialog";
import { DeleteImpactDialog } from "../dialogs/DeleteImpactDialog";
import { OnboardingModal } from "../onboarding/OnboardingModal";
import type { ActiveConfirmDialogState } from "../../hooks/controller/useConfirmDialogController";
import type { ActiveChoiceDialogState } from "../../hooks/controller/useChoiceDialogController";
import type { OnboardingControllerModel } from "../../hooks/controller/useOnboardingController";

interface AppControllerOverlaysProps {
  appShellClassName: string;
  activeConfirmDialog: ActiveConfirmDialogState | null;
  closeActiveConfirmDialog: (confirmed: boolean) => void;
  activeChoiceDialog: ActiveChoiceDialogState | null;
  closeActiveChoiceDialog: (choiceId: string | null) => void;
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
  activeChoiceDialog,
  closeActiveChoiceDialog,
  onboarding
}: AppControllerOverlaysProps): ReactElement | null {
  if (activeConfirmDialog === null && activeChoiceDialog === null && onboarding.activeOnboardingStep === undefined) {
    return null;
  }

  return (
    <>
      {activeChoiceDialog !== null ? (
        <ChoiceDialog
          isOpen={activeChoiceDialog !== null}
          themeHostClassName={appShellClassName}
          title={activeChoiceDialog.title}
          message={activeChoiceDialog.message}
          details={activeChoiceDialog.details}
          discardLabel={activeChoiceDialog.discardLabel}
          options={activeChoiceDialog.options}
          closeOnBackdrop={activeChoiceDialog.closeOnBackdrop}
          onChoose={closeActiveChoiceDialog}
        />
      ) : null}
      {activeConfirmDialog !== null ? (
        activeConfirmDialog.variant === "standard" ? (
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
            confirmOnEnter={activeConfirmDialog.confirmOnEnter}
            onConfirm={() => closeActiveConfirmDialog(true)}
            onCancel={() => closeActiveConfirmDialog(false)}
          />
        ) : (
          <DeleteImpactDialog
            isOpen={activeConfirmDialog !== null}
            themeHostClassName={appShellClassName}
            variant={activeConfirmDialog.variant}
            title={activeConfirmDialog.title}
            message={activeConfirmDialog.message}
            categories={activeConfirmDialog.summaryCategories}
            note={activeConfirmDialog.summaryNote}
            confirmLabel={activeConfirmDialog.confirmLabel}
            cancelLabel={activeConfirmDialog.cancelLabel}
            intent={activeConfirmDialog.intent}
            closeOnBackdrop={activeConfirmDialog.closeOnBackdrop}
            confirmOnEnter={activeConfirmDialog.confirmOnEnter}
            onConfirm={() => closeActiveConfirmDialog(true)}
            onCancel={() => closeActiveConfirmDialog(false)}
          />
        )
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

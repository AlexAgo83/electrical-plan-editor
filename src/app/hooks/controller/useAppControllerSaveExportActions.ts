import { translateCurrent as t } from "../../lib/i18n";
import { useCallback } from "react";
import type { NetworkId } from "../../../core/entities";
import { buildNetworkExportFilename } from "../useNetworkImportExport";
import { supportsNativeSaveFilePicker } from "../../lib/jsonFileExport";
import type { ConfirmDialogRequest } from "../../types/confirm-dialog";

interface UseAppControllerSaveExportActionsArgs {
  activeNetworkId: NetworkId | null;
  activeNetworkName?: string | null;
  activeNetworkTechnicalId?: string | null;
  getNetworkExportMetadata?: (networkId: NetworkId) => { name?: string | null; technicalId?: string | null };
  handleExportNetworks: (scope: "active" | "selected" | "all", exportedAtIso?: string) => void;
  handleExportNetwork: (networkId: NetworkId, exportedAtIso?: string) => void;
  requestConfirmation: (request: ConfirmDialogRequest) => Promise<boolean>;
}

export function useAppControllerSaveExportActions({
  activeNetworkId,
  activeNetworkName,
  activeNetworkTechnicalId,
  getNetworkExportMetadata,
  handleExportNetworks,
  handleExportNetwork,
  requestConfirmation
}: UseAppControllerSaveExportActionsArgs) {
  const handleSaveActiveNetworkWithConfirmation = useCallback(() => {
    if (activeNetworkId === null) {
      handleExportNetworks("active");
      return;
    }

    void (async () => {
      const exportedAtIso = new Date().toISOString();
      if (supportsNativeSaveFilePicker()) {
        handleExportNetworks("active", exportedAtIso);
        return;
      }

      const fileName = buildNetworkExportFilename("active", exportedAtIso, {
        networkName: activeNetworkName ?? undefined,
        networkTechnicalId: activeNetworkTechnicalId ?? undefined,
        networkCount: 1
      });
      const shouldSave = await requestConfirmation({
        title: t("ui.saveActiveNetwork"),
        message: t("ui.exportTheActiveNetworkNow"),
        details: fileName,
        confirmLabel: t("ui.save"),
        intent: "neutral"
      });
      if (!shouldSave) {
        return;
      }

        handleExportNetworks("active", exportedAtIso);
      })();
  }, [activeNetworkId, activeNetworkName, activeNetworkTechnicalId, handleExportNetworks, requestConfirmation]);

  const handleExportNetworksWithActiveSaveConfirmation = useCallback(
    (scope: "active" | "selected" | "all") => {
      if (scope !== "active") {
        handleExportNetworks(scope);
        return;
      }

      handleSaveActiveNetworkWithConfirmation();
    },
    [handleExportNetworks, handleSaveActiveNetworkWithConfirmation]
  );

  const handleSaveNetworkWithConfirmation = useCallback(
    (networkId: NetworkId) => {
      void (async () => {
        const exportedAtIso = new Date().toISOString();
        if (supportsNativeSaveFilePicker()) {
          handleExportNetwork(networkId, exportedAtIso);
          return;
        }

        const selectedNetworkMetadata = getNetworkExportMetadata?.(networkId);
        const fileName = buildNetworkExportFilename("selected", exportedAtIso, {
          networkName: selectedNetworkMetadata?.name ?? activeNetworkName ?? undefined,
          networkTechnicalId: selectedNetworkMetadata?.technicalId ?? activeNetworkTechnicalId ?? undefined,
          networkCount: 1
        });
        const shouldSave = await requestConfirmation({
          title: t("ui.useappcontrollersaveexportactionsSaveSelectedNetwork"),
          message: t("ui.useappcontrollersaveexportactionsExportTheSelectedNetworkNow"),
          details: fileName,
          confirmLabel: t("ui.save"),
          intent: "neutral"
        });
        if (!shouldSave) {
          return;
        }

        handleExportNetwork(networkId, exportedAtIso);
      })();
    },
    [activeNetworkName, activeNetworkTechnicalId, getNetworkExportMetadata, handleExportNetwork, requestConfirmation]
  );

  return {
    handleSaveActiveNetworkWithConfirmation,
    handleExportNetworksWithActiveSaveConfirmation,
    handleSaveNetworkWithConfirmation
  };
}

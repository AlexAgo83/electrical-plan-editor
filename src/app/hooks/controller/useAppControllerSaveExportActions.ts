import { useCallback } from "react";
import type { NetworkId } from "../../../core/entities";
import { buildNetworkExportFilename } from "../useNetworkImportExport";
import type { ConfirmDialogRequest } from "../../types/confirm-dialog";

interface UseAppControllerSaveExportActionsArgs {
  activeNetworkId: NetworkId | null;
  handleExportNetworks: (scope: "active" | "selected" | "all", exportedAtIso?: string) => void;
  handleExportNetwork: (networkId: NetworkId, exportedAtIso?: string) => void;
  requestConfirmation: (request: ConfirmDialogRequest) => Promise<boolean>;
}

export function useAppControllerSaveExportActions({
  activeNetworkId,
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
      const fileName = buildNetworkExportFilename("active", exportedAtIso);
      const shouldSave = await requestConfirmation({
        title: "Save active network",
        message: "Export the active network now?",
        details: fileName,
        confirmLabel: "Save",
        intent: "neutral"
      });
      if (!shouldSave) {
        return;
      }

      handleExportNetworks("active", exportedAtIso);
    })();
  }, [activeNetworkId, handleExportNetworks, requestConfirmation]);

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
        const fileName = buildNetworkExportFilename("selected", exportedAtIso);
        const shouldSave = await requestConfirmation({
          title: "Save selected network",
          message: "Export the selected network now?",
          details: fileName,
          confirmLabel: "Save",
          intent: "neutral"
        });
        if (!shouldSave) {
          return;
        }

        handleExportNetwork(networkId, exportedAtIso);
      })();
    },
    [handleExportNetwork, requestConfirmation]
  );

  return {
    handleSaveActiveNetworkWithConfirmation,
    handleExportNetworksWithActiveSaveConfirmation,
    handleSaveNetworkWithConfirmation
  };
}

import { useCallback } from "react";
import type { NetworkId } from "../../../core/entities";
import { buildNetworkExportFilename } from "../useNetworkImportExport";
import type { ConfirmDialogRequest } from "../../types/confirm-dialog";

interface UseAppControllerSaveExportActionsArgs {
  activeNetworkId: NetworkId | null;
  handleExportNetworks: (scope: "active" | "selected" | "all", exportedAtIso?: string) => void;
  requestConfirmation: (request: ConfirmDialogRequest) => Promise<boolean>;
}

export function useAppControllerSaveExportActions({
  activeNetworkId,
  handleExportNetworks,
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

  return {
    handleSaveActiveNetworkWithConfirmation,
    handleExportNetworksWithActiveSaveConfirmation
  };
}

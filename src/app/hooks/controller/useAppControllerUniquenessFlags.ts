import type { NetworkId } from "../../../core/entities";
import {
  selectCatalogManufacturerReferenceTaken,
  selectConnectorTechnicalIdTaken,
  selectNetworkTechnicalIdTaken,
  selectSpliceTechnicalIdTaken,
  selectWireTechnicalIdTaken,
  type AppState
} from "../../../store";
import type { AppControllerNamespacedFormsState, AppControllerFormsStateFlat } from "../useAppControllerNamespacedFormsState";

interface UseAppControllerUniquenessFlagsParams {
  state: AppState;
  forms: AppControllerNamespacedFormsState;
  formsState: Pick<AppControllerFormsStateFlat, "catalogFormMode" | "editingCatalogItemId" | "catalogManufacturerReference">;
  newNetworkTechnicalId: string;
  networkFormMode: "create" | "edit" | null;
  networkFormTargetId: NetworkId | null;
}

export function useAppControllerUniquenessFlags({
  state,
  forms,
  formsState,
  newNetworkTechnicalId,
  networkFormMode,
  networkFormTargetId
}: UseAppControllerUniquenessFlagsParams) {
  const connectorIdExcludedFromUniqueness =
    forms.connector.formMode === "edit" ? forms.connector.editingId ?? undefined : undefined;
  const connectorTechnicalIdAlreadyUsed =
    forms.connector.technicalId.trim().length > 0 &&
    selectConnectorTechnicalIdTaken(state, forms.connector.technicalId.trim(), connectorIdExcludedFromUniqueness);

  const spliceIdExcludedFromUniqueness =
    forms.splice.formMode === "edit" ? forms.splice.editingId ?? undefined : undefined;
  const spliceTechnicalIdAlreadyUsed =
    forms.splice.technicalId.trim().length > 0 &&
    selectSpliceTechnicalIdTaken(state, forms.splice.technicalId.trim(), spliceIdExcludedFromUniqueness);

  const catalogItemIdExcludedFromUniqueness =
    formsState.catalogFormMode === "edit" ? formsState.editingCatalogItemId ?? undefined : undefined;
  const catalogManufacturerReferenceAlreadyUsed =
    formsState.catalogManufacturerReference.trim().length > 0 &&
    selectCatalogManufacturerReferenceTaken(
      state,
      formsState.catalogManufacturerReference.trim(),
      catalogItemIdExcludedFromUniqueness
    );

  const wireIdExcludedFromUniqueness =
    forms.wire.formMode === "edit" ? forms.wire.editingId ?? undefined : undefined;
  const wireTechnicalIdAlreadyUsed =
    forms.wire.technicalId.trim().length > 0 &&
    selectWireTechnicalIdTaken(state, forms.wire.technicalId.trim(), wireIdExcludedFromUniqueness);

  const networkTechnicalIdAlreadyUsed =
    newNetworkTechnicalId.trim().length > 0 &&
    selectNetworkTechnicalIdTaken(
      state,
      newNetworkTechnicalId.trim(),
      networkFormMode === "edit" ? networkFormTargetId ?? undefined : undefined
    );

  return {
    connectorTechnicalIdAlreadyUsed,
    spliceTechnicalIdAlreadyUsed,
    catalogManufacturerReferenceAlreadyUsed,
    wireTechnicalIdAlreadyUsed,
    networkTechnicalIdAlreadyUsed
  };
}

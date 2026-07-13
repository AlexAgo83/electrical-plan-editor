import { translateCurrent as t } from "../lib/i18n";
import type { CatalogItemId, Wire } from "../../core/entities";
import type { AppStore } from "../../store";

export function buildWireProtectionFromForm(
  store: AppStore,
  wireFuseEnabled: boolean,
  wireFuseCatalogItemId: string,
  setWireFormError: (value: string | null) => void
): Wire["protection"] | undefined | null {
  if (!wireFuseEnabled) {
    return undefined;
  }

  const normalizedCatalogItemId = wireFuseCatalogItemId.trim();
  if (normalizedCatalogItemId.length === 0) {
    setWireFormError(t("ui.fuseCatalogItemIsRequired"));
    return null;
  }

  const catalogItem = store.getState().catalogItems.byId[normalizedCatalogItemId as CatalogItemId];
  if (catalogItem === undefined) {
    setWireFormError(t("ui.selectedFuseCatalogItemNoLongerExists"));
    return null;
  }

  if (catalogItem.manufacturerReference.trim().length === 0) {
    setWireFormError(t("ui.selectedFuseCatalogItemIsMissingAManufacturerReference"));
    return null;
  }

  return {
    kind: "fuse",
    catalogItemId: normalizedCatalogItemId as CatalogItemId
  };
}

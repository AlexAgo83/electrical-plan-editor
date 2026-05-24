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
    setWireFormError("Fuse catalog item is required.");
    return null;
  }

  const catalogItem = store.getState().catalogItems.byId[normalizedCatalogItemId as CatalogItemId];
  if (catalogItem === undefined) {
    setWireFormError("Selected fuse catalog item no longer exists.");
    return null;
  }

  if (catalogItem.manufacturerReference.trim().length === 0) {
    setWireFormError("Selected fuse catalog item is missing a manufacturer reference.");
    return null;
  }

  return {
    kind: "fuse",
    catalogItemId: normalizedCatalogItemId as CatalogItemId
  };
}

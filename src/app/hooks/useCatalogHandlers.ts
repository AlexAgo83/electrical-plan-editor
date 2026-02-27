import type { FormEvent } from "react";
import type { CatalogItem, CatalogItemId } from "../../core/entities";
import type { AppStore } from "../../store";
import { appActions, isValidCatalogUrlInput } from "../../store";
import { createEntityId, focusSelectedTableRowInPanel } from "../lib/app-utils-shared";
import type { ConfirmDialogRequest } from "../types/confirm-dialog";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

interface UseCatalogHandlersParams {
  store: AppStore;
  dispatchAction: DispatchAction;
  confirmAction: (request: ConfirmDialogRequest) => Promise<boolean>;
  catalogFormMode: "idle" | "create" | "edit";
  setCatalogFormMode: (mode: "idle" | "create" | "edit") => void;
  editingCatalogItemId: CatalogItemId | null;
  setEditingCatalogItemId: (id: CatalogItemId | null) => void;
  catalogManufacturerReference: string;
  setCatalogManufacturerReference: (value: string) => void;
  catalogConnectionCount: string;
  setCatalogConnectionCount: (value: string) => void;
  catalogName: string;
  setCatalogName: (value: string) => void;
  catalogUnitPriceExclTax: string;
  setCatalogUnitPriceExclTax: (value: string) => void;
  catalogUrl: string;
  setCatalogUrl: (value: string) => void;
  setCatalogFormError: (value: string | null) => void;
}

function normalizeOptionalNumber(raw: string): number | undefined {
  const normalized = raw.trim().replace(",", ".");
  if (normalized.length === 0) {
    return undefined;
  }
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return Number.NaN;
  }
  return parsed;
}

export function useCatalogHandlers({
  store,
  dispatchAction,
  confirmAction,
  catalogFormMode,
  setCatalogFormMode,
  editingCatalogItemId,
  setEditingCatalogItemId,
  catalogManufacturerReference,
  setCatalogManufacturerReference,
  catalogConnectionCount,
  setCatalogConnectionCount,
  catalogName,
  setCatalogName,
  catalogUnitPriceExclTax,
  setCatalogUnitPriceExclTax,
  catalogUrl,
  setCatalogUrl,
  setCatalogFormError
}: UseCatalogHandlersParams) {
  function clearCatalogForm(): void {
    setCatalogFormMode("idle");
    setEditingCatalogItemId(null);
    setCatalogManufacturerReference("");
    setCatalogConnectionCount("4");
    setCatalogName("");
    setCatalogUnitPriceExclTax("");
    setCatalogUrl("");
    setCatalogFormError(null);
  }

  function resetCatalogForm(): void {
    setCatalogFormMode("create");
    setEditingCatalogItemId(null);
    setCatalogManufacturerReference("");
    setCatalogConnectionCount("4");
    setCatalogName("");
    setCatalogUnitPriceExclTax("");
    setCatalogUrl("");
    setCatalogFormError(null);
  }

  function cancelCatalogEdit(): void {
    clearCatalogForm();
    dispatchAction(appActions.clearSelection(), { trackHistory: false });
  }

  function startCatalogEdit(item: CatalogItem): void {
    setCatalogFormMode("edit");
    setEditingCatalogItemId(item.id);
    setCatalogManufacturerReference(item.manufacturerReference);
    setCatalogConnectionCount(String(item.connectionCount));
    setCatalogName(item.name ?? "");
    setCatalogUnitPriceExclTax(item.unitPriceExclTax === undefined ? "" : String(item.unitPriceExclTax));
    setCatalogUrl(item.url ?? "");
    setCatalogFormError(null);
    dispatchAction(appActions.select({ kind: "catalog", id: item.id }), { trackHistory: false });
  }

  function handleCatalogSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (typeof event.currentTarget.reportValidity === "function" && !event.currentTarget.reportValidity()) {
      setCatalogFormError(null);
      return;
    }

    const manufacturerReference = catalogManufacturerReference.trim();
    const parsedConnectionCount = Number(catalogConnectionCount);
    const connectionCount = Number.isInteger(parsedConnectionCount) && parsedConnectionCount > 0 ? parsedConnectionCount : 0;
    const unitPriceExclTax = normalizeOptionalNumber(catalogUnitPriceExclTax);
    const url = catalogUrl.trim();

    if (manufacturerReference.length === 0) {
      setCatalogFormError("Manufacturer reference is required.");
      return;
    }
    if (manufacturerReference.length > 120) {
      setCatalogFormError("Manufacturer reference must be 120 characters or fewer.");
      return;
    }
    if (connectionCount < 1) {
      setCatalogFormError("Connection count must be an integer >= 1.");
      return;
    }
    if (Number.isNaN(unitPriceExclTax)) {
      setCatalogFormError("Unit price (excl. tax) must be a valid number >= 0.");
      return;
    }
    if (!isValidCatalogUrlInput(url)) {
      setCatalogFormError("URL must be empty or a valid absolute http/https URL.");
      return;
    }
    setCatalogFormError(null);

    const existing =
      catalogFormMode === "edit" && editingCatalogItemId !== null
        ? store.getState().catalogItems.byId[editingCatalogItemId]
        : undefined;
    const catalogItemId =
      existing?.id ?? (createEntityId("catalog") as CatalogItemId);
    const wasCreateMode = catalogFormMode === "create";

    dispatchAction(
      appActions.upsertCatalogItem({
        ...(existing ?? {}),
        id: catalogItemId,
        manufacturerReference,
        connectionCount,
        name: catalogName.trim().length === 0 ? undefined : catalogName.trim(),
        unitPriceExclTax,
        url: url.length === 0 ? undefined : url
      })
    );

    const saved = store.getState().catalogItems.byId[catalogItemId];
    if (saved !== undefined) {
      startCatalogEdit(saved);
      if (!wasCreateMode) {
        focusSelectedTableRowInPanel('[data-onboarding-panel="modeling-catalog"]');
      }
    }
  }

  function handleCatalogDelete(catalogItemId: CatalogItemId): void {
    const catalogItem = store.getState().catalogItems.byId[catalogItemId];
    if (catalogItem === undefined) {
      return;
    }

    const formattedIdentity =
      catalogItem.name === undefined || catalogItem.name.trim().length === 0
        ? `'${catalogItem.manufacturerReference}'`
        : `'${catalogItem.manufacturerReference}' (${catalogItem.name.trim()})`;
    void (async () => {
      const shouldDelete = await confirmAction({
        title: "Delete catalog item",
        message: `Delete catalog item ${formattedIdentity}?`,
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        intent: "danger"
      });
      if (!shouldDelete) {
        return;
      }

      dispatchAction(appActions.removeCatalogItem(catalogItemId));
      if (editingCatalogItemId === catalogItemId) {
        clearCatalogForm();
      }
    })();
  }

  return {
    resetCatalogForm,
    clearCatalogForm,
    cancelCatalogEdit,
    startCatalogEdit,
    handleCatalogSubmit,
    handleCatalogDelete
  };
}

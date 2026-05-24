import type { FormEvent } from "react";
import type { CatalogItem, CatalogItemId, ConnectorLayout } from "../../core/entities";
import { normalizeConnectorLayout } from "../../core/connectorLayout";
import type { AppStore } from "../../store";
import { appActions, isValidCatalogUrlInput } from "../../store";
import { analyzeCatalogDeleteImpact } from "../../store/deleteImpact";
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
  catalogShowConnectorMaterialDefaults?: boolean;
  setCatalogShowConnectorMaterialDefaults?: (value: boolean) => void;
  catalogAllSameTerminals?: boolean;
  setCatalogAllSameTerminals?: (value: boolean) => void;
  catalogDefaultTerminalReference?: string;
  setCatalogDefaultTerminalReference?: (value: string) => void;
  catalogDefaultTerminalName?: string;
  setCatalogDefaultTerminalName?: (value: string) => void;
  catalogDefaultSealReference?: string;
  setCatalogDefaultSealReference?: (value: string) => void;
  catalogDefaultSealName?: string;
  setCatalogDefaultSealName?: (value: string) => void;
  catalogPlugDefinitionsText?: string;
  setCatalogPlugDefinitionsText?: (value: string) => void;
  catalogConnectorLayout?: ConnectorLayout | undefined;
  setCatalogConnectorLayout?: (value: ConnectorLayout | undefined) => void;
  catalogShowConnectorPhysicalLayout?: boolean;
  setCatalogShowConnectorPhysicalLayout?: (value: boolean) => void;
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
  catalogShowConnectorMaterialDefaults = false,
  setCatalogShowConnectorMaterialDefaults = () => {},
  catalogAllSameTerminals = false,
  setCatalogAllSameTerminals = () => {},
  catalogDefaultTerminalReference = "",
  setCatalogDefaultTerminalReference = () => {},
  catalogDefaultTerminalName = "",
  setCatalogDefaultTerminalName = () => {},
  catalogDefaultSealReference = "",
  setCatalogDefaultSealReference = () => {},
  catalogDefaultSealName = "",
  setCatalogDefaultSealName = () => {},
  catalogPlugDefinitionsText = "",
  setCatalogPlugDefinitionsText = () => {},
  catalogConnectorLayout,
  setCatalogConnectorLayout = () => {},
  catalogShowConnectorPhysicalLayout = false,
  setCatalogShowConnectorPhysicalLayout = () => {},
  setCatalogFormError
}: UseCatalogHandlersParams) {
  function clearCatalogMaterialDefaults(): void {
    setCatalogAllSameTerminals(false);
    setCatalogDefaultTerminalReference("");
    setCatalogDefaultTerminalName("");
    setCatalogDefaultSealReference("");
    setCatalogDefaultSealName("");
    setCatalogPlugDefinitionsText("");
    setCatalogShowConnectorMaterialDefaults(false);
    setCatalogConnectorLayout(undefined);
    setCatalogShowConnectorPhysicalLayout(false);
  }

  function clearCatalogForm(): void {
    setCatalogFormMode("idle");
    setEditingCatalogItemId(null);
    setCatalogManufacturerReference("");
    setCatalogConnectionCount("4");
    setCatalogName("");
    setCatalogUnitPriceExclTax("");
    setCatalogUrl("");
    clearCatalogMaterialDefaults();
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
    clearCatalogMaterialDefaults();
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
    setCatalogShowConnectorMaterialDefaults(item.connectorDefaults !== undefined);
    setCatalogAllSameTerminals(item.connectorDefaults?.allSameTerminals === true);
    setCatalogDefaultTerminalReference(item.connectorDefaults?.defaultTerminal?.terminalReference ?? "");
    setCatalogDefaultTerminalName(item.connectorDefaults?.defaultTerminal?.terminalName ?? "");
    setCatalogDefaultSealReference(item.connectorDefaults?.defaultTerminal?.sealReference ?? "");
    setCatalogDefaultSealName(item.connectorDefaults?.defaultTerminal?.sealName ?? "");
    setCatalogPlugDefinitionsText(
      item.connectorDefaults?.plugs
        ?.map((plug) => [plug.plugReference, plug.quantity, plug.plugName ?? ""].join(","))
        .join("\n") ?? ""
    );
    setCatalogConnectorLayout(item.connectorLayout);
    setCatalogShowConnectorPhysicalLayout(item.connectorLayout !== undefined);
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
    const plugDefinitions = catalogPlugDefinitionsText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [reference = "", quantityText = "", name = ""] = line.split(",").map((part) => part.trim());
        const quantity = Number(quantityText);
        return {
          plugReference: reference,
          quantity: Number.isInteger(quantity) && quantity > 0 ? quantity : Number.NaN,
          plugName: name.length === 0 ? undefined : name
        };
      });

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
    if (plugDefinitions.some((plug) => plug.plugReference.length === 0 || Number.isNaN(plug.quantity))) {
      setCatalogFormError("Plug definitions must use one line per plug: reference,quantity,name.");
      return;
    }
    const normalizedConnectorLayout = catalogShowConnectorPhysicalLayout
      ? normalizeConnectorLayout(catalogConnectorLayout, connectionCount)
      : undefined;
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
        url: url.length === 0 ? undefined : url,
        connectorDefaults: catalogShowConnectorMaterialDefaults
          ? {
              allSameTerminals: catalogAllSameTerminals ? true : undefined,
              defaultTerminal: {
                terminalReference: catalogDefaultTerminalReference.trim() || undefined,
                terminalName: catalogDefaultTerminalName.trim() || undefined,
                sealReference: catalogDefaultSealReference.trim() || undefined,
                sealName: catalogDefaultSealName.trim() || undefined
              },
              plugs: plugDefinitions.length > 0 ? plugDefinitions : undefined
            }
          : undefined,
        connectorLayout: normalizedConnectorLayout
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
      const impact = analyzeCatalogDeleteImpact(store.getState(), catalogItemId);

      if (impact.kind === "direct") {
        const shouldDelete = await confirmAction({
          title: "Delete catalog item",
          message: `Delete catalog item ${formattedIdentity}?`,
          confirmLabel: "Delete",
          cancelLabel: "Cancel",
          intent: "danger",
          confirmOnEnter: true
        });
        if (!shouldDelete) {
          return;
        }

        dispatchAction(appActions.removeCatalogItem(catalogItemId));
        if (editingCatalogItemId === catalogItemId) {
          clearCatalogForm();
        }
        return;
      }

      await confirmAction({
        title: "Catalog item delete blocked",
        message: impact.message,
        confirmLabel: "Close",
        cancelLabel: "Cancel",
        intent: "warning",
        variant: "deleteBlocked",
        summaryCategories: impact.categories,
        summaryNote: impact.note
      });
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

export type CatalogHandlersModel = ReturnType<typeof useCatalogHandlers>;

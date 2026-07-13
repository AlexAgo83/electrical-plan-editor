import { translateCurrent as t } from "../lib/i18n";
import type { FormEvent } from "react";
import type {
  CatalogAdditionalAccessory,
  CatalogItem,
  CatalogItemId,
  ConnectorLayout,
  FuseBoxConfig,
  NetworkId
} from "../../core/entities";
import { normalizeConnectorLayout } from "../../core/connectorLayout";
import {
  formatPinElectricalRoleDrafts,
  hasInvalidPinElectricalRoleDraft,
  serializePinElectricalRoleDrafts,
  type ConnectorPinElectricalRoleDrafts
} from "./connectorPinElectricalRoles";
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

export type CatalogCopySourceValue = `${NetworkId}:${CatalogItemId}`;

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
  catalogAdditionalAccessories?: CatalogAdditionalAccessory[];
  setCatalogAdditionalAccessories?: (value: CatalogAdditionalAccessory[]) => void;
  catalogShowAdditionalAccessories?: boolean;
  setCatalogShowAdditionalAccessories?: (value: boolean) => void;
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
  catalogRearBackshellEnabled?: boolean;
  setCatalogRearBackshellEnabled?: (value: boolean) => void;
  catalogRearBackshellLengthMm?: string;
  setCatalogRearBackshellLengthMm?: (value: string) => void;
  catalogConnectorLayout?: ConnectorLayout | undefined;
  setCatalogConnectorLayout?: (value: ConnectorLayout | undefined) => void;
  catalogShowConnectorPhysicalLayout?: boolean;
  setCatalogShowConnectorPhysicalLayout?: (value: boolean) => void;
  catalogIsFuseBox?: boolean;
  setCatalogIsFuseBox?: (value: boolean) => void;
  catalogShowPinElectricalRoles?: boolean;
  setCatalogShowPinElectricalRoles?: (value: boolean) => void;
  catalogPinElectricalRoleDrafts?: ConnectorPinElectricalRoleDrafts;
  setCatalogPinElectricalRoleDrafts?: (value: ConnectorPinElectricalRoleDrafts) => void;
  setCatalogPinElectricalRoleSelection?: (value: number[]) => void;
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

function hasConnectorMaterialDefaults(item: CatalogItem): boolean {
  const defaults = item.connectorDefaults;
  if (defaults === undefined) {
    return false;
  }
  return (
    defaults.allSameTerminals === true ||
    defaults.defaultTerminal !== undefined ||
    defaults.terminalOverrides !== undefined ||
    (defaults.plugs?.length ?? 0) > 0 ||
    defaults.rearBackshell !== undefined
  );
}

function cloneCatalogFormValue<T>(value: T): T {
  return structuredClone(value);
}

function getCatalogCopySourceValue(networkId: NetworkId, catalogItemId: CatalogItemId): CatalogCopySourceValue {
  return `${networkId}:${catalogItemId}`;
}

function parseCatalogCopySourceValue(value: string): { networkId: NetworkId; catalogItemId: CatalogItemId } | null {
  const separatorIndex = value.indexOf(":");
  if (separatorIndex < 1 || separatorIndex === value.length - 1) {
    return null;
  }

  return {
    networkId: value.slice(0, separatorIndex) as NetworkId,
    catalogItemId: value.slice(separatorIndex + 1) as CatalogItemId
  };
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
  catalogAdditionalAccessories = [],
  setCatalogAdditionalAccessories = () => {},
  catalogShowAdditionalAccessories = false,
  setCatalogShowAdditionalAccessories = () => {},
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
  catalogRearBackshellEnabled = false,
  setCatalogRearBackshellEnabled = () => {},
  catalogRearBackshellLengthMm = "40",
  setCatalogRearBackshellLengthMm = () => {},
  catalogConnectorLayout,
  setCatalogConnectorLayout = () => {},
  catalogShowConnectorPhysicalLayout = false,
  setCatalogShowConnectorPhysicalLayout = () => {},
  catalogIsFuseBox = false,
  setCatalogIsFuseBox = () => {},
  catalogShowPinElectricalRoles = false,
  setCatalogShowPinElectricalRoles = () => {},
  catalogPinElectricalRoleDrafts = {},
  setCatalogPinElectricalRoleDrafts = () => {},
  setCatalogPinElectricalRoleSelection = () => {},
  setCatalogFormError
}: UseCatalogHandlersParams) {
  function applyCatalogItemToForm(item: CatalogItem, manufacturerReference: string): void {
    setCatalogManufacturerReference(manufacturerReference);
    setCatalogConnectionCount(String(item.connectionCount));
    setCatalogName(item.name ?? "");
    setCatalogUnitPriceExclTax(item.unitPriceExclTax === undefined ? "" : String(item.unitPriceExclTax));
    setCatalogUrl(item.url ?? "");
    setCatalogAdditionalAccessories(cloneCatalogFormValue(item.additionalAccessories ?? []));
    setCatalogShowAdditionalAccessories((item.additionalAccessories?.length ?? 0) > 0);
    setCatalogShowConnectorMaterialDefaults(hasConnectorMaterialDefaults(item));
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
    setCatalogRearBackshellEnabled(item.connectorDefaults?.rearBackshell?.enabled === true);
    setCatalogRearBackshellLengthMm(
      item.connectorDefaults?.rearBackshell?.lengthMm === undefined
        ? "40"
        : String(item.connectorDefaults.rearBackshell.lengthMm)
    );
    setCatalogConnectorLayout(cloneCatalogFormValue(item.connectorLayout));
    setCatalogShowConnectorPhysicalLayout(item.connectorLayout !== undefined);
    setCatalogIsFuseBox(item.fuseBoxConfig !== undefined);
    setCatalogShowPinElectricalRoles(item.connectorDefaults?.pinElectricalRoles !== undefined);
    setCatalogPinElectricalRoleDrafts(
      formatPinElectricalRoleDrafts(item.connectorDefaults?.pinElectricalRoles, item.connectionCount)
    );
    setCatalogPinElectricalRoleSelection([]);
    setCatalogFormError(null);
  }

  function buildUniqueCatalogCopyReference(sourceReference: string): string {
    const base = `${sourceReference.trim() || "CATALOG"}-COPY`;
    const usedReferences = new Set(
      store
        .getState()
        .catalogItems.allIds.map((id) => store.getState().catalogItems.byId[id]?.manufacturerReference.trim().toLowerCase())
        .filter((reference): reference is string => reference !== undefined && reference.length > 0)
    );

    if (!usedReferences.has(base.toLowerCase())) {
      return base;
    }

    for (let suffix = 2; suffix < 10_000; suffix += 1) {
      const candidate = `${base}-${suffix}`;
      if (!usedReferences.has(candidate.toLowerCase())) {
        return candidate;
      }
    }

    return `${base}-${Date.now()}`;
  }

  function findCatalogCopySource(value: string): CatalogItem | undefined {
    const parsed = parseCatalogCopySourceValue(value);
    if (parsed === null) {
      return undefined;
    }

    const state = store.getState();
    if (state.activeNetworkId === parsed.networkId) {
      return state.catalogItems.byId[parsed.catalogItemId];
    }

    return state.networkStates[parsed.networkId]?.catalogItems.byId[parsed.catalogItemId];
  }

  function clearCatalogMaterialDefaults(): void {
    setCatalogAllSameTerminals(false);
    setCatalogDefaultTerminalReference("");
    setCatalogDefaultTerminalName("");
    setCatalogDefaultSealReference("");
    setCatalogDefaultSealName("");
    setCatalogPlugDefinitionsText("");
    setCatalogRearBackshellEnabled(false);
    setCatalogRearBackshellLengthMm("40");
    setCatalogShowConnectorMaterialDefaults(false);
    setCatalogConnectorLayout(undefined);
    setCatalogShowConnectorPhysicalLayout(false);
    setCatalogIsFuseBox(false);
    setCatalogShowPinElectricalRoles(false);
    setCatalogPinElectricalRoleDrafts({});
    setCatalogPinElectricalRoleSelection([]);
  }

  function clearCatalogForm(): void {
    setCatalogFormMode("idle");
    setEditingCatalogItemId(null);
    setCatalogManufacturerReference("");
    setCatalogConnectionCount("4");
    setCatalogName("");
    setCatalogUnitPriceExclTax("");
    setCatalogUrl("");
    setCatalogAdditionalAccessories([]);
    setCatalogShowAdditionalAccessories(false);
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
    setCatalogAdditionalAccessories([]);
    setCatalogShowAdditionalAccessories(false);
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
    applyCatalogItemToForm(item, item.manufacturerReference);
    dispatchAction(appActions.select({ kind: "catalog", id: item.id }), { trackHistory: false });
  }

  function copyCatalogFromSource(value: string): void {
    const source = findCatalogCopySource(value);
    if (source === undefined) {
      return;
    }

    setCatalogFormMode("create");
    setEditingCatalogItemId(null);
    applyCatalogItemToForm(source, buildUniqueCatalogCopyReference(source.manufacturerReference));
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
    const additionalAccessories = catalogAdditionalAccessories
      .map((accessory) => ({
        accessoryReference: accessory.accessoryReference.trim(),
        accessoryName: accessory.accessoryName?.trim() ?? ""
      }))
      .filter((accessory) => accessory.accessoryReference.length > 0 || accessory.accessoryName.length > 0)
      .map((accessory) => ({
        accessoryReference: accessory.accessoryReference,
        accessoryName: accessory.accessoryName.length === 0 ? undefined : accessory.accessoryName
      }));
    const plugDefinitions = catalogShowConnectorMaterialDefaults
      ? catalogPlugDefinitionsText
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
          })
      : [];

    if (manufacturerReference.length === 0) {
      setCatalogFormError(t("ui.manufacturerReferenceIsRequired"));
      return;
    }
    if (manufacturerReference.length > 120) {
      setCatalogFormError(t("ui.manufacturerReferenceMustBe120CharactersOrFewer"));
      return;
    }
    if (connectionCount < 1) {
      setCatalogFormError(t("ui.connectionCountMustBeAnInteger1"));
      return;
    }
    if (Number.isNaN(unitPriceExclTax)) {
      setCatalogFormError(t("ui.unitPriceExclTaxMustBeAValidNumber0"));
      return;
    }
    if (!isValidCatalogUrlInput(url)) {
      setCatalogFormError(t("ui.urlMustBeEmptyOrAValidAbsoluteHttpHttps"));
      return;
    }
    if (catalogShowAdditionalAccessories && additionalAccessories.some((accessory) => accessory.accessoryReference.length === 0)) {
      setCatalogFormError("Accessory reference is required when an accessory name is filled.");
      return;
    }
    if (catalogShowAdditionalAccessories && additionalAccessories.some((accessory) => accessory.accessoryReference.length > 120)) {
      setCatalogFormError("Accessory reference must be 120 characters or fewer.");
      return;
    }
    if (plugDefinitions.some((plug) => plug.plugReference.length === 0 || Number.isNaN(plug.quantity))) {
      setCatalogFormError("Plug definitions must use one line per plug: reference,quantity,name.");
      return;
    }
    const rearBackshellLengthMm = Number(catalogRearBackshellLengthMm.trim().replace(",", "."));
    if (catalogShowConnectorMaterialDefaults && catalogRearBackshellEnabled && (!Number.isFinite(rearBackshellLengthMm) || rearBackshellLengthMm < 1)) {
      setCatalogFormError("Rear backshell length must be a valid number >= 1 mm.");
      return;
    }
    if (catalogShowPinElectricalRoles && hasInvalidPinElectricalRoleDraft(catalogPinElectricalRoleDrafts)) {
      setCatalogFormError("Pin role currents must be numeric values greater than or equal to 0 A.");
      return;
    }
    const pinElectricalRoles = catalogShowPinElectricalRoles
      ? serializePinElectricalRoleDrafts(catalogPinElectricalRoleDrafts, connectionCount)
      : undefined;
    const normalizedConnectorLayout = catalogShowConnectorPhysicalLayout
      ? normalizeConnectorLayout(catalogConnectorLayout, connectionCount)
      : undefined;
    const fuseBoxConfig: FuseBoxConfig | undefined = catalogIsFuseBox
      ? {
          pairs: Array.from({ length: Math.floor(connectionCount / 2) }, (_, i) => ({
            pairIndex: i,
            pinA: i * 2 + 1,
            pinB: i * 2 + 2
          }))
        }
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
        additionalAccessories: catalogShowAdditionalAccessories && additionalAccessories.length > 0 ? additionalAccessories : undefined,
        connectorDefaults: catalogShowConnectorMaterialDefaults || pinElectricalRoles !== undefined
          ? {
              allSameTerminals: catalogShowConnectorMaterialDefaults && catalogAllSameTerminals ? true : undefined,
              defaultTerminal: catalogShowConnectorMaterialDefaults
                ? {
                    terminalReference: catalogDefaultTerminalReference.trim() || undefined,
                    terminalName: catalogDefaultTerminalName.trim() || undefined,
                    sealReference: catalogDefaultSealReference.trim() || undefined,
                    sealName: catalogDefaultSealName.trim() || undefined
                  }
                : undefined,
              plugs: catalogShowConnectorMaterialDefaults && plugDefinitions.length > 0 ? plugDefinitions : undefined,
              pinElectricalRoles,
              rearBackshell:
                catalogShowConnectorMaterialDefaults && catalogRearBackshellEnabled
                  ? {
                      enabled: true,
                      lengthMm: rearBackshellLengthMm
                    }
                  : undefined
            }
          : undefined,
        connectorLayout: normalizedConnectorLayout,
        fuseBoxConfig
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
          title: t("ui.deleteCatalogItem"),
          message: `Delete catalog item ${formattedIdentity}?`,
          confirmLabel: t("ui.delete"),
          cancelLabel: t("ui.cancel"),
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
        title: t("ui.usecataloghandlersCatalogItemDeleteBlocked"),
        message: impact.message,
        confirmLabel: t("ui.close"),
        cancelLabel: t("ui.cancel"),
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
    copyCatalogFromSource,
    getCatalogCopySourceValue,
    handleCatalogSubmit,
    handleCatalogDelete
  };
}

export type CatalogHandlersModel = ReturnType<typeof useCatalogHandlers>;

import type { FormEvent } from "react";
import type { CatalogItemId, Connector, ConnectorId, Wire } from "../../core/entities";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import { analyzeConnectorDeleteImpact } from "../../store/deleteImpact";
import { createEntityId, focusSelectedTableRowInPanel } from "../lib/app-utils-shared";
import { suggestAutoConnectorNodeId, suggestNextConnectorTechnicalId } from "../lib/technical-id-suggestions";
import type { ConfirmDialogRequest } from "../types/confirm-dialog";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

interface UseConnectorHandlersParams {
  store: AppStore;
  dispatchAction: DispatchAction;
  confirmAction: (request: ConfirmDialogRequest) => Promise<boolean>;
  connectorFormMode: "idle" | "create" | "edit";
  setConnectorFormMode: (mode: "idle" | "create" | "edit") => void;
  connectorEditAfterCreate: boolean;
  setConnectorEditAfterCreate: (value: boolean) => void;
  editingConnectorId: ConnectorId | null;
  setEditingConnectorId: (id: ConnectorId | null) => void;
  connectorName: string;
  setConnectorName: (value: string) => void;
  connectorTechnicalId: string;
  setConnectorTechnicalId: (value: string) => void;
  connectorCatalogItemId: string;
  setConnectorCatalogItemId: (value: string) => void;
  connectorManufacturerReference: string;
  setConnectorManufacturerReference: (value: string) => void;
  connectorIsMainHarnessConnector: boolean;
  setConnectorIsMainHarnessConnector: (value: boolean) => void;
  connectorApplyCatalogPlugs: boolean;
  setConnectorApplyCatalogPlugs: (value: boolean) => void;
  connectorApplyCatalogSeals: boolean;
  setConnectorApplyCatalogSeals: (value: boolean) => void;
  connectorTerminalOverridesText: string;
  setConnectorTerminalOverridesText: (value: string) => void;
  connectorAutoCreateLinkedNode: boolean;
  setConnectorAutoCreateLinkedNode: (value: boolean) => void;
  defaultAutoCreateLinkedNodes: boolean;
  cavityCount: string;
  setCavityCount: (value: string) => void;
  setConnectorFormError: (value: string | null) => void;
  selectedConnectorId: ConnectorId | null;
  cavityIndexInput: string;
  connectorOccupantRefInput: string;
}

function toCatalogItemId(raw: string): CatalogItemId | null {
  return raw.trim().length === 0 ? null : (raw as CatalogItemId);
}

function hasConnectorOccupancyIndexAboveLimit(store: AppStore, connectorId: ConnectorId, maxCavityCount: number): boolean {
  const occupancy = store.getState().connectorCavityOccupancy[connectorId];
  if (occupancy === undefined) {
    return false;
  }
  return Object.keys(occupancy)
    .map((key) => Number(key))
    .some((index) => Number.isFinite(index) && index > maxCavityCount);
}

function hasConnectorWireEndpointIndexAboveLimit(store: AppStore, connectorId: ConnectorId, maxCavityCount: number): boolean {
  const state = store.getState();
  return state.wires.allIds.some((wireId) => {
    const wire = state.wires.byId[wireId];
    if (wire === undefined) {
      return false;
    }
    return (
      (wire.endpointA.kind === "connectorCavity" && wire.endpointA.connectorId === connectorId && wire.endpointA.cavityIndex > maxCavityCount) ||
      (wire.endpointB.kind === "connectorCavity" && wire.endpointB.connectorId === connectorId && wire.endpointB.cavityIndex > maxCavityCount)
    );
  });
}

function isWireEndpointOnConnector(wire: Wire, endpointSide: "A" | "B", connectorId: ConnectorId): boolean {
  const endpoint = endpointSide === "A" ? wire.endpointA : wire.endpointB;
  return endpoint.kind === "connectorCavity" && endpoint.connectorId === connectorId;
}

function clearConnectorEndpointReferences(wire: Wire, connectorId: ConnectorId): Wire {
  const clearEndpointA = isWireEndpointOnConnector(wire, "A", connectorId);
  const clearEndpointB = isWireEndpointOnConnector(wire, "B", connectorId);
  return {
    ...wire,
    endpointAConnectionReference: clearEndpointA ? undefined : wire.endpointAConnectionReference,
    endpointAConnectionName: clearEndpointA ? undefined : wire.endpointAConnectionName,
    endpointASealReference: clearEndpointA ? undefined : wire.endpointASealReference,
    endpointASealName: clearEndpointA ? undefined : wire.endpointASealName,
    endpointBConnectionReference: clearEndpointB ? undefined : wire.endpointBConnectionReference,
    endpointBConnectionName: clearEndpointB ? undefined : wire.endpointBConnectionName,
    endpointBSealReference: clearEndpointB ? undefined : wire.endpointBSealReference,
    endpointBSealName: clearEndpointB ? undefined : wire.endpointBSealName
  };
}

function hasConnectorEndpointReferenceFields(wire: Wire, connectorId: ConnectorId): boolean {
  return (
    (isWireEndpointOnConnector(wire, "A", connectorId) &&
      (wire.endpointAConnectionReference !== undefined ||
        wire.endpointAConnectionName !== undefined ||
        wire.endpointASealReference !== undefined ||
        wire.endpointASealName !== undefined)) ||
    (isWireEndpointOnConnector(wire, "B", connectorId) &&
      (wire.endpointBConnectionReference !== undefined ||
        wire.endpointBConnectionName !== undefined ||
        wire.endpointBSealReference !== undefined ||
        wire.endpointBSealName !== undefined))
  );
}

export function useConnectorHandlers({
  store,
  dispatchAction,
  confirmAction,
  connectorFormMode,
  setConnectorFormMode,
  connectorEditAfterCreate: _connectorEditAfterCreate,
  setConnectorEditAfterCreate,
  editingConnectorId,
  setEditingConnectorId,
  connectorName,
  setConnectorName,
  connectorTechnicalId,
  setConnectorTechnicalId,
  connectorCatalogItemId,
  setConnectorCatalogItemId,
  connectorManufacturerReference: _connectorManufacturerReference,
  setConnectorManufacturerReference,
  connectorIsMainHarnessConnector,
  setConnectorIsMainHarnessConnector,
  connectorApplyCatalogPlugs,
  setConnectorApplyCatalogPlugs,
  connectorApplyCatalogSeals,
  setConnectorApplyCatalogSeals,
  connectorTerminalOverridesText,
  setConnectorTerminalOverridesText,
  connectorAutoCreateLinkedNode,
  setConnectorAutoCreateLinkedNode,
  defaultAutoCreateLinkedNodes,
  cavityCount: _cavityCount,
  setCavityCount,
  setConnectorFormError,
  selectedConnectorId,
  cavityIndexInput,
  connectorOccupantRefInput
}: UseConnectorHandlersParams) {
  void _connectorManufacturerReference;
  void _cavityCount;
  void _connectorEditAfterCreate;

  function syncDerivedConnectorCatalogFields(nextCatalogItemId: string): void {
    const catalogItem = store.getState().catalogItems.byId[nextCatalogItemId as CatalogItemId];
    if (catalogItem === undefined) {
      setConnectorCatalogItemId(nextCatalogItemId);
      setConnectorManufacturerReference("");
      return;
    }

    if (connectorFormMode === "edit" && editingConnectorId !== null) {
      if (hasConnectorOccupancyIndexAboveLimit(store, editingConnectorId, catalogItem.connectionCount)) {
        setConnectorFormError("Selected catalog item is incompatible: occupied way indexes exceed the catalog connection count.");
        return;
      }
      if (hasConnectorWireEndpointIndexAboveLimit(store, editingConnectorId, catalogItem.connectionCount)) {
        setConnectorFormError("Selected catalog item is incompatible: wire endpoint way indexes exceed the catalog connection count.");
        return;
      }
    }

    setConnectorCatalogItemId(nextCatalogItemId);
    setConnectorManufacturerReference(catalogItem.manufacturerReference);
    setCavityCount(String(catalogItem.connectionCount));
    setConnectorFormError(null);
  }

  function resetConnectorForm(): void {
    const state = store.getState();
    const firstCatalogItem = state.catalogItems.allIds
      .map((catalogItemId) => state.catalogItems.byId[catalogItemId])
      .find((item): item is NonNullable<typeof item> => item !== undefined);
    if (firstCatalogItem === undefined) {
      setConnectorFormMode("create");
      setConnectorEditAfterCreate(false);
      setEditingConnectorId(null);
      setConnectorName("");
      setConnectorTechnicalId(
        suggestNextConnectorTechnicalId(Object.values(state.connectors.byId).map((connector) => connector.technicalId))
      );
      setConnectorCatalogItemId("");
      setConnectorManufacturerReference("");
      setConnectorIsMainHarnessConnector(false);
      setConnectorApplyCatalogPlugs(true);
      setConnectorApplyCatalogSeals(true);
      setConnectorTerminalOverridesText("");
      setConnectorAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
      setCavityCount("4");
      setConnectorFormError("Create a catalog item first to define manufacturer reference and connection count.");
      return;
    }

    setConnectorFormMode("create");
    setConnectorEditAfterCreate(false);
    setEditingConnectorId(null);
    setConnectorName("");
    setConnectorTechnicalId(
      suggestNextConnectorTechnicalId(Object.values(state.connectors.byId).map((connector) => connector.technicalId))
    );
    syncDerivedConnectorCatalogFields(firstCatalogItem.id);
    setConnectorIsMainHarnessConnector(false);
    setConnectorApplyCatalogPlugs(true);
    setConnectorApplyCatalogSeals(true);
    setConnectorTerminalOverridesText("");
    setConnectorAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
    setConnectorFormError(null);
  }

  function clearConnectorForm(): void {
    setConnectorFormMode("idle");
    setConnectorEditAfterCreate(false);
    setEditingConnectorId(null);
    setConnectorName("");
    setConnectorTechnicalId("");
    setConnectorCatalogItemId("");
    setConnectorManufacturerReference("");
    setConnectorIsMainHarnessConnector(false);
    setConnectorApplyCatalogPlugs(true);
    setConnectorApplyCatalogSeals(true);
    setConnectorTerminalOverridesText("");
    setConnectorAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
    setCavityCount("4");
    setConnectorFormError(null);
  }

  function cancelConnectorEdit(): void {
    clearConnectorForm();
    dispatchAction(appActions.clearSelection(), { trackHistory: false });
  }

  function startConnectorEdit(connector: Connector, fromCreate = false): void {
    const catalogItem =
      connector.catalogItemId === undefined ? undefined : store.getState().catalogItems.byId[connector.catalogItemId];

    setConnectorFormMode("edit");
    setConnectorEditAfterCreate(fromCreate);
    setEditingConnectorId(connector.id);
    setConnectorName(connector.name);
    setConnectorTechnicalId(connector.technicalId);
    if (connector.catalogItemId !== undefined && catalogItem !== undefined) {
      setConnectorCatalogItemId(connector.catalogItemId);
      setConnectorManufacturerReference(catalogItem.manufacturerReference);
      setCavityCount(String(catalogItem.connectionCount));
    } else {
      setConnectorCatalogItemId("");
      setConnectorManufacturerReference(connector.manufacturerReference ?? "");
      setCavityCount(String(connector.cavityCount));
    }
    setConnectorIsMainHarnessConnector(connector.isMainHarnessConnector === true);
    setConnectorApplyCatalogPlugs(connector.applyCatalogPlugs !== false);
    setConnectorApplyCatalogSeals(connector.applyCatalogSeals !== false);
    setConnectorTerminalOverridesText(
      connector.terminalOverrides === undefined
        ? ""
        : Object.entries(connector.terminalOverrides)
            .sort(([left], [right]) => Number(left) - Number(right))
            .map(([cavityIndex, material]) =>
              [cavityIndex, material.terminalReference ?? "", material.sealReference ?? "", material.terminalName ?? "", material.sealName ?? ""].join(",")
            )
            .join("\n")
    );
    setConnectorAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
    setConnectorFormError(null);
    dispatchAction(appActions.select({ kind: "connector", id: connector.id }));
  }

  function handleConnectorSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const trimmedName = connectorName.trim();
    const trimmedTechnicalId = connectorTechnicalId.trim();
    const selectedCatalogItemId = toCatalogItemId(connectorCatalogItemId);
    const selectedCatalogItem =
      selectedCatalogItemId === null ? undefined : store.getState().catalogItems.byId[selectedCatalogItemId];

    if (selectedCatalogItem === undefined) {
      setConnectorFormError("Select a catalog item first.");
      return;
    }

    const normalizedCavityCount = selectedCatalogItem.connectionCount;
    const terminalOverrides = connectorTerminalOverridesText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [cavityIndexText = "", terminalReference = "", sealReference = "", terminalName = "", sealName = ""] = line
          .split(",")
          .map((part) => part.trim());
        const cavityIndex = Number(cavityIndexText);
        return {
          cavityIndex,
          material: {
            terminalReference: terminalReference || undefined,
            terminalName: terminalName || undefined,
            sealReference: sealReference || undefined,
            sealName: sealName || undefined
          }
        };
      });
    if (trimmedName.length === 0 || trimmedTechnicalId.length === 0 || normalizedCavityCount < 1) {
      setConnectorFormError("All fields are required and way count must be >= 1.");
      return;
    }
    if (
      terminalOverrides.some(
        (override) =>
          !Number.isInteger(override.cavityIndex) ||
          override.cavityIndex < 1 ||
          override.cavityIndex > normalizedCavityCount ||
          (override.material.terminalReference === undefined && override.material.sealReference === undefined)
      )
    ) {
      setConnectorFormError("Terminal overrides must use one line per override: cavity,terminal,seal,terminal name,seal name.");
      return;
    }
    setConnectorFormError(null);

    const wasCreateMode = connectorFormMode === "create";
    const connectorId =
      connectorFormMode === "edit" && editingConnectorId !== null
        ? editingConnectorId
        : (createEntityId("conn") as ConnectorId);
    const existingConnector =
      connectorFormMode === "edit" && editingConnectorId !== null ? store.getState().connectors.byId[editingConnectorId] : undefined;

    dispatchAction(
      appActions.upsertConnector({
        ...(existingConnector ?? {}),
        id: connectorId,
        name: trimmedName,
        technicalId: trimmedTechnicalId,
        catalogItemId: selectedCatalogItem.id,
        manufacturerReference: selectedCatalogItem.manufacturerReference,
        isMainHarnessConnector: connectorIsMainHarnessConnector === true ? true : undefined,
        applyCatalogPlugs: connectorApplyCatalogPlugs ? undefined : false,
        applyCatalogSeals: connectorApplyCatalogSeals ? undefined : false,
        terminalOverrides:
          terminalOverrides.length === 0
            ? undefined
            : terminalOverrides.reduce<NonNullable<Connector["terminalOverrides"]>>((overrides, override) => {
                overrides[override.cavityIndex] = override.material;
                return overrides;
              }, {}),
        cavityCount: normalizedCavityCount
      })
    );

    const nextState = store.getState();
    const savedConnector = nextState.connectors.byId[connectorId];
    if (savedConnector !== undefined) {
      if (wasCreateMode) {
        const existingNodeForConnector = nextState.nodes.allIds.some((nodeId) => {
          const node = nextState.nodes.byId[nodeId];
          return node?.kind === "connector" && node.connectorId === connectorId;
        });

        if (connectorAutoCreateLinkedNode && !existingNodeForConnector) {
          const autoNodeId = suggestAutoConnectorNodeId(savedConnector.technicalId, nextState.nodes.allIds);
          dispatchAction(
            appActions.upsertNode({
              id: autoNodeId,
              kind: "connector",
              connectorId
            }),
            { trackHistory: false }
          );

          const stateAfterNodeCreate = store.getState();
          const linkedNodeExists = stateAfterNodeCreate.nodes.allIds.some((nodeId) => {
            const node = stateAfterNodeCreate.nodes.byId[nodeId];
            return node?.kind === "connector" && node.connectorId === connectorId;
          });
          if (!linkedNodeExists) {
            setConnectorFormError(
              "Connector created, but the linked connector node could not be created automatically. Create it manually in Nodes."
            );
          }
        }

        startConnectorEdit(savedConnector, true);
        return;
      }
      startConnectorEdit(savedConnector);
      focusSelectedTableRowInPanel('[data-onboarding-panel="modeling-connectors"]');
    }
  }

  function handleConnectorDelete(connectorId: ConnectorId): void {
    const connector = store.getState().connectors.byId[connectorId];
    if (connector === undefined) {
      return;
    }

    void (async () => {
      const impact = analyzeConnectorDeleteImpact(store.getState(), connectorId);

      if (impact.kind === "direct") {
        const shouldDelete = await confirmAction({
          title: "Delete connector",
          message: `Delete connector '${connector.name}' (${connector.technicalId})?`,
          confirmLabel: "Delete",
          cancelLabel: "Cancel",
          intent: "danger",
          confirmOnEnter: true
        });
        if (!shouldDelete) {
          return;
        }

        dispatchAction(appActions.removeConnector(connectorId));
        if (editingConnectorId === connectorId) {
          clearConnectorForm();
        }
        return;
      }

      if (impact.kind === "cascade") {
        const shouldCascadeDelete = await confirmAction({
          title: "Cascade delete connector",
          message: impact.message,
          confirmLabel: "Delete all",
          cancelLabel: "Cancel",
          intent: "danger",
          confirmOnEnter: true,
          variant: "deleteCascade",
          summaryCategories: impact.categories,
          summaryNote: impact.note
        });
        if (!shouldCascadeDelete) {
          return;
        }

        dispatchAction(appActions.removeConnectorCascade(connectorId));
        if (editingConnectorId === connectorId) {
          clearConnectorForm();
        }
        return;
      }

      await confirmAction({
        title: "Connector delete blocked",
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

  function handleReserveCavity(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (selectedConnectorId === null) {
      return;
    }

    const cavityIndex = Math.max(0, Math.trunc(Number(cavityIndexInput)));
    dispatchAction(appActions.occupyConnectorCavity(selectedConnectorId, cavityIndex, connectorOccupantRefInput));
  }

  function handleReleaseCavity(cavityIndex: number): void {
    if (selectedConnectorId === null) {
      return;
    }

    dispatchAction(appActions.releaseConnectorCavity(selectedConnectorId, cavityIndex));
  }

  function handleClearConnectorTerminalAndSealOverrides(): void {
    setConnectorTerminalOverridesText("");
    if (connectorFormMode !== "edit" || editingConnectorId === null) {
      return;
    }

    const state = store.getState();
    const wiresToUpdate = state.wires.allIds.flatMap((wireId) => {
      const wire = state.wires.byId[wireId];
      return wire !== undefined && hasConnectorEndpointReferenceFields(wire, editingConnectorId) ? [wire] : [];
    });

    wiresToUpdate.forEach((wire, index) => {
      dispatchAction(appActions.saveWire(clearConnectorEndpointReferences(wire, editingConnectorId)), {
        trackHistory: index === 0
      });
    });
  }

  return {
    resetConnectorForm,
    clearConnectorForm,
    cancelConnectorEdit,
    startConnectorEdit,
    handleConnectorSubmit,
    handleConnectorDelete,
    handleReserveCavity,
    handleReleaseCavity,
    handleClearConnectorTerminalAndSealOverrides,
    syncDerivedConnectorCatalogFields
  };
}

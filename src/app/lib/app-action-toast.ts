import type { AppAction } from "../../store/actions";
import type { AppState } from "../../store";
import type { ToastNotificationVariant } from "../hooks/useToastNotifications";

export interface AppActionToast {
  title: string;
  message?: string;
  variant: ToastNotificationVariant;
}

function getCatalogItemLabel(state: AppState, id: string): string {
  const item = state.catalogItems.byId[id as keyof typeof state.catalogItems.byId];
  return item?.manufacturerReference ?? id;
}

function getConnectorLabel(state: AppState, id: string): string {
  const connector = state.connectors.byId[id as keyof typeof state.connectors.byId];
  return connector === undefined ? id : `${connector.name} (${connector.technicalId})`;
}

function getSpliceLabel(state: AppState, id: string): string {
  const splice = state.splices.byId[id as keyof typeof state.splices.byId];
  return splice === undefined ? id : `${splice.name} (${splice.technicalId})`;
}

function getNodeLabel(state: AppState, id: string): string {
  const node = state.nodes.byId[id as keyof typeof state.nodes.byId];
  return node?.kind === "intermediate" ? node.label : (node?.id ?? id);
}

function getSegmentLabel(state: AppState, id: string): string {
  const segment = state.segments.byId[id as keyof typeof state.segments.byId];
  return segment?.id ?? id;
}

function getWireLabel(state: AppState, id: string): string {
  const wire = state.wires.byId[id as keyof typeof state.wires.byId];
  return wire === undefined ? id : `${wire.name} (${wire.technicalId})`;
}

function getNetworkLabel(state: AppState, id: string): string {
  const network = state.networks.byId[id as keyof typeof state.networks.byId];
  return network === undefined ? id : `${network.name} (${network.technicalId})`;
}

function buildUpsertToast(params: {
  entityName: string;
  id: string;
  wasExisting: boolean;
  getLabel: (state: AppState, id: string) => string;
  nextState: AppState;
}): AppActionToast {
  const actionName = params.wasExisting ? "updated" : "created";
  return {
    title: `${params.entityName} ${actionName}`,
    message: params.getLabel(params.nextState, params.id),
    variant: "success"
  };
}

function buildRemoveToast(params: {
  entityName: string;
  id: string;
  getLabel: (state: AppState, id: string) => string;
  previousState: AppState;
  cascade?: boolean;
}): AppActionToast {
  return {
    title: `${params.entityName} deleted`,
    message: params.cascade ? `${params.getLabel(params.previousState, params.id)} and dependencies` : params.getLabel(params.previousState, params.id),
    variant: "info"
  };
}

function buildConnectorCavityOccupancyToast(params: {
  actionName: "reserved" | "released";
  connectorId: string;
  cavityIndex: number;
  occupantRef: string;
  state: AppState;
}): AppActionToast {
  return {
    title: `Connector way ${params.actionName}`,
    message: `${getConnectorLabel(params.state, params.connectorId)} · C${params.cavityIndex} · ${params.occupantRef}`,
    variant: params.actionName === "reserved" ? "success" : "info"
  };
}

function buildSplicePortOccupancyToast(params: {
  actionName: "reserved" | "released";
  spliceId: string;
  portIndex: number;
  occupantRef: string;
  state: AppState;
}): AppActionToast {
  return {
    title: `Splice port ${params.actionName}`,
    message: `${getSpliceLabel(params.state, params.spliceId)} · P${params.portIndex} · ${params.occupantRef}`,
    variant: params.actionName === "reserved" ? "success" : "info"
  };
}

export function buildAppActionToast(action: AppAction, previousState: AppState, nextState: AppState): AppActionToast | null {
  switch (action.type) {
    case "network/create":
      return {
        title: "Network created",
        message: `${action.payload.network.name} (${action.payload.network.technicalId})`,
        variant: "success"
      };
    case "network/update":
    case "network/rename":
      return {
        title: "Network updated",
        message: getNetworkLabel(nextState, action.payload.id),
        variant: "success"
      };
    case "network/duplicate":
      return {
        title: "Network duplicated",
        message: `${action.payload.network.name} (${action.payload.network.technicalId})`,
        variant: "success"
      };
    case "network/delete":
      return buildRemoveToast({
        entityName: "Network",
        id: action.payload.id,
        getLabel: getNetworkLabel,
        previousState
      });
    case "network/importMany":
      return null;
    case "harnessAssembly/upsert":
      return buildUpsertToast({
        entityName: "Harness assembly",
        id: action.payload.id,
        wasExisting: previousState.harnessAssemblies.byId[action.payload.id] !== undefined,
        getLabel: (state, id) => state.harnessAssemblies.byId[id as keyof typeof state.harnessAssemblies.byId]?.name ?? id,
        nextState
      });
    case "harnessAssembly/remove":
      return buildRemoveToast({
        entityName: "Harness assembly",
        id: action.payload.id,
        getLabel: (state, id) => state.harnessAssemblies.byId[id as keyof typeof state.harnessAssemblies.byId]?.name ?? id,
        previousState
      });
    case "catalog/upsert":
      return buildUpsertToast({
        entityName: "Catalog item",
        id: action.payload.id,
        wasExisting: previousState.catalogItems.byId[action.payload.id] !== undefined,
        getLabel: getCatalogItemLabel,
        nextState
      });
    case "catalog/remove":
      return buildRemoveToast({
        entityName: "Catalog item",
        id: action.payload.id,
        getLabel: getCatalogItemLabel,
        previousState
      });
    case "connector/upsert":
      return buildUpsertToast({
        entityName: "Connector",
        id: action.payload.id,
        wasExisting: previousState.connectors.byId[action.payload.id] !== undefined,
        getLabel: getConnectorLabel,
        nextState
      });
    case "connector/remove":
    case "connector/removeCascade":
      return buildRemoveToast({
        entityName: "Connector",
        id: action.payload.id,
        getLabel: getConnectorLabel,
        previousState,
        cascade: action.type === "connector/removeCascade"
      });
    case "connector/occupyCavity": {
      const previousOccupant = previousState.connectorCavityOccupancy[action.payload.connectorId]?.[action.payload.cavityIndex];
      const nextOccupant = nextState.connectorCavityOccupancy[action.payload.connectorId]?.[action.payload.cavityIndex];
      if (nextOccupant === undefined || previousOccupant === nextOccupant) {
        return null;
      }
      return buildConnectorCavityOccupancyToast({
        actionName: "reserved",
        connectorId: action.payload.connectorId,
        cavityIndex: action.payload.cavityIndex,
        occupantRef: nextOccupant,
        state: nextState
      });
    }
    case "connector/releaseCavity": {
      const previousOccupant = previousState.connectorCavityOccupancy[action.payload.connectorId]?.[action.payload.cavityIndex];
      const nextOccupant = nextState.connectorCavityOccupancy[action.payload.connectorId]?.[action.payload.cavityIndex];
      if (previousOccupant === undefined || nextOccupant !== undefined) {
        return null;
      }
      return buildConnectorCavityOccupancyToast({
        actionName: "released",
        connectorId: action.payload.connectorId,
        cavityIndex: action.payload.cavityIndex,
        occupantRef: previousOccupant,
        state: previousState
      });
    }
    case "splice/upsert":
      return buildUpsertToast({
        entityName: "Splice",
        id: action.payload.id,
        wasExisting: previousState.splices.byId[action.payload.id] !== undefined,
        getLabel: getSpliceLabel,
        nextState
      });
    case "splice/convertToDirectional":
      return {
        title: "Splice converted",
        message: getSpliceLabel(nextState, action.payload.id),
        variant: "success"
      };
    case "splice/rerouteConnectedWires":
      return {
        title: "Connected wires rerouted",
        message: getSpliceLabel(nextState, action.payload.id),
        variant: "success"
      };
    case "splice/applyOptimizedPlacement":
      return {
        title: "Optimized lengths applied",
        message: getSpliceLabel(nextState, action.payload.id),
        variant: "success"
      };
    case "splice/remove":
    case "splice/removeCascade":
      return buildRemoveToast({
        entityName: "Splice",
        id: action.payload.id,
        getLabel: getSpliceLabel,
        previousState,
        cascade: action.type === "splice/removeCascade"
      });
    case "splice/occupyPort": {
      const previousOccupant = previousState.splicePortOccupancy[action.payload.spliceId]?.[action.payload.portIndex];
      const nextOccupant = nextState.splicePortOccupancy[action.payload.spliceId]?.[action.payload.portIndex];
      if (nextOccupant === undefined || previousOccupant === nextOccupant) {
        return null;
      }
      return buildSplicePortOccupancyToast({
        actionName: "reserved",
        spliceId: action.payload.spliceId,
        portIndex: action.payload.portIndex,
        occupantRef: nextOccupant,
        state: nextState
      });
    }
    case "splice/releasePort": {
      const previousOccupant = previousState.splicePortOccupancy[action.payload.spliceId]?.[action.payload.portIndex];
      const nextOccupant = nextState.splicePortOccupancy[action.payload.spliceId]?.[action.payload.portIndex];
      if (previousOccupant === undefined || nextOccupant !== undefined) {
        return null;
      }
      return buildSplicePortOccupancyToast({
        actionName: "released",
        spliceId: action.payload.spliceId,
        portIndex: action.payload.portIndex,
        occupantRef: previousOccupant,
        state: previousState
      });
    }
    case "node/upsert":
      return buildUpsertToast({
        entityName: "Node",
        id: action.payload.id,
        wasExisting: previousState.nodes.byId[action.payload.id] !== undefined,
        getLabel: getNodeLabel,
        nextState
      });
    case "node/rename":
      return {
        title: "Node updated",
        message: getNodeLabel(nextState, action.payload.toId),
        variant: "success"
      };
    case "node/remove":
      return buildRemoveToast({
        entityName: "Node",
        id: action.payload.id,
        getLabel: getNodeLabel,
        previousState
      });
    case "segment/upsert":
      return buildUpsertToast({
        entityName: "Segment",
        id: action.payload.id,
        wasExisting: previousState.segments.byId[action.payload.id] !== undefined,
        getLabel: getSegmentLabel,
        nextState
      });
    case "segment/updateBatch":
      return {
        title: "Segments updated",
        message: `${action.payload.ids.length} segment${action.payload.ids.length === 1 ? "" : "s"}`,
        variant: "success"
      };
    case "segment/rename":
      return {
        title: "Segment updated",
        message: getSegmentLabel(nextState, action.payload.toId),
        variant: "success"
      };
    case "segment/remove":
      return buildRemoveToast({
        entityName: "Segment",
        id: action.payload.id,
        getLabel: getSegmentLabel,
        previousState
      });
    case "wire/save":
    case "wire/upsert":
      return buildUpsertToast({
        entityName: "Wire",
        id: action.payload.id,
        wasExisting: previousState.wires.byId[action.payload.id] !== undefined,
        getLabel: getWireLabel,
        nextState
      });
    case "wire/remove":
      return buildRemoveToast({
        entityName: "Wire",
        id: action.payload.id,
        getLabel: getWireLabel,
        previousState
      });
    default:
      return null;
  }
}

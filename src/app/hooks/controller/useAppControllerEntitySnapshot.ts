import type { AppState } from "../../../store";
import {
  selectActiveNetwork,
  selectActiveNetworkId,
  selectConnectors,
  selectCatalogItems,
  selectNetworks,
  selectNodes,
  selectRoutingGraphIndex,
  selectSegments,
  selectSplices,
  selectSubNetworkSummaries,
  selectWires
} from "../../../store";
import { useEntityRelationshipMaps } from "../useEntityRelationshipMaps";
import { useNetworkEntityCountsById } from "../useNetworkEntityCountsById";

export function useAppControllerEntitySnapshot(state: AppState) {
  const networks = selectNetworks(state);
  const activeNetworkId = selectActiveNetworkId(state);
  const activeNetworkSummaryViewState =
    activeNetworkId === null ? undefined : state.networkStates[activeNetworkId]?.networkSummaryViewState;
  const activeNetwork = selectActiveNetwork(state);
  const connectors = selectConnectors(state);
  const catalogItems = selectCatalogItems(state);
  const splices = selectSplices(state);
  const nodes = selectNodes(state);
  const segments = selectSegments(state);
  const wires = selectWires(state);
  const routingGraph = selectRoutingGraphIndex(state);
  const subNetworkSummaries = selectSubNetworkSummaries(state);
  const networkEntityCountsById = useNetworkEntityCountsById(networks, state.networkStates);
  const relationshipMaps = useEntityRelationshipMaps(connectors, splices, nodes, segments);

  return {
    networks,
    activeNetworkId,
    activeNetworkSummaryViewState,
    activeNetwork,
    connectors,
    catalogItems,
    splices,
    nodes,
    segments,
    wires,
    routingGraph,
    subNetworkSummaries,
    networkEntityCountsById,
    ...relationshipMaps
  };
}

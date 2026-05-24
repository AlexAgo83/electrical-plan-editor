import type { WireEndpoint, WireMaterial } from "../../core/entities";
import { buildRoutingGraphIndex } from "../../core/graph";
import { findShortestRoute } from "../../core/pathfinding";
import { computeRecommendedWireSectionMm2, normalizeWireCurrentA } from "../../core/wireSizing";
import type { AppStore } from "../../store";
import { findNodeIdForEndpoint } from "../../store/reducer/helpers/wireTransitions";

interface ComputeDraftWireSectionRecommendationParams {
  snapshot: ReturnType<AppStore["getState"]>;
  currentInput: string;
  material: WireMaterial;
  endpointA: WireEndpoint | null;
  endpointB: WireEndpoint | null;
}

export function computeDraftWireSectionRecommendation({
  snapshot,
  currentInput,
  material,
  endpointA,
  endpointB
}: ComputeDraftWireSectionRecommendationParams): number | null {
  const normalizedCurrentA = normalizeWireCurrentA(Number(currentInput.replace(",", ".").trim()));
  if (normalizedCurrentA === undefined || endpointA === null || endpointB === null || snapshot.activeNetworkId === null) {
    return null;
  }

  const voltageV = snapshot.networks.byId[snapshot.activeNetworkId]?.voltageV;
  if (voltageV === undefined) {
    return null;
  }

  const startNodeId = findNodeIdForEndpoint(snapshot, endpointA);
  const endNodeId = findNodeIdForEndpoint(snapshot, endpointB);
  if (startNodeId === undefined || endNodeId === undefined) {
    return null;
  }

  const graph = buildRoutingGraphIndex(
    snapshot.nodes.allIds
      .map((nodeId) => snapshot.nodes.byId[nodeId])
      .filter((node): node is NonNullable<typeof node> => node !== undefined),
    snapshot.segments.allIds
      .map((segmentId) => snapshot.segments.byId[segmentId])
      .filter((segment): segment is NonNullable<typeof segment> => segment !== undefined)
  );
  const route = findShortestRoute(graph, startNodeId, endNodeId);
  if (route === null) {
    return null;
  }

  return computeRecommendedWireSectionMm2({
    currentA: normalizedCurrentA,
    material,
    voltageV,
    lengthMm: route.totalLengthMm
  });
}

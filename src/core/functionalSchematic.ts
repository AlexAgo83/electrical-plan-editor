import type {
  CatalogItem,
  Connector,
  ConnectorId,
  Network,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire,
  WireEndpoint,
  WireId
} from "./entities";

export type FunctionalTraceSeed =
  | { kind: "wire"; wireId: WireId | null }
  | { kind: "connector"; connectorId: ConnectorId | null }
  | { kind: "splice"; spliceId: SpliceId | null };

export type FunctionalDomainFilter = string;

export const FUNCTIONAL_FILTER_ALL = "all";
export const FUNCTIONAL_FILTER_SIGNAL = "signal";
export const FUNCTIONAL_FILTER_12V_POWER = "12V power";
export const FUNCTIONAL_FILTER_GROUND_POWER = "-12V power(GND)";
export const FUNCTIONAL_FILTER_48V = "48V";
export const FUNCTIONAL_FILTER_CAN = "CAN";
export const FUNCTIONAL_FILTERS = [
  FUNCTIONAL_FILTER_ALL,
  FUNCTIONAL_FILTER_SIGNAL,
  FUNCTIONAL_FILTER_12V_POWER,
  FUNCTIONAL_FILTER_GROUND_POWER,
  FUNCTIONAL_FILTER_48V,
  FUNCTIONAL_FILTER_CAN
] as const;

export type FunctionalNodeKind = "connector" | "splice" | "fuse";
export type FunctionalWarningKind =
  | "missing-endpoint"
  | "missing-fuse-reference"
  | "ambiguous-domain"
  | "disconnected-trace";

export interface FunctionalSchematicNode {
  id: string;
  kind: FunctionalNodeKind;
  label: string;
  detail: string;
  sourceIds: string[];
  role: "power" | "ground" | "signal" | "component";
}

export interface FunctionalSchematicEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label: string;
  sourceWireIds: WireId[];
  domainTags: string[];
}

export interface FunctionalSchematicWarning {
  kind: FunctionalWarningKind;
  message: string;
  sourceId?: string;
}

export interface FunctionalSchematicGraph {
  seed: FunctionalTraceSeed;
  activeFilter: FunctionalDomainFilter;
  availableFilters: string[];
  rootNodeIds: string[];
  nodes: FunctionalSchematicNode[];
  edges: FunctionalSchematicEdge[];
  includedWireIds: WireId[];
  warnings: FunctionalSchematicWarning[];
}

interface BuildFunctionalSchematicParams {
  network: Pick<Network, "voltageV"> | null;
  seed: FunctionalTraceSeed;
  activeFilter: FunctionalDomainFilter;
  wires: Wire[];
  segments: Segment[];
  connectorMap: ReadonlyMap<ConnectorId, Connector>;
  spliceMap: ReadonlyMap<SpliceId, Splice>;
  catalogItemMap: ReadonlyMap<CatalogItem["id"], CatalogItem>;
  rootConnectorIds?: readonly ConnectorId[];
}

function normalizeText(value: string | undefined): string {
  return value?.trim() ?? "";
}

function hasNeedle(value: string, needle: string): boolean {
  return value.toLocaleLowerCase().includes(needle.toLocaleLowerCase());
}

function makeConnectorNodeId(connectorId: ConnectorId, cavityIndex: number): string {
  return `connector:${connectorId}:pin:${cavityIndex}`;
}

function makeSpliceNodeId(spliceId: SpliceId): string {
  return `splice:${spliceId}`;
}

function makeFuseNodeId(wireId: WireId): string {
  return `fuse:${wireId}`;
}

function endpointMatchesConnector(endpoint: WireEndpoint, connectorId: ConnectorId): boolean {
  return endpoint.kind === "connectorCavity" && endpoint.connectorId === connectorId;
}

function endpointMatchesSplice(endpoint: WireEndpoint, spliceId: SpliceId): boolean {
  return endpoint.kind === "splicePort" && endpoint.spliceId === spliceId;
}

function endpointTouchesSplice(endpoint: WireEndpoint): SpliceId | null {
  return endpoint.kind === "splicePort" ? endpoint.spliceId : null;
}

function inferRole(label: string): FunctionalSchematicNode["role"] {
  const normalized = label.toLocaleLowerCase();
  if (normalized.includes("gnd") || normalized.includes("ground") || normalized.includes("masse")) {
    return "ground";
  }
  if (
    normalized.includes("12v") ||
    normalized.includes("12 v") ||
    normalized.includes("48v") ||
    normalized.includes("48 v") ||
    normalized.includes("power") ||
    normalized.includes("batt")
  ) {
    return "power";
  }
  if (normalized.includes("can") || normalized.includes("wake")) {
    return "signal";
  }
  return "component";
}

function getEndpointNode(
  endpoint: WireEndpoint,
  connectorMap: ReadonlyMap<ConnectorId, Connector>,
  spliceMap: ReadonlyMap<SpliceId, Splice>,
  warnings: FunctionalSchematicWarning[],
  sourceWireId: WireId
): FunctionalSchematicNode | null {
  if (endpoint.kind === "connectorCavity") {
    const connector = connectorMap.get(endpoint.connectorId);
    if (connector === undefined) {
      warnings.push({
        kind: "missing-endpoint",
        message: `Wire '${sourceWireId}' references missing connector '${endpoint.connectorId}'.`,
        sourceId: sourceWireId
      });
      return null;
    }

    const label = `${connector.technicalId} pin ${endpoint.cavityIndex}`;
    return {
      id: makeConnectorNodeId(endpoint.connectorId, endpoint.cavityIndex),
      kind: "connector",
      label,
      detail: connector.name,
      sourceIds: [String(endpoint.connectorId), String(endpoint.cavityIndex)],
      role: inferRole(`${label} ${connector.name}`)
    };
  }

  const splice = spliceMap.get(endpoint.spliceId);
  if (splice === undefined) {
    warnings.push({
      kind: "missing-endpoint",
      message: `Wire '${sourceWireId}' references missing splice '${endpoint.spliceId}'.`,
      sourceId: sourceWireId
    });
    return null;
  }

  const side = endpoint.spliceSideOverride ?? (endpoint.portIndex === 2 ? "R" : "L");
  return {
    id: makeSpliceNodeId(endpoint.spliceId),
    kind: "splice",
    label: splice.technicalId,
    detail: `${splice.name} side ${side}`,
    sourceIds: [String(endpoint.spliceId), String(endpoint.portIndex)],
    role: inferRole(`${splice.technicalId} ${splice.name}`)
  };
}

function mergeNode(target: Map<string, FunctionalSchematicNode>, node: FunctionalSchematicNode): void {
  const existing = target.get(node.id);
  if (existing === undefined) {
    target.set(node.id, node);
    return;
  }

  target.set(node.id, {
    ...existing,
    sourceIds: Array.from(new Set([...existing.sourceIds, ...node.sourceIds])),
    detail: existing.detail.length > 0 ? existing.detail : node.detail,
    role: existing.role === "component" ? node.role : existing.role
  });
}

function collectWireDomainTags(
  wire: Wire,
  segmentById: ReadonlyMap<SegmentId, Segment>
): string[] {
  const routeTags: string[] = [];
  for (const segmentId of wire.routeSegmentIds) {
    const tag = normalizeText(segmentById.get(segmentId)?.subNetworkTag);
    if (tag.length > 0) {
      routeTags.push(tag);
    }
  }

  const combinedText = [
    wire.name,
    wire.technicalId,
    wire.twistGroupLabel,
    ...routeTags
  ].join(" ");
  const tags = new Set<string>();
  const isCan = hasNeedle(combinedText, "can");
  const isGround =
    hasNeedle(combinedText, "gnd") ||
    hasNeedle(combinedText, "ground") ||
    hasNeedle(combinedText, "masse") ||
    hasNeedle(combinedText, "-12v") ||
    hasNeedle(combinedText, "-12 v") ||
    hasNeedle(combinedText, "0v") ||
    hasNeedle(combinedText, "0 v");
  const is48V = hasNeedle(combinedText, "48v") || hasNeedle(combinedText, "48 v");
  const is12V = hasNeedle(combinedText, "12v") || hasNeedle(combinedText, "12 v");

  if (isGround) {
    tags.add(FUNCTIONAL_FILTER_GROUND_POWER);
  }
  if (is48V) {
    tags.add(FUNCTIONAL_FILTER_48V);
  }
  if (is12V && !isGround) {
    tags.add(FUNCTIONAL_FILTER_12V_POWER);
  }
  if (isCan) {
    tags.add(FUNCTIONAL_FILTER_CAN);
  }
  if (
    !isGround &&
    !is48V &&
    !is12V &&
    !isCan &&
    (hasNeedle(combinedText, "signal") ||
      hasNeedle(combinedText, "wake") ||
      hasNeedle(combinedText, "lin") ||
      hasNeedle(combinedText, "sensor") ||
      hasNeedle(combinedText, "ctrl") ||
      hasNeedle(combinedText, "control") ||
      hasNeedle(combinedText, "input") ||
      hasNeedle(combinedText, "output") ||
      hasNeedle(combinedText, "cmd"))
  ) {
    tags.add(FUNCTIONAL_FILTER_SIGNAL);
  }

  return [...tags].sort((left, right) => left.localeCompare(right));
}

function wireMatchesFilter(wireTags: readonly string[], activeFilter: FunctionalDomainFilter): boolean {
  return activeFilter === "all" || wireTags.some((tag) => tag.toLocaleLowerCase() === activeFilter.toLocaleLowerCase());
}

function collectSeedWireIds(seed: FunctionalTraceSeed, wires: readonly Wire[]): Set<WireId> {
  const seedWireIds = new Set<WireId>();
  if (seed.kind === "wire") {
    if (seed.wireId !== null) {
      seedWireIds.add(seed.wireId);
    }
    return seedWireIds;
  }

  for (const wire of wires) {
    if (
      (seed.kind === "connector" &&
        seed.connectorId !== null &&
        (endpointMatchesConnector(wire.endpointA, seed.connectorId) ||
          endpointMatchesConnector(wire.endpointB, seed.connectorId))) ||
      (seed.kind === "splice" &&
        seed.spliceId !== null &&
        (endpointMatchesSplice(wire.endpointA, seed.spliceId) || endpointMatchesSplice(wire.endpointB, seed.spliceId)))
    ) {
      seedWireIds.add(wire.id);
    }
  }

  return seedWireIds;
}

function collectRootConnectorWireIds(rootConnectorIds: readonly ConnectorId[], wires: readonly Wire[]): Set<WireId> {
  const rootConnectorIdSet = new Set(rootConnectorIds);
  const rootWireIds = new Set<WireId>();
  for (const wire of wires) {
    if (
      (wire.endpointA.kind === "connectorCavity" && rootConnectorIdSet.has(wire.endpointA.connectorId)) ||
      (wire.endpointB.kind === "connectorCavity" && rootConnectorIdSet.has(wire.endpointB.connectorId))
    ) {
      rootWireIds.add(wire.id);
    }
  }
  return rootWireIds;
}

function expandTraceThroughSplices(seedWireIds: Set<WireId>, wires: readonly Wire[]): Set<WireId> {
  const included = new Set(seedWireIds);
  const spliceToWireIds = new Map<SpliceId, WireId[]>();
  for (const wire of wires) {
    for (const spliceId of [endpointTouchesSplice(wire.endpointA), endpointTouchesSplice(wire.endpointB)]) {
      if (spliceId === null) {
        continue;
      }
      const current = spliceToWireIds.get(spliceId) ?? [];
      current.push(wire.id);
      spliceToWireIds.set(spliceId, current);
    }
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const wire of wires) {
      if (!included.has(wire.id)) {
        continue;
      }
      for (const spliceId of [endpointTouchesSplice(wire.endpointA), endpointTouchesSplice(wire.endpointB)]) {
        if (spliceId === null) {
          continue;
        }
        for (const connectedWireId of spliceToWireIds.get(spliceId) ?? []) {
          if (!included.has(connectedWireId)) {
            included.add(connectedWireId);
            changed = true;
          }
        }
      }
    }
  }

  return included;
}

function addEdge(
  edges: Map<string, FunctionalSchematicEdge>,
  edge: FunctionalSchematicEdge
): void {
  const existing = edges.get(edge.id);
  if (existing === undefined) {
    edges.set(edge.id, edge);
    return;
  }

  edges.set(edge.id, {
    ...existing,
    sourceWireIds: Array.from(new Set([...existing.sourceWireIds, ...edge.sourceWireIds])),
    domainTags: Array.from(new Set([...existing.domainTags, ...edge.domainTags])).sort((left, right) =>
      left.localeCompare(right)
    )
  });
}

function orientEdgesFromRoots(
  nodes: ReadonlyMap<string, FunctionalSchematicNode>,
  edges: FunctionalSchematicEdge[],
  rootNodeIds: readonly string[]
): FunctionalSchematicEdge[] {
  if (rootNodeIds.length === 0 || edges.length === 0) {
    return edges;
  }

  const adjacency = new Map<string, string[]>();
  for (const nodeId of nodes.keys()) {
    adjacency.set(nodeId, []);
  }
  for (const edge of edges) {
    adjacency.get(edge.fromNodeId)?.push(edge.toNodeId);
    adjacency.get(edge.toNodeId)?.push(edge.fromNodeId);
  }

  const distanceByNodeId = new Map<string, number>();
  const queue = rootNodeIds.filter((nodeId) => nodes.has(nodeId));
  for (const nodeId of queue) {
    distanceByNodeId.set(nodeId, 0);
  }

  for (let index = 0; index < queue.length; index += 1) {
    const nodeId = queue[index]!;
    const currentDistance = distanceByNodeId.get(nodeId) ?? 0;
    for (const nextNodeId of adjacency.get(nodeId) ?? []) {
      if (distanceByNodeId.has(nextNodeId)) {
        continue;
      }
      distanceByNodeId.set(nextNodeId, currentDistance + 1);
      queue.push(nextNodeId);
    }
  }

  return edges.map((edge) => {
    const fromDistance = distanceByNodeId.get(edge.fromNodeId) ?? Number.MAX_SAFE_INTEGER;
    const toDistance = distanceByNodeId.get(edge.toNodeId) ?? Number.MAX_SAFE_INTEGER;
    if (toDistance < fromDistance) {
      return {
        ...edge,
        fromNodeId: edge.toNodeId,
        toNodeId: edge.fromNodeId
      };
    }
    return edge;
  });
}

export function buildFunctionalSchematicGraph({
  network: _network,
  seed,
  activeFilter,
  wires,
  segments,
  connectorMap,
  spliceMap,
  catalogItemMap,
  rootConnectorIds = []
}: BuildFunctionalSchematicParams): FunctionalSchematicGraph {
  void _network;
  const warnings: FunctionalSchematicWarning[] = [];
  const segmentById = new Map(segments.map((segment) => [segment.id, segment]));
  const wireDomainTagsById = new Map<WireId, string[]>();
  const allFilters = new Set<string>(FUNCTIONAL_FILTERS);

  for (const wire of wires) {
    const tags = collectWireDomainTags(wire, segmentById);
    wireDomainTagsById.set(wire.id, tags);
    tags.forEach((tag) => allFilters.add(tag));
  }

  const normalizedRootConnectorIds = rootConnectorIds.filter((connectorId) => connectorMap.has(connectorId));
  const seedWireIds =
    normalizedRootConnectorIds.length > 0
      ? collectRootConnectorWireIds(normalizedRootConnectorIds, wires)
      : collectSeedWireIds(seed, wires);
  if (seedWireIds.size === 0) {
    warnings.push({
      kind: "disconnected-trace",
      message:
        normalizedRootConnectorIds.length > 0
          ? "No wire could be resolved from the configured main harness connector selection."
          : "No wire could be resolved from the current functional trace selection."
    });
  }

  const expandedWireIds = expandTraceThroughSplices(seedWireIds, wires);
  for (const wire of wires) {
    if (expandedWireIds.has(wire.id) && (wireDomainTagsById.get(wire.id)?.length ?? 0) === 0) {
      warnings.push({
        kind: "ambiguous-domain",
        message: `Wire '${wire.technicalId}' has no route tag, voltage marker, or CAN marker for domain filtering.`,
        sourceId: wire.id
      });
    }
  }

  const includedWires = wires.filter((wire) => {
    return expandedWireIds.has(wire.id) && wireMatchesFilter(wireDomainTagsById.get(wire.id) ?? [], activeFilter);
  });

  if (expandedWireIds.size > 0 && includedWires.length === 0) {
    warnings.push({
      kind: "disconnected-trace",
      message: `The current '${activeFilter}' filter removes every wire from the functional trace.`
    });
  }

  const nodes = new Map<string, FunctionalSchematicNode>();
  const edges = new Map<string, FunctionalSchematicEdge>();

  for (const wire of includedWires) {
    const endpointANode = getEndpointNode(wire.endpointA, connectorMap, spliceMap, warnings, wire.id);
    const endpointBNode = getEndpointNode(wire.endpointB, connectorMap, spliceMap, warnings, wire.id);
    if (endpointANode === null || endpointBNode === null) {
      continue;
    }

    mergeNode(nodes, endpointANode);
    mergeNode(nodes, endpointBNode);

    const domainTags = wireDomainTagsById.get(wire.id) ?? [];
    if (wire.protection?.kind === "fuse") {
      const catalogItem = catalogItemMap.get(wire.protection.catalogItemId);
      const fuseReference = normalizeText(catalogItem?.manufacturerReference);
      if (catalogItem === undefined || fuseReference.length === 0) {
        warnings.push({
          kind: "missing-fuse-reference",
          message: `Wire '${wire.technicalId}' has a fuse protection with a missing catalog reference.`,
          sourceId: wire.id
        });
      }

      const fuseNode: FunctionalSchematicNode = {
        id: makeFuseNodeId(wire.id),
        kind: "fuse",
        label: fuseReference.length > 0 ? fuseReference : "Fuse reference missing",
        detail: catalogItem?.name ?? `Inline fuse on ${wire.technicalId}`,
        sourceIds: [String(wire.id), String(wire.protection.catalogItemId)],
        role: "power"
      };
      mergeNode(nodes, fuseNode);
      addEdge(edges, {
        id: `${wire.id}:a-fuse`,
        fromNodeId: endpointANode.id,
        toNodeId: fuseNode.id,
        label: wire.technicalId,
        sourceWireIds: [wire.id],
        domainTags
      });
      addEdge(edges, {
        id: `${wire.id}:fuse-b`,
        fromNodeId: fuseNode.id,
        toNodeId: endpointBNode.id,
        label: wire.technicalId,
        sourceWireIds: [wire.id],
        domainTags
      });
      continue;
    }

    addEdge(edges, {
      id: String(wire.id),
      fromNodeId: endpointANode.id,
      toNodeId: endpointBNode.id,
      label: wire.technicalId,
      sourceWireIds: [wire.id],
      domainTags
    });
  }

  const rootNodeIds = normalizedRootConnectorIds.flatMap((connectorId) => {
    return [...nodes.values()]
      .filter((node) => node.kind === "connector" && node.sourceIds.includes(String(connectorId)))
      .map((node) => node.id);
  });
  const sortedEdges = [...edges.values()].sort((left, right) => left.label.localeCompare(right.label));

  return {
    seed,
    activeFilter,
    availableFilters: [...allFilters].sort((left, right) => {
      const priority = FUNCTIONAL_FILTERS as readonly string[];
      const leftPriority = priority.indexOf(left);
      const rightPriority = priority.indexOf(right);
      if (leftPriority !== -1 || rightPriority !== -1) {
        return (leftPriority === -1 ? 99 : leftPriority) - (rightPriority === -1 ? 99 : rightPriority);
      }
      return left.localeCompare(right);
    }),
    rootNodeIds,
    nodes: [...nodes.values()].sort((left, right) => left.label.localeCompare(right.label)),
    edges: orientEdgesFromRoots(nodes, sortedEdges, rootNodeIds),
    includedWireIds: includedWires.map((wire) => wire.id),
    warnings
  };
}

import type {
  CatalogItem,
  Connector,
  ConnectorId,
  HarnessAssembly,
  Network,
  NetworkId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire,
  WireEndpoint,
  WireId
} from "./entities";
import { getSymmetricSharedPinCount } from "./harnessAssembly";

export type FunctionalTraceSeed =
  | { kind: "wire"; wireId: WireId | null }
  | { kind: "connector"; connectorId: ConnectorId | null }
  | { kind: "splice"; spliceId: SpliceId | null };

export type FunctionalDomainFilter = string;

export const FUNCTIONAL_FILTER_ALL = "all";
export const FUNCTIONAL_FILTER_SIGNAL = "Signal";
export const FUNCTIONAL_FILTER_12V_POWER = "12V power";
export const FUNCTIONAL_FILTER_GROUND_POWER = "-12V power (GND)";
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

export type FunctionalNodeKind = "connector" | "splice" | "fuse" | "interconnector";
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
  ratingLabel?: string;
  detailTop?: string;
  detailBottom?: string;
  sourceIds: string[];
  role: "power" | "ground" | "signal" | "component";
  networkId?: NetworkId;
  harnessColor?: string;
}

export interface FunctionalSchematicEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label: string;
  wireName?: string;
  wireTechnicalId?: string;
  wireColorMode?: Wire["colorMode"];
  wirePrimaryColorId?: Wire["primaryColorId"];
  wireSecondaryColorId?: Wire["secondaryColorId"];
  wireFreeColorLabel?: Wire["freeColorLabel"];
  sourceWireIds: WireId[];
  domainTags: string[];
  harnessColor?: string;
  interconnectorLinkId?: string;
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

export interface HarnessFunctionalNetworkBundle {
  network: Network;
  wires: Wire[];
  segments: Segment[];
  connectorMap: ReadonlyMap<ConnectorId, Connector>;
  spliceMap: ReadonlyMap<SpliceId, Splice>;
  catalogItemMap: ReadonlyMap<CatalogItem["id"], CatalogItem>;
}

interface BuildHarnessAssemblyFunctionalSchematicParams {
  assembly: HarnessAssembly;
  networksById: ReadonlyMap<NetworkId, HarnessFunctionalNetworkBundle>;
  activeFilter: FunctionalDomainFilter;
  rootConnectorRefs?: ReadonlyArray<{ networkId: NetworkId; connectorId: ConnectorId }>;
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

function makeAssemblyConnectorNodeId(networkId: NetworkId, connectorId: ConnectorId, cavityIndex: number): string {
  return `network:${networkId}:connector:${connectorId}:pin:${cavityIndex}`;
}

function makeAssemblySpliceNodeId(networkId: NetworkId, spliceId: SpliceId): string {
  return `network:${networkId}:splice:${spliceId}`;
}

function makeInterconnectorNodeId(linkId: string, cavityIndex: number): string {
  return `interconnector:${linkId}:pin:${cavityIndex}`;
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
  const explicitDomainTag = normalizeText(wire.functionalDomainTag);
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
  if (explicitDomainTag.length > 0) {
    tags.add(explicitDomainTag);
    return [...tags].sort((left, right) => left.localeCompare(right));
  }
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

function endpointKey(networkId: NetworkId, endpoint: WireEndpoint): string {
  if (endpoint.kind === "connectorCavity") {
    return `${networkId}:connector:${endpoint.connectorId}:pin:${endpoint.cavityIndex}`;
  }
  return `${networkId}:splice:${endpoint.spliceId}`;
}

function getHarnessColor(assembly: HarnessAssembly, networkId: NetworkId): string | undefined {
  return assembly.members.find((member) => member.networkId === networkId)?.color;
}

function isTerminalConnectorEndpointKey(
  key: string,
  networksById: ReadonlyMap<NetworkId, HarnessFunctionalNetworkBundle>
): boolean {
  const [networkIdRaw, kind, connectorIdRaw] = key.split(":");
  if (kind !== "connector" || networkIdRaw === undefined || connectorIdRaw === undefined) {
    return false;
  }
  const connector = networksById.get(networkIdRaw as NetworkId)?.connectorMap.get(connectorIdRaw as ConnectorId);
  return connector?.isTerminalConnector === true;
}

type FuseBoxCavityInfo = ReadonlyMap<ConnectorId, ReadonlyMap<number, { pairIndex: number; isA: boolean }>>;

function makeFuseBoxPairKey(connectorId: ConnectorId, pairIndex: number): string {
  return `${connectorId}:pair:${pairIndex}`;
}

function buildFuseBoxCavityInfo(
  connectorMap: ReadonlyMap<ConnectorId, Connector>,
  catalogItemMap: ReadonlyMap<CatalogItem["id"], CatalogItem>
): Map<ConnectorId, Map<number, { pairIndex: number; isA: boolean }>> {
  const fuseBoxCavityInfo = new Map<ConnectorId, Map<number, { pairIndex: number; isA: boolean }>>();
  for (const [connectorId, connector] of connectorMap) {
    if (connector.catalogItemId === undefined) {
      continue;
    }
    const catalogItem = catalogItemMap.get(connector.catalogItemId);
    if (catalogItem?.fuseBoxConfig === undefined) {
      continue;
    }
    const cavityMap = new Map<number, { pairIndex: number; isA: boolean }>();
    for (const pair of catalogItem.fuseBoxConfig.pairs) {
      cavityMap.set(pair.pinA, { pairIndex: pair.pairIndex, isA: true });
      cavityMap.set(pair.pinB, { pairIndex: pair.pairIndex, isA: false });
    }
    fuseBoxCavityInfo.set(connectorId, cavityMap);
  }
  return fuseBoxCavityInfo;
}

function expandTraceThroughElectricalLinks(
  seedWireIds: Set<WireId>,
  wires: readonly Wire[],
  fuseBoxCavityInfo: FuseBoxCavityInfo
): Set<WireId> {
  const included = new Set(seedWireIds);
  const spliceToWireIds = new Map<SpliceId, WireId[]>();
  const fuseBoxPairToWireIds = new Map<string, WireId[]>();
  for (const wire of wires) {
    for (const endpoint of [wire.endpointA, wire.endpointB]) {
      const spliceId = endpointTouchesSplice(endpoint);
      if (spliceId !== null) {
        const current = spliceToWireIds.get(spliceId) ?? [];
        current.push(wire.id);
        spliceToWireIds.set(spliceId, current);
      }

      if (endpoint.kind === "connectorCavity") {
        const cavityInfo = fuseBoxCavityInfo.get(endpoint.connectorId)?.get(endpoint.cavityIndex);
        if (cavityInfo !== undefined) {
          const key = makeFuseBoxPairKey(endpoint.connectorId, cavityInfo.pairIndex);
          const current = fuseBoxPairToWireIds.get(key) ?? [];
          current.push(wire.id);
          fuseBoxPairToWireIds.set(key, current);
        }
      }
    }
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const wire of wires) {
      if (!included.has(wire.id)) {
        continue;
      }
      for (const endpoint of [wire.endpointA, wire.endpointB]) {
        const connectedWireIds: WireId[] = [];
        const spliceId = endpointTouchesSplice(endpoint);
        if (spliceId !== null) {
          connectedWireIds.push(...(spliceToWireIds.get(spliceId) ?? []));
        }

        if (endpoint.kind === "connectorCavity") {
          const cavityInfo = fuseBoxCavityInfo.get(endpoint.connectorId)?.get(endpoint.cavityIndex);
          if (cavityInfo !== undefined) {
            connectedWireIds.push(...(fuseBoxPairToWireIds.get(makeFuseBoxPairKey(endpoint.connectorId, cavityInfo.pairIndex)) ?? []));
          }
        }

        for (const connectedWireId of connectedWireIds) {
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

function getWireEdgeDisplayFields(wire: Wire): Pick<
  FunctionalSchematicEdge,
  "wireName" | "wireTechnicalId" | "wireColorMode" | "wirePrimaryColorId" | "wireSecondaryColorId" | "wireFreeColorLabel"
> {
  return {
    wireName: wire.name,
    wireTechnicalId: wire.technicalId,
    wireColorMode: wire.colorMode,
    wirePrimaryColorId: wire.primaryColorId,
    wireSecondaryColorId: wire.secondaryColorId,
    wireFreeColorLabel: wire.freeColorLabel
  };
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

  const fuseBoxCavityInfo = buildFuseBoxCavityInfo(connectorMap, catalogItemMap);

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

  const expandedWireIds = expandTraceThroughElectricalLinks(seedWireIds, wires, fuseBoxCavityInfo);
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

  function getFuseBoxNodeId(connectorId: ConnectorId, pairIndex: number): string {
    return `fuse-box:${connectorId}:pair${pairIndex}`;
  }

  function getFuseBoxNode(
    connectorId: ConnectorId,
    pairIndex: number
  ): FunctionalSchematicNode | null {
    const connector = connectorMap.get(connectorId);
    if (!connector) return null;
    const rating = connector.fusePairRatings?.[pairIndex];
    const ratingLabel = rating !== undefined ? `${rating}A` : "?A";
    return {
      id: getFuseBoxNodeId(connectorId, pairIndex),
      kind: "fuse",
      label: connector.technicalId,
      detail: connector.name,
      ratingLabel,
      sourceIds: [String(connectorId), String(pairIndex)],
      role: "power"
    };
  }

  for (const wire of includedWires) {
    const domainTags = wireDomainTagsById.get(wire.id) ?? [];

    // Check if each endpoint is a fuse box cavity
    const endpointAFuseInfo = wire.endpointA.kind === "connectorCavity"
      ? fuseBoxCavityInfo.get(wire.endpointA.connectorId)?.get(wire.endpointA.cavityIndex)
      : undefined;
    const endpointBFuseInfo = wire.endpointB.kind === "connectorCavity"
      ? fuseBoxCavityInfo.get(wire.endpointB.connectorId)?.get(wire.endpointB.cavityIndex)
      : undefined;

    if (endpointAFuseInfo !== undefined && wire.endpointA.kind === "connectorCavity") {
      // endpointA is a fuse box pin
      const fuseNode = getFuseBoxNode(wire.endpointA.connectorId, endpointAFuseInfo.pairIndex);
      if (fuseNode !== null) {
        mergeNode(nodes, fuseNode);
        if (endpointBFuseInfo === undefined) {
          // endpointB is a normal endpoint
          const endpointBNode = getEndpointNode(wire.endpointB, connectorMap, spliceMap, warnings, wire.id);
          if (endpointBNode !== null) {
            mergeNode(nodes, endpointBNode);
            addEdge(edges, {
              id: `${wire.id}:fuse-normal`,
              fromNodeId: fuseNode.id,
              toNodeId: endpointBNode.id,
              label: wire.technicalId,
              ...getWireEdgeDisplayFields(wire),
              sourceWireIds: [wire.id],
              domainTags
            });
          }
        } else if (wire.endpointB.kind === "connectorCavity") {
          const fuseNodeB = getFuseBoxNode(wire.endpointB.connectorId, endpointBFuseInfo.pairIndex);
          if (fuseNodeB !== null) {
            mergeNode(nodes, fuseNodeB);
            addEdge(edges, {
              id: `${wire.id}:fuse-fuse`,
              fromNodeId: fuseNode.id,
              toNodeId: fuseNodeB.id,
              label: wire.technicalId,
              ...getWireEdgeDisplayFields(wire),
              sourceWireIds: [wire.id],
              domainTags
            });
          }
        }
      }
      continue;
    }

    if (endpointBFuseInfo !== undefined && wire.endpointB.kind === "connectorCavity") {
      // endpointB is a fuse box pin
      const fuseNode = getFuseBoxNode(wire.endpointB.connectorId, endpointBFuseInfo.pairIndex);
      if (fuseNode !== null) {
        mergeNode(nodes, fuseNode);
        const endpointANode = getEndpointNode(wire.endpointA, connectorMap, spliceMap, warnings, wire.id);
        if (endpointANode !== null) {
          mergeNode(nodes, endpointANode);
          addEdge(edges, {
            id: `${wire.id}:normal-fuse`,
            fromNodeId: endpointANode.id,
            toNodeId: fuseNode.id,
            label: wire.technicalId,
            ...getWireEdgeDisplayFields(wire),
            sourceWireIds: [wire.id],
            domainTags
          });
        }
      }
      continue;
    }

    // Normal wire (no fuse box endpoints)
    const endpointANode = getEndpointNode(wire.endpointA, connectorMap, spliceMap, warnings, wire.id);
    const endpointBNode = getEndpointNode(wire.endpointB, connectorMap, spliceMap, warnings, wire.id);
    if (endpointANode === null || endpointBNode === null) {
      continue;
    }

    mergeNode(nodes, endpointANode);
    mergeNode(nodes, endpointBNode);

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
        ...getWireEdgeDisplayFields(wire),
        sourceWireIds: [wire.id],
        domainTags
      });
      addEdge(edges, {
        id: `${wire.id}:fuse-b`,
        fromNodeId: fuseNode.id,
        toNodeId: endpointBNode.id,
        label: wire.technicalId,
        ...getWireEdgeDisplayFields(wire),
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
      ...getWireEdgeDisplayFields(wire),
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

interface QualifiedWire {
  networkId: NetworkId;
  wire: Wire;
}

interface AssemblyInterconnectorEndpoint {
  linkId: string;
  cavityIndex: number;
  nodeId: string;
  otherKey: string;
  label: string;
  sourceLabel: string;
  targetLabel: string;
  sourceIds: string[];
}

function collectAssemblyWireDomainTags(
  networksById: ReadonlyMap<NetworkId, HarnessFunctionalNetworkBundle>
): Map<string, string[]> {
  const tagsByQualifiedWireId = new Map<string, string[]>();
  for (const [networkId, bundle] of networksById) {
    const segmentById = new Map(bundle.segments.map((segment) => [segment.id, segment]));
    for (const wire of bundle.wires) {
      tagsByQualifiedWireId.set(`${networkId}:${wire.id}`, collectWireDomainTags(wire, segmentById));
    }
  }
  return tagsByQualifiedWireId;
}

function getAssemblyEndpointNode(
  networkId: NetworkId,
  endpoint: WireEndpoint,
  bundle: HarnessFunctionalNetworkBundle,
  assembly: HarnessAssembly,
  interconnectorByEndpointKey: ReadonlyMap<string, readonly AssemblyInterconnectorEndpoint[]>,
  warnings: FunctionalSchematicWarning[],
  sourceWireId: WireId
): FunctionalSchematicNode | null {
  const harnessColor = getHarnessColor(assembly, networkId);
  if (endpoint.kind === "connectorCavity") {
    const interconnector = interconnectorByEndpointKey.get(endpointKey(networkId, endpoint))?.[0];
    if (interconnector !== undefined) {
      return {
        id: interconnector.nodeId,
        kind: "interconnector",
        label: interconnector.label,
        detail: `${interconnector.sourceLabel} to ${interconnector.targetLabel}`,
        detailTop: interconnector.sourceLabel,
        detailBottom: interconnector.targetLabel,
        sourceIds: interconnector.sourceIds,
        role: "component",
        harnessColor
      };
    }

    const connector = bundle.connectorMap.get(endpoint.connectorId);
    if (connector === undefined) {
      warnings.push({
        kind: "missing-endpoint",
        message: `Wire '${sourceWireId}' references missing connector '${endpoint.connectorId}' in network '${networkId}'.`,
        sourceId: sourceWireId
      });
      return null;
    }
    const label = `${connector.technicalId} / pin ${endpoint.cavityIndex}`;
    return {
      id: makeAssemblyConnectorNodeId(networkId, endpoint.connectorId, endpoint.cavityIndex),
      kind: "connector",
      label,
      detail: connector.name,
      detailTop: bundle.network.name,
      sourceIds: [String(networkId), String(endpoint.connectorId), String(endpoint.cavityIndex)],
      role: inferRole(`${label} ${connector.name}`),
      networkId,
      harnessColor
    };
  }

  const splice = bundle.spliceMap.get(endpoint.spliceId);
  if (splice === undefined) {
    warnings.push({
      kind: "missing-endpoint",
      message: `Wire '${sourceWireId}' references missing splice '${endpoint.spliceId}' in network '${networkId}'.`,
      sourceId: sourceWireId
    });
    return null;
  }

  return {
    id: makeAssemblySpliceNodeId(networkId, endpoint.spliceId),
    kind: "splice",
    label: splice.technicalId,
    detail: `${bundle.network.name} - ${splice.name}`,
    sourceIds: [String(networkId), String(endpoint.spliceId), String(endpoint.portIndex)],
    role: inferRole(`${splice.technicalId} ${splice.name}`),
    networkId,
    harnessColor
  };
}

function getAssemblyConnectorPinLabel(network: Network, connector: Connector, cavityIndex: number): string {
  return `${network.technicalId} / ${connector.technicalId} pin ${cavityIndex} - ${connector.name}`;
}

export function buildHarnessAssemblyFunctionalSchematicGraph({
  assembly,
  networksById,
  activeFilter,
  rootConnectorRefs = assembly.masterConnectorRefs
}: BuildHarnessAssemblyFunctionalSchematicParams): FunctionalSchematicGraph {
  const warnings: FunctionalSchematicWarning[] = [];
  const allFilters = new Set<string>(FUNCTIONAL_FILTERS);
  const wireTagsByQualifiedId = collectAssemblyWireDomainTags(networksById);
  for (const tags of wireTagsByQualifiedId.values()) {
    tags.forEach((tag) => allFilters.add(tag));
  }

  const wireByQualifiedId = new Map<string, QualifiedWire>();
  const endpointToWireIds = new Map<string, string[]>();
  const wireEndpointKeys = new Map<string, [string, string]>();
  for (const [networkId, bundle] of networksById) {
    for (const wire of bundle.wires) {
      const qualifiedWireId = `${networkId}:${wire.id}`;
      wireByQualifiedId.set(qualifiedWireId, { networkId, wire });
      const keys: [string, string] = [endpointKey(networkId, wire.endpointA), endpointKey(networkId, wire.endpointB)];
      wireEndpointKeys.set(qualifiedWireId, keys);
      for (const key of keys) {
        const current = endpointToWireIds.get(key) ?? [];
        current.push(qualifiedWireId);
        endpointToWireIds.set(key, current);
      }
    }
  }

  const interconnectorByEndpointKey = new Map<string, AssemblyInterconnectorEndpoint[]>();
  for (const link of assembly.connectorLinks) {
    const sourceBundle = networksById.get(link.sourceNetworkId);
    const targetBundle = networksById.get(link.targetNetworkId);
    const sourceConnector = sourceBundle?.connectorMap.get(link.sourceConnectorId);
    const targetConnector = targetBundle?.connectorMap.get(link.targetConnectorId);
    if (sourceBundle === undefined || targetBundle === undefined || sourceConnector === undefined || targetConnector === undefined) {
      warnings.push({
        kind: "missing-endpoint",
        message: `Interconnector link '${link.id}' references a missing connector.`,
        sourceId: String(link.id)
      });
      continue;
    }
    const sharedPinCount = getSymmetricSharedPinCount(sourceConnector, targetConnector);
    for (let cavityIndex = 1; cavityIndex <= sharedPinCount; cavityIndex += 1) {
      const sourceKey = `${link.sourceNetworkId}:connector:${link.sourceConnectorId}:pin:${cavityIndex}`;
      const targetKey = `${link.targetNetworkId}:connector:${link.targetConnectorId}:pin:${cavityIndex}`;
      const nodeId = makeInterconnectorNodeId(String(link.id), cavityIndex);
      const sourceLabel = getAssemblyConnectorPinLabel(sourceBundle.network, sourceConnector, cavityIndex);
      const targetLabel = getAssemblyConnectorPinLabel(targetBundle.network, targetConnector, cavityIndex);
      const sourceIds = [String(link.id), String(cavityIndex), String(link.sourceConnectorId), String(link.targetConnectorId)];
      const sourceEntries = interconnectorByEndpointKey.get(sourceKey) ?? [];
      sourceEntries.push({
        linkId: String(link.id),
        cavityIndex,
        nodeId,
        otherKey: targetKey,
        label: link.name ?? "Interconnector",
        sourceLabel,
        targetLabel,
        sourceIds
      });
      interconnectorByEndpointKey.set(sourceKey, sourceEntries);
      const targetEntries = interconnectorByEndpointKey.get(targetKey) ?? [];
      targetEntries.push({
        linkId: String(link.id),
        cavityIndex,
        nodeId,
        otherKey: sourceKey,
        label: link.name ?? "Interconnector",
        sourceLabel,
        targetLabel,
        sourceIds
      });
      interconnectorByEndpointKey.set(targetKey, targetEntries);
    }
  }

  const seedWireIds = new Set<string>();
  for (const root of rootConnectorRefs) {
    const bundle = networksById.get(root.networkId);
    if (bundle === undefined || bundle.connectorMap.get(root.connectorId) === undefined) {
      warnings.push({
        kind: "missing-endpoint",
        message: `Master connector '${root.connectorId}' is missing from network '${root.networkId}'.`,
        sourceId: String(root.connectorId)
      });
      continue;
    }
    for (let cavityIndex = 1; cavityIndex <= (bundle.connectorMap.get(root.connectorId)?.cavityCount ?? 0); cavityIndex += 1) {
      for (const wireId of endpointToWireIds.get(`${root.networkId}:connector:${root.connectorId}:pin:${cavityIndex}`) ?? []) {
        seedWireIds.add(wireId);
      }
    }
  }
  if (seedWireIds.size === 0) {
    warnings.push({
      kind: "disconnected-trace",
      message: "No wire could be resolved from the selected harness assembly master connector selection."
    });
  }

  const includedQualifiedWireIds = new Set(seedWireIds);
  const queue = [...seedWireIds];
  const visitedEndpointKeys = new Set<string>();
  for (let index = 0; index < queue.length; index += 1) {
    const qualifiedWireId = queue[index]!;
    const endpoints = wireEndpointKeys.get(qualifiedWireId) ?? [];
    for (const key of endpoints) {
      if (visitedEndpointKeys.has(key)) {
        continue;
      }
      visitedEndpointKeys.add(key);
      for (const connectedWireId of endpointToWireIds.get(key) ?? []) {
        if (!includedQualifiedWireIds.has(connectedWireId)) {
          includedQualifiedWireIds.add(connectedWireId);
          queue.push(connectedWireId);
        }
      }
      if (isTerminalConnectorEndpointKey(key, networksById)) {
        continue;
      }
      for (const interconnector of interconnectorByEndpointKey.get(key) ?? []) {
        for (const connectedWireId of endpointToWireIds.get(interconnector.otherKey) ?? []) {
          if (!includedQualifiedWireIds.has(connectedWireId)) {
            includedQualifiedWireIds.add(connectedWireId);
            queue.push(connectedWireId);
          }
        }
      }
    }
  }

  const includedWires = [...includedQualifiedWireIds]
    .map((qualifiedWireId) => {
      const qualifiedWire = wireByQualifiedId.get(qualifiedWireId);
      if (qualifiedWire === undefined) {
        return null;
      }
      const tags = wireTagsByQualifiedId.get(qualifiedWireId) ?? [];
      return wireMatchesFilter(tags, activeFilter) ? qualifiedWire : null;
    })
    .filter((wire): wire is QualifiedWire => wire !== null);

  const nodes = new Map<string, FunctionalSchematicNode>();
  const edges = new Map<string, FunctionalSchematicEdge>();
  for (const { networkId, wire } of includedWires) {
    const bundle = networksById.get(networkId);
    if (bundle === undefined) {
      continue;
    }
    const endpointANode = getAssemblyEndpointNode(
      networkId,
      wire.endpointA,
      bundle,
      assembly,
      interconnectorByEndpointKey,
      warnings,
      wire.id
    );
    const endpointBNode = getAssemblyEndpointNode(
      networkId,
      wire.endpointB,
      bundle,
      assembly,
      interconnectorByEndpointKey,
      warnings,
      wire.id
    );
    if (endpointANode === null || endpointBNode === null) {
      continue;
    }
    mergeNode(nodes, endpointANode);
    mergeNode(nodes, endpointBNode);
    const qualifiedWireId = `${networkId}:${wire.id}`;
    addEdge(edges, {
      id: qualifiedWireId,
      fromNodeId: endpointANode.id,
      toNodeId: endpointBNode.id,
      label: wire.technicalId,
      ...getWireEdgeDisplayFields(wire),
      sourceWireIds: [wire.id],
      domainTags: wireTagsByQualifiedId.get(qualifiedWireId) ?? [],
      harnessColor: getHarnessColor(assembly, networkId)
    });
  }

  const rootNodeIds = rootConnectorRefs.flatMap((root) => {
    const connector = networksById.get(root.networkId)?.connectorMap.get(root.connectorId);
    if (connector === undefined) {
      return [];
    }
    const ids: string[] = [];
    for (let cavityIndex = 1; cavityIndex <= connector.cavityCount; cavityIndex += 1) {
      const interconnector = interconnectorByEndpointKey.get(`${root.networkId}:connector:${root.connectorId}:pin:${cavityIndex}`)?.[0];
      const nodeId = interconnector?.nodeId ?? makeAssemblyConnectorNodeId(root.networkId, root.connectorId, cavityIndex);
      if (nodes.has(nodeId)) {
        ids.push(nodeId);
      }
    }
    return ids;
  });

  const sortedEdges = [...edges.values()].sort((left, right) => left.label.localeCompare(right.label));
  return {
    seed: { kind: "connector", connectorId: rootConnectorRefs[0]?.connectorId ?? null },
    activeFilter,
    availableFilters: [...allFilters].sort((left, right) => left.localeCompare(right)),
    rootNodeIds,
    nodes: [...nodes.values()].sort((left, right) => left.label.localeCompare(right.label)),
    edges: orientEdgesFromRoots(nodes, sortedEdges, rootNodeIds),
    includedWireIds: includedWires.map(({ wire }) => wire.id),
    warnings
  };
}

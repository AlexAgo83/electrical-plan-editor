import { describe, expect, it } from "vitest";
import type {
  CatalogItem,
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Splice,
  SpliceId,
  Wire
} from "../core/entities";
import type { NodePosition } from "../app/types/app-controller";
import { appActions } from "../store";
import {
  buildCableCalloutViewModels,
  buildConnectorCalloutGroupsById,
  buildSpliceCalloutGroupsById
} from "../app/components/network-summary/callouts/calloutModel";
import { formatEntityIdForDisplay } from "../core/networkEntityPrefix";
import {
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId,
  reduceAll
} from "./helpers/store-reducer-test-utils";

const PREFIX = "LAT-";

function mapsFromState(state: ReturnType<typeof reduceAll>): {
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  wires: Wire[];
  nodes: NetworkNode[];
} {
  const connectorMap = new Map<ConnectorId, Connector>();
  for (const id of state.connectors.allIds) {
    const connector = state.connectors.byId[id];
    if (connector !== undefined) {
      connectorMap.set(id, connector);
    }
  }
  const spliceMap = new Map<SpliceId, Splice>();
  for (const id of state.splices.allIds) {
    const splice = state.splices.byId[id];
    if (splice !== undefined) {
      spliceMap.set(id, splice);
    }
  }
  const wires = state.wires.allIds
    .map((id) => state.wires.byId[id])
    .filter((wire): wire is Wire => wire !== undefined);
  const nodes = state.nodes.allIds
    .map((id) => state.nodes.byId[id])
    .filter((node): node is NetworkNode => node !== undefined);
  return { connectorMap, spliceMap, wires, nodes };
}

/** Connector `LAT-C1` <-> splice `LAT-S1`, joined by wire `LAT-W1`. */
function buildPrefixedScenario(): ReturnType<typeof reduceAll> {
  return reduceAll([
    appActions.upsertConnector({
      id: asConnectorId("LAT-C1"),
      name: "Top",
      technicalId: "LAT-C1",
      cavityCount: 1
    }),
    appActions.upsertSplice({
      id: asSpliceId("LAT-S1"),
      name: "Mid",
      technicalId: "LAT-S1",
      portCount: 2
    }),
    appActions.upsertNode({ id: asNodeId("LAT-N-C1"), kind: "connector", connectorId: asConnectorId("LAT-C1") }),
    appActions.upsertNode({ id: asNodeId("LAT-N-S1"), kind: "splice", spliceId: asSpliceId("LAT-S1") }),
    appActions.upsertSegment({
      id: asSegmentId("LAT-SEG"),
      nodeA: asNodeId("LAT-N-C1"),
      nodeB: asNodeId("LAT-N-S1"),
      lengthMm: 120
    }),
    appActions.setNodePositions({
      [asNodeId("LAT-N-C1")]: { x: 0, y: 0 },
      [asNodeId("LAT-N-S1")]: { x: 120, y: 0 }
    }),
    appActions.saveWire({
      id: asWireId("LAT-W1"),
      name: "Power",
      technicalId: "LAT-W1",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("LAT-C1"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("LAT-S1"), portIndex: 1 }
    })
  ]);
}

function makeFormatEntityId(showPrefix: boolean): (id: string) => string {
  return (id: string): string => formatEntityIdForDisplay(id, PREFIX, showPrefix);
}

function buildViewModels(
  state: ReturnType<typeof reduceAll>,
  showPrefix: boolean
): ReturnType<typeof buildCableCalloutViewModels> {
  const { connectorMap, spliceMap, wires, nodes } = mapsFromState(state);
  const formatEntityId = makeFormatEntityId(showPrefix);
  const networkNodePositions: Record<NodeId, NodePosition> = {
    [asNodeId("LAT-N-C1")]: { x: 0, y: 0 },
    [asNodeId("LAT-N-S1")]: { x: 120, y: 0 }
  };
  const catalogItems: CatalogItem[] = [];
  return buildCableCalloutViewModels({
    showCableCallouts: true,
    calloutContentMode: "wireDetails",
    showSelectedCalloutOnly: false,
    nodes,
    networkNodePositions,
    connectorMap,
    catalogItems,
    spliceMap,
    connectorCalloutGroupsById: buildConnectorCalloutGroupsById({ connectorMap, spliceMap, wires, formatEntityId }),
    spliceCalloutGroupsById: buildSpliceCalloutGroupsById({ connectorMap, spliceMap, wires, formatEntityId }),
    renderedFloatingSplices: [],
    draftCalloutPositions: {},
    getDefaultCalloutPosition: () => ({ x: 50, y: 50 }),
    isSubNetworkFilteringActive: false,
    nodeHasActiveSubNetworkConnection: new Map<NodeId, boolean>(),
    selectedConnectorId: null,
    selectedSpliceId: null,
    selectedNodeId: null,
    formatEntityId
  });
}

describe("network summary callout entity prefix display", () => {
  it("drops the active network prefix from the connector callout Wire ID and End ID cells when hidden", () => {
    const { connectorMap, spliceMap, wires } = mapsFromState(buildPrefixedScenario());
    const groups = buildConnectorCalloutGroupsById({
      connectorMap,
      spliceMap,
      wires,
      formatEntityId: makeFormatEntityId(false)
    }).get(asConnectorId("LAT-C1")) ?? [];
    const entry = groups.flatMap((group) => group.entries)[0];
    expect(entry).toBeDefined();
    // Wire ID column (the wire's own technicalId)
    expect(entry?.technicalId).toBe("W1");
    // End ID column (the far-endpoint splice technicalId)
    expect(entry?.targetId).toBe("S1");
    // wireId stays canonical (it is a stable row key, never a display string)
    expect(entry?.wireId).toBe("LAT-W1");
  });

  it("drops the active network prefix from the splice callout Wire ID and End ID cells when hidden", () => {
    const { connectorMap, spliceMap, wires } = mapsFromState(buildPrefixedScenario());
    const groups = buildSpliceCalloutGroupsById({
      connectorMap,
      spliceMap,
      wires,
      formatEntityId: makeFormatEntityId(false)
    }).get(asSpliceId("LAT-S1")) ?? [];
    const entry = groups.flatMap((group) => group.entries)[0];
    expect(entry).toBeDefined();
    expect(entry?.technicalId).toBe("W1");
    expect(entry?.targetId).toBe("C1");
  });

  it("keeps the prefix in callout cells when the prefix display is shown", () => {
    const { connectorMap, spliceMap, wires } = mapsFromState(buildPrefixedScenario());
    const groups = buildConnectorCalloutGroupsById({
      connectorMap,
      spliceMap,
      wires,
      formatEntityId: makeFormatEntityId(true)
    }).get(asConnectorId("LAT-C1")) ?? [];
    const entry = groups.flatMap((group) => group.entries)[0];
    expect(entry?.technicalId).toBe("LAT-W1");
    expect(entry?.targetId).toBe("LAT-S1");
  });

  it("hides the prefix in connector and splice callout titles while keeping canonical keys", () => {
    const state = buildPrefixedScenario();
    const hidden = buildViewModels(state, false);
    const connectorCallout = hidden.find((callout) => callout.kind === "connector");
    const spliceCallout = hidden.find((callout) => callout.kind === "splice");

    expect(connectorCallout?.title).toBe("C1 · Top");
    expect(spliceCallout?.title).toBe("S1 · Mid");

    // Keys, entityId, and selection targets remain canonical regardless of display.
    expect(connectorCallout?.key).toBe("connector:LAT-C1");
    expect(connectorCallout?.entityId).toBe(asConnectorId("LAT-C1"));
    expect(spliceCallout?.key).toBe("splice:LAT-S1");
    expect(spliceCallout?.entityId).toBe(asSpliceId("LAT-S1"));
  });

  it("keeps the prefix in callout titles when the prefix display is shown", () => {
    const shown = buildViewModels(buildPrefixedScenario(), true);
    expect(shown.find((callout) => callout.kind === "connector")?.title).toBe("LAT-C1 · Top");
    expect(shown.find((callout) => callout.kind === "splice")?.title).toBe("LAT-S1 · Mid");
  });

  it("produces the same callout keys and ordering whether the prefix is shown or hidden", () => {
    const state = buildPrefixedScenario();
    const shownKeys = buildViewModels(state, true).map((callout) => callout.key);
    const hiddenKeys = buildViewModels(state, false).map((callout) => callout.key);
    expect(hiddenKeys).toEqual(shownKeys);
  });
});

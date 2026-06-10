import { describe, expect, it } from "vitest";
import {
  MIGRATION_NODE_LABEL_PREFIX,
  migrateLegacySpliceNodes
} from "../adapters/persistence/spliceNodeMigration";
import {
  consumeLastSpliceMigrationReport,
  migratePersistedPayloadDetailed,
  PERSISTED_STATE_PAYLOAD_KIND,
  PERSISTED_STATE_SCHEMA_VERSION
} from "../adapters/persistence/migrations";
import { APP_RELEASE_VERSION, APP_SCHEMA_VERSION } from "../core/schema";
import type {
  ConnectorId,
  NodeId,
  SegmentId,
  SpliceId,
  WireId
} from "../core/entities";
import { appActions, type AppAction } from "../store/actions";
import { appReducer } from "../store/reducer";
import { createInitialState, type AppState, type NetworkScopedState } from "../store/types";

const asConnectorId = (value: string): ConnectorId => value as ConnectorId;
const asSpliceId = (value: string): SpliceId => value as SpliceId;
const asNodeId = (value: string): NodeId => value as NodeId;
const asSegmentId = (value: string): SegmentId => value as SegmentId;
const asWireId = (value: string): WireId => value as WireId;

function reduceActions(actions: AppAction[]): AppState {
  return actions.reduce(appReducer, createInitialState());
}

function toScopedState(state: AppState): NetworkScopedState {
  return {
    catalogItems: state.catalogItems,
    connectors: state.connectors,
    splices: state.splices,
    nodes: state.nodes,
    segments: state.segments,
    wires: state.wires,
    nodePositions: state.nodePositions,
    connectorCavityOccupancy: state.connectorCavityOccupancy,
    splicePortOccupancy: state.splicePortOccupancy
  };
}

function buildLegacyDegreeTwoActions(options?: {
  divergentMetadata?: boolean;
  lockPassThroughRoute?: boolean;
}): AppAction[] {
  return [
    appActions.upsertConnector({
      id: asConnectorId("C-A"),
      name: "Connector A",
      technicalId: "CONN-A",
      cavityCount: 4,
      primaryColorId: null,
      secondaryColorId: null
    } as never),
    appActions.upsertConnector({
      id: asConnectorId("C-B"),
      name: "Connector B",
      technicalId: "CONN-B",
      cavityCount: 4
    } as never),
    appActions.upsertSplice({
      id: asSpliceId("S-MID"),
      name: "Mid Splice",
      technicalId: "SPL-MID",
      portCount: 4
    }),
    appActions.upsertNode({ id: asNodeId("N-A"), kind: "connector", connectorId: asConnectorId("C-A") }),
    appActions.upsertNode({ id: asNodeId("N-B"), kind: "connector", connectorId: asConnectorId("C-B") }),
    appActions.upsertNode({ id: asNodeId("N-S"), kind: "splice", spliceId: asSpliceId("S-MID") }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-LEFT"),
      nodeA: asNodeId("N-A"),
      nodeB: asNodeId("N-S"),
      lengthMm: 100
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-RIGHT"),
      nodeA: asNodeId("N-S"),
      nodeB: asNodeId("N-B"),
      lengthMm: 60,
      ...(options?.divergentMetadata === true ? { sheathType: "PVC" } : {})
    }),
    appActions.saveWire({
      id: asWireId("W-TO-SPLICE"),
      name: "To Splice",
      technicalId: "WIRE-TO-SPLICE",
      primaryColorId: "RD",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-A"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-MID"), portIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("W-PASS"),
      name: "Pass Through",
      technicalId: "WIRE-PASS",
      primaryColorId: "BU",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-A"), cavityIndex: 2 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-B"), cavityIndex: 1 }
    }),
    ...(options?.lockPassThroughRoute === true
      ? [appActions.lockWireRoute(asWireId("W-PASS"), [asSegmentId("SEG-LEFT"), asSegmentId("SEG-RIGHT")])]
      : [])
  ];
}

describe("legacy splice node migration", () => {
  it("fuses a degree-2 splice node into one segment and rewrites wire routes", () => {
    const legacyState = reduceActions(buildLegacyDegreeTwoActions());
    const migration = migrateLegacySpliceNodes(toScopedState(legacyState), "Test network");

    expect(migration.changed).toBe(true);

    expect(migration.state.nodes.byId[asNodeId("N-S")]).toBeUndefined();
    expect(migration.state.segments.byId[asSegmentId("SEG-RIGHT")]).toBeUndefined();

    const fusedSegment = migration.state.segments.byId[asSegmentId("SEG-LEFT")];
    expect(fusedSegment).toBeDefined();
    expect(fusedSegment?.lengthMm).toBe(160);
    expect(fusedSegment?.nodeA).toBe(asNodeId("N-A"));
    expect(fusedSegment?.nodeB).toBe(asNodeId("N-B"));

    const splice = migration.state.splices.byId[asSpliceId("S-MID")];
    expect(splice?.placement).toEqual({
      kind: "segmentOffset",
      segmentId: asSegmentId("SEG-LEFT"),
      fromNodeId: asNodeId("N-A"),
      offsetMm: 100
    });

    const wireToSplice = migration.state.wires.byId[asWireId("W-TO-SPLICE")];
    expect(wireToSplice?.routeSegmentIds).toEqual([asSegmentId("SEG-LEFT")]);
    expect(wireToSplice?.lengthMm).toBe(100);
    expect(wireToSplice?.routeEndpointDetailB).toEqual({
      segmentId: asSegmentId("SEG-LEFT"),
      coveredLengthMm: 100
    });

    const passThroughWire = migration.state.wires.byId[asWireId("W-PASS")];
    expect(passThroughWire?.routeSegmentIds).toEqual([asSegmentId("SEG-LEFT")]);
    expect(passThroughWire?.lengthMm).toBe(160);
  });

  it("converts locked routes through fused segments and preserves lengths", () => {
    const legacyState = reduceActions(buildLegacyDegreeTwoActions({ lockPassThroughRoute: true }));
    const migration = migrateLegacySpliceNodes(toScopedState(legacyState), "Test network");

    const lockedWire = migration.state.wires.byId[asWireId("W-PASS")];
    expect(lockedWire?.isRouteLocked).toBe(true);
    expect(lockedWire?.routeSegmentIds).toEqual([asSegmentId("SEG-LEFT")]);
    expect(lockedWire?.lengthMm).toBe(160);
    expect(migration.report.some((entry) => entry.kind === "lockedRouteIssue")).toBe(false);
  });

  it("falls back to an intermediate node when fused segment metadata diverges", () => {
    const legacyState = reduceActions(buildLegacyDegreeTwoActions({ divergentMetadata: true }));
    const migration = migrateLegacySpliceNodes(toScopedState(legacyState), "Test network");

    const convertedNode = migration.state.nodes.byId[asNodeId("N-S")];
    expect(convertedNode?.kind).toBe("intermediate");
    expect(convertedNode?.kind === "intermediate" ? convertedNode.label : "").toContain(
      `${MIGRATION_NODE_LABEL_PREFIX}SPL-MID`
    );

    expect(migration.state.segments.byId[asSegmentId("SEG-LEFT")]?.lengthMm).toBe(100);
    expect(migration.state.segments.byId[asSegmentId("SEG-RIGHT")]?.lengthMm).toBe(60);

    const splice = migration.state.splices.byId[asSpliceId("S-MID")];
    expect(splice?.placement).toEqual({
      kind: "segmentOffset",
      segmentId: asSegmentId("SEG-LEFT"),
      fromNodeId: asNodeId("N-S"),
      offsetMm: 0
    });
    expect(migration.report.some((entry) => entry.kind === "metadataDivergenceFallback")).toBe(true);
  });

  it("converts branch splice nodes (degree > 2) into intermediate nodes with 0 mm placement", () => {
    const legacyState = reduceActions([
      ...buildLegacyDegreeTwoActions(),
      appActions.upsertConnector({
        id: asConnectorId("C-C"),
        name: "Connector C",
        technicalId: "CONN-C",
        cavityCount: 4
      } as never),
      appActions.upsertNode({ id: asNodeId("N-C"), kind: "connector", connectorId: asConnectorId("C-C") }),
      appActions.upsertSegment({
        id: asSegmentId("SEG-THIRD"),
        nodeA: asNodeId("N-S"),
        nodeB: asNodeId("N-C"),
        lengthMm: 40
      })
    ]);

    const migration = migrateLegacySpliceNodes(toScopedState(legacyState), "Test network");

    const convertedNode = migration.state.nodes.byId[asNodeId("N-S")];
    expect(convertedNode?.kind).toBe("intermediate");

    expect(migration.state.segments.byId[asSegmentId("SEG-LEFT")]).toBeDefined();
    expect(migration.state.segments.byId[asSegmentId("SEG-RIGHT")]).toBeDefined();
    expect(migration.state.segments.byId[asSegmentId("SEG-THIRD")]).toBeDefined();

    const splice = migration.state.splices.byId[asSpliceId("S-MID")];
    expect(splice?.placement).toEqual({
      kind: "segmentOffset",
      segmentId: asSegmentId("SEG-LEFT"),
      fromNodeId: asNodeId("N-S"),
      offsetMm: 0
    });

    const wireToSplice = migration.state.wires.byId[asWireId("W-TO-SPLICE")];
    expect(wireToSplice?.lengthMm).toBe(100);
  });

  it("converts a degree-1 splice node into an intermediate endpoint with 0 mm placement", () => {
    const legacyState = reduceActions([
      appActions.upsertConnector({
        id: asConnectorId("C-A"),
        name: "Connector A",
        technicalId: "CONN-A",
        cavityCount: 4
      } as never),
      appActions.upsertSplice({
        id: asSpliceId("S-END"),
        name: "End Splice",
        technicalId: "SPL-END",
        portCount: 4
      }),
      appActions.upsertNode({ id: asNodeId("N-A"), kind: "connector", connectorId: asConnectorId("C-A") }),
      appActions.upsertNode({ id: asNodeId("N-S"), kind: "splice", spliceId: asSpliceId("S-END") }),
      appActions.upsertSegment({
        id: asSegmentId("SEG-STUB"),
        nodeA: asNodeId("N-A"),
        nodeB: asNodeId("N-S"),
        lengthMm: 80
      })
    ]);

    const migration = migrateLegacySpliceNodes(toScopedState(legacyState), "Test network");

    expect(migration.state.nodes.byId[asNodeId("N-S")]?.kind).toBe("intermediate");
    expect(migration.state.splices.byId[asSpliceId("S-END")]?.placement).toEqual({
      kind: "segmentOffset",
      segmentId: asSegmentId("SEG-STUB"),
      fromNodeId: asNodeId("N-S"),
      offsetMm: 0
    });
  });

  it("removes isolated degree-0 splice nodes and keeps the splice as an unplaced draft", () => {
    const legacyState = reduceActions([
      appActions.upsertSplice({
        id: asSpliceId("S-LONE"),
        name: "Lone Splice",
        technicalId: "SPL-LONE",
        portCount: 2
      }),
      appActions.upsertNode({ id: asNodeId("N-LONE"), kind: "splice", spliceId: asSpliceId("S-LONE") })
    ]);

    const migration = migrateLegacySpliceNodes(toScopedState(legacyState), "Test network");

    expect(migration.state.nodes.byId[asNodeId("N-LONE")]).toBeUndefined();
    expect(migration.state.splices.byId[asSpliceId("S-LONE")]?.placement).toBeUndefined();
    expect(migration.report.some((entry) => entry.kind === "unplacedDraft")).toBe(true);
  });

  it("migrates a v3 workspace snapshot to v4 and exposes the migration report", () => {
    consumeLastSpliceMigrationReport();

    const legacyState = reduceActions(buildLegacyDegreeTwoActions());
    const payload = {
      payloadKind: PERSISTED_STATE_PAYLOAD_KIND,
      schemaVersion: 3,
      appVersion: APP_RELEASE_VERSION,
      appSchemaVersion: APP_SCHEMA_VERSION,
      createdAtIso: "2026-06-01T00:00:00.000Z",
      updatedAtIso: "2026-06-01T00:00:00.000Z",
      state: legacyState
    };

    const attempt = migratePersistedPayloadDetailed(payload, "2026-06-10T00:00:00.000Z");
    expect(attempt.ok).toBe(true);
    if (!attempt.ok) {
      return;
    }

    expect(attempt.wasMigrated).toBe(true);
    expect(attempt.snapshot.schemaVersion).toBe(PERSISTED_STATE_SCHEMA_VERSION);

    const activeNetworkId = attempt.snapshot.state.activeNetworkId;
    expect(activeNetworkId).not.toBeNull();
    const scoped = activeNetworkId === null ? undefined : attempt.snapshot.state.networkStates[activeNetworkId];
    const hasLegacySpliceNode = (scoped?.nodes.allIds ?? []).some(
      (nodeId) => scoped?.nodes.byId[nodeId]?.kind === "splice"
    );
    expect(hasLegacySpliceNode).toBe(false);

    const report = consumeLastSpliceMigrationReport();
    expect(report.length).toBeGreaterThan(0);
    expect(report.some((entry) => entry.kind === "fusion")).toBe(true);
  });
});

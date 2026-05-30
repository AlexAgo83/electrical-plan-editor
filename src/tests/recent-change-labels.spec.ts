import { describe, expect, it } from "vitest";
import { buildUndoHistoryEntry, resolveNodeDisplayRefForTest, resolveSegmentDisplayRefForTest } from "../app/lib/recentChangeLabels";
import type { HarnessAssemblyId } from "../core/entities";
import {
  appActions,
  appReducer,
  createInitialState
} from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId,
  createUiIntegrationState
} from "./helpers/app-ui-test-utils";

function asHarnessAssemblyId(value: string): HarnessAssemblyId {
  return value as HarnessAssemblyId;
}

describe("recent change labels", () => {
  it("uses technical IDs for connector deletes from previous state", () => {
    const previousState = createUiIntegrationState();
    const nextState = appReducer(previousState, appActions.removeConnector(asConnectorId("C1")));
    const entry = buildUndoHistoryEntry(
      appActions.removeConnector(asConnectorId("C1")),
      previousState,
      nextState,
      1,
      "2026-03-27T12:00:00.000Z"
    );

    expect(entry.targetId).toBe("C-1");
    expect(entry.label).toBe("Connector 'C-1' deleted");
  });

  it("resolves connector and splice node labels to linked business references", () => {
    const state = createUiIntegrationState();

    expect(resolveNodeDisplayRefForTest(state, asNodeId("N-C1"))).toBe("C-1");
    expect(resolveNodeDisplayRefForTest(state, asNodeId("N-S1"))).toBe("S-1");
    expect(resolveNodeDisplayRefForTest(state, asNodeId("N-MID"))).toBe("MID");
  });

  it("resolves segments to user-facing IDs before falling back to endpoint labels", () => {
    const state = createUiIntegrationState();

    expect(resolveSegmentDisplayRefForTest(state, asSegmentId("SEG-A"))).toBe("SEG-A");

    const opaqueState = appReducer(
      state,
      appActions.renameSegment(asSegmentId("SEG-A"), asSegmentId("7b5e5d4d-61ee-4eaa-a54f-cb72d17d8bfd"))
    );
    expect(resolveSegmentDisplayRefForTest(opaqueState, asSegmentId("7b5e5d4d-61ee-4eaa-a54f-cb72d17d8bfd"))).toBe("C-1 -> MID");
  });

  it("uses next-state readable references for node create/update entries", () => {
    const previousState = createInitialState();
    const withConnector = appReducer(
      previousState,
      appActions.upsertConnector({
        id: asConnectorId("C-HIST"),
        name: "History connector",
        technicalId: "C-HIST",
        cavityCount: 2
      })
    );
    const action = appActions.upsertNode({
      id: asNodeId("NODE-HIST"),
      kind: "connector",
      connectorId: asConnectorId("C-HIST")
    });
    const nextState = appReducer(withConnector, action);
    const entry = buildUndoHistoryEntry(action, withConnector, nextState, 1, "2026-03-27T12:00:00.000Z");

    expect(entry.targetId).toBe("C-HIST");
    expect(entry.label).toBe("Node 'C-HIST' created");
    expect(entry.detailLabel).toBe("connector node");
  });

  it("uses manufacturer reference for catalog history labels", () => {
    const previousState = createInitialState();
    const action = appActions.upsertCatalogItem({
      id: asCatalogItemId("CAT-HIST"),
      manufacturerReference: "CAT-HIST",
      connectionCount: 6,
      name: "History catalog"
    });
    const nextState = appReducer(previousState, action);
    const entry = buildUndoHistoryEntry(action, previousState, nextState, 1, "2026-03-27T12:00:00.000Z");

    expect(entry.targetId).toBe("CAT-HIST");
    expect(entry.label).toBe("Catalog item 'CAT-HIST' created");
    expect(entry.detailLabel).toBe("6-connection item");
  });

  it("adds network update sub-reasons for recent change logs", () => {
    const previousState = createUiIntegrationState();
    const action = appActions.updateNetwork(
      previousState.activeNetworkId!,
      "Updated network",
      "NET-REV",
      "2026-03-27T12:00:00.000Z",
      "Updated description",
      {
        voltageV: 48,
        author: "Engineering",
        projectCode: "PRJ-42",
        exportNotes: "For review"
      }
    );
    const entry = buildUndoHistoryEntry(action, previousState, appReducer(previousState, action), 1, "2026-03-27T12:00:00.000Z");

    expect(entry.detailLabel).toBe("Identity / Metadata / Export cartouche");
    expect(entry.label).toBe("Network 'NET-REV' identity / metadata / export cartouche updated");
  });

  it("adds harness assembly update sub-reasons for recent change logs", () => {
    const networkState = createUiIntegrationState();
    const assemblyId = asHarnessAssemblyId("ASM-HIST");
    const previousState = appReducer(
      networkState,
      appActions.upsertHarnessAssembly({
        id: assemblyId,
        name: "Main assembly",
        technicalId: "ASM-HIST",
        members: [{ networkId: networkState.activeNetworkId!, color: "#2563eb" }],
        masterConnectorRefs: [],
        connectorLinks: [],
        createdAt: "2026-03-27T11:00:00.000Z",
        updatedAt: "2026-03-27T11:00:00.000Z"
      })
    );
    const action = appActions.upsertHarnessAssembly({
      id: assemblyId,
      name: "Main assembly rev",
      technicalId: "ASM-HIST-REV",
      members: [{ networkId: networkState.activeNetworkId!, color: "#16a34a" }],
      masterConnectorRefs: [{ networkId: networkState.activeNetworkId!, connectorId: asConnectorId("C1") }],
      connectorLinks: [
        {
          id: "LINK-HIST" as never,
          name: "Door link",
          sourceNetworkId: networkState.activeNetworkId!,
          sourceConnectorId: asConnectorId("C1"),
          targetNetworkId: networkState.activeNetworkId!,
          targetConnectorId: asConnectorId("C1")
        }
      ],
      createdAt: "2026-03-27T11:00:00.000Z",
      updatedAt: "2026-03-27T12:00:00.000Z"
    });
    const entry = buildUndoHistoryEntry(action, previousState, appReducer(previousState, action), 1, "2026-03-27T12:00:00.000Z");

    expect(entry.detailLabel).toBe("Identity / Members / Master connectors");
    expect(entry.label).toBe("Workspace 'ASM-HIST-REV' identity / members / master connectors updated");
  });

  it("adds catalog update sub-reasons for recent change logs", () => {
    const previousState = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: asCatalogItemId("CAT-HIST"),
        manufacturerReference: "CAT-HIST",
        connectionCount: 6,
        name: "History catalog"
      })
    );
    const action = appActions.upsertCatalogItem({
      id: asCatalogItemId("CAT-HIST"),
      manufacturerReference: "CAT-HIST",
      connectionCount: 8,
      name: "History catalog",
      unitPriceExclTax: 12.5,
      connectorLayout: {
        version: 1,
        units: "grid",
        width: 4,
        height: 2,
        ways: [
          { cavityIndex: 0, x: 0, y: 0, shape: "round" },
          { cavityIndex: 1, x: 1, y: 0, shape: "round" }
        ]
      }
    });
    const nextState = appReducer(previousState, action);
    const entry = buildUndoHistoryEntry(action, previousState, nextState, 1, "2026-03-27T12:00:00.000Z");

    expect(entry.targetId).toBe("CAT-HIST");
    expect(entry.detailLabel).toBe("Connection count / Pricing / Physical layout");
    expect(entry.label).toBe("Catalog item 'CAT-HIST' connection count / pricing / physical layout updated");
  });

  it("adds connector and splice update sub-reasons for recent change logs", () => {
    const withConnector = appReducer(
      createInitialState(),
      appActions.upsertConnector({
        id: asConnectorId("C-HIST"),
        name: "History connector",
        technicalId: "C-HIST",
        cavityCount: 2
      })
    );
    const connectorAction = appActions.upsertConnector({
      id: asConnectorId("C-HIST"),
      name: "History connector",
      technicalId: "C-HIST-REV",
      cavityCount: 4,
      isMainHarnessConnector: true,
      terminalOverrides: {
        0: { terminalReference: "TERM-A" }
      }
    });
    const connectorEntry = buildUndoHistoryEntry(
      connectorAction,
      withConnector,
      appReducer(withConnector, connectorAction),
      1,
      "2026-03-27T12:00:00.000Z"
    );

    expect(connectorEntry.detailLabel).toBe("Identity / Cavity count / Harness role");
    expect(connectorEntry.label).toBe("Connector 'C-HIST-REV' identity / cavity count / harness role updated");

    const withSplice = appReducer(
      createInitialState(),
      appActions.upsertSplice({
        id: asSpliceId("S-HIST"),
        name: "History splice",
        technicalId: "S-HIST",
        portCount: 2
      })
    );
    const spliceAction = appActions.upsertSplice({
      id: asSpliceId("S-HIST"),
      name: "History splice",
      technicalId: "S-HIST",
      portCount: 4,
      portMode: "directional",
      manufacturerReference: "SPL-CAT"
    });
    const spliceEntry = buildUndoHistoryEntry(
      spliceAction,
      withSplice,
      appReducer(withSplice, spliceAction),
      2,
      "2026-03-27T12:01:00.000Z"
    );

    expect(spliceEntry.detailLabel).toBe("Port count / Port mode / Catalog link");
    expect(spliceEntry.label).toBe("Splice 'S-HIST' port count / port mode / catalog link updated");
  });

  it("keeps readable wire identity for route and delete actions", () => {
    const previousState = createUiIntegrationState();

    const routeEntry = buildUndoHistoryEntry(
      appActions.lockWireRoute(asWireId("W1"), [asSegmentId("SEG-A"), asSegmentId("SEG-B")]),
      previousState,
      appReducer(previousState, appActions.lockWireRoute(asWireId("W1"), [asSegmentId("SEG-A"), asSegmentId("SEG-B")])),
      1,
      "2026-03-27T12:00:00.000Z"
    );
    expect(routeEntry.label).toBe("Wire 'W-1' route locked");
    expect(routeEntry.detailLabel).toBe("2 segment route");

    const deleteEntry = buildUndoHistoryEntry(
      appActions.removeWire(asWireId("W1")),
      previousState,
      appReducer(previousState, appActions.removeWire(asWireId("W1"))),
      2,
      "2026-03-27T12:01:00.000Z"
    );
    expect(deleteEntry.label).toBe("Wire 'W-1' deleted");
  });

  it("adds wire save sub-reasons for recent change logs", () => {
    const previousState = createUiIntegrationState();
    const action = appActions.saveWire({
      id: asWireId("W1"),
      name: "Wire 1",
      technicalId: "W-1",
      twistGroupLabel: "TW-A",
      functionalDomainTag: "door",
      sectionMm2: 1.5,
      currentA: 8,
      material: "copper",
      colorMode: "catalog",
      primaryColorId: "RD",
      secondaryColorId: "BU",
      endpointAConnectionReference: "TERM-A",
      endpointAConnectionName: "Terminal A",
      endpointBConnectionReference: "TERM-B",
      endpointBConnectionName: "Terminal B",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 0 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
      protection: { kind: "fuse", catalogItemId: asCatalogItemId("FUSE-CAT") }
    });
    const entry = buildUndoHistoryEntry(action, previousState, appReducer(previousState, action), 1, "2026-03-27T12:00:00.000Z");

    expect(entry.detailLabel).toBe("Endpoints / Electrical spec / Color");
    expect(entry.label).toBe("Wire 'W-1' endpoints / electrical spec / color updated");
  });

  it("adds node and segment update sub-reasons for recent change logs", () => {
    const previousState = createUiIntegrationState();
    const nodeAction = appActions.upsertNode({
      id: asNodeId("N-MID"),
      kind: "intermediate",
      label: "MID-REV"
    });
    const nodeEntry = buildUndoHistoryEntry(nodeAction, previousState, appReducer(previousState, nodeAction), 1, "2026-03-27T12:00:00.000Z");

    expect(nodeEntry.detailLabel).toBe("Intermediate label");
    expect(nodeEntry.label).toBe("Node 'MID-REV' intermediate label updated");

    const segmentAction = appActions.upsertSegment({
      id: asSegmentId("SEG-A"),
      nodeA: asNodeId("N-C1"),
      nodeB: asNodeId("N-S1"),
      lengthMm: 42,
      subNetworkTag: "BRANCH"
    });
    const segmentEntry = buildUndoHistoryEntry(
      segmentAction,
      previousState,
      appReducer(previousState, segmentAction),
      2,
      "2026-03-27T12:01:00.000Z"
    );

    expect(segmentEntry.detailLabel).toBe("Endpoints / Length / Sub-network");
    expect(segmentEntry.label).toBe("Segment 'SEG-A' endpoints / length / sub-network updated");
  });

  it("keeps layout history labels human-readable via node references", () => {
    const previousState = createUiIntegrationState();
    const action = appActions.setNodePosition(asNodeId("N-C1"), { x: 10, y: 20 });
    const nextState = appReducer(previousState, action);
    const entry = buildUndoHistoryEntry(action, previousState, nextState, 1, "2026-03-27T12:00:00.000Z");

    expect(entry.targetId).toBe("C-1");
    expect(entry.label).toBe("Layout 'C-1' updated");
  });
});

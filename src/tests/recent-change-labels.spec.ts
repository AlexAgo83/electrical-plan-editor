import { describe, expect, it } from "vitest";
import { buildUndoHistoryEntry, resolveNodeDisplayRefForTest, resolveSegmentDisplayRefForTest } from "../app/lib/recentChangeLabels";
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
  asWireId,
  createUiIntegrationState
} from "./helpers/app-ui-test-utils";

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

    const deleteEntry = buildUndoHistoryEntry(
      appActions.removeWire(asWireId("W1")),
      previousState,
      appReducer(previousState, appActions.removeWire(asWireId("W1"))),
      2,
      "2026-03-27T12:01:00.000Z"
    );
    expect(deleteEntry.label).toBe("Wire 'W-1' deleted");
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

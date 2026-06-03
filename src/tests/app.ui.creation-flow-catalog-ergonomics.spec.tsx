import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { clickNewFromPanel, getInspectorPanelIfVisible } from "./helpers/app-ui-form-test-utils";

describe("App integration UI - creation flow catalog ergonomics", () => {
  function createInitialStateWithCatalog() {
    const withPrimaryCatalog = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: asCatalogItemId("CAT-4"),
        manufacturerReference: "CAT-REF-4",
        name: "Catalog Four",
        connectionCount: 4
      })
    );
    return appReducer(
      withPrimaryCatalog,
      appActions.upsertCatalogItem({
        id: asCatalogItemId("CAT-2"),
        manufacturerReference: "CAT-REF-2",
        name: "Catalog Two",
        connectionCount: 2
      })
    );
  }

  beforeEach(() => localStorage.clear());

  it("uses catalog selector for connector and splice forms and updates derived manufacturer references/counts", () => {
    const { store } = renderAppWithState(createInitialStateWithCatalog());
    switchScreenDrawerAware("modeling");

    clickNewFromPanel("Connectors");
    const createConnectorPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(createConnectorPanel).getByLabelText("Functional name"), {
      target: { value: "Connector ref test" }
    });
    fireEvent.change(within(createConnectorPanel).getByLabelText("Technical ID"), {
      target: { value: "C-REF-1" }
    });
    expect(within(createConnectorPanel).queryByLabelText("Manufacturer reference")).not.toBeInTheDocument();
    fireEvent.change(within(createConnectorPanel).getByLabelText("Catalog item (manufacturer reference)"), {
      target: { value: "CAT-2" }
    });
    expect(within(createConnectorPanel).getByDisplayValue("CAT-REF-2 - Catalog Two (2)")).toBeInTheDocument();
    expect(within(createConnectorPanel).getByLabelText("Way count (from catalog)")).toHaveValue(2);
    expect(within(createConnectorPanel).getByRole("button", { name: "Manufacturer reference: CAT-REF-2" })).toBeInTheDocument();
    fireEvent.click(within(createConnectorPanel).getByRole("button", { name: "Create" }));

    let state = store.getState();
    const connectorId = state.connectors.allIds.find((id) => state.connectors.byId[id]?.technicalId === "C-REF-1");
    expect(connectorId).toBeDefined();
    if (connectorId === undefined) {
      throw new Error("Expected created connector C-REF-1.");
    }
    expect(state.connectors.byId[connectorId]?.manufacturerReference).toBe("CAT-REF-2");
    expect(state.connectors.byId[connectorId]?.catalogItemId).toBe("CAT-2");
    expect(state.connectors.byId[connectorId]?.cavityCount).toBe(2);
    let inspectorPanel = getInspectorPanelIfVisible();
    if (inspectorPanel !== null) {
      expect(within(inspectorPanel).getByText("Manufacturer reference")).toBeInTheDocument();
      expect(within(inspectorPanel).getByText("CAT-REF-2")).toBeInTheDocument();
    }

    const editConnectorPanel = getPanelByHeading("Edit Connector");
    fireEvent.change(within(editConnectorPanel).getByLabelText("Catalog item (manufacturer reference)"), {
      target: { value: "CAT-4" }
    });
    expect(within(editConnectorPanel).getByLabelText("Way count (from catalog)")).toHaveValue(4);
    fireEvent.click(within(editConnectorPanel).getByRole("button", { name: "Save" }));
    state = store.getState();
    expect(state.connectors.byId[connectorId]?.manufacturerReference).toBe("CAT-REF-4");
    expect(state.connectors.byId[connectorId]?.catalogItemId).toBe("CAT-4");
    expect(state.connectors.byId[connectorId]?.cavityCount).toBe(4);
    inspectorPanel = getInspectorPanelIfVisible();
    if (inspectorPanel !== null) {
      expect(within(inspectorPanel).getByText("CAT-REF-4")).toBeInTheDocument();
    }

    switchSubScreenDrawerAware("splice");
    clickNewFromPanel("Splices");
    const createSplicePanel = getPanelByHeading("Create Splice");
    fireEvent.change(within(createSplicePanel).getByLabelText("Functional name"), {
      target: { value: "Splice ref test" }
    });
    fireEvent.change(within(createSplicePanel).getByLabelText("Technical ID"), {
      target: { value: "S-REF-1" }
    });
    expect(within(createSplicePanel).queryByLabelText("Manufacturer reference")).not.toBeInTheDocument();
    fireEvent.change(within(createSplicePanel).getByLabelText("Catalog item (manufacturer reference)"), {
      target: { value: "CAT-2" }
    });
    expect(within(createSplicePanel).getByDisplayValue("CAT-REF-2 - Catalog Two (2)")).toBeInTheDocument();
    expect(within(createSplicePanel).getByLabelText("Port count (from catalog)")).toHaveValue(2);
    expect(within(createSplicePanel).getByRole("button", { name: "Manufacturer reference: CAT-REF-2" })).toBeInTheDocument();
    fireEvent.click(within(createSplicePanel).getByRole("button", { name: "Create" }));

    state = store.getState();
    const spliceId = state.splices.allIds.find((id) => state.splices.byId[id]?.technicalId === "S-REF-1");
    expect(spliceId).toBeDefined();
    if (spliceId === undefined) {
      throw new Error("Expected created splice S-REF-1.");
    }
    expect(state.splices.byId[spliceId]?.manufacturerReference).toBe("CAT-REF-2");
    expect(state.splices.byId[spliceId]?.catalogItemId).toBe("CAT-2");
    expect(state.splices.byId[spliceId]?.portCount).toBe(2);
    inspectorPanel = getInspectorPanelIfVisible();
    if (inspectorPanel !== null) {
      expect(within(inspectorPanel).getByText("Manufacturer reference")).toBeInTheDocument();
      expect(within(inspectorPanel).getByText("CAT-REF-2")).toBeInTheDocument();
    }

    const editSplicePanel = getPanelByHeading("Edit Splice");
    fireEvent.change(within(editSplicePanel).getByLabelText("Catalog item (manufacturer reference)"), {
      target: { value: "CAT-4" }
    });
    expect(within(editSplicePanel).getByLabelText("Port count (from catalog)")).toHaveValue(4);
    fireEvent.click(within(editSplicePanel).getByRole("button", { name: "Save" }));
    expect(store.getState().splices.byId[spliceId]?.manufacturerReference).toBe("CAT-REF-4");
    expect(store.getState().splices.byId[spliceId]?.catalogItemId).toBe("CAT-4");
    expect(store.getState().splices.byId[spliceId]?.portCount).toBe(4);
    inspectorPanel = getInspectorPanelIfVisible();
    if (inspectorPanel !== null) {
      expect(within(inspectorPanel).getByText("CAT-REF-4")).toBeInTheDocument();
    }
  });

  it("clears connector terminal and seal overrides from catalog material analysis", () => {
    const connectorId = asConnectorId("C-OVERRIDE");
    const otherConnectorId = asConnectorId("C-OTHER");
    const state = [
      appActions.upsertConnector({
        id: connectorId,
        name: "Override connector",
        technicalId: "C-OVERRIDE",
        cavityCount: 4,
        catalogItemId: asCatalogItemId("CAT-4"),
        manufacturerReference: "CAT-REF-4",
        terminalOverrides: {
          1: {
            terminalReference: "TERM-OLD",
            terminalName: "Old terminal",
            sealReference: "SEAL-OLD",
            sealName: "Old seal"
          }
        }
      }),
      appActions.upsertConnector({
        id: otherConnectorId,
        name: "Other connector",
        technicalId: "C-OTHER",
        cavityCount: 4,
        catalogItemId: asCatalogItemId("CAT-4"),
        manufacturerReference: "CAT-REF-4"
      }),
      appActions.upsertSplice({
        id: asSpliceId("S-OVERRIDE"),
        name: "Override splice",
        technicalId: "S-OVERRIDE",
        portCount: 4
      }),
      appActions.upsertNode({ id: asNodeId("N-C-OVERRIDE"), kind: "connector", connectorId }),
      appActions.upsertNode({ id: asNodeId("N-C-OTHER"), kind: "connector", connectorId: otherConnectorId }),
      appActions.upsertNode({ id: asNodeId("N-S-OVERRIDE"), kind: "splice", spliceId: asSpliceId("S-OVERRIDE") }),
      appActions.upsertSegment({
        id: asSegmentId("SEG-OVERRIDE-A"),
        nodeA: asNodeId("N-C-OVERRIDE"),
        nodeB: asNodeId("N-S-OVERRIDE"),
        lengthMm: 100
      }),
      appActions.upsertSegment({
        id: asSegmentId("SEG-OVERRIDE-B"),
        nodeA: asNodeId("N-C-OTHER"),
        nodeB: asNodeId("N-C-OVERRIDE"),
        lengthMm: 100
      }),
      appActions.saveWire({
        id: asWireId("W-OVERRIDE-A"),
        name: "Target side A",
        technicalId: "W-OVERRIDE-A",
        endpointA: { kind: "connectorCavity", connectorId, cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-OVERRIDE"), portIndex: 1 },
        endpointAConnectionReference: "TERM-A",
        endpointAConnectionName: "Terminal A",
        endpointASealReference: "SEAL-A",
        endpointASealName: "Seal A",
        endpointBConnectionReference: "TERM-B-KEEP",
        endpointBConnectionName: "Terminal B keep",
        endpointBSealReference: "SEAL-B-KEEP",
        endpointBSealName: "Seal B keep"
      }),
      appActions.saveWire({
        id: asWireId("W-OVERRIDE-B"),
        name: "Target side B",
        technicalId: "W-OVERRIDE-B",
        endpointA: { kind: "connectorCavity", connectorId: otherConnectorId, cavityIndex: 1 },
        endpointB: { kind: "connectorCavity", connectorId, cavityIndex: 2 },
        endpointAConnectionReference: "TERM-A-KEEP",
        endpointAConnectionName: "Terminal A keep",
        endpointASealReference: "SEAL-A-KEEP",
        endpointASealName: "Seal A keep",
        endpointBConnectionReference: "TERM-B",
        endpointBConnectionName: "Terminal B",
        endpointBSealReference: "SEAL-B",
        endpointBSealName: "Seal B"
      })
    ].reduce(appReducer, createInitialStateWithCatalog());
    const { store } = renderAppWithState(state);
    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("connector");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Override connector"));
    const connectorAnalysisPanel = getPanelByHeading("Connector analysis");
    fireEvent.click(within(connectorAnalysisPanel).getByRole("button", { name: "Catalog material" }));
    const overridesInput = within(connectorAnalysisPanel).getByLabelText("Terminal and seal overrides");
    expect(overridesInput).toHaveValue("1,TERM-OLD,SEAL-OLD,Old terminal,Old seal");

    const actionButtons = within(connectorAnalysisPanel)
      .getAllByRole("button")
      .map((button) => button.textContent?.trim())
      .filter((text): text is string => text === "Save material application" || text === "Clear terminal and seal overrides");
    expect(actionButtons).toEqual(["Save material application", "Clear terminal and seal overrides"]);

    const clearButton = within(connectorAnalysisPanel).getByRole("button", { name: "Clear terminal and seal overrides" });
    expect(clearButton).toBeEnabled();
    fireEvent.click(clearButton);
    expect(overridesInput).toHaveValue("");

    const clearedSideA = store.getState().wires.byId[asWireId("W-OVERRIDE-A")];
    expect(clearedSideA?.endpointAConnectionReference).toBeUndefined();
    expect(clearedSideA?.endpointAConnectionName).toBeUndefined();
    expect(clearedSideA?.endpointASealReference).toBeUndefined();
    expect(clearedSideA?.endpointASealName).toBeUndefined();
    expect(clearedSideA?.endpointBConnectionReference).toBe("TERM-B-KEEP");
    expect(clearedSideA?.endpointBConnectionName).toBe("Terminal B keep");
    expect(clearedSideA?.endpointBSealReference).toBe("SEAL-B-KEEP");
    expect(clearedSideA?.endpointBSealName).toBe("Seal B keep");

    const clearedSideB = store.getState().wires.byId[asWireId("W-OVERRIDE-B")];
    expect(clearedSideB?.endpointAConnectionReference).toBe("TERM-A-KEEP");
    expect(clearedSideB?.endpointAConnectionName).toBe("Terminal A keep");
    expect(clearedSideB?.endpointASealReference).toBe("SEAL-A-KEEP");
    expect(clearedSideB?.endpointASealName).toBe("Seal A keep");
    expect(clearedSideB?.endpointBConnectionReference).toBeUndefined();
    expect(clearedSideB?.endpointBConnectionName).toBeUndefined();
    expect(clearedSideB?.endpointBSealReference).toBeUndefined();
    expect(clearedSideB?.endpointBSealName).toBeUndefined();

    fireEvent.click(within(connectorAnalysisPanel).getByRole("button", { name: "Save material application" }));
    expect(store.getState().connectors.byId[connectorId]?.terminalOverrides).toBeUndefined();
  });

  it("opens linked catalog items from connector and splice edit form manufacturer references", () => {
    const catalogItemId = asCatalogItemId("CAT-2");
    const stateWithLinkedEntities = appReducer(
      appReducer(
        appReducer(
          createInitialState(),
          appActions.upsertCatalogItem({
            id: catalogItemId,
            manufacturerReference: "CAT-REF-2",
            name: "Catalog Two",
            connectionCount: 2
          })
        ),
        appActions.upsertConnector({
          id: asConnectorId("C-LINK"),
          name: "Linked connector",
          technicalId: "C-LINK",
          catalogItemId,
          manufacturerReference: "CAT-REF-2",
          cavityCount: 2
        })
      ),
      appActions.upsertSplice({
        id: asSpliceId("S-LINK"),
        name: "Linked splice",
        technicalId: "S-LINK",
        catalogItemId,
        manufacturerReference: "CAT-REF-2",
        portCount: 2
      })
    );

    renderAppWithState(stateWithLinkedEntities);
    switchScreenDrawerAware("modeling");

    fireEvent.click(within(getPanelByHeading("Connectors")).getByText("Linked connector"));
    fireEvent.click(
      within(getPanelByHeading("Edit Connector")).getByRole("button", { name: "Manufacturer reference: CAT-REF-2" })
    );
    expect(within(getPanelByHeading("Catalog")).getByText("CAT-REF-2")).toBeInTheDocument();
    expect(within(getPanelByHeading("Edit catalog item")).getByLabelText("Manufacturer reference")).toHaveValue("CAT-REF-2");

    switchSubScreenDrawerAware("splice");
    fireEvent.click(within(getPanelByHeading("Splices")).getByText("Linked splice"));
    fireEvent.click(
      within(getPanelByHeading("Edit Splice")).getByRole("button", { name: "Manufacturer reference: CAT-REF-2" })
    );
    expect(within(getPanelByHeading("Catalog")).getByText("CAT-REF-2")).toBeInTheDocument();
    expect(within(getPanelByHeading("Edit catalog item")).getByLabelText("Manufacturer reference")).toHaveValue("CAT-REF-2");
  });
});

import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState } from "../store";
import {
  asCatalogItemId,
  createUiIntegrationDenseWiresState,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - creation flow ergonomics", () => {
  function createInitialStateWithCatalog() {
    const withPrimaryCatalog = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({ id: asCatalogItemId("CAT-4"), manufacturerReference: "CAT-REF-4", connectionCount: 4 })
    );
    return appReducer(
      withPrimaryCatalog,
      appActions.upsertCatalogItem({ id: asCatalogItemId("CAT-2"), manufacturerReference: "CAT-REF-2", connectionCount: 2 })
    );
  }

  function clickNewFromPanel(panelHeading: "Connectors" | "Splices" | "Nodes" | "Segments" | "Wires"): void {
    fireEvent.click(within(getPanelByHeading(panelHeading)).getByRole("button", { name: "New" }));
  }

  function getInspectorPanelIfVisible(): HTMLElement | null {
    return screen.queryByRole("heading", { name: "Inspector context" }) !== null ? getPanelByHeading("Inspector context") : null;
  }

  beforeEach(() => localStorage.clear());

  it("prefills IDs in create mode for connectors, splices, nodes, segments, and wires without overwriting manual edits", () => {
    renderAppWithState(createInitialState());
    switchScreenDrawerAware("modeling");

    clickNewFromPanel("Connectors");
    const createConnectorPanel = getPanelByHeading("Create Connector");
    const connectorTechnicalIdInput = within(createConnectorPanel).getByLabelText("Technical ID");
    expect(connectorTechnicalIdInput).toHaveValue("C-001");

    fireEvent.change(connectorTechnicalIdInput, { target: { value: "C-CUSTOM-42" } });
    fireEvent.change(within(createConnectorPanel).getByLabelText("Functional name"), {
      target: { value: "Manual connector" }
    });
    expect(connectorTechnicalIdInput).toHaveValue("C-CUSTOM-42");

    switchSubScreenDrawerAware("splice");
    clickNewFromPanel("Splices");
    const createSplicePanel = getPanelByHeading("Create Splice");
    const spliceTechnicalIdInput = within(createSplicePanel).getByLabelText("Technical ID");
    expect(spliceTechnicalIdInput).toHaveValue("S-001");

    switchSubScreenDrawerAware("node");
    clickNewFromPanel("Nodes");
    const createNodePanel = getPanelByHeading("Create Node");
    expect(within(createNodePanel).getByLabelText("Node ID")).toHaveValue("N-001");

    switchSubScreenDrawerAware("segment");
    clickNewFromPanel("Segments");
    const createSegmentPanel = getPanelByHeading("Create Segment");
    expect(within(createSegmentPanel).getByLabelText("Segment ID")).toHaveValue("SEG-001");

    switchSubScreenDrawerAware("wire");
    clickNewFromPanel("Wires");
    const createWirePanel = getPanelByHeading("Create Wire");
    expect(within(createWirePanel).getByLabelText("Technical ID")).toHaveValue("W-001");
  }, 10_000);

  it("focuses the created connector row and switches the form to edit mode after creation", async () => {
    renderAppWithState(createInitialStateWithCatalog());
    switchScreenDrawerAware("modeling");

    clickNewFromPanel("Connectors");
    const connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), {
      target: { value: "Focused connector" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Technical ID"), {
      target: { value: "C-FOCUS-1" }
    });
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));

    const connectorsPanel = getPanelByHeading("Connectors");
    const createdRow = within(connectorsPanel).getByText("Focused connector").closest("tr");
    expect(createdRow).not.toBeNull();
    expect(getPanelByHeading("Edit Connector")).toBeInTheDocument();

    await waitFor(() => {
      expect(createdRow).toHaveClass("is-selected");
      expect(document.activeElement).toBe(createdRow);
    });
  });

  it("auto-creates linked connector and splice nodes when creating entities", () => {
    renderAppWithState(createInitialStateWithCatalog());
    switchScreenDrawerAware("modeling");

    clickNewFromPanel("Connectors");
    const connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), {
      target: { value: "Auto node connector" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Catalog item (manufacturer reference)"), {
      target: { value: "CAT-2" }
    });
    expect(within(connectorFormPanel).getByLabelText("Way count (from catalog)")).toHaveValue(2);
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));

    switchSubScreenDrawerAware("splice");
    clickNewFromPanel("Splices");
    const spliceFormPanel = getPanelByHeading("Create Splice");
    fireEvent.change(within(spliceFormPanel).getByLabelText("Functional name"), {
      target: { value: "Auto node splice" }
    });
    fireEvent.change(within(spliceFormPanel).getByLabelText("Catalog item (manufacturer reference)"), {
      target: { value: "CAT-2" }
    });
    expect(within(spliceFormPanel).getByLabelText("Port count (from catalog)")).toHaveValue(2);
    fireEvent.click(within(spliceFormPanel).getByRole("button", { name: "Create" }));

    switchSubScreenDrawerAware("node");
    const nodesPanel = getPanelByHeading("Nodes");
    expect(within(nodesPanel).getByText("Auto node connector (C-001)")).toBeInTheDocument();
    expect(within(nodesPanel).getByText("Auto node splice (S-001)")).toBeInTheDocument();
  });

  it("allows disabling linked node auto-creation per connector/splice create form", () => {
    renderAppWithState(createInitialState());
    switchScreenDrawerAware("modeling");

    clickNewFromPanel("Connectors");
    const connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), {
      target: { value: "Manual node connector" }
    });
    fireEvent.click(within(connectorFormPanel).getByLabelText("Auto-create linked node on connector creation"));
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));

    switchSubScreenDrawerAware("splice");
    clickNewFromPanel("Splices");
    const spliceFormPanel = getPanelByHeading("Create Splice");
    fireEvent.change(within(spliceFormPanel).getByLabelText("Functional name"), {
      target: { value: "Manual node splice" }
    });
    fireEvent.click(within(spliceFormPanel).getByLabelText("Auto-create linked node on splice creation"));
    fireEvent.click(within(spliceFormPanel).getByRole("button", { name: "Create" }));

    switchSubScreenDrawerAware("node");
    const nodesPanel = getPanelByHeading("Nodes");
    expect(within(nodesPanel).queryByText(/Manual node connector/)).not.toBeInTheDocument();
    expect(within(nodesPanel).queryByText(/Manual node splice/)).not.toBeInTheDocument();
  });

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
    expect(within(createConnectorPanel).getByLabelText("Way count (from catalog)")).toHaveValue(2);
    expect(within(createConnectorPanel).getByText("Manufacturer reference: CAT-REF-2")).toBeInTheDocument();
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
    expect(within(createSplicePanel).getByLabelText("Port count (from catalog)")).toHaveValue(2);
    expect(within(createSplicePanel).getByText("Manufacturer reference: CAT-REF-2")).toBeInTheDocument();
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

  it("allows editing a node ID in edit mode and saves the renamed node", () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("node");

    const nodesPanel = getPanelByHeading("Nodes");
    fireEvent.click(within(nodesPanel).getByText("N-MID"));

    const editNodePanel = getPanelByHeading("Edit Node");
    const nodeIdInput = within(editNodePanel).getByLabelText("Node ID");
    expect(nodeIdInput).toBeEnabled();
    expect(within(editNodePanel).getByText(/Changing Node ID renames the node/i)).toBeInTheDocument();

    fireEvent.change(nodeIdInput, { target: { value: "N-MID-REN" } });
    fireEvent.click(within(editNodePanel).getByRole("button", { name: "Save" }));

    expect(within(nodesPanel).getByText("N-MID-REN")).toBeInTheDocument();
    expect(within(nodesPanel).queryByText("N-MID")).not.toBeInTheDocument();
  });

  it("returns focus to the edited row after Save in modeling edit forms", async () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    const connectorRow = within(connectorsPanel).getByText("Connector 1").closest("tr");
    expect(connectorRow).not.toBeNull();
    if (connectorRow === null) {
      throw new Error("Missing connector row for focus test.");
    }
    fireEvent.click(connectorRow);
    const editConnectorPanel = getPanelByHeading("Edit Connector");
    fireEvent.change(within(editConnectorPanel).getByLabelText("Functional name"), {
      target: { value: "Power Source Connector Focus" }
    });
    fireEvent.click(within(editConnectorPanel).getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(document.activeElement).toBe(connectorRow);
    });
    expect(getPanelByHeading("Edit Connector")).toBeInTheDocument();

    switchSubScreenDrawerAware("node");
    const nodesPanel = getPanelByHeading("Nodes");
    const nodeRow = within(nodesPanel).getByText("N-MID").closest("tr");
    expect(nodeRow).not.toBeNull();
    if (nodeRow === null) {
      throw new Error("Missing node row for focus test.");
    }
    fireEvent.click(nodeRow);
    const editNodePanel = getPanelByHeading("Edit Node");
    fireEvent.change(within(editNodePanel).getByLabelText("Label"), { target: { value: "MID focus" } });
    fireEvent.click(within(editNodePanel).getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(document.activeElement).toBe(nodeRow);
    });
    expect(getPanelByHeading("Edit Node")).toBeInTheDocument();

    switchSubScreenDrawerAware("wire");
    const wiresPanel = getPanelByHeading("Wires");
    const wireRow = within(wiresPanel).getByText("Wire 1").closest("tr");
    expect(wireRow).not.toBeNull();
    if (wireRow === null) {
      throw new Error("Missing wire row for focus test.");
    }
    fireEvent.click(wireRow);
    const editWirePanel = getPanelByHeading("Edit Wire");
    fireEvent.change(within(editWirePanel).getByLabelText("Functional name"), { target: { value: "Signal A Focus" } });
    fireEvent.click(within(editWirePanel).getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(document.activeElement).toBe(wireRow);
    });
    expect(getPanelByHeading("Edit Wire")).toBeInTheDocument();
  });

  it("prefills the next free endpoint way/port in wire create mode and keeps manual edits until context changes", () => {
    renderAppWithState(createUiIntegrationDenseWiresState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    clickNewFromPanel("Wires");
    const createWirePanel = getPanelByHeading("Create Wire");

    const endpointAFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint A" });
    const endpointBFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint B" });

    fireEvent.change(within(endpointAFieldset).getByLabelText("Connector"), { target: { value: "C1" } });
    expect(within(endpointAFieldset).getByLabelText("Way index")).toHaveValue(5);

    fireEvent.change(within(endpointBFieldset).getByLabelText("Splice"), { target: { value: "S1" } });
    expect(within(endpointBFieldset).getByLabelText("Port index")).toHaveValue(5);

    fireEvent.change(within(endpointAFieldset).getByLabelText("Way index"), { target: { value: "6" } });
    fireEvent.change(within(createWirePanel).getByLabelText("Functional name"), { target: { value: "Draft wire" } });
    expect(within(endpointAFieldset).getByLabelText("Way index")).toHaveValue(6);

    fireEvent.change(within(endpointAFieldset).getByLabelText("Connector"), { target: { value: "C2" } });
    expect(within(endpointAFieldset).getByLabelText("Way index")).toHaveValue(6);

    fireEvent.change(within(endpointAFieldset).getByLabelText("Connector"), { target: { value: "C1" } });
    expect(within(endpointAFieldset).getByLabelText("Way index")).toHaveValue(5);
  });

  it("shows endpoint occupancy hints in wire create/edit and excludes the edited wire current slot", () => {
    renderAppWithState(createUiIntegrationDenseWiresState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    const wiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(wiresPanel).getByText("Wire 1"));
    const editWirePanel = getPanelByHeading("Edit Wire");
    const endpointAEditFieldset = within(editWirePanel).getByRole("group", { name: "Endpoint A" });

    expect(within(endpointAEditFieldset).queryByText(/already occupied/i)).not.toBeInTheDocument();
    fireEvent.change(within(endpointAEditFieldset).getByLabelText("Way index"), { target: { value: "2" } });
    expect(within(endpointAEditFieldset).getByText(/Way 2 is already occupied/i)).toBeInTheDocument();

    fireEvent.click(within(editWirePanel).getByRole("button", { name: "Cancel edit" }));

    clickNewFromPanel("Wires");
    const createWirePanel = getPanelByHeading("Create Wire");
    const endpointACreateFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint A" });
    fireEvent.change(within(endpointACreateFieldset).getByLabelText("Connector"), { target: { value: "C1" } });
    fireEvent.change(within(endpointACreateFieldset).getByLabelText("Way index"), { target: { value: "2" } });
    expect(within(endpointACreateFieldset).getByText(/Suggested: way 5/i)).toBeInTheDocument();
  });

  it("supports optional wire colors with primary/secondary selectors and normalizes duplicate bi-color to mono-color", () => {
    renderAppWithState(createUiIntegrationDenseWiresState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    clickNewFromPanel("Wires");
    const createWirePanel = getPanelByHeading("Create Wire");
    const colorModeSelect = within(createWirePanel).getByLabelText("Color mode");

    expect(colorModeSelect).toHaveValue("none");
    expect(within(createWirePanel).getByLabelText("Primary color")).toBeDisabled();
    expect(within(createWirePanel).getAllByText("No color").length).toBeGreaterThan(0);

    fireEvent.change(colorModeSelect, { target: { value: "catalog" } });
    const primaryColorSelect = within(createWirePanel).getByLabelText("Primary color");
    const secondaryColorSelect = within(createWirePanel).getByLabelText("Secondary color");

    expect(primaryColorSelect).toHaveValue("");
    expect(secondaryColorSelect).toBeDisabled();
    expect(within(createWirePanel).getAllByText("No color").length).toBeGreaterThan(0);

    fireEvent.change(primaryColorSelect, { target: { value: "RD" } });
    expect(secondaryColorSelect).toBeEnabled();
    fireEvent.change(secondaryColorSelect, { target: { value: "RD" } });

    const endpointAFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint A" });
    const endpointBFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint B" });
    fireEvent.change(within(createWirePanel).getByLabelText("Functional name"), { target: { value: "Color test wire" } });
    fireEvent.change(within(createWirePanel).getByLabelText("Technical ID"), { target: { value: "W-COLOR-1" } });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Connector"), { target: { value: "C1" } });
    fireEvent.change(within(endpointBFieldset).getByLabelText("Splice"), { target: { value: "S1" } });
    fireEvent.click(within(createWirePanel).getByRole("button", { name: "Create" }));

    const editWirePanel = getPanelByHeading("Edit Wire");
    expect(within(editWirePanel).getByLabelText("Primary color")).toHaveValue("RD");
    expect(within(editWirePanel).getByLabelText("Secondary color")).toHaveValue("");
    const wiresPanel = getPanelByHeading("Wires");
    const wireRow = within(wiresPanel).getByText("Color test wire").closest("tr");
    expect(wireRow).not.toBeNull();
    if (wireRow !== null) {
      expect(within(wireRow).getByText("0.5")).toBeInTheDocument();
      expect(within(wireRow).getByText("RD")).toBeInTheDocument();
    }
    const inspectorPanel = getInspectorPanelIfVisible();
    if (inspectorPanel !== null) {
      expect(within(inspectorPanel).getByText("Cable colors")).toBeInTheDocument();
      expect(within(inspectorPanel).getByText("Red")).toBeInTheDocument();
    }
  });

});

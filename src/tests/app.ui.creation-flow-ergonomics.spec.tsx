import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "../store";
import {
  createUiIntegrationDenseWiresState,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - creation flow ergonomics", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("prefills IDs in create mode for connectors, splices, nodes, segments, and wires without overwriting manual edits", () => {
    renderAppWithState(createInitialState());
    switchScreenDrawerAware("modeling");

    const idleConnectorFormPanel = getPanelByHeading("Connector form");
    fireEvent.click(within(idleConnectorFormPanel).getByRole("button", { name: "Create" }));
    const createConnectorPanel = getPanelByHeading("Create Connector");
    const connectorTechnicalIdInput = within(createConnectorPanel).getByLabelText("Technical ID");
    expect(connectorTechnicalIdInput).toHaveValue("C-001");

    fireEvent.change(connectorTechnicalIdInput, { target: { value: "C-CUSTOM-42" } });
    fireEvent.change(within(createConnectorPanel).getByLabelText("Functional name"), {
      target: { value: "Manual connector" }
    });
    expect(connectorTechnicalIdInput).toHaveValue("C-CUSTOM-42");

    switchSubScreenDrawerAware("splice");
    const idleSpliceFormPanel = getPanelByHeading("Splice form");
    fireEvent.click(within(idleSpliceFormPanel).getByRole("button", { name: "Create" }));
    const createSplicePanel = getPanelByHeading("Create Splice");
    const spliceTechnicalIdInput = within(createSplicePanel).getByLabelText("Technical ID");
    expect(spliceTechnicalIdInput).toHaveValue("S-001");

    switchSubScreenDrawerAware("node");
    const idleNodeFormPanel = getPanelByHeading("Node form");
    fireEvent.click(within(idleNodeFormPanel).getByRole("button", { name: "Create" }));
    const createNodePanel = getPanelByHeading("Create Node");
    expect(within(createNodePanel).getByLabelText("Node ID")).toHaveValue("N-001");

    switchSubScreenDrawerAware("segment");
    const idleSegmentFormPanel = getPanelByHeading("Segment form");
    fireEvent.click(within(idleSegmentFormPanel).getByRole("button", { name: "Create" }));
    const createSegmentPanel = getPanelByHeading("Create Segment");
    expect(within(createSegmentPanel).getByLabelText("Segment ID")).toHaveValue("SEG-001");

    switchSubScreenDrawerAware("wire");
    const idleWireFormPanel = getPanelByHeading("Wire form");
    fireEvent.click(within(idleWireFormPanel).getByRole("button", { name: "Create" }));
    const createWirePanel = getPanelByHeading("Create Wire");
    expect(within(createWirePanel).getByLabelText("Technical ID")).toHaveValue("W-001");
  }, 10_000);

  it("focuses the created connector row and switches the form to edit mode after creation", async () => {
    renderAppWithState(createInitialState());
    switchScreenDrawerAware("modeling");

    const idleConnectorFormPanel = getPanelByHeading("Connector form");
    fireEvent.click(within(idleConnectorFormPanel).getByRole("button", { name: "Create" }));
    const connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), {
      target: { value: "Focused connector" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Technical ID"), {
      target: { value: "C-FOCUS-1" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Way count"), {
      target: { value: "3" }
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
    renderAppWithState(createInitialState());
    switchScreenDrawerAware("modeling");

    const idleConnectorFormPanel = getPanelByHeading("Connector form");
    fireEvent.click(within(idleConnectorFormPanel).getByRole("button", { name: "Create" }));
    const connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), {
      target: { value: "Auto node connector" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Way count"), {
      target: { value: "2" }
    });
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));

    switchSubScreenDrawerAware("splice");
    const idleSpliceFormPanel = getPanelByHeading("Splice form");
    fireEvent.click(within(idleSpliceFormPanel).getByRole("button", { name: "Create" }));
    const spliceFormPanel = getPanelByHeading("Create Splice");
    fireEvent.change(within(spliceFormPanel).getByLabelText("Functional name"), {
      target: { value: "Auto node splice" }
    });
    fireEvent.change(within(spliceFormPanel).getByLabelText("Port count"), {
      target: { value: "2" }
    });
    fireEvent.click(within(spliceFormPanel).getByRole("button", { name: "Create" }));

    switchSubScreenDrawerAware("node");
    const nodesPanel = getPanelByHeading("Nodes");
    expect(within(nodesPanel).getByText("Auto node connector (C-001)")).toBeInTheDocument();
    expect(within(nodesPanel).getByText("Auto node splice (S-001)")).toBeInTheDocument();
  });

  it("allows disabling linked node auto-creation per connector/splice create form", () => {
    renderAppWithState(createInitialState());
    switchScreenDrawerAware("modeling");

    fireEvent.click(within(getPanelByHeading("Connector form")).getByRole("button", { name: "Create" }));
    const connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), {
      target: { value: "Manual node connector" }
    });
    fireEvent.click(within(connectorFormPanel).getByLabelText("Auto-create linked node on connector creation"));
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));

    switchSubScreenDrawerAware("splice");
    fireEvent.click(within(getPanelByHeading("Splice form")).getByRole("button", { name: "Create" }));
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

  it("supports optional manufacturer references on connector and splice forms with trim and clear flows", () => {
    const { store } = renderAppWithState(createInitialState());
    switchScreenDrawerAware("modeling");

    fireEvent.click(within(getPanelByHeading("Connector form")).getByRole("button", { name: "Create" }));
    const createConnectorPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(createConnectorPanel).getByLabelText("Functional name"), {
      target: { value: "Connector ref test" }
    });
    fireEvent.change(within(createConnectorPanel).getByLabelText("Technical ID"), {
      target: { value: "C-REF-1" }
    });
    fireEvent.change(within(createConnectorPanel).getByLabelText("Manufacturer reference"), {
      target: { value: "  TE-1-967616-1  " }
    });
    fireEvent.click(within(createConnectorPanel).getByRole("button", { name: "Create" }));

    let state = store.getState();
    const connectorId = state.connectors.allIds.find((id) => state.connectors.byId[id]?.technicalId === "C-REF-1");
    expect(connectorId).toBeDefined();
    if (connectorId === undefined) {
      throw new Error("Expected created connector C-REF-1.");
    }
    expect(state.connectors.byId[connectorId]?.manufacturerReference).toBe("TE-1-967616-1");
    let inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).getByText("Manufacturer reference")).toBeInTheDocument();
    expect(within(inspectorPanel).getByText("TE-1-967616-1")).toBeInTheDocument();

    const editConnectorPanel = getPanelByHeading("Edit Connector");
    fireEvent.change(within(editConnectorPanel).getByLabelText("Manufacturer reference"), { target: { value: "   " } });
    fireEvent.click(within(editConnectorPanel).getByRole("button", { name: "Save" }));
    state = store.getState();
    expect(state.connectors.byId[connectorId]?.manufacturerReference).toBeUndefined();
    inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).queryByText("TE-1-967616-1")).not.toBeInTheDocument();

    switchSubScreenDrawerAware("splice");
    fireEvent.click(within(getPanelByHeading("Splice form")).getByRole("button", { name: "Create" }));
    const createSplicePanel = getPanelByHeading("Create Splice");
    fireEvent.change(within(createSplicePanel).getByLabelText("Functional name"), {
      target: { value: "Splice ref test" }
    });
    fireEvent.change(within(createSplicePanel).getByLabelText("Technical ID"), {
      target: { value: "S-REF-1" }
    });
    fireEvent.change(within(createSplicePanel).getByLabelText("Manufacturer reference"), {
      target: { value: "  AMP/SEAL-42  " }
    });
    fireEvent.click(within(createSplicePanel).getByRole("button", { name: "Create" }));

    state = store.getState();
    const spliceId = state.splices.allIds.find((id) => state.splices.byId[id]?.technicalId === "S-REF-1");
    expect(spliceId).toBeDefined();
    if (spliceId === undefined) {
      throw new Error("Expected created splice S-REF-1.");
    }
    expect(state.splices.byId[spliceId]?.manufacturerReference).toBe("AMP/SEAL-42");
    inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).getByText("Manufacturer reference")).toBeInTheDocument();
    expect(within(inspectorPanel).getByText("AMP/SEAL-42")).toBeInTheDocument();

    const editSplicePanel = getPanelByHeading("Edit Splice");
    fireEvent.change(within(editSplicePanel).getByLabelText("Manufacturer reference"), { target: { value: " " } });
    fireEvent.click(within(editSplicePanel).getByRole("button", { name: "Save" }));
    expect(store.getState().splices.byId[spliceId]?.manufacturerReference).toBeUndefined();
    inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).queryByText("AMP/SEAL-42")).not.toBeInTheDocument();
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
  });

  it("prefills the next free endpoint way/port in wire create mode and keeps manual edits until context changes", () => {
    renderAppWithState(createUiIntegrationDenseWiresState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    const idleWireFormPanel = getPanelByHeading("Wire form");
    fireEvent.click(within(idleWireFormPanel).getByRole("button", { name: "Create" }));
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

    const idleWireFormPanel = getPanelByHeading("Wire form");
    fireEvent.click(within(idleWireFormPanel).getByRole("button", { name: "Create" }));
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

    fireEvent.click(within(getPanelByHeading("Wire form")).getByRole("button", { name: "Create" }));
    const createWirePanel = getPanelByHeading("Create Wire");
    const primaryColorSelect = within(createWirePanel).getByLabelText("Primary color");
    const secondaryColorSelect = within(createWirePanel).getByLabelText("Secondary color");

    expect(primaryColorSelect).toHaveValue("");
    expect(secondaryColorSelect).toBeDisabled();
    expect(within(createWirePanel).getByText("No color")).toBeInTheDocument();

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
    const inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).getByText("Cable colors")).toBeInTheDocument();
    expect(within(inspectorPanel).getByText("Red")).toBeInTheDocument();
  });

  it("supports optional wire side connection and seal references with trim, non-destructive endpoint type changes, and clear on save", () => {
    const { store } = renderAppWithState(createUiIntegrationDenseWiresState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    fireEvent.click(within(getPanelByHeading("Wire form")).getByRole("button", { name: "Create" }));
    const createWirePanel = getPanelByHeading("Create Wire");
    const endpointAFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint A" });
    const endpointBFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint B" });

    fireEvent.change(within(createWirePanel).getByLabelText("Functional name"), { target: { value: "Endpoint refs wire" } });
    fireEvent.change(within(createWirePanel).getByLabelText("Technical ID"), { target: { value: "W-REFS-1" } });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Connector"), { target: { value: "C1" } });
    fireEvent.change(within(endpointBFieldset).getByLabelText("Splice"), { target: { value: "S1" } });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Connection reference"), {
      target: { value: "  TERM-A-01  " }
    });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Seal reference"), {
      target: { value: "  SEAL-A-01  " }
    });
    fireEvent.change(within(endpointBFieldset).getByLabelText("Connection reference"), {
      target: { value: "  SPL-CONN-B  " }
    });
    fireEvent.change(within(endpointBFieldset).getByLabelText("Seal reference"), {
      target: { value: " " }
    });
    fireEvent.click(within(createWirePanel).getByRole("button", { name: "Create" }));
    let inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).getByText("Endpoint A connection ref")).toBeInTheDocument();
    expect(within(inspectorPanel).getByText("TERM-A-01")).toBeInTheDocument();
    expect(within(inspectorPanel).getByText("Endpoint A seal ref")).toBeInTheDocument();
    expect(within(inspectorPanel).getByText("SEAL-A-01")).toBeInTheDocument();
    expect(within(inspectorPanel).getByText("Endpoint B connection ref")).toBeInTheDocument();
    expect(within(inspectorPanel).getByText("SPL-CONN-B")).toBeInTheDocument();

    const editWirePanel = getPanelByHeading("Edit Wire");
    const endpointAEditFieldset = within(editWirePanel).getByRole("group", { name: "Endpoint A" });
    const endpointBEditFieldset = within(editWirePanel).getByRole("group", { name: "Endpoint B" });
    expect(within(endpointAEditFieldset).getByLabelText("Connection reference")).toHaveValue("TERM-A-01");
    expect(within(endpointAEditFieldset).getByLabelText("Seal reference")).toHaveValue("SEAL-A-01");
    expect(within(endpointBEditFieldset).getByLabelText("Connection reference")).toHaveValue("SPL-CONN-B");
    expect(within(endpointBEditFieldset).getByLabelText("Seal reference")).toHaveValue("");

    fireEvent.change(within(endpointAEditFieldset).getByLabelText("Type"), { target: { value: "splicePort" } });
    expect(within(endpointAEditFieldset).getByLabelText("Connection reference")).toHaveValue("TERM-A-01");
    expect(within(endpointAEditFieldset).getByLabelText("Seal reference")).toHaveValue("SEAL-A-01");

    const editWirePanelAfterTypeChange = getPanelByHeading("Edit Wire");
    const endpointAEditFieldsetAfterTypeChange = within(editWirePanelAfterTypeChange).getByRole("group", { name: "Endpoint A" });
    fireEvent.change(within(endpointAEditFieldsetAfterTypeChange).getByLabelText("Splice"), { target: { value: "S1" } });
    fireEvent.change(within(endpointAEditFieldsetAfterTypeChange).getByLabelText("Port index"), { target: { value: "6" } });
    fireEvent.change(within(endpointAEditFieldsetAfterTypeChange).getByLabelText("Type"), { target: { value: "connectorCavity" } });
    const endpointBEditFieldsetAfterTypeChange = within(editWirePanelAfterTypeChange).getByRole("group", { name: "Endpoint B" });
    const endpointAEditFieldsetBeforeSave = within(getPanelByHeading("Edit Wire")).getByRole("group", { name: "Endpoint A" });
    fireEvent.change(within(endpointAEditFieldsetBeforeSave).getByLabelText("Connector"), { target: { value: "C1" } });
    fireEvent.change(within(endpointAEditFieldsetBeforeSave).getByLabelText("Way index"), { target: { value: "6" } });
    fireEvent.change(within(endpointBEditFieldsetAfterTypeChange).getByLabelText("Connection reference"), { target: { value: " " } });
    fireEvent.change(within(endpointAEditFieldsetBeforeSave).getByLabelText("Seal reference"), { target: { value: " " } });
    fireEvent.click(within(editWirePanelAfterTypeChange).getByRole("button", { name: "Save" }));

    const state = store.getState();
    const savedWireId = state.wires.allIds.find((id) => state.wires.byId[id]?.technicalId === "W-REFS-1");
    expect(savedWireId).toBeDefined();
    if (savedWireId === undefined) {
      throw new Error("Expected saved wire W-REFS-1.");
    }
    const savedWire = state.wires.byId[savedWireId];
    expect(savedWire?.endpointAConnectionReference).toBe("TERM-A-01");
    expect(savedWire?.endpointASealReference).toBeUndefined();
    expect(savedWire?.endpointBConnectionReference).toBeUndefined();
    expect(savedWire?.endpointBSealReference).toBeUndefined();
    inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).getByText("TERM-A-01")).toBeInTheDocument();
    expect(within(inspectorPanel).queryByText("SEAL-A-01")).not.toBeInTheDocument();
    expect(within(inspectorPanel).queryByText("SPL-CONN-B")).not.toBeInTheDocument();
  });
});

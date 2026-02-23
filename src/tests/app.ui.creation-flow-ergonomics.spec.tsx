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
  });

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
});

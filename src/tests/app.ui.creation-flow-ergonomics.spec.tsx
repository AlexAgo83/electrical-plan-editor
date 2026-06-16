import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState } from "../store";
import {
  asCatalogItemId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { clickNewFromPanel, installScrollIntoViewSpy } from "./helpers/app-ui-form-test-utils";
describe("App integration UI - creation flow ergonomics", () => {
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

  it("scrolls to the create connector panel when clicking New", async () => {
    const scrollSpy = installScrollIntoViewSpy();

    try {
      renderAppWithState(createInitialStateWithCatalog());
      switchScreenDrawerAware("modeling");

      clickNewFromPanel("Connectors");
      const createConnectorPanel = getPanelByHeading("Create Connector");

      await waitFor(() => {
        expect(scrollSpy.scrollTargets).toContain(createConnectorPanel);
      });
    } finally {
      scrollSpy.restore();
    }
  });

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
  });

  it("keeps the bottom New action out of modeling create forms", () => {
    renderAppWithState(createInitialStateWithCatalog());
    switchScreenDrawerAware("modeling");

    clickNewFromPanel("Connectors");
    const createConnectorPanel = getPanelByHeading("Create Connector");
    expect(within(createConnectorPanel).queryByRole("button", { name: "New" })).not.toBeInTheDocument();

    switchSubScreenDrawerAware("splice");
    clickNewFromPanel("Splices");
    expect(within(getPanelByHeading("Create Splice")).queryByRole("button", { name: "New" })).not.toBeInTheDocument();

    switchSubScreenDrawerAware("node");
    clickNewFromPanel("Nodes");
    expect(within(getPanelByHeading("Create Node")).queryByRole("button", { name: "New" })).not.toBeInTheDocument();

    switchSubScreenDrawerAware("segment");
    clickNewFromPanel("Segments");
    expect(within(getPanelByHeading("Create Segment")).queryByRole("button", { name: "New" })).not.toBeInTheDocument();

    switchSubScreenDrawerAware("wire");
    clickNewFromPanel("Wires");
    expect(within(getPanelByHeading("Create Wire")).queryByRole("button", { name: "New" })).not.toBeInTheDocument();
  });

  it("shows the bottom New action only in the edit state reached after creation and resets to a fresh draft", () => {
    renderAppWithState(createInitialStateWithCatalog());
    switchScreenDrawerAware("modeling");

    clickNewFromPanel("Connectors");
    const createConnectorPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(createConnectorPanel).getByLabelText("Functional name"), {
      target: { value: "Connector draft" }
    });
    fireEvent.change(within(createConnectorPanel).getByLabelText("Technical ID"), {
      target: { value: "C-DRAFT-1" }
    });
    fireEvent.change(within(createConnectorPanel).getByLabelText("Catalog item (manufacturer reference)"), {
      target: { value: "CAT-4" }
    });
    fireEvent.click(within(createConnectorPanel).getByRole("button", { name: "Create" }));

    const editConnectorPanel = getPanelByHeading("Edit Connector");
    expect(within(editConnectorPanel).getByRole("button", { name: "New" })).toBeInTheDocument();
    fireEvent.click(within(editConnectorPanel).getByRole("button", { name: "New" }));

    const resetConnectorPanel = getPanelByHeading("Create Connector");
    expect(within(resetConnectorPanel).getByLabelText("Functional name")).toHaveValue("");
    expect(within(resetConnectorPanel).getByLabelText("Technical ID")).toHaveValue("C-001");
    expect(within(resetConnectorPanel).getByLabelText("Catalog item (manufacturer reference)")).toHaveValue("CAT-2");
    expect(within(resetConnectorPanel).queryByRole("button", { name: "New" })).not.toBeInTheDocument();
  });

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

  it("auto-creates a linked connector node when creating a connector", () => {
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

    switchSubScreenDrawerAware("node");
    const nodesPanel = getPanelByHeading("Nodes");
    expect(within(nodesPanel).getByText("Auto node connector (C-001)")).toBeInTheDocument();
  });

  it("never creates a structural splice node when creating a splice (floating splice model)", () => {
    renderAppWithState(createInitialStateWithCatalog());
    switchScreenDrawerAware("modeling");

    switchSubScreenDrawerAware("splice");
    clickNewFromPanel("Splices");
    const spliceFormPanel = getPanelByHeading("Create Splice");
    fireEvent.change(within(spliceFormPanel).getByLabelText("Functional name"), {
      target: { value: "Floating splice" }
    });
    fireEvent.change(within(spliceFormPanel).getByLabelText("Catalog item (manufacturer reference)"), {
      target: { value: "CAT-2" }
    });
    expect(within(spliceFormPanel).getByLabelText("Port count (from catalog)")).toHaveValue(2);
    fireEvent.click(within(spliceFormPanel).getByRole("button", { name: "Create" }));

    switchSubScreenDrawerAware("node");
    const nodesPanel = getPanelByHeading("Nodes");
    expect(within(nodesPanel).queryByText(/Floating splice/)).not.toBeInTheDocument();
  });

  it("allows disabling linked node auto-creation per connector create form", () => {
    renderAppWithState(createInitialState());
    switchScreenDrawerAware("modeling");

    clickNewFromPanel("Connectors");
    const connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), {
      target: { value: "Manual node connector" }
    });
    fireEvent.click(within(connectorFormPanel).getByLabelText("Auto-create linked node on connector creation"));
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));

    switchSubScreenDrawerAware("node");
    const nodesPanel = getPanelByHeading("Nodes");
    expect(within(nodesPanel).queryByText(/Manual node connector/)).not.toBeInTheDocument();
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

  it("swaps segment nodes in edit mode only and preserves non-node fields until Save", () => {
    const { store } = renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("segment");

    clickNewFromPanel("Segments");
    const createSegmentPanel = getPanelByHeading("Create Segment");
    expect(within(createSegmentPanel).queryByRole("button", { name: "Swap nodes" })).not.toBeInTheDocument();
    fireEvent.click(within(createSegmentPanel).getByRole("button", { name: "Cancel" }));

    const segmentsPanel = getPanelByHeading("Segments");
    fireEvent.click(within(segmentsPanel).getByText("SEG-A"));
    const editSegmentPanel = getPanelByHeading("Edit Segment");
    const actionButtons = within(editSegmentPanel).getAllByRole("button");
    expect(actionButtons.map((button) => button.textContent?.trim())).toEqual(["Save", "Swap nodes", "Cancel edit"]);

    fireEvent.change(within(editSegmentPanel).getByLabelText("Length (mm)"), { target: { value: "123" } });
    fireEvent.change(within(editSegmentPanel).getByLabelText("Sub-network tag (optional)"), { target: { value: "branch-x" } });
    fireEvent.click(within(editSegmentPanel).getByRole("button", { name: "Swap nodes" }));

    const segmentBeforeSave = Object.values(store.getState().segments.byId).find((segment) => segment.id === "SEG-A");
    expect(segmentBeforeSave?.nodeA).toBe("N-C1");
    expect(segmentBeforeSave?.nodeB).toBe("N-MID");
    expect(segmentBeforeSave?.lengthMm).toBe(40);
    expect(segmentBeforeSave?.subNetworkTag).toBeUndefined();

    const swappedEditSegmentPanel = getPanelByHeading("Edit Segment");
    expect(within(swappedEditSegmentPanel).getByLabelText("Node A")).toHaveValue("N-MID");
    expect(within(swappedEditSegmentPanel).getByLabelText("Node B")).toHaveValue("N-C1");
    expect(within(swappedEditSegmentPanel).getByLabelText("Length (mm)")).toHaveValue(123);
    expect(within(swappedEditSegmentPanel).getByLabelText("Sub-network tag (optional)")).toHaveValue("branch-x");

    fireEvent.click(within(swappedEditSegmentPanel).getByRole("button", { name: "Cancel edit" }));
    fireEvent.click(within(getPanelByHeading("Segments")).getByText("SEG-A"));

    const reopenedEditSegmentPanel = getPanelByHeading("Edit Segment");
    expect(within(reopenedEditSegmentPanel).getByLabelText("Node A")).toHaveValue("N-C1");
    expect(within(reopenedEditSegmentPanel).getByLabelText("Node B")).toHaveValue("N-MID");
    expect(within(reopenedEditSegmentPanel).getByLabelText("Length (mm)")).toHaveValue(40);
    expect(within(reopenedEditSegmentPanel).getByLabelText("Sub-network tag (optional)")).toHaveValue("");

    fireEvent.change(within(reopenedEditSegmentPanel).getByLabelText("Length (mm)"), { target: { value: "222" } });
    fireEvent.change(within(reopenedEditSegmentPanel).getByLabelText("Sub-network tag (optional)"), { target: { value: "rear" } });
    fireEvent.click(within(reopenedEditSegmentPanel).getByRole("button", { name: "Swap nodes" }));
    fireEvent.click(within(getPanelByHeading("Edit Segment")).getByRole("button", { name: "Save" }));

    const savedSegment = Object.values(store.getState().segments.byId).find((segment) => segment.id === "SEG-A");
    expect(savedSegment?.nodeA).toBe("N-MID");
    expect(savedSegment?.nodeB).toBe("N-C1");
    expect(savedSegment?.lengthMm).toBe(222);
    expect(savedSegment?.subNetworkTag).toBe("rear");
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

});

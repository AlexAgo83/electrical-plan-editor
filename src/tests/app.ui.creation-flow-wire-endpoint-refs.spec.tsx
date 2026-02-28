import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  asCatalogItemId,
  createUiIntegrationState,
  createUiIntegrationWideEndpointsState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { appActions, appReducer } from "../store";

describe("App integration UI - creation flow wire endpoint references", () => {
  function clickNewFromPanel(panelHeading: "Wires"): void {
    fireEvent.click(within(getPanelByHeading(panelHeading)).getByRole("button", { name: "New" }));
  }

  function getInspectorPanelIfVisible(): HTMLElement | null {
    return screen.queryByRole("heading", { name: "Inspector context" }) !== null ? getPanelByHeading("Inspector context") : null;
  }

  beforeEach(() => localStorage.clear());

  it("supports optional wire side connection and seal references with trim, non-destructive endpoint type changes, and clear on save", () => {
    const { store } = renderAppWithState(createUiIntegrationWideEndpointsState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    clickNewFromPanel("Wires");
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
    let inspectorPanel = getInspectorPanelIfVisible();
    if (inspectorPanel !== null) {
      expect(within(inspectorPanel).getByText("Endpoint A connection ref")).toBeInTheDocument();
      expect(within(inspectorPanel).getByText("TERM-A-01")).toBeInTheDocument();
      expect(within(inspectorPanel).getByText("Endpoint A seal ref")).toBeInTheDocument();
      expect(within(inspectorPanel).getByText("SEAL-A-01")).toBeInTheDocument();
      expect(within(inspectorPanel).getByText("Endpoint B connection ref")).toBeInTheDocument();
      expect(within(inspectorPanel).getByText("SPL-CONN-B")).toBeInTheDocument();
    }

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
    inspectorPanel = getInspectorPanelIfVisible();
    if (inspectorPanel !== null) {
      expect(within(inspectorPanel).getByText("TERM-A-01")).toBeInTheDocument();
      expect(within(inspectorPanel).queryByText("SEAL-A-01")).not.toBeInTheDocument();
      expect(within(inspectorPanel).queryByText("SPL-CONN-B")).not.toBeInTheDocument();
    }
  });

  it("swaps wire edit endpoints as a draft action between Save and Cancel edit and preserves side metadata on save only", () => {
    const { store } = renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    clickNewFromPanel("Wires");
    const createWirePanel = getPanelByHeading("Create Wire");
    expect(within(createWirePanel).queryByRole("button", { name: "Swap endpoints" })).not.toBeInTheDocument();
    fireEvent.click(within(createWirePanel).getByRole("button", { name: "Cancel" }));

    const wiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(wiresPanel).getByText("Wire 1"));

    const editWirePanel = getPanelByHeading("Edit Wire");
    const actionButtons = within(editWirePanel).getAllByRole("button");
    expect(actionButtons.map((button) => button.textContent?.trim())).toEqual(["Save", "Swap endpoints", "Cancel edit"]);

    const endpointAFieldset = within(editWirePanel).getByRole("group", { name: "Endpoint A" });
    const endpointBFieldset = within(editWirePanel).getByRole("group", { name: "Endpoint B" });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Connection reference"), { target: { value: "TERM-A-DRAFT" } });
    fireEvent.change(within(endpointBFieldset).getByLabelText("Seal reference"), { target: { value: "SEAL-B-DRAFT" } });

    fireEvent.click(within(editWirePanel).getByRole("button", { name: "Swap endpoints" }));

    const draftWireBeforeSave = Object.values(store.getState().wires.byId).find((wire) => wire.technicalId === "W-1");
    expect(draftWireBeforeSave?.endpointA.kind).toBe("connectorCavity");
    expect(draftWireBeforeSave?.endpointB.kind).toBe("splicePort");
    expect(draftWireBeforeSave?.endpointAConnectionReference).toBeUndefined();
    expect(draftWireBeforeSave?.endpointBSealReference).toBeUndefined();

    const swappedEditWirePanel = getPanelByHeading("Edit Wire");
    const swappedEndpointAFieldset = within(swappedEditWirePanel).getByRole("group", { name: "Endpoint A" });
    const swappedEndpointBFieldset = within(swappedEditWirePanel).getByRole("group", { name: "Endpoint B" });
    expect(within(swappedEndpointAFieldset).getByLabelText("Type")).toHaveValue("splicePort");
    expect(within(swappedEndpointAFieldset).getByLabelText("Splice")).toHaveValue("S1");
    expect(within(swappedEndpointAFieldset).getByLabelText("Port index")).toHaveValue(1);
    expect(within(swappedEndpointAFieldset).getByLabelText("Connection reference")).toHaveValue("");
    expect(within(swappedEndpointAFieldset).getByLabelText("Seal reference")).toHaveValue("SEAL-B-DRAFT");
    expect(within(swappedEndpointBFieldset).getByLabelText("Type")).toHaveValue("connectorCavity");
    expect(within(swappedEndpointBFieldset).getByLabelText("Connector")).toHaveValue("C1");
    expect(within(swappedEndpointBFieldset).getByLabelText("Way index")).toHaveValue(1);
    expect(within(swappedEndpointBFieldset).getByLabelText("Connection reference")).toHaveValue("TERM-A-DRAFT");
    expect(within(swappedEndpointBFieldset).getByLabelText("Seal reference")).toHaveValue("");

    fireEvent.click(within(swappedEditWirePanel).getByRole("button", { name: "Cancel edit" }));
    fireEvent.click(within(getPanelByHeading("Wires")).getByText("Wire 1"));

    const reopenedEditWirePanel = getPanelByHeading("Edit Wire");
    const reopenedEndpointAFieldset = within(reopenedEditWirePanel).getByRole("group", { name: "Endpoint A" });
    const reopenedEndpointBFieldset = within(reopenedEditWirePanel).getByRole("group", { name: "Endpoint B" });
    expect(within(reopenedEndpointAFieldset).getByLabelText("Type")).toHaveValue("connectorCavity");
    expect(within(reopenedEndpointBFieldset).getByLabelText("Type")).toHaveValue("splicePort");
    expect(within(reopenedEndpointAFieldset).getByLabelText("Connection reference")).toHaveValue("");
    expect(within(reopenedEndpointBFieldset).getByLabelText("Seal reference")).toHaveValue("");

    fireEvent.change(within(reopenedEndpointAFieldset).getByLabelText("Connection reference"), { target: { value: "TERM-A-SAVE" } });
    fireEvent.change(within(reopenedEndpointBFieldset).getByLabelText("Seal reference"), { target: { value: "SEAL-B-SAVE" } });
    fireEvent.click(within(reopenedEditWirePanel).getByRole("button", { name: "Swap endpoints" }));
    fireEvent.click(within(getPanelByHeading("Edit Wire")).getByRole("button", { name: "Save" }));

    const savedWire = Object.values(store.getState().wires.byId).find((wire) => wire.technicalId === "W-1");
    expect(savedWire?.endpointA.kind).toBe("splicePort");
    expect(savedWire?.endpointB.kind).toBe("connectorCavity");
    expect(savedWire?.endpointAConnectionReference).toBeUndefined();
    expect(savedWire?.endpointASealReference).toBe("SEAL-B-SAVE");
    expect(savedWire?.endpointBConnectionReference).toBe("TERM-A-SAVE");
    expect(savedWire?.endpointBSealReference).toBeUndefined();
  });

  it(
    "supports fuse mode with catalog linkage, preserves save/cancel semantics, and shows fuse metadata in wire list and analysis",
    () => {
    const fuseCatalogState = appReducer(
      createUiIntegrationState(),
      appActions.upsertCatalogItem({
        id: asCatalogItemId("catalog-fuse-ui"),
        manufacturerReference: "CAT-FUSE-UI",
        connectionCount: 2
      })
    );
    const { store } = renderAppWithState(fuseCatalogState);
    expect(store.getState().catalogItems.byId[asCatalogItemId("catalog-fuse-ui")]).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    clickNewFromPanel("Wires");
    const createWirePanel = getPanelByHeading("Create Wire");
    fireEvent.change(within(createWirePanel).getByLabelText("Functional name"), { target: { value: "Fuse bridge wire" } });
    fireEvent.change(within(createWirePanel).getByLabelText("Technical ID"), { target: { value: "W-FUSE-1" } });
    const endpointAFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint A" });
    const endpointBFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint B" });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Connector"), { target: { value: "C1" } });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Way index"), { target: { value: "2" } });
    fireEvent.change(within(endpointBFieldset).getByLabelText("Splice"), { target: { value: "S1" } });
    fireEvent.change(within(endpointBFieldset).getByLabelText("Port index"), { target: { value: "2" } });

    fireEvent.click(within(createWirePanel).getByLabelText("Fuse"));
    const fuseCatalogSelect = within(createWirePanel).getByLabelText("Fuse catalog item");
    expect(fuseCatalogSelect).toBeInTheDocument();
    expect(fuseCatalogSelect).toBeRequired();

    fireEvent.click(within(createWirePanel).getByRole("button", { name: "Create" }));
    const blockedBeforeCatalogSelection = Object.values(store.getState().wires.byId).find((wire) => wire.technicalId === "W-FUSE-1");
    expect(blockedBeforeCatalogSelection).toBeUndefined();

    expect(within(fuseCatalogSelect).getByRole("option", { name: /CAT-FUSE-UI/i })).toBeInTheDocument();
    fireEvent.change(fuseCatalogSelect, {
      target: { value: "catalog-fuse-ui" }
    });
    expect(fuseCatalogSelect).toHaveValue("catalog-fuse-ui");
    fireEvent.click(within(createWirePanel).getByRole("button", { name: "Create" }));

    const savedWire = Object.values(store.getState().wires.byId).find((wire) => wire.technicalId === "W-FUSE-1");
    expect(savedWire?.protection).toEqual({ kind: "fuse", catalogItemId: "catalog-fuse-ui" });

    const wiresPanel = getPanelByHeading("Wires");
    expect(within(wiresPanel).getByText("Fuse")).toBeInTheDocument();
    expect(within(wiresPanel).getByText("CAT-FUSE-UI")).toBeInTheDocument();

    const editWirePanel = getPanelByHeading("Edit Wire");
    expect(within(editWirePanel).getByLabelText("Fuse")).toBeChecked();
    expect(within(editWirePanel).getByLabelText("Fuse catalog item")).toHaveValue("catalog-fuse-ui");
    fireEvent.click(within(editWirePanel).getByLabelText("Fuse"));
    fireEvent.click(within(editWirePanel).getByRole("button", { name: "Cancel edit" }));

    fireEvent.click(within(getPanelByHeading("Wires")).getByText("Fuse bridge wire"));
    const reopenedEditWirePanel = getPanelByHeading("Edit Wire");
    expect(within(reopenedEditWirePanel).getByLabelText("Fuse")).toBeChecked();
    expect(within(reopenedEditWirePanel).getByLabelText("Fuse catalog item")).toHaveValue("catalog-fuse-ui");

    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("wire");
    fireEvent.click(within(getPanelByHeading("Wires")).getByText("Fuse bridge wire"));
    const wireAnalysisPanel = getPanelByHeading("Wire analysis");
    expect(within(wireAnalysisPanel).getByText("Protection")).toBeInTheDocument();
    expect(within(wireAnalysisPanel).getByText("CAT-FUSE-UI")).toBeInTheDocument();
    });
});

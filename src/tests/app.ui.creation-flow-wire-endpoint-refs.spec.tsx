import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createUiIntegrationDenseWiresState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - creation flow wire endpoint references", () => {
  function clickNewFromPanel(panelHeading: "Wires"): void {
    fireEvent.click(within(getPanelByHeading(panelHeading)).getByRole("button", { name: "New" }));
  }

  function getInspectorPanelIfVisible(): HTMLElement | null {
    return screen.queryByRole("heading", { name: "Inspector context" }) !== null ? getPanelByHeading("Inspector context") : null;
  }

  beforeEach(() => localStorage.clear());

  it("supports optional wire side connection and seal references with trim, non-destructive endpoint type changes, and clear on save", () => {
    const { store } = renderAppWithState(createUiIntegrationDenseWiresState());
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
});

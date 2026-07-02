import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  createUiIntegrationDenseWiresState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { clickNewFromPanel, getInspectorPanelIfVisible } from "./helpers/app-ui-form-test-utils";

describe("App integration UI - creation flow wire ergonomics", () => {
  beforeEach(() => localStorage.clear());

  it("shows the physical layout label beside numeric connector way indexes", () => {
    const catalogItemId = asCatalogItemId("CAT-LABELED");
    const state = appReducer(
      appReducer(
        createUiIntegrationDenseWiresState(),
        appActions.upsertCatalogItem({
          id: catalogItemId,
          manufacturerReference: "LABELED-CONN",
          connectionCount: 6,
          connectorLayout: {
            version: 1,
            units: "grid",
            width: 2,
            height: 3,
            ways: [
              { cavityIndex: 1, x: 1, y: 1, shape: "round" },
              { cavityIndex: 2, x: 2, y: 1, shape: "round" },
              { cavityIndex: 3, x: 1, y: 2, shape: "round" },
              { cavityIndex: 4, x: 2, y: 2, shape: "round" },
              { cavityIndex: 5, x: 1, y: 3, shape: "round", label: "A10" },
              { cavityIndex: 6, x: 2, y: 3, shape: "round" }
            ]
          }
        })
      ),
      appActions.upsertConnector({
        id: asConnectorId("C1"),
        name: "Connector 1",
        technicalId: "C-1",
        cavityCount: 6,
        catalogItemId
      })
    );

    renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    clickNewFromPanel("Wires");
    const createWirePanel = getPanelByHeading("Create Wire");
    const endpointAFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint A" });

    fireEvent.change(within(endpointAFieldset).getByLabelText("Connector"), { target: { value: "C1" } });
    expect(within(endpointAFieldset).getByLabelText("Way index")).toHaveValue(5);
    expect(within(endpointAFieldset).getByText("Physical label: A10")).toBeInTheDocument();

    fireEvent.change(within(endpointAFieldset).getByLabelText("Way index"), { target: { value: "6" } });
    expect(within(endpointAFieldset).queryByText(/Physical label:/)).not.toBeInTheDocument();
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

    const primaryColorSelect = within(createWirePanel).getByLabelText("Primary color");
    expect(primaryColorSelect).toHaveValue("");
    expect(within(createWirePanel).queryByLabelText("Secondary color")).not.toBeInTheDocument();
    expect(within(createWirePanel).getAllByText("Not specified").length).toBeGreaterThan(0);

    fireEvent.change(primaryColorSelect, { target: { value: "RD" } });
    const secondaryColorSelect = within(createWirePanel).getByLabelText("Secondary color");
    expect(secondaryColorSelect).toHaveValue("");
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

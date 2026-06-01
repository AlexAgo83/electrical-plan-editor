import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  asConnectorId,
  asSpliceId,
  asWireId,
  createUiIntegrationDenseWiresState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { appActions, appReducer } from "../store";

describe("App integration UI - wire color selection", () => {
  function closeOnboardingIfOpen(): void {
    const closeButton = screen.queryByRole("button", { name: "Close onboarding" });
    if (closeButton !== null) {
      fireEvent.click(closeButton);
    }
  }

  function clickNewWire(): void {
    fireEvent.click(within(getPanelByHeading("Wires")).getByRole("button", { name: "New" }));
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it("shows Not specified as default primary color with no secondary color picker", () => {
    renderAppWithState(createUiIntegrationDenseWiresState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    clickNewWire();
    const createWirePanel = getPanelByHeading("Create Wire");

    const primarySelect = within(createWirePanel).getByLabelText("Primary color");
    expect(primarySelect).toHaveValue("");
    expect(within(primarySelect).getByRole("option", { name: /Not specified/i })).toBeInTheDocument();
    expect(within(createWirePanel).queryByLabelText("Secondary color")).not.toBeInTheDocument();
    expect(within(createWirePanel).queryByLabelText("Color mode")).not.toBeInTheDocument();
  });

  it("shows secondary color picker only after a primary color is selected", () => {
    renderAppWithState(createUiIntegrationDenseWiresState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    clickNewWire();
    const createWirePanel = getPanelByHeading("Create Wire");

    expect(within(createWirePanel).queryByLabelText("Secondary color")).not.toBeInTheDocument();

    fireEvent.change(within(createWirePanel).getByLabelText("Primary color"), { target: { value: "RD" } });

    expect(within(createWirePanel).getByLabelText("Secondary color")).toBeInTheDocument();
    expect(within(createWirePanel).getByLabelText("Secondary color")).toHaveValue("");
  });

  it("hides secondary color picker when primary is reset to Not specified", () => {
    renderAppWithState(createUiIntegrationDenseWiresState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    clickNewWire();
    const createWirePanel = getPanelByHeading("Create Wire");

    fireEvent.change(within(createWirePanel).getByLabelText("Primary color"), { target: { value: "BU" } });
    fireEvent.change(within(createWirePanel).getByLabelText("Secondary color"), { target: { value: "WH" } });

    expect(within(createWirePanel).getByLabelText("Secondary color")).toHaveValue("WH");

    fireEvent.change(within(createWirePanel).getByLabelText("Primary color"), { target: { value: "" } });

    expect(within(createWirePanel).queryByLabelText("Secondary color")).not.toBeInTheDocument();
  });

  it("saves primary and secondary catalog colors to store correctly", () => {
    const { store } = renderAppWithState(createUiIntegrationDenseWiresState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    clickNewWire();
    const createWirePanel = getPanelByHeading("Create Wire");
    const endpointAFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint A" });
    const endpointBFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint B" });

    fireEvent.change(within(createWirePanel).getByLabelText("Primary color"), { target: { value: "BK" } });
    fireEvent.change(within(createWirePanel).getByLabelText("Secondary color"), { target: { value: "YE" } });
    fireEvent.change(within(createWirePanel).getByLabelText("Functional name"), { target: { value: "Catalog color wire" } });
    fireEvent.change(within(createWirePanel).getByLabelText("Technical ID"), { target: { value: "W-CAT-COL-1" } });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Connector"), { target: { value: "C1" } });
    fireEvent.change(within(endpointBFieldset).getByLabelText("Splice"), { target: { value: "S1" } });
    fireEvent.click(within(createWirePanel).getByRole("button", { name: "Create" }));

    const state = store.getState();
    const savedWireId = state.wires.allIds.find((id) => state.wires.byId[id]?.technicalId === "W-CAT-COL-1");
    expect(savedWireId).toBeDefined();
    if (savedWireId === undefined) throw new Error("Expected saved wire.");
    const savedWire = state.wires.byId[savedWireId];
    expect(savedWire?.colorMode).toBe("catalog");
    expect(savedWire?.primaryColorId).toBe("BK");
    expect(savedWire?.secondaryColorId).toBe("YE");
    expect(savedWire?.freeColorLabel).toBeNull();
  });

  it("saves wire with no color when primary stays Not specified", () => {
    const { store } = renderAppWithState(createUiIntegrationDenseWiresState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    clickNewWire();
    const createWirePanel = getPanelByHeading("Create Wire");
    const endpointAFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint A" });
    const endpointBFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint B" });

    fireEvent.change(within(createWirePanel).getByLabelText("Functional name"), { target: { value: "No color wire" } });
    fireEvent.change(within(createWirePanel).getByLabelText("Technical ID"), { target: { value: "W-NO-COL-1" } });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Connector"), { target: { value: "C1" } });
    fireEvent.change(within(endpointBFieldset).getByLabelText("Splice"), { target: { value: "S1" } });
    fireEvent.click(within(createWirePanel).getByRole("button", { name: "Create" }));

    const state = store.getState();
    const savedWireId = state.wires.allIds.find((id) => state.wires.byId[id]?.technicalId === "W-NO-COL-1");
    expect(savedWireId).toBeDefined();
    if (savedWireId === undefined) throw new Error("Expected saved wire.");
    const savedWire = state.wires.byId[savedWireId];
    expect(savedWire?.colorMode).toBe("none");
    expect(savedWire?.primaryColorId).toBeNull();
    expect(savedWire?.secondaryColorId).toBeNull();
  });

  it("loads existing wire with free color mode as Not specified in the form", () => {
    const base = createUiIntegrationDenseWiresState();
    const stateWithFreeWire = appReducer(
      base,
      appActions.saveWire({
        id: asWireId("W-FREE-COMPAT"),
        name: "Legacy free color wire",
        technicalId: "W-FREE-COMPAT",
        colorMode: "free",
        primaryColorId: null,
        secondaryColorId: null,
        freeColorLabel: "Beige/Brown mix",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 5 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 5 }
      })
    );

    expect(stateWithFreeWire.wires.allIds).toContain(asWireId("W-FREE-COMPAT"));

    renderAppWithState(stateWithFreeWire);
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    const wiresPanel = getPanelByHeading("Wires");
    const wireRow = within(wiresPanel).getByText("Legacy free color wire").closest("tr");
    expect(wireRow).not.toBeNull();
    if (wireRow === null) throw new Error("Expected wire row.");
    fireEvent.click(wireRow);

    const editWirePanel = getPanelByHeading("Edit Wire");
    expect(within(editWirePanel).getByLabelText("Primary color")).toHaveValue("");
    expect(within(editWirePanel).queryByLabelText("Secondary color")).not.toBeInTheDocument();
    expect(within(editWirePanel).queryByLabelText("Color mode")).not.toBeInTheDocument();
  });
});

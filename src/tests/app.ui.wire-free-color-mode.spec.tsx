import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createUiIntegrationDenseWiresState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - wire free color mode", () => {
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

  it("supports free wire color labels with explicit mode switching and clears catalog colors", () => {
    const { store } = renderAppWithState(createUiIntegrationDenseWiresState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    clickNewWire();
    const createWirePanel = getPanelByHeading("Create Wire");
    const endpointAFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint A" });
    const endpointBFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint B" });

    fireEvent.change(within(createWirePanel).getByLabelText("Color mode"), { target: { value: "catalog" } });
    fireEvent.change(within(createWirePanel).getByLabelText("Primary color"), { target: { value: "RD" } });
    fireEvent.change(within(createWirePanel).getByLabelText("Secondary color"), { target: { value: "BU" } });
    fireEvent.change(within(createWirePanel).getByLabelText("Color mode"), { target: { value: "free" } });

    expect(within(createWirePanel).queryByLabelText("Primary color")).not.toBeInTheDocument();
    expect(within(createWirePanel).getByText("Free")).toBeInTheDocument();
    fireEvent.change(within(createWirePanel).getByLabelText("Free color label"), {
      target: { value: "  Beige/Brown mix  " }
    });

    fireEvent.change(within(createWirePanel).getByLabelText("Functional name"), { target: { value: "Free color wire" } });
    fireEvent.change(within(createWirePanel).getByLabelText("Technical ID"), { target: { value: "W-FREE-UI-1" } });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Connector"), { target: { value: "C1" } });
    fireEvent.change(within(endpointBFieldset).getByLabelText("Splice"), { target: { value: "S1" } });
    fireEvent.click(within(createWirePanel).getByRole("button", { name: "Create" }));

    const editWirePanel = getPanelByHeading("Edit Wire");
    expect(within(editWirePanel).getByLabelText("Color mode")).toHaveValue("free");
    expect(within(editWirePanel).getByLabelText("Free color label")).toHaveValue("Beige/Brown mix");
    expect(within(editWirePanel).queryByLabelText("Primary color")).not.toBeInTheDocument();

    const state = store.getState();
    const savedWireId = state.wires.allIds.find((id) => state.wires.byId[id]?.technicalId === "W-FREE-UI-1");
    expect(savedWireId).toBeDefined();
    if (savedWireId === undefined) {
      throw new Error("Expected saved free-color wire.");
    }
    const savedWire = state.wires.byId[savedWireId];
    expect(savedWire?.colorMode).toBe("free");
    expect(savedWire?.primaryColorId).toBeNull();
    expect(savedWire?.secondaryColorId).toBeNull();
    expect(savedWire?.freeColorLabel).toBe("Beige/Brown mix");

    const wiresPanel = getPanelByHeading("Wires");
    const wireRow = within(wiresPanel).getByText("Free color wire").closest("tr");
    expect(wireRow).not.toBeNull();
    if (wireRow !== null) {
      expect(within(wireRow).getByText("Beige/Brown mix")).toBeInTheDocument();
    }

    closeOnboardingIfOpen();
    const inspectorHeading = screen.queryByRole("heading", { name: "Inspector context" });
    if (inspectorHeading !== null) {
      const inspectorPanel = getPanelByHeading("Inspector context");
      expect(within(inspectorPanel).getByText("Cable colors")).toBeInTheDocument();
      expect(within(inspectorPanel).getByText("Free: Beige/Brown mix")).toBeInTheDocument();
    }
  });

  it("allows saving free color mode with an empty label and preserves it as a distinct unspecified state", () => {
    const { store } = renderAppWithState(createUiIntegrationDenseWiresState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    clickNewWire();
    const createWirePanel = getPanelByHeading("Create Wire");
    const endpointAFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint A" });
    const endpointBFieldset = within(createWirePanel).getByRole("group", { name: "Endpoint B" });

    fireEvent.change(within(createWirePanel).getByLabelText("Color mode"), { target: { value: "free" } });
    expect(within(createWirePanel).getByText("Free color left unspecified")).toBeInTheDocument();

    fireEvent.change(within(createWirePanel).getByLabelText("Functional name"), {
      target: { value: "Free color unspecified wire" }
    });
    fireEvent.change(within(createWirePanel).getByLabelText("Technical ID"), { target: { value: "W-FREE-UI-EMPTY-1" } });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Connector"), { target: { value: "C1" } });
    fireEvent.change(within(endpointBFieldset).getByLabelText("Splice"), { target: { value: "S1" } });
    fireEvent.click(within(createWirePanel).getByRole("button", { name: "Create" }));

    const editWirePanel = getPanelByHeading("Edit Wire");
    expect(within(editWirePanel).getByLabelText("Color mode")).toHaveValue("free");
    expect(within(editWirePanel).getByLabelText("Free color label")).toHaveValue("");

    const state = store.getState();
    const savedWireId = state.wires.allIds.find((id) => state.wires.byId[id]?.technicalId === "W-FREE-UI-EMPTY-1");
    if (savedWireId === undefined) {
      throw new Error("Expected saved free-color unspecified wire.");
    }

    const savedWire = state.wires.byId[savedWireId];
    expect(savedWire?.colorMode).toBe("free");
    expect(savedWire?.primaryColorId).toBeNull();
    expect(savedWire?.secondaryColorId).toBeNull();
    expect(savedWire?.freeColorLabel).toBeNull();

    const wiresPanel = getPanelByHeading("Wires");
    const wireRow = within(wiresPanel).getByText("Free color unspecified wire").closest("tr");
    expect(wireRow).not.toBeNull();
    if (wireRow !== null) {
      expect(within(wireRow).getByText("Unspecified")).toBeInTheDocument();
    }

    closeOnboardingIfOpen();
    const inspectorHeading = screen.queryByRole("heading", { name: "Inspector context" });
    if (inspectorHeading !== null) {
      const inspectorPanel = getPanelByHeading("Inspector context");
      expect(within(inspectorPanel).getByText("Free color (unspecified)")).toBeInTheDocument();
      expect(within(inspectorPanel).queryByText("No color")).not.toBeInTheDocument();
    }
  });
});

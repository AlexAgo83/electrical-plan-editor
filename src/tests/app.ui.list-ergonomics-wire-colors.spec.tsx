import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createSampleNetworkState } from "../store";
import { getPanelByHeading, renderAppWithState, switchSubScreen } from "./helpers/app-ui-test-utils";

describe("App integration UI - list ergonomics wire colors", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("filters wires by free color label through the generic any-field filter and renders the free color text", () => {
    const state = createSampleNetworkState();
    const firstWireId = state.wires.allIds[0];
    if (firstWireId === undefined) {
      throw new Error("Expected a sample wire.");
    }
    const activeNetworkId = state.activeNetworkId;
    if (activeNetworkId === null) {
      throw new Error("Expected an active network.");
    }
    const targetLabel = "Beige/Brown mix";

    state.wires.byId[firstWireId] = {
      ...state.wires.byId[firstWireId]!,
      colorMode: "free",
      primaryColorId: "RD",
      secondaryColorId: "BU",
      freeColorLabel: `  ${targetLabel}  `
    };
    state.networkStates[activeNetworkId] = {
      ...state.networkStates[activeNetworkId]!,
      wires: {
        ...state.networkStates[activeNetworkId]!.wires,
        byId: {
          ...state.networkStates[activeNetworkId]!.wires.byId,
          [firstWireId]: {
            ...state.networkStates[activeNetworkId]!.wires.byId[firstWireId]!,
            colorMode: "free",
            primaryColorId: "RD",
            secondaryColorId: "BU",
            freeColorLabel: `  ${targetLabel}  `
          }
        }
      }
    };

    renderAppWithState(state);
    switchSubScreen("wire");

    const wiresPanel = getPanelByHeading("Wires");
    expect(within(wiresPanel).getByText(targetLabel)).toBeInTheDocument();

    const wireFilterFieldSelect = within(wiresPanel).getByLabelText("Wire filter field");
    fireEvent.change(wireFilterFieldSelect, { target: { value: "any" } });
    fireEvent.change(within(wiresPanel).getByPlaceholderText("Name, technical ID, endpoint..."), {
      target: { value: "beige/brown" }
    });

    expect(within(wiresPanel).getByText("Feed Main Junction")).toBeInTheDocument();
    expect(within(wiresPanel).queryByText("Secondary Feed B")).not.toBeInTheDocument();
  });

  it("keeps free unspecified wire colors visually blank while discoverable via any-field filter", () => {
    const state = createSampleNetworkState();
    const firstWireId = state.wires.allIds[0];
    const activeNetworkId = state.activeNetworkId;
    if (firstWireId === undefined || activeNetworkId === null) {
      throw new Error("Expected sample state with active network and wires.");
    }

    state.wires.byId[firstWireId] = {
      ...state.wires.byId[firstWireId]!,
      colorMode: "free",
      primaryColorId: "RD",
      secondaryColorId: "BU",
      freeColorLabel: null
    };
    state.networkStates[activeNetworkId] = {
      ...state.networkStates[activeNetworkId]!,
      wires: {
        ...state.networkStates[activeNetworkId]!.wires,
        byId: {
          ...state.networkStates[activeNetworkId]!.wires.byId,
          [firstWireId]: {
            ...state.networkStates[activeNetworkId]!.wires.byId[firstWireId]!,
            colorMode: "free",
            primaryColorId: "RD",
            secondaryColorId: "BU",
            freeColorLabel: null
          }
        }
      }
    };

    renderAppWithState(state);
    switchSubScreen("wire");

    const wiresPanel = getPanelByHeading("Wires");
    const wireRow = within(wiresPanel).getByText("Feed Main Junction").closest("tr");
    expect(wireRow).not.toBeNull();
    if (wireRow !== null) {
      expect(within(wireRow).queryByText("Unspecified")).not.toBeInTheDocument();
      expect(within(wireRow).queryByText("Free")).not.toBeInTheDocument();
    }

    const wireFilterFieldSelect = within(wiresPanel).getByLabelText("Wire filter field");
    fireEvent.change(wireFilterFieldSelect, { target: { value: "any" } });
    fireEvent.change(within(wiresPanel).getByPlaceholderText("Name, technical ID, endpoint..."), {
      target: { value: "free" }
    });

    expect(within(wiresPanel).getByText("Feed Main Junction")).toBeInTheDocument();
    expect(within(wiresPanel).queryByText("Secondary Feed B")).not.toBeInTheDocument();
  });
});

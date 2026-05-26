import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createUiIntegrationState, getPanelByHeading, renderAppWithState, switchScreenDrawerAware, switchSubScreenDrawerAware } from "./helpers/app-ui-test-utils";

function closeOnboardingIfOpen(): void {
  const closeButton = screen.queryByRole("button", { name: "Close onboarding" });
  if (closeButton !== null) {
    fireEvent.click(closeButton);
  }
}

describe("App integration UI - wire sizing recommendation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows and applies the recommended wire section from voltage, current, material and route length", () => {
    const { store } = renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();

    switchScreenDrawerAware("networkScope");
    const networkScopePanel = getPanelByHeading("Network Scope");
    fireEvent.click(within(networkScopePanel).getByText("Main network (Sample)").closest("tr") as HTMLElement);
    const editNetworkPanel = getPanelByHeading("Edit network");
    fireEvent.change(within(editNetworkPanel).getByLabelText("Voltage (V, optional)"), { target: { value: "12" } });
    fireEvent.click(within(editNetworkPanel).getByRole("button", { name: "Save network" }));

    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    const wiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(wiresPanel).getByText("Wire 1").closest("tr") as HTMLElement);
    const editWirePanel = getPanelByHeading("Edit Wire");

    fireEvent.change(within(editWirePanel).getByLabelText("Current (A)"), { target: { value: "100" } });
    fireEvent.change(within(editWirePanel).getByLabelText("Material"), { target: { value: "copper" } });

    expect(within(editWirePanel).getByText("Recommended section: 1 mm²")).toBeInTheDocument();

    fireEvent.click(within(editWirePanel).getByRole("button", { name: "Apply" }));
    expect(within(editWirePanel).getByLabelText("Section (mm²)")).toHaveValue(1);

    fireEvent.click(within(editWirePanel).getByRole("button", { name: "Save" }));

    const savedWire = store.getState().wires.byId[store.getState().wires.allIds[0]!];
    expect(savedWire?.sectionMm2).toBe(1);
    expect(savedWire?.currentA).toBe(100);
    expect(savedWire?.material).toBe("copper");
  });
});

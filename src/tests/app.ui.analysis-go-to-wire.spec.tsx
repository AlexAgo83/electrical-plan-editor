import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { asConnectorId, createUiIntegrationState, getPanelByHeading, renderAppWithState, switchScreenDrawerAware, switchSubScreenDrawerAware } from "./helpers/app-ui-test-utils";

describe("App integration UI - analysis go-to wire actions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens wire analysis from connector occupancy card and keeps Go to before Release", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("connector");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));

    const connectorAnalysisPanel = getPanelByHeading("Connector analysis");
    const occupiedCard = within(connectorAnalysisPanel).getByText("Wire W-1 / A").closest("article");
    expect(occupiedCard).not.toBeNull();

    const cardButtons = within(occupiedCard as HTMLElement).getAllByRole("button");
    const cardButtonLabels = cardButtons.map((button) => button.textContent?.trim());
    expect(cardButtonLabels).toEqual(["Go to", "Release"]);

    fireEvent.click(within(occupiedCard as HTMLElement).getByRole("button", { name: "Go to" }));

    const wireAnalysisPanel = getPanelByHeading("Wire analysis");
    expect(within(wireAnalysisPanel).getByText("Wire 1")).toBeInTheDocument();
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Wire$/, hidden: true })).toHaveClass("is-active");
  });

  it("opens wire analysis from splice occupancy card and keeps Go to before Release", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("splice");

    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByText("Splice 1"));

    const spliceAnalysisPanel = getPanelByHeading("Splice analysis");
    const occupiedCard = within(spliceAnalysisPanel).getByText("Wire W-1 / B").closest("article");
    expect(occupiedCard).not.toBeNull();

    const cardButtons = within(occupiedCard as HTMLElement).getAllByRole("button");
    const cardButtonLabels = cardButtons.map((button) => button.textContent?.trim());
    expect(cardButtonLabels).toEqual(["Go to", "Release"]);

    fireEvent.click(within(occupiedCard as HTMLElement).getByRole("button", { name: "Go to" }));

    const wireAnalysisPanel = getPanelByHeading("Wire analysis");
    expect(within(wireAnalysisPanel).getByText("Wire 1")).toBeInTheDocument();
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Wire$/, hidden: true })).toHaveClass("is-active");
  });

  it("disables Go to when occupancy references a missing wire and keeps Release enabled", () => {
    const baseState = createUiIntegrationState();
    const stateWithMissingWireOccupancy = {
      ...baseState,
      connectorCavityOccupancy: {
        ...baseState.connectorCavityOccupancy,
        [asConnectorId("C1")]: {
          ...(baseState.connectorCavityOccupancy[asConnectorId("C1")] ?? {}),
          1: "wire:W-GHOST:A"
        }
      }
    };

    renderAppWithState(stateWithMissingWireOccupancy);

    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("connector");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));

    const connectorAnalysisPanel = getPanelByHeading("Connector analysis");
    const occupiedCard = within(connectorAnalysisPanel).getByText("Wire W-GHOST / A").closest("article");
    expect(occupiedCard).not.toBeNull();
    expect(within(occupiedCard as HTMLElement).getByRole("button", { name: "Go to" })).toBeDisabled();
    expect(within(occupiedCard as HTMLElement).getByRole("button", { name: "Release" })).toBeEnabled();
  });
});

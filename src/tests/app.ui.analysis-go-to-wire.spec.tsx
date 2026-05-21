import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asConnectorId,
  asWireId,
  createUiIntegrationDenseWiresState,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

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
    const occupiedCard = within(connectorAnalysisPanel).getByText("W-1 / A").closest("article");
    expect(occupiedCard).not.toBeNull();
    expect((occupiedCard as HTMLElement).querySelector(".cavity-occupant-ref-icon")).not.toBeNull();

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

  it("shows wire color markers in connector ways and physical views", () => {
    const baseState = createUiIntegrationState();
    const wire = baseState.wires.byId[asWireId("W1")];
    if (wire === undefined) {
      throw new Error("Expected wire W1 in base integration state.");
    }
    const withColoredWire = appReducer(
      baseState,
      appActions.upsertWire({
        ...wire,
        colorMode: "catalog",
        primaryColorId: "RD",
        secondaryColorId: "BU"
      })
    );

    renderAppWithState(withColoredWire);

    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("connector");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));

    const connectorAnalysisPanel = getPanelByHeading("Connector analysis");
    const waysCard = within(connectorAnalysisPanel).getByText("W-1 / A").closest("article");
    expect(waysCard).not.toBeNull();
    expect((waysCard as HTMLElement).querySelectorAll('[title="Red / Blue"]')).toHaveLength(2);

    fireEvent.click(within(connectorAnalysisPanel).getByRole("button", { name: "Physical" }));
    const physicalCard = within(connectorAnalysisPanel).getByText("W-1 / A").closest("article");
    expect(physicalCard).not.toBeNull();
    expect((physicalCard as HTMLElement).querySelectorAll('[title="Red / Blue"]')).toHaveLength(2);
  });

  it("preserves the connector analysis view when returning to connector analysis", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("connector");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));

    const connectorAnalysisPanel = getPanelByHeading("Connector analysis");
    fireEvent.click(within(connectorAnalysisPanel).getByRole("button", { name: "Physical" }));
    expect(within(connectorAnalysisPanel).getByRole("button", { name: "Physical" })).toHaveAttribute("aria-pressed", "true");

    switchSubScreenDrawerAware("wire");
    switchSubScreenDrawerAware("connector");

    const refreshedConnectorAnalysisPanel = getPanelByHeading("Connector analysis");
    expect(within(refreshedConnectorAnalysisPanel).getByRole("button", { name: "Physical" })).toHaveAttribute("aria-pressed", "true");
    expect(within(refreshedConnectorAnalysisPanel).getByRole("button", { name: "Ways" })).toHaveAttribute("aria-pressed", "false");
  });

  it("opens wire editing from connector synthesis Wire references", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("connector");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));

    const connectorAnalysisPanel = getPanelByHeading("Connector analysis");
    fireEvent.click(within(connectorAnalysisPanel).getByRole("button", { name: "Synthesis" }));
    fireEvent.click(within(connectorAnalysisPanel).getByRole("button", { name: "Wire 1" }));

    const wireEditPanel = getPanelByHeading("Edit Wire");
    expect(within(wireEditPanel).getByDisplayValue("W-1")).toBeInTheDocument();
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Wire$/, hidden: true })).toHaveClass("is-active");
  });

  it("opens destination editing from connector synthesis Destination references", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("connector");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));

    const connectorAnalysisPanel = getPanelByHeading("Connector analysis");
    fireEvent.click(within(connectorAnalysisPanel).getByRole("button", { name: "Synthesis" }));
    fireEvent.click(within(connectorAnalysisPanel).getByRole("button", { name: "Splice 1 (S-1) / P1" }));

    const spliceEditPanel = getPanelByHeading("Edit Splice");
    expect(within(spliceEditPanel).getByDisplayValue("S-1")).toBeInTheDocument();
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Splice$/, hidden: true })).toHaveClass("is-active");
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

  it("preserves the splice analysis view when returning to splice analysis", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("splice");

    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByText("Splice 1"));

    const spliceAnalysisPanel = getPanelByHeading("Splice analysis");
    fireEvent.click(within(spliceAnalysisPanel).getByRole("button", { name: "Synthesis" }));
    expect(within(spliceAnalysisPanel).getByRole("button", { name: "Synthesis" })).toHaveAttribute("aria-pressed", "true");

    switchSubScreenDrawerAware("wire");
    switchSubScreenDrawerAware("splice");

    const refreshedSpliceAnalysisPanel = getPanelByHeading("Splice analysis");
    expect(within(refreshedSpliceAnalysisPanel).getByRole("button", { name: "Synthesis" })).toHaveAttribute("aria-pressed", "true");
    expect(within(refreshedSpliceAnalysisPanel).getByRole("button", { name: "Ports" })).toHaveAttribute("aria-pressed", "false");
  });

  it("opens wire editing from splice synthesis Wire references", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("splice");

    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByText("Splice 1"));

    const spliceAnalysisPanel = getPanelByHeading("Splice analysis");
    fireEvent.click(within(spliceAnalysisPanel).getByRole("button", { name: "Synthesis" }));
    fireEvent.click(within(spliceAnalysisPanel).getByRole("button", { name: "Wire 1" }));

    const wireEditPanel = getPanelByHeading("Edit Wire");
    expect(within(wireEditPanel).getByDisplayValue("W-1")).toBeInTheDocument();
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Wire$/, hidden: true })).toHaveClass("is-active");
  });

  it("opens destination editing from splice synthesis Destination references", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("splice");

    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByText("Splice 1"));

    const spliceAnalysisPanel = getPanelByHeading("Splice analysis");
    fireEvent.click(within(spliceAnalysisPanel).getByRole("button", { name: "Synthesis" }));
    fireEvent.click(within(spliceAnalysisPanel).getByRole("button", { name: "Connector 1 (C-1) / C1" }));

    const connectorEditPanel = getPanelByHeading("Edit Connector");
    expect(within(connectorEditPanel).getByDisplayValue("C-1")).toBeInTheDocument();
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Connector$/, hidden: true })).toHaveClass(
      "is-active"
    );
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
    const occupiedCard = within(connectorAnalysisPanel).getByText("W-GHOST / A").closest("article");
    expect(occupiedCard).not.toBeNull();
    expect(within(occupiedCard as HTMLElement).getByRole("button", { name: "Go to" })).toBeDisabled();
    expect(within(occupiedCard as HTMLElement).getByRole("button", { name: "Release" })).toBeEnabled();
  });

  it("opens segment analysis from node analysis associated segments table", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("node");

    const nodesPanel = getPanelByHeading("Nodes");
    fireEvent.click(within(nodesPanel).getByText("N-C1"));

    const nodeAnalysisPanel = getPanelByHeading("Node analysis");
    const associatedSegmentsTable = within(nodeAnalysisPanel).getByRole("table");
    const firstRow = associatedSegmentsTable.querySelector("tbody tr");
    expect(firstRow).not.toBeNull();
    fireEvent.click(within(firstRow as HTMLElement).getByRole("button", { name: "Go to" }));

    const segmentAnalysisPanel = getPanelByHeading("Segment analysis");
    expect(within(segmentAnalysisPanel).getByText("SEG-A")).toBeInTheDocument();
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Segment$/, hidden: true })).toHaveClass(
      "is-active"
    );
  });

  it("opens wire analysis from segment analysis traversing wires table", () => {
    renderAppWithState(createUiIntegrationDenseWiresState());

    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("segment");

    const segmentsPanel = getPanelByHeading("Segments");
    fireEvent.click(within(segmentsPanel).getByText("SEG-B"));

    const segmentAnalysisPanel = getPanelByHeading("Segment analysis");
    const traversingWiresTable = within(segmentAnalysisPanel).getByRole("table");
    const firstRow = traversingWiresTable.querySelector("tbody tr");
    expect(firstRow).not.toBeNull();
    fireEvent.click(within(firstRow as HTMLElement).getByRole("button", { name: "Go to" }));

    const wireAnalysisPanel = getPanelByHeading("Wire analysis");
    expect(within(wireAnalysisPanel).getByText("Wire 1")).toBeInTheDocument();
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Wire$/, hidden: true })).toHaveClass(
      "is-active"
    );
  });
});

import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AppState, NetworkScopedState } from "../store";
import { createEmptyNetworkScopedState, createInitialState } from "../store";
import type { Connector, ConnectorId, Network, NetworkId, Wire } from "../core/entities";
import {
  asConnectorId,
  asWireId,
  createUiIntegrationState,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

function makeNetwork(id: string, name: string): Network {
  return {
    id: id as NetworkId,
    name,
    technicalId: id.toUpperCase(),
    createdAt: "2026-06-03T00:00:00.000Z",
    updatedAt: "2026-06-03T00:00:00.000Z"
  };
}

function makeConnector(id: string): Connector {
  return {
    id: asConnectorId(id),
    name: id,
    technicalId: id,
    cavityCount: 2
  };
}

function makeWire(id: string, connectorId: ConnectorId, lengthMm: number): Wire {
  return {
    id: asWireId(id),
    name: id,
    technicalId: id,
    sectionMm2: 1,
    primaryColorId: null,
    secondaryColorId: null,
    endpointA: {
      kind: "connectorCavity",
      connectorId,
      cavityIndex: 1
    },
    endpointB: {
      kind: "connectorCavity",
      connectorId,
      cavityIndex: 2
    },
    routeSegmentIds: [],
    lengthMm,
    isRouteLocked: false
  };
}

function withSecondNetwork(state: AppState): AppState {
  const network = makeNetwork("network-secondary", "Secondary network");
  const connector = makeConnector("C-secondary");
  const wire = makeWire("W-secondary", connector.id, 2000);
  const scoped: NetworkScopedState = {
    ...createEmptyNetworkScopedState(),
    connectors: {
      byId: { [connector.id]: connector },
      allIds: [connector.id]
    },
    wires: {
      byId: { [wire.id]: wire },
      allIds: [wire.id]
    }
  };

  return {
    ...state,
    networks: {
      byId: {
        ...state.networks.byId,
        [network.id]: network
      },
      allIds: [...state.networks.allIds, network.id]
    },
    networkStates: {
      ...state.networkStates,
      [network.id]: scoped
    }
  };
}

function closeOnboardingIfOpen(): void {
  const closeButton = screen.queryByRole("button", { name: "Close onboarding" });
  if (closeButton !== null) {
    fireEvent.click(closeButton);
  }
}

describe("Statistics workspace", () => {
  it("renders the Statistics tab between Modeling and Validation", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();

    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    const tabs = [...(primaryNavRow as HTMLElement).querySelectorAll("button")].map((button) => button.textContent ?? "");
    const modelingIndex = tabs.findIndex((label) => label.includes("Modeling"));
    const statisticsIndex = tabs.findIndex((label) => label.includes("Statistics"));
    const validationIndex = tabs.findIndex((label) => label.includes("Validation"));

    expect(modelingIndex).toBeGreaterThanOrEqual(0);
    expect(statisticsIndex).toBeGreaterThan(modelingIndex);
    expect(validationIndex).toBeGreaterThan(statisticsIndex);
  });

  it("opens on active-network statistics by default", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();

    switchScreenDrawerAware("statistics");

    const summaryPanel = screen.getByRole("heading", { name: "Summary" }).closest(".panel");
    expect(summaryPanel).not.toBeNull();
    expect(within(summaryPanel as HTMLElement).getByText("Connectors")).toBeInTheDocument();
    expect(within(summaryPanel as HTMLElement).getByText("Wires")).toBeInTheDocument();
    expect(screen.getByText(/routed wires included/i)).toBeInTheDocument();
  });

  it("shows a Statistics-specific empty state without an active network", () => {
    const empty = createInitialState();
    renderAppWithState({
      ...empty,
      activeNetworkId: null,
      networks: { byId: {}, allIds: [] },
      networkStates: {}
    });
    closeOnboardingIfOpen();

    switchScreenDrawerAware("statistics");

    expect(screen.getByRole("heading", { name: "Statistics" })).toBeInTheDocument();
    expect(screen.getByText("Create or select a network to view statistics.")).toBeInTheDocument();
  });

  it("supports manual multi-network comparison", () => {
    renderAppWithState(withSecondNetwork(createUiIntegrationState()));
    closeOnboardingIfOpen();

    switchScreenDrawerAware("statistics");
    fireEvent.click(screen.getByRole("button", { name: "Manual selection" }));
    expect(screen.queryByText("NETWORK-SECONDARY")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Secondary network/i));

    const comparisonPanel = screen.getByRole("heading", { name: "Per-network comparison" }).closest(".panel");
    expect(comparisonPanel).not.toBeNull();
    expect(within(comparisonPanel as HTMLElement).getByText("Main network (Sample)")).toBeInTheDocument();
    expect(within(comparisonPanel as HTMLElement).getByText("Secondary network")).toBeInTheDocument();
    expect(within(comparisonPanel as HTMLElement).getByText("2.00 m")).toBeInTheDocument();
  });

  it("does not expose charts, pricing, or export controls in the first release", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();

    switchScreenDrawerAware("statistics");

    expect(screen.queryByRole("button", { name: /csv/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/price|cost|chart/i)).not.toBeInTheDocument();
  });

  it("keeps detailed catalog, material, and electrical panels out of the statistics tab", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();

    switchScreenDrawerAware("statistics");

    expect(screen.queryByRole("heading", { name: "Catalog linkage" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Manufacturer references" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Wire materials" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Electrical metadata" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Pin role coverage" })).not.toBeInTheDocument();
  });
});

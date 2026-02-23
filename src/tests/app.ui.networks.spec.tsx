import { fireEvent, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ConnectorId, NetworkId } from "../core/entities";
import { appActions, appReducer, createInitialState } from "../store";
import { getPanelByHeading, renderAppWithState, switchScreen, switchScreenDrawerAware } from "./helpers/app-ui-test-utils";

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

describe("App integration UI - networks", () => {
  it("switches active network and keeps entity lists isolated", () => {
    const base = createInitialState();
    const defaultNetworkId = base.activeNetworkId as NetworkId;
    const withDefaultConnector = appReducer(
      base,
      appActions.upsertConnector({
        id: asConnectorId("C-DEFAULT"),
        name: "Default connector",
        technicalId: "C-DEFAULT",
        cavityCount: 2
      })
    );
    const withSecondNetwork = appReducer(
      withDefaultConnector,
      appActions.createNetwork({
        id: asNetworkId("net-b"),
        name: "Network B",
        technicalId: "NET-B",
        createdAt: "2026-02-21T09:00:00.000Z",
        updatedAt: "2026-02-21T09:00:00.000Z"
      })
    );
    const withSecondConnector = appReducer(
      withSecondNetwork,
      appActions.upsertConnector({
        id: asConnectorId("C-B"),
        name: "Connector B",
        technicalId: "C-B",
        cavityCount: 3
      })
    );
    const seeded = appReducer(withSecondConnector, appActions.selectNetwork(defaultNetworkId));

    renderAppWithState(seeded);
    switchScreen("modeling");

    let connectorsPanel = getPanelByHeading("Connectors");
    expect(within(connectorsPanel).getByText("Default connector")).toBeInTheDocument();
    expect(within(connectorsPanel).queryByText("Connector B")).not.toBeInTheDocument();

    switchScreen("networkScope");
    const networkScopePanel = getPanelByHeading("Network Scope");
    const networkRow = within(networkScopePanel).getByText("Network B").closest("tr");
    expect(networkRow).not.toBeNull();
    fireEvent.click(networkRow as HTMLElement);
    fireEvent.click(within(networkScopePanel).getByRole("button", { name: "Set active" }));

    switchScreen("modeling");
    connectorsPanel = getPanelByHeading("Connectors");
    expect(within(connectorsPanel).getByText("Connector B")).toBeInTheDocument();
    expect(within(connectorsPanel).queryByText("Default connector")).not.toBeInTheDocument();
  });

  it("shows explicit empty state when no active network exists", () => {
    const initial = createInitialState();
    const noNetwork = appReducer(initial, appActions.deleteNetwork(initial.activeNetworkId as NetworkId));

    renderAppWithState(noNetwork);
    switchScreen("networkScope");

    expect(within(document.body).getByRole("heading", { name: "Network Scope" })).toBeInTheDocument();
    expect(within(document.body).getByRole("button", { name: "New" })).toBeInTheDocument();
  });

  it("shows the no-active-network empty state on non-settings workspace screens", () => {
    const initial = createInitialState();
    const noNetwork = appReducer(initial, appActions.deleteNetwork(initial.activeNetworkId as NetworkId));

    renderAppWithState(noNetwork);

    for (const targetScreen of ["modeling", "analysis", "validation"] as const) {
      switchScreenDrawerAware(targetScreen);
      expect(within(document.body).getByRole("heading", { name: "No active network" })).toBeInTheDocument();
    }
  });

  it("edits the selected network through the shared create/edit form", async () => {
    const { store } = renderAppWithState(createInitialState());
    switchScreen("networkScope");

    const networkScopePanel = getPanelByHeading("Network Scope");
    const mainNetworkRow = within(networkScopePanel).getByText("Main network sample").closest("tr");
    expect(mainNetworkRow).not.toBeNull();
    fireEvent.click(mainNetworkRow as HTMLElement);

    const formPanel = getPanelByHeading("Edit network");

    expect(within(formPanel).getByLabelText("Network name")).toHaveValue("Main network sample");
    expect(within(formPanel).getByLabelText("Network technical ID")).toHaveValue("NET-MAIN-SAMPLE");

    fireEvent.change(within(formPanel).getByLabelText("Network name"), {
      target: { value: "Main network updated" }
    });
    fireEvent.change(within(formPanel).getByLabelText("Network technical ID"), {
      target: { value: "NET-MAIN-UPD" }
    });
    expect(within(formPanel).getByLabelText("Network name")).toHaveValue("Main network updated");
    expect(within(formPanel).getByLabelText("Network technical ID")).toHaveValue("NET-MAIN-UPD");
    fireEvent.click(within(formPanel).getByRole("button", { name: "Save network" }));

    await waitFor(() => {
      const updatedNetwork = store.getState().networks.byId[store.getState().activeNetworkId as NetworkId];
      expect(updatedNetwork?.name).toBe("Main network updated");
      expect(updatedNetwork?.technicalId).toBe("NET-MAIN-UPD");
      expect(within(networkScopePanel).getByText("NET-MAIN-UPD")).toBeInTheDocument();
    });
  });

  it("focuses a network row on single click while opening the edit form", async () => {
    const base = createInitialState();
    const seeded = appReducer(
      base,
      appActions.createNetwork({
        id: asNetworkId("net-b"),
        name: "Network B",
        technicalId: "NET-B",
        createdAt: "2026-02-23T10:00:00.000Z",
        updatedAt: "2026-02-23T10:00:00.000Z"
      })
    );

    renderAppWithState(seeded);
    switchScreen("networkScope");

    const networkScopePanel = getPanelByHeading("Network Scope");
    const networkRow = within(networkScopePanel).getByText("Network B").closest("tr");
    expect(networkRow).not.toBeNull();

    fireEvent.click(networkRow as HTMLElement);

    expect(getPanelByHeading("Edit network")).toBeInTheDocument();
    await waitFor(() => {
      expect(networkRow).toHaveClass("is-selected");
      expect(document.activeElement).toBe(networkRow);
    });
  });
});

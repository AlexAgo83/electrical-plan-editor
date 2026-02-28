import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
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
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not show the network form panel on Network Scope until a row is explicitly selected", () => {
    renderAppWithState(createInitialState());
    switchScreen("networkScope");

    expect(getPanelByHeading("Network Scope")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Recent changes" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Edit network" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Create network" })).not.toBeInTheDocument();
  });

  it("renders active-network recent changes between Network Scope and Edit network, then hides for another active network without history", async () => {
    const base = createInitialState();
    const defaultNetworkId = base.activeNetworkId as NetworkId;
    const withSecondNetwork = appReducer(
      base,
      appActions.createNetwork({
        id: asNetworkId("net-b"),
        name: "Network B",
        technicalId: "NET-B",
        createdAt: "2026-02-27T10:00:00.000Z",
        updatedAt: "2026-02-27T10:00:00.000Z"
      })
    );
    const seeded = appReducer(withSecondNetwork, appActions.selectNetwork(defaultNetworkId));
    renderAppWithState(seeded);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));

    switchScreen("networkScope");
    const networkScopePanel = getPanelByHeading("Network Scope");
    fireEvent.click(within(networkScopePanel).getByText("Main network sample").closest("tr") as HTMLElement);
    const editFormPanel = getPanelByHeading("Edit network");
    fireEvent.change(within(editFormPanel).getByLabelText("Description (optional)"), { target: { value: "Recent change update" } });
    fireEvent.click(within(editFormPanel).getByRole("button", { name: "Save network" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Recent changes" })).toBeInTheDocument();
    });

    const recentChangesHeading = screen.getByRole("heading", { name: "Recent changes" });
    const editHeading = screen.getByRole("heading", { name: "Edit network" });
    const networkScopeHeading = screen.getByRole("heading", { name: "Network Scope" });
    expect(networkScopeHeading.compareDocumentPosition(recentChangesHeading) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(recentChangesHeading.compareDocumentPosition(editHeading) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);

    const recentChangesPanel = recentChangesHeading.closest(".panel");
    expect(recentChangesPanel).not.toBeNull();
    expect(within(recentChangesPanel as HTMLElement).getByText("Network 'NET-MAIN-SAMPLE' updated")).toBeInTheDocument();
    const firstTime = (recentChangesPanel as HTMLElement).querySelector("time")?.textContent ?? "";
    expect(firstTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);

    fireEvent.click(within(networkScopePanel).getByText("Network B").closest("tr") as HTMLElement);
    fireEvent.click(within(getPanelByHeading("Edit network")).getByRole("button", { name: "Set active" }));

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Recent changes" })).not.toBeInTheDocument();
    });
  });

  it("restores active-network recent changes after remount/reload", async () => {
    const firstRender = renderAppWithState(createInitialState());
    switchScreen("networkScope");

    const networkScopePanel = getPanelByHeading("Network Scope");
    fireEvent.click(within(networkScopePanel).getByText("Main network sample").closest("tr") as HTMLElement);
    const editFormPanel = getPanelByHeading("Edit network");
    fireEvent.change(within(editFormPanel).getByLabelText("Description (optional)"), { target: { value: "Persist recent changes" } });
    fireEvent.click(within(editFormPanel).getByRole("button", { name: "Save network" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Recent changes" })).toBeInTheDocument();
    });
    expect(screen.getByText("Network 'NET-MAIN-SAMPLE' updated")).toBeInTheDocument();

    firstRender.unmount();

    renderAppWithState(createInitialState());
    switchScreen("networkScope");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Recent changes" })).toBeInTheDocument();
    });
    expect(screen.getByText("Network 'NET-MAIN-SAMPLE' updated")).toBeInTheDocument();
  });

  it("hides the edit network panel again when returning to Network Scope", () => {
    renderAppWithState(createInitialState());

    switchScreen("networkScope");
    const networkScopePanel = getPanelByHeading("Network Scope");
    const mainNetworkRow = within(networkScopePanel).getByText("Main network sample").closest("tr");
    expect(mainNetworkRow).not.toBeNull();
    fireEvent.click(mainNetworkRow as HTMLElement);
    expect(getPanelByHeading("Edit network")).toBeInTheDocument();

    switchScreen("modeling");
    switchScreen("networkScope");

    expect(getPanelByHeading("Network Scope")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Edit network" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Create network" })).not.toBeInTheDocument();
  });

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
    const formPanel = getPanelByHeading("Edit network");
    fireEvent.click(within(formPanel).getByRole("button", { name: "Set active" }));

    switchScreen("modeling");
    connectorsPanel = getPanelByHeading("Connectors");
    expect(within(connectorsPanel).getByText("Connector B")).toBeInTheDocument();
    expect(within(connectorsPanel).queryByText("Default connector")).not.toBeInTheDocument();
  });

  it("opens the focused network in modeling and sets it active from Network Scope", () => {
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
    switchScreen("networkScope");

    const networkScopePanel = getPanelByHeading("Network Scope");
    fireEvent.click(within(networkScopePanel).getByText("Network B").closest("tr") as HTMLElement);
    fireEvent.click(within(networkScopePanel).getByRole("button", { name: "Open" }));

    const connectorsPanel = getPanelByHeading("Connectors");
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

  it("sets an available network active on row double click", async () => {
    const base = createInitialState();
    const seeded = appReducer(
      base,
      appActions.createNetwork({
        id: asNetworkId("net-b"),
        name: "Network B",
        technicalId: "NET-B",
        createdAt: "2026-02-23T10:05:00.000Z",
        updatedAt: "2026-02-23T10:05:00.000Z"
      })
    );

    renderAppWithState(seeded);
    switchScreen("networkScope");

    const networkScopePanel = getPanelByHeading("Network Scope");
    const networkRow = within(networkScopePanel).getByText("Network B").closest("tr");
    expect(networkRow).not.toBeNull();

    fireEvent.doubleClick(networkRow as HTMLElement);

    await waitFor(() => {
      expect(within(networkRow as HTMLElement).getByText("Active")).toBeInTheDocument();
    });
  });

  it("keeps focus in the network form inputs while typing after selecting a row", async () => {
    renderAppWithState(createInitialState());
    switchScreen("networkScope");

    const networkScopePanel = getPanelByHeading("Network Scope");
    const mainNetworkRow = within(networkScopePanel).getByText("Main network sample").closest("tr");
    expect(mainNetworkRow).not.toBeNull();
    fireEvent.click(mainNetworkRow as HTMLElement);

    const formPanel = getPanelByHeading("Edit network");
    const nameInput = within(formPanel).getByLabelText("Network name");
    (nameInput as HTMLInputElement).focus();
    expect(document.activeElement).toBe(nameInput);

    fireEvent.change(nameInput, {
      target: { value: "Main network sample X" }
    });

    await waitFor(() => {
      expect(nameInput).toHaveValue("Main network sample X");
      expect(document.activeElement).toBe(nameInput);
    });
  });

  it("filters the network scope table with a field selector without changing the panel layout", () => {
    const seeded = appReducer(
      createInitialState(),
      appActions.createNetwork({
        id: asNetworkId("net-validation"),
        name: "Validation issues sample",
        technicalId: "NET-VALIDATION-SAMPLE",
        createdAt: "2026-02-23T10:10:00.000Z",
        updatedAt: "2026-02-23T10:10:00.000Z"
      })
    );
    renderAppWithState(seeded);
    switchScreen("networkScope");

    const networkScopePanel = getPanelByHeading("Network Scope");
    expect(within(networkScopePanel).getByText("Main network sample")).toBeInTheDocument();
    expect(within(networkScopePanel).getByText("Validation issues sample")).toBeInTheDocument();
    expect(within(networkScopePanel).getByText("Filter")).toBeInTheDocument();

    fireEvent.change(within(networkScopePanel).getByLabelText("Network filter field"), {
      target: { value: "technicalId" }
    });
    fireEvent.change(within(networkScopePanel).getByPlaceholderText("Technical ID"), {
      target: { value: "NET-VALIDATION-SAMPLE" }
    });

    expect(within(networkScopePanel).getByText("Validation issues sample")).toBeInTheDocument();
    expect(within(networkScopePanel).queryByText("Main network sample")).not.toBeInTheDocument();
  });
});

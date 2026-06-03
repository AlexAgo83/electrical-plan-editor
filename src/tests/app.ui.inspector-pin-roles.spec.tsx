import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

function openConnectorAnalysis(connectorName: string) {
  fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
  switchScreenDrawerAware("analysis");
  switchSubScreenDrawerAware("connector");
  const connectorsPanel = getPanelByHeading("Connectors");
  fireEvent.click(within(connectorsPanel).getByText(connectorName));
  return getPanelByHeading("Connector analysis");
}

describe("App integration UI - connector pin electrical roles inspector", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("edits a single pin role and persists the override on save", () => {
    const catalogItemId = asCatalogItemId("CAT-ECU");
    const connectorId = asConnectorId("C-ECU");
    let state = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "ECU-4",
        connectionCount: 4
      })
    );
    state = appReducer(
      state,
      appActions.upsertConnector({
        id: connectorId,
        name: "ECU connector",
        technicalId: "ECU-C1",
        cavityCount: 4,
        catalogItemId,
        manufacturerReference: "ECU-4"
      })
    );

    const { store } = renderAppWithState(state);
    const panel = openConnectorAnalysis("ECU connector");

    const roleSelect = within(panel).getByLabelText("Role for pin 1");
    const currentInput = within(panel).getByLabelText("Max current for pin 1");
    const labelInput = within(panel).getByLabelText("Label for pin 1");

    fireEvent.change(roleSelect, { target: { value: "consumer" } });
    fireEvent.change(currentInput, { target: { value: "40" } });
    fireEvent.change(labelInput, { target: { value: "BAT+" } });

    fireEvent.click(within(panel).getByRole("button", { name: "Save roles" }));

    const saved = store.getState().connectors.byId[connectorId];
    expect(saved?.pinElectricalRoles).toEqual({ 1: { role: "consumer", currentA: 40, label: "BAT+" } });
  });

  it("shows inherited pin role details without a source column", () => {
    const catalogItemId = asCatalogItemId("CAT-ECU");
    const connectorId = asConnectorId("C-ECU");
    let state = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "ECU-4",
        connectionCount: 4,
        connectorDefaults: { pinElectricalRoles: { 1: { role: "consumer", currentA: 40, label: "BAT+" } } }
      })
    );
    state = appReducer(
      state,
      appActions.upsertConnector({
        id: connectorId,
        name: "ECU connector",
        technicalId: "ECU-C1",
        cavityCount: 4,
        catalogItemId,
        manufacturerReference: "ECU-4",
        pinElectricalRoles: { 2: { role: "source", currentA: 2.5 } }
      })
    );

    renderAppWithState(state);
    const panel = openConnectorAnalysis("ECU connector");

    const row1 = within(panel).getByLabelText("Select pin 1").closest('[role="row"]') as HTMLElement;
    const columnHeaders = within(panel)
      .getAllByRole("columnheader")
      .map((header) => header.textContent?.trim())
      .filter((text): text is string => text !== undefined && text.length > 0);

    expect(columnHeaders).toEqual(["Select", "Pin", "Role", "Max current (A)", "Label"]);
    expect(row1.querySelector("[data-pin-role-source]")).toBeNull();
    expect(within(row1).getByText("40 A")).toBeInTheDocument();
    expect(within(row1).getByText("BAT+")).toBeInTheDocument();
  });

  it("does not render the old connector form pin roles panel", () => {
    const catalogItemId = asCatalogItemId("CAT-ECU");
    const connectorId = asConnectorId("C-ECU");
    let state = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "ECU-4",
        connectionCount: 4
      })
    );
    state = appReducer(
      state,
      appActions.upsertConnector({
        id: connectorId,
        name: "ECU connector",
        technicalId: "ECU-C1",
        cavityCount: 4,
        catalogItemId,
        manufacturerReference: "ECU-4"
      })
    );

    renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("ECU connector"));

    expect(within(getPanelByHeading("Edit Connector")).queryByText(/Pin electrical roles/i)).not.toBeInTheDocument();
  });

  it("shows pin roles in the connector analysis ways view", () => {
    const catalogItemId = asCatalogItemId("CAT-ECU");
    const connectorId = asConnectorId("C-ECU");
    let state = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "ECU-4",
        connectionCount: 4,
        connectorDefaults: { pinElectricalRoles: { 1: { role: "consumer", currentA: 40, label: "BAT+" } } }
      })
    );
    state = appReducer(
      state,
      appActions.upsertConnector({
        id: connectorId,
        name: "ECU connector",
        technicalId: "ECU-C1",
        cavityCount: 4,
        catalogItemId,
        manufacturerReference: "ECU-4",
        pinElectricalRoles: { 2: { role: "source", currentA: 2.5 } }
      })
    );

    renderAppWithState(state);
    const panel = openConnectorAnalysis("ECU connector");
    expect(within(panel).getByRole("button", { name: "Ways & roles" })).toHaveAttribute("aria-pressed", "true");
    expect(panel.querySelector(".connector-ways-cavity-grid")).toBeNull();

    const firstWay = within(panel).getByLabelText("Select pin 1").closest('[role="row"]') as HTMLElement;
    const secondWay = within(panel).getByLabelText("Select pin 2").closest('[role="row"]') as HTMLElement;

    expect(within(firstWay).getByText("Consumer")).toBeInTheDocument();
    expect(within(firstWay).getByText("BAT+")).toBeInTheDocument();
    expect(within(firstWay).getByText("40 A")).toBeInTheDocument();
    expect(within(secondWay).getByText("Source")).toBeInTheDocument();
    expect(within(panel).queryByRole("columnheader", { name: "Source" })).not.toBeInTheDocument();
    expect(within(secondWay).getByDisplayValue("2.5")).toBeInTheDocument();
  });

  it("edits catalog material application from connector analysis", () => {
    const catalogItemId = asCatalogItemId("CAT-ECU");
    const connectorId = asConnectorId("C-ECU");
    let state = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "ECU-4",
        connectionCount: 4
      })
    );
    state = appReducer(
      state,
      appActions.upsertConnector({
        id: connectorId,
        name: "ECU connector",
        technicalId: "ECU-C1",
        cavityCount: 4,
        catalogItemId,
        manufacturerReference: "ECU-4"
      })
    );

    const { store } = renderAppWithState(state);
    const panel = openConnectorAnalysis("ECU connector");
    const viewButtons = within(panel).getAllByRole("button", { pressed: false }).map((button) => button.textContent?.trim());
    expect(viewButtons).toContain("Catalog material");

    fireEvent.click(within(panel).getByRole("button", { name: "Catalog material" }));
    expect(within(panel).getByRole("button", { name: "Catalog material" })).toHaveAttribute("aria-pressed", "true");
    expect(within(panel).queryByText("Catalog material application")).not.toBeInTheDocument();
    expect(within(panel).getByLabelText("Apply catalog seals")).toBeInTheDocument();
    expect(within(panel).getByLabelText("Terminal and seal overrides")).toBeInTheDocument();

    fireEvent.click(within(panel).getByLabelText("Apply catalog seals"));
    fireEvent.change(within(panel).getByLabelText("Terminal and seal overrides"), {
      target: { value: "1,TERM-A,SEAL-A,Terminal A,Seal A" }
    });
    fireEvent.click(within(panel).getByRole("button", { name: "Save material application" }));

    const saved = store.getState().connectors.byId[connectorId];
    expect(saved?.applyCatalogSeals).toBe(false);
    expect(saved?.applyCatalogPlugs).toBeUndefined();
    expect(saved?.terminalOverrides).toEqual({
      1: {
        terminalReference: "TERM-A",
        sealReference: "SEAL-A",
        terminalName: "Terminal A",
        sealName: "Seal A"
      }
    });
  });

  it("applies a bulk role to selected pins as a single save", () => {
    const catalogItemId = asCatalogItemId("CAT-ECU");
    const connectorId = asConnectorId("C-ECU");
    let state = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "ECU-4",
        connectionCount: 4
      })
    );
    state = appReducer(
      state,
      appActions.upsertConnector({
        id: connectorId,
        name: "ECU connector",
        technicalId: "ECU-C1",
        cavityCount: 4,
        catalogItemId,
        manufacturerReference: "ECU-4"
      })
    );

    const { store } = renderAppWithState(state);
    const panel = openConnectorAnalysis("ECU connector");

    fireEvent.click(within(panel).getByLabelText("Select pin 1"));
    fireEvent.click(within(panel).getByLabelText("Select pin 3"));

    const bulkRoleSelect = within(panel).getByLabelText(/Bulk role/i);
    fireEvent.change(bulkRoleSelect, { target: { value: "source" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Apply role to selected pins" }));

    fireEvent.click(within(panel).getByRole("button", { name: "Save roles" }));

    const saved = store.getState().connectors.byId[connectorId];
    expect(saved?.pinElectricalRoles).toEqual({
      1: { role: "source" },
      3: { role: "source" }
    });
  });

  it("resets selected pins to catalog default by clearing the per-connector override", () => {
    const catalogItemId = asCatalogItemId("CAT-ECU");
    const connectorId = asConnectorId("C-ECU");
    let state = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "ECU-4",
        connectionCount: 4,
        connectorDefaults: { pinElectricalRoles: { 1: { role: "consumer", currentA: 40 } } }
      })
    );
    state = appReducer(
      state,
      appActions.upsertConnector({
        id: connectorId,
        name: "ECU connector",
        technicalId: "ECU-C1",
        cavityCount: 4,
        catalogItemId,
        manufacturerReference: "ECU-4",
        pinElectricalRoles: { 1: { role: "source", currentA: 2.5 } }
      })
    );

    const { store } = renderAppWithState(state);
    const panel = openConnectorAnalysis("ECU connector");

    fireEvent.click(within(panel).getByLabelText("Select pin 1"));
    fireEvent.click(within(panel).getByRole("button", { name: "Reset to catalog default" }));
    fireEvent.click(within(panel).getByRole("button", { name: "Save roles" }));

    const saved = store.getState().connectors.byId[connectorId];
    expect(saved?.pinElectricalRoles).toBeUndefined();
  });
});

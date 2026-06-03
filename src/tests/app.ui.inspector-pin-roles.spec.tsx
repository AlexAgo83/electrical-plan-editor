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

  it("badges per-pin source as catalog when only a catalog default exists, and override when set by the connector", () => {
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
    const row2 = within(panel).getByLabelText("Select pin 2").closest('[role="row"]') as HTMLElement;
    const row3 = within(panel).getByLabelText("Select pin 3").closest('[role="row"]') as HTMLElement;

    expect(row1.querySelector("[data-pin-role-source]")?.getAttribute("data-pin-role-source")).toBe("catalog");
    expect(row2.querySelector("[data-pin-role-source]")?.getAttribute("data-pin-role-source")).toBe("override");
    expect(row3.querySelector("[data-pin-role-source]")?.getAttribute("data-pin-role-source")).toBe("default");
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
    expect(within(firstWay).getByText("catalog")).toBeInTheDocument();
    expect(within(firstWay).getByText("BAT+ / 40 A")).toBeInTheDocument();
    expect(within(secondWay).getByText("Source")).toBeInTheDocument();
    expect(within(secondWay).getByText("override")).toBeInTheDocument();
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
    expect(within(panel).getByText("Catalog material application").closest("fieldset")).toHaveClass(
      "catalog-material-application-fieldset"
    );

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

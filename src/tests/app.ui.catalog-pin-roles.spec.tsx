import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState } from "../store";
import {
  asCatalogItemId,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

function openCatalogEditor(manufacturerReference: string): HTMLElement {
  fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
  switchScreenDrawerAware("modeling");
  switchSubScreenDrawerAware("catalog");
  const catalogPanel = getPanelByHeading("Catalog");
  fireEvent.click(within(catalogPanel).getByText(manufacturerReference));
  const catalogFormPanel = getPanelByHeading("Edit catalog item");
  fireEvent.click(within(catalogFormPanel).getByLabelText("Pin electric roles"));
  return getPanelByHeading("Pin electric roles");
}

describe("App integration UI - catalog connector defaults pin electrical roles", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("edits catalog default pin roles and propagates to connectors via merge logic", () => {
    const catalogItemId = asCatalogItemId("CAT-ECU");
    const state = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "ECU-4",
        connectionCount: 4,
        connectorDefaults: { allSameTerminals: true },
        connectorLayout: {
          version: 1,
          units: "grid",
          width: 2,
          height: 2,
          ways: [
            { cavityIndex: 1, x: 1, y: 1, shape: "round", label: "A1" },
            { cavityIndex: 2, x: 2, y: 1, shape: "round" },
            { cavityIndex: 3, x: 1, y: 2, shape: "round" },
            { cavityIndex: 4, x: 2, y: 2, shape: "round" }
          ]
        }
      })
    );

    const { store } = renderAppWithState(state);
    const pinRolesPanel = openCatalogEditor("ECU-4");

    const roleSelect = within(pinRolesPanel).getByLabelText("Role for pin A1");
    expect(within(pinRolesPanel).getByText("A1")).toBeInTheDocument();
    expect(within(pinRolesPanel).queryByLabelText("Max current for pin A1")).not.toBeInTheDocument();
    expect(within(pinRolesPanel).queryByLabelText("Label for pin A1")).not.toBeInTheDocument();

    fireEvent.change(roleSelect, { target: { value: "consumer" } });
    const currentInput = within(pinRolesPanel).getByLabelText("Max current for pin A1");
    const labelInput = within(pinRolesPanel).getByLabelText("Label for pin A1");
    fireEvent.change(currentInput, { target: { value: "40" } });
    fireEvent.change(labelInput, { target: { value: "BAT+" } });

    fireEvent.click(within(pinRolesPanel).getByRole("button", { name: "Save" }));

    const saved = store.getState().catalogItems.byId[catalogItemId];
    expect(saved?.connectorDefaults?.pinElectricalRoles).toEqual({
      1: { role: "consumer", currentA: 40, label: "BAT+" }
    });
  });

  it("does not offer inherited mode in catalog defaults and keeps role empty until selected", () => {
    const catalogItemId = asCatalogItemId("CAT-ECU");
    const state = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "ECU-4",
        connectionCount: 4,
        connectorDefaults: { allSameTerminals: true }
      })
    );

    const { store } = renderAppWithState(state);
    const pinRolesPanel = openCatalogEditor("ECU-4");
    const roleSelect = within(pinRolesPanel).getByLabelText("Role for pin C1");

    expect(roleSelect).toHaveValue("");
    expect(within(pinRolesPanel).queryByRole("option", { name: "(inherit)" })).not.toBeInTheDocument();
    expect(within(pinRolesPanel).queryByRole("button", { name: "Use catalog default" })).not.toBeInTheDocument();
    expect(within(pinRolesPanel).getByText("C1")).toBeInTheDocument();
    expect(within(pinRolesPanel).queryByLabelText("Max current for pin C1")).not.toBeInTheDocument();
    expect(within(pinRolesPanel).queryByLabelText("Label for pin C1")).not.toBeInTheDocument();

    fireEvent.change(roleSelect, { target: { value: "source" } });
    fireEvent.change(within(pinRolesPanel).getByLabelText("Max current for pin C1"), { target: { value: "12" } });
    fireEvent.click(within(pinRolesPanel).getByRole("button", { name: "Save" }));

    const saved = store.getState().catalogItems.byId[catalogItemId];
    expect(saved?.connectorDefaults?.pinElectricalRoles).toEqual({
      1: { role: "source", currentA: 12 }
    });
  });
});

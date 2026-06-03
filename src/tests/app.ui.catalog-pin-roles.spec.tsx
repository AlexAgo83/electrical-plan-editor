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
        connectorDefaults: { allSameTerminals: true }
      })
    );

    const { store } = renderAppWithState(state);
    const pinRolesPanel = openCatalogEditor("ECU-4");

    const roleSelect = within(pinRolesPanel).getByLabelText("Role for pin 1");
    const currentInput = within(pinRolesPanel).getByLabelText("Max current for pin 1");
    const labelInput = within(pinRolesPanel).getByLabelText("Label for pin 1");
    fireEvent.change(roleSelect, { target: { value: "consumer" } });
    fireEvent.change(currentInput, { target: { value: "40" } });
    fireEvent.change(labelInput, { target: { value: "BAT+" } });

    fireEvent.click(within(pinRolesPanel).getByRole("button", { name: "Save" }));

    const saved = store.getState().catalogItems.byId[catalogItemId];
    expect(saved?.connectorDefaults?.pinElectricalRoles).toEqual({
      1: { role: "consumer", currentA: 40, label: "BAT+" }
    });
  });
});

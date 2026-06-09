import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "../store";
import {
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - catalog rear backshell defaults", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps connector material defaults enabled when only rear backshell helper is saved", () => {
    const { store } = renderAppWithState(createInitialState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("catalog");

    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Create catalog item" }));
    const catalogFormPanel = getPanelByHeading("Create catalog item");
    fireEvent.change(within(catalogFormPanel).getByLabelText("Manufacturer reference"), {
      target: { value: "CAT-BACKSHELL-ONLY" }
    });
    fireEvent.change(within(catalogFormPanel).getByLabelText("Connection count"), {
      target: { value: "2" }
    });
    fireEvent.click(within(catalogFormPanel).getByLabelText("Connector material defaults"));
    const materialDefaultsPanel = getPanelByHeading("Connector material defaults");
    fireEvent.click(within(materialDefaultsPanel).getByLabelText("Rear backshell helper node"));
    fireEvent.change(within(materialDefaultsPanel).getByLabelText("Rear backshell length (mm)"), {
      target: { value: "55" }
    });
    fireEvent.click(within(materialDefaultsPanel).getByRole("button", { name: "Create" }));

    const saved = Object.values(store.getState().catalogItems.byId).find(
      (item) => item?.manufacturerReference === "CAT-BACKSHELL-ONLY"
    );
    expect(saved?.connectorDefaults?.rearBackshell).toEqual({ enabled: true, lengthMm: 55 });

    const editCatalogPanel = getPanelByHeading("Edit catalog item");
    const materialDefaultsToggle = within(editCatalogPanel).getByLabelText("Connector material defaults");
    expect(materialDefaultsToggle).toBeChecked();
    const restoredMaterialDefaultsPanel = getPanelByHeading("Connector material defaults");
    expect(within(restoredMaterialDefaultsPanel).getByLabelText("Rear backshell helper node")).toBeChecked();
    expect(within(restoredMaterialDefaultsPanel).getByLabelText("Rear backshell length (mm)")).toHaveValue(55);
  });
});

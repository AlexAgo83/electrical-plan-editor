import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - form validation doctrine", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses native browser validation gate before catalog inline business-rule validation", () => {
    const { store } = renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("catalog");

    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "New" }));
    const createCatalogPanel = getPanelByHeading("Create catalog item");
    const initialCatalogCount = store.getState().catalogItems.allIds.length;

    fireEvent.click(within(createCatalogPanel).getByRole("button", { name: "Create" }));

    expect(store.getState().catalogItems.allIds).toHaveLength(initialCatalogCount);
    expect(within(createCatalogPanel).queryByText("Manufacturer reference is required.")).not.toBeInTheDocument();
  });

  it("uses native browser validation gate before wire inline business-rule validation", () => {
    const { store } = renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    const wirePanel = getPanelByHeading("Wires");
    fireEvent.click(within(wirePanel).getByRole("button", { name: "New" }));
    const createWirePanel = getPanelByHeading("Create Wire");
    const initialWireCount = store.getState().wires.allIds.length;

    fireEvent.click(within(createWirePanel).getByRole("button", { name: "Create" }));

    expect(store.getState().wires.allIds).toHaveLength(initialWireCount);
    expect(within(createWirePanel).queryByText("Wire name and technical ID are required.")).not.toBeInTheDocument();
  });
});

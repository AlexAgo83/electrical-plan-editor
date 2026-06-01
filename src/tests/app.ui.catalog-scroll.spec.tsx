import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asCatalogItemId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { installScrollIntoViewSpy } from "./helpers/app-ui-form-test-utils";

describe("App integration UI - catalog scroll behavior", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("scrolls to the edit catalog item panel when clicking Edit", async () => {
    const scrollSpy = installScrollIntoViewSpy();

    try {
      const state = appReducer(
        createUiIntegrationState(),
        appActions.upsertCatalogItem({
          id: asCatalogItemId("CAT-SCROLL"),
          manufacturerReference: "CAT-SCROLL",
          connectionCount: 4
        })
      );
      renderAppWithState(state);
      fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
      switchScreenDrawerAware("modeling");

      const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
      expect(secondaryNavRow).not.toBeNull();
      fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));

      const catalogPanel = getPanelByHeading("Catalog");
      fireEvent.click(within(catalogPanel).getByText("CAT-SCROLL"));
      scrollSpy.scrollTargets.length = 0;
      fireEvent.click(within(catalogPanel).getByRole("button", { name: "Edit" }));

      const editCatalogPanel = getPanelByHeading("Edit catalog item");
      await waitFor(() => {
        expect(scrollSpy.scrollTargets).toContain(editCatalogPanel);
      });
    } finally {
      scrollSpy.restore();
    }
  });

  it("scrolls to the connector physical layout panel when enabling it", async () => {
    const scrollSpy = installScrollIntoViewSpy();

    try {
      renderAppWithState(createUiIntegrationState());
      fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
      switchScreenDrawerAware("modeling");

      const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
      expect(secondaryNavRow).not.toBeNull();
      fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));

      const catalogPanel = getPanelByHeading("Catalog");
      fireEvent.click(within(catalogPanel).getByRole("button", { name: "Create catalog item" }));
      const catalogFormPanel = getPanelByHeading("Create catalog item");
      fireEvent.click(within(catalogFormPanel).getByLabelText("Connector physical layout"));

      const catalogLayoutPanel = getPanelByHeading("Connector physical layout");
      await waitFor(() => {
        expect(scrollSpy.scrollTargets).toContain(catalogLayoutPanel);
      });
      expect(catalogLayoutPanel).toHaveAttribute("data-form-panel", "catalog-connector-layout-form");
    } finally {
      scrollSpy.restore();
    }
  });

  it("scrolls to the connector material defaults panel when enabling it", async () => {
    const scrollSpy = installScrollIntoViewSpy();

    try {
      renderAppWithState(createUiIntegrationState());
      fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
      switchScreenDrawerAware("modeling");

      const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
      expect(secondaryNavRow).not.toBeNull();
      fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));

      const catalogPanel = getPanelByHeading("Catalog");
      fireEvent.click(within(catalogPanel).getByRole("button", { name: "Create catalog item" }));
      const catalogFormPanel = getPanelByHeading("Create catalog item");
      fireEvent.click(within(catalogFormPanel).getByLabelText("Connector material defaults"));

      const catalogMaterialPanel = getPanelByHeading("Connector material defaults");
      await waitFor(() => {
        expect(scrollSpy.scrollTargets).toContain(catalogMaterialPanel);
      });
      expect(catalogMaterialPanel).toHaveAttribute("data-form-panel", "catalog-connector-defaults-form");
    } finally {
      scrollSpy.restore();
    }
  }, 15000);

  it("scrolls to the additional accessories panel when enabling it", async () => {
    const scrollSpy = installScrollIntoViewSpy();

    try {
      renderAppWithState(createUiIntegrationState());
      fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
      switchScreenDrawerAware("modeling");

      const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
      expect(secondaryNavRow).not.toBeNull();
      fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));

      const catalogPanel = getPanelByHeading("Catalog");
      fireEvent.click(within(catalogPanel).getByRole("button", { name: "Create catalog item" }));
      const catalogFormPanel = getPanelByHeading("Create catalog item");
      fireEvent.click(within(catalogFormPanel).getByLabelText("Additional accessories"));

      const catalogAccessoriesPanel = getPanelByHeading("Additional accessories");
      await waitFor(() => {
        expect(scrollSpy.scrollTargets).toContain(catalogAccessoriesPanel);
      });
      expect(catalogAccessoriesPanel).toHaveAttribute("data-form-panel", "catalog-additional-accessories-form");
    } finally {
      scrollSpy.restore();
    }
  });

  it("does not scroll to the catalog form when selecting a row directly", async () => {
    const scrollSpy = installScrollIntoViewSpy();

    try {
      const state = appReducer(
        createUiIntegrationState(),
        appActions.upsertCatalogItem({
          id: asCatalogItemId("CAT-ROW"),
          manufacturerReference: "CAT-ROW",
          connectionCount: 2
        })
      );
      renderAppWithState(state);
      fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
      switchScreenDrawerAware("modeling");

      const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
      expect(secondaryNavRow).not.toBeNull();
      fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));

      const catalogPanel = getPanelByHeading("Catalog");
      fireEvent.click(within(catalogPanel).getByText("CAT-ROW"));
      expect(getPanelByHeading("Edit catalog item")).toBeInTheDocument();
      const editCatalogPanel = getPanelByHeading("Edit catalog item");

      await new Promise((resolve) => setTimeout(resolve, 30));
      expect(scrollSpy.scrollTargets).not.toContain(editCatalogPanel);
    } finally {
      scrollSpy.restore();
    }
  }, 15000);
});

import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUiIntegrationState, getPanelByHeading, renderAppWithState, switchScreenDrawerAware, withViewportSize } from "./helpers/app-ui-test-utils";

describe("App integration UI - settings search", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("searches settings labels, highlights matches, and preserves label wiring", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");

    const searchInput = screen.getByLabelText("Search settings");
    fireEvent.change(searchInput, { target: { value: "language" } });

    const globalPreferencesPanel = getPanelByHeading("Global preferences");
    expect(within(globalPreferencesPanel).getByLabelText("Language")).toHaveValue("en");
    expect(within(globalPreferencesPanel).getByText("Language", { selector: "mark.settings-search-highlight" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/matching setting label/i);

    fireEvent.change(searchInput, { target: { value: "" } });
    expect(screen.queryByRole("status")).toBeNull();
    expect(document.querySelector("mark.settings-search-highlight")).toBeNull();
  });

  it("shows no-match feedback without changing settings values", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");

    const appearancePanel = getPanelByHeading("Appearance preferences");
    const tableDensity = within(appearancePanel).getByLabelText("Table density");
    const initialTableDensity = (tableDensity as HTMLSelectElement).value;

    fireEvent.change(screen.getByLabelText("Search settings"), { target: { value: "does not exist" } });

    expect(screen.getByRole("status")).toHaveTextContent("No setting label matches this search.");
    expect(tableDensity).toHaveValue(initialTableDensity);
    expect(getPanelByHeading("Appearance preferences")).toBeInTheDocument();
  });

  it("navigates settings sections and exposes search match counts in the glossary", () => {
    const originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView
    });

    try {
      renderAppWithState(createUiIntegrationState());
      switchScreenDrawerAware("settings");

      const settingsNavigation = screen.getByRole("navigation", { name: "Settings sections" });
      expect(within(settingsNavigation).getByRole("button", { name: "Workspace storage" })).toHaveAttribute("aria-current", "location");

      const catalogSectionButton = within(settingsNavigation).getByRole("button", { name: "Catalog & BOM setup" });
      fireEvent.click(catalogSectionButton);
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(catalogSectionButton).toHaveClass("is-active");
      expect(catalogSectionButton).toHaveAttribute("aria-current", "location");

      fireEvent.change(screen.getByLabelText("Search settings"), { target: { value: "tax" } });

      expect(within(settingsNavigation).getByRole("button", { name: "Catalog & BOM setup2" })).toBeInTheDocument();
      expect(within(settingsNavigation).getByRole("button", { name: "AI provider0" })).toHaveClass("is-dimmed");
      expect(within(getPanelByHeading("Catalog & BOM setup")).getAllByText(/tax/i, { selector: "mark.settings-search-highlight" }).length).toBeGreaterThan(0);

      fireEvent.change(screen.getByLabelText("Search settings"), { target: { value: "prefix" } });

      expect(within(settingsNavigation).getByRole("button", { name: "Canvas tools preferences1" })).toBeInTheDocument();
      expect(within(getPanelByHeading("Canvas tools preferences")).getByText("prefix", { selector: "mark.settings-search-highlight" })).toBeInTheDocument();
    } finally {
      if (originalScrollIntoViewDescriptor === undefined) {
        Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
      } else {
        Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScrollIntoViewDescriptor);
      }
    }
  });

  it("searches and highlights settings action buttons", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");

    fireEvent.change(screen.getByLabelText("Search settings"), { target: { value: "autosave" } });

    const settingsNavigation = screen.getByRole("navigation", { name: "Settings sections" });
    expect(within(settingsNavigation).getByRole("button", { name: "Workspace storage2" })).toBeInTheDocument();

    const workspaceStoragePanel = getPanelByHeading("Workspace storage");
    expect(within(workspaceStoragePanel).getByText("autosave", { selector: "mark.settings-search-highlight" })).toBeInTheDocument();
    expect(within(workspaceStoragePanel).getByRole("button", { name: "Use a file for autosave" })).toBeEnabled();
  });

  it("keeps settings section navigation reachable on narrow viewports", () => {
    withViewportSize({ width: 390, height: 760 }, () => {
      renderAppWithState(createUiIntegrationState());
      switchScreenDrawerAware("settings");

      expect(screen.getByRole("navigation", { name: "Settings sections" })).toBeInTheDocument();
      expect(screen.getByLabelText("Search settings")).toBeInTheDocument();
      expect(getPanelByHeading("AI provider")).toBeInTheDocument();
      expect(getPanelByHeading("Sample network controls")).toBeInTheDocument();
    });
  });

  it("docks settings search into the header after the source field scrolls under it", async () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");

    const headerBlock = document.querySelector(".header-block");
    const sourceSearchField = document.querySelector("[data-settings-search-source='true']");
    expect(headerBlock).not.toBeNull();
    expect(sourceSearchField).not.toBeNull();
    expect(document.querySelector(".header-docked-nav-shell .settings-search-field--header")).toBeNull();

    Object.defineProperty(headerBlock, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ top: 0, right: 1200, bottom: 72, left: 0, width: 1200, height: 72, x: 0, y: 0 })
    });
    Object.defineProperty(sourceSearchField, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ top: 48, right: 800, bottom: 96, left: 240, width: 560, height: 48, x: 240, y: 48 })
    });

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    await waitFor(() => expect(document.querySelector(".header-docked-nav-shell")).toHaveClass("is-visible"));
    const headerSearchField = document.querySelector(".header-docked-nav-shell .settings-search-field--header");
    expect(headerSearchField).not.toBeNull();
    const headerSearchInput = within(headerSearchField as HTMLElement).getByRole("searchbox");
    fireEvent.change(headerSearchInput, { target: { value: "tax" } });

    const sourceSearchInput = within(sourceSearchField as HTMLElement).getByRole("searchbox");
    expect(sourceSearchInput).toHaveValue("tax");
    expect(screen.getByRole("status")).toHaveTextContent("matching setting labels");
  });
});

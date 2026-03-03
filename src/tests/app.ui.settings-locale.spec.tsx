import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createUiIntegrationState, getPanelByHeading, renderAppWithState, switchScreenDrawerAware } from "./helpers/app-ui-test-utils";

describe("App integration UI - settings locale", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders Global preferences before Action bar and places Language selector before the panel action separator", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");

    const panelHeadings = Array.from(document.querySelectorAll(".settings-panel .settings-panel-header h2")).map((heading) =>
      heading.textContent?.trim()
    );
    const globalPreferencesIndex = panelHeadings.indexOf("Global preferences");
    const actionBarIndex = panelHeadings.indexOf("Action bar and shortcuts");
    expect(globalPreferencesIndex).toBeGreaterThanOrEqual(0);
    expect(actionBarIndex).toBeGreaterThanOrEqual(0);
    expect(globalPreferencesIndex).toBeLessThan(actionBarIndex);

    const globalPreferencesPanel = getPanelByHeading("Global preferences");
    const languageSelector = within(globalPreferencesPanel).getByLabelText("Language");
    expect(languageSelector).toHaveValue("en");
    expect(languageSelector).toHaveClass("settings-locale-select");

    const languageField = languageSelector.closest("label");
    const settingsActions = globalPreferencesPanel.querySelector(".row-actions.settings-actions");
    expect(languageField).not.toBeNull();
    expect(settingsActions).not.toBeNull();
    expect(
      Boolean((languageField as HTMLElement).compareDocumentPosition(settingsActions as HTMLElement) & Node.DOCUMENT_POSITION_FOLLOWING)
    ).toBe(true);
  });

  it("switches to French at runtime, keeps changelog excluded, and persists locale", async () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");

    const globalPreferencesPanel = getPanelByHeading("Global preferences");
    fireEvent.change(within(globalPreferencesPanel).getByLabelText("Language"), { target: { value: "fr" } });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Préférences d'apparence" })).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "Importer / Exporter des réseaux" })).toBeInTheDocument();

    const appearanceHeading = screen.getByRole("heading", { name: "Préférences d'apparence" });
    const appearancePanel = appearanceHeading.closest(".panel") as HTMLElement;
    const defaultSortSelect = within(appearancePanel).getByLabelText("Colonne de tri par défaut");
    expect(within(defaultSortSelect).getByRole("option", { name: "ID tech." })).toBeInTheDocument();

    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    const settingsToggle = document.querySelector(".header-settings-toggle");
    expect(settingsToggle).not.toBeNull();
    fireEvent.click(settingsToggle as HTMLElement);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Préférences d'apparence" })).toBeInTheDocument();
    });
    expect(document.documentElement.lang).toBe("fr");
  });

  it("switches back to English after French without getting stuck in translated labels", async () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");

    const globalPreferencesPanel = getPanelByHeading("Global preferences");
    const languageSelector = within(globalPreferencesPanel).getByLabelText("Language");

    fireEvent.change(languageSelector, { target: { value: "fr" } });
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Préférences d'apparence" })).toBeInTheDocument();
    });

    fireEvent.change(within(getPanelByHeading("Préférences globales")).getByLabelText("Langue"), { target: { value: "en" } });
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Appearance preferences" })).toBeInTheDocument();
    });
    expect(document.documentElement.lang).toBe("en");
  });

});

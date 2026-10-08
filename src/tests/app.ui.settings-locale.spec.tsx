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

  it("translates create-empty-workspace confirmation runtime copy in French locale", async () => {
    localStorage.setItem(
      "electrical-plan-editor.ui-preferences.v1",
      JSON.stringify({
        schemaVersion: 2,
        locale: "fr"
      })
    );

    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Fermer l'onboarding" }));

    fireEvent.click(screen.getByRole("button", { name: "Créer un espace vide" }));
    const confirmDialog = await screen.findByRole("dialog", { name: "Créer un espace vide" });
    expect(
      within(confirmDialog).getByText(
        "Remplacer l'espace de travail courant par un espace vide ? Cela supprime les changements actuels de l'espace."
      )
    ).toBeInTheDocument();
    fireEvent.click(within(confirmDialog).getByRole("button", { name: "Annuler" }));
  });


  it("localizes the workspace storage groups, compatibility subsection and search counts in French", async () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    fireEvent.change(within(getPanelByHeading("Global preferences")).getByLabelText("Language"), { target: { value: "fr" } });

    const storagePanel = await waitFor(() => getPanelByHeading("Stockage de l'espace de travail"));
    expect(within(storagePanel).getByRole("region", { name: "Espace actuel" })).toBeInTheDocument();
    expect(within(storagePanel).getByRole("region", { name: "Transfert et récupération" })).toBeInTheDocument();
    const legacy = within(storagePanel).getByRole("region", { name: "Compatibilité fichier unique" });
    expect(within(legacy).getByText("Enregistré uniquement dans ce navigateur")).toBeInTheDocument();
    expect(within(legacy).getByRole("button", { name: "Créer un espace nommé à partir du contenu actuel" })).toBeInTheDocument();
    expect(storagePanel.textContent).not.toMatch(/ui\.[A-Za-z]/);

    fireEvent.change(screen.getByRole("searchbox", { name: /paramètres/i }), { target: { value: "espace" } });
    expect(screen.getByRole("status")).toHaveTextContent(/libellés? de paramètres? correspondants?/);
    expect(within(storagePanel).getAllByText(/espace/i, { selector: "mark.settings-search-highlight" }).length).toBeGreaterThan(0);
  });
});

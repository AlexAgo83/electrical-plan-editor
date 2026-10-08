import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getThemeModeOptions, THEME_CLASS_NAMES_BY_MODE } from "../app/lib/themeModes";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createUiIntegrationState,
  renderAppWithState,
  switchScreen,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - theme mode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts in warm brown mode and toggles theme mode from settings panel", () => {
    renderAppWithState(createUiIntegrationState());

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();
    expect(appShell).toHaveClass("theme-warm-brown");

    switchScreen("settings");
    const settingsPanel = within(document.body).getByRole("heading", { name: "Appearance preferences" }).closest(".panel");
    expect(settingsPanel).not.toBeNull();
    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), { target: { value: "normal" } });
    expect(appShell).toHaveClass("theme-normal");

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), { target: { value: "dark" } });
    expect(appShell).toHaveClass("theme-dark");
  });

  it("supports custom theme variants", () => {
    renderAppWithState(createUiIntegrationState());

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();

    switchScreen("settings");
    const settingsPanel = within(document.body).getByRole("heading", { name: "Appearance preferences" }).closest(".panel");
    expect(settingsPanel).not.toBeNull();

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "slateNeon" }
    });
    expect(appShell).toHaveClass("theme-dark");
    expect(appShell).toHaveClass("theme-slate-neon");

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "paperBlueprint" }
    });
    expect(appShell).toHaveClass("theme-normal");
    expect(appShell).toHaveClass("theme-paper-blueprint");

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "warmBrown" }
    });
    expect(appShell).toHaveClass("theme-normal");
    expect(appShell).toHaveClass("theme-warm-brown");

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "deepGreen" }
    });
    expect(appShell).toHaveClass("theme-dark");
    expect(appShell).toHaveClass("theme-deep-green");

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "roseQuartz" }
    });
    expect(appShell).toHaveClass("theme-normal");
    expect(appShell).toHaveClass("theme-paper-blueprint");
    expect(appShell).toHaveClass("theme-rose-quartz");

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "burgundyNoir" }
    });
    expect(appShell).toHaveClass("theme-dark");
    expect(appShell).not.toHaveClass("theme-deep-green");
    expect(appShell).toHaveClass("theme-burgundy-noir");

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "lavenderHaze" }
    });
    expect(appShell).toHaveClass("theme-normal");
    expect(appShell).toHaveClass("theme-paper-blueprint");
    expect(appShell).toHaveClass("theme-lavender-haze");

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "amberNight" }
    });
    expect(appShell).toHaveClass("theme-dark");
    expect(appShell).toHaveClass("theme-deep-green");
    expect(appShell).toHaveClass("theme-amber-night");

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "cyberpunk" }
    });
    expect(appShell).toHaveClass("theme-dark");
    expect(appShell).toHaveClass("theme-amber-night");
    expect(appShell).toHaveClass("theme-cyberpunk");

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "olive" }
    });
    expect(appShell).toHaveClass("theme-dark");
    expect(appShell).toHaveClass("theme-deep-green");
    expect(appShell).toHaveClass("theme-olive");

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "circleMobilityLight" }
    });
    expect(appShell).toHaveClass("theme-sage-paper");
    expect(appShell).toHaveClass("theme-circle-mobility-light");
    expect(appShell).not.toHaveClass("theme-normal");
    expect(appShell).not.toHaveClass("theme-dark");

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "circleMobilityDark" }
    });
    expect(appShell).toHaveClass("theme-petrol-slate");
    expect(appShell).toHaveClass("theme-circle-mobility-dark");
    expect(appShell).not.toHaveClass("theme-normal");
    expect(appShell).not.toHaveClass("theme-dark");
  });

  it("supports standalone midrange custom themes without stacking legacy theme classes", () => {
    renderAppWithState(createUiIntegrationState());

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();

    switchScreen("settings");
    const settingsPanel = within(document.body).getByRole("heading", { name: "Appearance preferences" }).closest(".panel");
    expect(settingsPanel).not.toBeNull();

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "petrolSlate" }
    });

    expect(appShell).toHaveClass("theme-petrol-slate");
    expect(appShell).not.toHaveClass("theme-dark");
    expect(appShell).not.toHaveClass("theme-normal");
  });

  it("supports standalone light custom themes without stacking legacy theme classes", () => {
    renderAppWithState(createUiIntegrationState());

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();

    switchScreen("settings");
    const settingsPanel = within(document.body).getByRole("heading", { name: "Appearance preferences" }).closest(".panel");
    expect(settingsPanel).not.toBeNull();

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "sagePaper" }
    });

    expect(appShell).toHaveClass("theme-sage-paper");
    expect(appShell).not.toHaveClass("theme-dark");
    expect(appShell).not.toHaveClass("theme-normal");
    expect(appShell).not.toHaveClass("theme-paper-blueprint");
  });

  it("persists Circle Mobility theme preference across remount", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());

    switchScreen("settings");
    const settingsPanel = within(document.body).getByRole("heading", { name: "Appearance preferences" }).closest(".panel");
    expect(settingsPanel).not.toBeNull();
    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "circleMobilityDark" }
    });
    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();
    expect(appShell).toHaveClass("theme-circle-mobility-dark");
    expect(appShell).toHaveClass("theme-petrol-slate");

    switchScreen("settings");
    const restoredSettingsPanel = within(document.body).getByRole("heading", { name: "Appearance preferences" }).closest(".panel");
    expect(restoredSettingsPanel).not.toBeNull();
    expect(within(restoredSettingsPanel as HTMLElement).getByLabelText("Theme mode")).toHaveValue("circleMobilityDark");
  });

  it("renders representative workspace surfaces under standalone themes beyond shell class wiring", () => {
    renderAppWithState(createUiIntegrationState());

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();

    switchScreen("settings");
    const settingsPanel = within(document.body).getByRole("heading", { name: "Appearance preferences" }).closest(".panel");
    expect(settingsPanel).not.toBeNull();

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "petrolSlate" }
    });
    expect(appShell).toHaveClass("theme-petrol-slate");
    expect(within(settingsPanel as HTMLElement).getByLabelText("Theme mode")).toBeInTheDocument();
    expect(within(settingsPanel as HTMLElement).getByLabelText("Default sort column")).toBeInTheDocument();

    switchScreen("validation");
    expect(within(document.body).getByRole("heading", { name: "Validation center" })).toBeInTheDocument();

    switchScreen("settings");
    const settingsPanelAgain = within(document.body).getByRole("heading", { name: "Appearance preferences" }).closest(".panel");
    expect(settingsPanelAgain).not.toBeNull();
    fireEvent.change(within(settingsPanelAgain as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "sagePaper" }
    });
    expect(appShell).toHaveClass("theme-sage-paper");

    fireEvent.change(within(settingsPanelAgain as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "circleMobilityLight" }
    });
    expect(appShell).toHaveClass("theme-circle-mobility-light");

    switchScreen("analysis");
    switchSubScreenDrawerAware("connector");
    expect(within(document.body).queryByRole("heading", { name: "Route preview" })).toBeNull();
    const connectorsPanel = within(document.body).getByRole("heading", { name: "Connectors" }).closest(".panel");
    expect(connectorsPanel).not.toBeNull();
    fireEvent.click(within(connectorsPanel as HTMLElement).getByText("Connector 1"));
    expect(within(document.body).getByRole("heading", { name: "Connector analysis" })).toBeInTheDocument();
  });

  it("persists dark mode preference across remount", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreen("settings");
    const firstSettingsPanel = within(document.body).getByRole("heading", { name: "Appearance preferences" }).closest(".panel");
    expect(firstSettingsPanel).not.toBeNull();
    fireEvent.change(within(firstSettingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "dark" }
    });
    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();
    expect(appShell).toHaveClass("theme-dark");

    switchScreen("settings");
    const settingsPanel = within(document.body).getByRole("heading", { name: "Appearance preferences" }).closest(".panel");
    expect(settingsPanel).not.toBeNull();
    expect(within(settingsPanel as HTMLElement).getByLabelText("Theme mode")).toHaveValue("dark");
  });

  it("does not mutate domain entities when theme changes", () => {
    const state = createUiIntegrationState();
    const { store } = renderAppWithState(state);

    const before = store.getState();
    switchScreen("settings");
    const settingsPanel = within(document.body).getByRole("heading", { name: "Appearance preferences" }).closest(".panel");
    expect(settingsPanel).not.toBeNull();
    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), { target: { value: "dark" } });
    const after = store.getState();

    expect(after.ui.themeMode).toBe("dark");
    expect(after.connectors).toBe(before.connectors);
    expect(after.splices).toBe(before.splices);
    expect(after.nodes).toBe(before.nodes);
    expect(after.segments).toBe(before.segments);
    expect(after.wires).toBe(before.wires);
  });

  it("themes the workspace storage section and the app-level lineage dialog host for every theme", async () => {
    localStorage.setItem("electrical-plan-editor.onboarding.auto-open-enabled.v1", "false");
    renderAppWithState(createUiIntegrationState());
    const appShell = document.querySelector("main.app-shell") as HTMLElement;
    switchScreen("settings");
    const appearancePanel = within(document.body).getByRole("heading", { name: "Appearance preferences" }).closest(".panel") as HTMLElement;
    const storagePanel = within(document.body).getByRole("heading", { level: 2, name: "Workspace storage" }).closest(".panel") as HTMLElement;
    const newWorkspace = within(storagePanel).getByRole("button", { name: "New workspace" });
    await waitFor(() => expect(newWorkspace).not.toBeDisabled());

    for (const option of getThemeModeOptions()) {
      fireEvent.change(within(appearancePanel).getByLabelText("Theme mode"), { target: { value: option.value } });
      for (const className of THEME_CLASS_NAMES_BY_MODE[option.value]) {
        expect(appShell).toHaveClass(className);
      }
      expect(appShell.contains(storagePanel)).toBe(true);
      newWorkspace.focus();
      fireEvent.click(newWorkspace);
      const dialog = await screen.findByRole("dialog", { name: "New named workspace" });
      const layer = dialog.closest(".confirm-dialog-layer") as HTMLElement;
      expect(layer).toHaveClass("app-shell");
      for (const className of THEME_CLASS_NAMES_BY_MODE[option.value]) {
        expect(layer).toHaveClass(className);
      }
      fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "New named workspace" })).toBeNull());
      expect(document.activeElement).toBe(newWorkspace);
    }
  });

  it("keeps lineage status colors on shared theme tokens instead of fixed hues", () => {
    const lineageCss = readFileSync(resolve("src/app/styles/workspace-lineages.css"), "utf8");
    expect(lineageCss).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(lineageCss).not.toMatch(/\brgba?\(/i);
    expect(lineageCss).toMatch(/var\(--theme-status-warning\)/);
    const foundationCss = readFileSync(resolve("src/app/styles/base/base-foundation.css"), "utf8");
    const appShellBlock = foundationCss.slice(foundationCss.indexOf(".app-shell {"), foundationCss.indexOf("}", foundationCss.indexOf(".app-shell {")));
    for (const token of ["--theme-status-success", "--theme-status-warning", "--theme-status-danger"]) {
      expect(appShellBlock).toContain(`${token}:`);
    }
  });
});

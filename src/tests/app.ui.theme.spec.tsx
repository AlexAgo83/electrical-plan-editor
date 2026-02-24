import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createUiIntegrationState, renderAppWithState, switchScreen } from "./helpers/app-ui-test-utils";

describe("App integration UI - theme mode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("toggles between dark and normal mode from settings panel", () => {
    renderAppWithState(createUiIntegrationState());

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();
    expect(appShell).toHaveClass("theme-dark");

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
    expect(within(settingsPanel as HTMLElement).getByRole("button", { name: /Apply sort defaults now/i })).toBeInTheDocument();

    switchScreen("validation");
    expect(within(document.body).getByRole("heading", { name: "Validation center" })).toBeInTheDocument();

    switchScreen("settings");
    const settingsPanelAgain = within(document.body).getByRole("heading", { name: "Appearance preferences" }).closest(".panel");
    expect(settingsPanelAgain).not.toBeNull();
    fireEvent.change(within(settingsPanelAgain as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "sagePaper" }
    });
    expect(appShell).toHaveClass("theme-sage-paper");

    switchScreen("analysis");
    expect(within(document.body).getByRole("heading", { name: "Connector analysis" })).toBeInTheDocument();
    expect(within(document.body).getByRole("heading", { name: "Route preview" })).toBeInTheDocument();
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
});

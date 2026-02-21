import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createUiIntegrationState, renderAppWithState, switchScreen } from "./helpers/app-ui-test-utils";

describe("App integration UI - theme mode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("toggles between dark and normal mode from network scope settings panel", () => {
    renderAppWithState(createUiIntegrationState());

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();
    expect(appShell).toHaveClass("theme-dark");

    switchScreen("networkScope");
    const settingsPanel = within(document.body).getByRole("heading", { name: "Table and list preferences" }).closest(".panel");
    expect(settingsPanel).not.toBeNull();
    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), { target: { value: "normal" } });
    expect(appShell).toHaveClass("theme-normal");

    fireEvent.change(within(settingsPanel as HTMLElement).getByLabelText("Theme mode"), { target: { value: "dark" } });
    expect(appShell).toHaveClass("theme-dark");
  });

  it("persists dark mode preference across remount", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreen("networkScope");
    const firstSettingsPanel = within(document.body).getByRole("heading", { name: "Table and list preferences" }).closest(".panel");
    expect(firstSettingsPanel).not.toBeNull();
    fireEvent.change(within(firstSettingsPanel as HTMLElement).getByLabelText("Theme mode"), {
      target: { value: "dark" }
    });
    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();
    expect(appShell).toHaveClass("theme-dark");

    switchScreen("networkScope");
    const settingsPanel = within(document.body).getByRole("heading", { name: "Table and list preferences" }).closest(".panel");
    expect(settingsPanel).not.toBeNull();
    expect(within(settingsPanel as HTMLElement).getByLabelText("Theme mode")).toHaveValue("dark");
  });

  it("does not mutate domain entities when theme changes", () => {
    const state = createUiIntegrationState();
    const { store } = renderAppWithState(state);

    const before = store.getState();
    switchScreen("networkScope");
    const settingsPanel = within(document.body).getByRole("heading", { name: "Table and list preferences" }).closest(".panel");
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

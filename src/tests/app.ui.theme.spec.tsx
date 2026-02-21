import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createUiIntegrationState, renderAppWithState, switchScreen } from "./helpers/app-ui-test-utils";

describe("App integration UI - theme mode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("toggles between normal and dark mode from persistent shell control", () => {
    renderAppWithState(createUiIntegrationState());

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();
    expect(appShell).toHaveClass("theme-normal");

    fireEvent.click(within(document.body).getByRole("button", { name: "Switch to dark mode" }));
    expect(appShell).toHaveClass("theme-dark");

    fireEvent.click(within(document.body).getByRole("button", { name: "Switch to normal mode" }));
    expect(appShell).toHaveClass("theme-normal");
  });

  it("persists dark mode preference across remount", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    fireEvent.click(within(document.body).getByRole("button", { name: "Switch to dark mode" }));
    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();
    expect(appShell).toHaveClass("theme-dark");

    switchScreen("settings");
    const settingsPanel = within(document.body).getByRole("heading", { name: "Table and list preferences" }).closest(".panel");
    expect(settingsPanel).not.toBeNull();
    expect(within(settingsPanel as HTMLElement).getByLabelText("Theme mode")).toHaveValue("dark");
  });

  it("does not mutate domain entities when theme changes", () => {
    const state = createUiIntegrationState();
    const { store } = renderAppWithState(state);

    const before = store.getState();
    fireEvent.click(within(document.body).getByRole("button", { name: "Switch to dark mode" }));
    const after = store.getState();

    expect(after.ui.themeMode).toBe("dark");
    expect(after.connectors).toBe(before.connectors);
    expect(after.splices).toBe(before.splices);
    expect(after.nodes).toBe(before.nodes);
    expect(after.segments).toBe(before.segments);
    expect(after.wires).toBe(before.wires);
  });
});

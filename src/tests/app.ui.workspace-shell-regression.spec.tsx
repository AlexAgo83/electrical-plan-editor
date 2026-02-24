import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createUiIntegrationState,
  renderAppWithState,
  switchSubScreenStrict,
  withViewportWidth
} from "./helpers/app-ui-test-utils";

describe("App integration UI - workspace shell regression", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("closes the navigation drawer on Escape and restores focus to the menu trigger", () => {
    renderAppWithState(createUiIntegrationState());

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    const menuButton = screen.getByRole("button", { name: "Open menu" });
    expect(menuButton).toBeInTheDocument();
    expect(document.activeElement).toBe(menuButton);
  });

  it("closes the operations panel on Escape and restores focus to the ops trigger", () => {
    renderAppWithState(createUiIntegrationState());

    fireEvent.click(screen.getByRole("button", { name: "Ops & Health" }));
    expect(screen.getByRole("button", { name: "Close operations panel" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    const opsButton = screen.getByRole("button", { name: "Ops & Health" });
    expect(opsButton).toBeInTheDocument();
    expect(document.activeElement).toBe(opsButton);
  });

  it("closes drawer and operations panel on focus loss", () => {
    renderAppWithState(createUiIntegrationState());

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
    fireEvent.focus(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ops & Health" }));
    expect(screen.getByRole("button", { name: "Close operations panel" })).toBeInTheDocument();
    fireEvent.focus(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("button", { name: "Ops & Health" })).toBeInTheDocument();
    expect(document.querySelector(".workspace-ops-panel")).not.toHaveClass("is-open");
  });

  it("keeps closed drawer and operations overlays out of keyboard and assistive-tech navigation", () => {
    withViewportWidth(800, () => {
      renderAppWithState(createUiIntegrationState());

      const drawerBackdrop = document.querySelector(".workspace-drawer-backdrop");
      const drawerPanel = document.querySelector("#workspace-navigation-drawer");
      const opsBackdrop = document.querySelector(".workspace-ops-backdrop");
      const opsPanel = document.querySelector("#workspace-operations-panel");

      expect(drawerBackdrop).not.toBeNull();
      expect(drawerPanel).not.toBeNull();
      expect(opsBackdrop).not.toBeNull();
      expect(opsPanel).not.toBeNull();

      expect(drawerBackdrop).toBeDisabled();
      expect(drawerBackdrop).toHaveAttribute("aria-hidden", "true");
      expect(drawerBackdrop).toHaveAttribute("tabindex", "-1");
      expect(drawerPanel).toHaveAttribute("aria-hidden", "true");
      expect(drawerPanel).toHaveAttribute("inert");

      expect(opsBackdrop).toBeDisabled();
      expect(opsBackdrop).toHaveAttribute("aria-hidden", "true");
      expect(opsBackdrop).toHaveAttribute("tabindex", "-1");
      expect(opsPanel).toHaveAttribute("aria-hidden", "true");
      expect(opsPanel).toHaveAttribute("inert");

      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      expect(drawerBackdrop).not.toBeDisabled();
      expect(drawerBackdrop).toHaveAttribute("aria-hidden", "false");
      expect(drawerPanel).toHaveAttribute("aria-hidden", "false");
      expect(drawerPanel).not.toHaveAttribute("inert");

      fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Ops & Health" }));
      expect(opsBackdrop).not.toBeDisabled();
      expect(opsBackdrop).toHaveAttribute("aria-hidden", "false");
      expect(opsPanel).toHaveAttribute("aria-hidden", "false");
      expect(opsPanel).not.toHaveAttribute("inert");
    });
  });

  it("keeps hidden drawer accessibility semantics aligned on desktop viewport too", () => {
    withViewportWidth(1280, () => {
      renderAppWithState(createUiIntegrationState());

      const drawerPanel = document.querySelector("#workspace-navigation-drawer");
      const drawerBackdrop = document.querySelector(".workspace-drawer-backdrop");

      expect(drawerPanel).not.toBeNull();
      expect(drawerBackdrop).not.toBeNull();
      expect(drawerPanel).toHaveAttribute("aria-hidden", "true");
      expect(drawerPanel).toHaveAttribute("inert");
      expect(drawerBackdrop).toBeDisabled();

      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      expect(drawerPanel).toHaveAttribute("aria-hidden", "false");
      expect(drawerPanel).not.toHaveAttribute("inert");
      expect(drawerBackdrop).not.toBeDisabled();
    });
  });

  it("restores viewport width after awaited callback cleanup", async () => {
    const originalInnerWidth = window.innerWidth;

    await withViewportWidth(777, async () => {
      expect(window.innerWidth).toBe(777);
      await Promise.resolve();
      expect(window.innerWidth).toBe(777);
    });

    expect(window.innerWidth).toBe(originalInnerWidth);
  });

  it("strict sub-screen helper does not auto-switch to modeling when secondary nav is absent", () => {
    renderAppWithState(createUiIntegrationState());

    expect(() => switchSubScreenStrict("wire")).toThrow("Secondary workspace navigation row was not found.");
  });

  it("keeps sticky header and floating shell elements mounted across content scroll", () => {
    renderAppWithState(createUiIntegrationState());

    const header = document.querySelector(".header-block");
    const content = document.querySelector(".workspace-content");

    expect(header).not.toBeNull();
    expect(content).not.toBeNull();
    expect(header).toHaveClass("header-block");

    fireEvent.scroll(content as HTMLElement);
    expect(header).toBeInTheDocument();
    expect(document.querySelector(".workspace-drawer")).toBeInTheDocument();
    expect(document.querySelector(".workspace-ops-panel")).toBeInTheDocument();
  });

  it("keeps the navigation drawer open when switching to modeling and analysis view", () => {
    renderAppWithState(createUiIntegrationState());

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    let primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();

    fireEvent.click(within(primaryNavRow as HTMLElement).getByRole("button", { name: "Modeling" }));
    fireEvent.click(screen.getByRole("button", { name: "Switch to analysis view" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
    expect(document.querySelector(".workspace-nav-row.secondary")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Switch to editing" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
    expect(document.querySelector(".workspace-nav-row.secondary")).not.toBeNull();
  });

  it("keeps a single Modeling primary entry and opens analysis panels from Modeling", () => {
    renderAppWithState(createUiIntegrationState());

    const primaryNavRowBefore = document.querySelector(".workspace-nav-row");
    expect(primaryNavRowBefore).not.toBeNull();
    expect(within(primaryNavRowBefore as HTMLElement).queryByRole("button", { name: /^Analysis$/i, hidden: true })).toBeNull();
    fireEvent.click(within(primaryNavRowBefore as HTMLElement).getByRole("button", { name: /Modeling/i, hidden: true }));
    fireEvent.click(screen.getByRole("button", { name: "Switch to analysis view" }));

    const primaryNavRowAfter = document.querySelector(".workspace-nav-row");
    expect(primaryNavRowAfter).not.toBeNull();
    const modelingTab = within(primaryNavRowAfter as HTMLElement).getByRole("button", { name: /Modeling/i, hidden: true });
    expect(modelingTab).toHaveClass("is-active");
    expect(screen.getByRole("heading", { name: "Wire analysis" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Connector form" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch to editing" })).toBeInTheDocument();
  });

  it("restores the last analysis sub-panel and preserves analysis filter state across modeling toggles", () => {
    renderAppWithState(createUiIntegrationState());

    let primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    fireEvent.click(within(primaryNavRow as HTMLElement).getByRole("button", { name: /Modeling/i, hidden: true }));
    fireEvent.click(screen.getByRole("button", { name: "Switch to analysis view" }));

    const quickEntityNav = screen.getByRole("group", { name: "Quick entity navigation strip" });
    fireEvent.click(within(quickEntityNav).getByRole("button", { name: /Connectors 1/i }));
    expect(screen.getByRole("heading", { name: "Connector analysis" })).toBeInTheDocument();

    const connectorFilterInput = screen.getByRole("textbox", { name: "Connector filter field query" });
    fireEvent.change(connectorFilterInput, { target: { value: "C-1" } });
    expect(connectorFilterInput).toHaveValue("C-1");

    primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    fireEvent.click(within(primaryNavRow as HTMLElement).getByRole("button", { name: /Modeling/i, hidden: true }));

    fireEvent.click(screen.getByRole("button", { name: "Switch to analysis view" }));

    expect(screen.getByRole("heading", { name: "Connector analysis" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Connector filter field query" })).toHaveValue("C-1");
  });
});

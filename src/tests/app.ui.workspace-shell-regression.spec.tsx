import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createUiIntegrationState, renderAppWithState } from "./helpers/app-ui-test-utils";

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
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 800 });
    renderAppWithState(createUiIntegrationState());
    fireEvent(window, new Event("resize"));

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

    Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: originalInnerWidth });
    fireEvent(window, new Event("resize"));
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

  it("keeps the navigation drawer open when switching to modeling or analysis", () => {
    renderAppWithState(createUiIntegrationState());

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    let primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();

    fireEvent.click(within(primaryNavRow as HTMLElement).getByRole("button", { name: "Analysis" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
    expect(document.querySelector(".workspace-nav-row.secondary")).not.toBeNull();

    primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    fireEvent.click(within(primaryNavRow as HTMLElement).getByRole("button", { name: "Modeling" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
    expect(document.querySelector(".workspace-nav-row.secondary")).not.toBeNull();
  });
});

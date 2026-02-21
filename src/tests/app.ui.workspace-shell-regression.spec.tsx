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
    expect(screen.queryByRole("button", { name: "Close operations panel" })).not.toHaveClass("is-open");
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

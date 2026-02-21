import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createValidationIssueState,
  getPanelByHeading,
  renderAppWithState,
  switchScreen
} from "./helpers/app-ui-test-utils";

describe("App integration UI - validation", () => {
  function openOperationsHealthPanel(): void {
    fireEvent.click(screen.getByRole("button", { name: "Ops & Health" }));
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it("groups validation issues and supports category filtering", () => {
    renderAppWithState(createValidationIssueState());

    switchScreen("validation");

    const validationPanel = getPanelByHeading("Validation center");
    expect(within(validationPanel).getByRole("heading", { name: "Occupancy conflict" })).toBeInTheDocument();
    expect(within(validationPanel).getByRole("heading", { name: "Route lock validity" })).toBeInTheDocument();

    fireEvent.click(within(validationPanel).getByRole("button", { name: "Occupancy conflict" }));
    expect(within(validationPanel).getByRole("heading", { name: "Occupancy conflict" })).toBeInTheDocument();
    expect(within(validationPanel).queryByRole("heading", { name: "Route lock validity" })).not.toBeInTheDocument();

    fireEvent.click(within(validationPanel).getByRole("button", { name: "Warnings" }));
    expect(within(validationPanel).getByRole("heading", { name: "Occupancy conflict" })).toBeInTheDocument();
    expect(within(validationPanel).queryByText("ERROR")).not.toBeInTheDocument();
  });

  it("filters validation issues by text search", () => {
    renderAppWithState(createValidationIssueState());

    switchScreen("validation");
    const validationPanel = getPanelByHeading("Validation center");
    const searchInput = within(validationPanel).getByLabelText("Search validation issues");

    fireEvent.change(searchInput, { target: { value: "manual-ghost" } });
    expect(within(validationPanel).getByRole("heading", { name: "Occupancy conflict" })).toBeInTheDocument();
    expect(within(validationPanel).queryByRole("heading", { name: "Route lock validity" })).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "route-locked" } });
    expect(within(validationPanel).getByRole("heading", { name: "Route lock validity" })).toBeInTheDocument();
    expect(within(validationPanel).queryByRole("heading", { name: "Occupancy conflict" })).not.toBeInTheDocument();
  });

  it("shows category chip counts and disables empty categories under current filters", () => {
    renderAppWithState(createValidationIssueState());

    switchScreen("validation");
    const validationPanel = getPanelByHeading("Validation center");
    const searchInput = within(validationPanel).getByLabelText("Search validation issues");
    fireEvent.change(searchInput, { target: { value: "route-locked" } });

    const allChip = within(validationPanel).getByRole("button", { name: "All" });
    const routeChip = within(validationPanel).getByRole("button", { name: "Route lock validity" });
    const occupancyChip = within(validationPanel).getByRole("button", { name: "Occupancy conflict" });

    expect(allChip.textContent).toContain("(1)");
    expect(routeChip.textContent).toContain("(1)");
    expect(occupancyChip.textContent).toContain("(0)");
    expect(occupancyChip).toBeDisabled();
  });

  it("shows severity chip counts and disables empty severities under current filters", () => {
    renderAppWithState(createValidationIssueState());

    switchScreen("validation");
    const validationPanel = getPanelByHeading("Validation center");
    const searchInput = within(validationPanel).getByLabelText("Search validation issues");
    fireEvent.change(searchInput, { target: { value: "manual-ghost" } });

    const allSeverityChip = within(validationPanel).getByRole("button", { name: "All severities" });
    const warningChip = within(validationPanel).getByRole("button", { name: "Warnings" });
    const errorChip = within(validationPanel).getByRole("button", { name: "Errors" });

    expect(allSeverityChip.textContent).toContain("(1)");
    expect(warningChip.textContent).toContain("(1)");
    expect(errorChip.textContent).toContain("(0)");
    expect(errorChip).toBeDisabled();
  });

  it("clears validation filters and search from toolbar", () => {
    renderAppWithState(createValidationIssueState());

    switchScreen("validation");
    const validationPanel = getPanelByHeading("Validation center");
    const searchInput = within(validationPanel).getByLabelText("Search validation issues");
    fireEvent.click(within(validationPanel).getByRole("button", { name: "Warnings" }));
    fireEvent.change(searchInput, { target: { value: "manual-ghost" } });

    const validationSummary = getPanelByHeading("Validation summary");
    expect(within(validationSummary).getByText(/Active filters:\s*Warnings \/ All categories \/ Search:\s*"manual-ghost"/i)).toBeInTheDocument();

    fireEvent.click(within(validationPanel).getByRole("button", { name: "Clear filters" }));

    expect(searchInput).toHaveValue("");
    expect(within(validationSummary).getByText(/Active filters:\s*All severities \/ All categories \/ Search:\s*none/i)).toBeInTheDocument();
    expect(within(validationPanel).getByRole("heading", { name: "Occupancy conflict" })).toBeInTheDocument();
    expect(within(validationPanel).getByRole("heading", { name: "Route lock validity" })).toBeInTheDocument();
  });

  it("uses visible filtered issues for validation toolbar previous/next navigation", () => {
    renderAppWithState(createValidationIssueState());

    switchScreen("validation");
    const validationPanel = getPanelByHeading("Validation center");
    fireEvent.click(within(validationPanel).getByRole("button", { name: "Warnings" }));
    fireEvent.click(within(validationPanel).getByRole("button", { name: "Next issue" }));

    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Modeling$/ })).toHaveClass("is-active");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Connector$/ })).toHaveClass("is-active");
  });

  it("aligns model health issue navigator with visible validation filters", () => {
    renderAppWithState(createValidationIssueState());

    switchScreen("validation");
    const validationPanel = getPanelByHeading("Validation center");
    openOperationsHealthPanel();
    const modelHealth = screen.getByRole("region", { name: "Model health" });

    fireEvent.click(within(validationPanel).getByRole("button", { name: "Warnings" }));
    expect(within(modelHealth).getByText("1/1", { selector: "strong" })).toBeInTheDocument();
    expect(within(modelHealth).getByText("Scope: Filtered issues")).toBeInTheDocument();
    expect(within(modelHealth).getByText("[WARNING] Occupancy conflict", { selector: "strong" })).toBeInTheDocument();

    fireEvent.click(within(validationPanel).getByRole("button", { name: "Errors" }));
    expect(within(modelHealth).getByText("1/1", { selector: "strong" })).toBeInTheDocument();
    expect(within(modelHealth).getByText("[ERROR] Route lock validity", { selector: "strong" })).toBeInTheDocument();
  });

  it("shows model health quick actions and opens validation with severity focus", () => {
    renderAppWithState(createValidationIssueState());

    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    const validationButton = within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Validation$/ });
    const validationBadgeText = validationButton.querySelector(".workspace-tab-badge")?.textContent?.trim() ?? "0";
    expect(Number(validationBadgeText)).toBeGreaterThan(0);

    openOperationsHealthPanel();
    const modelHealth = screen.getByRole("region", { name: "Model health" });
    expect(within(modelHealth).getByText(/Total issues:/i)).toBeInTheDocument();
    expect(within(modelHealth).getByRole("button", { name: "Review errors" })).toBeEnabled();
    expect(within(modelHealth).getByRole("button", { name: "Review warnings" })).toBeEnabled();

    fireEvent.click(within(modelHealth).getByRole("button", { name: "Review errors" }));
    const validationSummary = getPanelByHeading("Validation summary");
    expect(within(validationSummary).getByText(/Active filters:\s*Errors \/ All categories/i)).toBeInTheDocument();

    const validationPanel = getPanelByHeading("Validation center");
    expect(within(validationPanel).queryByText("WARNING")).not.toBeInTheDocument();
  });

  it("navigates validation issues from model health quick navigator", () => {
    renderAppWithState(createValidationIssueState());

    openOperationsHealthPanel();
    const modelHealth = screen.getByRole("region", { name: "Model health" });
    expect(within(modelHealth).getByText(/Issue navigator:/i, { selector: "p" })).toBeInTheDocument();
    expect(within(modelHealth).getByText("1/2", { selector: "strong" })).toBeInTheDocument();

    fireEvent.click(within(modelHealth).getByRole("button", { name: "Next issue" }));

    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Modeling$/ })).toHaveClass("is-active");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Wire$/ })).toHaveClass("is-active");

    const inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).getByText("W1")).toBeInTheDocument();
    expect(within(modelHealth).getByText(/Issue navigator:/i, { selector: "p" })).toBeInTheDocument();
    expect(within(modelHealth).getByText("1/2", { selector: "strong" })).toBeInTheDocument();
  });

  it("supports alt keyboard shortcuts for sequential validation issue navigation", () => {
    renderAppWithState(createValidationIssueState());

    fireEvent.keyDown(window, { key: "k", altKey: true });
    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Modeling$/ })).toHaveClass("is-active");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Wire$/ })).toHaveClass("is-active");

    const inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).getByText("W1")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "j", altKey: true });
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Connector$/ })).toHaveClass("is-active");
    expect(within(inspectorPanel).getByText("C1")).toBeInTheDocument();
  });

  it("uses visible filtered issues for alt keyboard navigation inside validation screen", () => {
    renderAppWithState(createValidationIssueState());

    switchScreen("validation");
    const validationPanel = getPanelByHeading("Validation center");
    fireEvent.click(within(validationPanel).getByRole("button", { name: "Warnings" }));

    fireEvent.keyDown(window, { key: "k", altKey: true });
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Connector$/ })).toHaveClass("is-active");
  });
});

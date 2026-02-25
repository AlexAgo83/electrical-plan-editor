import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  asCatalogItemId,
  createValidationIssueState,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
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

    switchScreenDrawerAware("validation");

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

  it("shows category chip counts and disables empty categories under current filters", () => {
    renderAppWithState(createValidationIssueState());

    switchScreenDrawerAware("validation");
    const validationPanel = getPanelByHeading("Validation center");
    fireEvent.click(within(validationPanel).getByRole("button", { name: "Warnings" }));

    const allChip = within(validationPanel).getByRole("button", { name: "All" });
    const routeChip = within(validationPanel).getByRole("button", { name: "Route lock validity" });
    const occupancyChip = within(validationPanel).getByRole("button", { name: "Occupancy conflict" });

    expect(allChip.textContent).toContain("(1)");
    expect(routeChip.textContent).toContain("(0)");
    expect(routeChip).toBeDisabled();
    expect(occupancyChip.textContent).toContain("(1)");
  });

  it("shows severity chip counts and disables empty severities under current filters", () => {
    renderAppWithState(createValidationIssueState());

    switchScreenDrawerAware("validation");
    const validationPanel = getPanelByHeading("Validation center");
    fireEvent.click(within(validationPanel).getByRole("button", { name: "Occupancy conflict" }));

    const allSeverityChip = within(validationPanel).getByRole("button", { name: "All severities" });
    const warningChip = within(validationPanel).getByRole("button", { name: "Warnings" });
    const errorChip = within(validationPanel).getByRole("button", { name: "Errors" });

    expect(allSeverityChip.textContent).toContain("(1)");
    expect(warningChip.textContent).toContain("(1)");
    expect(errorChip.textContent).toContain("(0)");
    expect(errorChip).toBeDisabled();
  });

  it("does not show a clear filters button in validation center", () => {
    renderAppWithState(createValidationIssueState());

    switchScreenDrawerAware("validation");
    const validationPanel = getPanelByHeading("Validation center");
    expect(within(validationPanel).queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();
  });

  it("keeps previous/next issue navigation in ops panel only", () => {
    renderAppWithState(createValidationIssueState());

    switchScreenDrawerAware("validation");
    const validationPanel = getPanelByHeading("Validation center");
    expect(within(validationPanel).queryByRole("button", { name: "Previous issue" })).not.toBeInTheDocument();
    expect(within(validationPanel).queryByRole("button", { name: "Next issue" })).not.toBeInTheDocument();

    openOperationsHealthPanel();
    const modelHealth = screen.getByRole("region", { name: "Model health" });
    expect(within(modelHealth).getByRole("button", { name: "Previous" })).toBeInTheDocument();
    expect(within(modelHealth).getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("aligns model health issue navigator with visible validation filters", () => {
    renderAppWithState(createValidationIssueState());

    switchScreenDrawerAware("validation");
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

  it("updates the focused validation issue when clicking a validation row", () => {
    renderAppWithState(createValidationIssueState());

    switchScreenDrawerAware("validation");
    const validationPanel = getPanelByHeading("Validation center");

    const initiallySelectedRow = validationPanel.querySelector("tbody tr.is-selected");
    expect(initiallySelectedRow).not.toBeNull();

    const warningIssueText = within(validationPanel).getByText(/manual-ghost/i);
    const warningIssueRow = warningIssueText.closest("tr");
    expect(warningIssueRow).not.toBeNull();

    fireEvent.click(warningIssueText);

    expect(warningIssueRow).toHaveClass("is-selected");
    if (initiallySelectedRow !== null && initiallySelectedRow !== warningIssueRow) {
      expect(initiallySelectedRow).not.toHaveClass("is-selected");
    }

    openOperationsHealthPanel();
    const modelHealth = screen.getByRole("region", { name: "Model health" });
    expect(within(modelHealth).getByText("[WARNING] Occupancy conflict", { selector: "strong" })).toBeInTheDocument();
  });

  it("shows model health quick actions and closes ops panel when opening validation", () => {
    renderAppWithState(createValidationIssueState());

    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    const validationButton = within(primaryNavRow as HTMLElement).getByRole("button", {
      name: /^Validation$/,
      hidden: true
    });
    const validationBadgeText = validationButton.querySelector(".workspace-tab-badge")?.textContent?.trim() ?? "0";
    expect(Number(validationBadgeText)).toBeGreaterThan(0);

    openOperationsHealthPanel();
    const modelHealth = screen.getByRole("region", { name: "Model health" });
    expect(within(modelHealth).getByText(/Total issues:/i)).toBeInTheDocument();
    expect(within(modelHealth).queryByRole("button", { name: "Review errors" })).not.toBeInTheDocument();
    expect(within(modelHealth).queryByRole("button", { name: "Review warnings" })).not.toBeInTheDocument();

    fireEvent.click(within(modelHealth).getByRole("button", { name: "Open" }));
    expect(screen.queryByRole("button", { name: "Close operations panel" })).not.toBeInTheDocument();

    const validationSummary = getPanelByHeading("Validation summary");
    expect(within(validationSummary).getByText(/Active filters:\s*All severities \/ All categories/i)).toBeInTheDocument();

    const validationPanel = getPanelByHeading("Validation center");
    expect(within(validationPanel).getByText("WARNING")).toBeInTheDocument();
  });

  it("navigates validation issues from model health quick navigator", () => {
    renderAppWithState(createValidationIssueState());

    openOperationsHealthPanel();
    const modelHealth = screen.getByRole("region", { name: "Model health" });
    expect(within(modelHealth).getByText(/Issue navigator:/i, { selector: "p" })).toBeInTheDocument();
    expect(within(modelHealth).getByText("1/2", { selector: "strong" })).toBeInTheDocument();

    fireEvent.click(within(modelHealth).getByRole("button", { name: "Next" }));

    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Modeling$/, hidden: true })).toHaveClass(
      "is-active"
    );

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Wire$/, hidden: true })).toHaveClass(
      "is-active"
    );

    fireEvent.click(screen.getByRole("button", { name: "Close operations panel" }));
    const inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).getByText("W-1", { selector: ".inspector-entity-id" })).toBeInTheDocument();
    expect(within(modelHealth).getByText(/Issue navigator:/i, { selector: "p" })).toBeInTheDocument();
    expect(within(modelHealth).getByText("1/2", { selector: "strong" })).toBeInTheDocument();
  });

  it("supports alt keyboard shortcuts for sequential validation issue navigation", () => {
    renderAppWithState(createValidationIssueState());

    fireEvent.keyDown(window, { key: "k", altKey: true });
    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Modeling$/, hidden: true })).toHaveClass(
      "is-active"
    );

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Wire$/, hidden: true })).toHaveClass(
      "is-active"
    );

    const inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).getByText("W-1", { selector: ".inspector-entity-id" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "j", altKey: true });
    expect(
      within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Connector$/, hidden: true })
    ).toHaveClass("is-active");
    expect(within(inspectorPanel).getByText("C-1", { selector: ".inspector-entity-id" })).toBeInTheDocument();
  });

  it("uses visible filtered issues for alt keyboard navigation inside validation screen", () => {
    renderAppWithState(createValidationIssueState());

    switchScreenDrawerAware("validation");
    const validationPanel = getPanelByHeading("Validation center");
    fireEvent.click(within(validationPanel).getByRole("button", { name: "Warnings" }));

    fireEvent.keyDown(window, { key: "k", altKey: true });
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(
      within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Connector$/, hidden: true })
    ).toHaveClass("is-active");
  });

  it("surfaces catalog integrity issues and supports go-to navigation to Catalog", () => {
    const base = createUiIntegrationState();
    const catalogItemId = asCatalogItemId("CAT-BROKEN");
    const activeNetworkId = base.activeNetworkId;
    expect(activeNetworkId).not.toBeNull();
    if (activeNetworkId === null) {
      throw new Error("Expected active network.");
    }

    const stateWithCatalogValidationIssue = {
      ...base,
      catalogItems: {
        byId: {
          ...base.catalogItems.byId,
          [catalogItemId]: {
            id: catalogItemId,
            manufacturerReference: "CAT-BROKEN",
            connectionCount: 4,
            url: "notaurl"
          }
        },
        allIds: [...base.catalogItems.allIds, catalogItemId]
      },
      networkStates: {
        ...base.networkStates,
        [activeNetworkId]: {
          ...base.networkStates[activeNetworkId]!,
          catalogItems: {
            byId: {
              ...base.networkStates[activeNetworkId]!.catalogItems.byId,
              [catalogItemId]: {
                id: catalogItemId,
                manufacturerReference: "CAT-BROKEN",
                connectionCount: 4,
                url: "notaurl"
              }
            },
            allIds: [...base.networkStates[activeNetworkId]!.catalogItems.allIds, catalogItemId]
          }
        }
      }
    };

    renderAppWithState(stateWithCatalogValidationIssue);
    switchScreenDrawerAware("validation");
    const validationPanel = getPanelByHeading("Validation center");
    expect(within(validationPanel).getByRole("button", { name: /Catalog integrity/i })).toBeInTheDocument();

    fireEvent.click(within(validationPanel).getByRole("button", { name: /Catalog integrity/i }));
    const issueRow = within(validationPanel).getByText(/CAT-BROKEN.*invalid URL/i).closest("tr");
    expect(issueRow).not.toBeNull();
    fireEvent.click(within(issueRow as HTMLElement).getByRole("button", { name: "Go to" }));

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true })).toHaveClass(
      "is-active"
    );
    expect(getPanelByHeading("Catalog")).toBeInTheDocument();
    const editCatalogPanel = getPanelByHeading("Edit catalog item");
    expect(within(editCatalogPanel).getByDisplayValue("CAT-BROKEN")).toBeInTheDocument();
  });
});

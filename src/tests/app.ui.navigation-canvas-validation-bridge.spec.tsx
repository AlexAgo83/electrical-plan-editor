import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createValidationIssueState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - navigation and canvas validation bridge", () => {
  function openOperationsHealthPanel(): void {
    fireEvent.click(screen.getByRole("button", { name: "Ops & Health" }));
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it("navigates from validation issue to modeling context", () => {
    renderAppWithState(createValidationIssueState());
    switchScreenDrawerAware("analysis");

    switchScreenDrawerAware("validation");
    const validationPanel = getPanelByHeading("Validation center");
    const connectorIssue = within(validationPanel).getByText(/Connector 'C1' way C2/i);
    const issueRow = connectorIssue.closest("tr");
    expect(issueRow).not.toBeNull();
    fireEvent.click(within(issueRow as HTMLElement).getByRole("button", { name: "Go to" }));

    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Modeling$/, hidden: true })).toHaveClass(
      "is-active"
    );

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(
      within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Connector$/, hidden: true })
    ).toHaveClass("is-active");

    const updatedNetworkPanel = getPanelByHeading("Network summary");
    expect(within(updatedNetworkPanel).queryByText("Interaction mode")).not.toBeInTheDocument();
    expect(getPanelByHeading("Connector analysis")).toBeInTheDocument();
    const editConnectorPanel = getPanelByHeading("Edit Connector");
    expect(within(editConnectorPanel).getByLabelText("Technical ID")).toHaveValue("C-1");

    openOperationsHealthPanel();
    const modelHealth = screen.getByRole("region", { name: "Model health" });
    expect(within(modelHealth).getByText("2/2", { selector: "strong" })).toBeInTheDocument();
    expect(within(modelHealth).getByText(/\[WARNING\] Occupancy conflict/i)).toBeInTheDocument();
  }, 10_000);
});

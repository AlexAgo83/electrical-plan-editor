import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - navigation and canvas selection gating", () => {
  const closeOnboardingIfOpen = () => {
    const closeButton = screen.queryByRole("button", { name: "Close onboarding" });
    if (closeButton !== null) {
      fireEvent.click(closeButton);
    }
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it("opens the clicked canvas entity directly when another modeling sub-screen is active", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("splice");

    const connectorNode = screen.getByRole("button", { name: "Select Connector 1 (C-1)" });
    fireEvent.mouseDown(connectorNode, { button: 0 });
    fireEvent.mouseUp(connectorNode, { button: 0 });
    fireEvent.click(connectorNode);

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Connector$/, hidden: true })).toHaveClass(
      "is-active"
    );
    const editPanel = getPanelByHeading("Edit Connector");
    expect(within(editPanel).getByDisplayValue("Connector 1")).toBeInTheDocument();
    expect(within(editPanel).getByDisplayValue("C-1")).toBeInTheDocument();
  });

  it("synchronizes inspector context and allows editing selected connector", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));

    const inspectorHeading = screen.queryByRole("heading", { name: "Inspector context" });
    if (inspectorHeading !== null) {
      const inspectorPanel = getPanelByHeading("Inspector context");
      expect(within(inspectorPanel).getByText(/Focused entity:/)).toBeInTheDocument();
      expect(within(inspectorPanel).getByText("C-1", { selector: ".inspector-entity-id" })).toBeInTheDocument();
      fireEvent.click(within(inspectorPanel).getByRole("button", { name: "Select" }));
    } else {
      expect(getPanelByHeading("Connector analysis")).toBeInTheDocument();
    }

    const editPanel = getPanelByHeading("Edit Connector");
    expect(within(editPanel).getByDisplayValue("Connector 1")).toBeInTheDocument();
    expect(within(editPanel).getByDisplayValue("C-1")).toBeInTheDocument();
  });
});

import { fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { NetworkId } from "../core/entities";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  withViewportWidth
} from "./helpers/app-ui-test-utils";

function setViewportWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width
  });
  fireEvent(window, new Event("resize"));
}

describe("App integration UI - inspector floating shell", () => {
  let originalInnerWidth = window.innerWidth;
  const getInspectorShell = () => screen.queryByLabelText("Inspector context panel");
  const closeOnboardingIfOpen = () => {
    const closeButton = screen.queryByRole("button", { name: "Close onboarding" });
    if (closeButton !== null) {
      fireEvent.click(closeButton);
    }
  };
  const expectInlineConnectorSelectionPanels = () => {
    expect(getPanelByHeading("Connector analysis")).toBeInTheDocument();
    const editPanel = getPanelByHeading("Edit Connector");
    expect(within(editPanel).getByDisplayValue("C-1")).toBeInTheDocument();
  };

  beforeEach(() => {
    localStorage.clear();
    originalInnerWidth = window.innerWidth;
    setViewportWidth(1280);
  });

  afterEach(() => {
    setViewportWidth(originalInnerWidth);
  });

  it("keeps inspector collapsed when no entity is selected", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");

    const inspectorShell = getInspectorShell();
    if (inspectorShell !== null) {
      expect(inspectorShell).toHaveClass("is-collapsed");
      expect(within(getPanelByHeading("Inspector context")).getByText(/No entity selected/i)).toBeInTheDocument();
      return;
    }

    expect(screen.queryByRole("heading", { name: "Connector analysis" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Edit Connector" })).not.toBeInTheDocument();
  });

  it("opens inspector on modeling and analysis when a selection exists", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    const inspectorShell = getInspectorShell();
    if (inspectorShell !== null) {
      expect(inspectorShell).toHaveClass("is-open");
      expect(
        within(getPanelByHeading("Inspector context")).getByText("C-1", { selector: ".inspector-entity-id" })
      ).toBeInTheDocument();
    } else {
      expectInlineConnectorSelectionPanels();
    }

    switchScreenDrawerAware("analysis");
    const analysisInspectorShell = getInspectorShell();
    if (analysisInspectorShell !== null) {
      expect(analysisInspectorShell).toHaveClass("is-open");
      return;
    }

    const analysisPanel = getPanelByHeading("Connector analysis");
    expect(analysisPanel).toHaveTextContent(/\(C-1\)/);
  });

  it("hides inspector on Validation, Network Scope and Settings", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("validation");
    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();

    switchScreenDrawerAware("networkScope");
    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();

    switchScreenDrawerAware("settings");
    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();
  });

  it("hides inspector when there is no active network", () => {
    const stateWithoutActiveNetwork = {
      ...createUiIntegrationState(),
      activeNetworkId: null as NetworkId | null
    };
    renderAppWithState(stateWithoutActiveNetwork);

    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();
  });

  it("collapses on narrow viewport and supports explicit expand/collapse", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    const inspectorShell = getInspectorShell();
    if (inspectorShell === null) {
      expectInlineConnectorSelectionPanels();
      return;
    }
    expect(inspectorShell).toHaveClass("is-open");

    withViewportWidth(860, () => {
      expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-collapsed");

      const inspectorPanel = getPanelByHeading("Inspector context");
      fireEvent.click(within(inspectorPanel).getByRole("button", { name: "Expand" }));
      expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-open");

      fireEvent.click(within(getPanelByHeading("Inspector context")).getByRole("button", { name: "Collapse" }));
      expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-collapsed");
    });
  });

  it("hides inspector while drawer or operations panel overlays are open", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    const inspectorShell = getInspectorShell();
    if (inspectorShell === null) {
      expectInlineConnectorSelectionPanels();

      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      expect(getInspectorShell()).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Close navigation menu" }));
      expect(getInspectorShell()).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Ops & Health" }));
      expect(getInspectorShell()).not.toBeInTheDocument();
      return;
    }
    expect(inspectorShell).toHaveClass("is-open");

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(getInspectorShell()).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close navigation menu" }));
    expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-open");

    fireEvent.click(screen.getByRole("button", { name: "Ops & Health" }));
    expect(getInspectorShell()).not.toBeInTheDocument();
  });
});

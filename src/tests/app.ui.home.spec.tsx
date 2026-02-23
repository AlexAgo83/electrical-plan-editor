import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createUiIntegrationState,
  createValidationIssueState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("home workspace screen", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exposes Home as a primary workspace entry and opens the home panels", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("home");

    expect(getPanelByHeading("Start")).toBeInTheDocument();
    expect(getPanelByHeading("Resume")).toBeInTheDocument();
  });

  it("shows active workspace resume summary details", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("home");

    const resumePanel = getPanelByHeading("Resume");
    expect(within(resumePanel).getByText(/Active network: Main network sample/i)).toBeInTheDocument();
    expect(within(resumePanel).getByText("Networks")).toBeInTheDocument();
    expect(within(resumePanel).getByText("State")).toBeInTheDocument();
  });

  it("routes home resume CTA to validation", () => {
    renderAppWithState(createValidationIssueState());

    switchScreenDrawerAware("home");
    const resumePanel = getPanelByHeading("Resume");
    fireEvent.click(within(resumePanel).getByRole("button", { name: "Validation" }));

    expect(getPanelByHeading("Validation center")).toBeInTheDocument();
  });

  it("creates a genuinely empty workspace from Home without resetting theme mode", () => {
    const base = createUiIntegrationState();
    const initial = {
      ...base,
      ui: {
        ...base.ui,
        themeMode: "burgundyNoir" as const
      }
    };
    const { store } = renderAppWithState(initial);
    const previousThemeMode = store.getState().ui.themeMode;

    switchScreenDrawerAware("home");
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Create empty workspace" }));
    confirmSpy.mockRestore();

    const nextState = store.getState();
    expect(nextState.networks.allIds).toHaveLength(0);
    expect(nextState.activeNetworkId).toBeNull();
    expect(nextState.connectors.allIds).toHaveLength(0);
    expect(nextState.splices.allIds).toHaveLength(0);
    expect(nextState.nodes.allIds).toHaveLength(0);
    expect(nextState.segments.allIds).toHaveLength(0);
    expect(nextState.wires.allIds).toHaveLength(0);
    expect(nextState.ui.themeMode).toBe(previousThemeMode);
    expect(getPanelByHeading("Network Scope")).toBeInTheDocument();
  });

  it("auto-opens onboarding, persists opt-out, and allows Home help relaunch", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());

    expect(screen.getByRole("dialog", { name: "Create your first network" })).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    const optOutCheckbox = screen.getByLabelText("Do not open automatically on app load");
    expect(optOutCheckbox).toBeInTheDocument();

    fireEvent.click(optOutCheckbox);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    switchScreenDrawerAware("home");
    const startPanel = getPanelByHeading("Start");
    fireEvent.click(within(startPanel).getByRole("button", { name: "Help" }));
    expect(screen.getByRole("dialog", { name: "Create your first network" })).toBeInTheDocument();
  });

  it("uses onboarding step CTA to open Network Scope from Home", () => {
    renderAppWithState(createUiIntegrationState());

    const onboardingDialog = screen.getByRole("dialog", { name: "Create your first network" });
    const openTargetButton = within(onboardingDialog).getByRole("button", { name: "Open Network Scope" });
    expect(openTargetButton).toBeInTheDocument();
    fireEvent.click(openTargetButton);

    expect(getPanelByHeading("Network Scope")).toBeInTheDocument();
  });
});

import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
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

    expect(getPanelByHeading("Quick start")).toBeInTheDocument();
    expect(getPanelByHeading("Workspace")).toBeInTheDocument();
    expect(getPanelByHeading("What's new")).toBeInTheDocument();
  });

  it("renders an auto-detected changelog feed in descending version order", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("home");

    const whatsNewPanel = getPanelByHeading("What's new");
    const changelogFeed = within(whatsNewPanel).getByLabelText("Changelog feed");
    expect(changelogFeed).toHaveAttribute("tabindex", "0");

    const changelogVersions = Array.from(
      whatsNewPanel.querySelectorAll("[data-changelog-version]")
    ).map((entry) => entry.getAttribute("data-changelog-version"));

    expect(changelogVersions.length).toBeGreaterThan(1);
    expect(changelogVersions[0]).toBe("0.9.12");
    expect(changelogVersions).toContain("0.9.6");
    expect(changelogVersions).toContain("0.9.0");
    expect(changelogVersions).toContain("0.8.1");
  });

  it("shows active workspace resume summary details", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("home");

    const resumePanel = getPanelByHeading("Workspace");
    expect(within(resumePanel).getByText(/Active network:/i, { selector: ".home-resume-copy-label" })).toBeInTheDocument();
    expect(within(resumePanel).getByText("Main network sample", { selector: ".home-resume-copy-value" })).toBeInTheDocument();
    expect(within(resumePanel).getByText("Networks")).toBeInTheDocument();
    expect(within(resumePanel).getByText("State")).toBeInTheDocument();
  });

  it("routes home resume CTA to validation", () => {
    renderAppWithState(createValidationIssueState());

    switchScreenDrawerAware("home");
    const resumePanel = getPanelByHeading("Workspace");
    fireEvent.click(within(resumePanel).getByRole("button", { name: "Validation" }));

    expect(getPanelByHeading("Validation center")).toBeInTheDocument();
  });

  it("creates a genuinely empty workspace from Home without resetting theme mode", async () => {
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
    const closeOnboardingButton = screen.queryByRole("button", { name: "Close onboarding" });
    if (closeOnboardingButton !== null) {
      fireEvent.click(closeOnboardingButton);
    }

    switchScreenDrawerAware("home");
    fireEvent.click(screen.getByRole("button", { name: "Create empty workspace" }));
    const confirmDialog = screen.getByRole("dialog", { name: "Create empty workspace" });
    fireEvent.click(within(confirmDialog).getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(store.getState().networks.allIds).toHaveLength(0);
    });
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
    expect(screen.getByText("Step 1 of 6")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    const optOutCheckbox = screen.getByLabelText("Do not open automatically on app load");
    expect(optOutCheckbox).toBeInTheDocument();

    fireEvent.click(optOutCheckbox);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    switchScreenDrawerAware("home");
    const resumePanel = getPanelByHeading("Workspace");
    fireEvent.click(within(resumePanel).getByRole("button", { name: "Help" }));
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

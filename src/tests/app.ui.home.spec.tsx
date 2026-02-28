import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { HOME_CHANGELOG_ENTRIES } from "../app/lib/changelogFeed";
import {
  createUiIntegrationState,
  createValidationIssueState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("home workspace screen", () => {
  function compareVersionsDescending(left: string, right: string): number {
    const leftParts = left.split(".").map((part) => Number.parseInt(part, 10));
    const rightParts = right.split(".").map((part) => Number.parseInt(part, 10));
    const maxLength = Math.max(leftParts.length, rightParts.length);
    for (let index = 0; index < maxLength; index += 1) {
      const leftValue = leftParts[index] ?? 0;
      const rightValue = rightParts[index] ?? 0;
      if (leftValue !== rightValue) {
        return rightValue - leftValue;
      }
    }
    return 0;
  }

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
    )
      .map((entry) => entry.getAttribute("data-changelog-version"))
      .filter((version): version is string => version !== null);

    expect(changelogVersions.length).toBeGreaterThan(1);
    const sortedDescending = [...changelogVersions].sort(compareVersionsDescending);
    expect(changelogVersions).toEqual(sortedDescending);
  });

  it("progressively loads changelog entries when the feed-end sentinel intersects", async () => {
    const observedTargets: Element[] = [];
    const observerCallbacks: Array<
      (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void
    > = [];
    const originalIntersectionObserver = globalThis.IntersectionObserver;

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | null = null;
      readonly rootMargin = "0px";
      readonly thresholds: ReadonlyArray<number> = [0];
      constructor(callback: IntersectionObserverCallback) {
        observerCallbacks.push(callback);
      }
      observe(target: Element): void {
        observedTargets.push(target);
      }
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }

    globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
    try {
      renderAppWithState(createUiIntegrationState());
      switchScreenDrawerAware("home");

      const whatsNewPanel = getPanelByHeading("What's new");
      const initialVisible = whatsNewPanel.querySelectorAll("[data-changelog-version]").length;
      expect(initialVisible).toBe(Math.min(4, HOME_CHANGELOG_ENTRIES.length));
      expect(observerCallbacks.length).toBeGreaterThan(0);
      expect(observedTargets.length).toBeGreaterThan(0);

      const sentinelTarget = observedTargets[0]!;
      observerCallbacks[0]!([{ isIntersecting: true, target: sentinelTarget } as IntersectionObserverEntry], {} as IntersectionObserver);

      await waitFor(() => {
        const nextVisible = whatsNewPanel.querySelectorAll("[data-changelog-version]").length;
        expect(nextVisible).toBe(Math.min(HOME_CHANGELOG_ENTRIES.length, initialVisible + 4));
      });
    } finally {
      globalThis.IntersectionObserver = originalIntersectionObserver;
    }
  });

  it("keeps Major Highlights visible and collapses following sections by default, then toggles on click", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("home");

    const whatsNewPanel = getPanelByHeading("What's new");
    const productUxToggles = within(whatsNewPanel).getAllByRole("button", { name: "Product and UX Changes" });
    expect(productUxToggles.length).toBeGreaterThan(0);
    const productUxToggle = productUxToggles[0];
    if (productUxToggle === undefined) {
      throw new Error("Expected at least one Product and UX Changes toggle in the changelog feed.");
    }
    const productUxSection = productUxToggle.closest("section");
    expect(productUxSection).not.toBeNull();
    if (productUxSection === null) {
      throw new Error("Expected Product and UX Changes toggle to be rendered inside a collapsible section container.");
    }
    expect(productUxToggle).toHaveAttribute("aria-expanded", "false");
    expect(productUxSection.querySelector(".home-changelog-collapsible-content")).toBeNull();

    fireEvent.click(productUxToggle);
    expect(productUxToggle).toHaveAttribute("aria-expanded", "true");
    expect(productUxSection.querySelector(".home-changelog-collapsible-content")).not.toBeNull();

    fireEvent.click(productUxToggle);
    expect(productUxToggle).toHaveAttribute("aria-expanded", "false");
    expect(productUxSection.querySelector(".home-changelog-collapsible-content")).toBeNull();

    const engineeringToggles = within(whatsNewPanel).getAllByRole("button", { name: "Engineering Quality, CI, and Reliability" });
    expect(engineeringToggles.length).toBeGreaterThan(0);
    const engineeringToggle = engineeringToggles[0];
    if (engineeringToggle === undefined) {
      throw new Error("Expected at least one Engineering Quality, CI, and Reliability toggle in the changelog feed.");
    }
    const engineeringSection = engineeringToggle.closest("section");
    expect(engineeringSection).not.toBeNull();
    if (engineeringSection === null) {
      throw new Error("Expected Engineering Quality toggle to be rendered inside a collapsible section container.");
    }
    expect(engineeringToggle).toHaveAttribute("aria-expanded", "false");
    expect(engineeringSection.querySelector(".home-changelog-collapsible-content")).toBeNull();

    fireEvent.click(engineeringToggle);
    expect(engineeringToggle).toHaveAttribute("aria-expanded", "true");
    expect(engineeringSection.querySelector(".home-changelog-collapsible-content")).not.toBeNull();

    const changelog096Article = within(whatsNewPanel).getByLabelText("Changelog v0.9.6");
    const uxWorkspaceToggle = within(changelog096Article).getByRole("button", { name: "UX / Navigation / Workspace" });
    const uxWorkspaceSection = uxWorkspaceToggle.closest("section");
    expect(uxWorkspaceSection).not.toBeNull();
    if (uxWorkspaceSection === null) {
      throw new Error("Expected UX/Navigation toggle to be rendered inside a collapsible section container.");
    }
    expect(uxWorkspaceToggle).toHaveAttribute("aria-expanded", "false");
    expect(uxWorkspaceSection.querySelector(".home-changelog-collapsible-content")).toBeNull();

    fireEvent.click(uxWorkspaceToggle);
    expect(uxWorkspaceToggle).toHaveAttribute("aria-expanded", "true");
    expect(uxWorkspaceSection.querySelector(".home-changelog-collapsible-content")).not.toBeNull();
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

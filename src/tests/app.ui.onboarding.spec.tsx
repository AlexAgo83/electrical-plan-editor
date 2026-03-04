import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - onboarding", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens shared connector/splice contextual onboarding help from both panels with in-context CTA", () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Help" }));

    const connectorsHelpDialog = screen.getByRole("dialog", { name: "Build the connectors and splices library" });
    expect(within(connectorsHelpDialog).getByLabelText("Do not open automatically on app load")).toBeInTheDocument();
    expect(within(connectorsHelpDialog).getByRole("button", { name: "Scroll to Connectors" })).toBeInTheDocument();
    expect(within(connectorsHelpDialog).getByRole("button", { name: "Open Splices" })).toBeInTheDocument();
    fireEvent.click(within(connectorsHelpDialog).getByRole("button", { name: "Close onboarding" }));

    switchSubScreenDrawerAware("splice");
    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByRole("button", { name: "Help" }));

    const splicesHelpDialog = screen.getByRole("dialog", { name: "Build the connectors and splices library" });
    expect(within(splicesHelpDialog).getByRole("button", { name: "Scroll to Splices" })).toBeInTheDocument();
    expect(within(splicesHelpDialog).getByRole("button", { name: "Open Connectors" })).toBeInTheDocument();
  });

  it("moves focus into onboarding modal and restores focus to the trigger on Escape close", () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    const helpButton = within(connectorsPanel).getByRole("button", { name: "Help" });
    helpButton.focus();
    expect(helpButton).toHaveFocus();

    fireEvent.click(helpButton);

    const dialog = screen.getByRole("dialog", { name: "Build the connectors and splices library" });
    const closeButton = within(dialog).getByRole("button", { name: "Close onboarding" });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Build the connectors and splices library" })).toBeNull();
    expect(helpButton).toHaveFocus();
  });

  it("keeps keyboard tab navigation trapped inside the onboarding modal", () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Help" }));

    const dialog = screen.getByRole("dialog", { name: "Build the connectors and splices library" });
    const closeButton = within(dialog).getByRole("button", { name: "Close onboarding" });
    const lastTargetAction = within(dialog).getByRole("button", { name: "Open Splices" });

    lastTargetAction.focus();
    expect(lastTargetAction).toHaveFocus();
    fireEvent.keyDown(lastTargetAction, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    expect(closeButton).toHaveFocus();
    fireEvent.keyDown(closeButton, { key: "Tab", shiftKey: true });
    expect(lastTargetAction).toHaveFocus();
  });

  it("adds a final full-flow onboarding step for settings with Open Settings CTA on the left and Finish on the right", () => {
    renderAppWithState(createUiIntegrationState());

    for (let index = 0; index < 6; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    }

    const finalStepDialog = screen.getByRole("dialog", { name: "Configure your workspace defaults" });
    expect(within(finalStepDialog).getByText("Step 7 of 7")).toBeInTheDocument();
    const openSettingsButton = within(finalStepDialog).getByRole("button", { name: "Open Settings" });
    const finishButton = within(finalStepDialog).getByRole("button", { name: "Finish" });
    expect(openSettingsButton).toBeInTheDocument();
    expect(finishButton).toBeInTheDocument();

    fireEvent.click(openSettingsButton);

    expect(getPanelByHeading("Global preferences")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Configure your workspace defaults" })).toBeInTheDocument();

    fireEvent.click(finishButton);
    expect(screen.queryByRole("dialog", { name: "Configure your workspace defaults" })).toBeNull();
  });

  it("cancels pending onboarding target-focus retries when modal closes", () => {
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalCancelAnimationFrame = window.cancelAnimationFrame;
    const rafCallbacks = new Map<number, FrameRequestCallback>();
    let nextRafId = 1;

    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      writable: true,
      value: (callback: FrameRequestCallback) => {
        const rafId = nextRafId;
        nextRafId += 1;
        rafCallbacks.set(rafId, callback);
        return rafId;
      }
    });
    const cancelAnimationFrameSpy = vi.fn((rafId: number) => {
      rafCallbacks.delete(rafId);
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      writable: true,
      value: cancelAnimationFrameSpy
    });

    try {
      renderAppWithState(createUiIntegrationState());
      fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
      switchScreenDrawerAware("modeling");

      const connectorsPanel = getPanelByHeading("Connectors");
      const helpButton = within(connectorsPanel).getByRole("button", { name: "Help" });
      fireEvent.click(helpButton);

      const targetSelector = '[data-onboarding-panel="modeling-connectors"]';
      let blockTargetPanelResolution = true;
      const originalQuerySelector = document.querySelector.bind(document);
      vi.spyOn(document, "querySelector").mockImplementation((selector: string): Element | null => {
        if (selector === targetSelector && blockTargetPanelResolution) {
          return null;
        }
        return originalQuerySelector(selector);
      });

      const dialog = screen.getByRole("dialog", { name: "Build the connectors and splices library" });
      fireEvent.click(within(dialog).getByRole("button", { name: "Scroll to Connectors" }));
      fireEvent.click(within(dialog).getByRole("button", { name: "Close onboarding" }));

      expect(screen.queryByRole("dialog", { name: "Build the connectors and splices library" })).toBeNull();
      expect(cancelAnimationFrameSpy).toHaveBeenCalled();

      const focusSpy = vi.spyOn(helpButton, "focus");
      focusSpy.mockClear();
      blockTargetPanelResolution = false;

      for (let iteration = 0; iteration < 12; iteration += 1) {
        if (rafCallbacks.size === 0) {
          break;
        }
        const queued = [...rafCallbacks.values()];
        rafCallbacks.clear();
        for (const callback of queued) {
          callback(performance.now());
        }
      }

      expect(focusSpy).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, "requestAnimationFrame", {
        configurable: true,
        writable: true,
        value: originalRequestAnimationFrame
      });
      Object.defineProperty(window, "cancelAnimationFrame", {
        configurable: true,
        writable: true,
        value: originalCancelAnimationFrame
      });
      vi.restoreAllMocks();
    }
  });
});

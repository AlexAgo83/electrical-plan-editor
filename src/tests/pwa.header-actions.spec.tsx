import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUiIntegrationState, renderAppWithState } from "./helpers/app-ui-test-utils";

interface BeforeInstallPromptEventLike extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

const originalUserAgent = window.navigator.userAgent;

function setUserAgent(userAgent: string): void {
  Object.defineProperty(window.navigator, "userAgent", {
    value: userAgent,
    configurable: true
  });
}

describe("PWA header actions", () => {
  beforeEach(() => {
    localStorage.clear();
    setUserAgent(originalUserAgent);
  });

  it("shows install action only when beforeinstallprompt is available", async () => {
    renderAppWithState(createUiIntegrationState());
    expect(screen.queryByRole("button", { name: "Install app" })).not.toBeInTheDocument();

    const promptSpy = vi.fn(async () => {});
    const installEvent = new Event("beforeinstallprompt", { cancelable: true }) as BeforeInstallPromptEventLike;
    Object.defineProperty(installEvent, "prompt", { value: promptSpy });
    Object.defineProperty(installEvent, "userChoice", {
      value: Promise.resolve({ outcome: "accepted", platform: "web" })
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    window.dispatchEvent(installEvent);

    const installButton = await screen.findByRole("button", { name: "Install app" });
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(promptSpy).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Install app" })).not.toBeInTheDocument();
    });
  });

  it("shows install action in Firefox even without beforeinstallprompt support", async () => {
    setUserAgent("Mozilla/5.0 Firefox/126.0");
    const manualInstallSpy = vi.fn();
    window.addEventListener("app:pwa-manual-install-requested", manualInstallSpy);

    renderAppWithState(createUiIntegrationState());
    const installButton = await screen.findByRole("button", { name: "Install app" });
    fireEvent.click(installButton);

    expect(manualInstallSpy).toHaveBeenCalledTimes(1);
    window.removeEventListener("app:pwa-manual-install-requested", manualInstallSpy);
  });

  it("shows and clears update action from service worker update events", async () => {
    renderAppWithState(createUiIntegrationState());
    expect(screen.queryByRole("button", { name: "Update ready" })).not.toBeInTheDocument();

    await new Promise((resolve) => setTimeout(resolve, 0));
    window.dispatchEvent(new Event("app:pwa-update-available"));
    const updateReadyButton = await screen.findByRole("button", { name: "Update ready" });
    expect(updateReadyButton).toHaveClass("is-ready-glow");
    fireEvent.click(updateReadyButton);

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Update ready" })).not.toBeInTheDocument();
    });
  });
});

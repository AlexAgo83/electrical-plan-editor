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

describe("PWA header actions", () => {
  beforeEach(() => {
    localStorage.clear();
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

  it("shows and clears update action from service worker update events", async () => {
    renderAppWithState(createUiIntegrationState());
    expect(screen.queryByRole("button", { name: "Update ready" })).not.toBeInTheDocument();

    await new Promise((resolve) => setTimeout(resolve, 0));
    window.dispatchEvent(new Event("app:pwa-update-available"));
    fireEvent.click(await screen.findByRole("button", { name: "Update ready" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Update ready" })).not.toBeInTheDocument();
    });
  });
});

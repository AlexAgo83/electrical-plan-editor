import { describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "../app/pwa/registerServiceWorker";

describe("PWA service worker registration", () => {
  it("does not register service worker outside production builds", async () => {
    const onNeedRefresh = vi.fn();
    const onOfflineReady = vi.fn();
    const onRegistrationError = vi.fn();

    const result = await registerServiceWorker({
      onNeedRefresh,
      onOfflineReady,
      onRegistrationError
    });

    expect(import.meta.env.PROD).toBe(false);
    expect(result).toBeNull();
    expect(onNeedRefresh).not.toHaveBeenCalled();
    expect(onOfflineReady).not.toHaveBeenCalled();
    expect(onRegistrationError).not.toHaveBeenCalled();
  });
});

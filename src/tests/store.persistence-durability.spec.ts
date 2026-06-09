import { afterEach, describe, expect, it, vi } from "vitest";
import { saveStateSync } from "../adapters/persistence";
import { appActions, createAppStore, createInitialState, type AppState } from "../store";
import { attachPersistenceSync } from "../app/store";
import { asConnectorId } from "./helpers/store-reducer-test-utils";

function dispatchConnector(store: ReturnType<typeof createAppStore>, id: string): void {
  store.dispatch(
    appActions.upsertConnector({ id: asConnectorId(id), name: `Connector ${id}`, technicalId: `C-${id}`, cavityCount: 2 })
  );
}

describe("attachPersistenceSync durability", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("flushes a pending debounced save synchronously on pagehide (AC1, AC2)", () => {
    const store = createAppStore(createInitialState());
    const save = vi.fn().mockResolvedValue({ ok: true as const });
    const saveSync = vi.fn().mockReturnValue({ ok: true as const });
    const detach = attachPersistenceSync(store, { save, saveSync });

    try {
      dispatchConnector(store, "C1");
      // The trailing 200 ms debounce timer is still pending here.
      expect(save).not.toHaveBeenCalled();
      expect(saveSync).not.toHaveBeenCalled();

      window.dispatchEvent(new Event("pagehide"));

      // The pending edit is written through the synchronous path, not the async one.
      expect(saveSync).toHaveBeenCalledTimes(1);
      expect(save).not.toHaveBeenCalled();
      const persistedState = saveSync.mock.calls[0]?.[0] as AppState | undefined;
      expect(persistedState?.connectors.allIds).toContain(asConnectorId("C1"));
    } finally {
      detach();
    }
  });

  it("flushes a pending save when the document becomes hidden (AC1)", () => {
    const store = createAppStore(createInitialState());
    const save = vi.fn().mockResolvedValue({ ok: true as const });
    const saveSync = vi.fn().mockReturnValue({ ok: true as const });
    const detach = attachPersistenceSync(store, { save, saveSync });

    const hadOwn = Object.prototype.hasOwnProperty.call(document, "visibilityState");
    const ownDescriptor = Object.getOwnPropertyDescriptor(document, "visibilityState");
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });

    try {
      dispatchConnector(store, "C1");
      document.dispatchEvent(new Event("visibilitychange"));

      expect(saveSync).toHaveBeenCalledTimes(1);
      expect(save).not.toHaveBeenCalled();
    } finally {
      if (hadOwn && ownDescriptor) {
        Object.defineProperty(document, "visibilityState", ownDescriptor);
      } else {
        // Drop the instance override so the jsdom prototype getter ("visible") applies again.
        delete (document as unknown as Record<string, unknown>).visibilityState;
      }
      detach();
    }
  });

  it("does not flush on a visibilitychange while the document is still visible (AC1)", () => {
    const store = createAppStore(createInitialState());
    const saveSync = vi.fn().mockReturnValue({ ok: true as const });
    const detach = attachPersistenceSync(store, { save: vi.fn().mockResolvedValue({ ok: true as const }), saveSync });

    try {
      dispatchConnector(store, "C1");
      // jsdom reports "visible" by default.
      document.dispatchEvent(new Event("visibilitychange"));
      expect(saveSync).not.toHaveBeenCalled();
    } finally {
      detach();
    }
  });

  it("flushes a pending save when the subscription is detached (AC3)", () => {
    const store = createAppStore(createInitialState());
    const save = vi.fn().mockResolvedValue({ ok: true as const });
    const saveSync = vi.fn().mockReturnValue({ ok: true as const });
    const detach = attachPersistenceSync(store, { save, saveSync });

    dispatchConnector(store, "C1");
    expect(saveSync).not.toHaveBeenCalled();

    detach();

    expect(saveSync).toHaveBeenCalledTimes(1);
    expect(save).not.toHaveBeenCalled();
  });

  it("does not perform an extra save on detach in synchronous mode (AC4)", () => {
    const store = createAppStore(createInitialState());
    const save = vi.fn().mockReturnValue({ ok: true as const });
    const saveSync = vi.fn().mockReturnValue({ ok: true as const });
    const detach = attachPersistenceSync(store, { save, saveSync, debounceMs: 0 });

    dispatchConnector(store, "C1");
    expect(save).toHaveBeenCalledTimes(1);

    detach();

    // No pending timer in synchronous mode, so detach adds no save.
    expect(save).toHaveBeenCalledTimes(1);
    expect(saveSync).not.toHaveBeenCalled();
  });

  it("removes its lifecycle listeners on detach (AC7)", () => {
    const store = createAppStore(createInitialState());
    const removeWindow = vi.spyOn(window, "removeEventListener");
    const removeDocument = vi.spyOn(document, "removeEventListener");

    const detach = attachPersistenceSync(store, {
      save: vi.fn().mockResolvedValue({ ok: true as const }),
      saveSync: vi.fn().mockReturnValue({ ok: true as const })
    });
    detach();

    expect(removeWindow).toHaveBeenCalledWith("pagehide", expect.any(Function));
    expect(removeDocument).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
  });
});

describe("saveStateSync", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes to storage immediately without awaiting storage-pressure estimation (AC2)", () => {
    const setItem = vi.fn();
    const storage = { getItem: vi.fn(() => null), setItem, removeItem: vi.fn() };
    const estimate = vi.fn().mockResolvedValue({ quota: 1_000, usage: 950 });
    Object.defineProperty(navigator, "storage", { configurable: true, value: { estimate } });

    try {
      const result = saveStateSync(createInitialState(), storage, () => "2026-06-09T00:00:00.000Z");

      expect(result).toEqual({ ok: true });
      expect(setItem).toHaveBeenCalledTimes(1);
      // The synchronous path must never gate the durable write on the async estimate.
      expect(estimate).not.toHaveBeenCalled();
    } finally {
      delete (navigator as unknown as Record<string, unknown>).storage;
    }
  });

  it("reports quota-exceeded synchronously when the write throws (AC6)", () => {
    const storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      }),
      removeItem: vi.fn()
    };

    const result = saveStateSync(createInitialState(), storage, () => "2026-06-09T00:00:00.000Z");

    expect(result).toEqual({ ok: false, reason: "quota-exceeded" });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialState } from "../store";

interface MemoryStorage extends Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  read: (key: string) => string | null;
}

function createMemoryStorage(seed: Record<string, string> = {}): MemoryStorage {
  const entries = new Map(Object.entries(seed));

  return {
    getItem(key: string) {
      return entries.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      entries.set(key, value);
    },
    removeItem(key: string) {
      entries.delete(key);
    },
    read(key: string) {
      return entries.get(key) ?? null;
    }
  };
}

describe("persistence storage key configuration", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses configured VITE_STORAGE_KEY when provided", async () => {
    vi.stubEnv("VITE_STORAGE_KEY", "electrical-plan-editor.test");
    const persistenceModule = await import("../adapters/persistence/localStorage");
    const storage = createMemoryStorage();

    persistenceModule.saveState(createInitialState(), storage, () => "2026-02-21T00:00:00.000Z");

    expect(persistenceModule.STORAGE_KEY).toBe("electrical-plan-editor.test");
    expect(storage.read("electrical-plan-editor.test")).not.toBeNull();
  });

  it("falls back to default storage key when configured value is empty", async () => {
    vi.stubEnv("VITE_STORAGE_KEY", "   ");
    const persistenceModule = await import("../adapters/persistence/localStorage");
    const storage = createMemoryStorage();

    persistenceModule.saveState(createInitialState(), storage, () => "2026-02-21T00:05:00.000Z");

    expect(persistenceModule.STORAGE_KEY).toBe("electrical-plan-editor.state");
    expect(storage.read("electrical-plan-editor.state")).not.toBeNull();
  });
});

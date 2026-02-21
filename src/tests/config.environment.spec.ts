import { describe, expect, it } from "vitest";
import {
  DEFAULT_APP_HOST,
  DEFAULT_APP_PORT,
  DEFAULT_PREVIEW_PORT,
  DEFAULT_STORAGE_KEY,
  resolveRuntimeEnvironment,
  resolveStorageKey
} from "../config/environment";

describe("environment resolution", () => {
  it("uses deterministic defaults when env inputs are absent", () => {
    const resolved = resolveRuntimeEnvironment({});

    expect(resolved.appHost).toBe(DEFAULT_APP_HOST);
    expect(resolved.appPort).toBe(DEFAULT_APP_PORT);
    expect(resolved.previewPort).toBe(DEFAULT_PREVIEW_PORT);
    expect(resolved.e2eBaseUrl).toBe(`http://${DEFAULT_APP_HOST}:${DEFAULT_APP_PORT}`);
    expect(resolved.storageKey).toBe(DEFAULT_STORAGE_KEY);
    expect(resolved.warnings).toHaveLength(0);
  });

  it("applies valid runtime overrides", () => {
    const resolved = resolveRuntimeEnvironment({
      APP_HOST: "0.0.0.0",
      APP_PORT: "6200",
      PREVIEW_PORT: "6201",
      E2E_BASE_URL: "http://0.0.0.0:6200",
      VITE_STORAGE_KEY: "electrical-plan-editor.custom"
    });

    expect(resolved.appHost).toBe("0.0.0.0");
    expect(resolved.appPort).toBe(6200);
    expect(resolved.previewPort).toBe(6201);
    expect(resolved.e2eBaseUrl).toBe("http://0.0.0.0:6200");
    expect(resolved.storageKey).toBe("electrical-plan-editor.custom");
    expect(resolved.warnings).toHaveLength(0);
  });

  it("falls back for invalid ports and malformed e2e url", () => {
    const resolved = resolveRuntimeEnvironment({
      APP_PORT: "abc",
      PREVIEW_PORT: "70000",
      E2E_BASE_URL: "not-a-url"
    });

    expect(resolved.appPort).toBe(DEFAULT_APP_PORT);
    expect(resolved.previewPort).toBe(DEFAULT_PREVIEW_PORT);
    expect(resolved.e2eBaseUrl).toBe(`http://${DEFAULT_APP_HOST}:${DEFAULT_APP_PORT}`);
    expect(resolved.warnings.length).toBeGreaterThanOrEqual(3);
  });

  it("falls back for empty storage key values", () => {
    expect(resolveStorageKey(undefined)).toBe(DEFAULT_STORAGE_KEY);
    expect(resolveStorageKey("")).toBe(DEFAULT_STORAGE_KEY);
    expect(resolveStorageKey("   ")).toBe(DEFAULT_STORAGE_KEY);
    expect(resolveStorageKey("custom.key")).toBe("custom.key");
  });
});

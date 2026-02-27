import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildNetworkExportFilename, downloadJsonFile } from "../app/hooks/useNetworkImportExport";

describe("network import/export helpers", () => {
  const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
  const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = "";

    if (originalCreateObjectUrl !== undefined) {
      Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
    }
    if (originalRevokeObjectUrl !== undefined) {
      Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectUrl);
    }
  });

  it("builds scope-distinct export filenames with filesystem-safe timestamps", () => {
    const exportedAtIso = "2026-02-27T12:34:56.789Z";
    expect(buildNetworkExportFilename("active", exportedAtIso)).toBe(
      "electrical-network-active-2026-02-27T12-34-56-789Z.json"
    );
    expect(buildNetworkExportFilename("selected", exportedAtIso)).toBe(
      "electrical-network-selected-2026-02-27T12-34-56-789Z.json"
    );
    expect(buildNetworkExportFilename("all", exportedAtIso)).toBe("electrical-network-all-2026-02-27T12-34-56-789Z.json");
  });

  it("defers JSON blob URL revoke until after click dispatch", () => {
    const createObjectUrl = vi.fn(() => "blob:test-json");
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: createObjectUrl
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: revokeObjectUrl
    });

    let capturedDownloadName = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function clickMock(this: HTMLAnchorElement) {
      capturedDownloadName = this.download;
    });

    const ok = downloadJsonFile("electrical-network-active-2026-02-27T12-34-56-789Z.json", "{\"hello\":\"world\"}");
    expect(ok).toBe(true);
    expect(capturedDownloadName).toBe("electrical-network-active-2026-02-27T12-34-56-789Z.json");
    expect(revokeObjectUrl).not.toHaveBeenCalled();

    vi.runAllTimers();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:test-json");
  });
});

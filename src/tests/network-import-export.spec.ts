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
    const activeFilename = buildNetworkExportFilename("active", exportedAtIso);
    const selectedFilename = buildNetworkExportFilename("selected", exportedAtIso);
    const allFilename = buildNetworkExportFilename("all", exportedAtIso);

    expect(activeFilename).toMatch(/^electrical-network-active-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/);
    expect(selectedFilename).toMatch(/^electrical-network-selected-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/);
    expect(allFilename).toMatch(/^electrical-network-all-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/);
    expect(activeFilename).not.toContain(".789");
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

    const ok = downloadJsonFile("electrical-network-active-2026-02-27_13-34-56.json", "{\"hello\":\"world\"}");
    expect(ok).toBe(true);
    expect(capturedDownloadName).toBe("electrical-network-active-2026-02-27_13-34-56.json");
    expect(revokeObjectUrl).not.toHaveBeenCalled();

    vi.runAllTimers();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:test-json");
  });
});

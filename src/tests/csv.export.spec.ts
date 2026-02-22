import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadCsvFile } from "../app/lib/csv";

describe("downloadCsvFile", () => {
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

  it("defers blob URL cleanup until after the download click is triggered", () => {
    const createObjectUrl = vi.fn(() => "blob:test-csv");
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

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    downloadCsvFile(
      "Wire Export",
      ["Name", "Length"],
      [
        ["Wire A", 12],
        ["Wire B", 24]
      ]
    );

    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).not.toHaveBeenCalled();
    expect(document.body.querySelector("a")).toBeNull();

    vi.runAllTimers();

    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:test-csv");
  });
});

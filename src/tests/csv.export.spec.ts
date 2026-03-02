import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildCsvContent, downloadCsvFile } from "../app/lib/csv";

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

  it("neutralizes formula-like string cells while preserving numeric values", () => {
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
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    downloadCsvFile("Wire Export", ["Label", "Value"], [["=SUM(A1:A2)", "+42"], ["@HACK", -12], ["normal", 7]]);

    const csvContent = buildCsvContent(
      ["Label", "Value"],
      [["=SUM(A1:A2)", "+42"], ["@HACK", -12], ["normal", 7]]
    );
    expect(csvContent).toContain("'=SUM(A1:A2)");
    expect(csvContent).toContain("'+42");
    expect(csvContent).toContain("'@HACK");
    expect(csvContent).toContain(",-12");
  });

  it("prepends a UTF-8 BOM when explicitly requested", () => {
    const OriginalBlob = Blob;
    let capturedPayload: BlobPart | undefined;
    class BlobCapture extends OriginalBlob {
      constructor(parts: BlobPart[] = [], options?: BlobPropertyBag) {
        super(parts, options);
        capturedPayload = parts[0];
      }
    }
    (globalThis as typeof globalThis & { Blob: typeof Blob }).Blob = BlobCapture;
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
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    try {
      downloadCsvFile("Wire Export", ["Libelle"], [["Epissure a e"]], { includeUtf8Bom: true });
    } finally {
      (globalThis as typeof globalThis & { Blob: typeof Blob }).Blob = OriginalBlob;
    }
    expect(typeof capturedPayload).toBe("string");
    if (typeof capturedPayload !== "string") {
      throw new Error("Expected string CSV payload.");
    }
    expect(capturedPayload.startsWith("\uFEFF")).toBe(true);
    expect(capturedPayload).toContain("Libelle");
  });
});

import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asWireId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
} from "./helpers/app-ui-test-utils";
import {
  findBomPreviewDialog,
  openExportMenu,
} from "./helpers/network-summary-export-test-utils";

describe("App integration UI - network summary BOM CSV export", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exports BOM CSV with a UTF-8 BOM and inline wire termination rows even without catalog-backed rows", async () => {
    const baseState = createUiIntegrationState();
    const baseWire = baseState.wires.byId[asWireId("W1")];
    if (baseWire === undefined) {
      throw new Error("Expected wire W1 in integration state.");
    }

    const withWireTerminations = appReducer(
      baseState,
      appActions.upsertWire({
        ...baseWire,
        endpointAConnectionReference: "Câble-Été",
        endpointBSealReference: "Joint-À",
      }),
    );

    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "createObjectURL",
    );
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "revokeObjectURL",
    );
    const createObjectUrl = vi.fn((blob: Blob) => {
      void blob;
      return "blob:bom-utf8";
    });
    const OriginalBlob = Blob;
    let capturedPayload: BlobPart | undefined;

    try {
      class BlobCapture extends OriginalBlob {
        constructor(parts: BlobPart[] = [], options?: BlobPropertyBag) {
          super(parts, options);
          capturedPayload = parts[0];
        }
      }
      (globalThis as typeof globalThis & { Blob: typeof Blob }).Blob =
        BlobCapture;
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        writable: true,
        value: createObjectUrl,
      });
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        writable: true,
        value: vi.fn(),
      });
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
        () => undefined,
      );

      renderAppWithState(withWireTerminations);
      switchScreenDrawerAware("modeling");

      const networkSummaryPanel = getPanelByHeading("Network summary");
      openExportMenu(networkSummaryPanel);
      fireEvent.click(
        within(networkSummaryPanel).getByRole("button", { name: "BOM" }),
      );
      const previewDialog = await findBomPreviewDialog();
      expect(
        within(previewDialog).getAllByText("Wire termination").length,
      ).toBeGreaterThan(0);
      fireEvent.click(
        within(previewDialog).getByRole("button", { name: "Download CSV" }),
      );

      if (typeof capturedPayload !== "string") {
        throw new Error("Expected captured BOM CSV payload.");
      }

      expect(capturedPayload.startsWith("\uFEFF")).toBe(true);
      expect(capturedPayload).toContain(
        "Type,Manufacturer reference,Name,Connection count,Connector quantity",
      );
      expect(capturedPayload).toContain("Wire termination,Câble-Été");
      expect(capturedPayload).toContain("Wire termination,Joint-À");
    } finally {
      (globalThis as typeof globalThis & { Blob: typeof Blob }).Blob =
        OriginalBlob;
      vi.restoreAllMocks();
      if (originalCreateObjectUrl !== undefined) {
        Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
      }
      if (originalRevokeObjectUrl !== undefined) {
        Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectUrl);
      }
    }
  });
});

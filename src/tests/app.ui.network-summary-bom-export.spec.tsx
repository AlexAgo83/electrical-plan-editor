import { fireEvent, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  asSpliceId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read blob."));
    reader.readAsText(blob);
  });
}

describe("App integration UI - network summary BOM export", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders BOM to the right of SVG and uses the CSV export icon", () => {
    const catalogItemId = asCatalogItemId("CAT-BOM");
    const withCatalog = appReducer(
      appReducer(
        appReducer(
          createUiIntegrationState(),
          appActions.upsertCatalogItem({
            id: catalogItemId,
            manufacturerReference: "CAT-BOM",
            name: "Catalog BOM item",
            connectionCount: 2,
            unitPriceExclTax: 5
          })
        ),
        appActions.upsertConnector({
          id: asConnectorId("C1"),
          name: "Connector 1",
          technicalId: "C-1",
          cavityCount: 2,
          catalogItemId
        })
      ),
      appActions.upsertSplice({
        id: asSpliceId("S1"),
        name: "Splice 1",
        technicalId: "S-1",
        portCount: 2,
        catalogItemId
      })
    );

    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    const createObjectUrl = vi.fn(() => "blob:bom");
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: revokeObjectUrl });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    try {
      renderAppWithState(withCatalog);
      switchScreenDrawerAware("modeling");

      const networkSummaryPanel = getPanelByHeading("Network summary");
      const exportSvgButton = within(networkSummaryPanel).getByRole("button", { name: "SVG" });
      const exportBomButton = within(networkSummaryPanel).getByRole("button", { name: "BOM" });
      expect(within(networkSummaryPanel).queryByText(/BOM CSV pricing:/i)).toBeNull();
      expect(exportBomButton).not.toHaveAttribute("title");

      const actionButtons = Array.from(networkSummaryPanel.querySelectorAll("header .workspace-tab"));
      expect(actionButtons.indexOf(exportBomButton)).toBeGreaterThan(actionButtons.indexOf(exportSvgButton));
      expect(exportBomButton.querySelector(".table-export-icon")).not.toBeNull();

      fireEvent.click(exportBomButton);
      expect(createObjectUrl).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    } finally {
      clickSpy.mockRestore();
      if (originalCreateObjectUrl !== undefined) {
        Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
      }
      if (originalRevokeObjectUrl !== undefined) {
        Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectUrl);
      }
    }
  });

  it("keeps the BOM export button visible after changing currency and tax settings", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const pricingSettingsPanel = getPanelByHeading("Catalog & BOM setup");
    fireEvent.change(within(pricingSettingsPanel).getByLabelText("Currency (Catalog/BOM)"), {
      target: { value: "GBP" }
    });
    fireEvent.click(within(pricingSettingsPanel).getByLabelText("Enable tax / VAT (TVA)"));

    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    expect(within(networkSummaryPanel).queryByText(/BOM CSV pricing:/i)).toBeNull();
    expect(within(networkSummaryPanel).getByRole("button", { name: "BOM" })).toBeInTheDocument();
  });

  it("exports SVG with frame, cartouche metadata, fallback logo and clamped notes when enabled", async () => {
    const baseState = createUiIntegrationState();
    const activeNetworkId = baseState.activeNetworkId;
    if (activeNetworkId === null) {
      throw new Error("Expected active network in integration state.");
    }
    const notesPayload = Array.from({ length: 16 }, (_, index) => `Line ${index + 1} with overflow candidate words.`).join("\n");
    const stateWithMetadata = appReducer(
      baseState,
      appActions.updateNetwork(
        activeNetworkId,
        "Main network sample",
        "NET-MAIN-SAMPLE",
        "2026-03-03T11:00:00.000Z",
        undefined,
        {
          createdAt: "2026-03-01T10:00:00.000Z",
          author: "Alice Martin",
          projectCode: "PRJ-42/A",
          logoUrl: "https://example.invalid/logo.png",
          exportNotes: notesPayload
        }
      )
    );

    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    let capturedSvgBlob: Blob | null = null;
    const createObjectUrl = vi.fn((value: Blob) => {
      capturedSvgBlob = value;
      return "blob:svg-export";
    });
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: revokeObjectUrl });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Logo unavailable for export."));

    try {
      renderAppWithState(stateWithMetadata);
      switchScreenDrawerAware("settings");
      const canvasToolsPanel = getPanelByHeading("Canvas tools preferences");
      fireEvent.click(within(canvasToolsPanel).getByLabelText("Include frame in SVG/PNG export"));

      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
      const calloutsToggle = within(networkSummaryPanel).getByRole("button", { name: "Callouts" });
      fireEvent.click(calloutsToggle);
      fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "SVG" }));

      await waitFor(() => {
        expect(createObjectUrl).toHaveBeenCalledTimes(1);
      });
      expect(capturedSvgBlob).not.toBeNull();
      if (capturedSvgBlob === null) {
        throw new Error("Expected exported SVG blob.");
      }
      const exportedSvg = await readBlobAsText(capturedSvgBlob);
      expect(exportedSvg).toContain('class="network-export-frame"');
      expect(exportedSvg).toContain('class="network-export-cartouche"');
      expect(exportedSvg).toContain("Network:");
      expect(exportedSvg).toContain("Author: Alice Martin");
      expect(exportedSvg).toContain("Code: PRJ-42/A");
      expect(exportedSvg).toContain("Created: 2026-03-01");
      expect(exportedSvg).toContain("Logo indisponible");
      expect(exportedSvg).toContain('class="network-export-cartouche-logo-frame"');
      expect(exportedSvg).toContain(">Len<");
      expect(exportedSvg).toContain(">Sec<");
      expect(exportedSvg).not.toContain("Length (mm)");
      expect(exportedSvg).not.toContain("Section (mm²)");
      expect(exportedSvg).toContain('class="network-export-cartouche-notes-label"');
      const noteRows = exportedSvg.match(/class="network-export-cartouche-note"/g) ?? [];
      expect(noteRows.length).toBeLessThanOrEqual(8);
      expect(exportedSvg).toContain("...");
      expect(clickSpy).toHaveBeenCalledTimes(1);
    } finally {
      fetchSpy.mockRestore();
      clickSpy.mockRestore();
      if (originalCreateObjectUrl !== undefined) {
        Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
      }
      if (originalRevokeObjectUrl !== undefined) {
        Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectUrl);
      }
    }
  });

  it("exports SVG cartouche logo without drawing a fallback logo frame when logo image is available", async () => {
    const baseState = createUiIntegrationState();
    const activeNetworkId = baseState.activeNetworkId;
    if (activeNetworkId === null) {
      throw new Error("Expected active network in integration state.");
    }

    const dataUrlLogo =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9qkX8AAAAASUVORK5CYII=";
    const stateWithLogo = appReducer(
      baseState,
      appActions.updateNetwork(
        activeNetworkId,
        "Main network sample",
        "NET-MAIN-SAMPLE",
        "2026-03-03T11:00:00.000Z",
        undefined,
        {
          createdAt: "2026-03-01T10:00:00.000Z",
          logoUrl: dataUrlLogo
        }
      )
    );

    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    let capturedSvgBlob: Blob | null = null;
    const createObjectUrl = vi.fn((value: Blob) => {
      capturedSvgBlob = value;
      return "blob:svg-export-logo";
    });
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: revokeObjectUrl });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    try {
      renderAppWithState(stateWithLogo);
      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
      fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "SVG" }));

      await waitFor(() => {
        expect(createObjectUrl).toHaveBeenCalledTimes(1);
      });
      expect(capturedSvgBlob).not.toBeNull();
      if (capturedSvgBlob === null) {
        throw new Error("Expected exported SVG blob.");
      }
      const exportedSvg = await readBlobAsText(capturedSvgBlob);
      expect(exportedSvg).toContain("<image");
      expect(exportedSvg).toContain("data:image/png;base64");
      expect(exportedSvg).not.toContain("Logo indisponible");
      expect(exportedSvg).not.toContain('class="network-export-cartouche-logo-frame"');
      expect(clickSpy).toHaveBeenCalledTimes(1);
    } finally {
      clickSpy.mockRestore();
      if (originalCreateObjectUrl !== undefined) {
        Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
      }
      if (originalRevokeObjectUrl !== undefined) {
        Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectUrl);
      }
    }
  });

  it("exports SVG without frame or cartouche when both toggles are disabled", async () => {
    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    let capturedSvgBlob: Blob | null = null;
    const createObjectUrl = vi.fn((value: Blob) => {
      capturedSvgBlob = value;
      return "blob:svg-export-no-overlay";
    });
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: revokeObjectUrl });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    try {
      renderAppWithState(createUiIntegrationState());
      switchScreenDrawerAware("settings");
      const canvasToolsPanel = getPanelByHeading("Canvas tools preferences");
      fireEvent.click(within(canvasToolsPanel).getByLabelText("Include identity cartouche in SVG/PNG export"));

      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
      fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "SVG" }));

      await waitFor(() => {
        expect(createObjectUrl).toHaveBeenCalledTimes(1);
      });
      expect(capturedSvgBlob).not.toBeNull();
      if (capturedSvgBlob === null) {
        throw new Error("Expected exported SVG blob.");
      }
      const exportedSvg = await readBlobAsText(capturedSvgBlob);
      expect(exportedSvg).not.toContain('class="network-export-frame"');
      expect(exportedSvg).not.toContain('class="network-export-cartouche"');
      expect(clickSpy).toHaveBeenCalledTimes(1);
    } finally {
      clickSpy.mockRestore();
      if (originalCreateObjectUrl !== undefined) {
        Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
      }
      if (originalRevokeObjectUrl !== undefined) {
        Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectUrl);
      }
    }
  });
});

import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  asSpliceId,
  asWireId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

function openExportMenu(panel: HTMLElement): void {
  const exportButton = within(panel).getByRole("button", { name: "Export" });
  if (exportButton.getAttribute("aria-expanded") !== "true") {
    fireEvent.click(exportButton);
  }
}

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
      expect(within(networkSummaryPanel).queryByText(/BOM CSV pricing:/i)).toBeNull();

      // Compact BOM export columns is now a setting, not a header button
      switchScreenDrawerAware("settings");
      const bomSettingsPanel = getPanelByHeading("Catalog & BOM setup");
      expect(within(bomSettingsPanel).getByLabelText("Compact BOM export columns")).toBeInTheDocument();
      switchScreenDrawerAware("modeling");

      const refreshedNetworkSummaryPanel = getPanelByHeading("Network summary");
      openExportMenu(refreshedNetworkSummaryPanel);
      const exportSvgButton = within(refreshedNetworkSummaryPanel).getByRole("button", { name: "SVG" });
      const exportBomButton = within(refreshedNetworkSummaryPanel).getByRole("button", { name: "BOM" });
      expect(exportSvgButton).toHaveTextContent("SVG");
      expect(exportBomButton.querySelector(".table-export-icon")).not.toBeNull();

      fireEvent.click(exportBomButton);
      expect(createObjectUrl).not.toHaveBeenCalled();
      expect(clickSpy).not.toHaveBeenCalled();

      const previewDialog = screen.getByRole("dialog", { name: "BOM preview" });
      expect(within(previewDialog).getByText("Items")).toBeInTheDocument();
      expect(within(previewDialog).getAllByText("1").length).toBeGreaterThan(0);
      expect(within(previewDialog).getByText("CSV")).toBeInTheDocument();
      expect(within(previewDialog).getByText("CAT-BOM")).toBeInTheDocument();
      fireEvent.click(within(previewDialog).getByRole("button", { name: "Download CSV" }));
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
    openExportMenu(networkSummaryPanel);
    expect(within(networkSummaryPanel).getByRole("button", { name: "BOM" })).toBeInTheDocument();
  });

  it("cancels BOM preview without downloading", () => {
    const catalogItemId = asCatalogItemId("CAT-BOM-CANCEL");
    const withCatalog = appReducer(
      appReducer(
        createUiIntegrationState(),
        appActions.upsertCatalogItem({
          id: catalogItemId,
          manufacturerReference: "CAT-BOM-CANCEL",
          name: "Catalog BOM cancel item",
          connectionCount: 2,
          unitPriceExclTax: 5
        })
      ),
      appActions.upsertConnector({
        id: asConnectorId("C-BOM-CANCEL"),
        name: "Connector cancel",
        technicalId: "C-BOM-CANCEL",
        cavityCount: 2,
        catalogItemId
      })
    );
    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    const createObjectUrl = vi.fn(() => "blob:bom-cancel");
    Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: vi.fn() });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    try {
      renderAppWithState(withCatalog);
      switchScreenDrawerAware("modeling");

      const networkSummaryPanel = getPanelByHeading("Network summary");
      openExportMenu(networkSummaryPanel);
      fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "BOM" }));

      const previewDialog = screen.getByRole("dialog", { name: "BOM preview" });
      fireEvent.click(within(previewDialog).getByRole("button", { name: "Cancel" }));

      expect(screen.queryByRole("dialog", { name: "BOM preview" })).toBeNull();
      expect(createObjectUrl).not.toHaveBeenCalled();
      expect(clickSpy).not.toHaveBeenCalled();
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

  it("shows XLSX workbook sheets as BOM preview tabs", () => {
    const catalogItemId = asCatalogItemId("CAT-BOM-XLSX");
    const withCatalog = appReducer(
      appReducer(
        createUiIntegrationState(),
        appActions.upsertCatalogItem({
          id: catalogItemId,
          manufacturerReference: "CAT-BOM-XLSX",
          name: "Catalog BOM XLSX item",
          connectionCount: 2,
          unitPriceExclTax: 5
        })
      ),
      appActions.upsertConnector({
        id: asConnectorId("C-BOM-XLSX"),
        name: "Connector XLSX",
        technicalId: "C-BOM-XLSX",
        cavityCount: 2,
        catalogItemId
      })
    );

    renderAppWithState(withCatalog);

    switchScreenDrawerAware("settings");
    const pricingSettingsPanel = getPanelByHeading("Catalog & BOM setup");
    fireEvent.change(within(pricingSettingsPanel).getByLabelText("Tabular export format"), {
      target: { value: "xlsx" }
    });

    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    openExportMenu(networkSummaryPanel);
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "BOM" }));

    const previewDialog = screen.getByRole("dialog", { name: "BOM preview" });
    expect(within(previewDialog).getByText("XLSX")).toBeInTheDocument();
    expect(within(previewDialog).getByText("Sheets")).toBeInTheDocument();
    expect(within(previewDialog).getAllByText("2").length).toBeGreaterThan(0);
    expect(within(previewDialog).getByRole("tab", { name: /Network BOM/ })).toHaveAttribute("aria-selected", "true");
    const byConnectorTab = within(previewDialog).getByRole("tab", { name: /By connector/ });
    fireEvent.click(byConnectorTab);

    expect(byConnectorTab).toHaveAttribute("aria-selected", "true");
    expect(within(previewDialog).getByText("Connector ID")).toBeInTheDocument();
    expect(within(previewDialog).getByText("C-BOM-XLSX")).toBeInTheDocument();
  });

  it("opens connectors from the BOM preview By connector sheet", () => {
    const catalogItemId = asCatalogItemId("CAT-BOM-CONNECTOR-LINK");
    const withCatalog = appReducer(
      appReducer(
        createUiIntegrationState(),
        appActions.upsertCatalogItem({
          id: catalogItemId,
          manufacturerReference: "CAT-BOM-CONNECTOR-LINK",
          name: "Catalog BOM connector link item",
          connectionCount: 2
        })
      ),
      appActions.upsertConnector({
        id: asConnectorId("C-BOM-CONNECTOR-LINK"),
        name: "Connector BOM Link",
        technicalId: "CONN-BOM-LINK",
        cavityCount: 2,
        catalogItemId
      })
    );

    renderAppWithState(withCatalog);

    switchScreenDrawerAware("settings");
    const pricingSettingsPanel = getPanelByHeading("Catalog & BOM setup");
    fireEvent.change(within(pricingSettingsPanel).getByLabelText("Tabular export format"), {
      target: { value: "xlsx" }
    });

    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    openExportMenu(networkSummaryPanel);
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "BOM" }));

    const previewDialog = screen.getByRole("dialog", { name: "BOM preview" });
    fireEvent.click(within(previewDialog).getByRole("tab", { name: /By connector/ }));
    fireEvent.click(within(previewDialog).getByRole("button", { name: "CONN-BOM-LINK" }));

    expect(screen.queryByRole("dialog", { name: "BOM preview" })).toBeNull();
    const editConnectorPanel = getPanelByHeading("Edit Connector");
    expect(within(editConnectorPanel).getByLabelText("Technical ID")).toHaveValue("CONN-BOM-LINK");
  });

  it("opens catalog entries from BOM preview manufacturer references", () => {
    const catalogItemId = asCatalogItemId("CAT-BOM-LINK");
    const withCatalog = appReducer(
      appReducer(
        createUiIntegrationState(),
        appActions.upsertCatalogItem({
          id: catalogItemId,
          manufacturerReference: "CAT-BOM-LINK",
          name: "Catalog BOM linked item",
          connectionCount: 2,
          unitPriceExclTax: 5
        })
      ),
      appActions.upsertConnector({
        id: asConnectorId("C-BOM-LINK"),
        name: "Connector link",
        technicalId: "C-BOM-LINK",
        cavityCount: 2,
        catalogItemId
      })
    );

    renderAppWithState(withCatalog);
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    openExportMenu(networkSummaryPanel);
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "BOM" }));

    const previewDialog = screen.getByRole("dialog", { name: "BOM preview" });
    fireEvent.click(within(previewDialog).getByRole("button", { name: "CAT-BOM-LINK" }));

    expect(screen.queryByRole("dialog", { name: "BOM preview" })).toBeNull();
    const editCatalogPanel = getPanelByHeading("Edit catalog item");
    expect(within(editCatalogPanel).getByLabelText("Manufacturer reference")).toHaveValue("CAT-BOM-LINK");
  });

  it("keeps wire termination references in the BOM preview as non-navigation text", () => {
    const baseState = createUiIntegrationState();
    const baseWire = baseState.wires.byId[asWireId("W1")];
    if (baseWire === undefined) {
      throw new Error("Expected wire W1 in integration state.");
    }

    const catalogItemId = asCatalogItemId("CAT-TERM-REF");
    const withMatchingTerminationReference = appReducer(
      appReducer(
        baseState,
        appActions.upsertCatalogItem({
          id: catalogItemId,
          manufacturerReference: "TERM-NOT-CATALOG-LINK",
          name: "Catalog with matching termination text",
          connectionCount: 2
        })
      ),
      appActions.upsertWire({
        ...baseWire,
        endpointAConnectionReference: "TERM-NOT-CATALOG-LINK"
      })
    );

    renderAppWithState(withMatchingTerminationReference);
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    openExportMenu(networkSummaryPanel);
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "BOM" }));

    const previewDialog = screen.getByRole("dialog", { name: "BOM preview" });
    expect(within(previewDialog).getAllByText("TERM-NOT-CATALOG-LINK").length).toBeGreaterThan(0);
    expect(within(previewDialog).queryByRole("button", { name: "TERM-NOT-CATALOG-LINK" })).toBeNull();
  });

  it("exports BOM CSV with a UTF-8 BOM and inline wire termination rows even without catalog-backed rows", () => {
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
        endpointBSealReference: "Joint-À"
      })
    );

    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
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
      (globalThis as typeof globalThis & { Blob: typeof Blob }).Blob = BlobCapture;
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        writable: true,
        value: createObjectUrl
      });
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        writable: true,
        value: vi.fn()
      });
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

      renderAppWithState(withWireTerminations);
      switchScreenDrawerAware("modeling");

      const networkSummaryPanel = getPanelByHeading("Network summary");
      openExportMenu(networkSummaryPanel);
      fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "BOM" }));
      const previewDialog = screen.getByRole("dialog", { name: "BOM preview" });
      expect(within(previewDialog).getAllByText("Wire termination").length).toBeGreaterThan(0);
      fireEvent.click(within(previewDialog).getByRole("button", { name: "Download CSV" }));

      if (typeof capturedPayload !== "string") {
        throw new Error("Expected captured BOM CSV payload.");
      }

      expect(capturedPayload.startsWith("\uFEFF")).toBe(true);
      expect(capturedPayload).toContain("Type,Manufacturer reference,Name,Connection count,Connector quantity");
      expect(capturedPayload).toContain("Wire termination,Câble-Été");
      expect(capturedPayload).toContain("Wire termination,Joint-À");
    } finally {
      (globalThis as typeof globalThis & { Blob: typeof Blob }).Blob = OriginalBlob;
      vi.restoreAllMocks();
      if (originalCreateObjectUrl !== undefined) {
        Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
      }
      if (originalRevokeObjectUrl !== undefined) {
        Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectUrl);
      }
    }
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
          author: "Paul Mondou",
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
      const viewButton = within(networkSummaryPanel).getByRole("button", { name: "View" });
      fireEvent.click(viewButton);
      const calloutsToggle = within(networkSummaryPanel).getByRole("button", { name: "Callouts" });
      fireEvent.click(calloutsToggle);
      openExportMenu(networkSummaryPanel);
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
      expect(exportedSvg).toContain("Author: Paul Mondou");
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

  it("exports SVG without applying the canvas global scale", async () => {
    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    let capturedSvgBlob: Blob | null = null;
    const createObjectUrl = vi.fn((value: Blob) => {
      capturedSvgBlob = value;
      return "blob:svg-export-global-scale";
    });
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: revokeObjectUrl });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    try {
      renderAppWithState(createUiIntegrationState());
      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
      fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Reset view" }));
      const globalScaleInput = networkSummaryPanel.querySelector<HTMLInputElement>(".network-canvas-global-scale input");
      if (globalScaleInput === null) {
        throw new Error("Expected global scale input.");
      }
      fireEvent.change(globalScaleInput, { target: { value: "100" } });
      openExportMenu(networkSummaryPanel);
      fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "SVG" }));

      await waitFor(() => {
        expect(createObjectUrl).toHaveBeenCalledTimes(1);
      });
      expect(capturedSvgBlob).not.toBeNull();
      if (capturedSvgBlob === null) {
        throw new Error("Expected exported SVG blob.");
      }

      const exportedSvg = await readBlobAsText(capturedSvgBlob);
      expect(exportedSvg).toMatch(/transform="translate\([^"]+\) scale\(1\)"/);
      expect(exportedSvg).not.toContain("scale(2)");
      const exportedDocument = new DOMParser().parseFromString(exportedSvg, "image/svg+xml");
      const gridOpenTag = exportedSvg.match(/<g\b(?=[^>]*\bclass="network-grid")[^>]*>/)?.[0] ?? "";
      const gridBlockStart = gridOpenTag.length > 0 ? exportedSvg.indexOf(gridOpenTag) : -1;
      const gridBlockEnd = gridBlockStart >= 0 ? exportedSvg.indexOf("</g>", gridBlockStart) : -1;
      const gridBlock =
        gridBlockStart >= 0 && gridBlockEnd > gridBlockStart
          ? exportedSvg.slice(gridBlockStart, gridBlockEnd)
          : "";
      const gridLineTags = gridBlock.match(/<line\b[^>]*>/g) ?? [];
      const getLineNumber = (tag: string, attribute: string): number =>
        Number(tag.match(new RegExp(`\\b${attribute}="([^"]+)"`))?.[1]);
      const transform =
        exportedDocument.querySelector(".network-grid")?.getAttribute("transform") ||
        gridOpenTag.match(/\btransform="([^"]+)"/)?.[1] ||
        "";
      const transformMatch = transform.match(/^translate\(([^ )]+)\s+([^)]+)\)\s+scale\(([^)]+)\)$/);
      if (transformMatch === null) {
        throw new Error("Expected exported SVG grid transform.");
      }
      const [, rawOffsetX, rawOffsetY, rawScale] = transformMatch;
      const offsetX = Number(rawOffsetX);
      const offsetY = Number(rawOffsetY);
      const scale = Number(rawScale);
      const svgOpenTag = exportedSvg.match(/<svg\b[^>]*>/)?.[0] ?? "";
      const viewBoxParts = (svgOpenTag.match(/\bviewBox="([^"]+)"/)?.[1] ?? "").split(/\s+/).map(Number);
      const width = viewBoxParts[2] ?? Number(svgOpenTag.match(/\bwidth="([^"]+)"/)?.[1]);
      const height = viewBoxParts[3] ?? Number(svgOpenTag.match(/\bheight="([^"]+)"/)?.[1]);
      const visibleMinX = (0 - offsetX) / scale;
      const visibleMaxX = (width - offsetX) / scale;
      const visibleMinY = (0 - offsetY) / scale;
      const visibleMaxY = (height - offsetY) / scale;
      const verticalXs = gridLineTags
        .filter((line) => getLineNumber(line, "x1") === getLineNumber(line, "x2"))
        .map((line) => getLineNumber(line, "x1"));
      const horizontalYs = gridLineTags
        .filter((line) => getLineNumber(line, "y1") === getLineNumber(line, "y2"))
        .map((line) => getLineNumber(line, "y1"));
      expect(exportedSvg).toContain("stroke");
      expect(Math.min(...verticalXs)).toBeLessThanOrEqual(visibleMinX);
      expect(Math.max(...verticalXs)).toBeGreaterThanOrEqual(visibleMaxX);
      expect(Math.min(...horizontalYs)).toBeLessThanOrEqual(visibleMinY);
      expect(Math.max(...horizontalYs)).toBeGreaterThanOrEqual(visibleMaxY);
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

  it("keeps a readable cartouche fill when exporting without callout frames present", async () => {
    const baseState = createUiIntegrationState();
    const activeNetworkId = baseState.activeNetworkId;
    if (activeNetworkId === null) {
      throw new Error("Expected active network in integration state.");
    }

    const stateWithMetadata = appReducer(
      baseState,
      appActions.updateNetwork(
        activeNetworkId,
        "Main network sample",
        "NET-MAIN-SAMPLE",
        "2026-03-03T11:00:00.000Z",
        undefined,
        {
          createdAt: "2026-02-23T10:00:00.000Z",
          author: "Paul Mondou",
          projectCode: "PS5",
          exportNotes: "First design of the HVAC design in an independant harness for prototype testings."
        }
      )
    );

    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    let capturedSvgBlob: Blob | null = null;
    const createObjectUrl = vi.fn((value: Blob) => {
      capturedSvgBlob = value;
      return "blob:svg-export-readable-cartouche";
    });
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: revokeObjectUrl });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    try {
      renderAppWithState(stateWithMetadata);
      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
      openExportMenu(networkSummaryPanel);
      fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "SVG" }));

      await waitFor(() => {
        expect(createObjectUrl).toHaveBeenCalledTimes(1);
      });
      expect(capturedSvgBlob).not.toBeNull();
      if (capturedSvgBlob === null) {
        throw new Error("Expected exported SVG blob.");
      }

      const exportedSvg = await readBlobAsText(capturedSvgBlob);
      expect(exportedSvg).toContain('class="network-export-cartouche-frame"');
      expect(exportedSvg).not.toContain('fill="rgb(0, 0, 0)"');
      expect(exportedSvg).not.toContain('fill="#000000"');
      expect(exportedSvg).toContain("Author: Paul Mondou");
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

  it("avoids canvas text measurement fallback in jsdom during SVG export", async () => {
    const baseState = createUiIntegrationState();
    const activeNetworkId = baseState.activeNetworkId;
    if (activeNetworkId === null) {
      throw new Error("Expected active network in integration state.");
    }

    const stateWithMetadata = appReducer(
      baseState,
      appActions.updateNetwork(
        activeNetworkId,
        "Main network sample",
        "NET-MAIN-SAMPLE",
        "2026-03-03T11:00:00.000Z",
        undefined,
        {
          createdAt: "2026-02-23T10:00:00.000Z",
          author: "Paul Mondou",
          projectCode: "PS5",
          exportNotes: "Short export notes."
        }
      )
    );

    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(() => "blob:svg-export-no-canvas-measure")
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn()
    });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext");

    try {
      renderAppWithState(stateWithMetadata);
      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
      openExportMenu(networkSummaryPanel);
      fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "SVG" }));

      await waitFor(() => {
        expect(clickSpy).toHaveBeenCalledTimes(1);
      });
      expect(getContextSpy).not.toHaveBeenCalled();
    } finally {
      clickSpy.mockRestore();
      getContextSpy.mockRestore();
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
      openExportMenu(networkSummaryPanel);
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
      openExportMenu(networkSummaryPanel);
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

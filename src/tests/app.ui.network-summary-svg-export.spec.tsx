import { fireEvent, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asNodeId,
  asSegmentId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
} from "./helpers/app-ui-test-utils";
import {
  openExportMenu,
  openSvgPreviewAndDownload,
  readBlobAsText,
} from "./helpers/network-summary-export-test-utils";

describe("App integration UI - network summary SVG export", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exports SVG with frame, cartouche metadata, fallback logo and clamped notes when enabled", async () => {
    const baseState = createUiIntegrationState();
    const activeNetworkId = baseState.activeNetworkId;
    if (activeNetworkId === null) {
      throw new Error("Expected active network in integration state.");
    }
    const notesPayload = Array.from(
      { length: 16 },
      (_, index) => `Line ${index + 1} with overflow candidate words.`,
    ).join("\n");
    const stateWithMetadata = appReducer(
      baseState,
      appActions.updateNetwork(
        activeNetworkId,
        "Main network (Sample)",
        "NET-MAIN-SAMPLE",
        "2026-03-03T11:00:00.000Z",
        undefined,
        {
          createdAt: "2026-03-01T10:00:00.000Z",
          author: "Paul Mondou",
          projectCode: "PRJ-42/A",
          logoUrl: "https://example.invalid/logo.png",
          exportNotes: notesPayload,
        },
      ),
    );

    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "createObjectURL",
    );
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "revokeObjectURL",
    );
    let capturedSvgBlob: Blob | null = null;
    const createObjectUrl = vi.fn((value: Blob) => {
      capturedSvgBlob = value;
      return "blob:svg-export";
    });
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: createObjectUrl,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: revokeObjectUrl,
    });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("Logo unavailable for export."));

    try {
      renderAppWithState(stateWithMetadata);
      switchScreenDrawerAware("settings");
      const canvasToolsPanel = getPanelByHeading("Canvas tools preferences");
      fireEvent.click(
        within(canvasToolsPanel).getByLabelText(
          "Include frame in SVG/PNG export",
        ),
      );

      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
      const viewButton = within(networkSummaryPanel).getByRole("button", {
        name: "View",
      });
      fireEvent.click(viewButton);
      const calloutsToggle = within(networkSummaryPanel).getByRole("button", {
        name: "Callouts",
      });
      fireEvent.click(calloutsToggle);
      openExportMenu(networkSummaryPanel);
      await openSvgPreviewAndDownload(networkSummaryPanel);

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
      expect(exportedSvg).toContain(
        'class="network-export-cartouche-logo-frame"',
      );
      expect(exportedSvg).toContain(">Len<");
      expect(exportedSvg).toContain(">Sec<");
      expect(exportedSvg).not.toContain("Length (mm)");
      expect(exportedSvg).not.toContain("Section (mm²)");
      expect(exportedSvg).toContain(
        'class="network-export-cartouche-notes-label"',
      );
      const noteRows =
        exportedSvg.match(/class="network-export-cartouche-note"/g) ?? [];
      expect(noteRows.length).toBeLessThanOrEqual(8);
      expect(exportedSvg).toContain("...");
      expect(exportedSvg).not.toContain('role="button"');
      expect(exportedSvg).not.toContain("tabindex=");
      expect(exportedSvg).not.toContain("focusable=");
      expect(exportedSvg).toContain("pointer-events: none");
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
    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "createObjectURL",
    );
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "revokeObjectURL",
    );
    let capturedSvgBlob: Blob | null = null;
    const createObjectUrl = vi.fn((value: Blob) => {
      capturedSvgBlob = value;
      return "blob:svg-export-global-scale";
    });
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: createObjectUrl,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: revokeObjectUrl,
    });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    try {
      renderAppWithState(createUiIntegrationState());
      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
      fireEvent.click(
        within(networkSummaryPanel).getByRole("button", { name: "Reset view" }),
      );
      const globalScaleInput =
        networkSummaryPanel.querySelector<HTMLInputElement>(
          ".network-canvas-global-scale input",
        );
      if (globalScaleInput === null) {
        throw new Error("Expected global scale input.");
      }
      fireEvent.change(globalScaleInput, { target: { value: "100" } });
      openExportMenu(networkSummaryPanel);
      await openSvgPreviewAndDownload(networkSummaryPanel);

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
      const exportedDocument = new DOMParser().parseFromString(
        exportedSvg,
        "image/svg+xml",
      );
      const gridOpenTag =
        exportedSvg.match(/<g\b(?=[^>]*\bclass="network-grid")[^>]*>/)?.[0] ??
        "";
      const gridBlockStart =
        gridOpenTag.length > 0 ? exportedSvg.indexOf(gridOpenTag) : -1;
      const gridBlockEnd =
        gridBlockStart >= 0 ? exportedSvg.indexOf("</g>", gridBlockStart) : -1;
      const gridBlock =
        gridBlockStart >= 0 && gridBlockEnd > gridBlockStart
          ? exportedSvg.slice(gridBlockStart, gridBlockEnd)
          : "";
      const gridLineTags = gridBlock.match(/<line\b[^>]*>/g) ?? [];
      const getLineNumber = (tag: string, attribute: string): number =>
        Number(tag.match(new RegExp(`\\b${attribute}="([^"]+)"`))?.[1]);
      const transform =
        exportedDocument
          .querySelector(".network-grid")
          ?.getAttribute("transform") ||
        gridOpenTag.match(/\btransform="([^"]+)"/)?.[1] ||
        "";
      const transformMatch = transform.match(
        /^translate\(([^ )]+)\s+([^)]+)\)\s+scale\(([^)]+)\)$/,
      );
      if (transformMatch === null) {
        throw new Error("Expected exported SVG grid transform.");
      }
      const [, rawOffsetX, rawOffsetY, rawScale] = transformMatch;
      const offsetX = Number(rawOffsetX);
      const offsetY = Number(rawOffsetY);
      const scale = Number(rawScale);
      const svgOpenTag = exportedSvg.match(/<svg\b[^>]*>/)?.[0] ?? "";
      const viewBoxParts = (svgOpenTag.match(/\bviewBox="([^"]+)"/)?.[1] ?? "")
        .split(/\s+/)
        .map(Number);
      const width =
        viewBoxParts[2] ?? Number(svgOpenTag.match(/\bwidth="([^"]+)"/)?.[1]);
      const height =
        viewBoxParts[3] ?? Number(svgOpenTag.match(/\bheight="([^"]+)"/)?.[1]);
      const visibleMinX = (0 - offsetX) / scale;
      const visibleMaxX = (width - offsetX) / scale;
      const visibleMinY = (0 - offsetY) / scale;
      const visibleMaxY = (height - offsetY) / scale;
      const verticalXs = gridLineTags
        .filter(
          (line) => getLineNumber(line, "x1") === getLineNumber(line, "x2"),
        )
        .map((line) => getLineNumber(line, "x1"));
      const horizontalYs = gridLineTags
        .filter(
          (line) => getLineNumber(line, "y1") === getLineNumber(line, "y2"),
        )
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
        "Main network (Sample)",
        "NET-MAIN-SAMPLE",
        "2026-03-03T11:00:00.000Z",
        undefined,
        {
          createdAt: "2026-02-23T10:00:00.000Z",
          author: "Paul Mondou",
          projectCode: "PS5",
          exportNotes: "Short export notes.",
        },
      ),
    );

    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "createObjectURL",
    );
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "revokeObjectURL",
    );
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(() => "blob:svg-export-no-canvas-measure"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext");

    try {
      renderAppWithState(stateWithMetadata);
      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
      openExportMenu(networkSummaryPanel);
      await openSvgPreviewAndDownload(networkSummaryPanel);

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

  it("includes segment sheath callouts and mounting labels in the network summary SVG export", async () => {
    const baseState = createUiIntegrationState();
    let state = appReducer(
      baseState,
      appActions.upsertSegment({
        ...baseState.segments.byId[asSegmentId("SEG-A")],
        id: asSegmentId("SEG-A"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N-MID"),
        lengthMm: 40,
        sheathType: "CT5",
        insulation: "XLPE",
        lineStyle: "Braided",
        internalPartReference: "IP-42",
        mountingLabels: [
          {
            id: "ML-1" as never,
            text: "TAG-42",
            positionRatio: 0.5,
            offsetX: 0,
            offsetY: -8
          }
        ]
      })
    );
    state = appReducer(
      state,
      appActions.upsertNode({
        id: asNodeId("N10"),
        kind: "intermediate",
        label: "N10"
      })
    );
    state = appReducer(
      state,
      appActions.upsertSegment({
        ...state.segments.byId[asSegmentId("SEG-A")],
        id: asSegmentId("SEG-A"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N10"),
        lengthMm: 40,
        sheathType: "CT5",
        insulation: "XLPE",
        lineStyle: "Braided",
        internalPartReference: "IP-42",
        mountingLabels: [
          {
            id: "ML-1" as never,
            text: "TAG-42",
            positionRatio: 0.5,
            offsetX: 0,
            offsetY: -8
          }
        ]
      })
    );

    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    let capturedSvgBlob: Blob | null = null;
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn((value: Blob) => {
        capturedSvgBlob = value;
        return "blob:svg-export-segment-annotations";
      }),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    try {
      renderAppWithState(state);
      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
      openExportMenu(networkSummaryPanel);
      await openSvgPreviewAndDownload(networkSummaryPanel);

      await waitFor(() => {
        expect(capturedSvgBlob).not.toBeNull();
      });
      if (capturedSvgBlob === null) {
        throw new Error("Expected exported SVG blob.");
      }
      const exportedSvg = await readBlobAsText(capturedSvgBlob);
      expect(exportedSvg).toContain('class="network-segment-callout-frame"');
      expect(exportedSvg).toContain("Route:");
      expect(exportedSvg).toContain("Sheath");
      expect(exportedSvg).toContain("CT5");
      expect(exportedSvg).toContain("Insulation");
      expect(exportedSvg).toContain("XLPE");
      expect(exportedSvg).toContain("Line Style");
      expect(exportedSvg).toContain("Braided");
      expect(exportedSvg).toContain("Int Part");
      expect(exportedSvg).toContain("IP-42");
      expect(exportedSvg).toContain("40 mm");
      expect(exportedSvg).toContain('class="network-segment-mounting-label-frame"');
      expect(exportedSvg).toContain("TAG-42");
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

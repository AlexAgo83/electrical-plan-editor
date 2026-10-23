import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer } from "../store";
import {
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

describe("App integration UI - network summary SVG cartouche export", () => {
  beforeEach(() => {
    localStorage.clear();
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
        "Main network (Sample)",
        "NET-MAIN-SAMPLE",
        "2026-03-03T11:00:00.000Z",
        undefined,
        {
          createdAt: "2026-02-23T10:00:00.000Z",
          author: "Paul Mondou",
          projectCode: "PS5",
          planRevision: "B02",
          planIssueDate: "2026-10-22",
          exportNotes:
            "First design of the HVAC design in an independant harness for prototype testings.",
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
      return "blob:svg-export-readable-cartouche";
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
      renderAppWithState(stateWithMetadata);
      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
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
      expect(exportedSvg).toContain('class="network-export-cartouche-frame"');
      expect(exportedSvg).not.toContain('fill="rgb(0, 0, 0)"');
      expect(exportedSvg).not.toContain('fill="#000000"');
      expect(exportedSvg).toContain("Author: Paul Mondou");
      expect(exportedSvg).toContain("Revision: B02");
      expect(exportedSvg).toContain("Issue date: 2026-10-22");
      expect(exportedSvg).toContain("Created: ");
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

  it("exports the active network manufacturer and supplier references, fresh after edits and without mutating state", async () => {
    const baseState = createUiIntegrationState();
    const activeNetworkId = baseState.activeNetworkId;
    if (activeNetworkId === null) {
      throw new Error("Expected active network in integration state.");
    }
    const stateWithParties = appReducer(
      baseState,
      appActions.updateNetwork(activeNetworkId, "Main network (Sample)", "NET-MAIN-SAMPLE", "2026-03-03T11:00:00.000Z", undefined, {
        planManufacturerName: "Manufacturer A",
        planManufacturerReference: "MFG-001",
        planSupplierReference: "SUP-009"
      })
    );

    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    const capturedSvgBlobs: Blob[] = [];
    const createObjectUrl = vi.fn((value: Blob) => {
      capturedSvgBlobs.push(value);
      return "blob:svg-export-plan-parties";
    });
    Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: vi.fn() });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    try {
      const { store } = renderAppWithState(stateWithParties);
      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
      const networksBefore = store.getState().networks;
      openExportMenu(networkSummaryPanel);
      await openSvgPreviewAndDownload(networkSummaryPanel);
      await waitFor(() => expect(createObjectUrl).toHaveBeenCalledTimes(1));
      // Long rows wrap into tspans, so compare the cartouche text without markup or whitespace.
      const firstSvg = (await readBlobAsText(capturedSvgBlobs[0] as Blob)).replace(/<[^>]+>/g, "").replace(/\s/g, "");
      expect(firstSvg).toContain("Manufacturer(ManufacturerA):MFG-001");
      expect(firstSvg).toContain("Supplier:SUP-009");
      expect(store.getState().networks).toBe(networksBefore);

      const openPreview = screen.queryByRole("dialog", { name: "SVG preview" });
      if (openPreview !== null) {
        fireEvent.click(within(openPreview).getByRole("button", { name: "Cancel" }));
      }
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "SVG preview" })).toBeNull());
      act(() => {
        store.dispatch(
          appActions.updateNetwork(activeNetworkId, "Main network (Sample)", "NET-MAIN-SAMPLE", "2026-03-04T11:00:00.000Z", undefined, {
            planManufacturerName: "Manufacturer C",
            planManufacturerReference: "MFG-001",
            planSupplierReference: ""
          })
        );
      });
      openExportMenu(networkSummaryPanel);
      await openSvgPreviewAndDownload(networkSummaryPanel);
      await waitFor(() => expect(createObjectUrl).toHaveBeenCalledTimes(2));
      const secondSvg = (await readBlobAsText(capturedSvgBlobs[1] as Blob)).replace(/<[^>]+>/g, "").replace(/\s/g, "");
      expect(secondSvg).toContain("Manufacturer(ManufacturerC):MFG-001");
      expect(secondSvg).not.toContain("ManufacturerA");
      expect(secondSvg).not.toContain("SUP-009");
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
        "Main network (Sample)",
        "NET-MAIN-SAMPLE",
        "2026-03-03T11:00:00.000Z",
        undefined,
        {
          createdAt: "2026-03-01T10:00:00.000Z",
          logoUrl: dataUrlLogo,
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
      return "blob:svg-export-logo";
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
      renderAppWithState(stateWithLogo);
      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
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
      expect(exportedSvg).toContain("<image");
      expect(exportedSvg).toContain("data:image/png;base64");
      expect(exportedSvg).not.toContain("Logo indisponible");
      expect(exportedSvg).not.toContain(
        'class="network-export-cartouche-logo-frame"',
      );
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
      return "blob:svg-export-no-overlay";
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
      switchScreenDrawerAware("settings");
      const canvasToolsPanel = getPanelByHeading("Canvas tools preferences");
      fireEvent.click(
        within(canvasToolsPanel).getByLabelText(
          "Include identity cartouche in SVG/PNG export",
        ),
      );

      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
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

import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUiIntegrationState, getPanelByHeading, renderAppWithState, switchScreenDrawerAware } from "./helpers/app-ui-test-utils";

describe("App integration UI - settings canvas export", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function openExportMenu(panel: HTMLElement): void {
    const exportButton = within(panel).getByRole("button", { name: "Export" });
    if (!exportButton.classList.contains("is-active")) {
      fireEvent.click(exportButton);
    }
  }

  it("removes the export format setting and shows SVG plus PNG export actions", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const canvasToolsSettingsPanel = getPanelByHeading("Canvas tools preferences");
    expect(within(canvasToolsSettingsPanel).queryByLabelText("Export format")).not.toBeInTheDocument();
    switchScreenDrawerAware("analysis");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    openExportMenu(networkSummaryPanel);
    expect(within(networkSummaryPanel).getByRole("button", { name: "SVG" })).toBeInTheDocument();
    expect(within(networkSummaryPanel).getByRole("button", { name: "PNG" })).toBeInTheDocument();
  });

  it("opens a PNG preview before downloading the canvas export", async () => {
    const originalUserAgent = Object.getOwnPropertyDescriptor(Navigator.prototype, "userAgent");
    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    const originalImage = window.Image;
    const createObjectUrl = vi.fn(() => "blob:png-preview-source");
    const revokeObjectUrl = vi.fn();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((contextId: string) => {
      if (contextId !== "2d") {
        return null;
      }
      return {
        font: "",
        fillStyle: "",
        measureText: (text: string) => ({ width: text.length * 7.2 }),
        setTransform: vi.fn(),
        fillRect: vi.fn(),
        drawImage: vi.fn()
      } as unknown as CanvasRenderingContext2D;
    });
    const toDataUrlSpy = vi
      .spyOn<HTMLCanvasElement, "toDataURL">(HTMLCanvasElement.prototype, "toDataURL")
      .mockReturnValue("data:image/png;base64,preview");

    class MockImage {
      decoding = "async";
      onload: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;

      set src(_value: string) {
        window.setTimeout(() => this.onload?.(new Event("load")), 0);
      }
    }

    Object.defineProperty(Navigator.prototype, "userAgent", { configurable: true, value: "Chrome" });
    Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: revokeObjectUrl });
    Object.defineProperty(window, "Image", { configurable: true, writable: true, value: MockImage });
    vi.stubGlobal("Image", MockImage);

    try {
      renderAppWithState(createUiIntegrationState());
      switchScreenDrawerAware("analysis");
      const networkSummaryPanel = getPanelByHeading("Network summary");
      openExportMenu(networkSummaryPanel);
      fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "PNG" }));

      expect(await screen.findByRole("dialog", { name: "Preparing PNG preview" })).toBeInTheDocument();
      const previewDialog = await screen.findByRole("dialog", { name: "PNG preview" });
      const previewShell = within(previewDialog).getByLabelText("PNG export preview");
      const previewImage = previewShell.querySelector("img");
      expect(previewImage).not.toBeNull();
      expect(previewImage).toHaveAttribute("src", "data:image/png;base64,preview");
      expect(clickSpy).not.toHaveBeenCalled();

      fireEvent.click(within(previewDialog).getByRole("button", { name: "Download PNG" }));

      await waitFor(() => {
        expect(clickSpy).toHaveBeenCalledTimes(1);
      });
      expect(createObjectUrl).toHaveBeenCalledTimes(1);
      expect(revokeObjectUrl).toHaveBeenCalledWith("blob:png-preview-source");
    } finally {
      clickSpy.mockRestore();
      getContextSpy.mockRestore();
      toDataUrlSpy.mockRestore();
      vi.unstubAllGlobals();
      Object.defineProperty(window, "Image", { configurable: true, writable: true, value: originalImage });
      if (originalUserAgent !== undefined) {
        Object.defineProperty(Navigator.prototype, "userAgent", originalUserAgent);
      }
      if (originalCreateObjectUrl !== undefined) {
        Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
      }
      if (originalRevokeObjectUrl !== undefined) {
        Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectUrl);
      }
    }
  });
});

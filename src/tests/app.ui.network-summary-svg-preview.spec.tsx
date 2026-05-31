import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
} from "./helpers/app-ui-test-utils";
import { openExportMenu } from "./helpers/network-summary-export-test-utils";

describe("App integration UI - network summary SVG preview", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens SVG export in a preview dialog with fit and decoration toggles before downloading", async () => {
    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "createObjectURL",
    );
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "revokeObjectURL",
    );
    const createObjectUrl = vi.fn(() => "blob:svg-preview-options");
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
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    try {
      renderAppWithState(createUiIntegrationState());
      switchScreenDrawerAware("modeling");
      const networkSummaryPanel = getPanelByHeading("Network summary");
      openExportMenu(networkSummaryPanel);
      fireEvent.click(
        within(networkSummaryPanel).getByRole("button", { name: "SVG" }),
      );

      expect(
        await screen.findByRole("dialog", { name: "Preparing SVG preview" }),
      ).toBeInTheDocument();
      const previewDialog = await screen.findByRole("dialog", {
        name: "SVG preview",
      });
      expect(
        within(previewDialog).getByLabelText("SVG export preview"),
      ).toBeInTheDocument();
      const includeFrameToggle =
        within(previewDialog).getByLabelText("Include frame");
      const includeIdentityToggle =
        within(previewDialog).getByLabelText("Include identity");
      expect(includeFrameToggle).not.toBeChecked();
      expect(includeIdentityToggle).toBeChecked();
      expect(clickSpy).not.toHaveBeenCalled();

      const themeSelect = within(previewDialog).getByLabelText("Theme");
      expect(themeSelect).toHaveValue("warmBrown");
      fireEvent.change(themeSelect, { target: { value: "dark" } });
      await waitFor(() => {
        expect(within(previewDialog).getByLabelText("Theme")).toHaveValue(
          "dark",
        );
      });
      expect(previewDialog.parentElement).not.toHaveClass("theme-dark");
      expect(previewDialog.parentElement).toHaveClass("theme-warm-brown");
      const previewThemeHost = within(previewDialog)
        .getByLabelText("SVG export preview")
        .querySelector(".svg-preview-theme-host");
      expect(previewThemeHost).toHaveClass("theme-dark");
      const previewSvg = within(previewDialog)
        .getByLabelText("SVG export preview")
        .querySelector("svg");
      expect(previewSvg?.outerHTML).not.toContain("visibility: hidden");

      fireEvent.click(within(previewDialog).getByLabelText("Include frame"));
      await waitFor(() => {
        expect(
          within(previewDialog).getByLabelText("Include frame"),
        ).toBeChecked();
      });
      fireEvent.click(
        within(previewDialog).getByRole("button", { name: "Fit network" }),
      );
      expect(
        await screen.findByRole("dialog", { name: "SVG preview" }),
      ).toBeInTheDocument();
      fireEvent.click(
        within(previewDialog).getByRole("button", { name: "Download SVG" }),
      );

      await waitFor(() => {
        expect(clickSpy).toHaveBeenCalledTimes(1);
      });
      expect(createObjectUrl).toHaveBeenCalledTimes(1);
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

  it("toggles the network grid in the SVG export preview", async () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    openExportMenu(networkSummaryPanel);
    fireEvent.click(
      within(networkSummaryPanel).getByRole("button", { name: "SVG" }),
    );

    const previewDialog = await screen.findByRole("dialog", {
      name: "SVG preview",
    });
    const previewShell =
      within(previewDialog).getByLabelText("SVG export preview");
    expect(within(previewDialog).getByLabelText("Include grid")).toBeChecked();
    expect(previewShell.querySelector(".network-grid")).not.toBeNull();

    fireEvent.click(within(previewDialog).getByLabelText("Include grid"));
    await waitFor(() => {
      expect(previewShell.querySelector(".network-grid")).toBeNull();
    });
  });
});

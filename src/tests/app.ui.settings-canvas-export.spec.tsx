import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
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

  it("uses SVG export by default and persists canvas export format changes", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const canvasToolsSettingsPanel = getPanelByHeading("Canvas tools preferences");
    const exportFormatSelect = within(canvasToolsSettingsPanel).getByLabelText("Export format");
    expect(exportFormatSelect).toHaveValue("svg");
    switchScreenDrawerAware("analysis");
    let networkSummaryPanel = getPanelByHeading("Network summary");
    openExportMenu(networkSummaryPanel);
    expect(within(networkSummaryPanel).getByRole("button", { name: "SVG" })).toBeInTheDocument();
    switchScreenDrawerAware("settings");
    fireEvent.change(within(getPanelByHeading("Canvas tools preferences")).getByLabelText("Export format"), {
      target: { value: "png" }
    });
    switchScreenDrawerAware("analysis");
    networkSummaryPanel = getPanelByHeading("Network summary");
    openExportMenu(networkSummaryPanel);
    expect(within(networkSummaryPanel).getByRole("button", { name: "PNG" })).toBeInTheDocument();
    firstRender.unmount();
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    expect(within(getPanelByHeading("Canvas tools preferences")).getByLabelText("Export format")).toHaveValue("png");
  });
});

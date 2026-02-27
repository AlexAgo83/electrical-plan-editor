import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer } from "../store";
import { asNodeId, createUiIntegrationState, getPanelByHeading, renderAppWithState, switchScreenDrawerAware } from "./helpers/app-ui-test-utils";

describe("App integration UI - settings canvas render", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("applies and persists 2d label size and rotation preferences", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas render preferences");
    fireEvent.change(within(canvasSettingsPanel).getByLabelText("2D label size"), {
      target: { value: "large" }
    });
    fireEvent.change(within(canvasSettingsPanel).getByLabelText("2D label rotation"), {
      target: { value: "45" }
    });

    switchScreenDrawerAware("analysis");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram");
    expect(networkSvg).toHaveClass("network-canvas--label-size-large");

    const segmentLabelAnchor = networkSummaryPanel.querySelector(".network-segment-label-anchor");
    const segmentLabel = networkSummaryPanel.querySelector(".network-segment-label-anchor .network-segment-label");
    expect(segmentLabelAnchor).not.toBeNull();
    expect(segmentLabel).not.toBeNull();
    expect(segmentLabel?.getAttribute("transform")).toContain("rotate(45");

    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const restoredCanvasSettingsPanel = getPanelByHeading("Canvas render preferences");
    expect(within(restoredCanvasSettingsPanel).getByLabelText("2D label size")).toHaveValue("large");
    expect(within(restoredCanvasSettingsPanel).getByLabelText("2D label rotation")).toHaveValue("45");
  });

  it("auto-rotates segment labels with segment angle when enabled and persists the preference", () => {
    const positionedState = appReducer(
      createUiIntegrationState(),
      appActions.setNodePositions({
        [asNodeId("N-C1")]: { x: 40, y: 40 },
        [asNodeId("N-MID")]: { x: 160, y: 140 },
        [asNodeId("N-S1")]: { x: 300, y: 100 }
      })
    );
    const firstRender = renderAppWithState(positionedState);

    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas render preferences");
    fireEvent.change(within(canvasSettingsPanel).getByLabelText("2D label rotation"), {
      target: { value: "0" }
    });
    const autoRotationSelect = within(canvasSettingsPanel).getByLabelText("Auto segment label rotation");
    expect(autoRotationSelect).toHaveValue("no");

    switchScreenDrawerAware("analysis");
    let networkSummaryPanel = getPanelByHeading("Network summary");
    const segmentLabelWithoutAutoRotation = Array.from(networkSummaryPanel.querySelectorAll(".network-segment-label")).find(
      (label) => label.textContent?.trim() === "SEG-A"
    );
    expect(segmentLabelWithoutAutoRotation).not.toBeNull();
    expect(segmentLabelWithoutAutoRotation?.getAttribute("transform")).toBeNull();

    switchScreenDrawerAware("settings");
    fireEvent.change(within(getPanelByHeading("Canvas render preferences")).getByLabelText("Auto segment label rotation"), {
      target: { value: "yes" }
    });

    switchScreenDrawerAware("analysis");
    networkSummaryPanel = getPanelByHeading("Network summary");
    const segmentLabel = Array.from(networkSummaryPanel.querySelectorAll(".network-segment-label")).find(
      (label) => label.textContent?.trim() === "SEG-A"
    );
    expect(segmentLabel).not.toBeNull();
    expect(segmentLabel?.getAttribute("transform")).toContain("rotate(");
    expect(segmentLabel?.getAttribute("transform")).not.toContain("rotate(0");

    switchScreenDrawerAware("settings");
    expect(within(getPanelByHeading("Canvas render preferences")).getByLabelText("Auto segment label rotation")).toHaveValue(
      "yes"
    );

    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const restoredCanvasSettingsPanel = getPanelByHeading("Canvas render preferences");
    expect(within(restoredCanvasSettingsPanel).getByLabelText("Auto segment label rotation")).toHaveValue("yes");

    fireEvent.change(within(restoredCanvasSettingsPanel).getByLabelText("Auto segment label rotation"), {
      target: { value: "no" }
    });
    switchScreenDrawerAware("analysis");
    networkSummaryPanel = getPanelByHeading("Network summary");
    const restoredSegmentLabelWithoutAutoRotation = Array.from(networkSummaryPanel.querySelectorAll(".network-segment-label")).find(
      (label) => label.textContent?.trim() === "SEG-A"
    );
    expect(restoredSegmentLabelWithoutAutoRotation).not.toBeNull();
    expect(restoredSegmentLabelWithoutAutoRotation?.getAttribute("transform")).toBeNull();
  });

  it("overrides custom segment label rotation when auto segment label rotation is enabled", () => {
    const positionedState = appReducer(
      createUiIntegrationState(),
      appActions.setNodePositions({
        [asNodeId("N-C1")]: { x: 40, y: 80 },
        [asNodeId("N-MID")]: { x: 220, y: 80 },
        [asNodeId("N-S1")]: { x: 360, y: 180 }
      })
    );
    renderAppWithState(positionedState);

    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas render preferences");
    fireEvent.change(within(canvasSettingsPanel).getByLabelText("2D label rotation"), {
      target: { value: "45" }
    });

    switchScreenDrawerAware("analysis");
    let networkSummaryPanel = getPanelByHeading("Network summary");
    let segmentLabel = Array.from(networkSummaryPanel.querySelectorAll(".network-segment-label")).find(
      (label) => label.textContent?.trim() === "SEG-A"
    );
    expect(segmentLabel).not.toBeNull();
    expect(segmentLabel?.getAttribute("transform")).toContain("rotate(45");

    switchScreenDrawerAware("settings");
    fireEvent.change(within(getPanelByHeading("Canvas render preferences")).getByLabelText("Auto segment label rotation"), {
      target: { value: "yes" }
    });

    switchScreenDrawerAware("analysis");
    networkSummaryPanel = getPanelByHeading("Network summary");
    segmentLabel = Array.from(networkSummaryPanel.querySelectorAll(".network-segment-label")).find(
      (label) => label.textContent?.trim() === "SEG-A"
    );
    expect(segmentLabel).not.toBeNull();
    expect(segmentLabel?.getAttribute("transform")).toBeNull();
  });

  it("uses normal callout text size by default and updates the network callout text size class from settings", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas render preferences");
    const calloutTextSizeSelect = within(canvasSettingsPanel).getByLabelText("Callout text size");
    const labelRotationSelect = within(canvasSettingsPanel).getByLabelText("2D label rotation");
    expect(calloutTextSizeSelect).toHaveValue("normal");
    expect(labelRotationSelect).toHaveValue("0");

    switchScreenDrawerAware("analysis");
    let networkSummaryPanel = getPanelByHeading("Network summary");
    let networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram");
    expect(networkSvg).toHaveClass("network-callout-text-size-normal");

    switchScreenDrawerAware("settings");
    fireEvent.change(within(getPanelByHeading("Canvas render preferences")).getByLabelText("Callout text size"), {
      target: { value: "small" }
    });

    switchScreenDrawerAware("analysis");
    networkSummaryPanel = getPanelByHeading("Network summary");
    networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram");
    expect(networkSvg).toHaveClass("network-callout-text-size-small");
  });

  it("persists png export background toggle and supports negative 2d label rotation presets", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const canvasRenderSettingsPanel = getPanelByHeading("Canvas render preferences");
    const canvasToolsSettingsPanel = getPanelByHeading("Canvas tools preferences");
    expect(within(canvasToolsSettingsPanel).getByLabelText("Include background in PNG export")).toBeChecked();
    fireEvent.change(within(canvasRenderSettingsPanel).getByLabelText("2D label rotation"), {
      target: { value: "-45" }
    });
    fireEvent.click(within(canvasToolsSettingsPanel).getByLabelText("Include background in PNG export"));

    switchScreenDrawerAware("analysis");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    const segmentLabel = networkSummaryPanel.querySelector(".network-segment-label-anchor .network-segment-label");
    expect(segmentLabel?.getAttribute("transform")).toContain("rotate(-45");

    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const restoredCanvasRenderSettingsPanel = getPanelByHeading("Canvas render preferences");
    const restoredCanvasToolsSettingsPanel = getPanelByHeading("Canvas tools preferences");
    expect(within(restoredCanvasRenderSettingsPanel).getByLabelText("2D label rotation")).toHaveValue("-45");
    expect(within(restoredCanvasToolsSettingsPanel).getByLabelText("Include background in PNG export")).not.toBeChecked();
  });

  it("persists the 0 degree 2d label rotation preset across remount", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const canvasRenderSettingsPanel = getPanelByHeading("Canvas render preferences");
    fireEvent.change(within(canvasRenderSettingsPanel).getByLabelText("2D label rotation"), {
      target: { value: "0" }
    });

    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const restoredCanvasRenderSettingsPanel = getPanelByHeading("Canvas render preferences");
    expect(within(restoredCanvasRenderSettingsPanel).getByLabelText("2D label rotation")).toHaveValue("0");
  });

  it("applies and persists the default cable callout visibility preference", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
    const defaultCalloutCheckbox = within(canvasSettingsPanel).getByLabelText(
      "Show connector/splice cable callouts by default"
    );

    expect(defaultCalloutCheckbox).not.toBeChecked();
    fireEvent.click(defaultCalloutCheckbox);
    fireEvent.click(within(canvasSettingsPanel).getByRole("button", { name: "Apply canvas defaults now" }));

    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    expect(within(networkSummaryPanel).getByRole("button", { name: "Callouts" })).toHaveClass("is-active");

    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const restoredCanvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
    expect(
      within(restoredCanvasSettingsPanel).getByLabelText("Show connector/splice cable callouts by default")
    ).toBeChecked();
  });
});

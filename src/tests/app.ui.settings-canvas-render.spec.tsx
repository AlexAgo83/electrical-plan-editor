import { fireEvent, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asNodeId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";
describe("App integration UI - settings canvas render", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function ensureSegmentNamesEnabledFromSettings(): void {
    const canvasToolsPanel = getPanelByHeading("Canvas tools preferences");
    const segmentNamesToggle = within(canvasToolsPanel).getByLabelText("Show segment names");
    if (!(segmentNamesToggle instanceof HTMLInputElement)) {
      throw new Error("Expected Show segment names toggle to be an input element.");
    }
    if (!segmentNamesToggle.checked) {
      fireEvent.click(segmentNamesToggle);
    }
  }

  it("applies and persists 2d label size and rotation preferences", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas render preferences");
    ensureSegmentNamesEnabledFromSettings();
    fireEvent.change(within(canvasSettingsPanel).getByLabelText("Auto segment label rotation"), {
      target: { value: "no" }
    });
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
  it("renders auto segment label rotation before 2d label rotation and disables manual rotation while auto is enabled", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas render preferences");
    const autoRotationSelect = within(canvasSettingsPanel).getByLabelText("Auto segment label rotation");
    const labelRotationSelect = within(canvasSettingsPanel).getByLabelText("2D label rotation");
    const position = autoRotationSelect.compareDocumentPosition(labelRotationSelect);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(labelRotationSelect).toBeDisabled();
    fireEvent.change(autoRotationSelect, {
      target: { value: "no" }
    });
    expect(labelRotationSelect).toBeEnabled();
  });
  it(
    "auto-rotates segment labels with segment angle when enabled and persists the preference",
    () => {
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
      ensureSegmentNamesEnabledFromSettings();
      const autoRotationSelect = within(canvasSettingsPanel).getByLabelText("Auto segment label rotation");
      expect(autoRotationSelect).toHaveValue("yes");
      fireEvent.change(autoRotationSelect, {
        target: { value: "no" }
      });
      switchScreenDrawerAware("analysis");
      let networkSummaryPanel = getPanelByHeading("Network summary");
      const segmentLabelWithoutAutoRotation = Array.from(networkSummaryPanel.querySelectorAll(".network-segment-label")).find(
        (label) => label.textContent?.trim() === "SEG-A"
      );
      expect(segmentLabelWithoutAutoRotation).not.toBeNull();
      expect(segmentLabelWithoutAutoRotation?.getAttribute("transform") ?? null).toBeNull();
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
      expect(restoredSegmentLabelWithoutAutoRotation?.getAttribute("transform") ?? null).toBeNull();
    },
    10_000
  );
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
    ensureSegmentNamesEnabledFromSettings();
    fireEvent.change(within(canvasSettingsPanel).getByLabelText("Auto segment label rotation"), {
      target: { value: "no" }
    });
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
  it("keeps segment ID and length labels separated on vertical segments when auto rotation is enabled", () => {
    const positionedState = appReducer(
      createUiIntegrationState(),
      appActions.setNodePositions({
        [asNodeId("N-C1")]: { x: 40, y: 80 },
        [asNodeId("N-MID")]: { x: 220, y: 80 },
        [asNodeId("N-S1")]: { x: 220, y: 260 }
      })
    );
    renderAppWithState(positionedState);
    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas render preferences");
    ensureSegmentNamesEnabledFromSettings();
    fireEvent.change(within(canvasSettingsPanel).getByLabelText("Auto segment label rotation"), {
      target: { value: "yes" }
    });
    switchScreenDrawerAware("analysis");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    const lengthToggle = within(networkSummaryPanel).getByRole("button", { name: "Length" });
    if (!lengthToggle.classList.contains("is-active")) {
      fireEvent.click(lengthToggle);
    }
    expect(lengthToggle).toHaveClass("is-active");
    const segmentLabelGroup = networkSummaryPanel.querySelector(".network-graph-layer-labels [data-segment-id='SEG-B']");
    expect(segmentLabelGroup).not.toBeNull();
    const segmentIdLabel = segmentLabelGroup?.querySelector(".network-segment-label");
    const segmentLengthLabel = segmentLabelGroup?.querySelector(".network-segment-length-label");
    expect(segmentIdLabel).not.toBeNull();
    expect(segmentLengthLabel).not.toBeNull();
    const segmentIdX = Number(segmentIdLabel?.getAttribute("x"));
    const segmentIdY = Number(segmentIdLabel?.getAttribute("y"));
    const segmentLengthX = Number(segmentLengthLabel?.getAttribute("x"));
    const segmentLengthY = Number(segmentLengthLabel?.getAttribute("y"));
    expect(Math.abs(segmentIdX)).toBeGreaterThan(0.5);
    expect(Math.abs(segmentLengthX)).toBeGreaterThan(0.5);
    expect(Math.abs(segmentIdY)).toBeLessThan(1.5);
    expect(Math.abs(segmentLengthY)).toBeLessThan(1.5);
    expect(Math.sign(segmentIdX)).toBe(-Math.sign(segmentLengthX));
  });
  it("hides segment names immediately while keeping segment lengths visible", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("analysis");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    const lengthToggle = within(networkSummaryPanel).getByRole("button", { name: "Length" });
    if (!lengthToggle.classList.contains("is-active")) {
      fireEvent.click(lengthToggle);
    }
    expect(networkSummaryPanel.querySelectorAll(".network-segment-label")).toHaveLength(0);
    expect(networkSummaryPanel.querySelectorAll(".network-segment-length-label").length).toBeGreaterThan(0);
    firstRender.unmount();
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const restoredCanvasToolsSettingsPanel = getPanelByHeading("Canvas tools preferences");
    expect(within(restoredCanvasToolsSettingsPanel).getByLabelText("Show segment names")).not.toBeChecked();
    expect(within(restoredCanvasToolsSettingsPanel).getByLabelText("Show segment lengths by default")).toBeChecked();
  });
  it("uses normal callout text size by default and updates the network callout text size class from settings", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas render preferences");
    const calloutTextSizeSelect = within(canvasSettingsPanel).getByLabelText("Callout text size");
    const labelStrokeModeSelect = within(canvasSettingsPanel).getByLabelText("Label stroke mode");
    const labelSizeSelect = within(canvasSettingsPanel).getByLabelText("2D label size");
    const labelRotationSelect = within(canvasSettingsPanel).getByLabelText("2D label rotation");
    const autoRotationSelect = within(canvasSettingsPanel).getByLabelText("Auto segment label rotation");
    expect(calloutTextSizeSelect).toHaveValue("normal");
    expect(labelStrokeModeSelect).toHaveValue("light");
    expect(labelSizeSelect).toHaveValue("small");
    expect(autoRotationSelect).toHaveValue("yes");
    expect(labelRotationSelect).toHaveValue("0");
    expect(labelRotationSelect).toBeDisabled();
    switchScreenDrawerAware("analysis");
    let networkSummaryPanel = getPanelByHeading("Network summary");
    let networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram");
    expect(networkSvg).toHaveClass("network-canvas--label-stroke-light");
    expect(networkSvg).toHaveClass("network-canvas--label-size-small");
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
    ensureSegmentNamesEnabledFromSettings();
    expect(within(canvasToolsSettingsPanel).getByLabelText("Include background in PNG export")).toBeChecked();
    fireEvent.change(within(canvasRenderSettingsPanel).getByLabelText("Auto segment label rotation"), {
      target: { value: "no" }
    });
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
  it("uses SVG export by default and persists canvas export format changes", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const canvasToolsSettingsPanel = getPanelByHeading("Canvas tools preferences");
    const exportFormatSelect = within(canvasToolsSettingsPanel).getByLabelText("Export format");
    expect(exportFormatSelect).toHaveValue("svg");
    switchScreenDrawerAware("analysis");
    let networkSummaryPanel = getPanelByHeading("Network summary");
    expect(within(networkSummaryPanel).getByRole("button", { name: "SVG" })).toBeInTheDocument();
    switchScreenDrawerAware("settings");
    fireEvent.change(within(getPanelByHeading("Canvas tools preferences")).getByLabelText("Export format"), {
      target: { value: "png" }
    });
    switchScreenDrawerAware("analysis");
    networkSummaryPanel = getPanelByHeading("Network summary");
    expect(within(networkSummaryPanel).getByRole("button", { name: "PNG" })).toBeInTheDocument();
    firstRender.unmount();
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    expect(within(getPanelByHeading("Canvas tools preferences")).getByLabelText("Export format")).toHaveValue("png");
  });
  it("persists export frame and cartouche visibility toggles with expected defaults", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const canvasToolsSettingsPanel = getPanelByHeading("Canvas tools preferences");
    const frameToggle = within(canvasToolsSettingsPanel).getByLabelText("Include frame in SVG/PNG export");
    const cartoucheToggle = within(canvasToolsSettingsPanel).getByLabelText("Include identity cartouche in SVG/PNG export");
    expect(frameToggle).not.toBeChecked();
    expect(cartoucheToggle).toBeChecked();

    fireEvent.click(frameToggle);
    fireEvent.click(cartoucheToggle);
    expect(frameToggle).toBeChecked();
    expect(cartoucheToggle).not.toBeChecked();

    firstRender.unmount();
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const restoredPanel = getPanelByHeading("Canvas tools preferences");
    expect(within(restoredPanel).getByLabelText("Include frame in SVG/PNG export")).toBeChecked();
    expect(within(restoredPanel).getByLabelText("Include identity cartouche in SVG/PNG export")).not.toBeChecked();
  });
  it("keeps the canvas resize behavior locked to visible-area-only mode and updates network summary viewport on resize", async () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas render preferences");
    const resizeBehaviorSelect = within(canvasSettingsPanel).getByLabelText("Viewport resize behavior");
    expect(resizeBehaviorSelect).toHaveValue("visibleAreaOnly");
    expect(resizeBehaviorSelect).toBeDisabled();
    switchScreenDrawerAware("analysis");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram");
    expect(networkSvg).toHaveClass("network-svg--stroke-invariant");
    Object.defineProperty(networkSvg, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        width: 1011,
        height: 577,
        left: 0,
        top: 0,
        right: 1011,
        bottom: 577,
        x: 0,
        y: 0,
        toJSON: () => ({})
      })
    });
    fireEvent(window, new Event("resize"));
    await waitFor(() => {
      expect(networkSvg.getAttribute("viewBox")).toBe("0 0 1011 577");
    });
    firstRender.unmount();
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    expect(within(getPanelByHeading("Canvas render preferences")).getByLabelText("Viewport resize behavior")).toHaveValue(
      "visibleAreaOnly"
    );
  });
  it("toggles wire-name column visibility in callout tables from settings", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const canvasToolsSettingsPanel = getPanelByHeading("Canvas tools preferences");
    const wireNamesToggle = within(canvasToolsSettingsPanel).getByLabelText("Show wire names in callout table");
    expect(wireNamesToggle).not.toBeChecked();
    switchScreenDrawerAware("analysis");
    let networkSummaryPanel = getPanelByHeading("Network summary");
    const firstCalloutsToggle = within(networkSummaryPanel).getByRole("button", { name: "Callouts" });
    if (!firstCalloutsToggle.classList.contains("is-active")) {
      fireEvent.click(firstCalloutsToggle);
    }
    expect(within(networkSummaryPanel).queryByText("Wire name")).toBeNull();
    switchScreenDrawerAware("settings");
    fireEvent.click(within(getPanelByHeading("Canvas tools preferences")).getByLabelText("Show wire names in callout table"));
    switchScreenDrawerAware("analysis");
    networkSummaryPanel = getPanelByHeading("Network summary");
    const secondCalloutsToggle = within(networkSummaryPanel).getByRole("button", { name: "Callouts" });
    if (!secondCalloutsToggle.classList.contains("is-active")) {
      fireEvent.click(secondCalloutsToggle);
    }
    expect(within(networkSummaryPanel).queryAllByText("Wire name").length).toBeGreaterThan(0);
    firstRender.unmount();
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    expect(within(getPanelByHeading("Canvas tools preferences")).getByLabelText("Show wire names in callout table")).toBeChecked();
  });
  it("supports zoom-invariant node shapes and scales segment/callout strokes from canvas tool settings", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("analysis");
    let networkSummaryPanel = getPanelByHeading("Network summary");
    expect(networkSummaryPanel.querySelector(".network-node-shape-anchor")).not.toBeNull();
    const networkSvgBefore = networkSummaryPanel.querySelector<SVGSVGElement>(".network-svg");
    expect(networkSvgBefore).not.toBeNull();
    if (networkSvgBefore === null) throw new Error("Expected network SVG before settings update.");
    const connectorShapeBefore = networkSummaryPanel.querySelector("g.network-node.connector .network-node-shape");
    expect(connectorShapeBefore).not.toBeNull();
    const connectorWidthBefore = Number(connectorShapeBefore?.getAttribute("width") ?? "0");
    expect(connectorWidthBefore).toBeGreaterThan(0);
    const segmentStrokeWidthBefore = Number.parseFloat(networkSvgBefore.style.getPropertyValue("--network-segment-stroke-width"));
    const calloutLeaderStrokeWidthBefore = Number.parseFloat(
      networkSvgBefore.style.getPropertyValue("--network-callout-leader-stroke-width")
    );
    expect(segmentStrokeWidthBefore).toBeGreaterThan(0);
    expect(calloutLeaderStrokeWidthBefore).toBeGreaterThan(0);
    switchScreenDrawerAware("settings");
    const canvasToolsSettingsPanel = getPanelByHeading("Canvas tools preferences");
    const nodeShapeSizeSlider = within(canvasToolsSettingsPanel).getByRole("slider", {
      name: /Node shape target size/i
    });
    expect(nodeShapeSizeSlider).toHaveValue("70");
    expect(nodeShapeSizeSlider).toBeEnabled();
    fireEvent.change(nodeShapeSizeSlider, { target: { value: "125" } });
    expect(nodeShapeSizeSlider).toHaveValue("125");
    switchScreenDrawerAware("analysis");
    networkSummaryPanel = getPanelByHeading("Network summary");
    const invariantAnchor = networkSummaryPanel.querySelector(".network-node-shape-anchor");
    expect(invariantAnchor).not.toBeNull();
    const connectorShapeAfter = networkSummaryPanel.querySelector("g.network-node.connector .network-node-shape");
    expect(connectorShapeAfter).not.toBeNull();
    const connectorWidthAfter = Number(connectorShapeAfter?.getAttribute("width") ?? "0");
    expect(connectorWidthAfter).toBeGreaterThan(connectorWidthBefore);
    const networkSvgAfter = networkSummaryPanel.querySelector<SVGSVGElement>(".network-svg");
    expect(networkSvgAfter).not.toBeNull();
    if (networkSvgAfter === null) throw new Error("Expected network SVG after settings update.");
    const segmentStrokeWidthAfter = Number.parseFloat(networkSvgAfter.style.getPropertyValue("--network-segment-stroke-width"));
    const calloutLeaderStrokeWidthAfter = Number.parseFloat(networkSvgAfter.style.getPropertyValue("--network-callout-leader-stroke-width"));
    expect(segmentStrokeWidthAfter).toBeGreaterThan(segmentStrokeWidthBefore);
    expect(calloutLeaderStrokeWidthAfter).toBeGreaterThan(calloutLeaderStrokeWidthBefore);
    const transformBeforeZoom = invariantAnchor?.getAttribute("transform") ?? "";
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Zoom +" }));
    const transformAfterZoom = networkSummaryPanel.querySelector(".network-node-shape-anchor")?.getAttribute("transform") ?? "";
    expect(transformAfterZoom).not.toBe(transformBeforeZoom);
    firstRender.unmount();
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const restoredCanvasToolsSettingsPanel = getPanelByHeading("Canvas tools preferences");
    expect(
      within(restoredCanvasToolsSettingsPanel).getByLabelText(
        "Keep connector/splice/node shape size constant while zooming"
      )
    ).toBeChecked();
    expect(
      within(restoredCanvasToolsSettingsPanel).getByRole("slider", {
        name: /Node shape target size/i
      })
    ).toHaveValue("125");
  });
  it("persists the 0 degree 2d label rotation preset across remount", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const canvasRenderSettingsPanel = getPanelByHeading("Canvas render preferences");
    fireEvent.change(within(canvasRenderSettingsPanel).getByLabelText("Auto segment label rotation"), {
      target: { value: "no" }
    });
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
    firstRender.unmount();
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    expect(within(networkSummaryPanel).getByRole("button", { name: "Callouts" })).toHaveClass("is-active");
    switchScreenDrawerAware("settings");
    const restoredCanvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
    expect(
      within(restoredCanvasSettingsPanel).getByLabelText("Show connector/splice cable callouts by default")
    ).toBeChecked();
  });
});

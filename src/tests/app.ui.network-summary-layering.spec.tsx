import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

function openViewMenu(panel: HTMLElement): void {
  const viewButton = within(panel).getByRole("button", { name: "View" });
  if (viewButton.getAttribute("aria-expanded") !== "true") {
    fireEvent.click(viewButton);
  }
}

function getTransformScale(transform: string): number {
  const match = /scale\(([^)]+)\)/.exec(transform);
  if (match === null) {
    throw new Error(`Expected transform to include a scale(): ${transform}`);
  }
  return Number(match[1]);
}

describe("App integration UI - network summary layering", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function enableSegmentNamesFromSettings(): void {
    switchScreenDrawerAware("settings");
    const canvasToolsPanel = getPanelByHeading("Canvas tools preferences");
    const segmentNamesToggle = within(canvasToolsPanel).getByLabelText("Show segment names");
    if (!(segmentNamesToggle instanceof HTMLInputElement)) {
      throw new Error("Expected Show segment names toggle to be an input element.");
    }
    if (!segmentNamesToggle.checked) {
      fireEvent.click(segmentNamesToggle);
    }
  }

  it("renders labels in a dedicated SVG layer after segment and node geometry", () => {
    renderAppWithState(createUiIntegrationState());
    enableSegmentNamesFromSettings();
    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const diagram = within(networkSummaryPanel).getByLabelText("2D network diagram");
    const segmentLayer = diagram.querySelector(".network-graph-layer-segments");
    const nodeLayer = diagram.querySelector(".network-graph-layer-nodes");
    const labelLayer = diagram.querySelector(".network-graph-layer-labels");

    expect(segmentLayer).not.toBeNull();
    expect(nodeLayer).not.toBeNull();
    expect(labelLayer).not.toBeNull();

    const topLevelGroups = Array.from(diagram.children);
    expect(topLevelGroups.indexOf(segmentLayer as Element)).toBeGreaterThan(-1);
    expect(topLevelGroups.indexOf(nodeLayer as Element)).toBeGreaterThan(-1);
    expect(topLevelGroups.indexOf(labelLayer as Element)).toBeGreaterThan(-1);
    expect(topLevelGroups.indexOf(labelLayer as Element)).toBeGreaterThan(topLevelGroups.indexOf(segmentLayer as Element));
    expect(topLevelGroups.indexOf(labelLayer as Element)).toBeGreaterThan(topLevelGroups.indexOf(nodeLayer as Element));

    expect(labelLayer?.querySelector(".network-segment-label")).not.toBeNull();
    expect(labelLayer?.querySelector(".network-node-label")).not.toBeNull();
    expect(labelLayer?.querySelector(".network-segment")).toBeNull();
    expect(labelLayer?.querySelector(".network-node")).toBeNull();
  });

  it("keeps 2D labels zoom-invariant using inverse-scale label anchors", () => {
    renderAppWithState(createUiIntegrationState());
    enableSegmentNamesFromSettings();
    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const labelLayer = networkSummaryPanel.querySelector(".network-graph-layer-labels");
    const anchorBefore = networkSummaryPanel.querySelector(".network-segment-label-anchor");
    expect(labelLayer).not.toBeNull();
    expect(anchorBefore).not.toBeNull();
    const layerScaleBefore = getTransformScale(labelLayer?.getAttribute("transform") ?? "");
    const transformBefore = anchorBefore?.getAttribute("transform") ?? "";
    expect(layerScaleBefore * getTransformScale(transformBefore)).toBeCloseTo(1, 5);

    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Zoom in" }));

    const labelLayerAfter = networkSummaryPanel.querySelector(".network-graph-layer-labels");
    const anchorAfter = networkSummaryPanel.querySelector(".network-segment-label-anchor");
    expect(labelLayerAfter).not.toBeNull();
    expect(anchorAfter).not.toBeNull();
    const layerScaleAfter = getTransformScale(labelLayerAfter?.getAttribute("transform") ?? "");
    const transformAfter = anchorAfter?.getAttribute("transform") ?? "";
    expect(transformAfter).not.toBe(transformBefore);
    expect(layerScaleAfter * getTransformScale(transformAfter)).toBeCloseTo(1, 5);
  });

  it("keeps segment ID labels offset from the stroke even when segment lengths are hidden", () => {
    renderAppWithState(createUiIntegrationState());
    enableSegmentNamesFromSettings();
    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    const lengthToggleButton = within(networkSummaryPanel).getByRole("button", { name: "Length" });
    if (lengthToggleButton.classList.contains("is-active")) {
      fireEvent.click(lengthToggleButton);
    }

    const segmentIdLabel = networkSummaryPanel.querySelector(".network-segment-label");
    expect(segmentIdLabel).not.toBeNull();
    expect(segmentIdLabel?.getAttribute("y")).not.toBe("0");
    expect(networkSummaryPanel.querySelector(".network-segment-length-label")).toBeNull();
  });
});

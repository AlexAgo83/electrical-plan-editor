import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer } from "../store";
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

  it("renders segment labels behind nodes and node labels above node geometry", () => {
    renderAppWithState(createUiIntegrationState());
    enableSegmentNamesFromSettings();
    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const diagram = within(networkSummaryPanel).getByLabelText("2D network diagram");
    const segmentLayer = diagram.querySelector(".network-graph-layer-segments");
    const nodeLayer = diagram.querySelector(".network-graph-layer-nodes");
    const segmentLabelLayer = diagram.querySelector(".network-graph-layer-segment-labels");
    const nodeLabelLayer = diagram.querySelector(".network-graph-layer-node-labels");
    const physicalConnectorNodeLayer = diagram.querySelector(".network-graph-layer-physical-connector-nodes");

    expect(segmentLayer).not.toBeNull();
    expect(nodeLayer).not.toBeNull();
    expect(segmentLabelLayer).not.toBeNull();
    expect(nodeLabelLayer).not.toBeNull();
    expect(physicalConnectorNodeLayer).not.toBeNull();

    const topLevelGroups = Array.from(diagram.children);
    expect(topLevelGroups.indexOf(segmentLayer as Element)).toBeGreaterThan(-1);
    expect(topLevelGroups.indexOf(nodeLayer as Element)).toBeGreaterThan(-1);
    expect(topLevelGroups.indexOf(segmentLabelLayer as Element)).toBeGreaterThan(-1);
    expect(topLevelGroups.indexOf(nodeLabelLayer as Element)).toBeGreaterThan(-1);
    expect(topLevelGroups.indexOf(physicalConnectorNodeLayer as Element)).toBeGreaterThan(-1);
    expect(topLevelGroups.indexOf(segmentLabelLayer as Element)).toBeGreaterThan(topLevelGroups.indexOf(segmentLayer as Element));
    expect(topLevelGroups.indexOf(segmentLabelLayer as Element)).toBeLessThan(topLevelGroups.indexOf(nodeLayer as Element));
    expect(topLevelGroups.indexOf(nodeLabelLayer as Element)).toBeGreaterThan(topLevelGroups.indexOf(nodeLayer as Element));
    expect(topLevelGroups.indexOf(nodeLabelLayer as Element)).toBeLessThan(topLevelGroups.indexOf(physicalConnectorNodeLayer as Element));

    expect(segmentLabelLayer?.querySelector(".network-segment-label")).not.toBeNull();
    expect(segmentLabelLayer?.querySelector(".network-node-label")).toBeNull();
    expect(nodeLabelLayer?.querySelector(".network-node-label")).not.toBeNull();
    expect(nodeLabelLayer?.querySelector(".network-segment-label")).toBeNull();
    expect(segmentLabelLayer?.querySelector(".network-segment")).toBeNull();
    expect(nodeLabelLayer?.querySelector(".network-node")).toBeNull();
  });

  it("renders segment callouts in the callout hierarchy above graph nodes", () => {
    const baseState = createUiIntegrationState();
    const firstSegmentId = baseState.segments.allIds[0];
    const segment = firstSegmentId === undefined ? undefined : baseState.segments.byId[firstSegmentId];
    if (segment === undefined) {
      throw new Error("Expected at least one segment in base integration state.");
    }
    const stateWithSheath = appReducer(
      baseState,
      appActions.upsertSegment({
        ...segment,
        sheathType: "Fixed Tube",
        insulation: "XLPE",
        lineStyle: "GAF-T2-D9",
        internalPartReference: "X723061352"
      })
    );

    renderAppWithState(stateWithSheath);
    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const diagram = within(networkSummaryPanel).getByLabelText("2D network diagram");
    const nodeLayer = diagram.querySelector(".network-graph-layer-nodes");
    const physicalConnectorNodeLayer = diagram.querySelector(".network-graph-layer-physical-connector-nodes");
    const segmentCalloutLayer = diagram.querySelector(".network-graph-layer-segment-callouts");
    const segmentCallout = diagram.querySelector(".network-segment-callout-anchor");
    const segmentCalloutLeader = diagram.querySelector(".network-segment-callout-leader-line");
    const segmentLabelLayer = diagram.querySelector(".network-graph-layer-segment-labels");

    expect(nodeLayer).not.toBeNull();
    expect(physicalConnectorNodeLayer).not.toBeNull();
    expect(segmentCalloutLayer).not.toBeNull();
    expect(segmentCallout).not.toBeNull();
    expect(segmentCalloutLeader).not.toBeNull();
    expect(segmentCalloutLeader?.classList.contains("network-callout-leader-line")).toBe(true);
    expect(segmentLabelLayer?.querySelector(".network-segment-callout-anchor")).toBeNull();
    expect(segmentCallout?.closest(".network-entity-group.is-deemphasized")).toBeNull();

    const topLevelGroups = Array.from(diagram.children);
    expect(topLevelGroups.indexOf(segmentCalloutLayer as Element)).toBeGreaterThan(topLevelGroups.indexOf(nodeLayer as Element));
    expect(topLevelGroups.indexOf(segmentCalloutLayer as Element)).toBeGreaterThan(
      topLevelGroups.indexOf(physicalConnectorNodeLayer as Element)
    );
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

    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Scale Up" }));

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

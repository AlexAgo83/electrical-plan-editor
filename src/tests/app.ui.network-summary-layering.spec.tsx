import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - network summary layering", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders labels in a dedicated SVG layer after segment and node geometry", () => {
    renderAppWithState(createUiIntegrationState());
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
    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const anchorBefore = networkSummaryPanel.querySelector(".network-segment-label-anchor");
    expect(anchorBefore).not.toBeNull();
    const transformBefore = anchorBefore?.getAttribute("transform") ?? "";
    expect(transformBefore).toContain("scale(1)");

    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Zoom +" }));

    const anchorAfter = networkSummaryPanel.querySelector(".network-segment-label-anchor");
    expect(anchorAfter).not.toBeNull();
    const transformAfter = anchorAfter?.getAttribute("transform") ?? "";
    expect(transformAfter).not.toBe(transformBefore);
    expect(transformAfter).not.toContain("scale(1)");
  });
});

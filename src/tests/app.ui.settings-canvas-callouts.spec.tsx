import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { buildCalloutLayoutMetrics } from "../app/components/network-summary/callouts/calloutLayout";
import { createDefaultConnectorLayout } from "../core/connectorLayout";
import { appActions, appReducer } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

function openViewMenu(panel: HTMLElement): void {
  const viewButton = within(panel).getByRole("button", { name: "View" });
  if (viewButton.getAttribute("aria-expanded") !== "true") {
    fireEvent.click(viewButton);
  }
}

describe("App integration UI - settings canvas callouts", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("applies and persists selected-callout-only preference as an override over full callouts", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
    const defaultCalloutCheckbox = within(canvasSettingsPanel).getByLabelText(
      "Show connector/splice cable callouts by default"
    );
    const selectedOnlyCheckbox = within(canvasSettingsPanel).getByLabelText("Show only selected connector/splice callout");
    expect(selectedOnlyCheckbox).not.toBeChecked();
    fireEvent.click(defaultCalloutCheckbox);
    fireEvent.click(selectedOnlyCheckbox);

    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    expect(within(networkSummaryPanel).getByRole("button", { name: "Callouts" })).toHaveClass("is-active");
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(0);
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    expect(connectorNode).not.toBeNull();
    fireEvent.mouseDown(connectorNode as Element, { button: 0, clientX: 220, clientY: 140 });
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(1);

    switchScreenDrawerAware("settings");
    const restoredCanvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
    expect(within(restoredCanvasSettingsPanel).getByLabelText("Show only selected connector/splice callout")).toBeChecked();
  });

  it("applies selected-callout-only immediately from settings without requiring apply defaults", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");
    let networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    const calloutsToggle = within(networkSummaryPanel).getByRole("button", { name: "Callouts" });
    fireEvent.click(calloutsToggle);
    expect(calloutsToggle).toHaveClass("is-active");
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame").length).toBeGreaterThan(1);

    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
    fireEvent.click(within(canvasSettingsPanel).getByLabelText("Show only selected connector/splice callout"));

    switchScreenDrawerAware("modeling");
    networkSummaryPanel = getPanelByHeading("Network summary");
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(0);
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    expect(connectorNode).not.toBeNull();
    fireEvent.mouseDown(connectorNode as Element, { button: 0, clientX: 220, clientY: 140 });
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(1);
  });

  it("renders callout leader lines above the network grid and below callout cards", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Callouts" }));

    const networkGrid = networkSummaryPanel.querySelector(".network-grid");
    const calloutLeader = networkSummaryPanel.querySelector(".network-callout-leader-line");
    const calloutLayer = networkSummaryPanel.querySelector(".network-graph-layer-callouts");
    expect(networkGrid).not.toBeNull();
    expect(calloutLeader).not.toBeNull();
    expect(calloutLayer).not.toBeNull();
    if (networkGrid === null || calloutLeader === null || calloutLayer === null) {
      throw new Error("Expected network grid, callout leader, and callout card layer.");
    }

    expect(Boolean(networkGrid.compareDocumentPosition(calloutLeader) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(Boolean(calloutLeader.compareDocumentPosition(calloutLayer) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
  });

  it("keeps callout drawing setup in settings while View only toggles callout visibility", () => {
    const catalogItemId = asCatalogItemId("CAT-CALLOUT-DRAWING");
    const state = [
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "CAT-CALLOUT-DRAWING",
        connectionCount: 2,
        connectorLayout: {
          version: 1,
          units: "grid",
          width: 4,
          height: 1,
          keyings: [
            { side: "top", shape: "arrow", position: 2 },
            { side: "right", shape: "square", position: 1 }
          ],
          ways: [
            { cavityIndex: 1, x: 1, y: 1, shape: "round" },
            { cavityIndex: 2, x: 4, y: 1, shape: "round" }
          ]
        }
      }),
      appActions.upsertConnector({
        id: asConnectorId("C1"),
        name: "Connector 1",
        technicalId: "C-1",
        cavityCount: 2,
        catalogItemId
      })
    ].reduce(appReducer, createUiIntegrationState());

    renderAppWithState(state);
    switchScreenDrawerAware("modeling");
    let networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);

    expect(within(networkSummaryPanel).queryByRole("button", { name: "Wires" })).toBeNull();
    expect(within(networkSummaryPanel).queryByRole("button", { name: "Drawing" })).toBeNull();
    expect(within(networkSummaryPanel).queryByRole("button", { name: "Both" })).toBeNull();
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Callouts" }));
    expect(networkSummaryPanel.querySelectorAll(".network-callout-table-cell").length).toBeGreaterThan(0);
    expect(networkSummaryPanel.querySelectorAll(".network-callout-connector-drawing").length).toBeGreaterThan(0);
    expect(networkSummaryPanel.querySelector(".network-callout-connector-keying[d]")).not.toBeNull();
    expect(networkSummaryPanel.querySelector(".network-callout-connector-keying[width]")).not.toBeNull();
    const connectorHitbox = networkSummaryPanel.querySelector(".network-node.connector .network-node-hitbox");
    expect(connectorHitbox).not.toBeNull();
    expect(Number(connectorHitbox?.getAttribute("width"))).toBeCloseTo(39.2);
    expect(Number(connectorHitbox?.getAttribute("height"))).toBeCloseTo(28);

    switchScreenDrawerAware("settings");
    const connectorDrawingSelector = within(getPanelByHeading("Canvas render preferences")).getByLabelText(
      "Connector drawing display"
    );
    expect(connectorDrawingSelector).toHaveValue("nodes");
    expect(within(getPanelByHeading("Canvas render preferences")).getByRole("slider", { name: /Connector drawing size/ })).toHaveValue("150");
    fireEvent.change(connectorDrawingSelector, { target: { value: "disabled" } });

    switchScreenDrawerAware("modeling");
    networkSummaryPanel = getPanelByHeading("Network summary");
    expect(networkSummaryPanel.querySelectorAll(".network-callout-connector-drawing")).toHaveLength(0);
    expect(networkSummaryPanel.querySelectorAll(".network-callout-table-cell").length).toBeGreaterThan(0);
  });

  it("can render connector layouts directly on connector nodes", () => {
    const catalogItemId = asCatalogItemId("CAT-NODE-DRAWING");
    const state = [
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "CAT-NODE-DRAWING",
        connectionCount: 2,
        connectorLayout: {
          version: 1,
          units: "grid",
          width: 4,
          height: 1,
          ways: [
            { cavityIndex: 1, x: 1, y: 1, shape: "round" },
            { cavityIndex: 2, x: 4, y: 1, shape: "square" }
          ]
        }
      }),
      appActions.upsertConnector({
        id: asConnectorId("C1"),
        name: "Connector A",
        technicalId: "C1",
        cavityCount: 2,
        catalogItemId
      })
    ].reduce(appReducer, createUiIntegrationState());

    renderAppWithState(state);
    switchScreenDrawerAware("settings");
    const selector = within(getPanelByHeading("Canvas render preferences")).getByLabelText("Connector drawing display");
    fireEvent.change(selector, { target: { value: "nodes" } });

    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");
    fireEvent.click(within(getPanelByHeading("Wires")).getByText("W-1"));
    const networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Callouts" }));

    expect(networkSummaryPanel.querySelector(".network-node-connector-drawing")).not.toBeNull();
    expect(networkSummaryPanel.querySelectorAll(".network-graph-layer-callouts .network-callout-connector-drawing")).toHaveLength(0);
    expect(networkSummaryPanel.querySelectorAll(".network-node-connector-drawing .network-callout-connector-way.is-wire-highlighted")).toHaveLength(1);
  });

  it("does not draw generated connector layouts inside callouts", () => {
    const catalogItemId = asCatalogItemId("CAT-GENERATED-CALLOUT-DRAWING");
    const state = [
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "CAT-GENERATED-CALLOUT-DRAWING",
        connectionCount: 2,
        connectorLayout: createDefaultConnectorLayout(2)
      }),
      appActions.upsertConnector({
        id: asConnectorId("C1"),
        name: "Connector 1",
        technicalId: "C-1",
        cavityCount: 2,
        catalogItemId
      })
    ].reduce(appReducer, createUiIntegrationState());

    renderAppWithState(state);
    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Callouts" }));

    expect(networkSummaryPanel.querySelectorAll(".network-callout-table-cell").length).toBeGreaterThan(0);
    expect(networkSummaryPanel.querySelectorAll(".network-callout-connector-drawing")).toHaveLength(0);
  });

  it("scales connector drawings vertically without forcing wide callouts", () => {
    const drawingLayout = buildCalloutLayoutMetrics("J1", "", [], "normal", false, true);
    const doubledDrawingLayout = buildCalloutLayoutMetrics("J1", "", [], "normal", false, true, 2);

    expect(drawingLayout.drawingHeight).toBe(64);
    expect(drawingLayout.width).toBeLessThan(160);
    expect(doubledDrawingLayout.drawingHeight).toBe(128);
    expect(doubledDrawingLayout.width).toBeLessThan(220);
  });

  it("filters callouts from connector/splice nodes selected while modeling sub-screen is Node", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("node");

    let networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    const calloutsToggle = within(networkSummaryPanel).getByRole("button", { name: "Callouts" });
    fireEvent.click(calloutsToggle);
    expect(calloutsToggle).toHaveClass("is-active");
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame").length).toBeGreaterThan(1);

    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
    fireEvent.click(within(canvasSettingsPanel).getByLabelText("Show only selected connector/splice callout"));

    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("node");
    networkSummaryPanel = getPanelByHeading("Network summary");
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(0);
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    expect(connectorNode).not.toBeNull();
    fireEvent.mouseDown(connectorNode as Element, { button: 0, clientX: 220, clientY: 140 });
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(1);
  });

  it("cleans up hidden callout measurement nodes on unmount", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Callouts" }));
    expect(document.querySelectorAll("svg[data-callout-measure-root='true']").length).toBeGreaterThan(0);

    firstRender.unmount();
    expect(document.querySelectorAll("svg[data-callout-measure-root='true']")).toHaveLength(0);
  });
});

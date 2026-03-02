import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

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

  it("filters callouts from connector/splice nodes selected while modeling sub-screen is Node", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("node");

    let networkSummaryPanel = getPanelByHeading("Network summary");
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
});

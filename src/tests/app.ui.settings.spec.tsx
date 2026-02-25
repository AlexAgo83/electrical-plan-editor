import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NetworkId } from "../core/entities";
import {
  asConnectorId,
  createConnectorSortingState,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { appActions, appReducer, createInitialState, createSampleNetworkState } from "../store";

describe("App integration UI - settings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("applies settings defaults for list sort behavior", () => {
    renderAppWithState(createConnectorSortingState());

    switchScreenDrawerAware("settings");
    const settingsPanel = getPanelByHeading("Appearance preferences");
    fireEvent.change(within(settingsPanel).getByLabelText("Default sort column"), {
      target: { value: "technicalId" }
    });
    fireEvent.change(within(settingsPanel).getByLabelText("Default sort direction"), {
      target: { value: "desc" }
    });
    fireEvent.click(within(settingsPanel).getByRole("button", { name: "Apply sort defaults now" }));

    switchScreenDrawerAware("modeling");
    const connectorsPanel = getPanelByHeading("Connectors");
    const firstConnectorName = connectorsPanel.querySelector("tbody tr td")?.textContent?.trim() ?? "";
    expect(firstConnectorName).toBe("Zulu connector");
  });

  it("switches to compact table density from settings", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const settingsPanel = getPanelByHeading("Appearance preferences");
    fireEvent.change(within(settingsPanel).getByLabelText("Table density"), {
      target: { value: "compact" }
    });

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();
    expect(appShell).toHaveClass("table-density-compact");
  });

  it("uses normal table font size by default and updates table font class from settings", () => {
    renderAppWithState(createUiIntegrationState());

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();
    expect(appShell).toHaveClass("table-font-normal");

    switchScreenDrawerAware("settings");
    const settingsPanel = getPanelByHeading("Appearance preferences");
    fireEvent.change(within(settingsPanel).getByLabelText("Table font size"), {
      target: { value: "small" }
    });
    expect(appShell).toHaveClass("table-font-small");

    fireEvent.change(within(settingsPanel).getByLabelText("Table font size"), {
      target: { value: "large" }
    });
    expect(appShell).toHaveClass("table-font-large");
  });

  it("persists settings preferences across remount", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const settingsPanel = getPanelByHeading("Appearance preferences");
    fireEvent.change(within(settingsPanel).getByLabelText("Table density"), {
      target: { value: "compact" }
    });
    fireEvent.change(within(settingsPanel).getByLabelText("Default sort column"), {
      target: { value: "technicalId" }
    });
    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();
    expect(appShell).toHaveClass("table-density-compact");

    switchScreenDrawerAware("settings");
    const restoredSettingsPanel = getPanelByHeading("Appearance preferences");
    expect(within(restoredSettingsPanel).getByLabelText("Default sort column")).toHaveValue("technicalId");
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

  it("uses normal callout text size by default and updates the network callout text size class from settings", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas render preferences");
    const calloutTextSizeSelect = within(canvasSettingsPanel).getByLabelText("Callout text size");
    expect(calloutTextSizeSelect).toHaveValue("normal");

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

  it("recreates sample network from settings when workspace is empty", () => {
    renderAppWithState(createInitialState());

    switchScreenDrawerAware("settings");
    const sampleControlsPanel = getPanelByHeading("Sample network controls");
    const recreateButton = within(sampleControlsPanel).getByRole("button", {
      name: "Recreate sample network"
    });
    const resetButton = within(sampleControlsPanel).getByRole("button", {
      name: "Reset sample network to baseline"
    });

    expect(recreateButton).toBeEnabled();
    expect(resetButton).toBeDisabled();

    fireEvent.click(recreateButton);

    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Modeling$/, hidden: true })).toHaveClass(
      "is-active"
    );

    const connectorsPanel = getPanelByHeading("Connectors");
    expect(within(connectorsPanel).getByText("Power Source Connector")).toBeInTheDocument();
  });

  it("recreates a validation issues sample from settings when workspace is empty", () => {
    renderAppWithState(createInitialState());

    switchScreenDrawerAware("settings");
    const sampleControlsPanel = getPanelByHeading("Sample network controls");
    const validationSampleButton = within(sampleControlsPanel).getByRole("button", {
      name: "Recreate validation issues sample"
    });

    expect(validationSampleButton).toBeEnabled();
    fireEvent.click(validationSampleButton);

    switchScreenDrawerAware("validation");
    expect(getPanelByHeading("Validation center")).toBeInTheDocument();
    expect(
      within(document.body).getByText("Wire 'WIRE-VAL-BROKEN' endpoint A references missing connector 'C-GHOST'.")
    ).toBeInTheDocument();
  });

  it("recreates sample networks without deleting user-created networks", () => {
    const sampled = createSampleNetworkState();
    const withUserNetwork = appReducer(
      sampled,
      appActions.createNetwork({
        id: ("net-user-custom" as NetworkId),
        name: "User custom network",
        technicalId: "NET-USER-CUSTOM",
        createdAt: "2026-02-24T12:00:00.000Z",
        updatedAt: "2026-02-24T12:00:00.000Z"
      })
    );

    renderAppWithState(withUserNetwork);
    switchScreenDrawerAware("settings");

    const sampleControlsPanel = getPanelByHeading("Sample network controls");
    const recreateButton = within(sampleControlsPanel).getByRole("button", { name: "Recreate sample network" });
    expect(recreateButton).toBeEnabled();
    fireEvent.click(recreateButton);

    switchScreenDrawerAware("networkScope");
    const networkScopePanel = getPanelByHeading("Network Scope");
    expect(within(networkScopePanel).getByText("User custom network")).toBeInTheDocument();
    expect(within(networkScopePanel).getByText("Lighting branch demo")).toBeInTheDocument();
    expect(within(networkScopePanel).getByText("Sensor backbone demo")).toBeInTheDocument();
  });

  it("resets built-in sample networks to baseline without deleting user-created networks", () => {
    const sampled = createSampleNetworkState();
    const withUserNetwork = appReducer(
      sampled,
      appActions.createNetwork({
        id: ("net-user-custom" as NetworkId),
        name: "User custom network",
        technicalId: "NET-USER-CUSTOM",
        createdAt: "2026-02-24T12:10:00.000Z",
        updatedAt: "2026-02-24T12:10:00.000Z"
      })
    );

    renderAppWithState(withUserNetwork);
    switchScreenDrawerAware("settings");

    const sampleControlsPanel = getPanelByHeading("Sample network controls");
    const resetButton = within(sampleControlsPanel).getByRole("button", {
      name: "Reset sample network to baseline"
    });
    expect(resetButton).toBeEnabled();

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(resetButton);
    confirmSpy.mockRestore();

    switchScreenDrawerAware("networkScope");
    const networkScopePanel = getPanelByHeading("Network Scope");
    expect(within(networkScopePanel).getByText("User custom network")).toBeInTheDocument();
    expect(within(networkScopePanel).getByText("Main network sample")).toBeInTheDocument();
  });

  it("recreates validation issues sample without deleting user-created networks", () => {
    const sampled = createSampleNetworkState();
    const withUserNetwork = appReducer(
      sampled,
      appActions.createNetwork({
        id: ("net-user-custom" as NetworkId),
        name: "User custom network",
        technicalId: "NET-USER-CUSTOM",
        createdAt: "2026-02-24T12:20:00.000Z",
        updatedAt: "2026-02-24T12:20:00.000Z"
      })
    );

    renderAppWithState(withUserNetwork);
    switchScreenDrawerAware("settings");
    const sampleControlsPanel = getPanelByHeading("Sample network controls");
    const validationSampleButton = within(sampleControlsPanel).getByRole("button", {
      name: "Recreate validation issues sample"
    });

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(validationSampleButton);
    confirmSpy.mockRestore();

    switchScreenDrawerAware("networkScope");
    const networkScopePanel = getPanelByHeading("Network Scope");
    expect(within(networkScopePanel).getByText("User custom network")).toBeInTheDocument();

    switchScreenDrawerAware("validation");
    expect(getPanelByHeading("Validation center")).toBeInTheDocument();
  });

  it("keeps settings workspace accessible when no active network exists", () => {
    const initial = createInitialState();
    const noNetwork = appReducer(initial, appActions.deleteNetwork(initial.activeNetworkId as NetworkId));

    renderAppWithState(noNetwork);
    switchScreenDrawerAware("settings");

    expect(getPanelByHeading("Appearance preferences")).toBeInTheDocument();
    expect(within(document.body).queryByRole("heading", { name: "No active network" })).not.toBeInTheDocument();
  });

  it("returns to the previous screen when clicking Settings again from the settings screen", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("analysis");
    expect(getPanelByHeading("Network summary")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(getPanelByHeading("Appearance preferences")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(getPanelByHeading("Network summary")).toBeInTheDocument();
  });

  it("resets sample network to baseline from settings", () => {
    const sampled = createSampleNetworkState();
    const withExtraConnector = appReducer(
      sampled,
      appActions.upsertConnector({
        id: asConnectorId("C-EXTRA"),
        name: "Extra connector",
        technicalId: "CONN-EXTRA",
        cavityCount: 2
      })
    );
    renderAppWithState(withExtraConnector);

    switchSubScreenDrawerAware("connector");
    let connectorsPanel = getPanelByHeading("Connectors");
    expect(within(connectorsPanel).getByText("Extra connector")).toBeInTheDocument();

    switchScreenDrawerAware("settings");
    const sampleControlsPanel = getPanelByHeading("Sample network controls");
    const resetButton = within(sampleControlsPanel).getByRole("button", {
      name: "Reset sample network to baseline"
    });
    expect(resetButton).toBeEnabled();

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(resetButton);
    confirmSpy.mockRestore();

    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("connector");
    connectorsPanel = getPanelByHeading("Connectors");
    expect(within(connectorsPanel).queryByText("Extra connector")).not.toBeInTheDocument();
    expect(within(connectorsPanel).getByText("Power Source Connector")).toBeInTheDocument();
  });

  it("ignores keyboard shortcuts when disabled from settings preferences", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const settingsPanel = getPanelByHeading("Action bar and shortcuts");
    fireEvent.click(within(settingsPanel).getByLabelText("Enable keyboard shortcuts (undo/redo/navigation/issues/view)"));

    switchScreenDrawerAware("networkScope");
    fireEvent.keyDown(window, { key: "2", altKey: true });
    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(
      within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Network Scope$/, hidden: true })
    ).toHaveClass("is-active");
  });

  it("hides the floating inspector panel when disabled from settings preferences", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("modeling");
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    expect(screen.getByRole("heading", { name: "Inspector context" })).toBeInTheDocument();

    switchScreenDrawerAware("settings");
    const globalPreferencesPanel = getPanelByHeading("Global preferences");
    const inspectorToggle = within(globalPreferencesPanel).getByLabelText("Show floating inspector panel on supported screens");
    expect(inspectorToggle).toBeChecked();
    fireEvent.click(inspectorToggle);
    expect(inspectorToggle).not.toBeChecked();

    switchScreenDrawerAware("modeling");
    expect(screen.queryByRole("heading", { name: "Inspector context" })).not.toBeInTheDocument();
  });

  it("persists global preferences for floating inspector visibility and shows workspace panel layout as disabled", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const globalPreferencesPanel = getPanelByHeading("Global preferences");
    const inspectorToggle = within(globalPreferencesPanel).getByLabelText("Show floating inspector panel on supported screens");
    const layoutSelect = within(globalPreferencesPanel).getByLabelText("Workspace panels layout");

    expect(inspectorToggle).toBeChecked();
    expect(layoutSelect).toHaveValue("singleColumn");
    expect(layoutSelect).toBeDisabled();

    fireEvent.click(inspectorToggle);

    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const restoredGlobalPreferencesPanel = getPanelByHeading("Global preferences");
    expect(
      within(restoredGlobalPreferencesPanel).getByLabelText("Show floating inspector panel on supported screens")
    ).not.toBeChecked();
    expect(within(restoredGlobalPreferencesPanel).getByLabelText("Workspace panels layout")).toHaveValue("singleColumn");
    expect(within(restoredGlobalPreferencesPanel).getByLabelText("Workspace panels layout")).toBeDisabled();
  });

});

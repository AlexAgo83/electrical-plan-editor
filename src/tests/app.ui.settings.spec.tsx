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
    const canvasSettingsPanel = getPanelByHeading("Canvas preferences");
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
    const restoredCanvasSettingsPanel = getPanelByHeading("Canvas preferences");
    expect(within(restoredCanvasSettingsPanel).getByLabelText("2D label size")).toHaveValue("large");
    expect(within(restoredCanvasSettingsPanel).getByLabelText("2D label rotation")).toHaveValue("45");
  });

  it("persists png export background toggle and supports negative 2d label rotation presets", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas preferences");
    expect(within(canvasSettingsPanel).getByLabelText("Include background in PNG export")).toBeChecked();
    fireEvent.change(within(canvasSettingsPanel).getByLabelText("2D label rotation"), {
      target: { value: "-45" }
    });
    fireEvent.click(within(canvasSettingsPanel).getByLabelText("Include background in PNG export"));

    switchScreenDrawerAware("analysis");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    const segmentLabel = networkSummaryPanel.querySelector(".network-segment-label-anchor .network-segment-label");
    expect(segmentLabel?.getAttribute("transform")).toContain("rotate(-45");

    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const restoredCanvasSettingsPanel = getPanelByHeading("Canvas preferences");
    expect(within(restoredCanvasSettingsPanel).getByLabelText("2D label rotation")).toHaveValue("-45");
    expect(within(restoredCanvasSettingsPanel).getByLabelText("Include background in PNG export")).not.toBeChecked();
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
    const shortcutsPanel = getPanelByHeading("Action bar and shortcuts");
    const inspectorToggle = within(shortcutsPanel).getByLabelText("Show floating inspector panel on supported screens");
    expect(inspectorToggle).toBeChecked();
    fireEvent.click(inspectorToggle);
    expect(inspectorToggle).not.toBeChecked();

    switchScreenDrawerAware("modeling");
    expect(screen.queryByRole("heading", { name: "Inspector context" })).not.toBeInTheDocument();
  });
});

import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
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

    switchSubScreenDrawerAware("catalog");
    const catalogPanel = getPanelByHeading("Catalog");
    expect(within(catalogPanel).getByText("SAMPLE-CAT-SRC-12W")).toBeInTheDocument();
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

    fireEvent.click(resetButton);
    const confirmDialog = screen.getByRole("dialog", { name: "Reset sample network" });
    fireEvent.click(within(confirmDialog).getByRole("button", { name: "Confirm" }));

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

    fireEvent.click(validationSampleButton);
    const confirmDialog = screen.getByRole("dialog", { name: "Replace built-in sample content" });
    fireEvent.click(within(confirmDialog).getByRole("button", { name: "Confirm" }));

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

  it("resets sample network to baseline from settings", async () => {
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

    fireEvent.click(resetButton);
    const confirmDialog = screen.getByRole("dialog", { name: "Reset sample network" });
    fireEvent.click(within(confirmDialog).getByRole("button", { name: "Confirm" }));

    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("connector");
    connectorsPanel = getPanelByHeading("Connectors");
    await waitFor(() => {
      expect(within(connectorsPanel).queryByText("Extra connector")).not.toBeInTheDocument();
    });
    expect(within(connectorsPanel).getByText("Power Source Connector")).toBeInTheDocument();
  }, 10_000);

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
    const closeOnboardingButton = screen.queryByRole("button", { name: "Close onboarding" });
    if (closeOnboardingButton !== null) {
      fireEvent.click(closeOnboardingButton);
    }

    switchScreenDrawerAware("modeling");
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    const inspectorHeading = screen.queryByRole("heading", { name: "Inspector context" });
    if (inspectorHeading !== null) {
      expect(inspectorHeading).toBeInTheDocument();
    } else {
      const editConnectorPanel = getPanelByHeading("Edit Connector");
      expect(within(editConnectorPanel).getByDisplayValue("C-1")).toBeInTheDocument();
    }

    switchScreenDrawerAware("settings");
    const globalPreferencesPanel = getPanelByHeading("Global preferences");
    const inspectorToggle = within(globalPreferencesPanel).getByLabelText("Show floating inspector panel on supported screens");
    expect(inspectorToggle).toBeChecked();
    fireEvent.click(inspectorToggle);
    expect(inspectorToggle).not.toBeChecked();

    switchScreenDrawerAware("modeling");
    expect(screen.queryByRole("heading", { name: "Inspector context" })).not.toBeInTheDocument();
    if (screen.queryByLabelText("Inspector context panel") === null) {
      const editConnectorPanel = getPanelByHeading("Edit Connector");
      expect(within(editConnectorPanel).getByDisplayValue("C-1")).toBeInTheDocument();
    }
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

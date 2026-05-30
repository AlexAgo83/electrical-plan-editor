import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CatalogItemId, ConnectorId, NetworkId } from "../core/entities";
import {
  asConnectorId,
  createConnectorSortingState,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  withViewportSize,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { appActions, appReducer, createInitialState, createSampleNetworkState } from "../store";
import { buildAiAgentContext } from "../app/lib/aiAgentContext";
import { AI_AGENT_PANEL_PREFERENCES_STORAGE_KEY } from "../app/lib/aiAgentPanelPreferences";
import { buildAiAgentEditablePlan } from "../app/lib/aiAgentPlanDiff";

describe("App integration UI - settings", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("applies settings defaults for list sort behavior after reload", () => {
    const firstRender = renderAppWithState(createConnectorSortingState());

    switchScreenDrawerAware("settings");
    const settingsPanel = getPanelByHeading("Appearance preferences");
    fireEvent.change(within(settingsPanel).getByLabelText("Default sort column"), {
      target: { value: "technicalId" }
    });
    fireEvent.change(within(settingsPanel).getByLabelText("Default sort direction"), {
      target: { value: "desc" }
    });
    firstRender.unmount();
    renderAppWithState(createConnectorSortingState());

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
    expect(within(networkScopePanel).getByText("Lighting branch (Sample)")).toBeInTheDocument();
    expect(within(networkScopePanel).getByText("Sensor backbone (Sample)")).toBeInTheDocument();
    expect(within(networkScopePanel).getByText("Door module (Sample)")).toBeInTheDocument();
    expect(within(networkScopePanel).getByText("Charging service (Sample)")).toBeInTheDocument();
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
    expect(within(networkScopePanel).getByText("Main network (Sample)")).toBeInTheDocument();
  });

  it("keeps settings workspace accessible when no active network exists", () => {
    const initial = createInitialState();
    const noNetwork = appReducer(initial, appActions.deleteNetwork(initial.activeNetworkId as NetworkId));

    renderAppWithState(noNetwork);
    switchScreenDrawerAware("settings");

    expect(getPanelByHeading("Appearance preferences")).toBeInTheDocument();
    expect(within(document.body).queryByRole("heading", { name: "No active network" })).not.toBeInTheDocument();
  });

  it("exposes workspace storage status and file actions in settings", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const workspaceStoragePanel = getPanelByHeading("Workspace storage");

    expect(within(workspaceStoragePanel).getAllByText("Local only").length).toBeGreaterThan(0);
    expect(within(workspaceStoragePanel).getByText("Local browser cache")).toBeInTheDocument();
    expect(within(workspaceStoragePanel).getByText("No resumable file")).toBeInTheDocument();
    expect(within(workspaceStoragePanel).getByRole("button", { name: "Resume workspace file" })).toBeDisabled();
    expect(within(workspaceStoragePanel).getByRole("button", { name: "Open workspace file" })).toBeEnabled();
    expect(within(workspaceStoragePanel).getByRole("button", { name: "Relink workspace file" })).toBeEnabled();
    expect(within(workspaceStoragePanel).getByRole("button", { name: "Save workspace file now" })).toBeEnabled();
    expect(within(workspaceStoragePanel).getByRole("button", { name: "Save workspace file as" })).toBeEnabled();
  });

  it("configures AI provider readiness and gates the Modeling AI Agent entry", async () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("modeling");
    const quickEntityNavigation = screen.getByRole("region", { name: "Quick entity navigation" });
    const disabledAiAgentButton = within(quickEntityNavigation).getByRole("button", { name: "AI Agent" });
    expect(disabledAiAgentButton).toBeDisabled();

    switchScreenDrawerAware("settings");
    const aiProviderPanel = getPanelByHeading("AI provider");
    expect(within(aiProviderPanel).getByText("OpenAI API key is required.")).toBeInTheDocument();
    fireEvent.change(within(aiProviderPanel).getByLabelText("API key"), {
      target: { value: "sk-local-test" }
    });
    expect(within(aiProviderPanel).getByText("OpenAI provider is ready.")).toBeInTheDocument();
    const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(new Response("{}", { status: 200 })));
    vi.stubGlobal("fetch", fetchMock);
    fireEvent.click(within(aiProviderPanel).getByRole("button", { name: "Test connection" }));
    expect(await within(aiProviderPanel).findByText("OpenAI connection succeeded.")).toBeInTheDocument();

    switchScreenDrawerAware("modeling");
    const enabledAiAgentButton = within(screen.getByRole("region", { name: "Quick entity navigation" })).getByRole("button", {
      name: "AI Agent"
    });
    expect(enabledAiAgentButton).toBeEnabled();
    fireEvent.click(enabledAiAgentButton);
    expect(screen.getByRole("heading", { name: "AI Agent" })).toBeInTheDocument();
    expect(screen.queryByText("Provider ready")).not.toBeInTheDocument();
    expect(screen.queryByText("OpenAI provider is ready.")).not.toBeInTheDocument();
    const activeQuickEntityNavigation = screen.getByRole("region", { name: "Quick entity navigation" });
    expect(within(activeQuickEntityNavigation).getByRole("button", { name: /Connectors/ })).toHaveAttribute("aria-pressed", "false");
    expect(within(activeQuickEntityNavigation).getByRole("button", { name: "AI Agent" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("region", { name: "AI context summary" })).toHaveTextContent("Main network (Sample)");
    expect(screen.getByLabelText("Instruction")).toBeInTheDocument();
    expect(screen.getByLabelText("Target scope")).toHaveValue("activeNetwork");
    expect(screen.getByLabelText("Agent mode")).toHaveValue("assisted");
    expect(screen.getByLabelText("Delete entities")).toBeEnabled();
    expect(screen.getByRole("button", { name: "Prepare" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Instruction"), {
      target: { value: "Move selected routing nodes to reduce crossings." }
    });
    const prepareProposalButton = screen.getByRole("button", { name: "Prepare" });
    expect(prepareProposalButton).toBeEnabled();
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            output_text: JSON.stringify({
              schemaVersion: 1,
              operations: [{ type: "add_node", label: "Provider proposed node", position: { x: 100, y: 120 } }]
            })
          }),
          { status: 200 }
        )
      )
    );
    fireEvent.click(prepareProposalButton);
    expect(await screen.findByText(/Provider draft generated/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show AI response" })).toBeInTheDocument();
    const proposalSummary = screen.getByRole("region", { name: "AI proposal summary" });
    expect(within(proposalSummary).getByText("Accepted")).toBeInTheDocument();
    expect(within(proposalSummary).getByText("add_node")).toBeInTheDocument();
    const applyProposalButton = screen.getByRole("button", { name: "Apply" });
    expect(applyProposalButton).toBeEnabled();
    expect(screen.getByRole("button", { name: "Reject" })).toBeEnabled();
    fireEvent.click(applyProposalButton);
    expect(screen.getByText("Applied 1 accepted operation. 0 accepted operations skipped.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    expect(within(screen.getByLabelText("AI context entity counts")).getByLabelText("4 nodes")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "z", metaKey: true });
    expect(within(screen.getByLabelText("AI context entity counts")).getByLabelText("3 nodes")).toBeInTheDocument();
    expect(screen.queryByLabelText("Use configured provider for proposal generation")).not.toBeInTheDocument();
  });

  it("persists AI Agent panel preferences across remounts", async () => {
    const firstRender = renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const aiProviderPanel = getPanelByHeading("AI provider");
    fireEvent.change(within(aiProviderPanel).getByLabelText("API key"), {
      target: { value: "sk-local-test" }
    });
    fireEvent.click(within(aiProviderPanel).getByLabelText("Enable experimental direct execution"));

    switchScreenDrawerAware("modeling");
    fireEvent.click(within(screen.getByRole("region", { name: "Quick entity navigation" })).getByRole("button", { name: "AI Agent" }));
    fireEvent.change(screen.getByLabelText("Target scope"), {
      target: { value: "allNetworks" }
    });
    fireEvent.change(screen.getByLabelText("Agent mode"), {
      target: { value: "direct" }
    });
    fireEvent.change(screen.getByLabelText("Instruction"), {
      target: { value: "Keep this instruction available for the next AI Agent session." }
    });
    fireEvent.click(screen.getByLabelText("Add connectors, splices, nodes, segments, or valid wires"));
    fireEvent.click(screen.getByLabelText("Delete entities"));

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(AI_AGENT_PANEL_PREFERENCES_STORAGE_KEY) ?? "{}")).toMatchObject({
        instruction: "Keep this instruction available for the next AI Agent session.",
        targetScope: "allNetworks",
        agentMode: "direct",
        permissions: {
          add: false,
          delete: true
        }
      });
    });

    firstRender.unmount();
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("modeling");
    fireEvent.click(within(screen.getByRole("region", { name: "Quick entity navigation" })).getByRole("button", { name: "AI Agent" }));

    expect(screen.getByLabelText("Target scope")).toHaveValue("allNetworks");
    expect(screen.getByLabelText("Agent mode")).toHaveValue("direct");
    expect(screen.getByLabelText("Instruction")).toHaveValue("Keep this instruction available for the next AI Agent session.");
    expect(screen.getByLabelText("Add connectors, splices, nodes, segments, or valid wires")).not.toBeChecked();
    expect(screen.getByLabelText("Delete entities")).toBeChecked();
  });

  it("keeps persisted AI Agent direct mode behind the experimental setting", async () => {
    localStorage.setItem(
      AI_AGENT_PANEL_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        instruction: "Persisted instruction text",
        targetScope: "currentSelection",
        agentMode: "direct",
        permissions: {
          add: true,
          move: true,
          update: true,
          route: true,
          delete: true
        }
      })
    );

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const aiProviderPanel = getPanelByHeading("AI provider");
    fireEvent.change(within(aiProviderPanel).getByLabelText("API key"), {
      target: { value: "sk-local-test" }
    });

    switchScreenDrawerAware("modeling");
    fireEvent.click(within(screen.getByRole("region", { name: "Quick entity navigation" })).getByRole("button", { name: "AI Agent" }));

    expect(screen.getByLabelText("Target scope")).toHaveValue("currentSelection");
    expect(screen.getByLabelText("Agent mode")).toHaveValue("assisted");
    expect(screen.getByLabelText("Instruction")).toHaveValue("Persisted instruction text");
    expect(screen.getByLabelText("Delete entities")).toBeChecked();

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(AI_AGENT_PANEL_PREFERENCES_STORAGE_KEY) ?? "{}")).toMatchObject({
        agentMode: "assisted"
      });
    });
  });

  it("applies provider modified plans to visible connector fields", async () => {
    const state = createUiIntegrationState();
    const editablePlan = buildAiAgentEditablePlan(buildAiAgentContext(state, "activeNetwork"));
    const modifiedPlan = {
      ...editablePlan,
      connectors: editablePlan.connectors.map((connector) =>
        connector.id === asConnectorId("C1") ? { ...connector, name: "Connector 1 (2 pins)" } : connector
      )
    };

    renderAppWithState(state);
    switchScreenDrawerAware("settings");
    const aiProviderPanel = getPanelByHeading("AI provider");
    fireEvent.change(within(aiProviderPanel).getByLabelText("API key"), {
      target: { value: "sk-local-test" }
    });
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            output_text: JSON.stringify({
              schemaVersion: 1,
              modifiedPlan
            })
          }),
          { status: 200 }
        )
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    switchScreenDrawerAware("modeling");
    fireEvent.click(within(screen.getByRole("region", { name: "Quick entity navigation" })).getByRole("button", { name: "AI Agent" }));
    fireEvent.change(screen.getByLabelText("Instruction"), {
      target: { value: "Add the pin count in parentheses to connector names." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Prepare" }));

    expect(await screen.findByText(/Provider draft generated/)).toBeInTheDocument();
    const proposalSummary = screen.getByRole("region", { name: "AI proposal summary" });
    expect(within(proposalSummary).getByText("update_entity")).toBeInTheDocument();
    expect(within(proposalSummary).getByText('connector C1 · name: "Connector 1 (2 pins)"')).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByText("Applied 1 accepted operation. 0 accepted operations skipped.")).toBeInTheDocument();

    switchSubScreenDrawerAware("connector");
    const connectorsPanel = getPanelByHeading("Connectors");
    expect(within(connectorsPanel).getByText("Connector 1 (2 pins)")).toBeInTheDocument();
    expect(within(connectorsPanel).queryByText("Connector 1")).not.toBeInTheDocument();
  });

  it("applies provider modified plans to selected catalog item connection count", async () => {
    const baseState = createSampleNetworkState();
    const chargingState = appReducer(baseState, appActions.selectNetwork("network-charging-service-demo" as NetworkId));
    const state = appReducer(
      chargingState,
      appActions.select({ kind: "catalog", id: "CAT-CHG-SERVICE-4W" as CatalogItemId })
    );
    const editablePlan = buildAiAgentEditablePlan(buildAiAgentContext(state, "currentSelection"));
    const modifiedPlan = {
      ...editablePlan,
      catalogItems: editablePlan.catalogItems.map((item) =>
        item.id === ("CAT-CHG-SERVICE-4W" as CatalogItemId) ? { ...item, connectionCount: item.connectionCount * 2 } : item
      )
    };

    renderAppWithState(state);
    switchScreenDrawerAware("settings");
    const aiProviderPanel = getPanelByHeading("AI provider");
    fireEvent.change(within(aiProviderPanel).getByLabelText("API key"), {
      target: { value: "sk-local-test" }
    });
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            output_text: JSON.stringify({
              schemaVersion: 1,
              modifiedPlan
            })
          }),
          { status: 200 }
        )
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    switchScreenDrawerAware("modeling");
    fireEvent.click(within(screen.getByRole("region", { name: "Quick entity navigation" })).getByRole("button", { name: "AI Agent" }));
    fireEvent.change(screen.getByLabelText("Target scope"), {
      target: { value: "currentSelection" }
    });
    expect(within(screen.getByLabelText("AI context entity counts")).getByLabelText("1 catalog item")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Instruction"), {
      target: { value: "Double the number of ways on the selected catalog item." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Prepare" }));

    expect(await screen.findByText(/Provider draft generated/)).toBeInTheDocument();
    const proposalSummary = screen.getByRole("region", { name: "AI proposal summary" });
    expect(within(proposalSummary).getByText("update_entity")).toBeInTheDocument();
    expect(within(proposalSummary).getByText("catalog CAT-CHG-SERVICE-4W · connectionCount: 8")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByText("Applied 1 accepted operation. 0 accepted operations skipped.")).toBeInTheDocument();

    switchSubScreenDrawerAware("catalog");
    const catalogPanel = getPanelByHeading("Catalog");
    expect(within(catalogPanel).getByText("CHG-CAT-SVC-4W")).toBeInTheDocument();
    const catalogItemRow = within(catalogPanel).getByText("CHG-CAT-SVC-4W").closest("tr");
    expect(catalogItemRow).not.toBeNull();
    expect(within(catalogItemRow as HTMLTableRowElement).getByText("8")).toBeInTheDocument();

    switchSubScreenDrawerAware("connector");
    const connectorsPanel = getPanelByHeading("Connectors");
    const serviceConnectorRow = within(connectorsPanel).getByText("Service Disconnect Connector").closest("tr");
    expect(serviceConnectorRow).not.toBeNull();
    expect(within(serviceConnectorRow as HTMLTableRowElement).getByText("8")).toBeInTheDocument();
  });

  it("applies provider modified plans that add a new wire", async () => {
    const baseState = createSampleNetworkState();
    const state = appReducer(baseState, appActions.selectNetwork("network-charging-service-demo" as NetworkId));
    const editablePlan = buildAiAgentEditablePlan(buildAiAgentContext(state, "activeNetwork"));
    const modifiedPlan = {
      ...editablePlan,
      wires: [
        ...editablePlan.wires,
        {
          id: "AI-WIRE-INLET-OBC",
          name: "Inlet to OBC pin bridge",
          technicalId: "H-WIRE-INLET-OBC-P7-P12",
          endpointA: { kind: "connectorCavity" as const, connectorId: "H-C-INLET" as ConnectorId, cavityIndex: 7 },
          endpointB: { kind: "connectorCavity" as const, connectorId: "H-C-OBC" as ConnectorId, cavityIndex: 12 },
          sectionMm2: 0.5,
          routeSegmentIds: [],
          lengthMm: 0
        }
      ]
    };

    renderAppWithState(state);
    switchScreenDrawerAware("settings");
    const aiProviderPanel = getPanelByHeading("AI provider");
    fireEvent.change(within(aiProviderPanel).getByLabelText("API key"), {
      target: { value: "sk-local-test" }
    });
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            output_text: JSON.stringify({
              schemaVersion: 1,
              modifiedPlan
            })
          }),
          { status: 200 }
        )
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    switchScreenDrawerAware("modeling");
    fireEvent.click(within(screen.getByRole("region", { name: "Quick entity navigation" })).getByRole("button", { name: "AI Agent" }));
    fireEvent.change(screen.getByLabelText("Instruction"), {
      target: { value: "Create a new wire from INLET pin 7 to OBC pin 12." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Prepare" }));

    expect(await screen.findByText(/Provider draft generated/)).toBeInTheDocument();
    const proposalSummary = screen.getByRole("region", { name: "AI proposal summary" });
    expect(within(proposalSummary).getByText("add_wire")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByText("Applied 1 accepted operation. 0 accepted operations skipped.")).toBeInTheDocument();

    switchSubScreenDrawerAware("wire");
    const wiresPanel = getPanelByHeading("Wires");
    expect(within(wiresPanel).getByText("H-WIRE-INLET-OBC-P7-P12")).toBeInTheDocument();
    expect(within(wiresPanel).getByText("Inlet to OBC pin bridge")).toBeInTheDocument();
  });

  it("keeps settings and import/export controls operable on mobile baseline viewports", async () => {
    await withViewportSize({ width: 390, height: 844 }, async () => {
      const rendered = renderAppWithState(createUiIntegrationState());
      switchScreenDrawerAware("settings");
      const panel = getPanelByHeading("Import / Export networks");
      fireEvent.click(within(panel).getByRole("button", { name: "Export all" }));
      await waitFor(() => {
        expect(
          within(panel).queryByText(/Exported 1 network\(s\)/) ??
            within(panel).getByText("Export is not available in this environment.")
        ).toBeInTheDocument();
      });
      rendered.unmount();
    });

    withViewportSize({ width: 360, height: 800 }, () => {
      const rendered = renderAppWithState(createUiIntegrationState());
      switchScreenDrawerAware("settings");
      expect(getPanelByHeading("Import / Export networks")).toBeInTheDocument();
      switchScreenDrawerAware("modeling");
      expect(getPanelByHeading("Network summary")).toBeInTheDocument();
      rendered.unmount();
    });
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

  it("overrides Ctrl+S even when keyboard shortcuts are disabled and input is focused", async () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");

    const shortcutPanel = getPanelByHeading("Action bar and shortcuts");
    fireEvent.click(within(shortcutPanel).getByLabelText("Enable keyboard shortcuts (undo/redo/navigation/issues/view)"));

    const appearancePanel = getPanelByHeading("Appearance preferences");
    const focusedInput = within(appearancePanel).getByLabelText("Theme mode");
    (focusedInput as HTMLSelectElement).focus();

    const shortcutEvent = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true,
      cancelable: true
    });
    focusedInput.dispatchEvent(shortcutEvent);

    expect(shortcutEvent.defaultPrevented).toBe(true);
    const confirmDialog = await screen.findByRole("dialog", { name: "Save active network" });
    expect(within(confirmDialog).getByText(/Filename/i)).toBeInTheDocument();
    expect(within(confirmDialog).getByText(/electrical-network-active-.*\.json/i)).toBeInTheDocument();
    fireEvent.click(within(confirmDialog).getByRole("button", { name: "Save" }));

    const importExportPanel = getPanelByHeading("Import / Export networks");
    await waitFor(() => {
      expect(
        within(importExportPanel).queryByText("Exported 1 network(s) (active).") ??
          within(importExportPanel).getByText("Export is not available in this environment.")
      ).toBeInTheDocument();
    });
  });

  it("overrides Ctrl+S without active network and keeps app-level export error feedback", async () => {
    const initialState = createInitialState();
    const noActiveNetworkState = appReducer(initialState, appActions.deleteNetwork(initialState.activeNetworkId as NetworkId));
    renderAppWithState(noActiveNetworkState);
    switchScreenDrawerAware("settings");

    const shortcutEvent = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(shortcutEvent);
    expect(shortcutEvent.defaultPrevented).toBe(true);

    const importExportPanel = getPanelByHeading("Import / Export networks");
    await waitFor(() => {
      expect(within(importExportPanel).getByText("No network available for the selected export scope.")).toBeInTheDocument();
    });
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

  it("persists global preferences for floating inspector visibility and wide screen layout override", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const globalPreferencesPanel = getPanelByHeading("Global preferences");
    const inspectorToggle = within(globalPreferencesPanel).getByLabelText("Show floating inspector panel on supported screens");
    const layoutSelect = within(globalPreferencesPanel).getByLabelText("Workspace panels layout");
    const wideScreenToggle = within(globalPreferencesPanel).getByLabelText("Wide screen (remove app max width cap)");
    const appShell = document.querySelector("main.app-shell");

    expect(inspectorToggle).toBeChecked();
    expect(layoutSelect).toHaveValue("singleColumn");
    expect(layoutSelect).toBeDisabled();
    expect(wideScreenToggle).not.toBeChecked();
    expect(appShell).not.toBeNull();
    expect(appShell).not.toHaveClass("workspace-wide-screen");

    fireEvent.click(inspectorToggle);
    fireEvent.click(wideScreenToggle);
    expect(appShell).toHaveClass("workspace-wide-screen");

    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const restoredGlobalPreferencesPanel = getPanelByHeading("Global preferences");
    expect(
      within(restoredGlobalPreferencesPanel).getByLabelText("Show floating inspector panel on supported screens")
    ).not.toBeChecked();
    expect(within(restoredGlobalPreferencesPanel).getByLabelText("Workspace panels layout")).toHaveValue("singleColumn");
    expect(within(restoredGlobalPreferencesPanel).getByLabelText("Workspace panels layout")).toBeDisabled();
    expect(within(restoredGlobalPreferencesPanel).getByLabelText("Wide screen (remove app max width cap)")).toBeChecked();
    expect(document.querySelector("main.app-shell")).toHaveClass("workspace-wide-screen");
  });

  it("searches settings labels, highlights matches, and preserves label wiring", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");

    const searchInput = screen.getByLabelText("Search settings");
    fireEvent.change(searchInput, { target: { value: "language" } });

    const globalPreferencesPanel = getPanelByHeading("Global preferences");
    expect(within(globalPreferencesPanel).getByLabelText("Language")).toHaveValue("en");
    expect(within(globalPreferencesPanel).getByText("Language", { selector: "mark.settings-search-highlight" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/matching setting label/i);

    fireEvent.change(searchInput, { target: { value: "" } });
    expect(screen.queryByRole("status")).toBeNull();
    expect(document.querySelector("mark.settings-search-highlight")).toBeNull();
  });

  it("shows no-match feedback without changing settings values", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");

    const appearancePanel = getPanelByHeading("Appearance preferences");
    const tableDensity = within(appearancePanel).getByLabelText("Table density");
    const initialTableDensity = (tableDensity as HTMLSelectElement).value;

    fireEvent.change(screen.getByLabelText("Search settings"), { target: { value: "does not exist" } });

    expect(screen.getByRole("status")).toHaveTextContent("No setting label matches this search.");
    expect(tableDensity).toHaveValue(initialTableDensity);
    expect(getPanelByHeading("Appearance preferences")).toBeInTheDocument();
  });

  it("navigates settings sections and exposes search match counts in the glossary", () => {
    const originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView
    });

    try {
      renderAppWithState(createUiIntegrationState());
      switchScreenDrawerAware("settings");

      const settingsNavigation = screen.getByRole("navigation", { name: "Settings sections" });
      expect(within(settingsNavigation).getByRole("button", { name: "AI provider" })).toHaveAttribute("aria-current", "location");

      const catalogSectionButton = within(settingsNavigation).getByRole("button", { name: "Catalog & BOM setup" });
      fireEvent.click(catalogSectionButton);
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(catalogSectionButton).toHaveClass("is-active");
      expect(catalogSectionButton).toHaveAttribute("aria-current", "location");

      fireEvent.change(screen.getByLabelText("Search settings"), { target: { value: "tax" } });

      expect(within(settingsNavigation).getByRole("button", { name: "Catalog & BOM setup2" })).toBeInTheDocument();
      expect(within(settingsNavigation).getByRole("button", { name: "AI provider0" })).toHaveClass("is-dimmed");
      expect(within(getPanelByHeading("Catalog & BOM setup")).getAllByText(/tax/i, { selector: "mark.settings-search-highlight" }).length).toBeGreaterThan(0);
    } finally {
      if (originalScrollIntoViewDescriptor === undefined) {
        Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
      } else {
        Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScrollIntoViewDescriptor);
      }
    }
  });

  it("keeps settings section navigation reachable on narrow viewports", () => {
    withViewportSize({ width: 390, height: 760 }, () => {
      renderAppWithState(createUiIntegrationState());
      switchScreenDrawerAware("settings");

      expect(screen.getByRole("navigation", { name: "Settings sections" })).toBeInTheDocument();
      expect(screen.getByLabelText("Search settings")).toBeInTheDocument();
      expect(getPanelByHeading("AI provider")).toBeInTheDocument();
      expect(getPanelByHeading("Sample network controls")).toBeInTheDocument();
    });
  });

  it("docks settings search into the header after the source field scrolls under it", async () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");

    const headerBlock = document.querySelector(".header-block");
    const sourceSearchField = document.querySelector("[data-settings-search-source='true']");
    expect(headerBlock).not.toBeNull();
    expect(sourceSearchField).not.toBeNull();
    expect(document.querySelector(".header-docked-nav-shell .settings-search-field--header")).toBeNull();

    Object.defineProperty(headerBlock, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ top: 0, right: 1200, bottom: 72, left: 0, width: 1200, height: 72, x: 0, y: 0 })
    });
    Object.defineProperty(sourceSearchField, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ top: 48, right: 800, bottom: 96, left: 240, width: 560, height: 48, x: 240, y: 48 })
    });

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    await waitFor(() => expect(document.querySelector(".header-docked-nav-shell")).toHaveClass("is-visible"));
    const headerSearchField = document.querySelector(".header-docked-nav-shell .settings-search-field--header");
    expect(headerSearchField).not.toBeNull();
    const headerSearchInput = within(headerSearchField as HTMLElement).getByRole("searchbox");
    fireEvent.change(headerSearchInput, { target: { value: "tax" } });

    const sourceSearchInput = within(sourceSearchField as HTMLElement).getByRole("searchbox");
    expect(sourceSearchInput).toHaveValue("tax");
    expect(screen.getByRole("status")).toHaveTextContent("matching setting labels");
  });

});

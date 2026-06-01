import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CatalogItemId, ConnectorId, NetworkId } from "../core/entities";
import { asConnectorId, createUiIntegrationState, getPanelByHeading, renderAppWithState, switchScreenDrawerAware, switchSubScreenDrawerAware } from "./helpers/app-ui-test-utils";
import { appActions, appReducer, createSampleNetworkState } from "../store";
import { buildAiAgentContext } from "../app/lib/aiAgentContext";
import { AI_AGENT_PANEL_PREFERENCES_STORAGE_KEY } from "../app/lib/aiAgentPanelPreferences";
import { buildAiAgentEditablePlan } from "../app/lib/aiAgentPlanDiff";

describe("App integration UI - settings AI Agent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
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
    expect(within(aiProviderPanel).getByLabelText("Model")).toHaveValue("gpt-5.5");
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
      appActions.select({ kind: "catalog", id: "CAT-CHG-SERVICE-4W" })
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

});

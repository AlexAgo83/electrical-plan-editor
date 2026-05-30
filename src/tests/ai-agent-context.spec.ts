import { describe, expect, it } from "vitest";
import type { CatalogItemId, ConnectorId } from "../core/entities";
import { createEmptyWorkspaceState, createSampleNetworkState } from "../store";
import { buildAiAgentContext } from "../app/lib/aiAgentContext";

describe("AI agent context builder", () => {
  it("builds an active-network context summary from the current modeling state", () => {
    const state = createSampleNetworkState();
    const context = buildAiAgentContext(state, "activeNetwork");

    expect(context.schemaVersion).toBe(1);
    expect(context.summary.isAvailable).toBe(true);
    expect(context.summary.networkName).toBe("Main network (Sample)");
    expect(context.summary.counts).toEqual({
      connectors: state.connectors.allIds.length,
      splices: state.splices.allIds.length,
      nodes: state.nodes.allIds.length,
      segments: state.segments.allIds.length,
      wires: state.wires.allIds.length,
      catalogItems: state.catalogItems.allIds.length
    });
    expect(context.entities.connectors).toContainEqual(
      expect.objectContaining({
        technicalId: "CONN-SRC-01"
      })
    );
  });

  it("builds a narrow current-selection context when a modeling entity is selected", () => {
    const baseState = createSampleNetworkState();
    const state = {
      ...baseState,
      ui: {
        ...baseState.ui,
        selected: {
          kind: "connector" as const,
          id: "C-SRC" as ConnectorId
        }
      }
    };
    const context = buildAiAgentContext(state, "currentSelection");

    expect(context.summary.isAvailable).toBe(true);
    expect(context.summary.selectionLabel).toBe("Connector CONN-SRC-01");
    expect(context.summary.counts.connectors).toBe(1);
    expect(context.summary.counts.wires).toBe(0);
    expect(context.summary.counts.catalogItems).toBe(0);
  });

  it("builds a narrow current-selection context when a catalog item is selected", () => {
    const baseState = createSampleNetworkState();
    const state = {
      ...baseState,
      ui: {
        ...baseState.ui,
        selected: {
          kind: "catalog" as const,
          id: "CAT-SAMPLE-SRC-12W" as CatalogItemId
        }
      }
    };
    const context = buildAiAgentContext(state, "currentSelection");

    expect(context.summary.isAvailable).toBe(true);
    expect(context.summary.selectionLabel).toBe("Catalog SAMPLE-CAT-SRC-12W");
    expect(context.summary.counts.catalogItems).toBe(1);
    expect(context.entities.catalogItems).toEqual([
      expect.objectContaining({
        id: "CAT-SAMPLE-SRC-12W",
        connectionCount: 12
      })
    ]);
  });

  it("marks current-selection context unavailable without a valid selected entity", () => {
    const context = buildAiAgentContext(createSampleNetworkState(), "currentSelection");

    expect(context.summary.isAvailable).toBe(false);
    expect(context.summary.unavailableReason).toBe("Select a Modeling entity before using current selection scope.");
    expect(context.summary.networkName).toBe("Main network (Sample)");
  });

  it("marks all context unavailable when no active network exists", () => {
    const context = buildAiAgentContext(createEmptyWorkspaceState(), "activeNetwork");

    expect(context.summary.isAvailable).toBe(false);
    expect(context.summary.unavailableReason).toBe("No active network is available.");
    expect(context.entities.connectors).toHaveLength(0);
    expect(context.entities.catalogItems).toHaveLength(0);
  });

  it("builds selected harness and all-network scopes", () => {
    const state = createSampleNetworkState();
    const selectedHarnessContext = buildAiAgentContext(state, "selectedHarness");
    const allNetworksContext = buildAiAgentContext(state, "allNetworks");

    expect(selectedHarnessContext.summary.scopeLabel).toBe("Selected harness");
    expect(selectedHarnessContext.summary.isAvailable).toBe(true);
    expect(selectedHarnessContext.summary.counts.connectors).toBeGreaterThan(state.connectors.allIds.length);
    expect(allNetworksContext.summary.scopeLabel).toBe("All networks");
    expect(allNetworksContext.summary.counts.wires).toBeGreaterThan(state.wires.allIds.length);
  });
});

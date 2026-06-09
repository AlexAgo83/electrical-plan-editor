import { describe, expect, it } from "vitest";
import { buildMultiNetworkFunctionalAnalysisModel } from "../app/lib/multiNetworkFunctionalAnalysis";
import type { CatalogItem } from "../core/entities";
import type { NetworkScopedState } from "../store";
import { createSampleNetworkState } from "../store";
import { computePinElectricalLoad } from "../core/pinElectricalLoad";

const MAX_RELEASE_GATE_RATIO = 1.3;
const CURRENT_NETWORK_BASELINE_MS = 40;
const MULTI_NETWORK_VIEW_BASELINE_MS = 80;

function entityValues<T, Id extends string>(state: { byId: Record<Id, T>; allIds: Id[] }): T[] {
  return state.allIds.map((id) => state.byId[id]).filter((entry): entry is T => entry !== undefined);
}

function catalogItemsForScopedState(state: NetworkScopedState): CatalogItem[] {
  return entityValues(state.catalogItems);
}

function measureMedianMs(callback: () => void): number {
  callback();
  const samples: number[] = [];
  for (let index = 0; index < 7; index += 1) {
    const startedAt = performance.now();
    callback();
    samples.push(performance.now() - startedAt);
  }
  return samples.sort((left, right) => left - right)[Math.floor(samples.length / 2)] ?? 0;
}

describe("pin role release gate", () => {
  it("keeps in-network engine and multi-network analysis within captured performance budgets", () => {
    const state = createSampleNetworkState();
    const largestNetworkId = state.networks.allIds.reduce((largestId, networkId) => {
      const largestScoped = state.networkStates[largestId];
      const scoped = state.networkStates[networkId];
      const largestSize = (largestScoped?.connectors.allIds.length ?? 0) + (largestScoped?.wires.allIds.length ?? 0);
      const size = (scoped?.connectors.allIds.length ?? 0) + (scoped?.wires.allIds.length ?? 0);
      return size > largestSize ? networkId : largestId;
    }, state.activeNetworkId ?? state.networks.allIds[0]!);
    const scoped = state.networkStates[largestNetworkId];
    const network = state.networks.byId[largestNetworkId];
    if (scoped === undefined || network === undefined) {
      throw new Error("Expected largest sample network to have scoped state.");
    }
    const catalogItems = [...entityValues(state.catalogItems), ...catalogItemsForScopedState(scoped)];
    const catalogItemsById = new Map(catalogItems.map((item) => [item.id, item]));

    const currentNetworkMs = measureMedianMs(() => {
      computePinElectricalLoad(
        {
          networkId: largestNetworkId,
          connectors: entityValues(scoped.connectors),
          splices: entityValues(scoped.splices),
          wires: entityValues(scoped.wires),
          catalogItemsById
        },
        { kind: "currentNetwork" }
      );
    });
    const multiNetworkViewMs = measureMedianMs(() => {
      buildMultiNetworkFunctionalAnalysisModel({
        activeNetworkId: largestNetworkId,
        networks: entityValues(state.networks),
        harnessAssemblies: entityValues(state.harnessAssemblies),
        networkStates: state.networkStates,
        currentNetworkState: scoped,
        catalogItems: entityValues(state.catalogItems),
        scope: "assembly"
      });
    });

    expect(currentNetworkMs / CURRENT_NETWORK_BASELINE_MS).toBeLessThanOrEqual(MAX_RELEASE_GATE_RATIO);
    expect(multiNetworkViewMs / MULTI_NETWORK_VIEW_BASELINE_MS).toBeLessThanOrEqual(MAX_RELEASE_GATE_RATIO);
  });
});

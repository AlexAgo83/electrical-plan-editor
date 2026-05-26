import { describe, expect, it } from "vitest";
import { isEditedConnectorLayout } from "../core/connectorLayout";
import type { ConnectorId, HarnessAssemblyId, NetworkId, SegmentId, WireId } from "../core/entities";
import {
  createInitialState,
  createSampleNetworkState,
  hasSampleNetworkSignature,
  isWorkspaceEmpty
} from "../store";

function asWireId(value: string): WireId {
  return value as WireId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asHarnessAssemblyId(value: string): HarnessAssemblyId {
  return value as HarnessAssemblyId;
}

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

describe("sample network fixture", () => {
  it("creates a comprehensive deterministic sample state", () => {
    const state = createSampleNetworkState();

    expect(state.networks.allIds.length).toBeGreaterThanOrEqual(5);
    expect(Object.values(state.networks.byId).map((network) => network.technicalId)).toEqual(
      expect.arrayContaining([
        "NET-MAIN-SAMPLE",
        "NET-LIGHTING-DEMO",
        "NET-SENSOR-BB-DEMO",
        "NET-DOOR-MODULE-SAMPLE",
        "NET-CHARGING-SERVICE-SAMPLE"
      ])
    );
    expect(state.connectors.allIds.length).toBeGreaterThanOrEqual(3);
    expect(state.splices.allIds.length).toBeGreaterThanOrEqual(2);
    expect(state.nodes.allIds.length).toBeGreaterThanOrEqual(8);
    expect(state.segments.allIds.length).toBeGreaterThanOrEqual(9);
    expect(state.wires.allIds.length).toBeGreaterThanOrEqual(5);
    expect(state.ui.lastError).toBeNull();
    expect(hasSampleNetworkSignature(state)).toBe(true);
    expect(isWorkspaceEmpty(state)).toBe(false);
  });

  it("includes a locked-route wire scenario in the fixture", () => {
    const state = createSampleNetworkState();
    const lockedWire = state.wires.byId[asWireId("W-004")];

    expect(lockedWire).toBeDefined();
    expect(lockedWire?.isRouteLocked).toBe(true);
    expect(lockedWire?.routeSegmentIds).toEqual([
      asSegmentId("SEG-001"),
      asSegmentId("SEG-002"),
      asSegmentId("SEG-005"),
      asSegmentId("SEG-006")
    ]);
    expect(lockedWire?.lengthMm).toBe(120);
  });

  it("assigns catalog items to sample connectors and splices across built-in demo networks", () => {
    const state = createSampleNetworkState();
    const sampleTechnicalIds = new Set([
      "NET-MAIN-SAMPLE",
      "NET-LIGHTING-DEMO",
      "NET-SENSOR-BB-DEMO",
      "NET-DOOR-MODULE-SAMPLE",
      "NET-CHARGING-SERVICE-SAMPLE"
    ]);

    for (const networkId of state.networks.allIds) {
      const network = state.networks.byId[networkId];
      const scoped = state.networkStates[networkId];
      if (network === undefined || scoped === undefined || !sampleTechnicalIds.has(network.technicalId)) {
        continue;
      }

      expect(scoped.catalogItems.allIds.length).toBeGreaterThan(0);
      for (const connectorId of scoped.connectors.allIds) {
        expect(scoped.connectors.byId[connectorId]?.catalogItemId).toBeDefined();
      }
      for (const spliceId of scoped.splices.allIds) {
        expect(scoped.splices.byId[spliceId]?.catalogItemId).toBeDefined();
      }
    }
  });

  it("includes a harness assembly across the built-in demo networks", () => {
    const state = createSampleNetworkState();
    const assembly = state.harnessAssemblies.byId[asHarnessAssemblyId("assembly-sample-vehicle-platform")];

    expect(assembly).toBeDefined();
    expect(assembly?.members.map((member) => member.networkId)).toEqual([
      asNetworkId("network-main"),
      asNetworkId("network-lighting-demo"),
      asNetworkId("network-sensor-backbone-demo"),
      asNetworkId("network-door-module-demo"),
      asNetworkId("network-charging-service-demo")
    ]);
    expect(assembly?.masterConnectorRefs).toEqual([
      { networkId: asNetworkId("network-main"), connectorId: asConnectorId("C-SRC") },
      { networkId: asNetworkId("network-lighting-demo"), connectorId: asConnectorId("L-C-SRC") },
      { networkId: asNetworkId("network-sensor-backbone-demo"), connectorId: asConnectorId("S-C-ECU") },
      { networkId: asNetworkId("network-door-module-demo"), connectorId: asConnectorId("D-C-BODY") },
      { networkId: asNetworkId("network-charging-service-demo"), connectorId: asConnectorId("H-C-INLET") }
    ]);
    expect(assembly?.connectorLinks).toHaveLength(4);
    expect(state.networkStates[asNetworkId("network-main")]?.connectors.byId[asConnectorId("C-SRC")]?.isMainHarnessConnector).toBe(true);
    expect(state.networkStates[asNetworkId("network-lighting-demo")]?.connectors.byId[asConnectorId("L-C-SRC")]?.isMainHarnessConnector).toBe(true);
    expect(state.networkStates[asNetworkId("network-sensor-backbone-demo")]?.connectors.byId[asConnectorId("S-C-ECU")]?.isMainHarnessConnector).toBe(true);
    expect(state.networkStates[asNetworkId("network-door-module-demo")]?.connectors.byId[asConnectorId("D-C-BODY")]?.isMainHarnessConnector).toBe(true);
    expect(state.networkStates[asNetworkId("network-charging-service-demo")]?.connectors.byId[asConnectorId("H-C-INLET")]?.isMainHarnessConnector).toBe(true);
  });

  it("uses colored sample wires and edited connector layouts across built-in demo networks", () => {
    const state = createSampleNetworkState();

    for (const networkId of state.networks.allIds) {
      const scoped = state.networkStates[networkId];
      expect(scoped).toBeDefined();
      if (scoped === undefined) {
        continue;
      }

      for (const wireId of scoped.wires.allIds) {
        const wire = scoped.wires.byId[wireId];
        expect(wire?.primaryColorId, `${wireId} should have a primary sample color`).not.toBeNull();
      }

      for (const connectorId of scoped.connectors.allIds) {
        const connector = scoped.connectors.byId[connectorId];
        const catalogItem = connector?.catalogItemId === undefined ? undefined : scoped.catalogItems.byId[connector.catalogItemId];
        expect(catalogItem?.connectorLayout, `${connectorId} should have a connector layout`).toBeDefined();
        expect(
          isEditedConnectorLayout(catalogItem?.connectorLayout, connector?.cavityCount ?? 1),
          `${connectorId} should use a custom connector layout`
        ).toBe(true);
      }
    }
  });

  it("keeps source connector occupancy coherent for seeded wires", () => {
    const state = createSampleNetworkState();
    const sourceOccupancy = state.connectorCavityOccupancy[asConnectorId("C-SRC")];

    expect(sourceOccupancy?.[1]).toBe("wire:W-001:A");
    expect(sourceOccupancy?.[2]).toBe("wire:W-002:A");
    expect(sourceOccupancy?.[3]).toBe("wire:W-004:A");
  });

  it("identifies an empty initial state correctly", () => {
    const initialState = createInitialState();

    expect(isWorkspaceEmpty(initialState)).toBe(true);
    expect(hasSampleNetworkSignature(initialState)).toBe(false);
  });
});

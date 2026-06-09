import { describe, expect, it } from "vitest";
import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  HarnessAssembly,
  HarnessAssemblyId,
  InterHarnessConnectorLinkId,
  Network,
  NetworkId,
  Splice,
  SpliceId,
  Wire,
  WireId
} from "../core/entities";
import { buildMultiNetworkFunctionalAnalysisModel } from "../app/lib/multiNetworkFunctionalAnalysis";
import { createEmptyNetworkScopedState, type NetworkScopedState } from "../store";

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asSpliceId(value: string): SpliceId {
  return value as SpliceId;
}

function asWireId(value: string): WireId {
  return value as WireId;
}

function network(id: string, name: string): Network {
  return {
    id: asNetworkId(id),
    name,
    technicalId: id.toUpperCase(),
    createdAt: "2026-06-09T00:00:00.000Z",
    updatedAt: "2026-06-09T00:00:00.000Z"
  };
}

function connector(id: string, extras: Partial<Connector> = {}): Connector {
  return {
    id: asConnectorId(id),
    name: id,
    technicalId: id,
    cavityCount: 1,
    ...extras
  };
}

function splice(id: string): Splice {
  return {
    id: asSpliceId(id),
    name: id,
    technicalId: id,
    portCount: 1
  };
}

function wire(
  id: string,
  endpointA: Wire["endpointA"],
  endpointB: Wire["endpointB"],
  extras: Partial<Wire> = {}
): Wire {
  return {
    id: asWireId(id),
    name: id,
    technicalId: id,
    sectionMm2: 1,
    primaryColorId: null,
    secondaryColorId: null,
    endpointA,
    endpointB,
    routeSegmentIds: [],
    lengthMm: 0,
    isRouteLocked: false,
    ...extras
  };
}

function scopedState(input: {
  connectors?: Connector[];
  splices?: Splice[];
  wires?: Wire[];
}): NetworkScopedState {
  const scoped = createEmptyNetworkScopedState();
  for (const item of input.connectors ?? []) {
    scoped.connectors.byId[item.id] = item;
    scoped.connectors.allIds.push(item.id);
  }
  for (const item of input.splices ?? []) {
    scoped.splices.byId[item.id] = item;
    scoped.splices.allIds.push(item.id);
  }
  for (const item of input.wires ?? []) {
    scoped.wires.byId[item.id] = item;
    scoped.wires.allIds.push(item.id);
  }
  return scoped;
}

describe("buildMultiNetworkFunctionalAnalysisModel", () => {
  it("returns current-network D1-D4 findings for the active scope", () => {
    const netA = network("net-a", "Main network");
    const consumer = connector("C-load", {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 5 } }
    });
    const bus = splice("S-bus");
    const loadWire = wire(
      "W-load",
      { kind: "connectorCavity", connectorId: consumer.id, cavityIndex: 1 },
      { kind: "splicePort", spliceId: bus.id, portIndex: 1 }
    );
    const scoped = scopedState({ connectors: [consumer], splices: [bus], wires: [loadWire] });

    const model = buildMultiNetworkFunctionalAnalysisModel({
      activeNetworkId: netA.id,
      networks: [netA],
      harnessAssemblies: [],
      networkStates: { [netA.id]: scoped },
      currentNetworkState: scoped,
      catalogItems: [],
      scope: "current"
    });

    expect(model.scope).toBe("current");
    expect(model.findings).toHaveLength(1);
    expect(model.findings[0]?.family).toBe("D1-D4");
    expect(model.findings[0]?.message).toContain("no declared source");
    expect(model.findings[0]?.target).toEqual({
      networkId: netA.id,
      subScreen: "wire",
      selectionKind: "wire",
      selectionId: loadWire.id
    });
    expect(model.summary.warnings).toBe(1);
  });

  it("adds L1 findings when the active network belongs to an assembly", () => {
    const netA = network("net-a", "Front harness");
    const netB = network("net-b", "Door harness");
    const portA = connector("C-front", {
      pinElectricalRoles: { 1: { role: "source", currentA: 10 } }
    });
    const portB = connector("C-door", {
      pinElectricalRoles: { 1: { role: "source", currentA: 8 } }
    });
    const scopedA = scopedState({ connectors: [portA] });
    const scopedB = scopedState({ connectors: [portB] });
    const assembly: HarnessAssembly = {
      id: "asm-main" as HarnessAssemblyId,
      name: "Vehicle harness",
      technicalId: "ASM-MAIN",
      members: [
        { networkId: netA.id, color: "#2f6bff" },
        { networkId: netB.id, color: "#e05c2f" }
      ],
      masterConnectorRefs: [],
      connectorLinks: [
        {
          id: "link-front-door" as InterHarnessConnectorLinkId,
          name: "Front to door",
          sourceNetworkId: netA.id,
          sourceConnectorId: portA.id,
          targetNetworkId: netB.id,
          targetConnectorId: portB.id
        }
      ],
      createdAt: "2026-06-09T00:00:00.000Z",
      updatedAt: "2026-06-09T00:00:00.000Z"
    };

    const model = buildMultiNetworkFunctionalAnalysisModel({
      activeNetworkId: netA.id,
      networks: [netA, netB],
      harnessAssemblies: [assembly],
      networkStates: { [netA.id]: scopedA, [netB.id]: scopedB },
      currentNetworkState: scopedA,
      catalogItems: [],
      scope: "assembly"
    });

    expect(model.scope).toBe("assembly");
    expect(model.activeAssemblyName).toBe("Vehicle harness");
    expect(model.availableNetworkCount).toBe(2);
    expect(model.selectedNetworkLabels).toEqual(["Front harness", "Door harness"]);
    expect(model.findings.some((finding) => finding.family === "L1" && finding.message.includes("Front to door"))).toBe(true);
    expect(model.findings.find((finding) => finding.family === "L1")?.target).toEqual({
      networkId: netA.id,
      subScreen: "connector",
      selectionKind: "connector",
      selectionId: portA.id
    });
    expect(model.summary.l1).toBe(1);
  });

  it("computes assembly-grade D1 and D2 findings across selected networks", () => {
    const netA = network("net-a", "Front harness");
    const netB = network("net-b", "Door harness");
    const fuseCatalog: CatalogItem = {
      id: "fuse-8a" as CatalogItemId,
      manufacturerReference: "FUSE-8A",
      name: "Fuse 8A",
      connectionCount: 2
    };
    const source = connector("C-source", {
      cavityCount: 2,
      pinElectricalRoles: {
        1: { role: "source", currentA: 12 },
        2: { role: "consumer", currentA: 5 }
      }
    });
    const portA = connector("C-front");
    const portB = connector("C-door");
    const consumer = connector("C-load", {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 12 } }
    });
    const protectedWire = wire(
      "W-front",
      { kind: "connectorCavity", connectorId: source.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: portA.id, cavityIndex: 1 },
      { sectionMm2: 0.5, protection: { kind: "fuse", catalogItemId: fuseCatalog.id } }
    );
    const loadWire = wire(
      "W-door",
      { kind: "connectorCavity", connectorId: portB.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: consumer.id, cavityIndex: 1 }
    );
    const scopedA = scopedState({ connectors: [source, portA], wires: [protectedWire] });
    const scopedB = scopedState({ connectors: [portB, consumer], wires: [loadWire] });
    const assembly: HarnessAssembly = {
      id: "asm-main" as HarnessAssemblyId,
      name: "Vehicle harness",
      technicalId: "ASM-MAIN",
      members: [
        { networkId: netA.id, color: "#2f6bff" },
        { networkId: netB.id, color: "#e05c2f" }
      ],
      masterConnectorRefs: [{ networkId: netA.id, connectorId: portA.id }],
      connectorLinks: [
        {
          id: "link-front-door" as InterHarnessConnectorLinkId,
          name: "Front to door",
          sourceNetworkId: netA.id,
          sourceConnectorId: portA.id,
          targetNetworkId: netB.id,
          targetConnectorId: portB.id
        }
      ],
      createdAt: "2026-06-09T00:00:00.000Z",
      updatedAt: "2026-06-09T00:00:00.000Z"
    };

    const model = buildMultiNetworkFunctionalAnalysisModel({
      activeNetworkId: netA.id,
      networks: [netA, netB],
      harnessAssemblies: [assembly],
      networkStates: { [netA.id]: scopedA, [netB.id]: scopedB },
      currentNetworkState: scopedA,
      catalogItems: [fuseCatalog],
      scope: "assembly"
    });

    expect(model.findings.some((finding) => finding.id === `assembly-d1-${netA.id}-${protectedWire.id}`)).toBe(true);
    expect(model.findings.some((finding) => finding.id === `assembly-d2-${netA.id}-${protectedWire.id}`)).toBe(true);
    expect(model.findings.some((finding) => finding.id === `assembly-d3-${netA.id}-${source.id}`)).toBe(true);
    expect(model.findings.some((finding) => finding.id.includes("d4-no-source"))).toBe(false);
    expect(model.schematic?.nodeCount).toBeGreaterThan(0);
  });

  it("limits custom scope to selected assembly networks", () => {
    const netA = network("net-a", "Front harness");
    const netB = network("net-b", "Door harness");
    const portA = connector("C-front");
    const portB = connector("C-door");
    const scopedA = scopedState({ connectors: [portA] });
    const scopedB = scopedState({ connectors: [portB] });
    const assembly: HarnessAssembly = {
      id: "asm-main" as HarnessAssemblyId,
      name: "Vehicle harness",
      technicalId: "ASM-MAIN",
      members: [
        { networkId: netA.id, color: "#2f6bff" },
        { networkId: netB.id, color: "#e05c2f" }
      ],
      masterConnectorRefs: [],
      connectorLinks: [],
      createdAt: "2026-06-09T00:00:00.000Z",
      updatedAt: "2026-06-09T00:00:00.000Z"
    };

    const model = buildMultiNetworkFunctionalAnalysisModel({
      activeNetworkId: netA.id,
      networks: [netA, netB],
      harnessAssemblies: [assembly],
      networkStates: { [netA.id]: scopedA, [netB.id]: scopedB },
      currentNetworkState: scopedA,
      catalogItems: [],
      scope: "custom",
      customNetworkIds: [netB.id]
    });

    expect(model.scope).toBe("custom");
    expect(model.selectedNetworkLabels).toEqual(["Door harness"]);
    expect(model.networkOptions).toEqual([
      { id: netA.id, label: "Front harness", selected: false },
      { id: netB.id, label: "Door harness", selected: true }
    ]);
  });
});

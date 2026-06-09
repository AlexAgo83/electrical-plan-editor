import { describe, expect, it } from "vitest";
import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  Network,
  Splice,
  Wire,
  WireId
} from "../core/entities";
import { appendElectricalDimensioningIssues, ELECTRICAL_DIMENSIONING_CATEGORY } from "../app/hook-impl/validation/appendElectricalDimensioningIssues";
import type { ValidationIssue } from "../app/types/app-controller";
import { createSampleNetworkState } from "../store";

function makeConnector(
  id: string,
  cavityCount: number,
  extras: Partial<Connector> = {}
): Connector {
  return {
    id: id as ConnectorId,
    name: id,
    technicalId: id,
    cavityCount,
    ...extras
  };
}

function makeWire(
  id: string,
  endpointA: Wire["endpointA"],
  endpointB: Wire["endpointB"],
  extras: Partial<Wire> = {}
): Wire {
  return {
    id: id as WireId,
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

function makeNetwork(extras: Partial<Network> = {}): Network {
  return {
    id: "net" as Network["id"],
    name: "Network",
    technicalId: "NET",
    createdAt: "2026-06-02T00:00:00.000Z",
    updatedAt: "2026-06-02T00:00:00.000Z",
    ...extras
  };
}

function run(params: {
  connectors?: Connector[];
  splices?: Splice[];
  wires?: Wire[];
  catalogItems?: CatalogItem[];
  network?: Network | null;
}): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  appendElectricalDimensioningIssues(issues, {
    connectors: params.connectors ?? [],
    splices: params.splices ?? [],
    wires: params.wires ?? [],
    catalogItems: params.catalogItems ?? [],
    network: params.network ?? null
  });
  return issues.filter((i) => i.category === ELECTRICAL_DIMENSIONING_CATEGORY);
}

describe("appendElectricalDimensioningIssues", () => {
  it("keeps shipped sample networks silent for electrical dimensioning", () => {
    const state = createSampleNetworkState();
    const issuesByNetwork = state.networks.allIds.map((networkId) => {
      const scoped = state.networkStates[networkId];
      const network = state.networks.byId[networkId] ?? null;
      const issues = run({
        connectors: scoped?.connectors.allIds.map((id) => scoped.connectors.byId[id]).filter((entry): entry is Connector => entry !== undefined),
        splices: scoped?.splices.allIds.map((id) => scoped.splices.byId[id]).filter((entry): entry is Splice => entry !== undefined),
        wires: scoped?.wires.allIds.map((id) => scoped.wires.byId[id]).filter((entry): entry is Wire => entry !== undefined),
        catalogItems: scoped?.catalogItems.allIds.map((id) => scoped.catalogItems.byId[id]).filter((entry): entry is CatalogItem => entry !== undefined),
        network
      });
      return {
        networkId,
        issueIds: issues.map((issue) => `${issue.severity}:${issue.id}`)
      };
    });

    expect(issuesByNetwork).toEqual(
      state.networks.allIds.map((networkId) => ({
        networkId,
        issueIds: []
      }))
    );
  });

  it("emits no issue on a passive network", () => {
    const source = makeConnector("C1", 1);
    const consumer = makeConnector("C2", 1);
    const wire = makeWire(
      "W1",
      { kind: "connectorCavity", connectorId: source.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: consumer.id, cavityIndex: 1 }
    );
    expect(run({ connectors: [source, consumer], wires: [wire] })).toEqual([]);
  });

  it("D1 — wire overloaded emits an error", () => {
    const source = makeConnector("C1", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 25 } }
    });
    const consumer = makeConnector("C2", 1, {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 25 } }
    });
    const wire = makeWire(
      "W1",
      { kind: "connectorCavity", connectorId: source.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: consumer.id, cavityIndex: 1 },
      { sectionMm2: 1 }
    );
    const issues = run({ connectors: [source, consumer], wires: [wire] });
    expect(issues.some((i) => i.id === "electrical-d1-W1" && i.severity === "error")).toBe(true);
  });

  it("D1 — wire below 80% emits no issue", () => {
    const source = makeConnector("C1", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 5 } }
    });
    const consumer = makeConnector("C2", 1, {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 5 } }
    });
    const wire = makeWire(
      "W1",
      { kind: "connectorCavity", connectorId: source.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: consumer.id, cavityIndex: 1 },
      { sectionMm2: 1 }
    );
    const issues = run({ connectors: [source, consumer], wires: [wire] });
    expect(issues.filter((i) => i.id.startsWith("electrical-d1-"))).toEqual([]);
  });

  it("D2 — wire-level fuse over rating emits an error", () => {
    const fuse: CatalogItem = {
      id: "F10" as CatalogItemId,
      manufacturerReference: "F-10A",
      connectionCount: 1
    };
    const source = makeConnector("C1", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 12 } }
    });
    const consumer = makeConnector("C2", 1, {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 12 } }
    });
    const wire = makeWire(
      "W1",
      { kind: "connectorCavity", connectorId: source.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: consumer.id, cavityIndex: 1 },
      { sectionMm2: 4, protection: { kind: "fuse", catalogItemId: fuse.id } }
    );
    const issues = run({
      connectors: [source, consumer],
      wires: [wire],
      catalogItems: [fuse]
    });
    expect(issues.some((i) => i.id === "electrical-d2-W1" && i.severity === "error")).toBe(true);
  });

  it("D2 — wire-level fuse missing rating with non-zero load emits a warning", () => {
    const fuse: CatalogItem = {
      id: "F-unknown" as CatalogItemId,
      manufacturerReference: "F-MYSTERY",
      connectionCount: 1
    };
    const source = makeConnector("C1", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 5 } }
    });
    const consumer = makeConnector("C2", 1, {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 5 } }
    });
    const wire = makeWire(
      "W1",
      { kind: "connectorCavity", connectorId: source.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: consumer.id, cavityIndex: 1 },
      { sectionMm2: 4, protection: { kind: "fuse", catalogItemId: fuse.id } }
    );
    const issues = run({
      connectors: [source, consumer],
      wires: [wire],
      catalogItems: [fuse]
    });
    expect(issues.some((i) => i.id === "electrical-d2-missing-W1" && i.severity === "warning")).toBe(true);
  });

  it("D3 — supply pin under-rated vs. declared output sum emits a warning", () => {
    const ecu = makeConnector("ECU", 4, {
      pinElectricalRoles: {
        1: { role: "consumer", currentA: 5, label: "BAT+" },
        2: { role: "source", currentA: 2.5 },
        3: { role: "source", currentA: 2.5 },
        4: { role: "source", currentA: 2.5 }
      }
    });
    const issues = run({ connectors: [ecu] });
    expect(issues.some((i) => i.id === "electrical-d3-ECU" && i.severity === "warning")).toBe(true);
  });

  it("D3 — supply pin sufficient emits no D3 issue", () => {
    const ecu = makeConnector("ECU", 4, {
      pinElectricalRoles: {
        1: { role: "consumer", currentA: 40 },
        2: { role: "source", currentA: 2.5 },
        3: { role: "source", currentA: 2.5 },
        4: { role: "source", currentA: 2.5 }
      }
    });
    const issues = run({ connectors: [ecu] });
    expect(issues.filter((i) => i.id.startsWith("electrical-d3-"))).toEqual([]);
  });

  it("partial pin-role declarations never emit error-level electrical dimensioning issues", () => {
    const source = makeConnector("C1", 1, {
      pinElectricalRoles: { 1: { role: "source", label: "KL30" } }
    });
    const consumer = makeConnector("C2", 1, {
      pinElectricalRoles: { 1: { role: "consumer", label: "LOAD" } }
    });
    const wire = makeWire(
      "W1",
      { kind: "connectorCavity", connectorId: source.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: consumer.id, cavityIndex: 1 },
      { sectionMm2: 0.5 }
    );

    const issues = run({ connectors: [source, consumer], wires: [wire] });

    expect(issues.filter((i) => i.severity === "error")).toEqual([]);
  });

  it("D4 — branch with consumer and no reachable source emits a warning", () => {
    const consumer = makeConnector("C1", 1, {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 5 } }
    });
    const other = makeConnector("C2", 1);
    const wire = makeWire(
      "W1",
      { kind: "connectorCavity", connectorId: consumer.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: other.id, cavityIndex: 1 }
    );
    const issues = run({ connectors: [consumer, other], wires: [wire] });
    expect(issues.some((i) => i.id === "electrical-d4-no-source-W1")).toBe(true);
  });

  it("ampacity override on the network changes the D1 verdict", () => {
    const source = makeConnector("C1", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 25 } }
    });
    const consumer = makeConnector("C2", 1, {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 25 } }
    });
    const wire = makeWire(
      "W1",
      { kind: "connectorCavity", connectorId: source.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: consumer.id, cavityIndex: 1 },
      { sectionMm2: 1 }
    );
    const network = makeNetwork({ ampacityOverrides: { 1: 50 } });
    const issues = run({ connectors: [source, consumer], wires: [wire], network });
    expect(issues.filter((i) => i.id.startsWith("electrical-d1-"))).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  Splice,
  SpliceId,
  Wire,
  WireId
} from "../core/entities";
import {
  NotImplementedScopeError,
  computePinElectricalLoad,
  type PinElectricalLoadInput
} from "../core/pinElectricalLoad";

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

function makeSplice(id: string, portCount: number): Splice {
  return {
    id: id as SpliceId,
    name: id,
    technicalId: id,
    portCount,
    portMode: "unbounded"
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

function emptyInput(): PinElectricalLoadInput {
  return {
    connectors: [],
    splices: [],
    wires: [],
    catalogItemsById: new Map()
  };
}

describe("computePinElectricalLoad — currentNetwork", () => {
  it("returns empty results on an empty network", () => {
    const out = computePinElectricalLoad(emptyInput());
    expect(out.pinLoadByConnectorPin.size).toBe(0);
    expect(out.branchLoadByWire.size).toBe(0);
    expect(out.deviceBalance.size).toBe(0);
    expect(out.fuseProtectedLoad.size).toBe(0);
    expect(out.warnings).toEqual([]);
  });

  it("returns empty results when no pin roles are declared", () => {
    const source = makeConnector("C1", 2);
    const consumer = makeConnector("C2", 2);
    const wire = makeWire(
      "W1",
      { kind: "connectorCavity", connectorId: source.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: consumer.id, cavityIndex: 1 }
    );
    const out = computePinElectricalLoad({
      connectors: [source, consumer],
      splices: [],
      wires: [wire],
      catalogItemsById: new Map()
    });
    expect(out.pinLoadByConnectorPin.size).toBe(0);
    expect(out.branchLoadByWire.size).toBe(0);
  });

  it("linear chain: source 10 A -> wire -> consumer 10 A", () => {
    const sourceConn = makeConnector("C1", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 10 } }
    });
    const consumerConn = makeConnector("C2", 1, {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 10 } }
    });
    const wire = makeWire(
      "W1",
      { kind: "connectorCavity", connectorId: sourceConn.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: consumerConn.id, cavityIndex: 1 }
    );
    const out = computePinElectricalLoad({
      connectors: [sourceConn, consumerConn],
      splices: [],
      wires: [wire],
      catalogItemsById: new Map()
    });
    const branch = out.branchLoadByWire.get(wire.id);
    expect(branch).toBeDefined();
    expect(branch!.continuousA).toBe(10);
    expect(branch!.sourceRefs).toEqual([
      { connectorId: sourceConn.id, cavityIndex: 1 }
    ]);
    expect(branch!.consumerRefs).toEqual([
      { connectorId: consumerConn.id, cavityIndex: 1 }
    ]);
  });

  it("splice fan-out: source 10 A through splice to two consumers", () => {
    const sourceConn = makeConnector("C1", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 10 } }
    });
    const c2 = makeConnector("C2", 1, {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 4 } }
    });
    const c3 = makeConnector("C3", 1, {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 6 } }
    });
    const splice = makeSplice("S1", 3);
    const wIn = makeWire(
      "Win",
      { kind: "connectorCavity", connectorId: sourceConn.id, cavityIndex: 1 },
      { kind: "splicePort", spliceId: splice.id, portIndex: 1 }
    );
    const wOut1 = makeWire(
      "Wo1",
      { kind: "splicePort", spliceId: splice.id, portIndex: 2 },
      { kind: "connectorCavity", connectorId: c2.id, cavityIndex: 1 }
    );
    const wOut2 = makeWire(
      "Wo2",
      { kind: "splicePort", spliceId: splice.id, portIndex: 3 },
      { kind: "connectorCavity", connectorId: c3.id, cavityIndex: 1 }
    );
    const out = computePinElectricalLoad({
      connectors: [sourceConn, c2, c3],
      splices: [splice],
      wires: [wIn, wOut1, wOut2],
      catalogItemsById: new Map()
    });
    expect(out.branchLoadByWire.get(wIn.id)!.continuousA).toBe(10);
    expect(out.branchLoadByWire.get(wOut1.id)!.continuousA).toBe(10);
    expect(out.branchLoadByWire.get(wOut2.id)!.continuousA).toBe(10);
  });

  it("fuse-box pair: protected-side downstream sum reported", () => {
    const catalog: CatalogItem = {
      id: "cat-fb" as CatalogItemId,
      manufacturerReference: "FB-1",
      connectionCount: 4,
      fuseBoxConfig: {
        pairs: [{ pairIndex: 0, pinA: 1, pinB: 2 }]
      }
    };
    const fuseConn = makeConnector("FB", 4, { catalogItemId: catalog.id });
    const source = makeConnector("SRC", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 30 } }
    });
    const consumer = makeConnector("CON", 1, {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 25 } }
    });
    const wIn = makeWire(
      "Win",
      { kind: "connectorCavity", connectorId: source.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: fuseConn.id, cavityIndex: 1 }
    );
    const wOut = makeWire(
      "Wout",
      { kind: "connectorCavity", connectorId: fuseConn.id, cavityIndex: 2 },
      { kind: "connectorCavity", connectorId: consumer.id, cavityIndex: 1 }
    );
    const out = computePinElectricalLoad({
      connectors: [source, fuseConn, consumer],
      splices: [],
      wires: [wIn, wOut],
      catalogItemsById: new Map([[catalog.id, catalog]])
    });
    const fuseLoad = out.fuseProtectedLoad.get(`fuseBoxPair:${fuseConn.id}:0`);
    expect(fuseLoad).toBeDefined();
    expect(fuseLoad!.continuousA).toBe(30);
    expect(out.branchLoadByWire.get(wOut.id)!.continuousA).toBe(30);
  });

  it("ECU asymmetric device balance: supply consumer 40 A + three sources 2.5 A", () => {
    const ecu = makeConnector("ECU", 4, {
      pinElectricalRoles: {
        1: { role: "consumer", currentA: 40, label: "BAT+" },
        2: { role: "source", currentA: 2.5 },
        3: { role: "source", currentA: 2.5 },
        4: { role: "source", currentA: 2.5 }
      }
    });
    const out = computePinElectricalLoad({
      connectors: [ecu],
      splices: [],
      wires: [],
      catalogItemsById: new Map()
    });
    const balance = out.deviceBalance.get(ecu.id);
    expect(balance).toBeDefined();
    expect(balance!.totalSourceA).toBe(7.5);
    expect(balance!.totalConsumerA).toBe(40);
    expect(balance!.supplyPins).toEqual([1]);
    expect(balance!.sourcePins.sort()).toEqual([2, 3, 4]);
  });

  it("wire-level fuse protected load matches the carried current", () => {
    const cat: CatalogItem = {
      id: "fuse-cat" as CatalogItemId,
      manufacturerReference: "F-10A",
      connectionCount: 1
    };
    const source = makeConnector("SRC", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 12 } }
    });
    const consumer = makeConnector("CON", 1, {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 12 } }
    });
    const wire = makeWire(
      "W1",
      { kind: "connectorCavity", connectorId: source.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: consumer.id, cavityIndex: 1 },
      { protection: { kind: "fuse", catalogItemId: cat.id } }
    );
    const out = computePinElectricalLoad({
      connectors: [source, consumer],
      splices: [],
      wires: [wire],
      catalogItemsById: new Map([[cat.id, cat]])
    });
    const entry = out.fuseProtectedLoad.get(`wireFuse:${wire.id}`);
    expect(entry).toBeDefined();
    expect(entry!.continuousA).toBe(12);
  });

  it("bidirectional pin counts on both sides of device balance", () => {
    const c = makeConnector("C", 1, {
      pinElectricalRoles: { 1: { role: "bidirectional", currentA: 5 } }
    });
    const out = computePinElectricalLoad({
      connectors: [c],
      splices: [],
      wires: [],
      catalogItemsById: new Map()
    });
    const balance = out.deviceBalance.get(c.id);
    expect(balance!.totalSourceA).toBe(5);
    expect(balance!.totalConsumerA).toBe(5);
  });

  it("is referentially transparent for the same input", () => {
    const c = makeConnector("C", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 5 } }
    });
    const input: PinElectricalLoadInput = {
      connectors: [c],
      splices: [],
      wires: [],
      catalogItemsById: new Map()
    };
    const a = computePinElectricalLoad(input);
    const b = computePinElectricalLoad(input);
    expect([...a.deviceBalance.entries()]).toEqual([...b.deviceBalance.entries()]);
  });
});

describe("computePinElectricalLoad — assembly scope", () => {
  it("throws NotImplementedScopeError until item_614", () => {
    expect(() =>
      computePinElectricalLoad(emptyInput(), { kind: "assembly", networkIds: [] })
    ).toThrow(NotImplementedScopeError);
  });
});

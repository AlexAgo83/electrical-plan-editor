import { describe, expect, it } from "vitest";
import type { ConnectorId, NetworkId, SpliceId, WireId } from "../core/entities";
import {
  buildNetworkFilePayload,
  NETWORK_FILE_PAYLOAD_KIND,
  parseNetworkFilePayload,
  resolveImportConflicts,
  serializeNetworkFilePayload
} from "../adapters/portability";
import { appActions, appReducer, createEmptyNetworkScopedState, createInitialState, createSampleNetworkState } from "../store";

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

describe("network file portability", () => {
  it("serializes export payload deterministically", () => {
    const seeded = appReducer(
      createInitialState(),
      appActions.createNetwork({
        id: asNetworkId("net-b"),
        name: "Network B",
        technicalId: "NET-B",
        createdAt: "2026-02-21T09:00:00.000Z",
        updatedAt: "2026-02-21T09:00:00.000Z"
      })
    );

    const payloadA = buildNetworkFilePayload(seeded, "all", [], "2026-02-21T10:00:00.000Z");
    const payloadB = buildNetworkFilePayload(seeded, "all", [], "2026-02-21T10:00:00.000Z");

    expect(payloadA.payloadKind).toBe(NETWORK_FILE_PAYLOAD_KIND);
    expect(payloadA.schemaVersion).toBe(2);
    expect(payloadA.source.appVersion).toBe("0.7.4");
    expect(serializeNetworkFilePayload(payloadA)).toBe(serializeNetworkFilePayload(payloadB));
  });

  it("parses and migrates schema version 0 payload", () => {
    const legacyPayload = {
      schemaVersion: 0,
      exportedAt: "2026-02-21T10:10:00.000Z",
      networks: [
        {
          network: {
            id: "legacy-net",
            name: "Legacy",
            technicalId: "NET-LEGACY",
            createdAt: "2026-02-20T10:00:00.000Z",
            updatedAt: "2026-02-20T10:00:00.000Z"
          },
          state: createEmptyNetworkScopedState()
        }
      ]
    };

    const parsed = parseNetworkFilePayload(JSON.stringify(legacyPayload));
    expect(parsed.error).toBeNull();
    expect(parsed.payload).not.toBeNull();
    expect(parsed.payload?.payloadKind).toBe(NETWORK_FILE_PAYLOAD_KIND);
    expect(parsed.payload?.schemaVersion).toBe(2);
    expect(parsed.payload?.networks).toHaveLength(1);
  });

  it("patches imported wires missing section/colors/side references to defaults", () => {
    const seeded = createSampleNetworkState();
    const payload = buildNetworkFilePayload(seeded, "active", [], "2026-02-21T10:15:00.000Z");
    const firstBundle = payload.networks[0];
    expect(firstBundle).toBeDefined();
    if (firstBundle === undefined) {
      throw new Error("Expected an exported network bundle.");
    }

    const firstWireId = firstBundle.state.wires.allIds[0];
    expect(firstWireId).toBeDefined();
    if (firstWireId === undefined) {
      throw new Error("Expected at least one wire in exported sample payload.");
    }

    const rawPayload = JSON.parse(serializeNetworkFilePayload(payload)) as Record<string, unknown>;
    const rawBundles = rawPayload.networks as Array<Record<string, unknown>>;
    const rawState = rawBundles[0]?.state as Record<string, unknown>;
    const rawWires = rawState.wires as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    delete rawWires.byId[firstWireId]?.sectionMm2;
    delete rawWires.byId[firstWireId]?.primaryColorId;
    delete rawWires.byId[firstWireId]?.secondaryColorId;
    delete rawWires.byId[firstWireId]?.freeColorLabel;
    delete rawWires.byId[firstWireId]?.endpointAConnectionReference;
    delete rawWires.byId[firstWireId]?.endpointASealReference;
    delete rawWires.byId[firstWireId]?.endpointBConnectionReference;
    delete rawWires.byId[firstWireId]?.endpointBSealReference;

    const parsed = parseNetworkFilePayload(JSON.stringify(rawPayload));
    expect(parsed.error).toBeNull();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.sectionMm2).toBe(0.5);
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.primaryColorId).toBeNull();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.secondaryColorId).toBeNull();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.freeColorLabel).toBeNull();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.endpointAConnectionReference).toBeUndefined();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.endpointASealReference).toBeUndefined();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.endpointBConnectionReference).toBeUndefined();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.endpointBSealReference).toBeUndefined();
  });

  it("normalizes imported wire side connection and seal references", () => {
    const seeded = createSampleNetworkState();
    const payload = buildNetworkFilePayload(seeded, "active", [], "2026-02-21T10:16:00.000Z");
    const rawPayload = JSON.parse(serializeNetworkFilePayload(payload)) as Record<string, unknown>;
    const rawBundles = rawPayload.networks as Array<Record<string, unknown>>;
    const rawState = rawBundles[0]?.state as Record<string, unknown>;
    const rawWires = rawState.wires as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const firstWireId = rawWires.allIds[0];
    expect(firstWireId).toBeDefined();
    if (firstWireId === undefined) {
      throw new Error("Expected an exported wire.");
    }

    rawWires.byId[firstWireId] = {
      ...rawWires.byId[firstWireId],
      endpointAConnectionReference: "  TERM-A-IMP  ",
      endpointASealReference: " ",
      endpointBConnectionReference: ` ${"D".repeat(130)} `,
      endpointBSealReference: "  SEAL-B-IMP  "
    };

    const parsed = parseNetworkFilePayload(JSON.stringify(rawPayload));
    expect(parsed.error).toBeNull();
    const normalizedWire = parsed.payload?.networks[0]?.state.wires.byId[asWireId(firstWireId)];
    expect(normalizedWire?.endpointAConnectionReference).toBe("TERM-A-IMP");
    expect(normalizedWire?.endpointASealReference).toBeUndefined();
    expect(normalizedWire?.endpointBConnectionReference).toBe("D".repeat(120));
    expect(normalizedWire?.endpointBSealReference).toBe("SEAL-B-IMP");
  });

  it("normalizes imported mixed wire color state by prioritizing freeColorLabel", () => {
    const seeded = createSampleNetworkState();
    const payload = buildNetworkFilePayload(seeded, "active", [], "2026-02-21T10:18:00.000Z");
    const rawPayload = JSON.parse(serializeNetworkFilePayload(payload)) as Record<string, unknown>;
    const rawBundles = rawPayload.networks as Array<Record<string, unknown>>;
    const rawState = rawBundles[0]?.state as Record<string, unknown>;
    const rawWires = rawState.wires as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const firstWireId = rawWires.allIds[0];
    expect(firstWireId).toBeDefined();
    if (firstWireId === undefined) {
      throw new Error("Expected an exported wire.");
    }

    rawWires.byId[firstWireId] = {
      ...rawWires.byId[firstWireId],
      colorMode: undefined,
      primaryColorId: "RD",
      secondaryColorId: "BU",
      freeColorLabel: "  legacy free color  "
    };

    const parsed = parseNetworkFilePayload(JSON.stringify(rawPayload));
    expect(parsed.error).toBeNull();
    const normalizedWire = parsed.payload?.networks[0]?.state.wires.byId[asWireId(firstWireId)];
    expect(normalizedWire?.primaryColorId).toBeNull();
    expect(normalizedWire?.secondaryColorId).toBeNull();
    expect(normalizedWire?.colorMode).toBe("free");
    expect(normalizedWire?.freeColorLabel).toBe("legacy free color");
  });

  it("preserves imported explicit free color mode with empty label as free unspecified", () => {
    const seeded = createSampleNetworkState();
    const payload = buildNetworkFilePayload(seeded, "active", [], "2026-02-21T10:19:00.000Z");
    const rawPayload = JSON.parse(serializeNetworkFilePayload(payload)) as Record<string, unknown>;
    const rawBundles = rawPayload.networks as Array<Record<string, unknown>>;
    const rawState = rawBundles[0]?.state as Record<string, unknown>;
    const rawWires = rawState.wires as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const firstWireId = rawWires.allIds[0];
    if (firstWireId === undefined) {
      throw new Error("Expected an exported wire.");
    }

    rawWires.byId[firstWireId] = {
      ...rawWires.byId[firstWireId],
      colorMode: "free",
      primaryColorId: "RD",
      secondaryColorId: "BU",
      freeColorLabel: " "
    };

    const parsed = parseNetworkFilePayload(JSON.stringify(rawPayload));
    expect(parsed.error).toBeNull();
    const normalizedWire = parsed.payload?.networks[0]?.state.wires.byId[asWireId(firstWireId)];
    expect(normalizedWire?.colorMode).toBe("free");
    expect(normalizedWire?.primaryColorId).toBeNull();
    expect(normalizedWire?.secondaryColorId).toBeNull();
    expect(normalizedWire?.freeColorLabel).toBeNull();
  });

  it("normalizes imported connector and splice manufacturer references", () => {
    const seeded = createSampleNetworkState();
    const payload = buildNetworkFilePayload(seeded, "active", [], "2026-02-21T10:17:00.000Z");
    const rawPayload = JSON.parse(serializeNetworkFilePayload(payload)) as Record<string, unknown>;
    const rawBundles = rawPayload.networks as Array<Record<string, unknown>>;
    const rawState = rawBundles[0]?.state as Record<string, unknown>;
    const rawConnectors = rawState.connectors as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const rawSplices = rawState.splices as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const firstConnectorId = rawConnectors.allIds[0];
    const firstSpliceId = rawSplices.allIds[0];
    expect(firstConnectorId).toBeDefined();
    expect(firstSpliceId).toBeDefined();
    if (firstConnectorId === undefined || firstSpliceId === undefined) {
      throw new Error("Expected exported sample payload to include connectors and splices.");
    }

    rawConnectors.byId[firstConnectorId] = {
      ...rawConnectors.byId[firstConnectorId],
      manufacturerReference: ` ${"A".repeat(130)} `
    };
    rawSplices.byId[firstSpliceId] = {
      ...rawSplices.byId[firstSpliceId],
      manufacturerReference: " "
    };

    const parsed = parseNetworkFilePayload(JSON.stringify(rawPayload));
    expect(parsed.error).toBeNull();
    expect(parsed.payload).not.toBeNull();
    const normalizedState = parsed.payload?.networks[0]?.state;
    const normalizedConnector = normalizedState?.connectors.byId[asConnectorId(firstConnectorId)];
    const normalizedSplice = normalizedState?.splices.byId[asSpliceId(firstSpliceId)];
    expect(normalizedConnector?.catalogItemId).toBeDefined();
    expect(normalizedSplice?.catalogItemId).toBeDefined();
    if (normalizedConnector?.catalogItemId !== undefined) {
      expect(normalizedConnector.manufacturerReference).toBe(
        normalizedState?.catalogItems.byId[normalizedConnector.catalogItemId]?.manufacturerReference
      );
    }
    if (normalizedSplice?.catalogItemId !== undefined) {
      expect(normalizedSplice.manufacturerReference).toBe(
        normalizedState?.catalogItems.byId[normalizedSplice.catalogItemId]?.manufacturerReference
      );
    }
  });

  it("bootstraps deterministic placeholder catalog refs on import when connector/splice manufacturer refs are missing", () => {
    const seeded = createSampleNetworkState();
    const payload = buildNetworkFilePayload(seeded, "active", [], "2026-02-21T10:19:00.000Z");
    const rawPayload = JSON.parse(serializeNetworkFilePayload(payload)) as Record<string, unknown>;
    const rawBundles = rawPayload.networks as Array<Record<string, unknown>>;
    const rawState = rawBundles[0]?.state as Record<string, unknown>;
    const rawConnectors = rawState.connectors as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const rawSplices = rawState.splices as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const rawCatalogItems = rawState.catalogItems as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const firstConnectorId = rawConnectors.allIds[0];
    const firstSpliceId = rawSplices.allIds[0];
    expect(firstConnectorId).toBeDefined();
    expect(firstSpliceId).toBeDefined();
    if (firstConnectorId === undefined || firstSpliceId === undefined) {
      throw new Error("Expected exported sample payload to include connectors and splices.");
    }

    const connectorCount = Number(rawConnectors.byId[firstConnectorId]?.cavityCount);
    const spliceCount = Number(rawSplices.byId[firstSpliceId]?.portCount);
    rawConnectors.byId[firstConnectorId] = {
      ...rawConnectors.byId[firstConnectorId],
      technicalId: "Conn / Legacy 01",
      manufacturerReference: " ",
      catalogItemId: undefined
    };
    rawSplices.byId[firstSpliceId] = {
      ...rawSplices.byId[firstSpliceId],
      technicalId: "splice:legacy?2",
      manufacturerReference: "",
      catalogItemId: undefined
    };
    rawCatalogItems.byId = {};
    rawCatalogItems.allIds = [];

    const parsed = parseNetworkFilePayload(JSON.stringify(rawPayload));
    expect(parsed.error).toBeNull();
    const normalizedState = parsed.payload?.networks[0]?.state;
    const expectedConnectorPlaceholder = `LEGACY-NOREF-C-CONN-LEGACY-01 [${connectorCount}c]`;
    const expectedSplicePlaceholder = `LEGACY-NOREF-S-SPLICE-LEGACY-2 [${spliceCount}p]`;
    expect(normalizedState?.connectors.byId[asConnectorId(firstConnectorId)]?.manufacturerReference).toBe(
      expectedConnectorPlaceholder
    );
    expect(normalizedState?.splices.byId[asSpliceId(firstSpliceId)]?.manufacturerReference).toBe(expectedSplicePlaceholder);
    const connectorCatalogItemId = normalizedState?.connectors.byId[asConnectorId(firstConnectorId)]?.catalogItemId;
    const spliceCatalogItemId = normalizedState?.splices.byId[asSpliceId(firstSpliceId)]?.catalogItemId;
    expect(connectorCatalogItemId).toBeDefined();
    expect(spliceCatalogItemId).toBeDefined();
    if (connectorCatalogItemId !== undefined) {
      expect(normalizedState?.catalogItems.byId[connectorCatalogItemId]?.manufacturerReference).toBe(expectedConnectorPlaceholder);
    }
    if (spliceCatalogItemId !== undefined) {
      expect(normalizedState?.catalogItems.byId[spliceCatalogItemId]?.manufacturerReference).toBe(expectedSplicePlaceholder);
    }
  });

  it("resolves import conflicts with deterministic suffixes", () => {
    const existing = createInitialState();
    const payload = {
      schemaVersion: 1 as const,
      exportedAt: "2026-02-21T10:20:00.000Z",
      source: {
        app: "electrical-plan-editor" as const,
        appVersion: "0.7.3",
        appSchemaVersion: 2
      },
      networks: [
        {
          network: {
            id: existing.activeNetworkId as NetworkId,
            name: "Imported Main",
            technicalId: "NET-MAIN-SAMPLE",
            createdAt: "2026-02-20T10:00:00.000Z",
            updatedAt: "2026-02-20T10:00:00.000Z"
          },
          state: createEmptyNetworkScopedState()
        }
      ]
    };

    const resolved = resolveImportConflicts(payload, existing);
    expect(resolved.networks).toHaveLength(1);
    expect(resolved.networks[0]?.id).toBe(asNetworkId("network-main-import"));
    expect(resolved.networks[0]?.technicalId).toBe("NET-MAIN-SAMPLE-IMP");
    expect(resolved.summary.warnings.length).toBeGreaterThanOrEqual(1);
  });

  it("rejects malformed payloads", () => {
    const malformed = parseNetworkFilePayload("{\"schemaVersion\":1,\"networks\":[]}");
    expect(malformed.payload).toBeNull();
    expect(malformed.error).not.toBeNull();
  });

  it("rejects unsupported future-version payloads with a clear error", () => {
    const futurePayload = {
      payloadKind: NETWORK_FILE_PAYLOAD_KIND,
      schemaVersion: 99,
      exportedAt: "2026-02-21T10:10:00.000Z",
      source: {
        app: "electrical-plan-editor",
        appVersion: "9.9.9",
        appSchemaVersion: 99
      },
      networks: []
    };

    const parsed = parseNetworkFilePayload(JSON.stringify(futurePayload));
    expect(parsed.payload).toBeNull();
    expect(parsed.error).toMatch(/newer than supported/i);
  });
});

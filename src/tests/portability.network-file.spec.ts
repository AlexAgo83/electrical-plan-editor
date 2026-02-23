import { describe, expect, it } from "vitest";
import type { NetworkId } from "../core/entities";
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

  it("patches imported wires missing section and colors to defaults", () => {
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

    const parsed = parseNetworkFilePayload(JSON.stringify(rawPayload));
    expect(parsed.error).toBeNull();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.sectionMm2).toBe(0.5);
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.primaryColorId).toBeNull();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.secondaryColorId).toBeNull();
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

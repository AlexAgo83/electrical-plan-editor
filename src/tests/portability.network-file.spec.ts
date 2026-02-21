import { describe, expect, it } from "vitest";
import type { NetworkId } from "../core/entities";
import {
  buildNetworkFilePayload,
  parseNetworkFilePayload,
  resolveImportConflicts,
  serializeNetworkFilePayload
} from "../adapters/portability";
import { appActions, appReducer, createEmptyNetworkScopedState, createInitialState } from "../store";

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
    expect(parsed.payload?.schemaVersion).toBe(1);
    expect(parsed.payload?.networks).toHaveLength(1);
  });

  it("resolves import conflicts with deterministic suffixes", () => {
    const existing = createInitialState();
    const payload = {
      schemaVersion: 1 as const,
      exportedAt: "2026-02-21T10:20:00.000Z",
      source: {
        app: "electrical-plan-editor" as const,
        appSchemaVersion: 2
      },
      networks: [
        {
          network: {
            id: existing.activeNetworkId as NetworkId,
            name: "Imported Main",
            technicalId: "NET-MAIN",
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
    expect(resolved.networks[0]?.technicalId).toBe("NET-MAIN-IMP");
    expect(resolved.summary.warnings.length).toBeGreaterThanOrEqual(1);
  });

  it("rejects malformed payloads", () => {
    const malformed = parseNetworkFilePayload("{\"schemaVersion\":1,\"networks\":[]}");
    expect(malformed.payload).toBeNull();
    expect(malformed.error).not.toBeNull();
  });
});

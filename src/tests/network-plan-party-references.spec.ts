import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { Network, NetworkId } from "../core/entities";
import {
  NETWORK_PLAN_PARTY_NAME_MAX_LENGTH,
  NETWORK_PLAN_PARTY_REFERENCE_MAX_LENGTH,
  hasNetworkPlanPartyLineBreak,
  normalizeNetworkPlanParties,
  normalizeNetworkPlanPartyValue
} from "../core/networkMetadata";
import { APP_RELEASE_VERSION, APP_SCHEMA_VERSION } from "../core/schema";
import {
  PERSISTED_STATE_PAYLOAD_KIND,
  PERSISTED_STATE_SCHEMA_VERSION,
  migratePersistedPayloadDetailed
} from "../adapters/persistence";
import {
  buildNetworkFilePayload,
  parseNetworkFilePayload,
  resolveImportConflicts,
  serializeNetworkFilePayload
} from "../adapters/portability/networkFile";
import {
  buildWorkspaceFilePayload,
  parseWorkspaceFilePayload,
  serializeWorkspaceFilePayload
} from "../app/lib/workspaceFile";
import { useStoreHistory } from "../app/hooks/useStoreHistory";
import { MemoryLineageLibraryStore } from "../app/lib/lineage/lineageLibrary";
import { LineageSessionController } from "../app/lib/lineage/lineageSessionController";
import { resetWorkspaceSessionGateForTests } from "../app/lib/workspaceSessionGate";
import {
  appActions,
  appReducer,
  createAppStore,
  createEmptyWorkspaceState,
  createInitialState,
  isWorkspaceEmpty,
  type AppState
} from "../store";

const NOW = "2026-10-23T09:00:00.000Z";
const NET_A = "net-a" as NetworkId;
const NET_B = "net-b" as NetworkId;

const PARTIES_A = {
  planManufacturerName: "Manufacturer A",
  planManufacturerReference: "MFG-001",
  planSupplierName: "Supplier B",
  planSupplierReference: "SUP-009"
};

function buildNetwork(id: string, technicalId: string, overrides: Partial<Network> = {}): Network {
  return {
    id: id as NetworkId,
    name: `Network ${technicalId}`,
    technicalId,
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-01-10T08:00:00.000Z",
    ...overrides
  };
}

/** Asymmetric fixture: A has all four values, B only a supplier reference. */
function buildTwoNetworkState(): AppState {
  let state = createInitialState();
  state = appReducer(state, appActions.createNetwork(buildNetwork("net-a", "NET-A", { planRevision: "A", ...PARTIES_A })));
  state = appReducer(state, appActions.createNetwork(buildNetwork("net-b", "NET-B", { planSupplierReference: "00042" })));
  return state;
}

describe("plan party metadata helpers", () => {
  it("trims, bounds and preserves case, punctuation, Unicode and leading zeroes", () => {
    expect(normalizeNetworkPlanPartyValue("planManufacturerName", "  Société Ünïcode & Cie.  ")).toBe(
      "Société Ünïcode & Cie."
    );
    expect(normalizeNetworkPlanPartyValue("planSupplierReference", " 000-AbC / 7 ")).toBe("000-AbC / 7");
    expect(normalizeNetworkPlanPartyValue("planManufacturerName", "x".repeat(200))).toHaveLength(
      NETWORK_PLAN_PARTY_NAME_MAX_LENGTH
    );
    expect(normalizeNetworkPlanPartyValue("planManufacturerReference", "9".repeat(200))).toHaveLength(
      NETWORK_PLAN_PARTY_REFERENCE_MAX_LENGTH
    );
  });

  it("treats blank and non-string values as unset and sanitizes line breaks to spaces", () => {
    expect(normalizeNetworkPlanPartyValue("planSupplierName", "   ")).toBeUndefined();
    expect(normalizeNetworkPlanPartyValue("planSupplierName", 42)).toBeUndefined();
    expect(normalizeNetworkPlanPartyValue("planSupplierName", null)).toBeUndefined();
    expect(normalizeNetworkPlanPartyValue("planSupplierName", "Supplier\r\n  B")).toBe("Supplier B");
    expect(hasNetworkPlanPartyLineBreak("a\nb")).toBe(true);
    expect(hasNetworkPlanPartyLineBreak("a b")).toBe(false);
    expect(normalizeNetworkPlanParties({ planManufacturerName: 1, planSupplierReference: " S " })).toEqual({
      planManufacturerName: undefined,
      planManufacturerReference: undefined,
      planSupplierName: undefined,
      planSupplierReference: "S"
    });
  });
});

describe("plan party metadata reducer behavior", () => {
  it("keeps values independent per network and unset by default", () => {
    let state = buildTwoNetworkState();
    state = appReducer(state, appActions.createNetwork(buildNetwork("net-c", "NET-C")));
    expect(state.networks.byId[NET_A]).toMatchObject(PARTIES_A);
    expect(state.networks.byId[NET_B]).toMatchObject({ planSupplierReference: "00042" });
    expect(state.networks.byId[NET_B]?.planManufacturerName).toBeUndefined();
    const netC = state.networks.byId["net-c" as NetworkId];
    expect(netC?.planManufacturerName).toBeUndefined();
    expect(netC?.planManufacturerReference).toBeUndefined();
    expect(netC?.planSupplierName).toBeUndefined();
    expect(netC?.planSupplierReference).toBeUndefined();
  });

  it("edits a name without touching references, preserves on omission and clears on empty values", () => {
    let state = buildTwoNetworkState();
    state = appReducer(state, appActions.updateNetwork(NET_A, "Network NET-A", "NET-A", NOW, undefined, { author: "Alice" }));
    expect(state.networks.byId[NET_A]).toMatchObject(PARTIES_A);

    state = appReducer(
      state,
      appActions.updateNetwork(NET_A, "Network NET-A", "NET-A", NOW, undefined, { planManufacturerName: "  Maker C " })
    );
    expect(state.networks.byId[NET_A]).toMatchObject({ ...PARTIES_A, planManufacturerName: "Maker C" });
    expect(state.networks.byId[NET_A]?.technicalId).toBe("NET-A");
    expect(state.networks.byId[NET_B]).toMatchObject({ planSupplierReference: "00042" });

    state = appReducer(
      state,
      appActions.updateNetwork(NET_A, "Network NET-A", "NET-A", NOW, undefined, {
        planManufacturerReference: "",
        planSupplierName: "   "
      })
    );
    expect(state.networks.byId[NET_A]?.planManufacturerReference).toBeUndefined();
    expect(state.networks.byId[NET_A]?.planSupplierName).toBeUndefined();
    expect(state.networks.byId[NET_A]).toMatchObject({ planManufacturerName: "Maker C", planSupplierReference: "SUP-009" });
  });

  it("carries values into a duplicated network", () => {
    let state = buildTwoNetworkState();
    const source = state.networks.byId[NET_A] as Network;
    state = appReducer(
      state,
      appActions.duplicateNetwork(source.id, { ...source, id: "net-a-copy" as NetworkId, technicalId: "NET-A-COPY" })
    );
    expect(state.networks.byId["net-a-copy" as NetworkId]).toMatchObject(PARTIES_A);
  });

  it("follows the ordinary undo/redo history with a plan references label", () => {
    localStorage.clear();
    const store = createAppStore(buildTwoNetworkState());
    const { result } = renderHook(() => useStoreHistory({ store, historyLimit: 20 }));
    act(() => {
      result.current.dispatchAction(
        appActions.updateNetwork(NET_A, "Network NET-A", "NET-A", NOW, undefined, { planRevision: "A", planSupplierName: "Supplier D" })
      );
    });
    expect(store.getState().networks.byId[NET_A]?.planSupplierName).toBe("Supplier D");
    expect(result.current.undoHistoryEntries[0]?.label).toBe("Network 'NET-A' plan references updated");
    act(() => result.current.handleUndo());
    expect(store.getState().networks.byId[NET_A]?.planSupplierName).toBe("Supplier B");
    act(() => result.current.handleRedo());
    expect(store.getState().networks.byId[NET_A]?.planSupplierName).toBe("Supplier D");
    localStorage.clear();
  });
});

describe("plan party metadata persistence and portability", () => {
  it("survives persisted snapshot migration and sanitizes stored wrong types", () => {
    const state = buildTwoNetworkState();
    const tampered: AppState = {
      ...state,
      networks: {
        ...state.networks,
        byId: {
          ...state.networks.byId,
          [NET_B]: { ...(state.networks.byId[NET_B] as Network), planSupplierName: 7 as unknown as string }
        }
      }
    };
    const result = migratePersistedPayloadDetailed(
      {
        payloadKind: PERSISTED_STATE_PAYLOAD_KIND,
        schemaVersion: PERSISTED_STATE_SCHEMA_VERSION,
        appVersion: APP_RELEASE_VERSION,
        appSchemaVersion: APP_SCHEMA_VERSION,
        createdAtIso: NOW,
        updatedAtIso: NOW,
        state: tampered
      },
      NOW
    );
    if (!result.ok) {
      throw new Error("Expected migration to succeed.");
    }
    expect(result.snapshot.state.networks.byId[NET_A]).toMatchObject(PARTIES_A);
    expect(result.snapshot.state.networks.byId[NET_B]?.planSupplierName).toBeUndefined();
    expect(result.snapshot.state.networks.byId[NET_B]?.planSupplierReference).toBe("00042");
  });

  it("roundtrips through the workspace file and tolerates legacy files without the fields", () => {
    const state = buildTwoNetworkState();
    const serialized = serializeWorkspaceFilePayload(buildWorkspaceFilePayload(state, null, NOW));
    const parsed = parseWorkspaceFilePayload(serialized, NOW);
    expect(parsed.error).toBeNull();
    expect(parsed.state?.networks.byId[NET_A]).toMatchObject(PARTIES_A);
    expect(parsed.state?.networks.byId[NET_B]?.planSupplierReference).toBe("00042");

    const legacy = JSON.parse(serialized) as { state: AppState };
    for (const networkId of legacy.state.networks.allIds) {
      const network = legacy.state.networks.byId[networkId] as Network;
      delete network.planManufacturerName;
      delete network.planManufacturerReference;
      delete network.planSupplierName;
      delete network.planSupplierReference;
    }
    const legacyParsed = parseWorkspaceFilePayload(JSON.stringify(legacy), NOW);
    expect(legacyParsed.error).toBeNull();
    expect(legacyParsed.state?.networks.byId[NET_A]?.planManufacturerName).toBeUndefined();
    expect(legacyParsed.state?.networks.byId[NET_A]?.planSupplierReference).toBeUndefined();
    expect(legacyParsed.state?.networks.byId[NET_A]?.planRevision).toBe("A");
  });

  it("exports and imports network files, normalizing malformed values with warnings", () => {
    const state = buildTwoNetworkState();
    const payload = buildNetworkFilePayload(state, "all", [], NOW);
    expect(payload.networks.find((bundle) => bundle.network.technicalId === "NET-A")?.network).toMatchObject(PARTIES_A);

    const raw = JSON.parse(serializeNetworkFilePayload(payload)) as { networks: Array<{ network: Record<string, unknown> }> };
    for (const bundle of raw.networks) {
      if (bundle.network.technicalId === "NET-B") {
        bundle.network.planManufacturerName = { name: "x" };
        bundle.network.planSupplierName = "Supplier\nwith break";
      }
    }
    const parsed = parseNetworkFilePayload(JSON.stringify(raw));
    if (parsed.payload === null) {
      throw new Error("Expected parsed network payload.");
    }
    const imported = resolveImportConflicts(parsed.payload, createInitialState());
    const importedA = imported.networks.find((network) => network.technicalId === "NET-A");
    const importedB = imported.networks.find((network) => network.technicalId === "NET-B");
    expect(importedA).toMatchObject(PARTIES_A);
    expect(importedB?.planManufacturerName).toBeUndefined();
    expect(importedB).toMatchObject({ planSupplierName: "Supplier with break", planSupplierReference: "00042" });
    expect(imported.summary.warnings.some((warning) => warning.includes("planManufacturerName<-undefined"))).toBe(true);
    expect(imported.summary.warnings.some((warning) => warning.includes("planSupplierName<-normalized"))).toBe(true);
  });

  it("keeps imported values on overwrite and keep-both conflict paths", () => {
    const state = buildTwoNetworkState();
    const payload = buildNetworkFilePayload(state, "all", [], NOW);
    const parsed = parseNetworkFilePayload(serializeNetworkFilePayload(payload));
    if (parsed.payload === null) {
      throw new Error("Expected parsed network payload.");
    }
    const existing = appReducer(
      state,
      appActions.updateNetwork(NET_A, "Network NET-A", "NET-A", NOW, undefined, { planManufacturerName: "Local edit" })
    );
    const overwrite = resolveImportConflicts(
      parsed.payload,
      existing,
      new Map([
        [NET_A, { decision: "overwrite" as const, existingNetworkId: NET_A }],
        [NET_B, { decision: "skip" as const }]
      ])
    );
    expect(overwrite.networks.find((network) => network.id === NET_A)).toMatchObject(PARTIES_A);

    const keepBoth = resolveImportConflicts(
      parsed.payload,
      existing,
      new Map([
        [NET_A, { decision: "keep-both" as const }],
        [NET_B, { decision: "skip" as const }]
      ])
    );
    expect(keepBoth.networks).toHaveLength(1);
    expect(keepBoth.networks[0]?.id).not.toBe(NET_A);
    expect(keepBoth.networks[0]).toMatchObject(PARTIES_A);
  });
});

class FakeLineageHost {
  state: AppState;
  downloads: Array<{ fileName: string; bytes: Uint8Array; mimeType: string }> = [];

  constructor(state: AppState) {
    this.state = state;
  }

  getState = (): AppState => this.state;
  replaceState = (state: AppState): void => {
    this.state = state;
  };
  resetHistory = (): void => undefined;
  isWorkspaceEmpty = (state: AppState): boolean => isWorkspaceEmpty(state);
  downloadBytes = (fileName: string, bytes: Uint8Array, mimeType: string): boolean => {
    this.downloads.push({ fileName, bytes, mimeType });
    return true;
  };
}

describe("plan party metadata in frozen lineage versions", () => {
  beforeEach(() => {
    resetWorkspaceSessionGateForTests();
  });

  it("keeps captured values in frozen versions and portable copies despite later working edits", async () => {
    const host = new FakeLineageHost(buildTwoNetworkState());
    const controller = new LineageSessionController(new MemoryLineageLibraryStore({ durable: true }), host, {
      deviceLabel: "PC-A"
    });
    await controller.initialize();
    const created = await controller.createLineage({
      displayName: "Série A",
      start: "current",
      storage: "browser",
      emptyState: createEmptyWorkspaceState()
    });
    if (!created.ok) throw new Error(created.error);
    const version = await controller.createVersion({ title: "Livraison", comment: "", operationId: "op_1" });
    if (!version.ok) throw new Error(version.error);

    const previous = host.state;
    host.state = appReducer(
      previous,
      appActions.updateNetwork(NET_A, "Network NET-A", "NET-A", NOW, undefined, {
        planManufacturerName: "Working edit",
        planSupplierReference: ""
      })
    );
    controller.notifyStateChanged(previous, host.state);

    expect((await controller.openHistorical(version.value.versionId)).ok).toBe(true);
    expect(host.state.networks.byId[NET_A]).toMatchObject(PARTIES_A);
    expect(controller.copySnapshot().ok).toBe(true);
    const copied = parseWorkspaceFilePayload(new TextDecoder().decode(host.downloads.at(-1)!.bytes));
    expect(copied.state?.networks.byId[NET_A]).toMatchObject(PARTIES_A);

    controller.returnToWorking();
    expect(host.state.networks.byId[NET_A]?.planManufacturerName).toBe("Working edit");
    expect(host.state.networks.byId[NET_A]?.planSupplierReference).toBeUndefined();
  });
});

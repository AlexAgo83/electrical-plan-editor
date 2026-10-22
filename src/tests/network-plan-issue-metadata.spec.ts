import { describe, expect, it } from "vitest";
import type { Network, NetworkId } from "../core/entities";
import {
  NETWORK_PLAN_REVISION_MAX_LENGTH,
  isNetworkPlanIssueDateValid,
  normalizeNetworkPlanIssueDate,
  normalizeNetworkPlanRevision
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
import { buildNetworkFormDraft } from "../app/lib/networkFormDraft";
import {
  buildWorkspaceFilePayload,
  parseWorkspaceFilePayload,
  serializeWorkspaceFilePayload
} from "../app/lib/workspaceFile";
import { appActions, appReducer, createInitialState, type AppState } from "../store";

const NOW = "2026-10-22T09:00:00.000Z";

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

function buildTwoNetworkState(): AppState {
  let state = createInitialState();
  state = appReducer(state, appActions.createNetwork(buildNetwork("net-a", "NET-A", { planRevision: "A", planIssueDate: "2026-02-28" })));
  state = appReducer(state, appActions.createNetwork(buildNetwork("net-b", "NET-B", { planRevision: "03" })));
  return state;
}

describe("plan issue metadata helpers", () => {
  it("trims and caps the plan revision and treats empty values as unset", () => {
    expect(normalizeNetworkPlanRevision("  B02 ")).toBe("B02");
    expect(normalizeNetworkPlanRevision("   ")).toBeUndefined();
    expect(normalizeNetworkPlanRevision(42)).toBeUndefined();
    expect(normalizeNetworkPlanRevision("x".repeat(60))).toHaveLength(NETWORK_PLAN_REVISION_MAX_LENGTH);
  });

  it("accepts only real calendar dates in YYYY-MM-DD form", () => {
    expect(isNetworkPlanIssueDateValid("2024-02-29")).toBe(true);
    expect(isNetworkPlanIssueDateValid("2023-02-29")).toBe(false);
    expect(isNetworkPlanIssueDateValid("2026-13-01")).toBe(false);
    expect(isNetworkPlanIssueDateValid("2026-04-31")).toBe(false);
    expect(isNetworkPlanIssueDateValid("22/10/2026")).toBe(false);
    expect(normalizeNetworkPlanIssueDate(" 2026-10-22 ")).toBe("2026-10-22");
    expect(normalizeNetworkPlanIssueDate("")).toBeUndefined();
    expect(normalizeNetworkPlanIssueDate(undefined)).toBeUndefined();
    expect(normalizeNetworkPlanIssueDate("2026-02-30")).toBeNull();
    expect(normalizeNetworkPlanIssueDate(20261022)).toBeNull();
  });

  it("rejects an invalid issue date in the network form draft", () => {
    const baseInput = {
      name: "Body",
      technicalId: "NET-BODY",
      createdAtDate: "2026-01-10",
      description: "",
      author: "",
      voltageV: "",
      projectCode: "",
      entityPrefix: "",
      logoUrl: "",
      exportNotes: "",
      planRevision: " C ",
      planIssueDate: "2026-02-30"
    };
    expect(buildNetworkFormDraft(baseInput).kind).toBe("error");
    const valid = buildNetworkFormDraft({ ...baseInput, planIssueDate: "2026-03-01" });
    expect(valid.kind).toBe("valid");
    if (valid.kind === "valid") {
      expect(valid.draft.planRevision).toBe("C");
      expect(valid.draft.planIssueDate).toBe("2026-03-01");
      // Creation date stays independent from the issue date.
      expect(valid.draft.createdAtIso).not.toContain("2026-03-01");
    }
  });
});

describe("plan issue metadata reducer behavior", () => {
  it("keeps metadata independent per network and unset by default", () => {
    let state = buildTwoNetworkState();
    state = appReducer(state, appActions.createNetwork(buildNetwork("net-c", "NET-C")));
    expect(state.networks.byId["net-a" as NetworkId]).toMatchObject({ planRevision: "A", planIssueDate: "2026-02-28" });
    expect(state.networks.byId["net-b" as NetworkId]?.planRevision).toBe("03");
    expect(state.networks.byId["net-b" as NetworkId]?.planIssueDate).toBeUndefined();
    expect(state.networks.byId["net-c" as NetworkId]?.planRevision).toBeUndefined();
    expect(state.networks.byId["net-c" as NetworkId]?.planIssueDate).toBeUndefined();
  });

  it("updates, preserves on omission and clears on empty values without automatic changes", () => {
    let state = buildTwoNetworkState();
    const id = "net-a" as NetworkId;
    state = appReducer(state, appActions.updateNetwork(id, "Renamed", "NET-A", NOW, undefined, { author: "Alice" }));
    expect(state.networks.byId[id]).toMatchObject({ planRevision: "A", planIssueDate: "2026-02-28" });

    state = appReducer(
      state,
      appActions.updateNetwork(id, "Renamed", "NET-A", NOW, undefined, { planRevision: " B ", planIssueDate: "2026-03-15" })
    );
    expect(state.networks.byId[id]).toMatchObject({ planRevision: "B", planIssueDate: "2026-03-15" });
    expect(state.networks.byId["net-b" as NetworkId]?.planRevision).toBe("03");

    state = appReducer(state, appActions.updateNetwork(id, "Renamed", "NET-A", NOW, undefined, { planRevision: "", planIssueDate: "" }));
    expect(state.networks.byId[id]?.planRevision).toBeUndefined();
    expect(state.networks.byId[id]?.planIssueDate).toBeUndefined();
  });

  it("rejects an invalid calendar issue date on update", () => {
    const state = buildTwoNetworkState();
    const next = appReducer(
      state,
      appActions.updateNetwork("net-a" as NetworkId, "Network NET-A", "NET-A", NOW, undefined, { planIssueDate: "2026-02-31" })
    );
    expect(JSON.stringify(next.ui.lastError)).toContain("Plan issue date");
    expect(next.networks.byId["net-a" as NetworkId]?.planIssueDate).toBe("2026-02-28");
  });

  it("never changes plan issue metadata automatically on recompute or unrelated edits", () => {
    let state = buildTwoNetworkState();
    state = appReducer(state, appActions.selectNetwork("net-a" as NetworkId));
    state = appReducer(state, appActions.recomputeAllWires());
    state = appReducer(state, appActions.updateNetwork("net-a" as NetworkId, "Edited", "NET-A", NOW, "New description"));
    expect(state.networks.byId["net-a" as NetworkId]).toMatchObject({ planRevision: "A", planIssueDate: "2026-02-28" });
    expect(state.networks.byId["net-b" as NetworkId]?.planIssueDate).toBeUndefined();
  });

  it("carries metadata into a duplicated network", () => {
    let state = buildTwoNetworkState();
    const source = state.networks.byId["net-a" as NetworkId] as Network;
    state = appReducer(
      state,
      appActions.duplicateNetwork(source.id, { ...source, id: "net-a-copy" as NetworkId, technicalId: "NET-A-COPY" })
    );
    expect(state.networks.byId["net-a-copy" as NetworkId]).toMatchObject({ planRevision: "A", planIssueDate: "2026-02-28" });
  });
});

describe("plan issue metadata persistence and portability", () => {
  it("survives persisted snapshot migration and drops invalid stored values", () => {
    const state = buildTwoNetworkState();
    const tampered: AppState = {
      ...state,
      networks: {
        ...state.networks,
        byId: {
          ...state.networks.byId,
          ["net-b" as NetworkId]: { ...(state.networks.byId["net-b" as NetworkId] as Network), planIssueDate: "2026-99-01" }
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
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected migration to succeed.");
    }
    expect(result.snapshot.state.networks.byId["net-a" as NetworkId]).toMatchObject({
      planRevision: "A",
      planIssueDate: "2026-02-28"
    });
    expect(result.snapshot.state.networks.byId["net-b" as NetworkId]?.planRevision).toBe("03");
    expect(result.snapshot.state.networks.byId["net-b" as NetworkId]?.planIssueDate).toBeUndefined();
  });

  it("roundtrips through the workspace .epe.json file and tolerates legacy files without the fields", () => {
    const state = buildTwoNetworkState();
    const serialized = serializeWorkspaceFilePayload(buildWorkspaceFilePayload(state, null, NOW));
    const parsed = parseWorkspaceFilePayload(serialized, NOW);
    expect(parsed.error).toBeNull();
    expect(parsed.state?.networks.byId["net-a" as NetworkId]).toMatchObject({ planRevision: "A", planIssueDate: "2026-02-28" });
    expect(parsed.state?.networks.byId["net-b" as NetworkId]?.planRevision).toBe("03");

    const legacy = JSON.parse(serialized) as { state: AppState };
    for (const networkId of legacy.state.networks.allIds) {
      const network = legacy.state.networks.byId[networkId] as Network;
      delete network.planRevision;
      delete network.planIssueDate;
    }
    const legacyParsed = parseWorkspaceFilePayload(JSON.stringify(legacy), NOW);
    expect(legacyParsed.error).toBeNull();
    expect(legacyParsed.state?.networks.byId["net-a" as NetworkId]?.planRevision).toBeUndefined();
    expect(legacyParsed.state?.networks.byId["net-a" as NetworkId]?.planIssueDate).toBeUndefined();
  });

  it("exports and imports network files with metadata and normalizes invalid imported fields", () => {
    const state = buildTwoNetworkState();
    const payload = buildNetworkFilePayload(state, "all", [], NOW);
    const bundleA = payload.networks.find((bundle) => bundle.network.technicalId === "NET-A");
    expect(bundleA?.network).toMatchObject({ planRevision: "A", planIssueDate: "2026-02-28" });

    const raw = JSON.parse(serializeNetworkFilePayload(payload)) as { networks: Array<{ network: Record<string, unknown> }> };
    for (const bundle of raw.networks) {
      if (bundle.network.technicalId === "NET-B") {
        bundle.network.planIssueDate = "not-a-date";
        bundle.network.planRevision = 12;
      }
    }
    const parsed = parseNetworkFilePayload(JSON.stringify(raw));
    expect(parsed.error).toBeNull();
    if (parsed.payload === null) {
      throw new Error("Expected parsed network payload.");
    }

    const imported = resolveImportConflicts(parsed.payload, createInitialState());
    const importedA = imported.networks.find((network) => network.technicalId === "NET-A");
    const importedB = imported.networks.find((network) => network.technicalId === "NET-B");
    expect(importedA).toMatchObject({ planRevision: "A", planIssueDate: "2026-02-28" });
    expect(importedB?.planRevision).toBeUndefined();
    expect(importedB?.planIssueDate).toBeUndefined();
    expect(imported.summary.warnings.some((warning) => warning.includes("planIssueDate<-undefined"))).toBe(true);
  });
});

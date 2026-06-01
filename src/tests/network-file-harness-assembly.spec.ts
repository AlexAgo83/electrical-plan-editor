import { describe, expect, it } from "vitest";
import type { ConnectorId, HarnessAssemblyId, NetworkId } from "../core/entities";
import { buildNetworkFilePayload, parseNetworkFilePayload, resolveImportConflicts } from "../adapters/portability";
import { appActions, appReducer, createInitialState } from "../store";

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asAssemblyId(value: string): HarnessAssemblyId {
  return value as HarnessAssemblyId;
}

describe("network file harness assemblies", () => {
  it("round-trips harness assemblies with selected networks and remaps imported network IDs", () => {
    const initial = createInitialState();
    const defaultNetworkId = initial.activeNetworkId as NetworkId;
    const withSecondNetwork = appReducer(
      initial,
      appActions.createNetwork({
        id: asNetworkId("net-b"),
        name: "Harness B",
        technicalId: "H-B",
        createdAt: "2026-05-11T00:00:00.000Z",
        updatedAt: "2026-05-11T00:00:00.000Z"
      })
    );
    const withAssembly = appReducer(
      withSecondNetwork,
      appActions.upsertHarnessAssembly({
        id: asAssemblyId("asm-main"),
        name: "Main assembly",
        technicalId: "ASM-MAIN",
        members: [
          { networkId: defaultNetworkId, color: "#2563eb" },
          { networkId: asNetworkId("net-b"), color: "#16a34a" }
        ],
        masterConnectorRefs: [{ networkId: defaultNetworkId, connectorId: asConnectorId("C-MASTER") }],
        connectorLinks: [
          {
            id: "link-1" as never,
            sourceNetworkId: defaultNetworkId,
            sourceConnectorId: asConnectorId("C-A"),
            targetNetworkId: asNetworkId("net-b"),
            targetConnectorId: asConnectorId("C-B")
          }
        ],
        createdAt: "2026-05-11T00:00:00.000Z",
        updatedAt: "2026-05-11T00:00:00.000Z"
      })
    );

    const payload = buildNetworkFilePayload(withAssembly, "all", [], "2026-05-11T12:00:00.000Z");
    expect(payload.harnessAssemblies).toHaveLength(1);
    expect(payload.harnessAssemblies?.[0]?.members).toHaveLength(2);

    const parsed = parseNetworkFilePayload(JSON.stringify(payload));
    expect(parsed.payload?.harnessAssemblies).toHaveLength(1);

    const resolved = resolveImportConflicts(parsed.payload!, withAssembly);
    expect(resolved.harnessAssemblies).toHaveLength(1);
    expect(resolved.harnessAssemblies[0]?.members.map((member) => member.networkId)).toEqual([
      `${defaultNetworkId}-import`,
      "net-b-import"
    ]);
    expect(resolved.harnessAssemblies[0]?.connectorLinks[0]?.sourceNetworkId).toBe(`${defaultNetworkId}-import`);
  });

  it("renames imported harness assemblies when their ID already exists", () => {
    const initial = createInitialState();
    const defaultNetworkId = initial.activeNetworkId as NetworkId;
    const withAssembly = appReducer(
      initial,
      appActions.upsertHarnessAssembly({
        id: asAssemblyId("asm-main"),
        name: "Main assembly",
        technicalId: "ASM-MAIN",
        members: [{ networkId: defaultNetworkId, color: "#2563eb" }],
        masterConnectorRefs: [],
        connectorLinks: [],
        createdAt: "2026-05-11T00:00:00.000Z",
        updatedAt: "2026-05-11T00:00:00.000Z"
      })
    );

    const payload = buildNetworkFilePayload(withAssembly, "all", [], "2026-05-11T12:00:00.000Z");
    const parsed = parseNetworkFilePayload(JSON.stringify(payload));
    const resolved = resolveImportConflicts(parsed.payload!, withAssembly);

    expect(resolved.harnessAssemblies[0]?.id).toBe("asm-main-import");
    expect(resolved.harnessAssemblies[0]?.technicalId).toBe("ASM-MAIN-IMP");
    expect(resolved.summary.warnings).toContain("Harness assembly ID 'asm-main' was renamed to 'asm-main-import' during import.");
    expect(resolved.summary.warnings).toContain(
      "Harness assembly technical ID 'ASM-MAIN' was renamed to 'ASM-MAIN-IMP' during import."
    );
  });

  it("overwrites matching harness assemblies when their member networks are overwritten", () => {
    const initial = createInitialState();
    const defaultNetworkId = initial.activeNetworkId as NetworkId;
    const withAssembly = appReducer(
      initial,
      appActions.upsertHarnessAssembly({
        id: asAssemblyId("asm-main"),
        name: "Main assembly",
        technicalId: "ASM-MAIN",
        members: [{ networkId: defaultNetworkId, color: "#2563eb" }],
        masterConnectorRefs: [],
        connectorLinks: [],
        createdAt: "2026-05-11T00:00:00.000Z",
        updatedAt: "2026-05-11T00:00:00.000Z"
      })
    );
    const payload = buildNetworkFilePayload(withAssembly, "all", [], "2026-05-11T12:00:00.000Z");
    const parsed = parseNetworkFilePayload(JSON.stringify(payload));
    const overwriteMap = new Map<string, NetworkId>([[defaultNetworkId, defaultNetworkId]]);
    const resolved = resolveImportConflicts(parsed.payload!, withAssembly, overwriteMap);
    const imported = appReducer(
      withAssembly,
      appActions.importNetworks(
        resolved.networks,
        resolved.networkStates,
        resolved.harnessAssemblies,
        false,
        [...overwriteMap.values()],
        resolved.overwriteHarnessAssemblyIds
      )
    );

    expect(resolved.harnessAssemblies[0]?.id).toBe("asm-main");
    expect(resolved.overwriteHarnessAssemblyIds).toEqual(["asm-main"]);
    expect(imported.harnessAssemblies.allIds).toEqual(["asm-main"]);
    expect(imported.harnessAssemblies.byId[asAssemblyId("asm-main")]?.technicalId).toBe("ASM-MAIN");
  });
});

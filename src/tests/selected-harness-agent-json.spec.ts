import { describe, expect, it } from "vitest";
import type {
  CatalogItemId,
  ConnectorId,
  HarnessAssemblyId,
  InterHarnessConnectorLinkId,
  NetworkId,
  SpliceId,
  WireId
} from "../core/entities";
import { buildSelectedHarnessAgentJsonPayload } from "../app/lib/selectedHarnessAgentJson";
import { createEmptyNetworkScopedState, createEmptyWorkspaceState, type AppState } from "../store";

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

function asAssemblyId(value: string): HarnessAssemblyId {
  return value as HarnessAssemblyId;
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

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

function createSelectedHarnessExportState(): AppState {
  const selectedNetworkId = asNetworkId("net-selected");
  const activeNetworkId = asNetworkId("net-active");
  const assemblyId = asAssemblyId("asm-selected");
  const scoped = createEmptyNetworkScopedState();
  const activeScoped = createEmptyNetworkScopedState();
  const connectorCatalogId = asCatalogItemId("cat-connector");
  const spliceCatalogId = asCatalogItemId("cat-splice");
  const fuseCatalogId = asCatalogItemId("cat-fuse");
  const connectorId = asConnectorId("conn-main");
  const spliceId = asSpliceId("splice-main");

  scoped.catalogItems = {
    byId: {
      [connectorCatalogId]: {
        id: connectorCatalogId,
        manufacturerReference: "CONN-REF",
        name: "Connector catalog",
        connectionCount: 3,
        additionalAccessories: [{ accessoryReference: "LOCK-REF", accessoryName: "Connector lock" }],
        connectorDefaults: {
          allSameTerminals: true,
          defaultTerminal: {
            terminalReference: "TERM-DEFAULT",
            terminalName: "Default terminal",
            sealReference: "SEAL-DEFAULT",
            sealName: "Default seal"
          },
          plugs: [{ plugReference: "PLUG-DEFAULT", plugName: "Default plug", quantity: 1 }]
        }
      },
      [spliceCatalogId]: {
        id: spliceCatalogId,
        manufacturerReference: "SPLICE-REF",
        name: "Splice catalog",
        connectionCount: 2
      },
      [fuseCatalogId]: {
        id: fuseCatalogId,
        manufacturerReference: "FUSE-REF",
        name: "Fuse catalog",
        connectionCount: 1
      }
    },
    allIds: [connectorCatalogId, spliceCatalogId, fuseCatalogId]
  };
  scoped.connectors = {
    byId: {
      [connectorId]: {
        id: connectorId,
        name: "Main connector",
        technicalId: "C-MAIN",
        cavityCount: 3,
        catalogItemId: connectorCatalogId,
        applyCatalogPlugs: true,
        applyCatalogSeals: true,
        terminalOverrides: {
          2: {
            terminalReference: "TERM-OVERRIDE",
            terminalName: "Override terminal",
            sealReference: "SEAL-OVERRIDE",
            sealName: "Override seal"
          }
        }
      }
    },
    allIds: [connectorId]
  };
  scoped.splices = {
    byId: {
      [spliceId]: {
        id: spliceId,
        name: "Main splice",
        technicalId: "S-MAIN",
        portMode: "directional",
        portCount: 2,
        catalogItemId: spliceCatalogId
      }
    },
    allIds: [spliceId]
  };
  scoped.wires = {
    byId: {
      [asWireId("wire-1")]: {
        id: asWireId("wire-1"),
        name: "Wake line",
        technicalId: "W-WAKE",
        twistGroupLabel: "CAN-A",
        functionalDomainTag: "CAN",
        sectionMm2: 0.35,
        currentA: 2,
        material: "copper",
        colorMode: "catalog",
        primaryColorId: "RD",
        secondaryColorId: "BU",
        endpointAConnectionReference: "TERM-MANUAL",
        endpointAConnectionName: "Manual terminal",
        endpointA: { kind: "connectorCavity", connectorId, cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId, portIndex: 1, spliceSideOverride: "L", spliceSideLocked: true },
        protection: { kind: "fuse", catalogItemId: fuseCatalogId },
        routeSegmentIds: [],
        lengthMm: 120,
        isRouteLocked: true
      },
      [asWireId("wire-2")]: {
        id: asWireId("wire-2"),
        name: "Return line",
        technicalId: "W-RETURN",
        sectionMm2: 0.5,
        primaryColorId: null,
        secondaryColorId: null,
        endpointA: { kind: "connectorCavity", connectorId, cavityIndex: 2 },
        endpointB: { kind: "splicePort", spliceId, portIndex: 2, spliceSideOverride: "R", spliceSideLocked: false },
        routeSegmentIds: [],
        lengthMm: 100,
        isRouteLocked: false
      }
    },
    allIds: [asWireId("wire-1"), asWireId("wire-2")]
  };

  return {
    ...createEmptyWorkspaceState(),
    networks: {
      byId: {
        [selectedNetworkId]: {
          id: selectedNetworkId,
          name: "Selected harness",
          technicalId: "H-SELECTED",
          createdAt: "2026-05-19T00:00:00.000Z",
          updatedAt: "2026-05-19T00:00:00.000Z"
        },
        [activeNetworkId]: {
          id: activeNetworkId,
          name: "Active unrelated network",
          technicalId: "H-ACTIVE",
          createdAt: "2026-05-19T00:00:00.000Z",
          updatedAt: "2026-05-19T00:00:00.000Z"
        }
      },
      allIds: [selectedNetworkId, activeNetworkId]
    },
    harnessAssemblies: {
      byId: {
        [assemblyId]: {
          id: assemblyId,
          name: "Selected assembly",
          technicalId: "ASM-SELECTED",
          members: [{ networkId: selectedNetworkId, color: "#2563eb" }],
          masterConnectorRefs: [{ networkId: selectedNetworkId, connectorId }],
          connectorLinks: [
            {
              id: "link-main" as InterHarnessConnectorLinkId,
              name: "Inline",
              sourceNetworkId: selectedNetworkId,
              sourceConnectorId: connectorId,
              targetNetworkId: selectedNetworkId,
              targetConnectorId: connectorId
            }
          ],
          createdAt: "2026-05-19T00:00:00.000Z",
          updatedAt: "2026-05-19T00:00:00.000Z"
        }
      },
      allIds: [assemblyId]
    },
    activeNetworkId,
    networkStates: {
      [selectedNetworkId]: scoped,
      [activeNetworkId]: activeScoped
    }
  };
}

describe("selected harness agent JSON export", () => {
  it("returns a non-exporting error when no harness assembly is selected", () => {
    const result = buildSelectedHarnessAgentJsonPayload({
      state: createSelectedHarnessExportState(),
      selectedHarnessAssemblyId: null,
      exportedAt: "2026-05-19T10:00:00.000Z"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NO_SELECTED_HARNESS");
    }
  });

  it("exports only selected harness member networks and agent-oriented joins", () => {
    const state = createSelectedHarnessExportState();
    const result = buildSelectedHarnessAgentJsonPayload({
      state,
      selectedHarnessAssemblyId: asAssemblyId("asm-selected"),
      exportedAt: "2026-05-19T10:00:00.000Z",
      appVersion: "test-version"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.error.message);
    }

    expect(result.payload.schemaVersion).toBe("1.0");
    expect(result.payload.exportKind).toBe("electrical-plan-editor.selected-harness-agent-json");
    expect(result.payload.appVersion).toBe("test-version");
    expect(result.payload.selectedHarness).toEqual({
      id: "asm-selected",
      technicalId: "ASM-SELECTED",
      name: "Selected assembly"
    });
    expect(result.payload.networks.map((entry) => entry.network.id)).toEqual(["net-selected"]);
    expect(result.payload.networks.map((entry) => entry.network.id)).not.toContain("net-active");
    expect(result.payload.harness.members).toEqual([{ networkId: "net-selected", color: "#2563eb" }]);

    const connector = result.payload.networks[0]?.connectors[0];
    const cavity1 = connector?.resolvedCavities.find((cavity) => cavity.cavityIndex === 1);
    const cavity2 = connector?.resolvedCavities.find((cavity) => cavity.cavityIndex === 2);
    expect(cavity1?.terminal?.reference).toBe("TERM-DEFAULT");
    expect(cavity1?.terminal?.origin).toBe("catalogDefault");
    expect(cavity1?.seal?.reference).toBe("SEAL-DEFAULT");
    expect(cavity1?.seal?.origin).toBe("catalogDefault");
    expect(cavity2?.terminal?.reference).toBe("TERM-OVERRIDE");
    expect(cavity2?.terminal?.origin).toBe("connectorOverride");
    expect(cavity2?.seal?.reference).toBe("SEAL-OVERRIDE");
    expect(cavity2?.seal?.origin).toBe("connectorOverride");
    expect(connector?.unusedCavityPlugRequirements).toEqual([
      expect.objectContaining({ reference: "PLUG-DEFAULT", quantity: 1, unusedCavityCount: 1, origin: "catalogDefault" })
    ]);

    const firstWire = result.payload.networks[0]?.wires.find((wire) => wire.id === asWireId("wire-1"));
    expect(firstWire?.endpointA.kind).toBe("connectorCavity");
    if (firstWire?.endpointA.kind !== "connectorCavity") {
      throw new Error("Expected connector endpoint.");
    }
    expect(firstWire.endpointA.networkId).toBe("net-selected");
    expect(firstWire.endpointA.connectorId).toBe("conn-main");
    expect(firstWire.endpointA.terminal?.reference).toBe("TERM-MANUAL");
    expect(firstWire.endpointA.terminal?.origin).toBe("manual");
    expect(firstWire.endpointA.seal?.reference).toBe("SEAL-DEFAULT");
    expect(firstWire.endpointA.seal?.origin).toBe("catalogDefault");
    expect(firstWire?.endpointB).toEqual(
      expect.objectContaining({
        kind: "splicePort",
        networkId: "net-selected",
        spliceId: "splice-main",
        spliceSideOverride: "L",
        spliceSideLocked: true
      })
    );
    expect(firstWire?.protection?.catalogItem?.manufacturerReference).toBe("FUSE-REF");

    expect(result.payload.bomQuantities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "connector", reference: "CONN-REF", quantity: 1 }),
        expect.objectContaining({ kind: "splice", reference: "SPLICE-REF", quantity: 1 }),
        expect.objectContaining({ kind: "terminal", reference: "TERM-MANUAL", quantity: 1, origin: "manual" }),
        expect.objectContaining({ kind: "terminal", reference: "TERM-OVERRIDE", quantity: 1, origin: "connectorOverride" }),
        expect.objectContaining({ kind: "seal", reference: "SEAL-DEFAULT", quantity: 1, origin: "catalogDefault" }),
        expect.objectContaining({ kind: "plug", reference: "PLUG-DEFAULT", quantity: 1, origin: "catalogDefault" }),
        expect.objectContaining({ kind: "accessory", reference: "LOCK-REF", quantity: 1, origin: "catalogDefault" }),
        expect.objectContaining({ kind: "protection", reference: "FUSE-REF", quantity: 1 })
      ])
    );
    expect(result.payload.catalogParts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "catalogItem", reference: "CONN-REF", usedBy: [expect.objectContaining({ connectorId: "conn-main" })] }),
        expect.objectContaining({ kind: "accessory", reference: "LOCK-REF", usedBy: [expect.objectContaining({ connectorId: "conn-main" })] }),
        expect.objectContaining({ kind: "terminal", reference: "TERM-MANUAL", usedBy: [expect.objectContaining({ wireId: "wire-1" })] }),
        expect.objectContaining({ kind: "plug", reference: "PLUG-DEFAULT", usedBy: [expect.objectContaining({ connectorId: "conn-main" })] })
      ])
    );
    expect(result.payload.relationships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "harness-member-network" }),
        expect.objectContaining({ kind: "harness-master-connector" }),
        expect.objectContaining({ kind: "inter-harness-connector-link" }),
        expect.objectContaining({ kind: "wire-endpoint" }),
        expect.objectContaining({ kind: "catalog-item-additional-accessory" }),
        expect.objectContaining({ kind: "wire-protection-catalog-item" })
      ])
    );
    expect(result.payload.warnings).toEqual([]);
  });

  it("emits structured warnings for unresolved selected harness relationships", () => {
    const state = createSelectedHarnessExportState();
    const selected = state.networks.allIds[0];
    if (selected === undefined) {
      throw new Error("Expected selected network.");
    }
    const brokenState: AppState = {
      ...state,
      networkStates: {
        ...state.networkStates,
        [selected]: {
          ...state.networkStates[selected],
          wires: {
            byId: {
              [asWireId("broken")]: {
                id: asWireId("broken"),
                name: "Broken wire",
                technicalId: "W-BROKEN",
                sectionMm2: 1,
                primaryColorId: null,
                secondaryColorId: null,
                endpointA: { kind: "connectorCavity", connectorId: asConnectorId("missing-connector"), cavityIndex: 1 },
                endpointB: { kind: "splicePort", spliceId: asSpliceId("missing-splice"), portIndex: 1 },
                routeSegmentIds: ["missing-segment" as never],
                lengthMm: 1,
                isRouteLocked: false
              }
            },
            allIds: [asWireId("broken")]
          }
        }
      }
    };

    const result = buildSelectedHarnessAgentJsonPayload({
      state: brokenState,
      selectedHarnessAssemblyId: asAssemblyId("asm-selected"),
      exportedAt: "2026-05-19T10:00:00.000Z"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.error.message);
    }
    expect(result.payload.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "MISSING_CONNECTOR", severity: "error" }),
        expect.objectContaining({ code: "MISSING_SPLICE", severity: "error" }),
        expect.objectContaining({ code: "MISSING_ROUTE_SEGMENT", severity: "warning" })
      ])
    );
  });
});

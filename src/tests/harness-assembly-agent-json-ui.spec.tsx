import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ConnectorId, HarnessAssembly, HarnessAssemblyId, Network, NetworkId } from "../core/entities";
import { HarnessAssemblyManagerPanel } from "../app/components/network-summary/HarnessAssemblyManagerPanel";

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asAssemblyId(value: string): HarnessAssemblyId {
  return value as HarnessAssemblyId;
}

const network: Network = {
  id: asNetworkId("net-main"),
  name: "Main harness",
  technicalId: "H-MAIN",
  createdAt: "2026-05-19T00:00:00.000Z",
  updatedAt: "2026-05-19T00:00:00.000Z"
};

const assembly: HarnessAssembly = {
  id: asAssemblyId("asm-main"),
  name: "Main assembly",
  technicalId: "ASM-MAIN",
  members: [{ networkId: network.id, color: "#2563eb" }],
  masterConnectorRefs: [],
  connectorLinks: [],
  createdAt: "2026-05-19T00:00:00.000Z",
  updatedAt: "2026-05-19T00:00:00.000Z"
};

describe("HarnessAssemblyManagerPanel agent JSON action", () => {
  it("disables agent JSON export until a saved assembly is selected", () => {
    render(
      <HarnessAssemblyManagerPanel
        assemblies={[assembly]}
        networks={[network]}
        connectorsByNetworkId={new Map([[network.id, [{ id: asConnectorId("conn-main"), name: "Main", technicalId: "C-MAIN", cavityCount: 1 }]]])}
        selectedAssemblyId="new"
        canExportAgentJson={false}
        onExportAgentJson={vi.fn()}
        onSelectedAssemblyIdChange={vi.fn()}
        onUpsertAssembly={vi.fn()}
        onRemoveAssembly={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Agent JSON" })).toBeDisabled();
  });

  it("calls the export handler for a saved selected assembly", () => {
    const onExportAgentJson = vi.fn();
    render(
      <HarnessAssemblyManagerPanel
        assemblies={[assembly]}
        networks={[network]}
        connectorsByNetworkId={new Map([[network.id, []]])}
        selectedAssemblyId={assembly.id}
        canExportAgentJson
        onExportAgentJson={onExportAgentJson}
        onSelectedAssemblyIdChange={vi.fn()}
        onUpsertAssembly={vi.fn()}
        onRemoveAssembly={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Agent JSON" }));

    expect(onExportAgentJson).toHaveBeenCalledTimes(1);
  });
});

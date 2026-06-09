import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { MultiNetworkFunctionalAnalysisPanel } from "../app/components/workspace/MultiNetworkFunctionalAnalysisPanel";
import type {
  MultiNetworkFunctionalAnalysisModel,
  MultiNetworkFunctionalAnalysisScope
} from "../app/lib/multiNetworkFunctionalAnalysis";
import type { NetworkId } from "../core/entities";

const model: MultiNetworkFunctionalAnalysisModel = {
  scope: "assembly",
  activeAssemblyName: "Vehicle harness",
  availableNetworkCount: 2,
  selectedNetworkLabels: ["Front harness", "Door harness"],
  networkOptions: [
    { id: "network-front" as NetworkId, label: "Front harness", selected: true },
    { id: "network-door" as NetworkId, label: "Door harness", selected: true }
  ],
  findings: [
    {
      id: "l1-link-front-door-1",
      severity: "warning",
      family: "L1",
      networkLabel: "Front harness -> Door harness",
      message: "Link 'Front to door' cavity 1: source 10 A vs source 8 A.",
      target: {
        networkId: "network-front" as NetworkId,
        subScreen: "connector",
        selectionKind: "connector",
        selectionId: "C-front"
      }
    }
  ],
  summary: {
    errors: 0,
    warnings: 1,
    info: 0,
    l1: 1,
    skippedBridges: 0,
    loops: 1
  },
  schematic: {
    nodes: [
      { id: "n1", label: "Front", detail: "C-front pin 1", kind: "connector" },
      { id: "n2", label: "Door", detail: "C-door pin 1", kind: "interconnector" }
    ],
    edges: [{ id: "e1", fromNodeId: "n1", toNodeId: "n2", label: "W-1" }],
    warnings: ["Trace warning"]
  }
};

function Harness({
  onGoToFinding = vi.fn(),
  onToggleCustomNetwork = vi.fn()
}: {
  onGoToFinding?: Parameters<typeof MultiNetworkFunctionalAnalysisPanel>[0]["onGoToFinding"];
  onToggleCustomNetwork?: Parameters<typeof MultiNetworkFunctionalAnalysisPanel>[0]["onToggleCustomNetwork"];
}): ReactElement {
  const [scope, setScope] = useState<MultiNetworkFunctionalAnalysisScope>("current");
  return (
    <MultiNetworkFunctionalAnalysisPanel
      model={model}
      scope={scope}
      setScope={setScope}
      onToggleCustomNetwork={onToggleCustomNetwork}
      onGoToFinding={onGoToFinding}
    />
  );
}

describe("MultiNetworkFunctionalAnalysisPanel", () => {
  it("renders themed scope controls, summary chips, and L1 findings", () => {
    render(<Harness />);

    const heading = screen.getByRole("heading", { name: "Multi-network functional analysis" });
    const panel = heading.closest("section");
    expect(panel).not.toBeNull();
    const scopePanel = panel as HTMLElement;

    expect(within(scopePanel).getByRole("button", { name: "Current network" })).toHaveClass("filter-chip", "is-active");
    fireEvent.click(within(scopePanel).getByRole("button", { name: /Active assembly\s*2/ }));

    expect(within(scopePanel).getByRole("button", { name: /Active assembly\s*2/ })).toHaveClass("filter-chip", "is-active");
    expect(scopePanel).toHaveTextContent("Vehicle harness");
    expect(scopePanel).toHaveTextContent("Front harness -> Door harness");
    expect(scopePanel).toHaveTextContent("Front to door");
    expect(scopePanel).toHaveTextContent("Warnings 1");
    expect(scopePanel).toHaveTextContent("L1 1");
    expect(scopePanel).toHaveTextContent("Loops 1");
    expect(within(scopePanel).getByLabelText("Multi-network union functional schematic")).toBeInTheDocument();
    expect(scopePanel).toHaveTextContent("Trace warning");
  });

  it("calls the Go to handler with the finding target", () => {
    const onGoToFinding = vi.fn();
    render(<Harness onGoToFinding={onGoToFinding} />);

    fireEvent.click(screen.getByRole("button", { name: "Go to" }));

    expect(onGoToFinding).toHaveBeenCalledWith({
      networkId: "network-front",
      subScreen: "connector",
      selectionKind: "connector",
      selectionId: "C-front"
    });
  });

  it("supports custom network selection controls", () => {
    const onToggleCustomNetwork = vi.fn();
    render(<Harness onToggleCustomNetwork={onToggleCustomNetwork} />);

    fireEvent.click(screen.getByRole("button", { name: /Custom\s*2/ }));
    fireEvent.click(screen.getByLabelText("Door harness"));

    expect(onToggleCustomNetwork).toHaveBeenCalledWith("network-door");
  });
});

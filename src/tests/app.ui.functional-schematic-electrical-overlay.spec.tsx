import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { FunctionalSchematicPanel } from "../app/components/network-summary/FunctionalSchematicPanel";
import type { CatalogItem, Connector, Segment, Splice, Wire } from "../core/entities";
import { asCatalogItemId, asConnectorId, asSpliceId, asWireId } from "./helpers/app-ui-test-utils";

function renderFunctionalSchematic({
  connectors,
  splices,
  wires,
  catalogItems = []
}: {
  connectors: Connector[];
  splices: Splice[];
  wires: Wire[];
  catalogItems?: CatalogItem[];
}) {
  return render(
    <FunctionalSchematicPanel
      network={null}
      wires={wires}
      segments={[] as Segment[]}
      catalogItems={catalogItems}
      connectorMap={new Map(connectors.map((connector) => [connector.id, connector]))}
      spliceMap={new Map(splices.map((splice) => [splice.id, splice]))}
      selectedWireId={null}
      selectedConnectorId={connectors[0]?.id ?? null}
      selectedSpliceId={null}
      themeMode="normal"
      pngExportIncludeBackground={false}
      exportIncludeFrame={false}
      exportIncludeCartouche={false}
    />
  );
}

describe("FunctionalSchematicPanel electrical overlay", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows current-network electrical roles by default and hides them without mutating network data", () => {
    const fuseCatalogItem: CatalogItem = {
      id: asCatalogItemId("FUSE-10"),
      manufacturerReference: "F10",
      name: "Fuse 10A",
      connectionCount: 2
    };
    const sourceConnector: Connector = {
      id: asConnectorId("C-SRC"),
      name: "Source connector",
      technicalId: "SRC",
      cavityCount: 1,
      pinElectricalRoles: { 1: { role: "source", currentA: 2.5 } }
    };
    const consumerConnector: Connector = {
      id: asConnectorId("C-CONS"),
      name: "Consumer connector",
      technicalId: "CONS",
      cavityCount: 1,
      pinElectricalRoles: { 1: { role: "consumer", currentA: 2.5 } }
    };
    const splice: Splice = { id: asSpliceId("S-MAIN"), name: "Main splice", technicalId: "S-MAIN", portCount: 2 };
    const wires: Wire[] = [
      {
        id: asWireId("W-SRC"),
        name: "Source wire",
        technicalId: "W-SRC",
        sectionMm2: 1,
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 0,
        isRouteLocked: false,
        protection: { kind: "fuse", catalogItemId: fuseCatalogItem.id },
        endpointA: { kind: "connectorCavity", connectorId: sourceConnector.id, cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: splice.id, portIndex: 1 }
      },
      {
        id: asWireId("W-CONS"),
        name: "Consumer wire",
        technicalId: "W-CONS",
        sectionMm2: 1,
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 0,
        isRouteLocked: false,
        endpointA: { kind: "splicePort", spliceId: splice.id, portIndex: 2 },
        endpointB: { kind: "connectorCavity", connectorId: consumerConnector.id, cavityIndex: 1 }
      }
    ];

    renderFunctionalSchematic({
      connectors: [sourceConnector, consumerConnector],
      splices: [splice],
      wires,
      catalogItems: [fuseCatalogItem]
    });

    const panel = screen.getByRole("heading", { name: "Functional schematic" }).closest(".functional-schematic-panel");
    expect(panel).not.toBeNull();
    const sourcePanel = panel as HTMLElement;
    const svg = within(sourcePanel).getByLabelText("Read-only functional schematic");
    expect(sourcePanel).toHaveTextContent("→ 2.5 A");
    expect(sourcePanel).toHaveTextContent("← 2.5 A");
    expect(svg.querySelector(".functional-edge-current-label")).not.toBeNull();
    expect(svg.querySelector(".functional-fuse-load-marker")).not.toBeNull();

    const connectorsBeforeToggle = [sourceConnector.pinElectricalRoles, consumerConnector.pinElectricalRoles];
    const toggle = within(sourcePanel).getByRole("button", { name: "Electrical roles" });
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(sourcePanel).not.toHaveTextContent("→ 2.5 A");
    expect(sourcePanel).not.toHaveTextContent("← 2.5 A");
    expect(svg.querySelector(".functional-edge-current-label")).toBeNull();
    expect(sourceConnector.pinElectricalRoles).toBe(connectorsBeforeToggle[0]);
    expect(consumerConnector.pinElectricalRoles).toBe(connectorsBeforeToggle[1]);
  });

  it("does not render overlay artifacts when pins do not declare electrical roles", () => {
    renderFunctionalSchematic({
      connectors: [
        { id: asConnectorId("C-A"), name: "Connector A", technicalId: "A", cavityCount: 1 },
        { id: asConnectorId("C-B"), name: "Connector B", technicalId: "B", cavityCount: 1 }
      ],
      splices: [],
      wires: [
        {
          id: asWireId("W-PASSIVE"),
          name: "Passive wire",
          technicalId: "W-PASSIVE",
          sectionMm2: 1,
          primaryColorId: null,
          secondaryColorId: null,
          routeSegmentIds: [],
          lengthMm: 0,
          isRouteLocked: false,
          endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-A"), cavityIndex: 1 },
          endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-B"), cavityIndex: 1 }
        }
      ]
    });

    const svg = screen.getByLabelText("Read-only functional schematic");
    expect(svg.querySelector(".functional-pin-role-marker")).toBeNull();
    expect(svg.querySelector(".functional-edge-current-label")).toBeNull();
    expect(svg.querySelector(".functional-fuse-load-marker")).toBeNull();
  });
});

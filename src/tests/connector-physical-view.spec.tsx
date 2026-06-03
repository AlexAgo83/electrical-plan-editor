import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Connector, Wire } from "../core/entities";
import { ConnectorPhysicalView } from "../app/components/workspace/ConnectorPhysicalView";
import { parseWireOccupantRef } from "../app/lib/app-utils-networking";
import { asConnectorId, asWireId } from "./helpers/app-ui-test-utils";

describe("ConnectorPhysicalView", () => {
  it("keeps the physical layout canvas non-scrollable", () => {
    const styles = readFileSync(resolve(process.cwd(), "src/app/styles/forms/connector-layout.css"), "utf8");
    expect(styles).toContain(".connector-physical-canvas");
    expect(styles).toContain("overflow: hidden");
    expect(styles).not.toContain(".connector-physical-canvas {\n  overflow: auto;");
  });

  it("highlights the physical way and detail card linked to the selected wire", () => {
    const connector: Connector = {
      id: asConnectorId("C1"),
      name: "Connector 1",
      technicalId: "C-1",
      cavityCount: 2
    };
    const selectedWire: Wire = {
      id: asWireId("W1"),
      name: "Wire 1",
      technicalId: "W-1",
      endpointA: { kind: "connectorCavity", connectorId: connector.id, cavityIndex: 1 },
      endpointB: { kind: "connectorCavity", connectorId: connector.id, cavityIndex: 2 },
      routeSegmentIds: [],
      lengthMm: 0,
      isRouteLocked: false,
      sectionMm2: 0.5,
      colorMode: "catalog",
      primaryColorId: "red",
      secondaryColorId: null,
      freeColorLabel: ""
    };

    const { container } = render(
      <ConnectorPhysicalView
        connector={connector}
        catalogItem={undefined}
        connectorCavityStatuses={[
          { cavityIndex: 1, isOccupied: true, occupantRef: "wire:W1:A" },
          { cavityIndex: 2, isOccupied: true, occupantRef: "wire:W2:A" }
        ]}
        wireById={new Map([[selectedWire.id, selectedWire]])}
        selectedWireId={selectedWire.id}
        parseOccupantWireId={(occupantRef) => {
          if (occupantRef === null) {
            return null;
          }
          return parseWireOccupantRef(occupantRef)?.wireId ?? null;
        }}
        onGoToWire={vi.fn()}
        onReleaseCavity={vi.fn()}
      />
    );

    expect(container.querySelectorAll(".connector-physical-way-shape.is-wire-highlighted")).toHaveLength(1);
    expect(container.querySelector(".connector-physical-way.is-wire-highlighted text")?.textContent).toBe("C1");
    expect(container.querySelectorAll(".connector-physical-way-list .cavity.is-wire-highlighted")).toHaveLength(1);
    expect(container.querySelector(".connector-physical-way-list .cavity.is-wire-highlighted h3")?.textContent).toBe("C1");
  });
});

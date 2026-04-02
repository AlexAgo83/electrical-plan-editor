import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState, type AppState } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { clickNewFromPanel } from "./helpers/app-ui-form-test-utils";

function getSelectOptionLabels(select: HTMLElement): string[] {
  return within(select).getAllByRole("option").map((option) => option.textContent?.trim() ?? "");
}

function createModelingDropdownOrderingState(): AppState {
  let state = createInitialState();
  state = appReducer(
    state,
    appActions.upsertCatalogItem({
      id: asCatalogItemId("CAT-Z"),
      manufacturerReference: "Zulu fuse",
      name: "Zulu protection",
      connectionCount: 4
    })
  );
  state = appReducer(
    state,
    appActions.upsertCatalogItem({
      id: asCatalogItemId("CAT-A"),
      manufacturerReference: "alpha fuse",
      name: "Alpha protection",
      connectionCount: 2
    })
  );
  state = appReducer(
    state,
    appActions.upsertConnector({
      id: asConnectorId("C-Z"),
      name: "Zulu connector",
      technicalId: "C-Z",
      cavityCount: 4
    })
  );
  state = appReducer(
    state,
    appActions.upsertConnector({
      id: asConnectorId("C-A"),
      name: "alpha connector",
      technicalId: "C-A",
      cavityCount: 2
    })
  );
  state = appReducer(
    state,
    appActions.upsertSplice({
      id: asSpliceId("S-Z"),
      name: "Zulu splice",
      technicalId: "S-Z",
      portCount: 4
    })
  );
  state = appReducer(
    state,
    appActions.upsertSplice({
      id: asSpliceId("S-A"),
      name: "alpha splice",
      technicalId: "S-A",
      portCount: 2
    })
  );
  state = appReducer(
    state,
    appActions.upsertNode({
      id: asNodeId("NODE-Z"),
      kind: "connector",
      connectorId: asConnectorId("C-Z")
    })
  );
  state = appReducer(
    state,
    appActions.upsertNode({
      id: asNodeId("NODE-M"),
      kind: "intermediate",
      label: "MID"
    })
  );
  state = appReducer(
    state,
    appActions.upsertNode({
      id: asNodeId("NODE-SA"),
      kind: "splice",
      spliceId: asSpliceId("S-A")
    })
  );
  state = appReducer(
    state,
    appActions.upsertNode({
      id: asNodeId("NODE-A"),
      kind: "connector",
      connectorId: asConnectorId("C-A")
    })
  );
  state = appReducer(
    state,
    appActions.upsertSegment({
      id: asSegmentId("SEG-MISSING"),
      nodeA: asNodeId("NODE-A"),
      nodeB: asNodeId("NODE-SA"),
      lengthMm: 25
    })
  );

  const stateWithWire = appReducer(
    state,
    appActions.saveWire({
      id: asWireId("WIRE-MISSING"),
      name: "Wire missing fuse",
      technicalId: "W-MISS",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-A"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-A"), portIndex: 1 }
    })
  );
  const activeNetworkId = stateWithWire.activeNetworkId;
  if (activeNetworkId === null) {
    throw new Error("Expected an active network in modeling dropdown ordering state.");
  }
  const missingProtectionWire = stateWithWire.wires.byId[asWireId("WIRE-MISSING")];
  if (missingProtectionWire === undefined) {
    throw new Error("Expected saved wire WIRE-MISSING.");
  }
  const activeNetworkState = stateWithWire.networkStates[activeNetworkId];
  if (activeNetworkState === undefined) {
    throw new Error("Expected active network scope.");
  }

  return {
    ...stateWithWire,
    wires: {
      ...stateWithWire.wires,
      byId: {
        ...stateWithWire.wires.byId,
        [missingProtectionWire.id]: {
          ...missingProtectionWire,
          protection: { kind: "fuse", catalogItemId: asCatalogItemId("CAT-MISSING") }
        }
      }
    },
    networkStates: {
      ...stateWithWire.networkStates,
      [activeNetworkId]: {
        ...activeNetworkState,
        wires: {
          ...activeNetworkState.wires,
          byId: {
            ...activeNetworkState.wires.byId,
            [missingProtectionWire.id]: {
              ...missingProtectionWire,
              protection: { kind: "fuse", catalogItemId: asCatalogItemId("CAT-MISSING") }
            }
          }
        }
      }
    }
  };
}

describe("App integration UI - modeling dropdown ordering", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function openModelingCreateForm(subScreen: "connector" | "splice" | "node" | "segment" | "wire", panelLabel: string): void {
    renderAppWithState(createModelingDropdownOrderingState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware(subScreen);
    clickNewFromPanel(panelLabel);
  }

  it("sorts connector and splice catalog dropdowns alphabetically", () => {
    openModelingCreateForm("connector", "Connectors");
    const connectorFormPanel = getPanelByHeading("Create Connector");
    expect(getSelectOptionLabels(within(connectorFormPanel).getByLabelText("Catalog item (manufacturer reference)"))).toEqual([
      "Select a catalog item",
      "alpha fuse - Alpha protection (2)",
      "Zulu fuse - Zulu protection (4)"
    ]);

    switchSubScreenDrawerAware("splice");
    clickNewFromPanel("Splices");
    const spliceFormPanel = getPanelByHeading("Create Splice");
    expect(getSelectOptionLabels(within(spliceFormPanel).getByLabelText("Catalog item (manufacturer reference)"))).toEqual([
      "No catalog item",
      "alpha fuse - Alpha protection (2)",
      "Zulu fuse - Zulu protection (4)"
    ]);
  });

  it("sorts node and segment dropdowns alphabetically", () => {
    openModelingCreateForm("node", "Nodes");
    const nodeFormPanel = getPanelByHeading("Create Node");
    fireEvent.change(within(nodeFormPanel).getByLabelText("Node kind"), { target: { value: "connector" } });
    expect(getSelectOptionLabels(within(nodeFormPanel).getByLabelText("Connector"))).toEqual([
      "Select connector",
      "alpha connector (C-A)",
      "Zulu connector (C-Z)"
    ]);
    fireEvent.change(within(nodeFormPanel).getByLabelText("Node kind"), { target: { value: "splice" } });
    expect(getSelectOptionLabels(within(nodeFormPanel).getByLabelText("Splice"))).toEqual([
      "Select splice",
      "alpha splice (S-A)",
      "Zulu splice (S-Z)"
    ]);

    switchSubScreenDrawerAware("segment");
    clickNewFromPanel("Segments");
    const segmentFormPanel = getPanelByHeading("Create Segment");
    expect(getSelectOptionLabels(within(segmentFormPanel).getByLabelText("Node A"))).toEqual([
      "Select node",
      "alpha connector (C-A)",
      "alpha splice (S-A)",
      "MID",
      "Zulu connector (C-Z)"
    ]);
  });

  it("sorts wire endpoint and fuse catalog dropdowns alphabetically", () => {
    openModelingCreateForm("wire", "Wires");
    const wireFormPanel = getPanelByHeading("Create Wire");
    const endpointAFieldset = within(wireFormPanel).getByRole("group", { name: "Endpoint A" });
    const endpointBFieldset = within(wireFormPanel).getByRole("group", { name: "Endpoint B" });
    expect(getSelectOptionLabels(within(endpointAFieldset).getByLabelText("Connector"))).toEqual([
      "Select connector",
      "alpha connector (C-A)",
      "Zulu connector (C-Z)"
    ]);
    fireEvent.change(within(endpointBFieldset).getByLabelText("Type"), { target: { value: "splicePort" } });
    expect(getSelectOptionLabels(within(endpointBFieldset).getByLabelText("Splice"))).toEqual([
      "Select splice",
      "alpha splice (S-A)",
      "Zulu splice (S-Z)"
    ]);
    fireEvent.click(within(wireFormPanel).getByLabelText("Fuse"));
    expect(getSelectOptionLabels(within(wireFormPanel).getByLabelText("Fuse catalog item"))).toEqual([
      "Select catalog item",
      "alpha fuse - Alpha protection",
      "Zulu fuse - Zulu protection"
    ]);
  });

  it("keeps missing selected fuse catalog options pinned above the sorted list in wire edit forms", () => {
    renderAppWithState(createModelingDropdownOrderingState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    fireEvent.click(within(getPanelByHeading("Wires")).getByText("Wire missing fuse"));

    const editWirePanel = getPanelByHeading("Edit Wire");
    const fuseCatalogSelect = within(editWirePanel).getByLabelText("Fuse catalog item");
    expect(fuseCatalogSelect).toHaveValue("CAT-MISSING");
    expect(getSelectOptionLabels(fuseCatalogSelect)).toEqual([
      "Select catalog item",
      "Missing catalog item (CAT-MISSING)",
      "alpha fuse - Alpha protection",
      "Zulu fuse - Zulu protection"
    ]);
  });
});

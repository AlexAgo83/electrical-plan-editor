import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer, createSampleNetworkState } from "../store";
import {
  asConnectorId,
  asSpliceId,
  asWireId,
  createConnectorOccupancyFilterState,
  createConnectorSortingState,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreen,
  switchSubScreen,
  withViewportSize
} from "./helpers/app-ui-test-utils";

function createSegmentAnalysisSortingState() {
  return appReducer(
    createUiIntegrationState(),
    appActions.saveWire({
      id: asWireId("W2"),
      name: "Wire 2",
      technicalId: "W-2",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 2 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 2 }
    })
  );
}

describe("App integration UI - list ergonomics", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("sorts connector list by clicking the Name header", () => {
    renderAppWithState(createConnectorSortingState());
    switchScreen("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    const nameSortButton = within(connectorsPanel).getByRole("button", { name: /Name/i });
    const getFirstConnectorName = () => connectorsPanel.querySelector("tbody tr td")?.textContent?.trim() ?? "";

    expect(getFirstConnectorName()).toBe("Alpha connector");
    fireEvent.click(nameSortButton);
    expect(getFirstConnectorName()).toBe("Zulu connector");
  });

  it("sorts node list by clicking the ID header", () => {
    renderAppWithState(createUiIntegrationState());

    switchSubScreen("node");
    const nodesPanel = getPanelByHeading("Nodes");
    const idSortButton = within(nodesPanel).getByRole("button", { name: /ID/i });
    const getFirstNodeId = () => nodesPanel.querySelector("tbody tr td")?.textContent?.trim() ?? "";

    expect(getFirstNodeId()).toBe("N-C1");
    fireEvent.click(idSortButton);
    expect(getFirstNodeId()).toBe("N-S1");
  });

  it("sorts segment list by clicking the ID header", () => {
    renderAppWithState(createUiIntegrationState());

    switchSubScreen("segment");
    const segmentsPanel = getPanelByHeading("Segments");
    const idSortButton = within(segmentsPanel).getByRole("button", { name: /ID/i });
    const getFirstSegmentId = () => segmentsPanel.querySelector("tbody tr td")?.textContent?.trim() ?? "";

    expect(getFirstSegmentId()).toBe("SEG-A");
    fireEvent.click(idSortButton);
    expect(getFirstSegmentId()).toBe("SEG-B");
  });

  it("splits segment-analysis traversing wires endpoints into Endpoint A and Endpoint B columns with sortable split fields", () => {
    renderAppWithState(createSegmentAnalysisSortingState());

    switchSubScreen("segment");
    const modelingSegmentsPanel = getPanelByHeading("Segments");
    fireEvent.click(within(modelingSegmentsPanel).getByText("SEG-B"));

    switchScreen("analysis");
    switchSubScreen("segment");
    const segmentAnalysisPanel = getPanelByHeading("Segment analysis");

    const endpointASortButton = within(segmentAnalysisPanel).getByRole("button", { name: /Endpoint A/i });
    const endpointBSortButton = within(segmentAnalysisPanel).getByRole("button", { name: /Endpoint B/i });
    expect(endpointASortButton).toBeInTheDocument();
    expect(endpointBSortButton).toBeInTheDocument();
    expect(within(segmentAnalysisPanel).queryByRole("button", { name: /^Endpoints$/i })).not.toBeInTheDocument();

    const getColumnValues = (columnIndex: number): string[] =>
      Array.from(segmentAnalysisPanel.querySelectorAll(`tbody tr td:nth-child(${columnIndex})`)).map((cell) =>
        cell.textContent?.replace(/\s+/g, " ").trim() ?? ""
      );

    const endpointAHeaderCell = endpointASortButton.closest("th");
    const endpointBHeaderCell = endpointBSortButton.closest("th");
    expect(endpointAHeaderCell).not.toBeNull();
    expect(endpointBHeaderCell).not.toBeNull();
    if (endpointAHeaderCell === null || endpointBHeaderCell === null) {
      throw new Error("Expected endpoint sort header cells.");
    }

    fireEvent.click(endpointASortButton);
    expect(endpointAHeaderCell).toHaveAttribute("aria-sort", "ascending");
    const endpointAAsc = getColumnValues(4);
    expect(endpointAAsc.length).toBeGreaterThan(1);
    expect(endpointAAsc).toEqual([...endpointAAsc].sort((a, b) => a.localeCompare(b)));

    fireEvent.click(endpointASortButton);
    expect(endpointAHeaderCell).toHaveAttribute("aria-sort", "descending");
    const endpointADesc = getColumnValues(4);
    expect(endpointADesc).toEqual([...endpointADesc].sort((a, b) => b.localeCompare(a)));

    fireEvent.click(endpointBSortButton);
    expect(endpointBHeaderCell).toHaveAttribute("aria-sort", "ascending");
    const endpointBAsc = getColumnValues(5);
    expect(endpointBAsc.length).toBeGreaterThan(1);
    expect(endpointBAsc).toEqual([...endpointBAsc].sort((a, b) => a.localeCompare(b)));
  });

  it("filters connectors by occupancy chips", () => {
    renderAppWithState(createConnectorOccupancyFilterState());
    switchScreen("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    expect(within(connectorsPanel).getByText("Connector used")).toBeInTheDocument();
    expect(within(connectorsPanel).getByText("Connector free")).toBeInTheDocument();

    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Free" }));
    expect(within(connectorsPanel).queryByText("Connector used")).not.toBeInTheDocument();
    expect(within(connectorsPanel).getByText("Connector free")).toBeInTheDocument();

    const occupancyChipGroup = within(connectorsPanel).getByRole("group", { name: "Connector occupancy filter" });
    fireEvent.click(within(occupancyChipGroup).getByRole("button", { name: "Occupied" }));
    expect(within(connectorsPanel).getByText("Connector used")).toBeInTheDocument();
    expect(within(connectorsPanel).queryByText("Connector free")).not.toBeInTheDocument();
  });

  it("filters wires with a field selector and generic filter input", () => {
    renderAppWithState(createSampleNetworkState());

    switchSubScreen("wire");
    const wiresPanel = getPanelByHeading("Wires");
    expect(within(wiresPanel).getByText("Feed Main Junction")).toBeInTheDocument();
    expect(within(wiresPanel).getByText("Secondary Feed B")).toBeInTheDocument();
    expect(within(wiresPanel).getByText("Filter")).toBeInTheDocument();

    const wireFilterFieldSelect = within(wiresPanel).getByLabelText("Wire filter field");
    const wireFilterInput = within(wiresPanel).getByPlaceholderText("Name, technical ID, endpoint...");
    expect(within(wiresPanel).getByLabelText("Wire filter field query")).toBe(wireFilterInput);

    fireEvent.change(wireFilterInput, { target: { value: "SPL-J1" } });
    expect(within(wiresPanel).getByText("Feed Main Junction")).toBeInTheDocument();
    expect(within(wiresPanel).queryByText("Secondary Feed B")).not.toBeInTheDocument();

    fireEvent.change(wireFilterFieldSelect, { target: { value: "technicalId" } });
    fireEvent.change(within(wiresPanel).getByPlaceholderText("Technical ID"), { target: { value: "WIRE-B-SECONDARY" } });
    expect(within(wiresPanel).getByText("Secondary Feed B")).toBeInTheDocument();
    expect(within(wiresPanel).queryByText("Feed Main Junction")).not.toBeInTheDocument();
  });

  it("filters wires by functional tag before the text filter", () => {
    const baseState = createSampleNetworkState();
    const feedWire = baseState.wires.byId[asWireId("W-001")];
    const secondaryWire = baseState.wires.byId[asWireId("W-004")];
    if (feedWire === undefined || secondaryWire === undefined) {
      throw new Error("Expected sample wires to exist.");
    }
    const taggedState = appReducer(
      appReducer(baseState, appActions.saveWire({ ...feedWire, functionalDomainTag: "CAN" })),
      appActions.saveWire({ ...secondaryWire, functionalDomainTag: "Signal" })
    );

    renderAppWithState(taggedState);

    switchSubScreen("wire");
    const wiresPanel = getPanelByHeading("Wires");
    const tagFilterSelect = within(wiresPanel).getByLabelText("Wire tag filter");
    const tagFilterOptions = Array.from((tagFilterSelect as HTMLSelectElement).options).map((option) => option.textContent);

    expect(tagFilterSelect).toHaveValue("all");
    expect(tagFilterOptions).toEqual(["Any", "CAN", "Signal"]);

    fireEvent.change(tagFilterSelect, { target: { value: "CAN" } });
    expect(within(wiresPanel).getByText("Feed Main Junction")).toBeInTheDocument();
    expect(within(wiresPanel).queryByText("Secondary Feed B")).not.toBeInTheDocument();

    fireEvent.change(tagFilterSelect, { target: { value: "all" } });
    expect(within(wiresPanel).getByText("Feed Main Junction")).toBeInTheDocument();
    expect(within(wiresPanel).getByText("Secondary Feed B")).toBeInTheDocument();
  });

  it("clears the wire tag filter when the active network does not expose the selected tag", async () => {
    const baseState = createSampleNetworkState();
    const feedWire = baseState.wires.byId[asWireId("W-001")];
    if (feedWire === undefined) {
      throw new Error("Expected sample wire to exist.");
    }
    const taggedState = appReducer(baseState, appActions.saveWire({ ...feedWire, functionalDomainTag: "CAN" }));

    renderAppWithState(taggedState);

    switchSubScreen("wire");
    let wiresPanel = getPanelByHeading("Wires");
    const tagFilterSelect = within(wiresPanel).getByLabelText("Wire tag filter");

    fireEvent.change(tagFilterSelect, { target: { value: "CAN" } });
    expect(within(wiresPanel).getByText("Feed Main Junction")).toBeInTheDocument();

    switchScreen("networkScope");
    const networkScopePanel = getPanelByHeading("Network Scope");
    const lightingNetworkRow = within(networkScopePanel).getByText("Lighting branch (Sample)").closest("tr");
    expect(lightingNetworkRow).not.toBeNull();
    fireEvent.click(lightingNetworkRow as HTMLElement);
    fireEvent.click(within(getPanelByHeading("Edit network")).getByRole("button", { name: "Set active" }));

    switchScreen("modeling");
    switchSubScreen("wire");
    wiresPanel = getPanelByHeading("Wires");

    await waitFor(() => {
      expect(within(wiresPanel).getByLabelText("Wire tag filter")).toHaveValue("all");
    });
    expect(within(wiresPanel).getByText("Lighting Feed")).toBeInTheDocument();
  });

  it("splits wire endpoints into Endpoint A and Endpoint B columns and updates the displayed entry count footer when filtering", () => {
    renderAppWithState(createSampleNetworkState());

    switchSubScreen("wire");
    const wiresPanel = getPanelByHeading("Wires");

    expect(within(wiresPanel).getByRole("button", { name: /Endpoint A/i })).toBeInTheDocument();
    expect(within(wiresPanel).getByRole("button", { name: /Endpoint B/i })).toBeInTheDocument();
    expect(within(wiresPanel).queryByRole("button", { name: /^Endpoints$/i })).not.toBeInTheDocument();
    expect(within(wiresPanel).getByText(/entries$/i)).toBeInTheDocument();

    const wireFilterFieldSelect = within(wiresPanel).getByLabelText("Wire filter field");
    fireEvent.change(wireFilterFieldSelect, { target: { value: "technicalId" } });
    fireEvent.change(within(wiresPanel).getByPlaceholderText("Technical ID"), { target: { value: "WIRE-B-SECONDARY" } });

    expect(within(wiresPanel).getByText("1 entry")).toBeInTheDocument();
  });

  it("opens endpoint entities from the wire Endpoint A and Endpoint B cells", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreen("modeling");
    switchSubScreen("wire");
    const wiresPanel = getPanelByHeading("Wires");

    fireEvent.click(within(wiresPanel).getByRole("button", { name: /Connector 1 \(C-1\) \/ C1/i }));
    const connectorsPanel = getPanelByHeading("Connectors");
    expect(within(connectorsPanel).getByText("Connector 1")).toBeInTheDocument();

    switchSubScreen("wire");
    const reopenedWiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(reopenedWiresPanel).getByRole("button", { name: /Splice 1 \(S-1\) \/ P1/i }));
    const splicesPanel = getPanelByHeading("Splices");
    expect(within(splicesPanel).getByText("Splice 1")).toBeInTheDocument();
  });

  it("keeps Select multiple on the main modeling action row between Edit and Delete with an icon", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreen("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    const connectorActions = connectorsPanel.querySelector(".modeling-list-actions");
    expect(connectorActions).not.toBeNull();
    if (!(connectorActions instanceof HTMLElement)) {
      throw new Error("Expected connector action row.");
    }

    const connectorButtons = within(connectorActions).getAllByRole("button");
    expect(connectorButtons.map((button) => button.textContent?.trim() ?? "")).toEqual([
      "New",
      "Edit",
      "Select multiple",
      "Mass edit",
      "Delete"
    ]);
    expect(
      within(connectorActions).getByRole("button", { name: "Select multiple" }).querySelector(".action-button-icon.is-multi-select")
    ).not.toBeNull();

    switchSubScreen("wire");
    const wiresPanel = getPanelByHeading("Wires");
    const wireActions = wiresPanel.querySelector(".modeling-list-actions");
    expect(wireActions).not.toBeNull();
    if (!(wireActions instanceof HTMLElement)) {
      throw new Error("Expected wire action row.");
    }

    const wireButtons = within(wireActions).getAllByRole("button");
    expect(wireButtons.map((button) => button.textContent?.trim() ?? "")).toEqual([
      "New",
      "Edit",
      "Select multiple",
      "Delete"
    ]);
    expect(within(wireActions).getByRole("button", { name: "Select multiple" }).querySelector(".action-button-icon.is-multi-select")).not.toBeNull();
  });

  it("shortens Select multiple action labels to Select on mobile modeling lists", () => {
    withViewportSize({ width: 390, height: 844 }, () => {
      renderAppWithState(createUiIntegrationState());
      switchScreen("modeling");

      ([
        ["connector", "Connectors"],
        ["splice", "Splices"],
        ["node", "Nodes"],
        ["segment", "Segments"],
        ["wire", "Wires"]
      ] as const).forEach(([subScreen, panelHeading]) => {
        switchSubScreen(subScreen);
        const panel = getPanelByHeading(panelHeading);
        const actions = panel.querySelector(".modeling-list-actions");
        expect(actions).not.toBeNull();
        if (!(actions instanceof HTMLElement)) {
          throw new Error(`Expected ${panelHeading} action row.`);
        }

        expect(within(actions).getByRole("button", { name: "Select" }).querySelector(".action-button-icon.is-multi-select")).not.toBeNull();
        expect(within(actions).queryByRole("button", { name: "Select multiple" })).toBeNull();
      });
    });
  });

  it("exports wire CSV with split begin/end columns and without endpoints column", () => {
    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    const createObjectUrl = vi.fn((blob: Blob) => {
      void blob;
      return "blob:test-wire-csv";
    });
    const OriginalBlob = Blob;
    let capturedPayload: BlobPart | undefined;

    try {
      class BlobCapture extends OriginalBlob {
        constructor(parts: BlobPart[] = [], options?: BlobPropertyBag) {
          super(parts, options);
          capturedPayload = parts[0];
        }
      }
      (globalThis as typeof globalThis & { Blob: typeof Blob }).Blob = BlobCapture;
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        writable: true,
        value: createObjectUrl
      });
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        writable: true,
        value: vi.fn()
      });
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

      const baseState = createSampleNetworkState();
      const baseWire = baseState.wires.byId[asWireId("W-001")];
      if (baseWire === undefined) {
        throw new Error("Expected W-001 in sample network state.");
      }
      const stateWithTerminationRefs = appReducer(
        baseState,
        appActions.upsertWire({
          ...baseWire,
          endpointAConnectionReference: "TERM-A-CSV",
          endpointASealReference: "SEAL-A-CSV",
          endpointBConnectionReference: "TERM-B-CSV",
          endpointBSealReference: "SEAL-B-CSV"
        })
      );
      renderAppWithState(stateWithTerminationRefs);
      switchSubScreen("wire");
      const wiresPanel = getPanelByHeading("Wires");
      fireEvent.click(within(wiresPanel).getByRole("button", { name: "CSV" }));

      const blobArg = createObjectUrl.mock.calls[0]?.[0];
      if (!(blobArg instanceof Blob)) {
        throw new Error("Expected captured wire CSV blob.");
      }
      if (typeof capturedPayload !== "string") {
        throw new Error("Expected captured wire CSV payload.");
      }
      const headerLine = capturedPayload.split(/\r?\n/u, 1)[0] ?? "";
      expect(headerLine).toContain(
        "Begin ID,Begin pin,Begin connection ref,Begin seal ref,End ID,End pin,End connection ref,End seal ref"
      );
      expect(headerLine).not.toContain("Endpoints");
      expect(capturedPayload).toContain("TERM-A-CSV");
      // Manual connection references on splice ends are now honored (previously discarded).
      expect(capturedPayload).toContain("TERM-B-CSV");
      // Splice ends without a manual reference resolve to their real catalog material,
      // not a hardcoded default, keeping the wire list uniform with the BOM.
      expect(capturedPayload).toContain("SAMPLE-CAT-J1-10P - Sample main junction 10-port");
      expect(capturedPayload).not.toContain("Preden 13mm");
    } finally {
      (globalThis as typeof globalThis & { Blob: typeof Blob }).Blob = OriginalBlob;
      vi.restoreAllMocks();
      if (originalCreateObjectUrl !== undefined) {
        Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
      }
      if (originalRevokeObjectUrl !== undefined) {
        Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectUrl);
      }
    }
  });

  it("exposes a shared filter clear action that resets the query and restores rows and footer count", () => {
    renderAppWithState(createSampleNetworkState());

    switchSubScreen("wire");
    const wiresPanel = getPanelByHeading("Wires");
    const wireFilterInput = within(wiresPanel).getByLabelText("Wire filter field query");
    const clearFilterButton = within(wiresPanel).getByRole("button", { name: "Clear filter query" });
    const getEntryCountFooterText = () =>
      wiresPanel.querySelector(".table-entry-count-footer")?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const getVisibleWireRowCount = () => wiresPanel.querySelectorAll("tbody tr").length;
    const initialVisibleWireRowCount = getVisibleWireRowCount();

    expect(clearFilterButton).toBeDisabled();
    expect(getEntryCountFooterText()).toBe(
      `${initialVisibleWireRowCount} ${initialVisibleWireRowCount === 1 ? "entry" : "entries"}`
    );

    fireEvent.change(wireFilterInput, { target: { value: "SPL-J1" } });
    const filteredVisibleWireRowCount = getVisibleWireRowCount();
    expect(clearFilterButton).not.toBeDisabled();
    expect(within(wiresPanel).getByText("Feed Main Junction")).toBeInTheDocument();
    expect(within(wiresPanel).queryByText("Secondary Feed B")).not.toBeInTheDocument();
    expect(filteredVisibleWireRowCount).toBeGreaterThan(0);
    expect(filteredVisibleWireRowCount).toBeLessThan(initialVisibleWireRowCount);
    expect(getEntryCountFooterText()).toBe(
      `${filteredVisibleWireRowCount} ${filteredVisibleWireRowCount === 1 ? "entry" : "entries"}`
    );

    fireEvent.click(clearFilterButton);
    expect(wireFilterInput).toHaveValue("");
    expect(clearFilterButton).toBeDisabled();
    expect(within(wiresPanel).getByText("Feed Main Junction")).toBeInTheDocument();
    expect(within(wiresPanel).getByText("Secondary Feed B")).toBeInTheDocument();
    expect(getVisibleWireRowCount()).toBe(initialVisibleWireRowCount);
    expect(getEntryCountFooterText()).toBe(
      `${initialVisibleWireRowCount} ${initialVisibleWireRowCount === 1 ? "entry" : "entries"}`
    );
  });

  it("uses field selector filter bars in modeling connectors, splices, nodes, and segments panels", () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreen("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.change(within(connectorsPanel).getByLabelText("Connector filter field"), {
      target: { value: "name" }
    });
    fireEvent.change(within(connectorsPanel).getByPlaceholderText("Connector name"), {
      target: { value: "Connector 1" }
    });
    expect(within(connectorsPanel).getByText("Connector 1")).toBeInTheDocument();
    expect(within(connectorsPanel).queryByText("Connector 2")).not.toBeInTheDocument();

    switchSubScreen("splice");
    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.change(within(splicesPanel).getByLabelText("Splice filter field"), {
      target: { value: "name" }
    });
    fireEvent.change(within(splicesPanel).getByPlaceholderText("Splice name"), {
      target: { value: "Splice 1" }
    });
    expect(within(splicesPanel).getByText("Splice 1")).toBeInTheDocument();
    expect(within(splicesPanel).queryByText("Splice 2")).not.toBeInTheDocument();

    switchSubScreen("node");
    const nodesPanel = getPanelByHeading("Nodes");
    fireEvent.change(within(nodesPanel).getByLabelText("Node filter field"), {
      target: { value: "id" }
    });
    fireEvent.change(within(nodesPanel).getByPlaceholderText("Node ID"), {
      target: { value: "N-MID" }
    });
    expect(within(nodesPanel).getByText("N-MID")).toBeInTheDocument();
    expect(within(nodesPanel).queryByText("N-C1")).not.toBeInTheDocument();

    switchSubScreen("segment");
    const segmentsPanel = getPanelByHeading("Segments");
    fireEvent.change(within(segmentsPanel).getByLabelText("Segment filter field"), {
      target: { value: "id" }
    });
    fireEvent.change(within(segmentsPanel).getByPlaceholderText("Segment ID"), {
      target: { value: "SEG-A" }
    });
    expect(within(segmentsPanel).getByText("SEG-A")).toBeInTheDocument();
    expect(within(segmentsPanel).queryByText("SEG-B")).not.toBeInTheDocument();
  });
});

import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createSampleNetworkState } from "../store";
import {
  createConnectorOccupancyFilterState,
  createConnectorSortingState,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreen,
  switchSubScreen
} from "./helpers/app-ui-test-utils";

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
    renderAppWithState(createSampleNetworkState());

    switchSubScreen("segment");
    const modelingSegmentsPanel = getPanelByHeading("Segments");
    fireEvent.click(within(modelingSegmentsPanel).getByText("SEG-002"));

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

  it("filters wires by free color label through the generic any-field filter and renders the free color text", () => {
    const state = createSampleNetworkState();
    const firstWireId = state.wires.allIds[0];
    if (firstWireId === undefined) {
      throw new Error("Expected a sample wire.");
    }
    const activeNetworkId = state.activeNetworkId;
    if (activeNetworkId === null) {
      throw new Error("Expected an active network.");
    }
    const targetLabel = "Beige/Brown mix";

    state.wires.byId[firstWireId] = {
      ...state.wires.byId[firstWireId]!,
      colorMode: "free",
      primaryColorId: "RD",
      secondaryColorId: "BU",
      freeColorLabel: `  ${targetLabel}  `
    };
    state.networkStates[activeNetworkId] = {
      ...state.networkStates[activeNetworkId]!,
      wires: {
        ...state.networkStates[activeNetworkId]!.wires,
        byId: {
          ...state.networkStates[activeNetworkId]!.wires.byId,
          [firstWireId]: {
            ...state.networkStates[activeNetworkId]!.wires.byId[firstWireId]!,
            colorMode: "free",
            primaryColorId: "RD",
            secondaryColorId: "BU",
            freeColorLabel: `  ${targetLabel}  `
          }
        }
      }
    };

    renderAppWithState(state);
    switchSubScreen("wire");

    const wiresPanel = getPanelByHeading("Wires");
    expect(within(wiresPanel).getByText(targetLabel)).toBeInTheDocument();

    const wireFilterFieldSelect = within(wiresPanel).getByLabelText("Wire filter field");
    fireEvent.change(wireFilterFieldSelect, { target: { value: "any" } });
    fireEvent.change(within(wiresPanel).getByPlaceholderText("Name, technical ID, endpoint..."), {
      target: { value: "beige/brown" }
    });

    expect(within(wiresPanel).getByText("Feed Main Junction")).toBeInTheDocument();
    expect(within(wiresPanel).queryByText("Secondary Feed B")).not.toBeInTheDocument();
  });

  it("distinguishes free unspecified wire colors from no-color and makes them discoverable via any-field filter", () => {
    const state = createSampleNetworkState();
    const firstWireId = state.wires.allIds[0];
    const activeNetworkId = state.activeNetworkId;
    if (firstWireId === undefined || activeNetworkId === null) {
      throw new Error("Expected sample state with active network and wires.");
    }

    state.wires.byId[firstWireId] = {
      ...state.wires.byId[firstWireId]!,
      colorMode: "free",
      primaryColorId: "RD",
      secondaryColorId: "BU",
      freeColorLabel: null
    };
    state.networkStates[activeNetworkId] = {
      ...state.networkStates[activeNetworkId]!,
      wires: {
        ...state.networkStates[activeNetworkId]!.wires,
        byId: {
          ...state.networkStates[activeNetworkId]!.wires.byId,
          [firstWireId]: {
            ...state.networkStates[activeNetworkId]!.wires.byId[firstWireId]!,
            colorMode: "free",
            primaryColorId: "RD",
            secondaryColorId: "BU",
            freeColorLabel: null
          }
        }
      }
    };

    renderAppWithState(state);
    switchSubScreen("wire");

    const wiresPanel = getPanelByHeading("Wires");
    expect(within(wiresPanel).getByText("Unspecified")).toBeInTheDocument();

    const wireFilterFieldSelect = within(wiresPanel).getByLabelText("Wire filter field");
    fireEvent.change(wireFilterFieldSelect, { target: { value: "any" } });
    fireEvent.change(within(wiresPanel).getByPlaceholderText("Name, technical ID, endpoint..."), {
      target: { value: "free" }
    });

    expect(within(wiresPanel).getByText("Feed Main Junction")).toBeInTheDocument();
    expect(within(wiresPanel).queryByText("Secondary Feed B")).not.toBeInTheDocument();
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

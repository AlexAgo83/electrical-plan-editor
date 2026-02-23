import { fireEvent, within } from "@testing-library/react";
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

  it("filters connectors by occupancy chips", () => {
    renderAppWithState(createConnectorOccupancyFilterState());
    switchScreen("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    expect(within(connectorsPanel).getByText("Connector used")).toBeInTheDocument();
    expect(within(connectorsPanel).getByText("Connector free")).toBeInTheDocument();

    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Free" }));
    expect(within(connectorsPanel).queryByText("Connector used")).not.toBeInTheDocument();
    expect(within(connectorsPanel).getByText("Connector free")).toBeInTheDocument();

    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Occupied" }));
    expect(within(connectorsPanel).getByText("Connector used")).toBeInTheDocument();
    expect(within(connectorsPanel).queryByText("Connector free")).not.toBeInTheDocument();
  });

  it("filters wires by endpoint text", () => {
    renderAppWithState(createSampleNetworkState());

    switchSubScreen("wire");
    const wiresPanel = getPanelByHeading("Wires");
    expect(within(wiresPanel).getByText("Feed Main Junction")).toBeInTheDocument();
    expect(within(wiresPanel).getByText("Secondary Feed B")).toBeInTheDocument();

    fireEvent.change(within(wiresPanel).getByLabelText(/Endpoint filter/i), { target: { value: "SPL-J1" } });
    expect(within(wiresPanel).getByText("Feed Main Junction")).toBeInTheDocument();
    expect(within(wiresPanel).queryByText("Secondary Feed B")).not.toBeInTheDocument();
  });
});

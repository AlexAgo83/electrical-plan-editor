import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState, type AppState } from "../store";
import {
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

function createFloatingSpliceState(): AppState {
  const actions = [
    appActions.upsertConnector({ id: asConnectorId("C-A"), name: "Connector A", technicalId: "C-A", cavityCount: 2 }),
    appActions.upsertConnector({ id: asConnectorId("C-B"), name: "Connector B", technicalId: "C-B", cavityCount: 2 }),
    appActions.upsertNode({ id: asNodeId("NODE-A"), kind: "connector", connectorId: asConnectorId("C-A") }),
    appActions.upsertNode({ id: asNodeId("NODE-B"), kind: "connector", connectorId: asConnectorId("C-B") }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-1"),
      nodeA: asNodeId("NODE-A"),
      nodeB: asNodeId("NODE-B"),
      lengthMm: 100
    }),
    // Floating splice: placed on the segment, not represented as a splice node.
    appActions.upsertSplice({
      id: asSpliceId("SP-1"),
      name: "Inline splice",
      technicalId: "SP-1",
      portCount: 2,
      placement: { kind: "segmentOffset", segmentId: asSegmentId("SEG-1"), fromNodeId: asNodeId("NODE-A"), offsetMm: 20 }
    })
  ];
  return actions.reduce(appReducer, createInitialState());
}

describe("App integration UI - floating splice click-to-edit", () => {
  it("opens the splice edit form on a single click, matching connector edit activation", async () => {
    const { store } = renderAppWithState(createFloatingSpliceState());
    switchScreenDrawerAware("modeling");

    const panel = getPanelByHeading("Network summary");

    // Hide the floating inspector first; a single click must not force it back open.
    const displayOptions = within(panel).getByRole("group", { name: "Network summary display options" });
    fireEvent.click(within(displayOptions).getByRole("button", { name: "View" }));
    fireEvent.click(within(displayOptions).getByRole("button", { name: "Hide inspector" }));
    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();

    const floatingSplice = await waitFor(() => {
      const element = panel.querySelector('[data-splice-id="SP-1"]');
      expect(element).not.toBeNull();
      return element as Element;
    });

    fireEvent.click(floatingSplice);

    // A single click opens the splice edit workflow directly (AC8).
    await waitFor(() => {
      expect(getPanelByHeading("Edit Splice")).toBeInTheDocument();
    });
    expect(store.getState().ui.selected).toMatchObject({ kind: "splice", id: "SP-1" });

    // The hidden inspector must NOT pop open on a single click (matching connector
    // icon behavior). It only opens on double-click.
    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();
  });
});

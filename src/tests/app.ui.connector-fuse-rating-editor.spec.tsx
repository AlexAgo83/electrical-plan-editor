import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - connector fuse rating editor", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("edits fuse-box connector ratings with structured per-pair controls", () => {
    const catalogItemId = asCatalogItemId("CAT-FUSE-BOX");
    const connectorId = asConnectorId("C-FUSE-BOX");
    let state = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "FBOX-4",
        name: "Fuse box",
        connectionCount: 4,
        fuseBoxConfig: {
          pairs: [
            { pairIndex: 0, pinA: 1, pinB: 2 },
            { pairIndex: 1, pinA: 3, pinB: 4 }
          ]
        }
      })
    );
    state = appReducer(
      state,
      appActions.upsertConnector({
        id: connectorId,
        name: "Fuse connector",
        technicalId: "FUSE-C1",
        cavityCount: 4,
        catalogItemId,
        manufacturerReference: "FBOX-4",
        fusePairRatings: { 0: 10 }
      })
    );

    const { store } = renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Fuse connector"));

    const connectorFormPanel = getPanelByHeading("Edit Connector");
    expect(within(connectorFormPanel).queryByLabelText(/one per line: pairIndex,amps/i)).not.toBeInTheDocument();
    expect(within(connectorFormPanel).getByText("pin 1 - 2")).toBeInTheDocument();
    expect(within(connectorFormPanel).getByText("pin 3 - 4")).toBeInTheDocument();

    const pairOneInput = within(connectorFormPanel).getByRole("spinbutton", {
      name: "Rating for fuse pair 1, pins 1 and 2, in amperes"
    });
    const pairTwoInput = within(connectorFormPanel).getByRole("spinbutton", {
      name: "Rating for fuse pair 2, pins 3 and 4, in amperes"
    });
    expect(pairOneInput).toHaveValue(10);
    expect(pairTwoInput).toHaveValue(null);

    const pairTwoToolbar = within(connectorFormPanel).getByRole("toolbar", { name: "Quick ratings for fuse pair 2" });
    fireEvent.click(within(pairTwoToolbar).getByRole("button", { name: "7.5" }));
    expect(pairTwoInput).toHaveValue(7.5);
    expect(within(pairTwoToolbar).getByRole("button", { name: "7.5" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(within(connectorFormPanel).getByLabelText("Apply same rating to all pairs"));
    fireEvent.change(pairTwoInput, { target: { value: "40" } });
    expect(pairOneInput).toHaveValue(40);
    expect(pairTwoInput).toHaveValue(40);

    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Save" }));
    expect(store.getState().connectors.byId[connectorId]?.fusePairRatings).toEqual({ 0: 40, 1: 40 });
  });
});

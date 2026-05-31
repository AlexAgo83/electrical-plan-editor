import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId,
  getPanelByHeading,
  reduceAll,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { clickNewFromPanel } from "./helpers/app-ui-form-test-utils";

describe("App integration UI - creation flow splice ergonomics", () => {
  beforeEach(() => localStorage.clear());

  it("can create an automatic L/R directional splice directly from the create form", () => {
    const { store } = renderAppWithState(createInitialState());
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("splice");

    clickNewFromPanel("Splices");
    const createSplicePanel = getPanelByHeading("Create Splice");
    fireEvent.change(within(createSplicePanel).getByLabelText("Functional name"), {
      target: { value: "Directional splice draft" }
    });
    fireEvent.change(within(createSplicePanel).getByLabelText("Splice type"), {
      target: { value: "directional" }
    });
    expect(within(createSplicePanel).getByLabelText("Directional ports")).toHaveValue("L / R");

    fireEvent.click(within(createSplicePanel).getByRole("button", { name: "Create" }));

    const createdSplice = Object.values(store.getState().splices.byId).find(
      (splice) => splice?.technicalId === "S-001"
    );
    expect(createdSplice).toMatchObject({
      name: "Directional splice draft",
      portMode: "directional",
      portCount: 2
    });
  });

  it("keeps optimized lengths available when editing a catalog-linked directional splice", () => {
    const catalogItemId = asCatalogItemId("CAT-2");
    const stateWithDirectionalSplice = appReducer(
      appReducer(
        createInitialState(),
        appActions.upsertCatalogItem({
          id: catalogItemId,
          manufacturerReference: "CAT-REF-2",
          name: "Catalog Two",
          connectionCount: 2
        })
      ),
      appActions.upsertSplice({
        id: asSpliceId("S-DIR-CAT"),
        name: "Catalog directional splice",
        technicalId: "S-DIR-CAT",
        catalogItemId,
        manufacturerReference: "CAT-REF-2",
        portMode: "directional",
        portCount: 2
      })
    );

    renderAppWithState(stateWithDirectionalSplice);
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("splice");

    fireEvent.click(within(getPanelByHeading("Splices")).getByText("Catalog directional splice"));
    const editSplicePanel = getPanelByHeading("Edit Splice");
    expect(within(editSplicePanel).getByLabelText("Directional ports")).toHaveValue("L / R");
    expect(within(editSplicePanel).getByRole("button", { name: "Suggest optimized lengths" })).toBeInTheDocument();
  });

  it("shows optimized splice lengths in the sticky inspector slot without opening a modal", async () => {
    const state = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C-L"), name: "Left", technicalId: "C-L", cavityCount: 1 }),
      appActions.upsertConnector({ id: asConnectorId("C-R"), name: "Right", technicalId: "C-R", cavityCount: 1 }),
      appActions.upsertSplice({
        id: asSpliceId("S-OPT"),
        name: "Optimized splice",
        technicalId: "S-OPT",
        portMode: "directional",
        portCount: 2
      }),
      appActions.upsertNode({ id: asNodeId("N-L"), kind: "connector", connectorId: asConnectorId("C-L") }),
      appActions.upsertNode({ id: asNodeId("N-R"), kind: "connector", connectorId: asConnectorId("C-R") }),
      appActions.upsertNode({ id: asNodeId("N-S"), kind: "splice", spliceId: asSpliceId("S-OPT") }),
      appActions.upsertSegment({
        id: asSegmentId("SEG-L"),
        nodeA: asNodeId("N-L"),
        nodeB: asNodeId("N-S"),
        lengthMm: 80
      }),
      appActions.upsertSegment({
        id: asSegmentId("SEG-R"),
        nodeA: asNodeId("N-S"),
        nodeB: asNodeId("N-R"),
        lengthMm: 20
      }),
      appActions.saveWire({
        id: asWireId("W-L"),
        name: "Left heavy wire",
        technicalId: "W-L",
        sectionMm2: 4,
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-L"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-OPT"), portIndex: 1 }
      }),
      appActions.saveWire({
        id: asWireId("W-R"),
        name: "Right light wire",
        technicalId: "W-R",
        sectionMm2: 1,
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-R"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-OPT"), portIndex: 2 }
      })
    ]);

    const { store } = renderAppWithState(state);
    const closeOnboarding = screen.queryByRole("button", { name: "Close onboarding" });
    if (closeOnboarding !== null) {
      fireEvent.click(closeOnboarding);
    }
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("splice");

    fireEvent.click(within(getPanelByHeading("Splices")).getByText("Optimized splice"));
    fireEvent.click(within(getPanelByHeading("Edit Splice")).getByRole("button", { name: "Suggest optimized lengths" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Suggested splice lengths" })).toBeInTheDocument();
    });
    const suggestionPanel = getPanelByHeading("Suggested splice lengths");
    expect(within(suggestionPanel).getByText("S-OPT - Optimized splice")).toBeInTheDocument();
    expect(within(suggestionPanel).getByText(/Copper volume/)).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Suggested splice lengths" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Inspector context" })).not.toBeInTheDocument();

    fireEvent.click(within(suggestionPanel).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("heading", { name: "Suggested splice lengths" })).not.toBeInTheDocument();

    fireEvent.click(within(getPanelByHeading("Edit Splice")).getByRole("button", { name: "Suggest optimized lengths" }));
    fireEvent.click(within(getPanelByHeading("Suggested splice lengths")).getByRole("button", { name: "Apply suggestion" }));

    expect(screen.queryByRole("heading", { name: "Suggested splice lengths" })).not.toBeInTheDocument();
    expect(store.getState().segments.byId[asSegmentId("SEG-L")]?.lengthMm).toBeLessThan(80);
  });
});

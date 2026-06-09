import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { NetworkId } from "../core/entities";
import { appActions, appReducer, createInitialState } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId,
  createUiIntegrationState,
  getPanelByHeading,
  reduceAll,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware,
  withViewportWidth
} from "./helpers/app-ui-test-utils";
import { installScrollIntoViewSpy } from "./helpers/app-ui-form-test-utils";

function setViewportWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width
  });
  fireEvent(window, new Event("resize"));
}

describe("App integration UI - inspector floating shell", () => {
  let originalInnerWidth = window.innerWidth;
  const getInspectorShell = () => screen.queryByLabelText("Inspector context panel");
  const closeOnboardingIfOpen = () => {
    const closeButton = screen.queryByRole("button", { name: "Close onboarding" });
    if (closeButton !== null) {
      fireEvent.click(closeButton);
    }
  };
  const expectInlineConnectorSelectionPanels = () => {
    expect(getPanelByHeading("Connector analysis")).toBeInTheDocument();
    const editPanel = getPanelByHeading("Edit Connector");
    expect(within(editPanel).getByDisplayValue("C-1")).toBeInTheDocument();
  };

  beforeEach(() => {
    localStorage.clear();
    originalInnerWidth = window.innerWidth;
    setViewportWidth(1280);
  });

  afterEach(() => {
    setViewportWidth(originalInnerWidth);
  });

  it("keeps inspector collapsed when no entity is selected", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");

    const inspectorShell = getInspectorShell();
    if (inspectorShell !== null) {
      expect(inspectorShell).toHaveClass("is-collapsed");
      expect(within(getPanelByHeading("Inspector context")).getByText(/No entity selected/i)).toBeInTheDocument();
      return;
    }

    expect(screen.queryByRole("heading", { name: "Edit Connector" })).not.toBeInTheDocument();
  });

  it("toggles the floating inspector from network summary display options", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");

    const displayOptions = screen.getByRole("group", { name: "Network summary display options" });
    fireEvent.click(within(displayOptions).getByRole("button", { name: "View" }));
    const hideInspectorButton = within(displayOptions).getByRole("button", { name: "Hide inspector" });
    expect(hideInspectorButton).toHaveTextContent("Inspect");
    expect(hideInspectorButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(hideInspectorButton);
    const showInspectorButton = within(displayOptions).getByRole("button", { name: "Show inspector" });
    expect(showInspectorButton).toHaveAttribute("aria-pressed", "false");
    expect(getInspectorShell()).not.toBeInTheDocument();

    fireEvent.click(showInspectorButton);
    expect(within(displayOptions).getByRole("button", { name: "Hide inspector" })).toHaveAttribute("aria-pressed", "true");
  });

  it("opens the hidden inspector when double-clicking an inspectable network summary element", async () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const displayOptions = within(networkSummaryPanel).getByRole("group", { name: "Network summary display options" });
    const viewButton = within(displayOptions).getByRole("button", { name: "View" });
    fireEvent.click(viewButton);
    fireEvent.click(within(displayOptions).getByRole("button", { name: "Hide inspector" }));
    expect(getInspectorShell()).not.toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(within(displayOptions).queryByRole("button", { name: "Show inspector" })).not.toBeInTheDocument();

    const segmentHitbox = within(networkSummaryPanel).getByRole("button", { name: "Select segment SEG-A" });
    fireEvent.click(segmentHitbox);
    fireEvent.click(segmentHitbox, { detail: 2 });

    await waitFor(() => {
      expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-open");
    });
    expect(within(getPanelByHeading("Inspector context")).getByText("SEG-A", { selector: ".inspector-entity-id" })).toBeInTheDocument();
  });

  it("closes the floating inspector from its header icon button", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    const inspectorShell = getInspectorShell();
    if (inspectorShell === null) {
      expectInlineConnectorSelectionPanels();
      return;
    }

    fireEvent.click(within(getPanelByHeading("Inspector context")).getByRole("button", { name: "Close inspector" }));
    expect(getInspectorShell()).not.toBeInTheDocument();
  });

  it("labels the inspector selected-entity action as edit and scrolls to the edit panel", async () => {
    const scrollSpy = installScrollIntoViewSpy();
    try {
      renderAppWithState(createUiIntegrationState());
      closeOnboardingIfOpen();
      switchScreenDrawerAware("modeling");

      const networkSummaryPanel = getPanelByHeading("Network summary");
      fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Select Connector 1 (C-1)" }));
      const inspectorShell = getInspectorShell();
      if (inspectorShell === null) {
        return;
      }

      const inspectorPanel = getPanelByHeading("Inspector context");
      expect(within(inspectorPanel).queryByRole("button", { name: "Select" })).not.toBeInTheDocument();
      fireEvent.click(within(inspectorPanel).getByRole("button", { name: "Edit" }));

      expect(getPanelByHeading("Edit Connector")).toBeInTheDocument();
      await waitFor(() => {
        expect(
          scrollSpy.scrollTargets.some((target) => target.getAttribute("data-form-panel") === "modeling-connector-form")
        ).toBe(true);
      });
    } finally {
      scrollSpy.restore();
    }
  });

  it("offers optimized splice length suggestions from the inspector splice actions", async () => {
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
    renderAppWithState(state);
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("splice");

    fireEvent.click(within(getPanelByHeading("Splices")).getByText("Optimized splice"));
    const inspectorShell = getInspectorShell();
    if (inspectorShell === null) {
      expect(within(getPanelByHeading("Edit Splice")).getByRole("button", { name: "Suggest optimized lengths" })).toBeInTheDocument();
      return;
    }

    const inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).queryByRole("button", { name: "Select" })).not.toBeInTheDocument();
    expect(within(inspectorPanel).getByRole("button", { name: "Edit" })).toBeInTheDocument();
    fireEvent.click(within(inspectorPanel).getByRole("button", { name: "Suggest optimized lengths" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Suggested splice lengths" })).toBeInTheDocument();
    });
    expect(within(getPanelByHeading("Suggested splice lengths")).getByText("S-OPT - Optimized splice")).toBeInTheDocument();
  });

  it("opens inspector on modeling and analysis when a selection exists", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    const inspectorShell = getInspectorShell();
    if (inspectorShell !== null) {
      expect(inspectorShell).toHaveClass("is-open");
      expect(
        within(getPanelByHeading("Inspector context")).getByText("C-1", { selector: ".inspector-entity-id" })
      ).toBeInTheDocument();
    } else {
      expectInlineConnectorSelectionPanels();
    }

    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("connector");
    const analysisInspectorShell = getInspectorShell();
    if (analysisInspectorShell !== null) {
      expect(analysisInspectorShell).toHaveClass("is-open");
      return;
    }

    const analysisPanel = getPanelByHeading("Connector analysis");
    expect(analysisPanel).toHaveTextContent(/\(C-1\)/);
  });

  it("uses the manufacturer reference as the catalog inspector display id", () => {
    const stateWithCatalog = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: asCatalogItemId("CAT-INTERNAL-1"),
        manufacturerReference: "CAT-MFR-1",
        name: "Catalog inspector sample",
        connectionCount: 2
      })
    );
    renderAppWithState(stateWithCatalog);
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("catalog");

    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByText("CAT-MFR-1"));

    const inspectorShell = getInspectorShell();
    if (inspectorShell === null) {
      return;
    }

    expect(inspectorShell).toHaveClass("is-open");
    const inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).getByText("CAT-MFR-1", { selector: ".inspector-entity-id" })).toBeInTheDocument();
    expect(within(inspectorPanel).queryByText("CAT-INTERNAL-1", { selector: ".inspector-entity-id" })).not.toBeInTheDocument();
    expect(within(inspectorPanel).getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("opens referenced catalog items from connector manufacturer reference cells", () => {
    const baseState = createUiIntegrationState();
    const connector = baseState.connectors.byId[asConnectorId("C1")];
    if (connector === undefined) {
      throw new Error("Expected connector C1 in integration state.");
    }
    const stateWithCatalog = appReducer(
      appReducer(
        baseState,
        appActions.upsertCatalogItem({
          id: asCatalogItemId("CAT-INTERNAL-1"),
          manufacturerReference: "CAT-MFR-1",
          name: "Catalog inspector sample",
          connectionCount: connector.cavityCount
        })
      ),
      appActions.upsertConnector({
        ...connector,
        catalogItemId: asCatalogItemId("CAT-INTERNAL-1"),
        manufacturerReference: "CAT-MFR-1"
      })
    );

    renderAppWithState(stateWithCatalog);
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "CAT-MFR-1" }));

    const catalogPanel = getPanelByHeading("Catalog");
    expect(within(catalogPanel).getByText("CAT-MFR-1")).toBeInTheDocument();
    expect(within(getPanelByHeading("Edit catalog item")).getByLabelText("Manufacturer reference")).toHaveValue("CAT-MFR-1");
    const inspectorShell = getInspectorShell();
    if (inspectorShell !== null) {
      expect(within(getPanelByHeading("Inspector context")).getByText("CAT-MFR-1", { selector: ".inspector-entity-id" })).toBeInTheDocument();
    }
  });

  it("opens referenced catalog items from inspector manufacturer references", () => {
    const baseState = createUiIntegrationState();
    const connector = baseState.connectors.byId[asConnectorId("C1")];
    if (connector === undefined) {
      throw new Error("Expected connector C1 in integration state.");
    }
    const stateWithCatalog = appReducer(
      appReducer(
        baseState,
        appActions.upsertCatalogItem({
          id: asCatalogItemId("CAT-INTERNAL-1"),
          manufacturerReference: "CAT-MFR-1",
          name: "Catalog inspector sample",
          connectionCount: connector.cavityCount
        })
      ),
      appActions.upsertConnector({
        ...connector,
        catalogItemId: asCatalogItemId("CAT-INTERNAL-1"),
        manufacturerReference: "CAT-MFR-1"
      })
    );

    renderAppWithState(stateWithCatalog);
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Select Connector 1 (C-1)" }));
    const inspectorShell = getInspectorShell();
    if (inspectorShell === null) {
      return;
    }

    fireEvent.click(within(getPanelByHeading("Inspector context")).getByRole("button", { name: "CAT-MFR-1" }));

    expect(within(getPanelByHeading("Edit catalog item")).getByLabelText("Manufacturer reference")).toHaveValue("CAT-MFR-1");
  });

  it("hides inspector on Validation, Network Scope and Settings", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("validation");
    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();

    switchScreenDrawerAware("networkScope");
    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();

    switchScreenDrawerAware("settings");
    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();
  });

  it("hides inspector when there is no active network", () => {
    const stateWithoutActiveNetwork = {
      ...createUiIntegrationState(),
      activeNetworkId: null as NetworkId | null
    };
    renderAppWithState(stateWithoutActiveNetwork);

    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();
  });

  it("collapses on narrow viewport and supports explicit expand/collapse", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    const inspectorShell = getInspectorShell();
    if (inspectorShell === null) {
      expectInlineConnectorSelectionPanels();
      return;
    }
    expect(inspectorShell).toHaveClass("is-open");

    withViewportWidth(860, () => {
      expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-collapsed");

      const inspectorPanel = getPanelByHeading("Inspector context");
      fireEvent.click(within(inspectorPanel).getByRole("button", { name: "Expand" }));
      expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-open");

      fireEvent.click(within(getPanelByHeading("Inspector context")).getByRole("button", { name: "Collapse" }));
      expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-collapsed");
    });
  });

  it("hides inspector while drawer or operations panel overlays are open", () => {
    renderAppWithState(createUiIntegrationState());
    closeOnboardingIfOpen();
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    const inspectorShell = getInspectorShell();
    if (inspectorShell === null) {
      expectInlineConnectorSelectionPanels();

      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      expect(getInspectorShell()).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Close navigation menu" }));
      expect(getInspectorShell()).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Ops" }));
      expect(getInspectorShell()).not.toBeInTheDocument();
      return;
    }
    expect(inspectorShell).toHaveClass("is-open");

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(getInspectorShell()).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close navigation menu" }));
    expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-open");

    fireEvent.click(screen.getByRole("button", { name: "Ops" }));
    expect(getInspectorShell()).not.toBeInTheDocument();
  });
});

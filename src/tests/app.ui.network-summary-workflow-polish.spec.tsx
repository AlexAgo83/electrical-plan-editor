import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import {
  asAssemblyId,
  asNetworkId,
  createHarnessAssemblyFunctionalSelectionState,
  getCurrentNetworkFunctionalPanel,
  getNetworkSummaryViewBoxSize,
  getNetworkSummaryViewportTransform,
  parseNetworkSummaryViewportTransform
} from "./helpers/network-summary-workflow-test-utils";
describe("App integration UI - network summary workflow polish", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses the fitted network viewport as the default before any zoom change", async () => {
    const rendered = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const panel = getPanelByHeading("Network summary");
    await waitFor(() => {
      expect(getNetworkSummaryViewportTransform(panel)).not.toBe("translate(0 0) scale(1)");
    });
    const defaultViewportTransform = getNetworkSummaryViewportTransform(panel);

    fireEvent.click(within(panel).getByRole("button", { name: "Fit network" }));
    expect(getNetworkSummaryViewportTransform(panel)).toBe(defaultViewportTransform);

    const activeNetworkId = rendered.store.getState().activeNetworkId;
    expect(activeNetworkId).not.toBeNull();
    if (activeNetworkId === null) {
      throw new Error("Expected active network.");
    }
    expect(rendered.store.getState().networkStates[activeNetworkId]?.networkSummaryViewState).toBeUndefined();
  });

  it("shows icons on the reset and fit canvas controls", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const panel = getPanelByHeading("Network summary");
    const resetViewButton = within(panel).getByRole("button", { name: "Reset view" });
    const fitNetworkButton = within(panel).getByRole("button", { name: "Fit network" });

    expect(resetViewButton).toHaveClass("workspace-tab");
    expect(resetViewButton.querySelector(".action-button-icon.is-undo")).not.toBeNull();
    expect(fitNetworkButton).toHaveClass("workspace-tab");
    expect(fitNetworkButton.querySelector(".action-button-icon.is-fit")).not.toBeNull();
  });

  it("treats a legacy reset viewport as no prior zoom change", async () => {
    const base = createUiIntegrationState();
    const activeNetworkId = base.activeNetworkId;
    expect(activeNetworkId).not.toBeNull();
    if (activeNetworkId === null) {
      throw new Error("Expected active network.");
    }
    const scoped = base.networkStates[activeNetworkId];
    expect(scoped).toBeDefined();
    if (scoped === undefined) {
      throw new Error("Expected active scoped network.");
    }

    renderAppWithState({
      ...base,
      networkStates: {
        ...base.networkStates,
        [activeNetworkId]: {
          ...scoped,
          networkSummaryViewState: {
            scale: 0.6,
            offset: { x: 0, y: 0 },
            showNetworkInfoPanels: true,
            showSegmentNames: false,
            showSegmentLengths: true,
            showCableCallouts: false,
            showNetworkGrid: true,
            snapNodesToGrid: true,
            lockEntityMovement: false
          }
        }
      }
    });
    switchScreenDrawerAware("modeling");

    const panel = getPanelByHeading("Network summary");
    await waitFor(() => {
      expect(getNetworkSummaryViewportTransform(panel)).not.toBe("translate(0 0) scale(0.6)");
    });
    const defaultViewportTransform = getNetworkSummaryViewportTransform(panel);

    fireEvent.click(within(panel).getByRole("button", { name: "Fit network" }));
    expect(getNetworkSummaryViewportTransform(panel)).toBe(defaultViewportTransform);
  });

  it("renders a compact quick entity navigation strip above network summary and switches sub-screens", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const globalSettingsPanel = getPanelByHeading("Global preferences");
    fireEvent.click(within(globalSettingsPanel).getByLabelText("Show route preview panel"));

    switchScreenDrawerAware("modeling");

    expect(getPanelByHeading("Route preview")).toBeInTheDocument();
    const quickNavPanel = document.querySelector("[data-quick-entity-nav-source='true']");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    expect(quickNavPanel).not.toBeNull();
    const sourceQuickNavPanel = quickNavPanel as HTMLElement;
    const connectorsButton = within(sourceQuickNavPanel).getByRole("button", { name: /Connectors/i });
    const segmentsButton = within(sourceQuickNavPanel).getByRole("button", { name: /Segments/i });
    const wiresButton = within(sourceQuickNavPanel).getByRole("button", { name: /Wires/i });

    expect(sourceQuickNavPanel.compareDocumentPosition(networkSummaryPanel) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(within(sourceQuickNavPanel).getByRole("button", { name: /Nodes/i })).toBeInTheDocument();
    expect(connectorsButton).toHaveAttribute("aria-pressed", "true");
    expect(segmentsButton).toHaveAttribute("aria-pressed", "false");
    expect(wiresButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(segmentsButton);
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Segment$/, hidden: true })).toHaveClass(
      "is-active"
    );

    switchScreenDrawerAware("analysis");
    const analysisQuickNavPanel = screen.getByRole("region", { name: "Quick entity navigation" });
    expect(within(analysisQuickNavPanel).getByRole("button", { name: /Nodes/i })).toBeInTheDocument();
    expect(within(analysisQuickNavPanel).getByRole("button", { name: /Segments/i })).toBeInTheDocument();
    expect(within(analysisQuickNavPanel).getByRole("button", { name: /Wires/i })).toBeInTheDocument();
  });

  it("renders a read-only functional schematic trace with filters and export action", async () => {
    const baseState = createUiIntegrationState();
    const withFuseCatalog = appReducer(
      baseState,
      appActions.upsertCatalogItem({
        id: asCatalogItemId("F12-CAT"),
        manufacturerReference: "F12",
        connectionCount: 2,
        name: "Fuse F12"
      })
    );
    const withTaggedSegmentA = appReducer(
      withFuseCatalog,
      appActions.upsertSegment({
        id: asSegmentId("SEG-A"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N-MID"),
        lengthMm: 40,
        subNetworkTag: "CAN"
      })
    );
    const withTaggedSegmentB = appReducer(
      withTaggedSegmentA,
      appActions.upsertSegment({
        id: asSegmentId("SEG-B"),
        nodeA: asNodeId("N-MID"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 60,
        subNetworkTag: "CAN"
      })
    );
    const withWire = appReducer(
      withTaggedSegmentB,
      appActions.saveWire({
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "W-1",
        colorMode: "catalog",
        primaryColorId: "RD",
        protection: { kind: "fuse", catalogItemId: asCatalogItemId("F12-CAT") },
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 }
      })
    );
    const connector = withWire.connectors.byId[asConnectorId("C1")];
    expect(connector).toBeDefined();
    const state =
      connector === undefined
        ? withWire
        : appReducer(withWire, appActions.upsertConnector({ ...connector, isMainHarnessConnector: true }));

    renderAppWithState(state);
    switchScreenDrawerAware("modeling");
    expect(screen.queryByRole("heading", { name: "Functional schematic" })).not.toBeInTheDocument();
    switchScreenDrawerAware("harnessAssembly");

    const assemblyPanel = getPanelByHeading("Harness assembly functional schematic");
    expect(assemblyPanel).toHaveTextContent("No harness assembly selected.");
    const graphScope = screen.getByRole("region", { name: "Functional graph scope" });
    fireEvent.click(within(graphScope).getByRole("tab", { name: "Current network functional" }));

    const functionalPanel = getCurrentNetworkFunctionalPanel("Main network (Sample)");
    const functionalSvg = within(functionalPanel).getByLabelText("Read-only functional schematic");
    expect(functionalSvg).toBeInTheDocument();
    expect(functionalPanel).toHaveTextContent("C-1 pin 1");
    expect(functionalPanel).toHaveTextContent("S-1");
    expect(functionalPanel).toHaveTextContent("F12");
    expect(functionalPanel).toHaveTextContent("Wire 1");
    expect(functionalPanel).toHaveTextContent("W-1");
    expect(functionalPanel).not.toHaveTextContent("SEG-A");
    expect(functionalSvg.querySelector(".functional-edge-color-swatch")).not.toBeNull();
    const functionalEdgePath = functionalSvg.querySelector(".functional-edge path");
    const functionalEdgePathData = functionalEdgePath?.getAttribute("d") ?? "";
    const verticalFlowMatch = functionalEdgePathData.match(/^M\s+\S+\s+(\S+)\s+C\s+\S+\s+(\S+)/);
    expect(verticalFlowMatch).not.toBeNull();
    expect(Number(verticalFlowMatch?.[2])).toBeGreaterThan(Number(verticalFlowMatch?.[1]));
    const functionalActions = within(functionalPanel).getByRole("group", { name: "Functional schematic actions" });
    expect(within(functionalActions).getAllByRole("button").map((button) => button.textContent?.trim())).toEqual([
      "Grid",
      "Active network",
      "Export"
    ]);
    const exportSvgButton = within(functionalPanel).getByRole("button", { name: "Export" });
    expect(exportSvgButton).toBeEnabled();
    fireEvent.click(exportSvgButton);
    expect(within(functionalPanel).getByRole("button", { name: "SVG" })).toBeEnabled();
    expect(within(functionalPanel).getByRole("button", { name: "PNG" })).toBeEnabled();
    fireEvent.click(within(functionalPanel).getByRole("button", { name: "SVG" }));
    const previewDialog = await screen.findByRole("dialog", { name: "SVG preview" });
    expect(within(previewDialog).getByLabelText("SVG export preview")).toBeInTheDocument();
    expect(within(previewDialog).queryByLabelText("Include frame")).not.toBeInTheDocument();
    expect(within(previewDialog).queryByLabelText("Include identity")).not.toBeInTheDocument();
    expect(within(previewDialog).queryByLabelText("Include grid")).not.toBeInTheDocument();
    expect(within(previewDialog).queryByRole("button", { name: "Fit network" })).not.toBeInTheDocument();
    expect(within(previewDialog).getByLabelText("Theme")).toBeInTheDocument();
    const previewSvg = within(previewDialog).getByLabelText("SVG export preview").querySelector("svg");
    expect(previewSvg?.outerHTML).not.toContain('class="network-export-frame"');
    expect(previewSvg?.outerHTML).not.toContain('class="network-export-cartouche"');
    fireEvent.click(within(previewDialog).getByRole("button", { name: "Cancel" }));
    expect(within(functionalPanel).queryByRole("button", { name: "Help" })).not.toBeInTheDocument();
    expect(within(functionalPanel).getByRole("button", { name: "Signal" })).toBeInTheDocument();
    expect(within(functionalPanel).getByRole("button", { name: "12V power" })).toBeInTheDocument();
    expect(within(functionalPanel).getByRole("button", { name: "-12V power (GND)" })).toBeInTheDocument();
    expect(within(functionalPanel).getByRole("button", { name: "48V" })).toBeInTheDocument();

    fireEvent.click(within(functionalPanel).getByRole("button", { name: "CAN" }));
    expect(functionalPanel).toHaveTextContent("W-1");

    fireEvent.click(within(functionalPanel).getByRole("button", { name: "Active network" }));
    const networkSummary = getPanelByHeading("Network summary");
    const networkSummaryActions = within(networkSummary).getByRole("group", { name: "Network summary display options" });
    expect(within(networkSummaryActions).getAllByRole("button").map((button) => button.textContent?.trim())).toEqual([
      "Edit",
      "View",
      "Functional",
      "Export"
    ]);
    fireEvent.click(within(networkSummaryActions).getByRole("button", { name: "Functional" }));
    expect(getCurrentNetworkFunctionalPanel("Main network (Sample)")).toBeInTheDocument();
  });

  it("uses a persisted explicit harness assembly picker and decouples the assembly graph from active network changes", async () => {
    const state = createHarnessAssemblyFunctionalSelectionState();
    const mainNetworkId = state.networks.allIds[0];
    const secondNetworkId = asNetworkId("net-b");
    if (mainNetworkId === undefined) {
      throw new Error("Expected main network.");
    }

    const firstRender = renderAppWithState(state);
    switchScreenDrawerAware("harnessAssembly");

    const graphScope = screen.getByRole("region", { name: "Functional graph scope" });
    expect(screen.getByRole("region", { name: "Harness assembly manager" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Selected harness assembly")).not.toBeInTheDocument();
    expect(getPanelByHeading("Harness assembly functional schematic")).toHaveTextContent("No harness assembly selected.");

    const headerBlock = document.querySelector(".header-block");
    expect(headerBlock).not.toBeNull();
    expect(graphScope).toHaveAttribute("data-quick-entity-nav-source", "true");
    Object.defineProperty(headerBlock, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ top: 0, right: 1200, bottom: 72, left: 0, width: 1200, height: 72, x: 0, y: 0 })
    });
    Object.defineProperty(graphScope, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ top: 48, right: 800, bottom: 96, left: 240, width: 560, height: 48, x: 240, y: 48 })
    });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    await waitFor(() => expect(document.querySelector(".header-docked-nav-shell")).toHaveClass("is-visible"));
    const dockedScope = document.querySelector(".header-quick-entity-nav.harness-assembly-functional-scope-nav") as HTMLElement;
    fireEvent.click(within(dockedScope).getByRole("tab", { name: "Current network functional" }));
    expect(getPanelByHeading("Current network functional")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Harness assembly manager" })).not.toBeInTheDocument();

    const dockedAssemblyPickerButton = within(dockedScope).getByRole("tab", { name: "Select harness assembly" });
    expect(dockedAssemblyPickerButton).not.toHaveClass("is-active");
    fireEvent.click(dockedAssemblyPickerButton);
    const assemblyPicker = screen.getByRole("dialog", { name: "Select harness assembly" });
    fireEvent.click(within(assemblyPicker).getByRole("button", { name: /Main assembly/i }));
    expect(localStorage.getItem("electrical-plan-editor.displayed-harness-assembly-id")).toBe("asm-main");
    expect(screen.queryByRole("dialog", { name: "Select harness assembly" })).not.toBeInTheDocument();
    const manager = screen.getByRole("region", { name: "Harness assembly manager" });
    expect(manager).toBeInTheDocument();
    const masterConnectorsPanel = screen.getByRole("region", { name: "Master connector roots" });
    const interconnectorLinksPanel = screen.getByRole("region", { name: "Inter-harness connector links" });
    expect(within(manager).getByRole("button", { name: "Save assembly" })).toBeInTheDocument();
    expect(within(masterConnectorsPanel).getByRole("button", { name: "Save assembly" })).toBeInTheDocument();
    expect(within(interconnectorLinksPanel).getByRole("button", { name: "Save assembly" })).toBeInTheDocument();
    const interconnectorNameInput = within(interconnectorLinksPanel).getByRole("textbox", { name: "Interconnector link name" });
    fireEvent.change(interconnectorNameInput, { target: { value: "Draft link rename" } });
    expect(firstRender.store.getState().harnessAssemblies.byId[asAssemblyId("asm-main")]?.connectorLinks[0]?.name).toBe("Main to B");
    expect(interconnectorLinksPanel).toHaveTextContent("Unsaved assembly edits are not reflected in the visualization yet.");
    fireEvent.click(within(interconnectorLinksPanel).getByRole("button", { name: "Save assembly" }));
    expect(firstRender.store.getState().harnessAssemblies.byId[asAssemblyId("asm-main")]?.connectorLinks[0]?.name).toBe(
      "Draft link rename"
    );

    const assemblyPanel = getPanelByHeading("Harness assembly functional schematic");
    expect(assemblyPanel).toHaveTextContent("Harness assembly functional schematicMain assembly");
    expect(assemblyPanel).toHaveTextContent("Filtered trace across Main assembly");
    expect(assemblyPanel).toHaveTextContent("W-1");

    const harnessBCheckbox = within(manager).getByRole("checkbox", { name: /Harness B.*H-B/i });
    fireEvent.click(harnessBCheckbox);
    expect(manager).toHaveTextContent("Unsaved assembly edits are not reflected in the visualization yet.");
    expect(assemblyPanel).toHaveTextContent("Filtered trace across Main assembly");

    firstRender.store.dispatch(appActions.selectNetwork(secondNetworkId));
    await waitFor(() => {
      expect(getPanelByHeading("Harness assembly functional schematic")).toHaveTextContent("Filtered trace across Main assembly");
      expect(getPanelByHeading("Harness assembly functional schematic")).toHaveTextContent("W-1");
    });

    fireEvent.click(within(graphScope).getByRole("tab", { name: "Current network functional" }));
    const currentNetworkPanel = getCurrentNetworkFunctionalPanel("Harness B");
    expect(currentNetworkPanel).not.toHaveTextContent("W-1");
    expect(currentNetworkPanel).toHaveTextContent("Select a wire, connector, or splice to generate a functional trace.");
    expect(screen.queryByRole("region", { name: "Harness assembly manager" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Selected harness assembly")).not.toBeInTheDocument();

    firstRender.unmount();
    renderAppWithState(appReducer(state, appActions.selectNetwork(mainNetworkId)));
    switchScreenDrawerAware("harnessAssembly");

    expect(screen.queryByLabelText("Selected harness assembly")).not.toBeInTheDocument();
    expect(getPanelByHeading("Harness assembly functional schematic")).toHaveTextContent("Filtered trace across Main assembly");
  });

  it("sorts wires by numeric length in modeling wire table", () => {
    const withSecondWire = appReducer(
      createUiIntegrationState(),
      appActions.saveWire({
        id: asWireId("W2"),
        name: "Wire 2",
        technicalId: "W-2",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 2 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 2 }
      })
    );
    const wire1 = withSecondWire.wires.byId[asWireId("W1")];
    const wire2 = withSecondWire.wires.byId[asWireId("W2")];
    const state =
      wire1 && wire2
        ? {
            ...withSecondWire,
            wires: {
              ...withSecondWire.wires,
              byId: {
                ...withSecondWire.wires.byId,
                [wire1.id]: { ...wire1, lengthMm: 120 },
                [wire2.id]: { ...wire2, lengthMm: 25 }
              }
            }
          }
        : withSecondWire;

    renderAppWithState(state);
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    const wiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(wiresPanel).getByRole("button", { name: /Length \(mm\)/i }));

    const headerCells = Array.from(wiresPanel.querySelectorAll("thead th"));
    const lengthColumnIndex = headerCells.findIndex((header) => header.textContent?.includes("Length (mm)") === true);
    expect(lengthColumnIndex).toBeGreaterThanOrEqual(0);

    const rows = Array.from(wiresPanel.querySelectorAll("tbody tr"));
    expect(rows).toHaveLength(2);
    expect(rows[0]?.querySelector("td")?.textContent).toContain("Wire 2");
    expect(rows[0]?.children[lengthColumnIndex]?.textContent?.trim()).toBe("25");
    expect(rows[1]?.querySelector("td")?.textContent).toContain("Wire 1");
    expect(rows[1]?.children[lengthColumnIndex]?.textContent?.trim()).toBe("120");
  });

  it("supports deeper zoom-out floor and allows dragging nodes to negative coordinates", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
    const zoomOutButton = within(networkSummaryPanel).getByRole("button", { name: "Scale Down" });

    let previousViewportTransform = "";
    let viewportTransform = "";
    for (let index = 0; index < 48; index += 1) {
      fireEvent.click(zoomOutButton);
      viewportTransform = getNetworkSummaryViewportTransform(networkSummaryPanel);
      if (viewportTransform === previousViewportTransform) {
        break;
      }
      previousViewportTransform = viewportTransform;
    }
    const zoomScaleMatch = viewportTransform.match(/scale\(([^)]+)\)/);
    const zoomScale = Number(zoomScaleMatch?.[1] ?? Number.NaN);
    expect(Number.isFinite(zoomScale)).toBe(true);
    expect(zoomScale).toBeLessThanOrEqual(0.05);

    const rectSpy = vi.spyOn(networkSvg, "getBoundingClientRect").mockImplementation(
      () =>
        ({
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          width: 800,
          height: 520,
          right: 800,
          bottom: 520,
          toJSON: () => ({})
        }) as DOMRect
    );

    const intermediateNode = networkSummaryPanel.querySelector(".network-node.intermediate");
    const intermediateShape = intermediateNode?.querySelector(".network-node-shape");
    expect(intermediateNode).not.toBeNull();
    expect(intermediateShape).not.toBeNull();

    fireEvent.mouseDown(intermediateNode as Element, { button: 0, clientX: 300, clientY: 220 });
    fireEvent.mouseMove(networkSvg, { clientX: -120, clientY: -90 });
    fireEvent.mouseUp(networkSvg);

    const cx = Number((intermediateShape as SVGCircleElement).getAttribute("cx"));
    const cy = Number((intermediateShape as SVGCircleElement).getAttribute("cy"));
    expect(cx).toBeLessThan(0);
    expect(cy).toBeLessThan(0);

    rectSpy.mockRestore();
  });

  it("keeps the visible center anchored when changing the view zoom slider", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const viewBoxSize = getNetworkSummaryViewBoxSize(networkSummaryPanel);
    const before = parseNetworkSummaryViewportTransform(getNetworkSummaryViewportTransform(networkSummaryPanel));
    const centerBefore = {
      x: (viewBoxSize.width / 2 - before.offsetX) / before.scale,
      y: (viewBoxSize.height / 2 - before.offsetY) / before.scale
    };
    const zoomSlider = within(networkSummaryPanel).getByRole("slider", { name: /Zoom view/ });

    fireEvent.change(zoomSlider, { target: { value: "100" } });

    const after = parseNetworkSummaryViewportTransform(getNetworkSummaryViewportTransform(networkSummaryPanel));
    const centerAfter = {
      x: (viewBoxSize.width / 2 - after.offsetX) / after.scale,
      y: (viewBoxSize.height / 2 - after.offsetY) / after.scale
    };
    expect(after.scale).toBeGreaterThan(before.scale);
    expect(centerAfter.x).toBeCloseTo(centerBefore.x, 5);
    expect(centerAfter.y).toBeCloseTo(centerBefore.y, 5);
  });

});

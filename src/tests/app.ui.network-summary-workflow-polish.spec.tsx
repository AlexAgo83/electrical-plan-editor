import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NetworkId } from "../core/entities";
import { appActions, appReducer } from "../store";
import {
  asConnectorId,
  asSpliceId,
  asWireId,
  createUiIntegrationDenseWiresState,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

function getNetworkSummaryViewportTransform(panel: HTMLElement): string {
  const networkSvg = within(panel).getByLabelText("2D network diagram");
  const transformGroup = networkSvg.querySelector("g[transform]");
  if (transformGroup === null) {
    throw new Error("Viewport transform group not found.");
  }
  return transformGroup.getAttribute("transform") ?? "";
}

function getDisplayToggleButton(panel: HTMLElement, label: "Info" | "Length" | "Callouts" | "Grid" | "Snap" | "Lock"): HTMLButtonElement {
  return within(panel).getByRole("button", { name: label });
}

function expectDisplayToggles(
  panel: HTMLElement,
  expected: Record<"Info" | "Length" | "Callouts" | "Grid" | "Snap" | "Lock", boolean>
): void {
  (Object.entries(expected) as Array<[keyof typeof expected, boolean]>).forEach(([label, isActive]) => {
    const button = getDisplayToggleButton(panel, label);
    if (isActive) {
      expect(button).toHaveClass("is-active");
    } else {
      expect(button).not.toHaveClass("is-active");
    }
  });
}

describe("App integration UI - network summary workflow polish", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders a compact quick entity navigation strip after route preview and switches sub-screens", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const routePreviewPanel = getPanelByHeading("Route preview");
    const quickNavPanel = screen.getByRole("region", { name: "Quick entity navigation" });
    const connectorsButton = within(quickNavPanel).getByRole("button", { name: /Connectors/i });
    const segmentsButton = within(quickNavPanel).getByRole("button", { name: /Segments/i });
    const wiresButton = within(quickNavPanel).getByRole("button", { name: /Wires/i });

    expect(routePreviewPanel.nextElementSibling).toBe(quickNavPanel);
    expect(within(quickNavPanel).getByRole("button", { name: /Nodes/i })).toBeInTheDocument();
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

    const rows = Array.from(wiresPanel.querySelectorAll("tbody tr"));
    expect(rows).toHaveLength(2);
    expect(rows[0]?.querySelector("td")?.textContent).toContain("Wire 2");
    expect(rows[0]?.children[6]?.textContent?.trim()).toBe("25");
    expect(rows[1]?.querySelector("td")?.textContent).toContain("Wire 1");
    expect(rows[1]?.children[6]?.textContent?.trim()).toBe("120");
  });

  it("supports deeper zoom-out floor and allows dragging nodes to negative coordinates", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
    const zoomOutButton = within(networkSummaryPanel).getByRole("button", { name: "Zoom -" });

    let previousZoomStatusText = "";
    let zoomStatusText = "";
    for (let index = 0; index < 48; index += 1) {
      fireEvent.click(zoomOutButton);
      zoomStatusText =
        networkSummaryPanel.querySelector(".network-canvas-floating-copy")?.textContent?.replace(/\s+/g, " ").trim() ?? "";
      if (zoomStatusText === previousZoomStatusText) {
        break;
      }
      previousZoomStatusText = zoomStatusText;
    }
    const zoomPercentMatch = zoomStatusText.match(/View:\s*(\d+)% zoom\./);
    const zoomPercent = Number(zoomPercentMatch?.[1] ?? Number.NaN);
    expect(Number.isFinite(zoomPercent)).toBe(true);
    expect(zoomPercent).toBeLessThanOrEqual(5);

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

  it("toggles connector/splice cable callouts, selects linked entities, and persists dragged callout positions", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
    const calloutsToggle = within(networkSummaryPanel).getByRole("button", { name: "Callouts" });

    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(0);

    fireEvent.click(calloutsToggle);
    const calloutFrames = networkSummaryPanel.querySelectorAll(".network-callout-frame");
    expect(calloutFrames.length).toBeGreaterThanOrEqual(2);

    const firstCalloutAnchor = networkSummaryPanel.querySelector(".network-callout-anchor");
    expect(firstCalloutAnchor).not.toBeNull();

    fireEvent.mouseDown(firstCalloutAnchor as Element, { button: 0, clientX: 220, clientY: 140 });
    expect(networkSummaryPanel.querySelector(".network-node.connector.is-selected")).not.toBeNull();

    const transformBeforeDrag = (firstCalloutAnchor as SVGGElement).getAttribute("transform") ?? "";

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

    fireEvent.mouseMove(networkSvg, { clientX: 620, clientY: 320 });
    fireEvent.mouseUp(networkSvg);
    rectSpy.mockRestore();

    const movedCalloutAnchor = networkSummaryPanel.querySelector(".network-callout-anchor");
    expect(movedCalloutAnchor).not.toBeNull();
    const transformAfterDrag = (movedCalloutAnchor as SVGGElement).getAttribute("transform") ?? "";
    expect(transformAfterDrag).not.toBe(transformBeforeDrag);

    fireEvent.click(calloutsToggle);
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(0);
    fireEvent.click(calloutsToggle);

    const restoredCalloutAnchor = networkSummaryPanel.querySelector(".network-callout-anchor");
    expect(restoredCalloutAnchor).not.toBeNull();
    expect((restoredCalloutAnchor as SVGGElement).getAttribute("transform") ?? "").toBe(transformAfterDrag);
  });

  it("renders dense callout examples with multiple wires per connector/splice for regression testing", () => {
    renderAppWithState(createUiIntegrationDenseWiresState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const calloutsToggle = within(networkSummaryPanel).getByRole("button", { name: "Callouts" });
    fireEvent.click(calloutsToggle);

    const calloutFrames = networkSummaryPanel.querySelectorAll(".network-callout-frame");
    const calloutRows = networkSummaryPanel.querySelectorAll(".network-callout-row-text");
    expect(calloutFrames.length).toBeGreaterThanOrEqual(4);
    expect(calloutRows.length).toBeGreaterThanOrEqual(8);
    expect(networkSummaryPanel).toHaveTextContent("Wire 8");
    expect(networkSummaryPanel).toHaveTextContent("W-8");
  });

  it("filters callouts to selected connector/splice only when selected-callout-only preference is enabled", () => {
    renderAppWithState(createUiIntegrationDenseWiresState());

    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
    fireEvent.click(within(canvasSettingsPanel).getByLabelText("Show connector/splice cable callouts by default"));
    fireEvent.click(within(canvasSettingsPanel).getByLabelText("Show only selected connector/splice callout"));
    fireEvent.click(within(canvasSettingsPanel).getByRole("button", { name: "Apply canvas defaults now" }));

    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    expect(within(networkSummaryPanel).getByRole("button", { name: "Callouts" })).toHaveClass("is-active");
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(0);

    const segmentHitbox = networkSummaryPanel.querySelector(".network-segment-hitbox");
    expect(segmentHitbox).not.toBeNull();
    fireEvent.click(segmentHitbox as Element);
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(0);

    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    expect(connectorNode).not.toBeNull();
    fireEvent.mouseDown(connectorNode as Element, { button: 0, clientX: 220, clientY: 140 });
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(1);

    switchScreenDrawerAware("settings");
    const restoredCanvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
    fireEvent.click(within(restoredCanvasSettingsPanel).getByLabelText("Show only selected connector/splice callout"));
    fireEvent.click(within(restoredCanvasSettingsPanel).getByRole("button", { name: "Apply canvas defaults now" }));

    switchScreenDrawerAware("modeling");
    expect(getPanelByHeading("Network summary").querySelectorAll(".network-callout-frame").length).toBeGreaterThanOrEqual(2);
  });

  it("persists network summary zoom/pan and display toggles across reload-equivalent rehydrate", async () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
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

    const initialToggleState = {
      Info: getDisplayToggleButton(networkSummaryPanel, "Info").classList.contains("is-active"),
      Length: getDisplayToggleButton(networkSummaryPanel, "Length").classList.contains("is-active"),
      Callouts: getDisplayToggleButton(networkSummaryPanel, "Callouts").classList.contains("is-active"),
      Grid: getDisplayToggleButton(networkSummaryPanel, "Grid").classList.contains("is-active"),
      Snap: getDisplayToggleButton(networkSummaryPanel, "Snap").classList.contains("is-active"),
      Lock: getDisplayToggleButton(networkSummaryPanel, "Lock").classList.contains("is-active")
    } as const;

    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Zoom +" }));
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Zoom +" }));
    fireEvent.mouseDown(networkSvg, { button: 0, shiftKey: true, clientX: 240, clientY: 180 });
    fireEvent.mouseMove(networkSvg, { clientX: 360, clientY: 250 });
    fireEvent.mouseUp(networkSvg, { clientX: 360, clientY: 250 });

    (Object.keys(initialToggleState) as Array<keyof typeof initialToggleState>).forEach((label) => {
      fireEvent.click(getDisplayToggleButton(networkSummaryPanel, label));
    });

    const activeNetworkId = firstRender.store.getState().activeNetworkId;
    expect(activeNetworkId).not.toBeNull();
    if (activeNetworkId === null) {
      throw new Error("Expected active network.");
    }

    await waitFor(() => {
      const persisted = firstRender.store.getState().networkStates[activeNetworkId]?.networkSummaryViewState;
      expect(persisted).toBeDefined();
      expect(persisted?.offset.x ?? 0).not.toBe(0);
      expect(persisted?.offset.y ?? 0).not.toBe(0);
    });

    const persistedViewState = firstRender.store.getState().networkStates[activeNetworkId]?.networkSummaryViewState;
    expect(persistedViewState).toBeDefined();
    if (persistedViewState === undefined) {
      throw new Error("Expected persisted network summary view state.");
    }
    const expectedToggleState = {
      Info: !initialToggleState.Info,
      Length: !initialToggleState.Length,
      Callouts: !initialToggleState.Callouts,
      Grid: !initialToggleState.Grid,
      Snap: !initialToggleState.Snap,
      Lock: !initialToggleState.Lock
    } as const;

    rectSpy.mockRestore();
    firstRender.unmount();

    renderAppWithState(firstRender.store.getState());
    switchScreenDrawerAware("modeling");

    await waitFor(() => {
      const rehydratedPanel = getPanelByHeading("Network summary");
      expectDisplayToggles(rehydratedPanel, expectedToggleState);
      expect(getNetworkSummaryViewportTransform(rehydratedPanel)).toBe(
        `translate(${persistedViewState.offset.x} ${persistedViewState.offset.y}) scale(${persistedViewState.scale})`
      );
    });
  });

  it("restores independent network summary viewport and display toggles per network when switching active network", async () => {
    const base = createUiIntegrationState();
    const networkAId = base.activeNetworkId;
    expect(networkAId).not.toBeNull();
    if (networkAId === null) {
      throw new Error("Expected active network.");
    }

    const withDuplicate = appReducer(
      base,
      appActions.duplicateNetwork(networkAId, {
        id: asNetworkId("net-b"),
        name: "Network B",
        technicalId: "NET-B",
        createdAt: "2026-02-24T10:00:00.000Z",
        updatedAt: "2026-02-24T10:00:00.000Z"
      })
    );
    const networkBId = asNetworkId("net-b");
    const seeded = appReducer(withDuplicate, appActions.selectNetwork(networkAId));
    const scopedA = seeded.networkStates[networkAId];
    const scopedB = seeded.networkStates[networkBId];
    expect(scopedA).toBeDefined();
    expect(scopedB).toBeDefined();
    if (scopedA === undefined || scopedB === undefined) {
      throw new Error("Expected network scoped states for both networks.");
    }

    const seededState = {
      ...seeded,
      networkStates: {
        ...seeded.networkStates,
        [networkAId]: {
          ...scopedA,
          networkSummaryViewState: {
            scale: 1.25,
            offset: { x: 120, y: -40 },
            showNetworkInfoPanels: false,
            showSegmentLengths: true,
            showCableCallouts: true,
            showNetworkGrid: false,
            snapNodesToGrid: false,
            lockEntityMovement: true
          }
        },
        [networkBId]: {
          ...scopedB,
          networkSummaryViewState: {
            scale: 0.8,
            offset: { x: -90, y: 75 },
            showNetworkInfoPanels: true,
            showSegmentLengths: false,
            showCableCallouts: false,
            showNetworkGrid: true,
            snapNodesToGrid: true,
            lockEntityMovement: false
          }
        }
      }
    };

    const { store } = renderAppWithState(seededState);
    switchScreenDrawerAware("modeling");

    await waitFor(() => {
      const panel = getPanelByHeading("Network summary");
      expect(getNetworkSummaryViewportTransform(panel)).toBe("translate(120 -40) scale(1.25)");
      expectDisplayToggles(panel, {
        Info: false,
        Length: true,
        Callouts: true,
        Grid: false,
        Snap: false,
        Lock: true
      });
    });

    store.dispatch(appActions.selectNetwork(networkBId));

    await waitFor(() => {
      const panel = getPanelByHeading("Network summary");
      expect(getNetworkSummaryViewportTransform(panel)).toBe("translate(-90 75) scale(0.8)");
      expectDisplayToggles(panel, {
        Info: true,
        Length: false,
        Callouts: false,
        Grid: true,
        Snap: true,
        Lock: false
      });
    });

    store.dispatch(appActions.selectNetwork(networkAId));

    await waitFor(() => {
      const panel = getPanelByHeading("Network summary");
      expect(getNetworkSummaryViewportTransform(panel)).toBe("translate(120 -40) scale(1.25)");
      expectDisplayToggles(panel, {
        Info: false,
        Length: true,
        Callouts: true,
        Grid: false,
        Snap: false,
        Lock: true
      });
    });
  });
});

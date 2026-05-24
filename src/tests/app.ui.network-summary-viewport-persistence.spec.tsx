import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer } from "../store";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import {
  asNetworkId,
  expectDisplayToggles,
  getDisplayToggleButton,
  getNetworkSummaryViewportTransform,
  panNetworkSummaryViewport
} from "./helpers/network-summary-workflow-test-utils";

describe("App integration UI - network summary viewport persistence", () => {
  beforeEach(() => {
    localStorage.clear();
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

    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Scale Up" }));
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Scale Up" }));
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
    const expectedToggleState = {
      Info: !initialToggleState.Info,
      Length: !initialToggleState.Length,
      Callouts: !initialToggleState.Callouts,
      Grid: !initialToggleState.Grid,
      Snap: !initialToggleState.Snap,
      Lock: !initialToggleState.Lock
    } as const;

    await waitFor(() => {
      const persisted = firstRender.store.getState().networkStates[activeNetworkId]?.networkSummaryViewState;
      expect(persisted).toBeDefined();
      expect(persisted?.offset.x ?? 0).not.toBe(0);
      expect(persisted?.offset.y ?? 0).not.toBe(0);
      expect(persisted?.showNetworkInfoPanels).toBe(expectedToggleState.Info);
      expect(persisted?.showSegmentLengths).toBe(expectedToggleState.Length);
      expect(persisted?.showCableCallouts).toBe(expectedToggleState.Callouts);
      expect(persisted?.showNetworkGrid).toBe(expectedToggleState.Grid);
      expect(persisted?.snapNodesToGrid).toBe(expectedToggleState.Snap);
      expect(persisted?.lockEntityMovement).toBe(expectedToggleState.Lock);
    });

    const persistedViewState = firstRender.store.getState().networkStates[activeNetworkId]?.networkSummaryViewState;
    expect(persistedViewState).toBeDefined();
    if (persistedViewState === undefined) {
      throw new Error("Expected persisted network summary view state.");
    }

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
            showSegmentNames: true,
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
            showSegmentNames: true,
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

  it("restores the captured network viewport on undo/redo when the preference is enabled", async () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    const wiresPanel = getPanelByHeading("Wires");
    let networkSummaryPanel = getPanelByHeading("Network summary");
    const viewportAtEditTime = panNetworkSummaryViewport(networkSummaryPanel, {
      startX: 220,
      startY: 160,
      endX: 360,
      endY: 250
    });

    fireEvent.click(within(wiresPanel).getByText("Wire 1"));
    fireEvent.click(within(wiresPanel).getByRole("button", { name: "Delete" }));
    const deleteDialog = await screen.findByRole("dialog", { name: "Delete wire" });
    fireEvent.click(within(deleteDialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(within(wiresPanel).queryByText("Wire 1")).not.toBeInTheDocument();
    });

    networkSummaryPanel = getPanelByHeading("Network summary");
    const viewportBeforeUndo = panNetworkSummaryViewport(networkSummaryPanel, {
      startX: 320,
      startY: 240,
      endX: 180,
      endY: 120
    });
    expect(viewportBeforeUndo).not.toBe(viewportAtEditTime);

    fireEvent.click(screen.getByRole("button", { name: "Ops" }));
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    await waitFor(() => {
      expect(within(wiresPanel).getByText("Wire 1")).toBeInTheDocument();
      expect(getNetworkSummaryViewportTransform(getPanelByHeading("Network summary"))).toBe(viewportAtEditTime);
    });

    fireEvent.click(screen.getByRole("button", { name: "Redo" }));

    await waitFor(() => {
      expect(within(wiresPanel).queryByText("Wire 1")).not.toBeInTheDocument();
      expect(getNetworkSummaryViewportTransform(getPanelByHeading("Network summary"))).toBe(viewportBeforeUndo);
    });
  });

  it("keeps the current viewport during undo/redo when viewport restoration is disabled in settings", async () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));

    switchScreenDrawerAware("settings");
    const shortcutsPanel = getPanelByHeading("Action bar and shortcuts");
    const restoreViewportCheckbox = within(shortcutsPanel).getByLabelText("Restore network viewport on undo/redo");
    expect(restoreViewportCheckbox).toBeChecked();
    fireEvent.click(restoreViewportCheckbox);
    expect(restoreViewportCheckbox).not.toBeChecked();

    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");
    const wiresPanel = getPanelByHeading("Wires");
    let networkSummaryPanel = getPanelByHeading("Network summary");
    const viewportAtEditTime = panNetworkSummaryViewport(networkSummaryPanel, {
      startX: 220,
      startY: 160,
      endX: 360,
      endY: 250
    });

    fireEvent.click(within(wiresPanel).getByText("Wire 1"));
    fireEvent.click(within(wiresPanel).getByRole("button", { name: "Delete" }));
    const deleteDialog = await screen.findByRole("dialog", { name: "Delete wire" });
    fireEvent.click(within(deleteDialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(within(wiresPanel).queryByText("Wire 1")).not.toBeInTheDocument();
    });

    networkSummaryPanel = getPanelByHeading("Network summary");
    const viewportBeforeUndo = panNetworkSummaryViewport(networkSummaryPanel, {
      startX: 320,
      startY: 240,
      endX: 180,
      endY: 120
    });
    expect(viewportBeforeUndo).not.toBe(viewportAtEditTime);

    fireEvent.click(screen.getByRole("button", { name: "Ops" }));
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    await waitFor(() => {
      expect(within(wiresPanel).getByText("Wire 1")).toBeInTheDocument();
      expect(getNetworkSummaryViewportTransform(getPanelByHeading("Network summary"))).toBe(viewportBeforeUndo);
    });

    fireEvent.click(screen.getByRole("button", { name: "Redo" }));

    await waitFor(() => {
      expect(within(wiresPanel).queryByText("Wire 1")).not.toBeInTheDocument();
      expect(getNetworkSummaryViewportTransform(getPanelByHeading("Network summary"))).toBe(viewportBeforeUndo);
    });
  });
});

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Network, NetworkId } from "../core/entities";
import { useAppControllerCanvasDisplayState } from "../app/hooks/useAppControllerCanvasDisplayState";
import { useAppControllerPreferencesState } from "../app/hooks/useAppControllerPreferencesState";
import { useCanvasState } from "../app/hooks/useCanvasState";
import { useNetworkScopeFormState } from "../app/hooks/useNetworkScopeFormState";
import { useAppControllerWorkspaceHandlersDomainAssembly } from "../app/hooks/controller/useAppControllerWorkspaceHandlersDomainAssembly";
import { appActions, appReducer, createAppStore, createInitialState } from "../store";

describe("useAppControllerWorkspaceHandlersDomainAssembly", () => {
  const secondaryNetworkId = "network-secondary" as NetworkId;

  function toNetworks(state: ReturnType<typeof createInitialState>): Network[] {
    return state.networks.allIds
      .map((id) => state.networks.byId[id])
      .filter((network): network is Network => network !== undefined);
  }

  it("exposes the expected workspace action surface", () => {
    const stateWithSecondNetwork = appReducer(
      createInitialState(),
      appActions.createNetwork({
        id: secondaryNetworkId,
        name: "Secondary network",
        technicalId: "NET-SECONDARY",
        createdAt: "2026-04-02T10:00:00.000Z",
        updatedAt: "2026-04-02T10:00:00.000Z"
      })
    );
    const store = createAppStore(stateWithSecondNetwork);

    const { result } = renderHook(() => {
      const networkScopeFormState = useNetworkScopeFormState();
      const canvasState = useCanvasState();
      const canvasDisplayState = useAppControllerCanvasDisplayState();
      const preferencesState = useAppControllerPreferencesState();
      return useAppControllerWorkspaceHandlersDomainAssembly({
        base: {
          store,
          networks: toNetworks(stateWithSecondNetwork),
          dispatchAction: (action, options) => {
            void options;
            store.dispatch(action);
          },
          replaceStateWithHistory: vi.fn()
        },
        requestConfirmation: vi.fn(() => Promise.resolve(true)),
        networkScopeFormState,
        workspace: {
          isCurrentWorkspaceEmpty: false,
          hasBuiltInSampleState: true,
          nodes: [],
          segments: [],
          networkNodePositions: {},
          connectorMap: new Map(),
          spliceMap: new Map(),
          configuredResetScale: 0.6,
          setNetworkScale: canvasState.setNetworkScale,
          setNetworkOffset: canvasState.setNetworkOffset,
          networkViewWidth: 1200,
          networkViewHeight: 800
        },
        canvasDisplayState,
        canvasViewportSetters: {
          setShowNetworkGrid: canvasState.setShowNetworkGrid,
          setSnapNodesToGrid: canvasState.setSnapNodesToGrid,
          setLockEntityMovement: canvasState.setLockEntityMovement
        },
        sortSetters: {
          setConnectorSort: vi.fn(),
          setSpliceSort: vi.fn(),
          setWireSort: vi.fn(),
          setConnectorSynthesisSort: vi.fn(),
          setSpliceSynthesisSort: vi.fn(),
          setNodeIdSortDirection: vi.fn(),
          setSegmentIdSortDirection: vi.fn()
        },
        preferencesState
      });
    });

    expect(typeof result.current.handleCreateNetwork).toBe("function");
    expect(typeof result.current.handleSelectNetwork).toBe("function");
    expect(typeof result.current.handleDuplicateNetwork).toBe("function");
    expect(typeof result.current.resetNetworkViewToConfiguredScale).toBe("function");
    expect(typeof result.current.resetWorkspacePreferencesToDefaults).toBe("function");
  });

  it("switches the active network and resets the viewport to the configured scale", () => {
    const stateWithSecondNetwork = appReducer(
      createInitialState(),
      appActions.createNetwork({
        id: secondaryNetworkId,
        name: "Secondary network",
        technicalId: "NET-SECONDARY",
        createdAt: "2026-04-02T10:00:00.000Z",
        updatedAt: "2026-04-02T10:00:00.000Z"
      })
    );
    const store = createAppStore(stateWithSecondNetwork);

    const { result } = renderHook(() => {
      const networkScopeFormState = useNetworkScopeFormState();
      const canvasState = useCanvasState();
      const canvasDisplayState = useAppControllerCanvasDisplayState();
      const preferencesState = useAppControllerPreferencesState();
      const handlers = useAppControllerWorkspaceHandlersDomainAssembly({
        base: {
          store,
          networks: toNetworks(stateWithSecondNetwork),
          dispatchAction: (action, options) => {
            void options;
            store.dispatch(action);
          },
          replaceStateWithHistory: vi.fn()
        },
        requestConfirmation: vi.fn(() => Promise.resolve(true)),
        networkScopeFormState,
        workspace: {
          isCurrentWorkspaceEmpty: false,
          hasBuiltInSampleState: true,
          nodes: [],
          segments: [],
          networkNodePositions: {},
          connectorMap: new Map(),
          spliceMap: new Map(),
          configuredResetScale: 0.6,
          setNetworkScale: canvasState.setNetworkScale,
          setNetworkOffset: canvasState.setNetworkOffset,
          networkViewWidth: 1200,
          networkViewHeight: 800
        },
        canvasDisplayState,
        canvasViewportSetters: {
          setShowNetworkGrid: canvasState.setShowNetworkGrid,
          setSnapNodesToGrid: canvasState.setSnapNodesToGrid,
          setLockEntityMovement: canvasState.setLockEntityMovement
        },
        sortSetters: {
          setConnectorSort: vi.fn(),
          setSpliceSort: vi.fn(),
          setWireSort: vi.fn(),
          setConnectorSynthesisSort: vi.fn(),
          setSpliceSynthesisSort: vi.fn(),
          setNodeIdSortDirection: vi.fn(),
          setSegmentIdSortDirection: vi.fn()
        },
        preferencesState
      });

      return {
        handlers,
        canvasState
      };
    });

    act(() => {
      result.current.canvasState.setNetworkScale(2);
      result.current.canvasState.setNetworkOffset({ x: 140, y: -80 });
    });

    act(() => {
      result.current.handlers.handleSelectNetwork(secondaryNetworkId);
      result.current.handlers.resetNetworkViewToConfiguredScale();
    });

    expect(store.getState().activeNetworkId).toBe(secondaryNetworkId);
    expect(result.current.canvasState.networkScale).toBe(0.6);
    expect(result.current.canvasState.networkOffset).toEqual({ x: 0, y: 0 });
  });
});

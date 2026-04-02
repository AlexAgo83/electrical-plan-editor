import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEntityFormsState } from "../app/hooks/useEntityFormsState";
import { useAppControllerModelingHandlersAssembly } from "../app/hooks/controller/useAppControllerModelingHandlersAssembly";
import { appActions, appReducer, createAppStore, createInitialState } from "../store";
import type { CatalogItemId } from "../core/entities";

describe("useAppControllerModelingHandlersAssembly", () => {
  function createStoreWithCatalog() {
    const state = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: "catalog-2w" as CatalogItemId,
        manufacturerReference: "CAT-2W",
        name: "2-way connector",
        connectionCount: 2
      })
    );

    return createAppStore(state);
  }

  it("exposes the expected modeling handler namespaces", () => {
    const store = createStoreWithCatalog();

    const { result } = renderHook(() => {
      const formsState = useEntityFormsState();
      return useAppControllerModelingHandlersAssembly({
        store,
        state: store.getState(),
        dispatchAction: (action, options) => {
          void options;
          store.dispatch(action);
        },
        confirmAction: vi.fn(() => Promise.resolve(true)),
        formsState,
        pendingNewNodePosition: null,
        setPendingNewNodePosition: vi.fn(),
        setRoutePreviewStartNodeId: vi.fn(),
        setRoutePreviewEndNodeId: vi.fn(),
        selectedConnectorId: null,
        selectedSpliceId: null,
        selectedWire: null,
        defaultWireSectionMm2: 0.5,
        defaultAutoCreateLinkedNodes: true
      });
    });

    expect(typeof result.current.connector.resetConnectorForm).toBe("function");
    expect(typeof result.current.splice.clearSpliceForm).toBe("function");
    expect(typeof result.current.node.clearNodeForm).toBe("function");
    expect(typeof result.current.segment.clearSegmentForm).toBe("function");
    expect(typeof result.current.wire.clearWireForm).toBe("function");
  });

  it("resets the connector form from catalog defaults in create mode", () => {
    const store = createStoreWithCatalog();

    const { result } = renderHook(() => {
      const formsState = useEntityFormsState();
      const modeling = useAppControllerModelingHandlersAssembly({
        store,
        state: store.getState(),
        dispatchAction: (action, options) => {
          void options;
          store.dispatch(action);
        },
        confirmAction: vi.fn(() => Promise.resolve(true)),
        formsState,
        pendingNewNodePosition: null,
        setPendingNewNodePosition: vi.fn(),
        setRoutePreviewStartNodeId: vi.fn(),
        setRoutePreviewEndNodeId: vi.fn(),
        selectedConnectorId: null,
        selectedSpliceId: null,
        selectedWire: null,
        defaultWireSectionMm2: 0.5,
        defaultAutoCreateLinkedNodes: true
      });

      return {
        formsState,
        modeling
      };
    });

    act(() => {
      result.current.modeling.connector.resetConnectorForm();
    });

    expect(result.current.formsState.connectorFormMode).toBe("create");
    expect(result.current.formsState.editingConnectorId).toBeNull();
    expect(result.current.formsState.connectorTechnicalId).toBe("C-001");
    expect(result.current.formsState.connectorCatalogItemId).toBe("catalog-2w");
    expect(result.current.formsState.connectorManufacturerReference).toBe("CAT-2W");
    expect(result.current.formsState.cavityCount).toBe("2");
    expect(result.current.formsState.connectorAutoCreateLinkedNode).toBe(true);
    expect(result.current.formsState.connectorFormError).toBeNull();
  });
});

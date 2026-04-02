import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCanvasState } from "../app/hooks/useCanvasState";
import { useCatalogHandlers } from "../app/hooks/useCatalogHandlers";
import { useEntityFormsState } from "../app/hooks/useEntityFormsState";
import { useAppControllerSelectionEntities } from "../app/hooks/useAppControllerSelectionEntities";
import { useValidationModel } from "../app/hooks/useValidationModel";
import { useAppControllerSelectionHandlersDomainAssembly } from "../app/hooks/controller/useAppControllerSelectionHandlersDomainAssembly";
import { createUiIntegrationState } from "./helpers/app-ui-test-utils";
import { asConnectorId, asNodeId, asSegmentId, asSpliceId } from "./helpers/store-reducer-test-utils";

describe("useAppControllerSelectionHandlersDomainAssembly", () => {
  it("exposes the expected selection and validation handler surface", () => {
    const state = createUiIntegrationState();
    const segment = state.segments.byId[asSegmentId("SEG-A")];
    if (segment === undefined) {
      throw new Error("Expected seed segment SEG-A.");
    }

    const { result } = renderHook(() => {
      const canvasState = useCanvasState();
      const formsState = useEntityFormsState();
      const selectionEntities = useAppControllerSelectionEntities({
        state: {
          ...state,
          ui: {
            ...state.ui,
            selected: { kind: "connector" as const, id: asConnectorId("C1") }
          }
        }
      });
      const validationModel = useValidationModel({
        state,
        connectors: state.connectors.allIds.map((id) => state.connectors.byId[id]).filter((value) => value !== undefined),
        splices: state.splices.allIds.map((id) => state.splices.byId[id]).filter((value) => value !== undefined),
        nodes: state.nodes.allIds.map((id) => state.nodes.byId[id]).filter((value) => value !== undefined),
        segments: state.segments.allIds.map((id) => state.segments.byId[id]).filter((value) => value !== undefined),
        wires: state.wires.allIds.map((id) => state.wires.byId[id]).filter((value) => value !== undefined),
        connectorMap: new Map([[asConnectorId("C1"), selectionEntities.selectedConnector!]]),
        spliceMap: new Map(),
        segmentMap: new Map([[segment.id, segment]]),
        connectorNodeByConnectorId: new Map([[asConnectorId("C1"), asNodeId("N-C1")]]),
        spliceNodeBySpliceId: new Map(),
        isValidationScreen: false
      });
      const catalogHandlers = useCatalogHandlers({
        store: { getState: () => state, dispatch: vi.fn(), replaceState: vi.fn(), subscribe: vi.fn(() => () => undefined) },
        dispatchAction: vi.fn(),
        confirmAction: vi.fn(() => Promise.resolve(true)),
        catalogFormMode: formsState.catalogFormMode,
        setCatalogFormMode: formsState.setCatalogFormMode,
        editingCatalogItemId: formsState.editingCatalogItemId,
        setEditingCatalogItemId: formsState.setEditingCatalogItemId,
        catalogManufacturerReference: formsState.catalogManufacturerReference,
        setCatalogManufacturerReference: formsState.setCatalogManufacturerReference,
        catalogConnectionCount: formsState.catalogConnectionCount,
        setCatalogConnectionCount: formsState.setCatalogConnectionCount,
        catalogName: formsState.catalogName,
        setCatalogName: formsState.setCatalogName,
        catalogUnitPriceExclTax: formsState.catalogUnitPriceExclTax,
        setCatalogUnitPriceExclTax: formsState.setCatalogUnitPriceExclTax,
        catalogUrl: formsState.catalogUrl,
        setCatalogUrl: formsState.setCatalogUrl,
        setCatalogFormError: formsState.setCatalogFormError
      });

      return useAppControllerSelectionHandlersDomainAssembly({
        core: {
          state,
          dispatchAction: vi.fn(),
          segmentMap: new Map([[segment.id, segment]]),
          networkNodePositions: {
            [asNodeId("N-C1")]: { x: 120, y: 60 }
          },
          connectorNodeByConnectorId: new Map([[asConnectorId("C1"), asNodeId("N-C1")]]),
          spliceNodeBySpliceId: new Map([[asSpliceId("S1"), asNodeId("N-S1")]])
        },
        canvasFocus: {
          setInteractionMode: canvasState.setInteractionMode,
          networkScale: canvasState.networkScale,
          effectiveNetworkViewWidth: 800,
          effectiveNetworkViewHeight: 600,
          setNetworkScale: canvasState.setNetworkScale,
          setNetworkOffset: canvasState.setNetworkOffset
        },
        selectionEntities,
        navigation: {
          setActiveScreen: vi.fn(),
          setActiveSubScreen: vi.fn(),
          markDetailPanelsSelectionSourceAsTable: vi.fn()
        },
        validationModel,
        modelingHandlers: {
          connector: { startConnectorEdit: vi.fn() },
          splice: { startSpliceEdit: vi.fn() },
          node: { startNodeEdit: vi.fn() },
          segment: { startSegmentEdit: vi.fn() },
          wire: { startWireEdit: vi.fn() }
        } as unknown as Parameters<typeof useAppControllerSelectionHandlersDomainAssembly>[0]["modelingHandlers"],
        catalogHandlers
      });
    });

    expect(typeof result.current.focusSelectionOnCanvas).toBe("function");
    expect(typeof result.current.handleFocusCurrentSelectionOnCanvas).toBe("function");
    expect(typeof result.current.handleOpenValidationScreen).toBe("function");
    expect(typeof result.current.handleOpenSelectionInAnalysis).toBe("function");
    expect(typeof result.current.handleStartSelectedEdit).toBe("function");
  });

  it("opens the validation screen and recenters the current selection on the canvas", () => {
    const state = createUiIntegrationState();
    const connector = state.connectors.byId[asConnectorId("C1")];
    if (connector === undefined) {
      throw new Error("Expected seed connector C1.");
    }

    const setActiveScreen = vi.fn();
    const setActiveSubScreen = vi.fn();
    const setValidationSearchQuery = vi.fn();
    const setValidationCategoryFilter = vi.fn();
    const setValidationSeverityFilter = vi.fn();
    const startConnectorEdit = vi.fn();

    const { result } = renderHook(() => {
      const canvasState = useCanvasState();
      const formsState = useEntityFormsState();
      const selectionState = {
        ...state,
        ui: {
          ...state.ui,
          selected: { kind: "connector" as const, id: asConnectorId("C1") }
        }
      };
      const selectionEntities = useAppControllerSelectionEntities({ state: selectionState });
      const validationModel = useValidationModel({
        state,
        connectors: state.connectors.allIds.map((id) => state.connectors.byId[id]).filter((value) => value !== undefined),
        splices: state.splices.allIds.map((id) => state.splices.byId[id]).filter((value) => value !== undefined),
        nodes: state.nodes.allIds.map((id) => state.nodes.byId[id]).filter((value) => value !== undefined),
        segments: state.segments.allIds.map((id) => state.segments.byId[id]).filter((value) => value !== undefined),
        wires: state.wires.allIds.map((id) => state.wires.byId[id]).filter((value) => value !== undefined),
        connectorMap: new Map([[asConnectorId("C1"), connector]]),
        spliceMap: new Map(),
        segmentMap: new Map(),
        connectorNodeByConnectorId: new Map([[asConnectorId("C1"), asNodeId("N-C1")]]),
        spliceNodeBySpliceId: new Map(),
        isValidationScreen: false
      });
      const catalogHandlers = useCatalogHandlers({
        store: { getState: () => state, dispatch: vi.fn(), replaceState: vi.fn(), subscribe: vi.fn(() => () => undefined) },
        dispatchAction: vi.fn(),
        confirmAction: vi.fn(() => Promise.resolve(true)),
        catalogFormMode: formsState.catalogFormMode,
        setCatalogFormMode: formsState.setCatalogFormMode,
        editingCatalogItemId: formsState.editingCatalogItemId,
        setEditingCatalogItemId: formsState.setEditingCatalogItemId,
        catalogManufacturerReference: formsState.catalogManufacturerReference,
        setCatalogManufacturerReference: formsState.setCatalogManufacturerReference,
        catalogConnectionCount: formsState.catalogConnectionCount,
        setCatalogConnectionCount: formsState.setCatalogConnectionCount,
        catalogName: formsState.catalogName,
        setCatalogName: formsState.setCatalogName,
        catalogUnitPriceExclTax: formsState.catalogUnitPriceExclTax,
        setCatalogUnitPriceExclTax: formsState.setCatalogUnitPriceExclTax,
        catalogUrl: formsState.catalogUrl,
        setCatalogUrl: formsState.setCatalogUrl,
        setCatalogFormError: formsState.setCatalogFormError
      });
      const handlers = useAppControllerSelectionHandlersDomainAssembly({
        core: {
          state,
          dispatchAction: vi.fn(),
          segmentMap: new Map(),
          networkNodePositions: {
            [asNodeId("N-C1")]: { x: 120, y: 60 }
          },
          connectorNodeByConnectorId: new Map([[asConnectorId("C1"), asNodeId("N-C1")]]),
          spliceNodeBySpliceId: new Map()
        },
        canvasFocus: {
          setInteractionMode: canvasState.setInteractionMode,
          networkScale: 0.75,
          effectiveNetworkViewWidth: 800,
          effectiveNetworkViewHeight: 600,
          setNetworkScale: canvasState.setNetworkScale,
          setNetworkOffset: canvasState.setNetworkOffset
        },
        selectionEntities,
        navigation: {
          setActiveScreen,
          setActiveSubScreen,
          markDetailPanelsSelectionSourceAsTable: vi.fn()
        },
        validationModel: {
          ...validationModel,
          setValidationSearchQuery,
          setValidationCategoryFilter,
          setValidationSeverityFilter
        },
        modelingHandlers: {
          connector: { startConnectorEdit },
          splice: { startSpliceEdit: vi.fn() },
          node: { startNodeEdit: vi.fn() },
          segment: { startSegmentEdit: vi.fn() },
          wire: { startWireEdit: vi.fn() }
        } as unknown as Parameters<typeof useAppControllerSelectionHandlersDomainAssembly>[0]["modelingHandlers"],
        catalogHandlers
      });

      return {
        handlers,
        canvasState
      };
    });

    act(() => {
      result.current.handlers.handleOpenValidationScreen("error");
      result.current.handlers.handleFocusCurrentSelectionOnCanvas();
      result.current.handlers.handleStartSelectedEdit();
    });

    expect(setValidationSearchQuery).toHaveBeenCalledWith("");
    expect(setValidationCategoryFilter).toHaveBeenCalledWith("all");
    expect(setValidationSeverityFilter).toHaveBeenCalledWith("error");
    expect(setActiveScreen).toHaveBeenCalledWith("validation");
    expect(result.current.canvasState.interactionMode).toBe("select");
    expect(result.current.canvasState.networkScale).toBe(1);
    expect(result.current.canvasState.networkOffset).toEqual({ x: 280, y: 240 });
    expect(setActiveSubScreen).toHaveBeenCalledWith("connector");
    expect(startConnectorEdit).toHaveBeenCalledWith(connector);
  });
});

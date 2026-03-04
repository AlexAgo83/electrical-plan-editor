import type { CatalogItemId } from "../../../core/entities";
import type { NodePosition } from "../../types/app-controller";
import type { CatalogHandlersModel } from "../useCatalogHandlers";
import type { AppControllerSelectionEntitiesModel } from "../useAppControllerSelectionEntities";
import type { ValidationModel } from "../useValidationModel";
import { useAppControllerSelectionHandlersAssembly } from "./useAppControllerHeavyHookAssemblers";
import type { useAppControllerModelingHandlersAssembly } from "./useAppControllerModelingHandlersAssembly";

type SelectionHandlersAssemblyParams = Parameters<typeof useAppControllerSelectionHandlersAssembly>[0];
type ModelingHandlersModel = ReturnType<typeof useAppControllerModelingHandlersAssembly>;

type ScreenId = "home" | "networkScope" | "modeling" | "analysis" | "validation" | "settings";

interface UseAppControllerSelectionHandlersDomainAssemblyParams {
  core: Pick<
    SelectionHandlersAssemblyParams["core"],
    | "state"
    | "dispatchAction"
    | "segmentMap"
    | "networkNodePositions"
    | "connectorNodeByConnectorId"
    | "spliceNodeBySpliceId"
  >;
  canvasFocus: {
    setInteractionMode: SelectionHandlersAssemblyParams["canvasFocus"]["setInteractionMode"];
    networkScale: number;
    effectiveNetworkViewWidth: number;
    effectiveNetworkViewHeight: number;
    setNetworkScale: SelectionHandlersAssemblyParams["canvasFocus"]["setNetworkScale"];
    setNetworkOffset: (value: NodePosition) => void;
  };
  selectionEntities: AppControllerSelectionEntitiesModel;
  navigation: {
    setActiveScreen: (screen: ScreenId) => void;
    setActiveSubScreen: SelectionHandlersAssemblyParams["navigation"]["setActiveSubScreen"];
    markDetailPanelsSelectionSourceAsTable: () => void;
  };
  validationModel: ValidationModel;
  modelingHandlers: ModelingHandlersModel;
  catalogHandlers: CatalogHandlersModel;
}

export function useAppControllerSelectionHandlersDomainAssembly({
  core,
  canvasFocus,
  selectionEntities,
  navigation,
  validationModel,
  modelingHandlers,
  catalogHandlers
}: UseAppControllerSelectionHandlersDomainAssemblyParams) {
  const { connector, splice, node, segment, wire } = modelingHandlers;

  return useAppControllerSelectionHandlersAssembly({
    core,
    canvasFocus: {
      setInteractionMode: canvasFocus.setInteractionMode,
      networkScale: canvasFocus.networkScale,
      networkViewWidth: canvasFocus.effectiveNetworkViewWidth,
      networkViewHeight: canvasFocus.effectiveNetworkViewHeight,
      setNetworkScale: canvasFocus.setNetworkScale,
      setNetworkOffset: canvasFocus.setNetworkOffset
    },
    selection: {
      selected: selectionEntities.selected,
      selectedSubScreen: selectionEntities.selectedSubScreen,
      selectedConnector: selectionEntities.selectedConnector,
      selectedSplice: selectionEntities.selectedSplice,
      selectedNode: selectionEntities.selectedNode,
      selectedSegment: selectionEntities.selectedSegment,
      selectedWire: selectionEntities.selectedWire
    },
    navigation: {
      setActiveScreen: navigation.setActiveScreen,
      setActiveSubScreen: navigation.setActiveSubScreen,
      markDetailPanelsSelectionSourceAsTable: navigation.markDetailPanelsSelectionSourceAsTable
    },
    validation: {
      orderedValidationIssues: validationModel.orderedValidationIssues,
      visibleValidationIssues: validationModel.visibleValidationIssues,
      getFocusedValidationIssueByCursor: validationModel.getFocusedValidationIssueByCursor,
      setValidationIssueCursorFromIssue: validationModel.setValidationIssueCursorFromIssue,
      setValidationSearchQuery: validationModel.setValidationSearchQuery,
      setValidationCategoryFilter: validationModel.setValidationCategoryFilter,
      setValidationSeverityFilter: validationModel.setValidationSeverityFilter
    },
    editActions: {
      startConnectorEdit: connector.startConnectorEdit,
      startCatalogEditFromValidation: (catalogItemId) => {
        const item = core.state.catalogItems.byId[catalogItemId as CatalogItemId];
        if (item === undefined) {
          return;
        }
        catalogHandlers.startCatalogEdit(item);
      },
      startSpliceEdit: splice.startSpliceEdit,
      startNodeEdit: node.startNodeEdit,
      startSegmentEdit: segment.startSegmentEdit,
      startWireEdit: wire.startWireEdit
    }
  });
}

export type AppControllerSelectionHandlersDomainAssemblyModel =
  ReturnType<typeof useAppControllerSelectionHandlersDomainAssembly>;

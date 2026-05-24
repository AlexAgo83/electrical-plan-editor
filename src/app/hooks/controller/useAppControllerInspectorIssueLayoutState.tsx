import { useIssueNavigatorModel } from "../useIssueNavigatorModel";
import { useInspectorPanelVisibility } from "../useInspectorPanelVisibility";
import { useInspectorContextPanelControllerSlice } from "./useAppControllerInspectorContextPanelSlice";
import type { CatalogItemId, NetworkNode, SpliceId } from "../../../core/entities";
import { SpliceLengthSuggestionPanel } from "../../components/SpliceLengthSuggestionPanel";
import type { PendingSpliceLengthSuggestion } from "../useSpliceHandlers";
import type { AppControllerSelectionEntitiesModel } from "../useAppControllerSelectionEntities";
import type { ValidationModel } from "../useValidationModel";
import type { SubScreenId } from "../../types/app-controller";
import type { EntityFormsStateModel } from "../useEntityFormsState";

type DetailPanelsSelectionSource = "table" | "external";

interface UseAppControllerInspectorIssueLayoutStateParams {
  validationModel: Pick<
    ValidationModel,
    | "orderedValidationIssues"
    | "visibleValidationIssues"
    | "getFocusedValidationIssueByCursor"
    | "getValidationIssueByCursor"
  >;
  isValidationScreen: boolean;
  selectionEntities: Pick<
    AppControllerSelectionEntitiesModel,
    | "selected"
    | "selectedSubScreen"
    | "selectedCatalogItem"
    | "selectedConnector"
    | "selectedSplice"
    | "selectedNode"
    | "selectedSegment"
    | "selectedWire"
    | "selectedConnectorOccupiedCount"
    | "selectedSpliceOccupiedCount"
  >;
  activeSubScreen: SubScreenId;
  isCatalogSubScreen: boolean;
  selectedCatalogItemId: string | null;
  detailPanelsSelectionSource: DetailPanelsSelectionSource;
  isModelingScreen: boolean;
  isAnalysisScreen: boolean;
  hasActiveNetwork: boolean;
  showFloatingInspectorPanel: boolean;
  onCloseInspector: () => void;
  viewportWidth: number;
  isDialogFocusActive: boolean;
  isNavigationDrawerOpen: boolean;
  isOperationsPanelOpen: boolean;
  describeNode: (node: NetworkNode) => string;
  handleStartSelectedEdit: () => void;
  onSelectCatalogItem: (catalogItemId: CatalogItemId) => void;
  onClearSelection: () => void;
  formsState: Pick<
    EntityFormsStateModel,
    | "catalogFormMode"
    | "connectorFormMode"
    | "spliceFormMode"
    | "nodeFormMode"
    | "segmentFormMode"
    | "wireFormMode"
  >;
  spliceLengthSuggestion: PendingSpliceLengthSuggestion | null;
  onApplySpliceLengthSuggestion: () => void;
  onCancelSpliceLengthSuggestion: () => void;
  onSuggestOptimizedSplicePlacement: (spliceId: SpliceId) => void;
}

export function useAppControllerInspectorIssueLayoutState({
  validationModel,
  isValidationScreen,
  selectionEntities,
  activeSubScreen,
  isCatalogSubScreen,
  selectedCatalogItemId,
  detailPanelsSelectionSource,
  isModelingScreen,
  isAnalysisScreen,
  hasActiveNetwork,
  showFloatingInspectorPanel,
  onCloseInspector,
  viewportWidth,
  isDialogFocusActive,
  isNavigationDrawerOpen,
  isOperationsPanelOpen,
  describeNode,
  handleStartSelectedEdit,
  onSelectCatalogItem,
  onClearSelection,
  formsState,
  spliceLengthSuggestion,
  onApplySpliceLengthSuggestion,
  onCancelSpliceLengthSuggestion,
  onSuggestOptimizedSplicePlacement
}: UseAppControllerInspectorIssueLayoutStateParams) {
  const currentValidationIssue = isValidationScreen
    ? (validationModel.getFocusedValidationIssueByCursor() ?? validationModel.visibleValidationIssues[0] ?? null)
    : validationModel.getValidationIssueByCursor();

  const { issueNavigationScopeLabel, issueNavigatorDisplay } = useIssueNavigatorModel({
    isValidationScreen,
    currentValidationIssue,
    orderedValidationIssues: validationModel.orderedValidationIssues,
    visibleValidationIssues: validationModel.visibleValidationIssues
  });

  const hasInspectableSelection =
    selectionEntities.selected !== null &&
    selectionEntities.selectedSubScreen !== null;
  const hasTableInspectableSelection = hasInspectableSelection && detailPanelsSelectionSource === "table";
  const hasTableSelectionForActiveSubScreen =
    hasTableInspectableSelection && selectionEntities.selectedSubScreen === activeSubScreen;
  const hasInspectableSelectionForActiveSubScreen =
    hasInspectableSelection && selectionEntities.selectedSubScreen === activeSubScreen;
  const hasCatalogSelectionForActiveSubScreen =
    isCatalogSubScreen && selectedCatalogItemId !== null;
  const hasActiveEntityForm =
    formsState.catalogFormMode !== "idle" ||
    formsState.connectorFormMode !== "idle" ||
    formsState.spliceFormMode !== "idle" ||
    formsState.nodeFormMode !== "idle" ||
    formsState.segmentFormMode !== "idle" ||
    formsState.wireFormMode !== "idle";
  const hasSpliceLengthSuggestion = spliceLengthSuggestion !== null;

  const {
    isInspectorHidden,
    canExpandInspectorFromCollapsed,
    canCollapseInspectorToCollapsed,
    isInspectorOpen,
    expandInspectorFromCollapsed,
    collapseInspectorToCollapsed
  } = useInspectorPanelVisibility({
    isModelingScreen,
    isAnalysisScreen,
    hasActiveNetwork,
    hasInspectableSelection: hasInspectableSelection || hasSpliceLengthSuggestion,
    showFloatingInspectorPanel: showFloatingInspectorPanel || hasSpliceLengthSuggestion,
    viewportWidth,
    isDialogFocusActive,
    isNavigationDrawerOpen,
    isOperationsPanelOpen
  });

  const { inspectorContextPanel } = useInspectorContextPanelControllerSlice({
    isInspectorOpen,
    canExpandInspectorFromCollapsed,
    canCollapseInspectorToCollapsed,
    expandInspectorFromCollapsed,
    collapseInspectorToCollapsed,
    selected: selectionEntities.selected,
    selectedSubScreen: selectionEntities.selectedSubScreen,
    selectedCatalogItem: selectionEntities.selectedCatalogItem,
    selectedConnector: selectionEntities.selectedConnector,
    selectedSplice: selectionEntities.selectedSplice,
    selectedNode: selectionEntities.selectedNode,
    selectedSegment: selectionEntities.selectedSegment,
    selectedWire: selectionEntities.selectedWire,
    selectedConnectorOccupiedCount: selectionEntities.selectedConnectorOccupiedCount,
    selectedSpliceOccupiedCount: selectionEntities.selectedSpliceOccupiedCount,
    describeNode,
    handleStartSelectedEdit,
    onSelectCatalogItem,
    onClearSelection,
    onCloseInspector,
    onSuggestOptimizedSplicePlacement
  });
  const activeInspectorPanel =
    spliceLengthSuggestion === null ? (
      inspectorContextPanel
    ) : (
      <SpliceLengthSuggestionPanel
        suggestion={spliceLengthSuggestion}
        onApply={onApplySpliceLengthSuggestion}
        onCancel={onCancelSpliceLengthSuggestion}
      />
    );

  return {
    currentValidationIssue,
    issueNavigationScopeLabel,
    issueNavigatorDisplay,
    hasInspectableSelection,
    hasTableSelectionForActiveSubScreen,
    hasInspectableSelectionForActiveSubScreen,
    hasCatalogSelectionForActiveSubScreen,
    hasActiveEntityForm,
    isInspectorHidden,
    isInspectorOpen: hasSpliceLengthSuggestion ? true : isInspectorOpen,
    inspectorContextPanel: activeInspectorPanel
  };
}

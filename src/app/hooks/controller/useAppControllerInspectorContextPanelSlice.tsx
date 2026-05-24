import type { ComponentProps } from "react";
import { InspectorContextPanel } from "../../components/InspectorContextPanel";

type InspectorContextPanelControllerSliceParams = Omit<
  ComponentProps<typeof InspectorContextPanel>,
  | "mode"
  | "canExpandFromCollapsed"
  | "canCollapseToCollapsed"
  | "onExpandFromCollapsed"
  | "onCollapseToCollapsed"
  | "onCloseInspector"
  | "connectorOccupiedCount"
  | "spliceOccupiedCount"
  | "onEditSelected"
  | "onSelectCatalogItem"
  | "onClearSelection"
  | "onSuggestOptimizedSplicePlacement"
> & {
  isInspectorOpen: boolean;
  canExpandInspectorFromCollapsed: boolean;
  canCollapseInspectorToCollapsed: boolean;
  expandInspectorFromCollapsed: () => void;
  collapseInspectorToCollapsed: () => void;
  selectedConnectorOccupiedCount: number;
  selectedSpliceOccupiedCount: number;
  handleStartSelectedEdit: ComponentProps<typeof InspectorContextPanel>["onEditSelected"];
  onSelectCatalogItem: ComponentProps<typeof InspectorContextPanel>["onSelectCatalogItem"];
  onClearSelection: ComponentProps<typeof InspectorContextPanel>["onClearSelection"];
  onCloseInspector: ComponentProps<typeof InspectorContextPanel>["onCloseInspector"];
  onSuggestOptimizedSplicePlacement: ComponentProps<typeof InspectorContextPanel>["onSuggestOptimizedSplicePlacement"];
};

export function useInspectorContextPanelControllerSlice(params: InspectorContextPanelControllerSliceParams) {
  const inspectorContextPanelProps = {
    mode: params.isInspectorOpen ? "open" : "collapsed",
    canExpandFromCollapsed: params.canExpandInspectorFromCollapsed,
    canCollapseToCollapsed: params.canCollapseInspectorToCollapsed,
    onExpandFromCollapsed: params.expandInspectorFromCollapsed,
    onCollapseToCollapsed: params.collapseInspectorToCollapsed,
    onCloseInspector: params.onCloseInspector,
    selected: params.selected,
    selectedSubScreen: params.selectedSubScreen,
    selectedCatalogItem: params.selectedCatalogItem,
    selectedConnector: params.selectedConnector,
    selectedSplice: params.selectedSplice,
    selectedNode: params.selectedNode,
    selectedSegment: params.selectedSegment,
    selectedWire: params.selectedWire,
    connectorOccupiedCount: params.selectedConnectorOccupiedCount,
    spliceOccupiedCount: params.selectedSpliceOccupiedCount,
    describeNode: params.describeNode,
    onEditSelected: params.handleStartSelectedEdit,
    onSelectCatalogItem: params.onSelectCatalogItem,
    onClearSelection: params.onClearSelection,
    onSuggestOptimizedSplicePlacement: params.onSuggestOptimizedSplicePlacement
  } satisfies ComponentProps<typeof InspectorContextPanel>;

  return {
    inspectorContextPanelProps,
    inspectorContextPanel: <InspectorContextPanel {...inspectorContextPanelProps} />
  };
}

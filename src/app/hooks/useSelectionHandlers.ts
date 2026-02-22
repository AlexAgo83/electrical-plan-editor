import type { Connector, ConnectorId, NetworkNode, NodeId, Segment, SegmentId, Splice, SpliceId, Wire, WireId } from "../../core/entities";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import { NETWORK_VIEW_HEIGHT, NETWORK_VIEW_WIDTH } from "../lib/app-utils-shared";
import { resolveEndpointNodeId } from "../lib/app-utils-networking";
import type {
  InteractionMode,
  NodePosition,
  SelectionTarget,
  SubScreenId,
  ValidationIssue,
  ValidationSeverityFilter
} from "../types/app-controller";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

interface SelectionRef {
  kind: ValidationIssue["selectionKind"];
  id: string;
}

interface UseSelectionHandlersParams {
  state: ReturnType<AppStore["getState"]>;
  dispatchAction: DispatchAction;
  segmentMap: Map<SegmentId, Segment>;
  networkNodePositions: Record<NodeId, NodePosition>;
  connectorNodeByConnectorId: Map<ConnectorId, NodeId>;
  spliceNodeBySpliceId: Map<SpliceId, NodeId>;
  setInteractionMode: (mode: InteractionMode) => void;
  networkScale: number;
  setNetworkScale: (value: number) => void;
  setNetworkOffset: (value: NodePosition) => void;
  selected: SelectionRef | null;
  selectedSubScreen: SubScreenId | null;
  selectedConnector: Connector | null;
  selectedSplice: Splice | null;
  selectedNode: NetworkNode | null;
  selectedSegment: Segment | null;
  selectedWire: Wire | null;
  setActiveScreen: (screen: "networkScope" | "modeling" | "analysis" | "validation" | "settings") => void;
  setActiveSubScreen: (screen: SubScreenId) => void;
  orderedValidationIssues: ValidationIssue[];
  visibleValidationIssues: ValidationIssue[];
  getFocusedValidationIssueByCursor: () => ValidationIssue | null;
  setValidationIssueCursorFromIssue: (issue: ValidationIssue) => void;
  setValidationSearchQuery: (value: string) => void;
  setValidationCategoryFilter: (value: string) => void;
  setValidationSeverityFilter: (value: ValidationSeverityFilter) => void;
  startConnectorEdit: (connector: Connector) => void;
  startSpliceEdit: (splice: Splice) => void;
  startNodeEdit: (node: NetworkNode) => void;
  startSegmentEdit: (segment: Segment) => void;
  startWireEdit: (wire: Wire) => void;
}

export function useSelectionHandlers({
  state,
  dispatchAction,
  segmentMap,
  networkNodePositions,
  connectorNodeByConnectorId,
  spliceNodeBySpliceId,
  setInteractionMode,
  networkScale,
  setNetworkScale,
  setNetworkOffset,
  selected,
  selectedSubScreen,
  selectedConnector,
  selectedSplice,
  selectedNode,
  selectedSegment,
  selectedWire,
  setActiveScreen,
  setActiveSubScreen,
  orderedValidationIssues,
  visibleValidationIssues,
  getFocusedValidationIssueByCursor,
  setValidationIssueCursorFromIssue,
  setValidationSearchQuery,
  setValidationCategoryFilter,
  setValidationSeverityFilter,
  startConnectorEdit,
  startSpliceEdit,
  startNodeEdit,
  startSegmentEdit,
  startWireEdit
}: UseSelectionHandlersParams) {
  function resolveSelectionAnchor(target: SelectionTarget): NodePosition | null {
    if (target.kind === "node") {
      return networkNodePositions[target.id as NodeId] ?? null;
    }

    if (target.kind === "segment") {
      const segment = segmentMap.get(target.id as SegmentId);
      if (segment === undefined) {
        return null;
      }

      const nodeAPosition = networkNodePositions[segment.nodeA];
      const nodeBPosition = networkNodePositions[segment.nodeB];
      if (nodeAPosition === undefined || nodeBPosition === undefined) {
        return null;
      }

      return {
        x: (nodeAPosition.x + nodeBPosition.x) / 2,
        y: (nodeAPosition.y + nodeBPosition.y) / 2
      };
    }

    if (target.kind === "connector") {
      const nodeId = connectorNodeByConnectorId.get(target.id as ConnectorId);
      if (nodeId === undefined) {
        return null;
      }

      return networkNodePositions[nodeId] ?? null;
    }

    if (target.kind === "splice") {
      const nodeId = spliceNodeBySpliceId.get(target.id as SpliceId);
      if (nodeId === undefined) {
        return null;
      }

      return networkNodePositions[nodeId] ?? null;
    }

    const wire = state.wires.byId[target.id as WireId];
    if (wire === undefined) {
      return null;
    }

    const firstSegmentId = wire.routeSegmentIds[0];
    if (firstSegmentId !== undefined) {
      const firstSegment = segmentMap.get(firstSegmentId);
      if (firstSegment !== undefined) {
        const nodeAPosition = networkNodePositions[firstSegment.nodeA];
        const nodeBPosition = networkNodePositions[firstSegment.nodeB];
        if (nodeAPosition !== undefined && nodeBPosition !== undefined) {
          return {
            x: (nodeAPosition.x + nodeBPosition.x) / 2,
            y: (nodeAPosition.y + nodeBPosition.y) / 2
          };
        }
      }
    }

    const endpointNodeId = resolveEndpointNodeId(wire.endpointA, connectorNodeByConnectorId, spliceNodeBySpliceId);
    if (endpointNodeId !== null) {
      return networkNodePositions[endpointNodeId] ?? null;
    }

    return null;
  }

  function focusSelectionOnCanvas(target: SelectionTarget): void {
    const anchor = resolveSelectionAnchor(target);
    if (anchor === null) {
      return;
    }

    setInteractionMode("select");
    const targetScale = networkScale < 1 ? 1 : networkScale;
    setNetworkScale(targetScale);
    setNetworkOffset({
      x: NETWORK_VIEW_WIDTH / 2 - anchor.x * targetScale,
      y: NETWORK_VIEW_HEIGHT / 2 - anchor.y * targetScale
    });
  }

  function handleFocusCurrentSelectionOnCanvas(): void {
    if (selected === null) {
      return;
    }

    focusSelectionOnCanvas({
      kind: selected.kind,
      id: selected.id
    });
  }

  function handleValidationIssueGoTo(issue: ValidationIssue): void {
    setActiveScreen("modeling");
    setActiveSubScreen(issue.subScreen);
    dispatchAction(
      appActions.select({
        kind: issue.selectionKind,
        id: issue.selectionId
      })
    );
    focusSelectionOnCanvas({
      kind: issue.selectionKind,
      id: issue.selectionId
    });
  }

  function handleOpenValidationScreen(filter: ValidationSeverityFilter): void {
    setValidationSearchQuery("");
    setValidationCategoryFilter("all");
    setValidationSeverityFilter(filter);
    setActiveScreen("validation");
  }

  function moveValidationIssueCursorInList(direction: 1 | -1, issues: ValidationIssue[]): void {
    if (issues.length === 0) {
      return;
    }

    const currentIssue = getFocusedValidationIssueByCursor();
    const currentIssueIndex = currentIssue === null ? -1 : issues.findIndex((issue) => issue.id === currentIssue.id);
    const baseIndex = currentIssueIndex < 0 ? (direction > 0 ? -1 : 0) : currentIssueIndex;
    const nextIndex = (baseIndex + direction + issues.length) % issues.length;
    const issue = issues[nextIndex];
    if (issue === undefined) {
      return;
    }

    setValidationIssueCursorFromIssue(issue);
    handleValidationIssueGoTo(issue);
  }

  function moveValidationIssueCursor(direction: 1 | -1): void {
    moveValidationIssueCursorInList(direction, orderedValidationIssues);
  }

  function moveVisibleValidationIssueCursor(direction: 1 | -1): void {
    moveValidationIssueCursorInList(direction, visibleValidationIssues);
  }

  function handleValidationIssueRowGoTo(issue: ValidationIssue): void {
    setValidationIssueCursorFromIssue(issue);
    handleValidationIssueGoTo(issue);
  }

  function handleOpenSelectionInAnalysis(): void {
    const hasConnectorNodeSelection = selectedNode !== null && selectedNode.kind === "connector";
    const hasSpliceNodeSelection = selectedNode !== null && selectedNode.kind === "splice";
    const targetSubScreen: SubScreenId | null =
      selectedConnector !== null || hasConnectorNodeSelection
        ? "connector"
        : selectedSplice !== null || hasSpliceNodeSelection
          ? "splice"
          : selectedWire !== null
            ? "wire"
            : selectedSubScreen === "wire"
              ? "wire"
              : null;

    if (targetSubScreen === null) {
      return;
    }

    const selectionForAnalysis: SelectionTarget | null =
      selectedConnector !== null
        ? { kind: "connector", id: selectedConnector.id }
        : selectedSplice !== null
          ? { kind: "splice", id: selectedSplice.id }
          : selectedWire !== null
            ? { kind: "wire", id: selectedWire.id }
            : hasConnectorNodeSelection
              ? { kind: "connector", id: selectedNode.connectorId }
              : hasSpliceNodeSelection
                ? { kind: "splice", id: selectedNode.spliceId }
                : selected;

    if (selectionForAnalysis !== null) {
      dispatchAction(
        appActions.select({
          kind: selectionForAnalysis.kind,
          id: selectionForAnalysis.id
        }),
        { trackHistory: false }
      );
    }

    setActiveScreen("analysis");
    setActiveSubScreen(targetSubScreen);
  }

  function handleStartSelectedEdit(): void {
    if (selectedSubScreen === null) {
      return;
    }

    setActiveScreen("modeling");
    setActiveSubScreen(selectedSubScreen);

    if (selectedConnector !== null) {
      startConnectorEdit(selectedConnector);
      return;
    }

    if (selectedSplice !== null) {
      startSpliceEdit(selectedSplice);
      return;
    }

    if (selectedNode !== null) {
      startNodeEdit(selectedNode);
      return;
    }

    if (selectedSegment !== null) {
      startSegmentEdit(selectedSegment);
      return;
    }

    if (selectedWire !== null) {
      startWireEdit(selectedWire);
    }
  }

  return {
    focusSelectionOnCanvas,
    handleFocusCurrentSelectionOnCanvas,
    handleValidationIssueGoTo,
    handleOpenValidationScreen,
    moveValidationIssueCursor,
    moveVisibleValidationIssueCursor,
    handleValidationIssueRowGoTo,
    handleOpenSelectionInAnalysis,
    handleStartSelectedEdit
  };
}

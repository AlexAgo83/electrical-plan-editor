import { translateCurrent as t } from "../../lib/i18n";
import { useCallback } from "react";
import type { NetworkNode, NodeId, Segment } from "../../../core/entities";
import { appActions, appReducer, type AppState, type LayoutNodePosition } from "../../../store";
import type { ConfirmDialogRequest } from "../../types/confirm-dialog";
import { NETWORK_GRID_STEP } from "../../lib/app-utils-shared";
import { createNodePositionMap } from "../../lib/app-utils-layout";

interface UseAppControllerRegenerateLayoutActionParams {
  nodes: NetworkNode[];
  segments: Segment[];
  persistedNodePositions: Record<NodeId, LayoutNodePosition>;
  snapNodesToGrid: boolean;
  state: AppState;
  requestConfirmation: (request: ConfirmDialogRequest) => Promise<boolean>;
  setManualNodePositions: (positions: Record<NodeId, { x: number; y: number }>) => void;
  replaceStateWithHistory: (nextState: AppState) => void;
}

export function useAppControllerRegenerateLayoutAction({
  nodes,
  segments,
  persistedNodePositions,
  snapNodesToGrid,
  state,
  requestConfirmation,
  setManualNodePositions,
  replaceStateWithHistory
}: UseAppControllerRegenerateLayoutActionParams) {
  return useCallback(() => {
    void (async () => {
      if (nodes.length === 0) {
        return;
      }

      if (Object.keys(persistedNodePositions).length > 0) {
        const shouldRegenerate = await requestConfirmation({
          title: t("ui.useappcontrollerregeneratelayoutactionRegenerate2DLayout"),
          message: t("ui.useappcontrollerregeneratelayoutactionRegenerate2DLayoutForThisNetworkExistingManualPositionsWill"),
          intent: "warning"
        });
        if (!shouldRegenerate) {
          return;
        }
      }

      const regeneratedPositions = createNodePositionMap(nodes, segments, {
        snapToGrid: snapNodesToGrid,
        gridStep: NETWORK_GRID_STEP
      });
      let nextState = appReducer(state, appActions.setNodePositions(regeneratedPositions));

      for (const connector of Object.values(nextState.connectors.byId)) {
        if (connector === undefined || connector.cableCalloutPosition === undefined) {
          continue;
        }
        const connectorWithoutCalloutPosition = { ...connector, cableCalloutPosition: undefined };
        nextState = appReducer(nextState, appActions.upsertConnector(connectorWithoutCalloutPosition));
      }
      for (const splice of Object.values(nextState.splices.byId)) {
        if (splice === undefined || splice.cableCalloutPosition === undefined) {
          continue;
        }
        const spliceWithoutCalloutPosition = { ...splice, cableCalloutPosition: undefined };
        nextState = appReducer(nextState, appActions.upsertSplice(spliceWithoutCalloutPosition));
      }
      for (const segment of Object.values(nextState.segments.byId)) {
        if (segment === undefined || segment.sheathCalloutPosition === undefined) {
          continue;
        }
        const segmentWithoutCalloutPosition = { ...segment, sheathCalloutPosition: undefined };
        nextState = appReducer(nextState, appActions.upsertSegment(segmentWithoutCalloutPosition));
      }

      setManualNodePositions({});
      replaceStateWithHistory(nextState);
    })();
  }, [
    nodes,
    persistedNodePositions,
    replaceStateWithHistory,
    requestConfirmation,
    segments,
    setManualNodePositions,
    snapNodesToGrid,
    state
  ]);
}

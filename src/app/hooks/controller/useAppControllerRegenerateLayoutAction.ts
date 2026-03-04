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
          title: "Regenerate 2D layout",
          message: "Regenerate 2D layout for this network? Existing manual positions will be replaced.",
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

      setManualNodePositions({} as Record<NodeId, { x: number; y: number }>);
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

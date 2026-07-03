import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { NodeId } from "../../core/entities";
import type { NodePosition } from "../types/app-controller";

interface UseCanvasFrameSchedulerParams {
  manualNodePositions: Record<NodeId, NodePosition>;
  networkOffset: NodePosition;
  setManualNodePositions: Dispatch<SetStateAction<Record<NodeId, NodePosition>>>;
  setNetworkOffset: Dispatch<SetStateAction<NodePosition>>;
}

export function useCanvasFrameScheduler({
  manualNodePositions,
  networkOffset,
  setManualNodePositions,
  setNetworkOffset
}: UseCanvasFrameSchedulerParams) {
  const pendingCanvasFrameRef = useRef<number | null>(null);
  const pendingManualNodePositionsUpdateRef = useRef<((previous: Record<NodeId, NodePosition>) => Record<NodeId, NodePosition>) | null>(null);
  const pendingNetworkOffsetUpdateRef = useRef<((previous: NodePosition) => NodePosition) | null>(null);
  const latestManualNodePositionsRef = useRef(manualNodePositions);
  const latestNetworkOffsetRef = useRef(networkOffset);

  useEffect(() => {
    latestManualNodePositionsRef.current = manualNodePositions;
  }, [manualNodePositions]);

  useEffect(() => {
    latestNetworkOffsetRef.current = networkOffset;
  }, [networkOffset]);

  function cancelPendingFrame(): void {
    if (pendingCanvasFrameRef.current !== null && typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
      window.cancelAnimationFrame(pendingCanvasFrameRef.current);
    }
    pendingCanvasFrameRef.current = null;
  }

  function flushPendingCanvasFrame(): void {
    cancelPendingFrame();

    const manualNodePositionsUpdate = pendingManualNodePositionsUpdateRef.current;
    pendingManualNodePositionsUpdateRef.current = null;
    if (manualNodePositionsUpdate !== null) {
      const nextManualNodePositions = manualNodePositionsUpdate(latestManualNodePositionsRef.current);
      latestManualNodePositionsRef.current = nextManualNodePositions;
      setManualNodePositions(nextManualNodePositions);
    }

    const networkOffsetUpdate = pendingNetworkOffsetUpdateRef.current;
    pendingNetworkOffsetUpdateRef.current = null;
    if (networkOffsetUpdate !== null) {
      const nextNetworkOffset = networkOffsetUpdate(latestNetworkOffsetRef.current);
      latestNetworkOffsetRef.current = nextNetworkOffset;
      setNetworkOffset(nextNetworkOffset);
    }
  }

  function scheduleCanvasFrame(): void {
    if (pendingCanvasFrameRef.current !== null) {
      return;
    }
    if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
      flushPendingCanvasFrame();
      return;
    }
    pendingCanvasFrameRef.current = window.requestAnimationFrame(flushPendingCanvasFrame);
  }

  function scheduleManualNodePositionsUpdate(
    update: (previous: Record<NodeId, NodePosition>) => Record<NodeId, NodePosition>
  ): void {
    const previousUpdate = pendingManualNodePositionsUpdateRef.current;
    pendingManualNodePositionsUpdateRef.current =
      previousUpdate === null ? update : (previous) => update(previousUpdate(previous));
    scheduleCanvasFrame();
  }

  function scheduleNetworkOffsetUpdate(update: (previous: NodePosition) => NodePosition): void {
    const previousUpdate = pendingNetworkOffsetUpdateRef.current;
    pendingNetworkOffsetUpdateRef.current = previousUpdate === null ? update : (previous) => update(previousUpdate(previous));
    scheduleCanvasFrame();
  }

  useEffect(() => cancelPendingFrame, []);

  return {
    flushPendingCanvasFrame,
    latestManualNodePositionsRef,
    scheduleManualNodePositionsUpdate,
    scheduleNetworkOffsetUpdate
  };
}

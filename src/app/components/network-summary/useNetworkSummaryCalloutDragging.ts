import { useCallback, useState, type MouseEvent as ReactMouseEvent } from "react";
import type { ConnectorId, SegmentId, SpliceId } from "../../../core/entities";
import type { NodePosition } from "../../types/app-controller";
import type { CableCalloutViewModel, CalloutTargetKey, DraggingCalloutState } from "./callouts/calloutLayout";

const CALLOUT_DRAG_START_THRESHOLD_PX = 4;

interface DraggingSegmentCalloutState {
  segmentId: SegmentId;
  startPosition: NodePosition;
  startClientX: number;
  startClientY: number;
  hasStartedDrag: boolean;
}

interface UseNetworkSummaryCalloutDraggingParams {
  lockEntityMovement: boolean;
  getSvgCoordinates: (svgElement: SVGSVGElement, clientX: number, clientY: number) => NodePosition | null;
  handleNetworkMouseMove: (event: ReactMouseEvent<SVGSVGElement>) => void;
  handleNetworkSegmentClick: (segmentId: SegmentId) => void;
  selectCalloutTarget: (callout: Pick<CableCalloutViewModel, "kind" | "entityId">) => void;
  onPersistConnectorCalloutPosition: (connectorId: ConnectorId, position: NodePosition) => void;
  onPersistSpliceCalloutPosition: (spliceId: SpliceId, position: NodePosition) => void;
  onPersistSegmentSheathCalloutPosition: (segmentId: SegmentId, position: NodePosition) => void;
  stopNetworkNodeDrag: () => void;
}

export function useNetworkSummaryCalloutDragging({
  lockEntityMovement,
  getSvgCoordinates,
  handleNetworkMouseMove,
  handleNetworkSegmentClick,
  selectCalloutTarget,
  onPersistConnectorCalloutPosition,
  onPersistSpliceCalloutPosition,
  onPersistSegmentSheathCalloutPosition,
  stopNetworkNodeDrag
}: UseNetworkSummaryCalloutDraggingParams) {
  const [hoveredCalloutKey, setHoveredCalloutKey] = useState<CalloutTargetKey | null>(null);
  const [draggingCallout, setDraggingCallout] = useState<DraggingCalloutState | null>(null);
  const [draftCalloutPositions, setDraftCalloutPositions] = useState<Record<string, NodePosition>>({});
  const [draggingSegmentCallout, setDraggingSegmentCallout] = useState<DraggingSegmentCalloutState | null>(null);
  const [draftSegmentCalloutPositions, setDraftSegmentCalloutPositions] = useState<Record<SegmentId, NodePosition>>({});

  const handleCalloutMouseDown = useCallback(
    (
      event: ReactMouseEvent<SVGGElement>,
      callout: Pick<CableCalloutViewModel, "key" | "kind" | "entityId" | "position">
    ) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setDraggingCallout({
        key: callout.key,
        kind: callout.kind,
        entityId: callout.entityId,
        startPosition: callout.position,
        startClientX: event.clientX,
        startClientY: event.clientY,
        hasStartedDrag: false
      });
    },
    []
  );

  const beginSegmentCalloutDrag = useCallback(
    (event: ReactMouseEvent<SVGGElement>, segmentId: SegmentId, startPosition: NodePosition | null) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (startPosition === null) {
        return;
      }
      setDraggingSegmentCallout({
        segmentId,
        startPosition,
        startClientX: event.clientX,
        startClientY: event.clientY,
        hasStartedDrag: false
      });
    },
    []
  );

  const handleCanvasMouseMoveWithCallouts = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (draggingSegmentCallout !== null) {
        let hasStartedDrag = draggingSegmentCallout.hasStartedDrag;
        if (!hasStartedDrag) {
          if (lockEntityMovement) {
            return;
          }
          const deltaClientX = event.clientX - draggingSegmentCallout.startClientX;
          const deltaClientY = event.clientY - draggingSegmentCallout.startClientY;
          if (Math.hypot(deltaClientX, deltaClientY) < CALLOUT_DRAG_START_THRESHOLD_PX) {
            return;
          }
          hasStartedDrag = true;
          handleNetworkSegmentClick(draggingSegmentCallout.segmentId);
          setDraggingSegmentCallout((current) =>
            current !== null && current.segmentId === draggingSegmentCallout.segmentId
              ? { ...current, hasStartedDrag: true }
              : current
          );
        }
        const coordinates = getSvgCoordinates(event.currentTarget, event.clientX, event.clientY);
        if (coordinates === null) {
          return;
        }
        setDraftSegmentCalloutPositions((current) => {
          const previousPosition = current[draggingSegmentCallout.segmentId];
          if (
            previousPosition !== undefined &&
            Math.abs(previousPosition.x - coordinates.x) <= 0.0001 &&
            Math.abs(previousPosition.y - coordinates.y) <= 0.0001
          ) {
            return current;
          }
          return {
            ...current,
            [draggingSegmentCallout.segmentId]: coordinates
          };
        });
        return;
      }
      if (draggingCallout === null) {
        handleNetworkMouseMove(event);
        return;
      }
      let hasStartedDrag = draggingCallout.hasStartedDrag;
      if (!hasStartedDrag) {
        if (lockEntityMovement) {
          return;
        }
        const deltaClientX = event.clientX - draggingCallout.startClientX;
        const deltaClientY = event.clientY - draggingCallout.startClientY;
        if (Math.hypot(deltaClientX, deltaClientY) < CALLOUT_DRAG_START_THRESHOLD_PX) {
          return;
        }
        hasStartedDrag = true;
        selectCalloutTarget(draggingCallout);
        setDraggingCallout((current) =>
          current !== null && current.key === draggingCallout.key
            ? { ...current, hasStartedDrag: true }
            : current
        );
      }
      const coordinates = getSvgCoordinates(event.currentTarget, event.clientX, event.clientY);
      if (coordinates === null) {
        return;
      }
      setDraftCalloutPositions((current) => {
        const previousPosition = current[draggingCallout.key];
        if (
          previousPosition !== undefined &&
          Math.abs(previousPosition.x - coordinates.x) <= 0.0001 &&
          Math.abs(previousPosition.y - coordinates.y) <= 0.0001
        ) {
          return current;
        }
        return {
          ...current,
          [draggingCallout.key]: coordinates
        };
      });
    },
    [
      draggingSegmentCallout,
      lockEntityMovement,
      handleNetworkSegmentClick,
      getSvgCoordinates,
      draggingCallout,
      handleNetworkMouseMove,
      selectCalloutTarget
    ]
  );

  const stopSegmentCalloutDrag = useCallback(() => {
    if (draggingSegmentCallout === null) {
      return;
    }

    const draftPosition = draftSegmentCalloutPositions[draggingSegmentCallout.segmentId];
    if (!draggingSegmentCallout.hasStartedDrag) {
      handleNetworkSegmentClick(draggingSegmentCallout.segmentId);
    } else if (draftPosition !== undefined) {
      const changed =
        Math.abs(draftPosition.x - draggingSegmentCallout.startPosition.x) > 0.0001 ||
        Math.abs(draftPosition.y - draggingSegmentCallout.startPosition.y) > 0.0001;
      if (changed) {
        onPersistSegmentSheathCalloutPosition(draggingSegmentCallout.segmentId, draftPosition);
      }
    }

    setDraggingSegmentCallout(null);
    setDraftSegmentCalloutPositions((current) => {
      if (current[draggingSegmentCallout.segmentId] === undefined) {
        return current;
      }
      const next = { ...current };
      delete next[draggingSegmentCallout.segmentId];
      return next;
    });
  }, [
    draggingSegmentCallout,
    draftSegmentCalloutPositions,
    handleNetworkSegmentClick,
    onPersistSegmentSheathCalloutPosition
  ]);

  const stopCalloutDrag = useCallback(() => {
    if (draggingCallout === null) {
      return;
    }

    const draftPosition = draftCalloutPositions[draggingCallout.key];
    if (!draggingCallout.hasStartedDrag) {
      selectCalloutTarget(draggingCallout);
    } else if (draftPosition !== undefined) {
      const changed =
        Math.abs(draftPosition.x - draggingCallout.startPosition.x) > 0.0001 ||
        Math.abs(draftPosition.y - draggingCallout.startPosition.y) > 0.0001;
      if (changed) {
        if (draggingCallout.kind === "connector") {
          onPersistConnectorCalloutPosition(draggingCallout.entityId as ConnectorId, draftPosition);
        } else {
          onPersistSpliceCalloutPosition(draggingCallout.entityId as SpliceId, draftPosition);
        }
      }
    }

    setDraggingCallout(null);
    setDraftCalloutPositions((current) => {
      if (current[draggingCallout.key] === undefined) {
        return current;
      }
      const next = { ...current };
      delete next[draggingCallout.key];
      return next;
    });
  }, [
    draggingCallout,
    draftCalloutPositions,
    onPersistConnectorCalloutPosition,
    onPersistSpliceCalloutPosition,
    selectCalloutTarget
  ]);

  const stopNetworkInteractions = useCallback(() => {
    stopSegmentCalloutDrag();
    stopCalloutDrag();
    stopNetworkNodeDrag();
  }, [stopSegmentCalloutDrag, stopCalloutDrag, stopNetworkNodeDrag]);

  return {
    hoveredCalloutKey,
    setHoveredCalloutKey,
    draggingCallout,
    draftCalloutPositions,
    draftSegmentCalloutPositions,
    handleCalloutMouseDown,
    beginSegmentCalloutDrag,
    handleCanvasMouseMoveWithCallouts,
    stopNetworkInteractions
  };
}

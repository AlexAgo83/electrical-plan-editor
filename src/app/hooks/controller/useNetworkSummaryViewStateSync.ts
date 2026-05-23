import { useEffect, useMemo, useRef } from "react";
import { appActions, type NetworkSummaryViewState } from "../../../store";
import type { NetworkId, NodeId } from "../../../core/entities";
import type { NetworkCalloutContentMode, NodePosition } from "../../types/app-controller";
import { computeNetworkFitViewportForPositions } from "../../lib/networkSummaryViewport";

type SetNetworkSummaryViewStateAction = ReturnType<typeof appActions.setNetworkSummaryViewState>;

const VIEWPORT_EPSILON = 0.0001;

function isApproximatelyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) <= VIEWPORT_EPSILON;
}

function isSameNetworkSummaryViewState(
  left: NetworkSummaryViewState | undefined,
  right: NetworkSummaryViewState
): boolean {
  if (left === undefined) {
    return false;
  }

  return (
    left.scale === right.scale &&
    left.offset.x === right.offset.x &&
    left.offset.y === right.offset.y &&
    left.showNetworkInfoPanels === right.showNetworkInfoPanels &&
    left.showSegmentNames === right.showSegmentNames &&
    left.showSegmentLengths === right.showSegmentLengths &&
    left.showCableCallouts === right.showCableCallouts &&
    left.showNetworkGrid === right.showNetworkGrid &&
    left.snapNodesToGrid === right.snapNodesToGrid &&
    left.lockEntityMovement === right.lockEntityMovement
  );
}

function isSameNetworkViewport(
  left: Pick<NetworkSummaryViewState, "scale" | "offset">,
  right: Pick<NetworkSummaryViewState, "scale" | "offset">
): boolean {
  return (
    isApproximatelyEqual(left.scale, right.scale) &&
    isApproximatelyEqual(left.offset.x, right.offset.x) &&
    isApproximatelyEqual(left.offset.y, right.offset.y)
  );
}

export interface UseNetworkSummaryViewStateSyncOptions {
  activeNetworkId: NetworkId | null;
  activeNetworkSummaryViewState: NetworkSummaryViewState | undefined;
  preferencesHydrated: boolean;
  networkMinScale: number;
  networkMaxScale: number;
  configuredResetScale: number;
  canvasDefaultShowInfoPanels: boolean;
  canvasDefaultShowSegmentNames: boolean;
  canvasDefaultShowSegmentLengths: boolean;
  canvasDefaultShowCableCallouts: boolean;
  canvasDefaultCalloutContentMode: NetworkCalloutContentMode;
  canvasDefaultShowGrid: boolean;
  canvasDefaultSnapToGrid: boolean;
  canvasDefaultLockEntityMovement: boolean;
  networkScale: number;
  networkOffset: { x: number; y: number };
  networkNodeCount: number;
  networkNodePositions: Record<NodeId, NodePosition>;
  networkViewWidth: number;
  networkViewHeight: number;
  showNetworkInfoPanels: boolean;
  showSegmentNames: boolean;
  showSegmentLengths: boolean;
  showCableCallouts: boolean;
  networkCalloutContentMode: NetworkCalloutContentMode;
  showNetworkGrid: boolean;
  snapNodesToGrid: boolean;
  lockEntityMovement: boolean;
  isPanningNetwork: boolean;
  setNetworkScale: (value: number) => void;
  setNetworkOffset: (value: { x: number; y: number }) => void;
  setShowNetworkInfoPanels: (value: boolean) => void;
  setShowSegmentNames: (value: boolean) => void;
  setShowSegmentLengths: (value: boolean) => void;
  setShowCableCallouts: (value: boolean) => void;
  setNetworkCalloutContentMode: (value: NetworkCalloutContentMode) => void;
  setShowNetworkGrid: (value: boolean) => void;
  setSnapNodesToGrid: (value: boolean) => void;
  setLockEntityMovement: (value: boolean) => void;
  dispatchAction: (action: SetNetworkSummaryViewStateAction, options?: { trackHistory?: boolean }) => void;
}

export function useNetworkSummaryViewStateSync(options: UseNetworkSummaryViewStateSyncOptions): void {
  const hasAppliedPerNetworkViewRestoreRef = useRef(false);
  const lastAppliedPerNetworkViewRestoreKeyRef = useRef<string | null>(null);
  const skipNextPerNetworkViewPersistRef = useRef(false);
  const {
    activeNetworkId,
    activeNetworkSummaryViewState,
    preferencesHydrated,
    networkMinScale,
    networkMaxScale,
    configuredResetScale,
    canvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentNames,
    canvasDefaultShowSegmentLengths,
    canvasDefaultShowCableCallouts,
    canvasDefaultCalloutContentMode,
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement,
    networkScale,
    networkOffset,
    networkNodeCount,
    networkNodePositions,
    networkViewWidth,
    networkViewHeight,
    showNetworkInfoPanels,
    showSegmentNames,
    showSegmentLengths,
    showCableCallouts,
    networkCalloutContentMode,
    showNetworkGrid,
    snapNodesToGrid,
    lockEntityMovement,
    isPanningNetwork,
    setNetworkScale,
    setNetworkOffset,
    setShowNetworkInfoPanels,
    setShowSegmentNames,
    setShowSegmentLengths,
    setShowCableCallouts,
    setNetworkCalloutContentMode,
    setShowNetworkGrid,
    setSnapNodesToGrid,
    setLockEntityMovement,
    dispatchAction
  } = options;
  const effectiveActiveNetworkSummaryViewState = activeNetworkSummaryViewState;
  const localViewSnapshotRef = useRef({
    networkScale,
    networkOffset,
    showNetworkInfoPanels,
    showSegmentNames,
    showSegmentLengths,
    showCableCallouts,
    networkCalloutContentMode,
    showNetworkGrid,
    snapNodesToGrid,
    lockEntityMovement
  });
  const activeNetworkSummaryViewStateSignature =
    effectiveActiveNetworkSummaryViewState === undefined
      ? "default"
      : [
          effectiveActiveNetworkSummaryViewState.scale,
          effectiveActiveNetworkSummaryViewState.offset.x,
          effectiveActiveNetworkSummaryViewState.offset.y,
          effectiveActiveNetworkSummaryViewState.showNetworkInfoPanels,
          effectiveActiveNetworkSummaryViewState.showSegmentNames,
          effectiveActiveNetworkSummaryViewState.showSegmentLengths,
          effectiveActiveNetworkSummaryViewState.showCableCallouts,
          effectiveActiveNetworkSummaryViewState.showNetworkGrid,
          effectiveActiveNetworkSummaryViewState.snapNodesToGrid,
          effectiveActiveNetworkSummaryViewState.lockEntityMovement
        ].join(":");

  const computedDefaultFitViewport = useMemo(() => {
    const positions = Object.values(networkNodePositions);
    if (positions.length < 2) {
      return null;
    }
    return computeNetworkFitViewportForPositions({
      positions,
      networkViewWidth,
      networkViewHeight,
      networkMinScale,
      networkMaxScale
    });
  }, [networkMaxScale, networkMinScale, networkNodePositions, networkViewHeight, networkViewWidth]);

  useEffect(() => {
    localViewSnapshotRef.current = {
      networkScale,
      networkOffset,
      showNetworkInfoPanels,
      showSegmentNames,
      showSegmentLengths,
      showCableCallouts,
      networkCalloutContentMode,
      showNetworkGrid,
      snapNodesToGrid,
      lockEntityMovement
    };
  }, [
    networkScale,
    networkOffset,
    showNetworkInfoPanels,
    showSegmentNames,
    showSegmentLengths,
    showCableCallouts,
    networkCalloutContentMode,
    showNetworkGrid,
    snapNodesToGrid,
    lockEntityMovement
  ]);

  useEffect(() => {
    if (!preferencesHydrated) {
      hasAppliedPerNetworkViewRestoreRef.current = false;
      lastAppliedPerNetworkViewRestoreKeyRef.current = null;
      skipNextPerNetworkViewPersistRef.current = false;
      return;
    }

    if (activeNetworkId === null) {
      hasAppliedPerNetworkViewRestoreRef.current = true;
      lastAppliedPerNetworkViewRestoreKeyRef.current = null;
      return;
    }

    const restoreKey = [
      activeNetworkId,
      activeNetworkSummaryViewStateSignature,
      configuredResetScale,
      canvasDefaultShowInfoPanels,
      canvasDefaultShowSegmentNames,
      canvasDefaultShowSegmentLengths,
      canvasDefaultShowCableCallouts,
      canvasDefaultCalloutContentMode,
      canvasDefaultShowGrid,
      canvasDefaultSnapToGrid,
      canvasDefaultLockEntityMovement
    ].join("|");
    if (hasAppliedPerNetworkViewRestoreRef.current && lastAppliedPerNetworkViewRestoreKeyRef.current === restoreKey) {
      return;
    }

    const defaultFitViewport = effectiveActiveNetworkSummaryViewState === undefined ? computedDefaultFitViewport : null;
    if (effectiveActiveNetworkSummaryViewState === undefined && networkNodeCount >= 2 && defaultFitViewport === null) {
      return;
    }

    const clampedFallbackScale = Math.max(networkMinScale, Math.min(networkMaxScale, configuredResetScale));
    const nextScaleRaw = effectiveActiveNetworkSummaryViewState?.scale ?? clampedFallbackScale;
    const nextScale =
      defaultFitViewport?.scale ??
      Math.max(networkMinScale, Math.min(networkMaxScale, Number.isFinite(nextScaleRaw) ? nextScaleRaw : clampedFallbackScale));
    const nextOffset = defaultFitViewport?.offset ?? effectiveActiveNetworkSummaryViewState?.offset ?? { x: 0, y: 0 };
    const nextShowInfoPanels = effectiveActiveNetworkSummaryViewState?.showNetworkInfoPanels ?? canvasDefaultShowInfoPanels;
    const nextShowSegmentNames = effectiveActiveNetworkSummaryViewState?.showSegmentNames ?? canvasDefaultShowSegmentNames;
    const nextShowSegmentLengths =
      effectiveActiveNetworkSummaryViewState?.showSegmentLengths ?? canvasDefaultShowSegmentLengths;
    const nextShowCableCallouts =
      effectiveActiveNetworkSummaryViewState?.showCableCallouts ?? canvasDefaultShowCableCallouts;
    const nextCalloutContentMode = canvasDefaultCalloutContentMode;
    const nextShowGrid = effectiveActiveNetworkSummaryViewState?.showNetworkGrid ?? canvasDefaultShowGrid;
    const nextSnapToGrid = effectiveActiveNetworkSummaryViewState?.snapNodesToGrid ?? canvasDefaultSnapToGrid;
    const nextLockEntityMovement =
      effectiveActiveNetworkSummaryViewState?.lockEntityMovement ?? canvasDefaultLockEntityMovement;
    const localView = localViewSnapshotRef.current;

    let didScheduleRestore = false;

    if (localView.networkScale !== nextScale) {
      didScheduleRestore = true;
      setNetworkScale(nextScale);
    }
    if (localView.networkOffset.x !== nextOffset.x || localView.networkOffset.y !== nextOffset.y) {
      didScheduleRestore = true;
      setNetworkOffset({ x: nextOffset.x, y: nextOffset.y });
    }
    if (localView.showNetworkInfoPanels !== nextShowInfoPanels) {
      didScheduleRestore = true;
      setShowNetworkInfoPanels(nextShowInfoPanels);
    }
    if (localView.showSegmentNames !== nextShowSegmentNames) {
      didScheduleRestore = true;
      setShowSegmentNames(nextShowSegmentNames);
    }
    if (localView.showSegmentLengths !== nextShowSegmentLengths) {
      didScheduleRestore = true;
      setShowSegmentLengths(nextShowSegmentLengths);
    }
    if (localView.showCableCallouts !== nextShowCableCallouts) {
      didScheduleRestore = true;
      setShowCableCallouts(nextShowCableCallouts);
    }
    if (localView.networkCalloutContentMode !== nextCalloutContentMode) {
      didScheduleRestore = true;
      setNetworkCalloutContentMode(nextCalloutContentMode);
    }
    if (localView.showNetworkGrid !== nextShowGrid) {
      didScheduleRestore = true;
      setShowNetworkGrid(nextShowGrid);
    }
    if (localView.snapNodesToGrid !== nextSnapToGrid) {
      didScheduleRestore = true;
      setSnapNodesToGrid(nextSnapToGrid);
    }
    if (localView.lockEntityMovement !== nextLockEntityMovement) {
      didScheduleRestore = true;
      setLockEntityMovement(nextLockEntityMovement);
    }

    skipNextPerNetworkViewPersistRef.current = didScheduleRestore;
    hasAppliedPerNetworkViewRestoreRef.current = true;
    lastAppliedPerNetworkViewRestoreKeyRef.current = restoreKey;
  }, [
    activeNetworkId,
    activeNetworkSummaryViewState,
    activeNetworkSummaryViewStateSignature,
    effectiveActiveNetworkSummaryViewState,
    preferencesHydrated,
    networkMinScale,
    networkMaxScale,
    configuredResetScale,
    networkNodeCount,
    computedDefaultFitViewport,
    canvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentNames,
    canvasDefaultShowSegmentLengths,
    canvasDefaultShowCableCallouts,
    canvasDefaultCalloutContentMode,
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement,
    setNetworkScale,
    setNetworkOffset,
    setShowNetworkInfoPanels,
    setShowSegmentNames,
    setShowSegmentLengths,
    setShowCableCallouts,
    setNetworkCalloutContentMode,
    setShowNetworkGrid,
    setSnapNodesToGrid,
    setLockEntityMovement
  ]);

  useEffect(() => {
    if (
      !preferencesHydrated ||
      activeNetworkId === null ||
      !hasAppliedPerNetworkViewRestoreRef.current ||
      isPanningNetwork
    ) {
      return;
    }

    if (skipNextPerNetworkViewPersistRef.current) {
      skipNextPerNetworkViewPersistRef.current = false;
      return;
    }

    const defaultFitViewport = effectiveActiveNetworkSummaryViewState === undefined ? computedDefaultFitViewport : null;
    if (effectiveActiveNetworkSummaryViewState === undefined && networkNodeCount >= 2 && defaultFitViewport === null) {
      return;
    }

    const clampedScale = Math.max(networkMinScale, Math.min(networkMaxScale, networkScale));
    const nextViewState: NetworkSummaryViewState = {
      scale: clampedScale,
      offset: {
        x: networkOffset.x,
        y: networkOffset.y
      },
      showNetworkInfoPanels: showNetworkInfoPanels,
      showSegmentNames: showSegmentNames,
      showSegmentLengths: showSegmentLengths,
      showCableCallouts: showCableCallouts,
      showNetworkGrid: showNetworkGrid,
      snapNodesToGrid: snapNodesToGrid,
      lockEntityMovement: lockEntityMovement
    };

    if (
      defaultFitViewport !== null &&
      isSameNetworkViewport(nextViewState, defaultFitViewport) &&
      nextViewState.showNetworkInfoPanels === canvasDefaultShowInfoPanels &&
      nextViewState.showSegmentNames === canvasDefaultShowSegmentNames &&
      nextViewState.showSegmentLengths === canvasDefaultShowSegmentLengths &&
      nextViewState.showCableCallouts === canvasDefaultShowCableCallouts &&
      nextViewState.showNetworkGrid === canvasDefaultShowGrid &&
      nextViewState.snapNodesToGrid === canvasDefaultSnapToGrid &&
      nextViewState.lockEntityMovement === canvasDefaultLockEntityMovement
    ) {
      return;
    }

    if (isSameNetworkSummaryViewState(effectiveActiveNetworkSummaryViewState, nextViewState)) {
      return;
    }

    dispatchAction(appActions.setNetworkSummaryViewState(activeNetworkId, nextViewState), {
      trackHistory: false
    });
  }, [
    activeNetworkId,
    activeNetworkSummaryViewState,
    effectiveActiveNetworkSummaryViewState,
    preferencesHydrated,
    networkMinScale,
    networkMaxScale,
    networkScale,
    networkOffset.x,
    networkOffset.y,
    networkNodeCount,
    computedDefaultFitViewport,
    canvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentNames,
    canvasDefaultShowSegmentLengths,
    canvasDefaultShowCableCallouts,
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement,
    showNetworkInfoPanels,
    showSegmentNames,
    showSegmentLengths,
    showCableCallouts,
    showNetworkGrid,
    snapNodesToGrid,
    lockEntityMovement,
    isPanningNetwork,
    dispatchAction
  ]);
}

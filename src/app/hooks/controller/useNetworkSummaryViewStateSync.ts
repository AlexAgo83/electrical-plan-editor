import { useEffect, useRef } from "react";
import { appActions, type NetworkSummaryViewState } from "../../../store";
import type { NetworkId } from "../../../core/entities";

type SetNetworkSummaryViewStateAction = ReturnType<typeof appActions.setNetworkSummaryViewState>;

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
  canvasDefaultShowGrid: boolean;
  canvasDefaultSnapToGrid: boolean;
  canvasDefaultLockEntityMovement: boolean;
  networkScale: number;
  networkOffset: { x: number; y: number };
  showNetworkInfoPanels: boolean;
  showSegmentNames: boolean;
  showSegmentLengths: boolean;
  showCableCallouts: boolean;
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
  setShowNetworkGrid: (value: boolean) => void;
  setSnapNodesToGrid: (value: boolean) => void;
  setLockEntityMovement: (value: boolean) => void;
  dispatchAction: (action: SetNetworkSummaryViewStateAction, options?: { trackHistory?: boolean }) => void;
}

export function useNetworkSummaryViewStateSync(options: UseNetworkSummaryViewStateSyncOptions): void {
  const hasAppliedPerNetworkViewRestoreRef = useRef(false);
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
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement,
    networkScale,
    networkOffset,
    showNetworkInfoPanels,
    showSegmentNames,
    showSegmentLengths,
    showCableCallouts,
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
    setShowNetworkGrid,
    setSnapNodesToGrid,
    setLockEntityMovement,
    dispatchAction
  } = options;
  const localViewSnapshotRef = useRef({
    networkScale,
    networkOffset,
    showNetworkInfoPanels,
    showSegmentNames,
    showSegmentLengths,
    showCableCallouts,
    showNetworkGrid,
    snapNodesToGrid,
    lockEntityMovement
  });

  useEffect(() => {
    localViewSnapshotRef.current = {
      networkScale,
      networkOffset,
      showNetworkInfoPanels,
      showSegmentNames,
      showSegmentLengths,
      showCableCallouts,
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
    showNetworkGrid,
    snapNodesToGrid,
    lockEntityMovement
  ]);

  useEffect(() => {
    hasAppliedPerNetworkViewRestoreRef.current = false;
    skipNextPerNetworkViewPersistRef.current = false;

    if (!preferencesHydrated) {
      return;
    }

    if (activeNetworkId === null) {
      hasAppliedPerNetworkViewRestoreRef.current = true;
      return;
    }

    const clampedFallbackScale = Math.max(networkMinScale, Math.min(networkMaxScale, configuredResetScale));
    const nextScaleRaw = activeNetworkSummaryViewState?.scale ?? clampedFallbackScale;
    const nextScale = Math.max(
      networkMinScale,
      Math.min(networkMaxScale, Number.isFinite(nextScaleRaw) ? nextScaleRaw : clampedFallbackScale)
    );
    const nextOffset = activeNetworkSummaryViewState?.offset ?? { x: 0, y: 0 };
    const nextShowInfoPanels = activeNetworkSummaryViewState?.showNetworkInfoPanels ?? canvasDefaultShowInfoPanels;
    const nextShowSegmentNames = activeNetworkSummaryViewState?.showSegmentNames ?? canvasDefaultShowSegmentNames;
    const nextShowSegmentLengths =
      activeNetworkSummaryViewState?.showSegmentLengths ?? canvasDefaultShowSegmentLengths;
    const nextShowCableCallouts =
      activeNetworkSummaryViewState?.showCableCallouts ?? canvasDefaultShowCableCallouts;
    const nextShowGrid = activeNetworkSummaryViewState?.showNetworkGrid ?? canvasDefaultShowGrid;
    const nextSnapToGrid = activeNetworkSummaryViewState?.snapNodesToGrid ?? canvasDefaultSnapToGrid;
    const nextLockEntityMovement =
      activeNetworkSummaryViewState?.lockEntityMovement ?? canvasDefaultLockEntityMovement;
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
  }, [
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
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement,
    setNetworkScale,
    setNetworkOffset,
    setShowNetworkInfoPanels,
    setShowSegmentNames,
    setShowSegmentLengths,
    setShowCableCallouts,
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

    if (isSameNetworkSummaryViewState(activeNetworkSummaryViewState, nextViewState)) {
      return;
    }

    dispatchAction(appActions.setNetworkSummaryViewState(activeNetworkId, nextViewState), {
      trackHistory: false
    });
  }, [
    activeNetworkId,
    activeNetworkSummaryViewState,
    preferencesHydrated,
    networkMinScale,
    networkMaxScale,
    networkScale,
    networkOffset.x,
    networkOffset.y,
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

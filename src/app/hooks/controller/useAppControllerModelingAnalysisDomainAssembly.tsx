import { appActions } from "../../../store";
import type { SubScreenId } from "../../types/app-controller";
import type { OnboardingStepId } from "../../lib/onboarding";
import { useAppControllerModelingAnalysisScreenDomains } from "./useAppControllerModelingAnalysisScreenDomains";

type ScreenChangeTarget = "home" | "networkScope" | "harnessAssembly" | "modeling" | "analysis" | "statistics" | "validation" | "settings";
type OnboardingTargetOverride = {
  screen: "modeling" | "networkScope" | "settings";
  subScreen?: SubScreenId;
  panelSelector: string;
  panelLabel: string;
};
type ModelingAnalysisScreenDomainsParams = Parameters<typeof useAppControllerModelingAnalysisScreenDomains>[0];

interface UseAppControllerModelingAnalysisDomainAssemblyParams
  extends Omit<
    ModelingAnalysisScreenDomainsParams,
    | "onboardingHelp"
    | "openCatalogSubScreen"
    | "onSelectConnector"
    | "onSelectSplice"
    | "onSelectNode"
    | "onSelectSegment"
    | "onSelectWire"
    | "onGoToSegmentFromAnalysis"
    | "onGoToWireFromAnalysis"
    | "onOpenSegmentFromAnalysisTable"
    | "onOpenWireFromAnalysisTable"
    | "onOpenConnectorFromAnalysisTable"
    | "onOpenSpliceFromAnalysisTable"
  > {
  setActiveSubScreen: (subScreen: SubScreenId) => void;
  handleWorkspaceScreenChange: (targetScreen: ScreenChangeTarget) => void;
  openSingleStepOnboarding: (stepId: OnboardingStepId, targetOverride?: OnboardingTargetOverride) => void;
  markSelectionPanelsFromTable: () => void;
}

export function useAppControllerModelingAnalysisDomainAssembly({
  dispatchAction,
  setActiveSubScreen,
  handleWorkspaceScreenChange,
  openSingleStepOnboarding,
  markSelectionPanelsFromTable,
  ...domains
}: UseAppControllerModelingAnalysisDomainAssemblyParams) {
  return useAppControllerModelingAnalysisScreenDomains({
    ...domains,
    dispatchAction,
    onboardingHelp: {
      openCatalogStep: () => openSingleStepOnboarding("catalog"),
      openConnectorStep: () => openSingleStepOnboarding("connectorSpliceLibrary"),
      openSpliceStep: () =>
        openSingleStepOnboarding("connectorSpliceLibrary", {
          screen: "modeling",
          subScreen: "splice",
          panelSelector: '[data-onboarding-panel="modeling-splices"]',
          panelLabel: "Splices"
        }),
      openNodeStep: () => openSingleStepOnboarding("nodes"),
      openSegmentStep: () => openSingleStepOnboarding("segments"),
      openWireStep: () => openSingleStepOnboarding("wires")
    },
    markSelectionPanelsFromTable,
    setActiveSubScreen,
    openCatalogSubScreen: () => {
      handleWorkspaceScreenChange("modeling");
      setActiveSubScreen("catalog");
    },
    onSelectConnector: (connectorId) => {
      markSelectionPanelsFromTable();
      setActiveSubScreen("connector");
      dispatchAction(
        appActions.select({
          kind: "connector",
          id: connectorId
        })
      );
    },
    onSelectSplice: (spliceId) => {
      markSelectionPanelsFromTable();
      setActiveSubScreen("splice");
      dispatchAction(
        appActions.select({
          kind: "splice",
          id: spliceId
        })
      );
    },
    onSelectNode: (nodeId) => {
      markSelectionPanelsFromTable();
      setActiveSubScreen("node");
      dispatchAction(
        appActions.select({
          kind: "node",
          id: nodeId
        })
      );
    },
    onSelectSegment: (segmentId) => {
      markSelectionPanelsFromTable();
      setActiveSubScreen("segment");
      dispatchAction(
        appActions.select({
          kind: "segment",
          id: segmentId
        })
      );
    },
    onSelectWire: (wireId) => {
      markSelectionPanelsFromTable();
      setActiveSubScreen("wire");
      dispatchAction(
        appActions.select({
          kind: "wire",
          id: wireId
        })
      );
    },
    onGoToWireFromAnalysis: (wireId) => {
      markSelectionPanelsFromTable();
      setActiveSubScreen("wire");
      dispatchAction(
        appActions.select({
          kind: "wire",
          id: wireId
        })
      );
    },
    onOpenSegmentFromAnalysisTable: (segmentId) => {
      const segment = domains.store.getState().segments.byId[segmentId];
      if (segment === undefined) {
        return;
      }
      markSelectionPanelsFromTable();
      handleWorkspaceScreenChange("modeling");
      setActiveSubScreen("segment");
      domains.modelingHandlers.segment.startSegmentEdit(segment);
    },
    onOpenWireFromAnalysisTable: (wireId) => {
      const wire = domains.store.getState().wires.byId[wireId];
      if (wire === undefined) {
        return;
      }
      markSelectionPanelsFromTable();
      handleWorkspaceScreenChange("modeling");
      setActiveSubScreen("wire");
      domains.modelingHandlers.wire.startWireEdit(wire);
    },
    onOpenConnectorFromAnalysisTable: (connectorId) => {
      const connector = domains.store.getState().connectors.byId[connectorId];
      if (connector === undefined) {
        return;
      }
      markSelectionPanelsFromTable();
      handleWorkspaceScreenChange("modeling");
      setActiveSubScreen("connector");
      domains.modelingHandlers.connector.startConnectorEdit(connector);
    },
    onOpenSpliceFromAnalysisTable: (spliceId) => {
      const splice = domains.store.getState().splices.byId[spliceId];
      if (splice === undefined) {
        return;
      }
      markSelectionPanelsFromTable();
      handleWorkspaceScreenChange("modeling");
      setActiveSubScreen("splice");
      domains.modelingHandlers.splice.startSpliceEdit(splice);
    },
    onGoToSegmentFromAnalysis: (segmentId) => {
      markSelectionPanelsFromTable();
      setActiveSubScreen("segment");
      dispatchAction(
        appActions.select({
          kind: "segment",
          id: segmentId
        })
      );
    }
  });
}

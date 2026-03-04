import { appActions } from "../../../store";
import type { SubScreenId } from "../../types/app-controller";
import type { OnboardingStepId } from "../../lib/onboarding";
import { useAppControllerModelingAnalysisScreenDomains } from "./useAppControllerModelingAnalysisScreenDomains";

type ScreenChangeTarget = "home" | "networkScope" | "modeling" | "analysis" | "validation" | "settings";
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
    | "onGoToWireFromAnalysis"
  > {
  dispatchAction: (action: ReturnType<typeof appActions.select>) => void;
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
    openCatalogSubScreen: () => {
      handleWorkspaceScreenChange("modeling");
      setActiveSubScreen("catalog");
    },
    onSelectConnector: (connectorId) => {
      markSelectionPanelsFromTable();
      dispatchAction(
        appActions.select({
          kind: "connector",
          id: connectorId
        })
      );
    },
    onSelectSplice: (spliceId) => {
      markSelectionPanelsFromTable();
      dispatchAction(
        appActions.select({
          kind: "splice",
          id: spliceId
        })
      );
    },
    onSelectNode: (nodeId) => {
      markSelectionPanelsFromTable();
      dispatchAction(
        appActions.select({
          kind: "node",
          id: nodeId
        })
      );
    },
    onSelectSegment: (segmentId) => {
      markSelectionPanelsFromTable();
      dispatchAction(
        appActions.select({
          kind: "segment",
          id: segmentId
        })
      );
    },
    onSelectWire: (wireId) => {
      markSelectionPanelsFromTable();
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
    }
  });
}

import { useCallback, useEffect, useRef, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { formatIsoToLocalDateInput } from "../../core/networkMetadata";
import type { Network, NetworkId } from "../../core/entities";
import type { AppStore } from "../../store";
import {
  EMPTY_NETWORK_PLAN_PARTIES_FORM_VALUES,
  toNetworkPlanPartiesFormValues,
  type NetworkPlanPartiesFormValues
} from "../lib/networkFormDraft";
import type { NetworkFocusRequest, NetworkFormMode } from "./useNetworkScopeFormState";

interface UseNetworkScopeFormOrchestrationParams {
  store: AppStore;
  networks: Network[];
  activeNetworkId: NetworkId | null;
  isNetworkScopeScreen: boolean;
  networksById: Record<NetworkId, Network>;
  setNewNetworkName: Dispatch<SetStateAction<string>>;
  setNewNetworkTechnicalId: Dispatch<SetStateAction<string>>;
  setNewNetworkCreatedAtDate: Dispatch<SetStateAction<string>>;
  setNewNetworkDescription: Dispatch<SetStateAction<string>>;
  setNewNetworkAuthor: Dispatch<SetStateAction<string>>;
  setNewNetworkVoltageV: Dispatch<SetStateAction<string>>;
  setNewNetworkProjectCode: Dispatch<SetStateAction<string>>;
  setNewNetworkEntityPrefix: Dispatch<SetStateAction<string>>;
  setNewNetworkLogoUrl: Dispatch<SetStateAction<string>>;
  setNewNetworkExportNotes: Dispatch<SetStateAction<string>>;
  setNewNetworkPlanRevision: Dispatch<SetStateAction<string>>;
  setNewNetworkPlanIssueDate: Dispatch<SetStateAction<string>>;
  setNewNetworkPlanParties: Dispatch<SetStateAction<NetworkPlanPartiesFormValues>>;
  setNetworkFormError: Dispatch<SetStateAction<string | null>>;
  networkFormMode: NetworkFormMode;
  setNetworkFormMode: Dispatch<SetStateAction<NetworkFormMode>>;
  networkFormTargetId: NetworkId | null;
  setNetworkFormTargetId: Dispatch<SetStateAction<NetworkId | null>>;
  setNetworkFocusRequest: Dispatch<SetStateAction<NetworkFocusRequest>>;
  handleCreateNetwork: (event: FormEvent<HTMLFormElement>) => void;
  handleUpdateActiveNetwork: (event: FormEvent<HTMLFormElement>, targetNetworkId: NetworkId | null) => void;
}

export function useNetworkScopeFormOrchestration({
  store,
  networks,
  activeNetworkId,
  isNetworkScopeScreen,
  networksById,
  setNewNetworkName,
  setNewNetworkTechnicalId,
  setNewNetworkCreatedAtDate,
  setNewNetworkDescription,
  setNewNetworkAuthor,
  setNewNetworkVoltageV,
  setNewNetworkProjectCode,
  setNewNetworkEntityPrefix,
  setNewNetworkLogoUrl,
  setNewNetworkExportNotes,
  setNewNetworkPlanRevision,
  setNewNetworkPlanIssueDate,
  setNewNetworkPlanParties,
  setNetworkFormError,
  networkFormMode,
  setNetworkFormMode,
  networkFormTargetId,
  setNetworkFormTargetId,
  setNetworkFocusRequest,
  handleCreateNetwork,
  handleUpdateActiveNetwork
}: UseNetworkScopeFormOrchestrationParams) {
  void activeNetworkId;
  const wasNetworkScopeScreenRef = useRef(false);
  const pendingEditOnEnterRef = useRef<NetworkId | null>(null);
  const buildDefaultCreatedAtInput = useCallback(() => formatIsoToLocalDateInput(new Date().toISOString()), []);
  const handleOpenCreateNetworkForm = useCallback(() => {
    setNetworkFormMode("create");
    setNetworkFormTargetId(null);
    setNewNetworkName("");
    setNewNetworkTechnicalId("");
    setNewNetworkCreatedAtDate(buildDefaultCreatedAtInput());
    setNewNetworkDescription("");
    setNewNetworkAuthor("");
    setNewNetworkVoltageV("");
    setNewNetworkProjectCode("");
    setNewNetworkEntityPrefix("");
    setNewNetworkLogoUrl("");
    setNewNetworkExportNotes("");
    setNewNetworkPlanRevision("");
    setNewNetworkPlanIssueDate("");
    setNewNetworkPlanParties(EMPTY_NETWORK_PLAN_PARTIES_FORM_VALUES);
    setNetworkFormError(null);
  }, [
    buildDefaultCreatedAtInput,
    setNetworkFormError,
    setNetworkFormMode,
    setNetworkFormTargetId,
    setNewNetworkAuthor,
    setNewNetworkVoltageV,
    setNewNetworkCreatedAtDate,
    setNewNetworkDescription,
    setNewNetworkExportNotes,
    setNewNetworkPlanRevision,
    setNewNetworkPlanIssueDate,
    setNewNetworkPlanParties,
    setNewNetworkLogoUrl,
    setNewNetworkName,
    setNewNetworkProjectCode,
    setNewNetworkEntityPrefix,
    setNewNetworkTechnicalId
  ]);

  const handleOpenEditNetworkForm = useCallback(
    (networkId: NetworkId) => {
      const targetNetwork = networks.find((network) => network.id === networkId);
      if (targetNetwork === undefined) {
        return;
      }

      setNetworkFormMode("edit");
      setNetworkFormTargetId(targetNetwork.id);
      setNewNetworkName(targetNetwork.name);
      setNewNetworkTechnicalId(targetNetwork.technicalId);
      setNewNetworkCreatedAtDate(formatIsoToLocalDateInput(targetNetwork.createdAt));
      setNewNetworkDescription(targetNetwork.description ?? "");
      setNewNetworkAuthor(targetNetwork.author ?? "");
      setNewNetworkVoltageV(targetNetwork.voltageV === undefined ? "" : String(targetNetwork.voltageV));
      setNewNetworkProjectCode(targetNetwork.projectCode ?? "");
      setNewNetworkEntityPrefix(targetNetwork.entityPrefix ?? "");
      setNewNetworkLogoUrl(targetNetwork.logoUrl ?? "");
      setNewNetworkExportNotes(targetNetwork.exportNotes ?? "");
      setNewNetworkPlanRevision(targetNetwork.planRevision ?? "");
      setNewNetworkPlanIssueDate(targetNetwork.planIssueDate ?? "");
      setNewNetworkPlanParties(toNetworkPlanPartiesFormValues(targetNetwork));
      setNetworkFormError(null);
    },
    [
      networks,
      setNetworkFormError,
      setNetworkFormMode,
      setNetworkFormTargetId,
      setNewNetworkAuthor,
      setNewNetworkVoltageV,
      setNewNetworkCreatedAtDate,
      setNewNetworkDescription,
      setNewNetworkExportNotes,
      setNewNetworkPlanRevision,
      setNewNetworkPlanIssueDate,
      setNewNetworkPlanParties,
      setNewNetworkLogoUrl,
      setNewNetworkName,
      setNewNetworkProjectCode,
      setNewNetworkEntityPrefix,
      setNewNetworkTechnicalId
    ]
  );

  /**
   * Opens the edit form for a network from another screen: the request survives the
   * Network Scope entry reset, which otherwise always starts with no form open.
   */
  const handleOpenEditNetworkFormOnEnter = useCallback(
    (networkId: NetworkId) => {
      setNetworkFocusRequest((current) => ({ id: networkId, token: current.token + 1, openEdit: true }));
      if (wasNetworkScopeScreenRef.current) {
        handleOpenEditNetworkForm(networkId);
        return;
      }
      pendingEditOnEnterRef.current = networkId;
    },
    [handleOpenEditNetworkForm, setNetworkFocusRequest]
  );

  const handleCloseNetworkForm = useCallback(() => {
    setNetworkFormMode(null);
    setNetworkFormTargetId(null);
    setNetworkFormError(null);
  }, [setNetworkFormError, setNetworkFormMode, setNetworkFormTargetId]);

  const handleSubmitNetworkForm = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      if (networkFormMode === "edit") {
        handleUpdateActiveNetwork(event, networkFormTargetId);
        if (networkFormTargetId !== null && store.getState().networks.byId[networkFormTargetId] !== undefined) {
          setNetworkFocusRequest((current) => ({
            id: networkFormTargetId,
            token: current.token + 1
          }));
        }
        return;
      }

      const networkIdsBefore = new Set(store.getState().networks.allIds);
      handleCreateNetwork(event);
      const createdNetworkId = store.getState().networks.allIds.find((networkId) => !networkIdsBefore.has(networkId)) ?? null;
      if (createdNetworkId !== null) {
        setNetworkFocusRequest((current) => ({
          id: createdNetworkId,
          token: current.token + 1
        }));
      }
    },
    [handleCreateNetwork, handleUpdateActiveNetwork, networkFormMode, networkFormTargetId, setNetworkFocusRequest, store]
  );

  useEffect(() => {
    if (networkFormMode !== "edit") {
      return;
    }

    if (networkFormTargetId === null) {
      setNetworkFormMode(null);
      return;
    }

    const targetNetwork = networksById[networkFormTargetId];
    if (targetNetwork === undefined) {
      setNetworkFormMode(null);
      setNetworkFormTargetId(null);
      return;
    }

    setNewNetworkName(targetNetwork.name);
    setNewNetworkTechnicalId(targetNetwork.technicalId);
    setNewNetworkCreatedAtDate(formatIsoToLocalDateInput(targetNetwork.createdAt));
    setNewNetworkDescription(targetNetwork.description ?? "");
    setNewNetworkAuthor(targetNetwork.author ?? "");
    setNewNetworkVoltageV(targetNetwork.voltageV === undefined ? "" : String(targetNetwork.voltageV));
    setNewNetworkProjectCode(targetNetwork.projectCode ?? "");
    setNewNetworkEntityPrefix(targetNetwork.entityPrefix ?? "");
    setNewNetworkLogoUrl(targetNetwork.logoUrl ?? "");
    setNewNetworkExportNotes(targetNetwork.exportNotes ?? "");
    setNewNetworkPlanRevision(targetNetwork.planRevision ?? "");
    setNewNetworkPlanIssueDate(targetNetwork.planIssueDate ?? "");
    setNewNetworkPlanParties(toNetworkPlanPartiesFormValues(targetNetwork));
  }, [
    networkFormMode,
    networkFormTargetId,
    networksById,
    setNetworkFormMode,
    setNetworkFormTargetId,
    setNewNetworkAuthor,
    setNewNetworkVoltageV,
    setNewNetworkCreatedAtDate,
    setNewNetworkDescription,
    setNewNetworkExportNotes,
    setNewNetworkPlanRevision,
    setNewNetworkPlanIssueDate,
    setNewNetworkPlanParties,
    setNewNetworkLogoUrl,
    setNewNetworkName,
    setNewNetworkProjectCode,
    setNewNetworkEntityPrefix,
    setNewNetworkTechnicalId
  ]);

  useEffect(() => {
    const wasVisible = wasNetworkScopeScreenRef.current;
    wasNetworkScopeScreenRef.current = isNetworkScopeScreen;

    if (!isNetworkScopeScreen || wasVisible) {
      return;
    }

    const pendingEditNetworkId = pendingEditOnEnterRef.current;
    pendingEditOnEnterRef.current = null;
    if (pendingEditNetworkId !== null) {
      handleOpenEditNetworkForm(pendingEditNetworkId);
      return;
    }

    // Entering Network Scope should otherwise always start with no form open.
    setNetworkFormMode(null);
    setNetworkFormTargetId(null);
    setNetworkFormError(null);
  }, [handleOpenEditNetworkForm, isNetworkScopeScreen, networkFormMode, setNetworkFormError, setNetworkFormMode, setNetworkFormTargetId]);

  return {
    handleOpenCreateNetworkForm,
    handleOpenEditNetworkForm,
    handleOpenEditNetworkFormOnEnter,
    handleCloseNetworkForm,
    handleSubmitNetworkForm
  };
}

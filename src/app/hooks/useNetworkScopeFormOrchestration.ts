import { useCallback, useEffect, useRef, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { formatIsoToLocalDateInput } from "../../core/networkMetadata";
import type { Network, NetworkId } from "../../core/entities";
import type { AppStore } from "../../store";
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
  setNewNetworkProjectCode: Dispatch<SetStateAction<string>>;
  setNewNetworkLogoUrl: Dispatch<SetStateAction<string>>;
  setNewNetworkExportNotes: Dispatch<SetStateAction<string>>;
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
  setNewNetworkProjectCode,
  setNewNetworkLogoUrl,
  setNewNetworkExportNotes,
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
  const buildDefaultCreatedAtInput = useCallback(() => formatIsoToLocalDateInput(new Date().toISOString()), []);
  const handleOpenCreateNetworkForm = useCallback(() => {
    setNetworkFormMode("create");
    setNetworkFormTargetId(null);
    setNewNetworkName("");
    setNewNetworkTechnicalId("");
    setNewNetworkCreatedAtDate(buildDefaultCreatedAtInput());
    setNewNetworkDescription("");
    setNewNetworkAuthor("");
    setNewNetworkProjectCode("");
    setNewNetworkLogoUrl("");
    setNewNetworkExportNotes("");
    setNetworkFormError(null);
  }, [
    buildDefaultCreatedAtInput,
    setNetworkFormError,
    setNetworkFormMode,
    setNetworkFormTargetId,
    setNewNetworkAuthor,
    setNewNetworkCreatedAtDate,
    setNewNetworkDescription,
    setNewNetworkExportNotes,
    setNewNetworkLogoUrl,
    setNewNetworkName,
    setNewNetworkProjectCode,
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
      setNewNetworkProjectCode(targetNetwork.projectCode ?? "");
      setNewNetworkLogoUrl(targetNetwork.logoUrl ?? "");
      setNewNetworkExportNotes(targetNetwork.exportNotes ?? "");
      setNetworkFormError(null);
    },
    [
      networks,
      setNetworkFormError,
      setNetworkFormMode,
      setNetworkFormTargetId,
      setNewNetworkAuthor,
      setNewNetworkCreatedAtDate,
      setNewNetworkDescription,
      setNewNetworkExportNotes,
      setNewNetworkLogoUrl,
      setNewNetworkName,
      setNewNetworkProjectCode,
      setNewNetworkTechnicalId
    ]
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
    setNewNetworkProjectCode(targetNetwork.projectCode ?? "");
    setNewNetworkLogoUrl(targetNetwork.logoUrl ?? "");
    setNewNetworkExportNotes(targetNetwork.exportNotes ?? "");
  }, [
    networkFormMode,
    networkFormTargetId,
    networksById,
    setNetworkFormMode,
    setNetworkFormTargetId,
    setNewNetworkAuthor,
    setNewNetworkCreatedAtDate,
    setNewNetworkDescription,
    setNewNetworkExportNotes,
    setNewNetworkLogoUrl,
    setNewNetworkName,
    setNewNetworkProjectCode,
    setNewNetworkTechnicalId
  ]);

  useEffect(() => {
    const wasVisible = wasNetworkScopeScreenRef.current;
    wasNetworkScopeScreenRef.current = isNetworkScopeScreen;

    if (!isNetworkScopeScreen || wasVisible) {
      return;
    }

    // Entering Network Scope should always start with no form open.
    setNetworkFormMode(null);
    setNetworkFormTargetId(null);
    setNetworkFormError(null);
  }, [isNetworkScopeScreen, networkFormMode, setNetworkFormError, setNetworkFormMode, setNetworkFormTargetId]);

  return {
    handleOpenCreateNetworkForm,
    handleOpenEditNetworkForm,
    handleCloseNetworkForm,
    handleSubmitNetworkForm
  };
}

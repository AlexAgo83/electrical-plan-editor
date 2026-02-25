import { useCallback, useEffect, type Dispatch, type FormEvent, type SetStateAction } from "react";
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
  setNewNetworkDescription: Dispatch<SetStateAction<string>>;
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
  setNewNetworkDescription,
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
  void isNetworkScopeScreen;
  const handleOpenCreateNetworkForm = useCallback(() => {
    setNetworkFormMode("create");
    setNetworkFormTargetId(null);
    setNewNetworkName("");
    setNewNetworkTechnicalId("");
    setNewNetworkDescription("");
    setNetworkFormError(null);
  }, [setNetworkFormError, setNetworkFormMode, setNetworkFormTargetId, setNewNetworkDescription, setNewNetworkName, setNewNetworkTechnicalId]);

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
      setNewNetworkDescription(targetNetwork.description ?? "");
      setNetworkFormError(null);
    },
    [networks, setNetworkFormError, setNetworkFormMode, setNetworkFormTargetId, setNewNetworkDescription, setNewNetworkName, setNewNetworkTechnicalId]
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
    setNewNetworkDescription(targetNetwork.description ?? "");
  }, [networkFormMode, networkFormTargetId, networksById, setNetworkFormMode, setNetworkFormTargetId, setNewNetworkDescription, setNewNetworkName, setNewNetworkTechnicalId]);

  return {
    handleOpenCreateNetworkForm,
    handleOpenEditNetworkForm,
    handleCloseNetworkForm,
    handleSubmitNetworkForm
  };
}

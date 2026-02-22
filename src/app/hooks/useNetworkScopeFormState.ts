import { useState } from "react";
import type { NetworkId } from "../../core/entities";

export type NetworkFormMode = "create" | "edit" | null;

export interface NetworkFocusRequest {
  id: NetworkId | null;
  token: number;
}

export function useNetworkScopeFormState() {
  const [newNetworkName, setNewNetworkName] = useState("");
  const [newNetworkTechnicalId, setNewNetworkTechnicalId] = useState("");
  const [newNetworkDescription, setNewNetworkDescription] = useState("");
  const [networkFormError, setNetworkFormError] = useState<string | null>(null);
  const [networkFormMode, setNetworkFormMode] = useState<NetworkFormMode>(null);
  const [networkFormTargetId, setNetworkFormTargetId] = useState<NetworkId | null>(null);
  const [networkFocusRequest, setNetworkFocusRequest] = useState<NetworkFocusRequest>({
    id: null,
    token: 0
  });

  return {
    newNetworkName,
    setNewNetworkName,
    newNetworkTechnicalId,
    setNewNetworkTechnicalId,
    newNetworkDescription,
    setNewNetworkDescription,
    networkFormError,
    setNetworkFormError,
    networkFormMode,
    setNetworkFormMode,
    networkFormTargetId,
    setNetworkFormTargetId,
    networkFocusRequest,
    setNetworkFocusRequest
  };
}

export type NetworkScopeFormStateModel = ReturnType<typeof useNetworkScopeFormState>;

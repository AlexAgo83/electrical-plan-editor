import { createContext, useContext } from "react";
import type { AppStore } from "../../../store";
import type { AppControllerModelingHandlersOrchestrator } from "../../hooks/controller/useAppControllerModelingHandlersOrchestrator";

export type ModelingDispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

export const ModelingDispatchContext = createContext<ModelingDispatchAction | null>(null);
export const ConnectorHandlersContext = createContext<AppControllerModelingHandlersOrchestrator["connector"] | null>(null);
export const SegmentHandlersContext = createContext<AppControllerModelingHandlersOrchestrator["segment"] | null>(null);
export const WireHandlersContext = createContext<AppControllerModelingHandlersOrchestrator["wire"] | null>(null);

function requireContextValue<T>(value: T | null, label: string): T {
  if (value === null) {
    throw new Error(`${label} is only available inside <ModelingController>.`);
  }

  return value;
}

export function useModelingDispatchAction(): ModelingDispatchAction {
  return requireContextValue(useContext(ModelingDispatchContext), "Modeling dispatch context");
}

export function useConnectorHandlersContext(): AppControllerModelingHandlersOrchestrator["connector"] {
  return requireContextValue(useContext(ConnectorHandlersContext), "Connector handlers context");
}

export function useSegmentHandlersContext(): AppControllerModelingHandlersOrchestrator["segment"] {
  return requireContextValue(useContext(SegmentHandlersContext), "Segment handlers context");
}

export function useWireHandlersContext(): AppControllerModelingHandlersOrchestrator["wire"] {
  return requireContextValue(useContext(WireHandlersContext), "Wire handlers context");
}

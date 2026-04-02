import { useMemo, type ReactElement, type ReactNode } from "react";
import type { AppControllerModelingHandlersOrchestrator } from "../../hooks/controller/useAppControllerModelingHandlersOrchestrator";
import {
  ConnectorHandlersContext,
  ModelingDispatchContext,
  SegmentHandlersContext,
  WireHandlersContext,
  type ModelingDispatchAction
} from "./ModelingController.context";

interface ModelingControllerProps {
  dispatchAction: ModelingDispatchAction;
  connectorHandlers: AppControllerModelingHandlersOrchestrator["connector"];
  segmentHandlers: AppControllerModelingHandlersOrchestrator["segment"];
  wireHandlers: AppControllerModelingHandlersOrchestrator["wire"];
  children: ReactNode;
}

export function ModelingController({
  dispatchAction,
  connectorHandlers,
  segmentHandlers,
  wireHandlers,
  children
}: ModelingControllerProps): ReactElement {
  const dispatchValue = useMemo(() => dispatchAction, [dispatchAction]);
  const connectorHandlersValue = useMemo(() => connectorHandlers, [connectorHandlers]);
  const segmentHandlersValue = useMemo(() => segmentHandlers, [segmentHandlers]);
  const wireHandlersValue = useMemo(() => wireHandlers, [wireHandlers]);

  return (
    <ModelingDispatchContext.Provider value={dispatchValue}>
      <ConnectorHandlersContext.Provider value={connectorHandlersValue}>
        <SegmentHandlersContext.Provider value={segmentHandlersValue}>
          <WireHandlersContext.Provider value={wireHandlersValue}>{children}</WireHandlersContext.Provider>
        </SegmentHandlersContext.Provider>
      </ConnectorHandlersContext.Provider>
    </ModelingDispatchContext.Provider>
  );
}

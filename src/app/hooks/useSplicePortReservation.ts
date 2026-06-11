import { type FormEvent } from "react";
import type { SpliceId } from "../../core/entities";
import { appActions } from "../../store";
import type { DispatchAction } from "./spliceHandlerTypes";

export interface UseSplicePortReservationParams {
  dispatchAction: DispatchAction;
  selectedSpliceId: SpliceId | null;
  portIndexInput: string;
  spliceOccupantRefInput: string;
}

export interface SplicePortReservation {
  handleReservePort: (event: FormEvent<HTMLFormElement>) => void;
  handleReleasePort: (portIndex: number) => void;
}

/**
 * Owns manual splice port occupancy for the currently selected splice: reserving
 * a port from the form input and releasing an occupied port by index.
 */
export function useSplicePortReservation({
  dispatchAction,
  selectedSpliceId,
  portIndexInput,
  spliceOccupantRefInput
}: UseSplicePortReservationParams): SplicePortReservation {
  function handleReservePort(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (selectedSpliceId === null) {
      return;
    }

    const portIndex = Math.max(0, Math.trunc(Number(portIndexInput)));
    dispatchAction(appActions.occupySplicePort(selectedSpliceId, portIndex, spliceOccupantRefInput));
  }

  function handleReleasePort(portIndex: number): void {
    if (selectedSpliceId === null) {
      return;
    }

    dispatchAction(appActions.releaseSplicePort(selectedSpliceId, portIndex));
  }

  return { handleReservePort, handleReleasePort };
}

import type { AppStore } from "../../store";
import type { CatalogItemId, NodeId, SegmentId, SpliceId } from "../../core/entities";
import type { ConfirmDialogRequest } from "../types/confirm-dialog";
import type { ToastNotificationVariant } from "./useToastNotifications";
import type { SplicePortMode } from "../../core/splicePortMode";

export type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

export type NotifyToast = (title: string, options?: { message?: string; variant?: ToastNotificationVariant }) => void;

export interface UseSpliceHandlersParams {
  store: AppStore;
  dispatchAction: DispatchAction;
  confirmAction: (request: ConfirmDialogRequest) => Promise<boolean>;
  notifyToast: NotifyToast;
  spliceFormMode: "idle" | "create" | "edit";
  setSpliceFormMode: (mode: "idle" | "create" | "edit") => void;
  spliceEditAfterCreate: boolean;
  setSpliceEditAfterCreate: (value: boolean) => void;
  editingSpliceId: SpliceId | null;
  setEditingSpliceId: (id: SpliceId | null) => void;
  spliceName: string;
  setSpliceName: (value: string) => void;
  spliceTechnicalId: string;
  setSpliceTechnicalId: (value: string) => void;
  spliceCatalogItemId: string;
  setSpliceCatalogItemId: (value: string) => void;
  splicePortMode: SplicePortMode;
  setSplicePortMode: (value: SplicePortMode) => void;
  spliceSideInverted: boolean;
  setSpliceSideInverted: (value: boolean) => void;
  spliceManufacturerReference: string;
  setSpliceManufacturerReference: (value: string) => void;
  spliceAutoCreateLinkedNode: boolean;
  setSpliceAutoCreateLinkedNode: (value: boolean) => void;
  splicePlacementSegmentId: string;
  setSplicePlacementSegmentId: (value: string) => void;
  splicePlacementFromNodeId: string;
  setSplicePlacementFromNodeId: (value: string) => void;
  splicePlacementOffsetMm: string;
  setSplicePlacementOffsetMm: (value: string) => void;
  defaultAutoCreateLinkedNodes: boolean;
  portCount: string;
  setPortCount: (value: string) => void;
  setSpliceFormInfo: (value: string | null) => void;
  setSpliceFormError: (value: string | null) => void;
  selectedSpliceId: SpliceId | null;
  portIndexInput: string;
  spliceOccupantRefInput: string;
}

export function toCatalogItemId(raw: string): CatalogItemId | null {
  return raw.trim().length === 0 ? null : (raw as CatalogItemId);
}

export function toSegmentId(raw: string): SegmentId | null {
  return raw.trim().length === 0 ? null : (raw as SegmentId);
}

export function toNodeId(raw: string): NodeId | null {
  return raw.trim().length === 0 ? null : (raw as NodeId);
}

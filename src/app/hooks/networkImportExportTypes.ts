import type { ChangeEvent, MutableRefObject, RefObject } from "react";
import type { NetworkSummaryPanelHandle } from "../components/network-summary/NetworkSummaryPanel.types";
import type { Network, NetworkId } from "../../core/entities";
import type { WorkspaceCurrencyCode, ImportExportStatus } from "../types/app-controller";
import type { AppStore } from "../../store";
import type { NetworkImportSummary, OverwriteCandidate } from "../../adapters/portability";
import type { NetworkFilePayloadV1 } from "../../adapters/portability/networkFile";
import type { OverwriteDecision } from "../components/dialogs/ImportOverwriteDialog";
import type { ToastNotificationVariant } from "./useToastNotifications";

export type NotifyToast = (title: string, options?: { message?: string; variant?: ToastNotificationVariant }) => void;

export interface FileFeedbackDialogModel {
  title: string;
  message: string;
  items: string[];
  onClose: () => void;
}

export interface PendingOverwriteImport {
  payload: NetworkFilePayloadV1;
  candidates: OverwriteCandidate[];
  spliceMigrationReport: string[];
  resetInput: () => void;
}

export interface ImportOverwriteDialogModel {
  candidates: OverwriteCandidate[];
  onConfirm: (decisions: Map<string, OverwriteDecision>) => void;
  onCancel: () => void;
}

export interface GroupedBomPreferences {
  workspaceCurrencyCode?: WorkspaceCurrencyCode;
  workspaceTaxEnabled?: boolean;
  workspaceTaxRatePercent?: number;
  bomExportCompactColumns?: boolean;
  bomTraceabilityLabelsHidden?: boolean;
  bomExportComputedDownstreamLoad?: boolean;
}

export interface UseNetworkImportExportParams {
  store: AppStore;
  networks: Network[];
  activeNetworkId: NetworkId | null;
  dispatchAction: (action: Parameters<AppStore["dispatch"]>[0], options?: { trackHistory?: boolean }) => void;
  notifyToast?: NotifyToast;
  showSpliceMigrationReport?: (entries: string[]) => void;
  groupedBomPreferences?: GroupedBomPreferences;
  networkSummaryPanelRef?: RefObject<NetworkSummaryPanelHandle | null>;
  ensureNetworkPlanScreen?: () => void;
}

export interface UseNetworkImportExportResult {
  importFileInputRef: MutableRefObject<HTMLInputElement | null>;
  selectedExportNetworkIds: NetworkId[];
  importExportStatus: ImportExportStatus | null;
  lastImportSummary: NetworkImportSummary | null;
  importOverwriteDialog: ImportOverwriteDialogModel | null;
  importFailureDialog: FileFeedbackDialogModel | null;
  toggleSelectedExportNetwork: (networkId: NetworkId) => void;
  handleExportNetworks: (scope: "active" | "selected" | "all", exportedAtIsoOverride?: string) => void;
  handleExportNetwork: (networkId: NetworkId, exportedAtIsoOverride?: string) => void;
  handleExportGroupedBom: (networkIds: NetworkId[]) => void;
  handleExportGroupedWire: (networkIds: NetworkId[]) => void;
  handleExportGroupedPdf: (networkIds: NetworkId[]) => void;
  handleExportGroupedPng: (networkIds: NetworkId[]) => void;
  handleExportGroupedSvg: (networkIds: NetworkId[]) => void;
  handleOpenImportPicker: () => void;
  handleImportFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
}

import { type ChangeEvent, type MutableRefObject, useEffect, useRef, useState } from "react";
import { type Network, type NetworkId } from "../../core/entities";
import type { NetworkExportScope } from "../../adapters/portability";
import type { AppStore } from "../../store";
import {
  buildNetworkFilePayload,
  parseNetworkFilePayload,
  resolveImportConflicts,
  serializeNetworkFilePayload,
  type NetworkImportSummary
} from "../../adapters/portability";
import { appActions } from "../../store";
import type { ImportExportStatus } from "../types/app-controller";

interface UseNetworkImportExportParams {
  store: AppStore;
  networks: Network[];
  activeNetworkId: NetworkId | null;
  dispatchAction: (action: Parameters<AppStore["dispatch"]>[0], options?: { trackHistory?: boolean }) => void;
}

interface UseNetworkImportExportResult {
  importFileInputRef: MutableRefObject<HTMLInputElement | null>;
  selectedExportNetworkIds: NetworkId[];
  importExportStatus: ImportExportStatus | null;
  lastImportSummary: NetworkImportSummary | null;
  toggleSelectedExportNetwork: (networkId: NetworkId) => void;
  handleExportNetworks: (scope: "active" | "selected" | "all") => void;
  handleOpenImportPicker: () => void;
  handleImportFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
}

function toFilesystemSafeTimestamp(exportedAtIso: string): string {
  return exportedAtIso.replace(/[:.]/g, "-");
}

export function buildNetworkExportFilename(scope: NetworkExportScope, exportedAtIso: string): string {
  return `electrical-network-${scope}-${toFilesystemSafeTimestamp(exportedAtIso)}.json`;
}

export function downloadJsonFile(fileName: string, content: string): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const blob = new Blob([content], {
    type: "application/json"
  });
  const urlFactory = window.URL ?? globalThis.URL;
  if (typeof urlFactory.createObjectURL !== "function" || typeof urlFactory.revokeObjectURL !== "function") {
    return false;
  }

  const href = urlFactory.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  link.click();
  window.setTimeout(() => {
    urlFactory.revokeObjectURL(href);
  }, 0);
  return true;
}

export function useNetworkImportExport({
  store,
  networks,
  activeNetworkId,
  dispatchAction
}: UseNetworkImportExportParams): UseNetworkImportExportResult {
  const importFileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedExportNetworkIds, setSelectedExportNetworkIds] = useState<NetworkId[]>([]);
  const [importExportStatus, setImportExportStatus] = useState<ImportExportStatus | null>(null);
  const [lastImportSummary, setLastImportSummary] = useState<NetworkImportSummary | null>(null);

  useEffect(() => {
    const availableIds = new Set(networks.map((network) => network.id));
    setSelectedExportNetworkIds((previous) => {
      const filtered = previous.filter((networkId) => availableIds.has(networkId));
      const next =
        filtered.length > 0
          ? filtered
          : activeNetworkId !== null && availableIds.has(activeNetworkId)
            ? [activeNetworkId]
            : [];
      const unchanged = next.length === previous.length && next.every((networkId, index) => previous[index] === networkId);
      return unchanged ? previous : next;
    });
  }, [activeNetworkId, networks]);

  function toggleSelectedExportNetwork(networkId: NetworkId): void {
    setSelectedExportNetworkIds((previous) => {
      if (previous.includes(networkId)) {
        return previous.filter((id) => id !== networkId);
      }

      return [...previous, networkId].sort((left, right) => left.localeCompare(right));
    });
  }

  function handleExportNetworks(scope: "active" | "selected" | "all"): void {
    const exportedAtIso = new Date().toISOString();
    const payload = buildNetworkFilePayload(store.getState(), scope, selectedExportNetworkIds, exportedAtIso);
    if (payload.networks.length === 0) {
      setImportExportStatus({
        kind: "failed",
        message: "No network available for the selected export scope."
      });
      return;
    }

    const serialized = serializeNetworkFilePayload(payload);
    const downloadOk = downloadJsonFile(buildNetworkExportFilename(scope, exportedAtIso), serialized);
    if (!downloadOk) {
      setImportExportStatus({
        kind: "failed",
        message: "Export is not available in this environment."
      });
      return;
    }

    setImportExportStatus({
      kind: "success",
      message: `Exported ${payload.networks.length} network(s) (${scope}).`
    });
  }

  function handleOpenImportPicker(): void {
    importFileInputRef.current?.click();
  }

  async function handleImportFileChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (file === undefined) {
      return;
    }

    const resetInput = () => {
      event.target.value = "";
    };

    let rawJson: string;
    try {
      rawJson = await file.text();
    } catch {
      setImportExportStatus({
        kind: "failed",
        message: "Unable to read selected file."
      });
      resetInput();
      return;
    }

    const parsed = parseNetworkFilePayload(rawJson);
    if (parsed.payload === null) {
      setImportExportStatus({
        kind: "failed",
        message: parsed.error ?? "Invalid import file."
      });
      resetInput();
      return;
    }

    const resolved = resolveImportConflicts(parsed.payload, store.getState());
    setLastImportSummary(resolved.summary);

    if (resolved.networks.length === 0) {
      setImportExportStatus({
        kind: "failed",
        message: "No network was imported. Check file errors."
      });
      resetInput();
      return;
    }

    dispatchAction(appActions.importNetworks(resolved.networks, resolved.networkStates, true));

    setImportExportStatus({
      kind: resolved.summary.errors.length > 0 || resolved.summary.warnings.length > 0 ? "partial" : "success",
      message: `Imported ${resolved.networks.length} network(s).`
    });
    resetInput();
  }

  return {
    importFileInputRef,
    selectedExportNetworkIds,
    importExportStatus,
    lastImportSummary,
    toggleSelectedExportNetwork,
    handleExportNetworks,
    handleOpenImportPicker,
    handleImportFileChange
  };
}

export type NetworkImportExportModel = ReturnType<typeof useNetworkImportExport>;

import { type ChangeEvent, type MutableRefObject, useEffect, useRef, useState } from "react";
import {
  type Network,
  type NetworkId,
  type SpliceId,
  type WireEndpoint
} from "../../core/entities";
import { spliceSideToPortIndex } from "../../core/directionalSplice";
import { DIRECTIONAL_SPLICE_PORT_COUNT, resolveSplicePortMode } from "../../core/splicePortMode";
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
import type { NetworkScopedState } from "../../store";
import type { ImportExportStatus } from "../types/app-controller";
import type { ToastNotificationVariant } from "./useToastNotifications";

type NotifyToast = (title: string, options?: { message?: string; variant?: ToastNotificationVariant }) => void;

interface UseNetworkImportExportParams {
  store: AppStore;
  networks: Network[];
  activeNetworkId: NetworkId | null;
  dispatchAction: (action: Parameters<AppStore["dispatch"]>[0], options?: { trackHistory?: boolean }) => void;
  notifyToast?: NotifyToast;
}

interface UseNetworkImportExportResult {
  importFileInputRef: MutableRefObject<HTMLInputElement | null>;
  selectedExportNetworkIds: NetworkId[];
  importExportStatus: ImportExportStatus | null;
  lastImportSummary: NetworkImportSummary | null;
  toggleSelectedExportNetwork: (networkId: NetworkId) => void;
  handleExportNetworks: (scope: "active" | "selected" | "all", exportedAtIsoOverride?: string) => void;
  handleExportNetwork: (networkId: NetworkId, exportedAtIsoOverride?: string) => void;
  handleOpenImportPicker: () => void;
  handleImportFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function toFilesystemSafeTimestamp(exportedAtIso: string): string {
  const exportedAt = new Date(exportedAtIso);
  if (Number.isNaN(exportedAt.getTime())) {
    const withoutMilliseconds = exportedAtIso.replace(/\.\d{3}(?=Z$)/, "");
    return withoutMilliseconds.replace(/[:.]/g, "-").replace("T", "_").replace(/Z$/i, "");
  }

  const year = exportedAt.getFullYear();
  const month = pad2(exportedAt.getMonth() + 1);
  const day = pad2(exportedAt.getDate());
  const hour = pad2(exportedAt.getHours());
  const minute = pad2(exportedAt.getMinutes());
  const second = pad2(exportedAt.getSeconds());
  return `${year}-${month}-${day}_${hour}-${minute}-${second}`;
}

function hasLegacyNumericSplices(networkStates: Record<NetworkId, NetworkScopedState>): boolean {
  return Object.values(networkStates).some((networkState) =>
    networkState.splices.allIds.some((spliceId) => {
      const splice = networkState.splices.byId[spliceId];
      return splice !== undefined && resolveSplicePortMode(splice) !== "directional";
    })
  );
}

function convertLegacyNumericSplicesToDirectional(
  networkStates: Record<NetworkId, NetworkScopedState>
): Record<NetworkId, NetworkScopedState> {
  const nextStates = { ...networkStates };
  for (const [networkId, networkState] of Object.entries(networkStates) as Array<[NetworkId, NetworkScopedState]>) {
    const convertedSpliceIds = new Set<SpliceId>();
    const nextSplicesById = { ...networkState.splices.byId };
    const originalPortCountBySpliceId = new Map<SpliceId, number>();

    for (const spliceId of networkState.splices.allIds) {
      const splice = networkState.splices.byId[spliceId];
      if (splice === undefined || resolveSplicePortMode(splice) === "directional") {
        continue;
      }
      convertedSpliceIds.add(spliceId);
      originalPortCountBySpliceId.set(spliceId, splice.portCount);
      nextSplicesById[spliceId] = {
        ...splice,
        portMode: "directional",
        portCount: DIRECTIONAL_SPLICE_PORT_COUNT,
        sideInverted: false
      };
    }

    if (convertedSpliceIds.size === 0) {
      continue;
    }

    const convertEndpoint = (endpoint: WireEndpoint): WireEndpoint => {
      if (endpoint.kind !== "splicePort" || !convertedSpliceIds.has(endpoint.spliceId)) {
        return endpoint;
      }
      const originalPortCount = originalPortCountBySpliceId.get(endpoint.spliceId) ?? DIRECTIONAL_SPLICE_PORT_COUNT;
      const side = endpoint.portIndex > Math.ceil(originalPortCount / 2) ? "R" : "L";
      return {
        ...endpoint,
        portIndex: spliceSideToPortIndex(side),
        spliceSideOverride: side,
        spliceSideLocked: false
      };
    };

    const nextWiresById = { ...networkState.wires.byId };
    for (const wireId of networkState.wires.allIds) {
      const wire = networkState.wires.byId[wireId];
      if (wire === undefined) {
        continue;
      }
      nextWiresById[wireId] = {
        ...wire,
        endpointA: convertEndpoint(wire.endpointA),
        endpointB: convertEndpoint(wire.endpointB)
      };
    }

    const nextSplicePortOccupancy = { ...networkState.splicePortOccupancy };
    for (const spliceId of convertedSpliceIds) {
      delete nextSplicePortOccupancy[spliceId];
    }

    nextStates[networkId] = {
      ...networkState,
      splices: {
        ...networkState.splices,
        byId: nextSplicesById
      },
      wires: {
        ...networkState.wires,
        byId: nextWiresById
      },
      splicePortOccupancy: nextSplicePortOccupancy
    };
  }

  return nextStates;
}

function formatImportSummaryMessage(summary: NetworkImportSummary): string {
  const parts = [
    `${summary.importedNetworkIds.length} imported`,
    `${summary.skippedNetworkIds.length} skipped`
  ];
  if (summary.warnings.length > 0) {
    parts.push(`${summary.warnings.length} warning${summary.warnings.length === 1 ? "" : "s"}`);
  }
  if (summary.errors.length > 0) {
    parts.push(`${summary.errors.length} error${summary.errors.length === 1 ? "" : "s"}`);
  }
  return `${parts.join(" / ")}.`;
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

type SaveFilePickerOptions = {
  suggestedName: string;
  types: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
};

type SaveFilePickerHandle = {
  createWritable: () => Promise<{
    write: (content: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

function resolveSaveFilePicker():
  | ((options: SaveFilePickerOptions) => Promise<SaveFilePickerHandle>)
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  const candidate: unknown = (
    window as Window & {
      showSaveFilePicker?: unknown;
    }
  ).showSaveFilePicker;

  return typeof candidate === "function"
    ? (candidate as (options: SaveFilePickerOptions) => Promise<SaveFilePickerHandle>)
    : null;
}

export async function saveJsonFileWithPicker(
  fileName: string,
  content: string
): Promise<"saved" | "cancelled" | "unavailable" | "failed"> {
  const saveFilePicker = resolveSaveFilePicker();
  if (saveFilePicker === null) {
    return "unavailable";
  }

  try {
    const fileHandle = await saveFilePicker({
      suggestedName: fileName,
      types: [
        {
          description: "JSON file",
          accept: { "application/json": [".json"] }
        }
      ]
    });
    const writable = await fileHandle.createWritable();
    await writable.write(new Blob([content], { type: "application/json" }));
    await writable.close();
    return "saved";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }

    return "failed";
  }
}

export async function exportJsonFile(fileName: string, content: string): Promise<"saved" | "cancelled" | "failed"> {
  const pickerResult = await saveJsonFileWithPicker(fileName, content);
  if (pickerResult === "saved" || pickerResult === "cancelled") {
    return pickerResult;
  }

  return downloadJsonFile(fileName, content) ? "saved" : "failed";
}

export function useNetworkImportExport({
  store,
  networks,
  activeNetworkId,
  dispatchAction,
  notifyToast
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

  function handleExportNetworks(scope: "active" | "selected" | "all", exportedAtIsoOverride?: string): void {
    void (async () => {
      const exportedAtIso = exportedAtIsoOverride ?? new Date().toISOString();
      const payload = buildNetworkFilePayload(store.getState(), scope, selectedExportNetworkIds, exportedAtIso);
      if (payload.networks.length === 0) {
        setImportExportStatus({
          kind: "failed",
          message: "No network available for the selected export scope."
        });
        return;
      }

      const serialized = serializeNetworkFilePayload(payload);
      const exportResult = await exportJsonFile(buildNetworkExportFilename(scope, exportedAtIso), serialized);
      if (exportResult === "cancelled") {
        return;
      }
      if (exportResult === "failed") {
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
    })();
  }

  function handleExportNetwork(networkId: NetworkId, exportedAtIsoOverride?: string): void {
    void (async () => {
      const exportedAtIso = exportedAtIsoOverride ?? new Date().toISOString();
      const payload = buildNetworkFilePayload(store.getState(), "selected", [networkId], exportedAtIso);
      if (payload.networks.length === 0) {
        setImportExportStatus({
          kind: "failed",
          message: "No network available for the selected export scope."
        });
        return;
      }

      const serialized = serializeNetworkFilePayload(payload);
      const exportResult = await exportJsonFile(buildNetworkExportFilename("selected", exportedAtIso), serialized);
      if (exportResult === "cancelled") {
        return;
      }
      if (exportResult === "failed") {
        setImportExportStatus({
          kind: "failed",
          message: "Export is not available in this environment."
        });
        return;
      }

      setImportExportStatus({
        kind: "success",
        message: `Exported ${payload.networks.length} network(s) (selected).`
      });
    })();
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
      const message = "Unable to read selected file.";
      setImportExportStatus({
        kind: "failed",
        message
      });
      notifyToast?.("Import failed", {
        message,
        variant: "error"
      });
      resetInput();
      return;
    }

    const parsed = parseNetworkFilePayload(rawJson);
    if (parsed.payload === null) {
      const message = parsed.error ?? "Invalid import file.";
      setImportExportStatus({
        kind: "failed",
        message
      });
      notifyToast?.("Import failed", {
        message,
        variant: "error"
      });
      resetInput();
      return;
    }

    const resolved = resolveImportConflicts(parsed.payload, store.getState());
    setLastImportSummary(resolved.summary);

    if (resolved.networks.length === 0) {
      const message = "No network was imported. Check file errors.";
      setImportExportStatus({
        kind: "failed",
        message
      });
      notifyToast?.("Import failed", {
        message: formatImportSummaryMessage(resolved.summary),
        variant: "error"
      });
      resetInput();
      return;
    }

    let networkStatesToImport = resolved.networkStates;
    if (hasLegacyNumericSplices(resolved.networkStates) && typeof window !== "undefined") {
      const shouldConvertLegacySplices = window.confirm(
        "Legacy numeric splice ports were detected. Convert them to directional L/R splices now? Choose Cancel to keep the old numeric design."
      );
      if (shouldConvertLegacySplices) {
        networkStatesToImport = convertLegacyNumericSplicesToDirectional(resolved.networkStates);
      }
    }

    dispatchAction(appActions.importNetworks(resolved.networks, networkStatesToImport, resolved.harnessAssemblies, true));

    const importStatusKind: ImportExportStatus["kind"] =
      resolved.summary.errors.length > 0 || resolved.summary.warnings.length > 0 ? "partial" : "success";
    setImportExportStatus({
      kind: importStatusKind,
      message: `Imported ${resolved.networks.length} network(s).`
    });
    notifyToast?.("Networks imported", {
      message: formatImportSummaryMessage(resolved.summary),
      variant: importStatusKind === "success" ? "success" : "warning"
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
    handleExportNetwork,
    handleOpenImportPicker,
    handleImportFileChange
  };
}

export type NetworkImportExportModel = ReturnType<typeof useNetworkImportExport>;

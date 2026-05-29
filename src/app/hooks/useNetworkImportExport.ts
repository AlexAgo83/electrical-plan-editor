import { type ChangeEvent, type MutableRefObject, type RefObject, useCallback, useEffect, useRef, useState } from "react";
import type { NetworkSummaryPanelHandle } from "../components/network-summary/NetworkSummaryPanel.types";
import {
  type Network,
  type NetworkId,
  type SpliceId,
  type WireEndpoint
} from "../../core/entities";
import { buildNetworkSummaryBomWorkbookSheets } from "../lib/networkSummaryBomCsv";
import { buildWireListSheet } from "../lib/wireListExport";
import { downloadTabularWorkbookFile } from "../lib/tabularExport";
import type { WorkspaceCurrencyCode } from "../types/app-controller";
import { spliceSideToPortIndex } from "../../core/directionalSplice";
import { DIRECTIONAL_SPLICE_PORT_COUNT, resolveSplicePortMode } from "../../core/splicePortMode";
import type { NetworkExportScope } from "../../adapters/portability";
import type { AppStore } from "../../store";
import {
  buildNetworkFilePayload,
  detectOverwriteCandidates,
  parseNetworkFilePayload,
  resolveImportConflicts,
  serializeNetworkFilePayload,
  type NetworkImportSummary,
  type OverwriteCandidate
} from "../../adapters/portability";
import type { OverwriteDecision } from "../components/dialogs/ImportOverwriteDialog";
import { appActions } from "../../store";
import type { NetworkScopedState } from "../../store";
import type { NetworkFilePayloadV1 } from "../../adapters/portability/networkFile";
import type { ImportExportStatus } from "../types/app-controller";
import type { ToastNotificationVariant } from "./useToastNotifications";

type NotifyToast = (title: string, options?: { message?: string; variant?: ToastNotificationVariant }) => void;

interface PendingOverwriteImport {
  payload: NetworkFilePayloadV1;
  candidates: OverwriteCandidate[];
  resetInput: () => void;
}

export interface ImportOverwriteDialogModel {
  candidates: OverwriteCandidate[];
  onConfirm: (decisions: Map<string, OverwriteDecision>) => void;
  onCancel: () => void;
}

interface GroupedBomPreferences {
  workspaceCurrencyCode?: WorkspaceCurrencyCode;
  workspaceTaxEnabled?: boolean;
  workspaceTaxRatePercent?: number;
  bomExportCompactColumns?: boolean;
  bomTraceabilityLabelsHidden?: boolean;
}

interface UseNetworkImportExportParams {
  store: AppStore;
  networks: Network[];
  activeNetworkId: NetworkId | null;
  dispatchAction: (action: Parameters<AppStore["dispatch"]>[0], options?: { trackHistory?: boolean }) => void;
  notifyToast?: NotifyToast;
  groupedBomPreferences?: GroupedBomPreferences;
  networkSummaryPanelRef?: RefObject<NetworkSummaryPanelHandle | null>;
  ensureNetworkPlanScreen?: () => void;
}

interface UseNetworkImportExportResult {
  importFileInputRef: MutableRefObject<HTMLInputElement | null>;
  selectedExportNetworkIds: NetworkId[];
  importExportStatus: ImportExportStatus | null;
  lastImportSummary: NetworkImportSummary | null;
  importOverwriteDialog: ImportOverwriteDialogModel | null;
  toggleSelectedExportNetwork: (networkId: NetworkId) => void;
  handleExportNetworks: (scope: "active" | "selected" | "all", exportedAtIsoOverride?: string) => void;
  handleExportNetwork: (networkId: NetworkId, exportedAtIsoOverride?: string) => void;
  handleExportGroupedBom: (networkIds: NetworkId[]) => void;
  handleExportGroupedSvg: (networkIds: NetworkId[]) => void;
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

function waitForNextFrames(frameCount: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
      resolve();
      return;
    }
    let remaining = Math.max(1, frameCount);
    const tick = () => {
      remaining -= 1;
      if (remaining <= 0) {
        resolve();
        return;
      }
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  });
}

async function waitFor(predicate: () => boolean, attempts: number, intervalMs: number): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    if (predicate()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return predicate();
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
  notifyToast,
  groupedBomPreferences,
  networkSummaryPanelRef,
  ensureNetworkPlanScreen
}: UseNetworkImportExportParams): UseNetworkImportExportResult {
  const importFileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedExportNetworkIds, setSelectedExportNetworkIds] = useState<NetworkId[]>([]);
  const [importExportStatus, setImportExportStatus] = useState<ImportExportStatus | null>(null);
  const [groupedSvgExportProgress, setGroupedSvgExportProgress] = useState<{
    current: number;
    total: number;
    networkName: string;
  } | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const OVERLAY_ID = "grouped-svg-export-overlay";
    if (groupedSvgExportProgress === null) {
      document.getElementById(OVERLAY_ID)?.remove();
      return;
    }
    let overlay = document.getElementById(OVERLAY_ID);
    if (overlay === null) {
      overlay = document.createElement("div");
      overlay.id = OVERLAY_ID;
      overlay.setAttribute("role", "status");
      overlay.setAttribute("aria-live", "polite");
      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        zIndex: "10000",
        background: "rgba(0, 0, 0, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        pointerEvents: "auto"
      });
      document.body.appendChild(overlay);
    }
    const { current, total, networkName } = groupedSvgExportProgress;
    overlay.innerHTML = `<div style="background:#1f2937;padding:24px 32px;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,0.4);text-align:center;max-width:480px"><div style="font-weight:600;font-size:16px;margin-bottom:6px">Exporting SVG ${current} of ${total}</div><div style="opacity:0.85;font-size:14px">${networkName.replace(/[<>&"]/g, (c) => ({"<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;"}[c] ?? c))}</div></div>`;
    return () => {
      if (groupedSvgExportProgress === null) {
        document.getElementById(OVERLAY_ID)?.remove();
      }
    };
  }, [groupedSvgExportProgress]);
  const [lastImportSummary, setLastImportSummary] = useState<NetworkImportSummary | null>(null);
  const [pendingOverwriteImport, setPendingOverwriteImport] = useState<PendingOverwriteImport | null>(null);

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

  const proceedWithImport = useCallback(
    (
      payload: NetworkFilePayloadV1,
      overwriteMap: ReadonlyMap<string, NetworkId>,
      resetInput: () => void
    ): void => {
      const overwriteNetworkIds = [...overwriteMap.values()];
      const resolved = resolveImportConflicts(payload, store.getState(), overwriteMap);
      setLastImportSummary(resolved.summary);

      if (resolved.networks.length === 0) {
        const message = "No network was imported. Check file errors.";
        setImportExportStatus({ kind: "failed", message });
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

      dispatchAction(
        appActions.importNetworks(
          resolved.networks,
          networkStatesToImport,
          resolved.harnessAssemblies,
          true,
          overwriteNetworkIds.length > 0 ? overwriteNetworkIds : undefined,
          resolved.overwriteHarnessAssemblyIds.length > 0 ? resolved.overwriteHarnessAssemblyIds : undefined
        )
      );

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
    },
    [store, dispatchAction, notifyToast]
  );

  function handleExportGroupedBom(networkIds: NetworkId[]): void {
    if (networkIds.length === 0) {
      return;
    }
    void (async () => {
      const state = store.getState();
      const prefs = groupedBomPreferences ?? {};
      const usedPrefixes = new Set<string>();

      function buildSheetPrefix(technicalId: string): string {
        const sanitized = technicalId.replace(/[:\\/?*[\]]/g, "_").slice(0, 18);
        if (!usedPrefixes.has(sanitized)) {
          usedPrefixes.add(sanitized);
          return sanitized;
        }
        let index = 2;
        while (usedPrefixes.has(`${sanitized.slice(0, 15)}_${index}`)) {
          index++;
        }
        const unique = `${sanitized.slice(0, 15)}_${index}`;
        usedPrefixes.add(unique);
        return unique;
      }

      const allSheets = [];
      for (const networkId of networkIds) {
        const network = state.networks.byId[networkId];
        const networkState = state.networkStates[networkId];
        if (network === undefined || networkState === undefined) {
          continue;
        }

        const connectors = networkState.connectors.allIds
          .map((id) => networkState.connectors.byId[id])
          .filter((c) => c !== undefined);
        const splices = networkState.splices.allIds
          .map((id) => networkState.splices.byId[id])
          .filter((s) => s !== undefined);
        const wires = networkState.wires.allIds
          .map((id) => networkState.wires.byId[id])
          .filter((w) => w !== undefined);
        const catalogItems = networkState.catalogItems.allIds
          .map((id) => networkState.catalogItems.byId[id])
          .filter((c) => c !== undefined);
        const connectorCavityOccupancy = Object.fromEntries(
          Object.entries(networkState.connectorCavityOccupancy)
        );

        const prefix = buildSheetPrefix(network.technicalId);
        const bomSheets = buildNetworkSummaryBomWorkbookSheets(
          catalogItems,
          connectors,
          splices,
          wires,
          prefs.workspaceCurrencyCode ?? "EUR",
          prefs.workspaceTaxEnabled ?? true,
          prefs.workspaceTaxRatePercent ?? 20,
          prefs.bomExportCompactColumns ?? false,
          {
            connectorCavityOccupancy,
            showTraceabilityLabels: !(prefs.bomTraceabilityLabelsHidden ?? false)
          }
        );

        for (const sheet of bomSheets) {
          const shortSheetName = sheet.name.replace(/^Network\s+/i, "");
          allSheets.push({ ...sheet, name: `${prefix} ${shortSheetName}` });
        }

        allSheets.push(
          buildWireListSheet(`${prefix} Wires`, wires, connectors, splices)
        );
      }

      if (allSheets.length === 0) {
        setImportExportStatus({ kind: "failed", message: "No network data found for selected networks." });
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").replace(/Z$/i, "");
      await downloadTabularWorkbookFile(`grouped-bom-${timestamp}`, allSheets);
      setImportExportStatus({ kind: "success", message: `Exported grouped BOM for ${networkIds.length} network(s).` });
    })();
  }

  function handleExportGroupedSvg(networkIds: NetworkId[]): void {
    if (networkIds.length === 0) {
      return;
    }
    if (networkSummaryPanelRef === undefined) {
      setImportExportStatus({ kind: "failed", message: "Grouped SVG export is unavailable in this context." });
      return;
    }
    void (async () => {
      ensureNetworkPlanScreen?.();
      const panelReady = await waitFor(() => networkSummaryPanelRef.current !== null, 60, 100);
      if (!panelReady) {
        setImportExportStatus({ kind: "failed", message: "Network plan is not ready for SVG export." });
        return;
      }

      const originalNetworkId = store.getState().activeNetworkId;
      const validNetworks = networkIds.flatMap((id) => {
        const network = store.getState().networks.byId[id];
        return network === undefined ? [] : [network];
      });
      try {
        let exportedCount = 0;
        for (let i = 0; i < validNetworks.length; i++) {
          const network = validNetworks[i]!;
          setGroupedSvgExportProgress({
            current: i + 1,
            total: validNetworks.length,
            networkName: network.name || network.technicalId || String(network.id)
          });
          dispatchAction(appActions.selectNetwork(network.id));
          await waitForNextFrames(3);
          await networkSummaryPanelRef.current?.exportSvgDirect();
          exportedCount += 1;
        }
        if (originalNetworkId !== null && originalNetworkId !== store.getState().activeNetworkId) {
          dispatchAction(appActions.selectNetwork(originalNetworkId));
        }
        setImportExportStatus({ kind: "success", message: `Exported grouped SVG for ${exportedCount} network(s).` });
      } finally {
        setGroupedSvgExportProgress(null);
      }
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

    const currentState = store.getState();
    const existingNetworks = currentState.networks.allIds
      .map((id) => currentState.networks.byId[id])
      .filter((n): n is Network => n !== undefined);
    const candidates = detectOverwriteCandidates(parsed.payload, existingNetworks);

    if (candidates.length > 0) {
      setPendingOverwriteImport({ payload: parsed.payload, candidates, resetInput });
      return;
    }

    proceedWithImport(parsed.payload, new Map(), resetInput);
  }

  const importOverwriteDialog: ImportOverwriteDialogModel | null =
    pendingOverwriteImport !== null
      ? {
          candidates: pendingOverwriteImport.candidates,
          onConfirm: (decisions) => {
            const overwriteMap = new Map<string, NetworkId>();
            for (const candidate of pendingOverwriteImport.candidates) {
              if ((decisions.get(candidate.importedNetworkId) ?? "overwrite") === "overwrite") {
                overwriteMap.set(candidate.importedNetworkId, candidate.existingNetworkId);
              }
            }
            setPendingOverwriteImport(null);
            void proceedWithImport(pendingOverwriteImport.payload, overwriteMap, pendingOverwriteImport.resetInput);
          },
          onCancel: () => {
            pendingOverwriteImport.resetInput();
            setPendingOverwriteImport(null);
          }
        }
      : null;

  return {
    importFileInputRef,
    selectedExportNetworkIds,
    importExportStatus,
    lastImportSummary,
    importOverwriteDialog,
    toggleSelectedExportNetwork,
    handleExportNetworks,
    handleExportNetwork,
    handleExportGroupedBom,
    handleExportGroupedSvg,
    handleOpenImportPicker,
    handleImportFileChange
  };
}

export type NetworkImportExportModel = ReturnType<typeof useNetworkImportExport>;

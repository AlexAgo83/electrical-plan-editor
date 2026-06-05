import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { type Network, type NetworkId } from "../../core/entities";
import { buildNetworkSummaryBomWorkbookSheets } from "../lib/networkSummaryBomCsv";
import { buildWireListSheet } from "../lib/wireListExport";
import { downloadTabularWorkbookFile } from "../lib/tabularExport";
import {
  buildNetworkFilePayload,
  detectOverwriteCandidates,
  parseNetworkFilePayload,
  resolveImportConflicts,
  serializeNetworkFilePayload,
  type ImportDecisionEntry,
  type ImportDecisionMap,
  type NetworkImportSummary
} from "../../adapters/portability";
import { appActions } from "../../store";
import type { NetworkFilePayloadV1 } from "../../adapters/portability/networkFile";
import type { ImportExportStatus } from "../types/app-controller";
import { buildNetworkExportFilename, exportJsonFile } from "../lib/jsonFileExport";
import { convertLegacyNumericSplicesToDirectional, hasLegacyNumericSplices } from "../lib/importLegacySpliceConversion";
import { removeGroupedSvgExportOverlay, renderGroupedSvgExportOverlay, type GroupedSvgExportProgress } from "../lib/groupedSvgExportOverlay";
import { buildImagePdfBlob, downloadPdfBlob, type PdfImagePage } from "../lib/pdfExport";
import type { ImportOverwriteDialogModel, PendingOverwriteImport, UseNetworkImportExportParams, UseNetworkImportExportResult } from "./networkImportExportTypes";

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

export { buildNetworkExportFilename, downloadJsonFile, exportJsonFile } from "../lib/jsonFileExport";
export type { FileFeedbackDialogModel, ImportOverwriteDialogModel } from "./networkImportExportTypes";

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
  const [groupedSvgExportProgress, setGroupedSvgExportProgress] = useState<GroupedSvgExportProgress | null>(null);
  const [importFailureDialog, setImportFailureDialog] = useState<UseNetworkImportExportResult["importFailureDialog"]>(null);

  useEffect(() => {
    if (groupedSvgExportProgress === null) {
      removeGroupedSvgExportOverlay();
      return;
    }
    renderGroupedSvgExportOverlay(groupedSvgExportProgress);
    return () => {
      if (groupedSvgExportProgress === null) {
        removeGroupedSvgExportOverlay();
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
      const singleNetwork = payload.networks.length === 1 ? payload.networks[0]?.network : null;
      const exportResult = await exportJsonFile(
        buildNetworkExportFilename(scope, exportedAtIso, {
          networkName: singleNetwork?.name,
          networkTechnicalId: singleNetwork?.technicalId,
          networkCount: payload.networks.length
        }),
        serialized
      );
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
      const exportedNetwork = payload.networks[0]?.network;
      const exportResult = await exportJsonFile(
        buildNetworkExportFilename("selected", exportedAtIso, {
          networkName: exportedNetwork?.name,
          networkTechnicalId: exportedNetwork?.technicalId,
          networkCount: payload.networks.length
        }),
        serialized
      );
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
      decisions: ImportDecisionMap,
      resetInput: () => void
    ): void => {
      const overwriteNetworkIds: NetworkId[] = [];
      for (const entry of decisions.values()) {
        if (entry.decision === "overwrite") {
          overwriteNetworkIds.push(entry.existingNetworkId);
        }
      }
      const resolved = resolveImportConflicts(payload, store.getState(), decisions);
      setLastImportSummary(resolved.summary);

      if (resolved.networks.length === 0) {
        const message = "No network was imported. Check file errors.";
        setImportFailureDialog({
          title: "Network import failed",
          message: "The selected file did not produce any importable network.",
          items: [...resolved.summary.errors, ...resolved.summary.warnings],
          onClose: () => setImportFailureDialog(null)
        });
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

      const reducerRejections = store.getState().ui.lastImportRejections ?? [];
      if (reducerRejections.length > 0) {
        const items = reducerRejections.map(
          (r) => `'${r.name || r.technicalId || r.networkId}': ${r.reason}`
        );
        setImportFailureDialog({
          title: "Network import rejected",
          message:
            reducerRejections.length === 1
              ? "The import was rejected by the workspace."
              : `${reducerRejections.length} networks were rejected by the workspace.`,
          items: [...items, ...resolved.summary.errors, ...resolved.summary.warnings],
          onClose: () => setImportFailureDialog(null)
        });
        setImportExportStatus({
          kind: "failed",
          message: `Import rejected: ${reducerRejections.length} network(s).`
        });
        notifyToast?.("Import rejected", {
          message: `${reducerRejections.length} network(s) rejected. See details.`,
          variant: "warning"
        });
        resetInput();
        return;
      }

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

      const namedNetworks = networkIds
        .map((networkId) => state.networks.byId[networkId]?.name || state.networks.byId[networkId]?.technicalId)
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
      const exportBaseName =
        namedNetworks.length === 1 ? `bom-${namedNetworks[0]}` : `bom-grouped-${networkIds.length}-networks`;
      await downloadTabularWorkbookFile(exportBaseName, allSheets);
      setImportExportStatus({ kind: "success", message: `Exported grouped BOM for ${networkIds.length} network(s).` });
    })();
  }

  function handleExportGroupedPlanImages(networkIds: NetworkId[], format: "pdf" | "png" | "svg"): void {
    if (networkIds.length === 0) {
      setImportExportStatus({ kind: "failed", message: `Select at least one network for grouped ${format.toUpperCase()} export.` });
      return;
    }
    if (networkSummaryPanelRef === undefined) {
      setImportExportStatus({ kind: "failed", message: `Grouped ${format.toUpperCase()} export is unavailable in this context.` });
      return;
    }
    void (async () => {
      ensureNetworkPlanScreen?.();
      const panelReady = await waitFor(() => networkSummaryPanelRef.current !== null, 60, 100);
      if (!panelReady) {
        setImportExportStatus({ kind: "failed", message: `Network plan is not ready for ${format.toUpperCase()} export.` });
        return;
      }

      const originalNetworkId = store.getState().activeNetworkId;
      const validNetworks = networkIds.flatMap((id) => {
        const network = store.getState().networks.byId[id];
        return network === undefined ? [] : [network];
      });
      if (validNetworks.length === 0) {
        setImportExportStatus({ kind: "failed", message: "No network data found for selected networks." });
        return;
      }
      try {
        let exportedCount = 0;
        const pdfPages: PdfImagePage[] = [];
        for (let i = 0; i < validNetworks.length; i++) {
          const network = validNetworks[i]!;
          setGroupedSvgExportProgress({
            current: i + 1,
            format,
            total: validNetworks.length,
            networkName: network.name || network.technicalId || String(network.id)
          });
          dispatchAction(appActions.selectNetwork(network.id));
          await waitForNextFrames(3);
          if (format === "pdf") {
            const page = await networkSummaryPanelRef.current?.exportPdfPage();
            if (page !== undefined && page !== null) {
              pdfPages.push(page);
              exportedCount += 1;
            }
          } else if (format === "png") {
            await networkSummaryPanelRef.current?.exportPngDirect();
            exportedCount += 1;
          } else {
            await networkSummaryPanelRef.current?.exportSvgDirect();
            exportedCount += 1;
          }
        }
        if (format === "pdf") {
          if (pdfPages.length === 0) {
            setImportExportStatus({ kind: "failed", message: "No PDF page could be rendered for selected networks." });
            return;
          }
          const blob = buildImagePdfBlob(pdfPages);
          downloadPdfBlob(`network-plan-grouped-${pdfPages.length}-networks.pdf`, blob);
        }
        setImportExportStatus({ kind: "success", message: `Exported grouped ${format.toUpperCase()} for ${exportedCount} network(s).` });
      } finally {
        if (originalNetworkId !== null && originalNetworkId !== store.getState().activeNetworkId) {
          dispatchAction(appActions.selectNetwork(originalNetworkId));
        }
        setGroupedSvgExportProgress(null);
      }
    })();
  }

  function handleExportGroupedPng(networkIds: NetworkId[]): void {
    handleExportGroupedPlanImages(networkIds, "png");
  }

  function handleExportGroupedPdf(networkIds: NetworkId[]): void {
    handleExportGroupedPlanImages(networkIds, "pdf");
  }

  function handleExportGroupedSvg(networkIds: NetworkId[]): void {
    handleExportGroupedPlanImages(networkIds, "svg");
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
      setImportFailureDialog({
        title: "Network import failed",
        message: "The selected file could not be read.",
        items: [file.name],
        onClose: () => setImportFailureDialog(null)
      });
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
      setImportFailureDialog({
        title: "Network import failed",
        message: "The selected file is not a valid network export.",
        items: [message],
        onClose: () => setImportFailureDialog(null)
      });
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
          onConfirm: (dialogDecisions) => {
            const decisions = new Map<string, ImportDecisionEntry>();
            for (const candidate of pendingOverwriteImport.candidates) {
              const choice = dialogDecisions.get(candidate.importedNetworkId) ?? "overwrite";
              if (choice === "overwrite") {
                decisions.set(candidate.importedNetworkId, {
                  decision: "overwrite",
                  existingNetworkId: candidate.existingNetworkId
                });
              } else if (choice === "skip") {
                decisions.set(candidate.importedNetworkId, { decision: "skip" });
              } else {
                decisions.set(candidate.importedNetworkId, { decision: "keep-both" });
              }
            }
            setPendingOverwriteImport(null);
            void proceedWithImport(pendingOverwriteImport.payload, decisions, pendingOverwriteImport.resetInput);
          },
          onCancel: () => {
            pendingOverwriteImport.resetInput();
            setPendingOverwriteImport(null);
            setImportExportStatus(null);
            notifyToast?.("Import cancelled", {
              message: "No changes were applied.",
              variant: "info"
            });
          }
        }
      : null;

  return {
    importFileInputRef,
    selectedExportNetworkIds,
    importExportStatus,
    lastImportSummary,
    importOverwriteDialog,
    importFailureDialog,
    toggleSelectedExportNetwork,
    handleExportNetworks,
    handleExportNetwork,
    handleExportGroupedBom,
    handleExportGroupedPdf,
    handleExportGroupedPng,
    handleExportGroupedSvg,
    handleOpenImportPicker,
    handleImportFileChange
  };
}

export type NetworkImportExportModel = ReturnType<typeof useNetworkImportExport>;

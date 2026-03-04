import { useRef, useState, type ChangeEvent, type RefObject } from "react";
import type { CatalogItem, CatalogItemId } from "../../core/entities";
import type { AppState, AppStore } from "../../store";
import { appActions, appReducer, normalizeManufacturerReferenceKey } from "../../store";
import { createEntityId } from "../lib/app-utils-shared";
import { buildCatalogCsvExport, parseCatalogCsvImportText } from "../lib/catalogCsv";
import { downloadCsvFile } from "../lib/csv";
import type { ImportExportStatus, SubScreenId } from "../types/app-controller";
import type { ConfirmDialogRequest } from "../types/confirm-dialog";

type ScreenId = "home" | "networkScope" | "modeling" | "analysis" | "validation" | "settings";

interface UseCatalogCsvImportExportOptions {
  store: AppStore;
  catalogItems: CatalogItem[];
  replaceStateWithHistory: (nextState: AppState) => void;
  requestConfirmation: (request: ConfirmDialogRequest) => Promise<boolean>;
  setActiveScreen: (screen: ScreenId) => void;
  setActiveSubScreen: (subScreen: SubScreenId) => void;
}

interface UseCatalogCsvImportExportResult {
  catalogCsvImportFileInputRef: RefObject<HTMLInputElement | null>;
  catalogCsvImportExportStatus: ImportExportStatus | null;
  catalogCsvLastImportSummaryLine: string | null;
  handleExportCatalogCsv: () => void;
  handleOpenCatalogCsvImportPicker: () => void;
  handleCatalogCsvImportFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function useCatalogCsvImportExport({
  store,
  catalogItems,
  replaceStateWithHistory,
  requestConfirmation,
  setActiveScreen,
  setActiveSubScreen
}: UseCatalogCsvImportExportOptions): UseCatalogCsvImportExportResult {
  const catalogCsvImportFileInputRef = useRef<HTMLInputElement | null>(null);
  const [catalogCsvImportExportStatus, setCatalogCsvImportExportStatus] = useState<ImportExportStatus | null>(null);
  const [catalogCsvLastImportSummaryLine, setCatalogCsvLastImportSummaryLine] = useState<string | null>(null);

  function handleExportCatalogCsv(): void {
    if (catalogItems.length === 0) {
      setCatalogCsvImportExportStatus({
        kind: "failed",
        message: "No catalog item available for export."
      });
      return;
    }

    const { headers, rows } = buildCatalogCsvExport(catalogItems);
    downloadCsvFile("Catalog Export", headers, rows);
    setCatalogCsvImportExportStatus({
      kind: "success",
      message: `Exported ${rows.length} catalog item(s).`
    });
  }

  function handleOpenCatalogCsvImportPicker(): void {
    catalogCsvImportFileInputRef.current?.click();
  }

  async function handleCatalogCsvImportFileChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const inputElement = event.currentTarget;
    const file = inputElement.files?.[0];
    const resetInput = () => {
      inputElement.value = "";
    };
    if (file === undefined) {
      return;
    }

    let text = "";
    try {
      text = await file.text();
    } catch {
      setCatalogCsvImportExportStatus({
        kind: "failed",
        message: "Unable to read selected catalog CSV file."
      });
      resetInput();
      return;
    }

    const parsed = parseCatalogCsvImportText(text);
    const warningCount = parsed.issues.filter((issue) => issue.kind === "warning").length;
    const errorIssues = parsed.issues.filter((issue) => issue.kind === "error");
    if (errorIssues.length > 0) {
      const firstError = errorIssues[0];
      setCatalogCsvImportExportStatus({
        kind: "failed",
          message:
            firstError === undefined
              ? "Catalog CSV import failed due to validation errors."
              : `Catalog CSV import failed at row ${firstError.rowNumber}: ${firstError.message}`
      });
      setCatalogCsvLastImportSummaryLine(
        `Catalog CSV import aborted (${file.name}): ${parsed.rows.length} rows parsed, ${warningCount} warnings, ${errorIssues.length} errors.`
      );
      resetInput();
      return;
    }

    if (parsed.rows.length === 0) {
      setCatalogCsvImportExportStatus({
        kind: warningCount > 0 ? "partial" : "failed",
        message:
          warningCount > 0
            ? "Catalog CSV contains no importable row after warnings."
            : "Catalog CSV contains no data row."
      });
      setCatalogCsvLastImportSummaryLine(`Catalog CSV import skipped (${file.name}): no row imported.`);
      resetInput();
      return;
    }

    const currentState = store.getState();
    const currentCatalogItems = Object.values(currentState.catalogItems.byId).filter((item): item is NonNullable<typeof item> => item !== undefined);
    if (currentCatalogItems.length > 0) {
      const shouldContinue = await requestConfirmation({
        title: "Import catalog CSV",
        message: `Import ${parsed.rows.length} catalog row(s) into the current catalog? Existing items are matched by manufacturer reference.`,
        intent: "warning"
      });
      if (!shouldContinue) {
        setCatalogCsvImportExportStatus({
          kind: "failed",
          message: "Catalog CSV import canceled."
        });
        resetInput();
        return;
      }
    }

    const existingByManufacturerReference = new Map<string, (typeof currentCatalogItems)[number]>();
    for (const item of currentCatalogItems) {
      const normalizedReferenceKey = normalizeManufacturerReferenceKey(item.manufacturerReference);
      if (normalizedReferenceKey === undefined) {
        continue;
      }
      const existing = existingByManufacturerReference.get(normalizedReferenceKey);
      if (existing !== undefined && existing.id !== item.id) {
        setCatalogCsvImportExportStatus({
          kind: "failed",
          message: `Catalog import blocked: existing catalog has duplicate manufacturer reference '${item.manufacturerReference}'.`
        });
        setCatalogCsvLastImportSummaryLine("Catalog CSV import aborted: resolve existing catalog duplicate references first.");
        resetInput();
        return;
      }
      existingByManufacturerReference.set(normalizedReferenceKey, item);
    }

    let nextState =
      currentState.ui.lastError === null
        ? currentState
        : {
            ...currentState,
            ui: {
              ...currentState.ui,
              lastError: null
            }
          };
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const normalizedReferenceKey = normalizeManufacturerReferenceKey(row.manufacturerReference);
      if (normalizedReferenceKey === undefined) {
        setCatalogCsvImportExportStatus({
          kind: "failed",
          message: "Catalog import failed: invalid manufacturer reference."
        });
        setCatalogCsvLastImportSummaryLine(
          `Catalog CSV import aborted after ${createdCount + updatedCount} row(s); ${warningCount} warnings in file.`
        );
        resetInput();
        return;
      }
      const existing = existingByManufacturerReference.get(normalizedReferenceKey);
      const nextCatalogItemId = existing?.id ?? (createEntityId("catalog") as CatalogItemId);
      const candidateState = appReducer(
        nextState,
        appActions.upsertCatalogItem({
          ...(existing ?? {}),
          id: nextCatalogItemId,
          manufacturerReference: row.manufacturerReference,
          connectionCount: row.connectionCount,
          name: row.name,
          unitPriceExclTax: row.unitPriceExclTax,
          url: row.url
        })
      );

      if (candidateState.ui.lastError !== null) {
        setCatalogCsvImportExportStatus({
          kind: "failed",
          message: `Catalog import failed on '${row.manufacturerReference}': ${candidateState.ui.lastError}`
        });
        setCatalogCsvLastImportSummaryLine(
          `Catalog CSV import aborted after ${createdCount + updatedCount} row(s); ${warningCount} warnings in file.`
        );
        resetInput();
        return;
      }

      if (existing === undefined) {
        createdCount += 1;
      } else {
        updatedCount += 1;
      }
      nextState = candidateState;
      const upsertedItem = candidateState.catalogItems.byId[nextCatalogItemId];
      if (upsertedItem !== undefined) {
        existingByManufacturerReference.set(normalizedReferenceKey, upsertedItem);
      }
    }

    replaceStateWithHistory(nextState);
    setActiveScreen("modeling");
    setActiveSubScreen("catalog");
    setCatalogCsvImportExportStatus({
      kind: warningCount > 0 ? "partial" : "success",
      message: `Imported ${parsed.rows.length} catalog row(s): ${createdCount} created / ${updatedCount} updated.`
    });
    setCatalogCsvLastImportSummaryLine(
      `Last catalog CSV import (${file.name}): ${parsed.rows.length} rows, ${warningCount} warnings, ${errorIssues.length} errors.`
    );
    resetInput();
  }

  return {
    catalogCsvImportFileInputRef,
    catalogCsvImportExportStatus,
    catalogCsvLastImportSummaryLine,
    handleExportCatalogCsv,
    handleOpenCatalogCsvImportPicker,
    handleCatalogCsvImportFileChange
  };
}

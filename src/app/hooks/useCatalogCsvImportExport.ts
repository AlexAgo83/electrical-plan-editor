import { translateCurrent as t } from "../lib/i18n";
import { useRef, useState, type ChangeEvent, type RefObject } from "react";
import type { CatalogItem, CatalogItemId } from "../../core/entities";
import type { AppState, AppStore } from "../../store";
import { appActions, appReducer, getAppErrorMessage, normalizeManufacturerReferenceKey } from "../../store";
import { createEntityId } from "../lib/app-utils-shared";
import { buildCatalogCsvExport, parseCatalogCsvImportText } from "../lib/catalogCsv";
import { downloadCsvFile } from "../lib/csv";
import type { ImportExportStatus, SubScreenId } from "../types/app-controller";
import type { ConfirmDialogRequest } from "../types/confirm-dialog";
import type { FileFeedbackDialogModel } from "./networkImportExportTypes";

type ScreenId = "home" | "networkScope" | "harnessAssembly" | "modeling" | "analysis" | "statistics" | "validation" | "settings";

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
  catalogCsvImportFailureDialog: FileFeedbackDialogModel | null;
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
  const [catalogCsvImportFailureDialog, setCatalogCsvImportFailureDialog] = useState<FileFeedbackDialogModel | null>(null);

  function openImportFailureDialog(title: string, message: string, items: string[] = []): void {
    setCatalogCsvImportFailureDialog({
      title,
      message,
      items,
      onClose: () => setCatalogCsvImportFailureDialog(null)
    });
  }

  function handleExportCatalogCsv(): void {
    if (catalogItems.length === 0) {
      setCatalogCsvImportExportStatus({
        kind: "failed",
        message: t("ui.noCatalogItemAvailableForExport")
      });
      return;
    }

    const { headers, rows } = buildCatalogCsvExport(catalogItems);
    downloadCsvFile("catalog", headers, rows);
    setCatalogCsvImportExportStatus({
      kind: "success",
      message: t(rows.length === 1 ? "ui.catalogItemExported" : "ui.catalogItemsExported", { count: rows.length })
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
      openImportFailureDialog(t("ui.catalogCSVImportFailedTitle"), t("ui.unableToReadSelectedCSVFile"), [file.name]);
      setCatalogCsvImportExportStatus({
        kind: "failed",
        message: t("ui.unableToReadSelectedCatalogCSVFile")
      });
      resetInput();
      return;
    }

    const parsed = parseCatalogCsvImportText(text);
    const warningCount = parsed.issues.filter((issue) => issue.kind === "warning").length;
    const errorIssues = parsed.issues.filter((issue) => issue.kind === "error");
    if (errorIssues.length > 0) {
      const firstError = errorIssues[0];
      openImportFailureDialog(
        t("ui.catalogCSVImportFailedTitle"),
        t("ui.catalogCSVBlockingValidationErrors"),
        errorIssues.map((issue) => t("ui.catalogCSVRowIssue", { row: issue.rowNumber, reason: issue.message }))
      );
      setCatalogCsvImportExportStatus({
        kind: "failed",
          message:
            firstError === undefined
              ? t("ui.catalogCSVImportFailedDueToValidationErrors")
              : t("ui.catalogImportFailedAtRow", { row: firstError.rowNumber, reason: firstError.message })
      });
      setCatalogCsvLastImportSummaryLine(
        t("ui.catalogImportAbortedSummary", {
          file: file.name,
          rows: parsed.rows.length,
          warnings: warningCount,
          errors: errorIssues.length
        })
      );
      resetInput();
      return;
    }

    if (parsed.rows.length === 0) {
      setCatalogCsvImportExportStatus({
        kind: warningCount > 0 ? "partial" : "failed",
        message:
          warningCount > 0
            ? t("ui.catalogCSVContainsNoImportableRowAfterWarnings")
            : t("ui.catalogCSVContainsNoDataRow")
      });
      setCatalogCsvLastImportSummaryLine(t("ui.catalogImportSkipped", { file: file.name }));
      resetInput();
      return;
    }

    const stateBeforeConfirmation = store.getState();
    const catalogItemsBeforeConfirmation = Object.values(stateBeforeConfirmation.catalogItems.byId).filter(
      (item): item is NonNullable<typeof item> => item !== undefined
    );
    if (catalogItemsBeforeConfirmation.length > 0) {
      const shouldContinue = await requestConfirmation({
        title: t("ui.importCatalogCSV"),
        message: t("ui.catalogRowsImportConfirmation", { rows: parsed.rows.length }),
        intent: "warning"
      });
      if (!shouldContinue) {
        setCatalogCsvImportExportStatus({
          kind: "failed",
          message: t("ui.catalogCSVImportCanceled")
        });
        resetInput();
        return;
      }
    }

    const currentState = store.getState();
    const currentCatalogItems = Object.values(currentState.catalogItems.byId).filter((item): item is NonNullable<typeof item> => item !== undefined);

    const existingByManufacturerReference = new Map<string, (typeof currentCatalogItems)[number]>();
    for (const item of currentCatalogItems) {
      const normalizedReferenceKey = normalizeManufacturerReferenceKey(item.manufacturerReference);
      if (normalizedReferenceKey === undefined) {
        continue;
      }
      const existing = existingByManufacturerReference.get(normalizedReferenceKey);
      if (existing !== undefined && existing.id !== item.id) {
        openImportFailureDialog(
          t("ui.catalogCSVImportBlockedTitle"),
          t("ui.catalogDuplicateManufacturerReferences"),
          [t("ui.resolveDuplicateReference", { reference: item.manufacturerReference })]
        );
        setCatalogCsvImportExportStatus({
          kind: "failed",
          message: t("ui.catalogImportDuplicateReference", { reference: item.manufacturerReference })
        });
        setCatalogCsvLastImportSummaryLine(t("ui.catalogCSVImportAbortedResolveExistingCatalogDuplicateReferencesFirst"));
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
        openImportFailureDialog(
          t("ui.catalogCSVImportFailedTitle"),
          t("ui.catalogInvalidManufacturerReference"),
          [t("ui.processedRowsBeforeFailure", { rows: createdCount + updatedCount })]
        );
        setCatalogCsvImportExportStatus({
          kind: "failed",
          message: t("ui.catalogImportFailedInvalidManufacturerReference")
        });
        setCatalogCsvLastImportSummaryLine(
          t("ui.catalogImportAbortedAfterRows", { rows: createdCount + updatedCount, warnings: warningCount })
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
          url: row.url,
          ...(parsed.schema === "current"
            ? {
                additionalAccessories: row.additionalAccessories,
                connectorDefaults: row.connectorDefaults,
                connectorLayout: row.connectorLayout
              }
            : {})
        })
      );

      if (candidateState.ui.lastError !== null) {
        openImportFailureDialog(
          t("ui.catalogCSVImportFailedTitle"),
          t("ui.catalogRowCouldNotBeImported", { reference: row.manufacturerReference }),
          [getAppErrorMessage(candidateState.ui.lastError) ?? t("ui.unknownCatalogImportError")]
        );
        setCatalogCsvImportExportStatus({
          kind: "failed",
          message: t("ui.catalogImportFailedOnReference", {
            reference: row.manufacturerReference,
            reason: getAppErrorMessage(candidateState.ui.lastError) ?? t("ui.unknownCatalogImportError")
          })
        });
        setCatalogCsvLastImportSummaryLine(
          t("ui.catalogImportAbortedAfterRows", { rows: createdCount + updatedCount, warnings: warningCount })
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
      message: t("ui.catalogRowsImported", { rows: parsed.rows.length, created: createdCount, updated: updatedCount })
    });
    setCatalogCsvLastImportSummaryLine(
      t("ui.lastCatalogImportSummary", {
        file: file.name,
        rows: parsed.rows.length,
        warnings: warningCount,
        errors: errorIssues.length
      })
    );
    resetInput();
  }

  return {
    catalogCsvImportFileInputRef,
    catalogCsvImportExportStatus,
    catalogCsvLastImportSummaryLine,
    catalogCsvImportFailureDialog,
    handleExportCatalogCsv,
    handleOpenCatalogCsvImportPicker,
    handleCatalogCsvImportFileChange
  };
}

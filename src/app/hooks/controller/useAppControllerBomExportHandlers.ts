import { useCallback, useMemo, useState } from "react";
import type { CatalogItem, Connector, Splice, Wire } from "../../../core/entities";
import type { ConnectorCavityOccupancyMap } from "../../../core/connectorCatalogMaterials";
import { buildNetworkSummaryBomCsvExport, buildNetworkSummaryBomWorkbookSheets } from "../../lib/networkSummaryBomCsv";
import type { CsvCellValue } from "../../lib/csv";
import { downloadTabularCsvOrXlsxFile, downloadTabularWorkbookFile, type TabularExportFormat, type TabularWorksheetExport } from "../../lib/tabularExport";
import type { WorkspaceCurrencyCode } from "../../types/app-controller";

interface UseAppControllerBomExportHandlersParams {
  catalogItems: CatalogItem[];
  connectors: Connector[];
  splices: Splice[];
  wires: Wire[];
  workspaceCurrencyCode: WorkspaceCurrencyCode | undefined;
  workspaceTaxEnabled: boolean;
  workspaceTaxRatePercent: number;
  tabularExportFormat: TabularExportFormat;
  bomExportCompactColumns: boolean;
  bomTraceabilityLabelsHidden: boolean;
  connectorCavityOccupancy?: ConnectorCavityOccupancyMap;
}

export interface ActiveBomPreviewState {
  format: TabularExportFormat;
  headers: string[];
  rows: CsvCellValue[][];
  itemRowCount: number;
  warnings: string[];
  workspaceCurrencyCode: WorkspaceCurrencyCode;
  workspaceTaxEnabled: boolean;
  workspaceTaxRatePercent: number;
  compactColumns: boolean;
  workbookSheets: TabularWorksheetExport[];
}

export function useAppControllerBomExportHandlers({
  catalogItems,
  connectors,
  splices,
  wires,
  workspaceCurrencyCode,
  workspaceTaxEnabled,
  workspaceTaxRatePercent,
  tabularExportFormat,
  bomExportCompactColumns,
  bomTraceabilityLabelsHidden,
  connectorCavityOccupancy
}: UseAppControllerBomExportHandlersParams) {
  const [activeBomPreview, setActiveBomPreview] = useState<ActiveBomPreviewState | null>(null);
  const networkSummaryBomCsvExport = useMemo(
    () =>
      buildNetworkSummaryBomCsvExport(
        catalogItems,
        connectors,
        splices,
        wires,
        workspaceCurrencyCode,
        workspaceTaxEnabled,
        workspaceTaxRatePercent,
        bomExportCompactColumns,
        {
          connectorCavityOccupancy,
          showTraceabilityLabels: !bomTraceabilityLabelsHidden
        }
      ),
    [
      bomExportCompactColumns,
      bomTraceabilityLabelsHidden,
      catalogItems,
      connectorCavityOccupancy,
      connectors,
      splices,
      wires,
      workspaceCurrencyCode,
      workspaceTaxEnabled,
      workspaceTaxRatePercent
    ]
  );

  const canExportBomCsv = networkSummaryBomCsvExport.itemRowCount > 0;

  const handleExportBomCsv = useCallback(() => {
    if (!canExportBomCsv) {
      return;
    }

    const normalizedWorkspaceCurrencyCode = workspaceCurrencyCode ?? "EUR";
    const workbookSheets = buildNetworkSummaryBomWorkbookSheets(
      catalogItems,
      connectors,
      splices,
      wires,
      normalizedWorkspaceCurrencyCode,
      workspaceTaxEnabled,
      workspaceTaxRatePercent,
      bomExportCompactColumns,
      {
        connectorCavityOccupancy,
        showTraceabilityLabels: !bomTraceabilityLabelsHidden
      }
    );

    setActiveBomPreview({
      format: tabularExportFormat,
      headers: networkSummaryBomCsvExport.headers,
      rows: networkSummaryBomCsvExport.rows,
      itemRowCount: networkSummaryBomCsvExport.itemRowCount,
      warnings: networkSummaryBomCsvExport.warnings,
      workspaceCurrencyCode: normalizedWorkspaceCurrencyCode,
      workspaceTaxEnabled,
      workspaceTaxRatePercent,
      compactColumns: bomExportCompactColumns,
      workbookSheets
    });
  }, [
    bomExportCompactColumns,
    bomTraceabilityLabelsHidden,
    canExportBomCsv,
    catalogItems,
    connectorCavityOccupancy,
    connectors,
    networkSummaryBomCsvExport.headers,
    networkSummaryBomCsvExport.itemRowCount,
    networkSummaryBomCsvExport.rows,
    networkSummaryBomCsvExport.warnings,
    splices,
    tabularExportFormat,
    wires,
    workspaceCurrencyCode,
    workspaceTaxEnabled,
    workspaceTaxRatePercent
  ]);

  const closeActiveBomPreview = useCallback(() => {
    setActiveBomPreview(null);
  }, []);

  const confirmActiveBomPreviewDownload = useCallback(() => {
    const preview = activeBomPreview;
    if (preview === null) {
      return;
    }

    setActiveBomPreview(null);
    if (preview.format === "xlsx") {
      void downloadTabularWorkbookFile("network-bom", preview.workbookSheets);
      return;
    }

    void downloadTabularCsvOrXlsxFile(
      "network-bom",
      preview.format,
      {
        name: "Network BOM",
        headers: preview.headers,
        rows: preview.rows,
        freezeHeaderRow: true,
        autoFilter: true
      },
      { includeUtf8Bom: true }
    );
  }, [activeBomPreview]);

  return {
    activeBomPreview,
    bomExportCompactColumns,
    canExportBomCsv,
    closeActiveBomPreview,
    confirmActiveBomPreviewDownload,
    handleExportBomCsv
  };
}

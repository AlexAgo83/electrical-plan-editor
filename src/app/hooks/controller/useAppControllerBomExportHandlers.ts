import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CatalogItem, CatalogItemId, Connector, Splice, Wire } from "../../../core/entities";
import type { ConnectorCavityOccupancyMap } from "../../../core/connectorCatalogMaterials";
import { buildNetworkSummaryBomCsvExport, buildNetworkSummaryBomWorkbookSheets } from "../../lib/networkSummaryBomCsv";
import type { CsvCellValue } from "../../lib/csv";
import { normalizeFileNamePart } from "../../lib/exportFileName";
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
  activeNetworkName?: string | null;
  activeNetworkTechnicalId?: string | null;
  tabularExportFormat: TabularExportFormat;
  bomExportCompactColumns: boolean;
  bomTraceabilityLabelsHidden: boolean;
  bomExportComputedDownstreamLoad: boolean;
  connectorCavityOccupancy?: ConnectorCavityOccupancyMap;
}

export interface ActiveBomPreviewState {
  format: TabularExportFormat;
  headers: string[];
  rows: CsvCellValue[][];
  itemRowCount: number;
  warnings: string[];
  catalogItemReferenceLinks: Record<string, CatalogItemId>;
  connectorTechnicalIdLinks: Record<string, Connector["id"]>;
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
  activeNetworkName,
  activeNetworkTechnicalId,
  tabularExportFormat,
  bomExportCompactColumns,
  bomTraceabilityLabelsHidden,
  bomExportComputedDownstreamLoad,
  connectorCavityOccupancy
}: UseAppControllerBomExportHandlersParams) {
  const [activeBomPreview, setActiveBomPreview] = useState<ActiveBomPreviewState | null>(null);
  const [isBomPreviewLoading, setIsBomPreviewLoading] = useState(false);
  const bomPreviewRequestIdRef = useRef(0);
  const bomPreviewTimerRef = useRef<number | null>(null);
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
          showTraceabilityLabels: !bomTraceabilityLabelsHidden,
          includeComputedDownstreamLoad: bomExportComputedDownstreamLoad
        }
      ),
    [
      bomExportCompactColumns,
      bomExportComputedDownstreamLoad,
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
  const bomExportBaseName =
    normalizeFileNamePart(activeNetworkName) ?? normalizeFileNamePart(activeNetworkTechnicalId) ?? "network-bom";

  const handleExportBomCsv = useCallback(() => {
    if (!canExportBomCsv) {
      return;
    }

    bomPreviewRequestIdRef.current += 1;
    const requestId = bomPreviewRequestIdRef.current;
    if (bomPreviewTimerRef.current !== null) {
      window.clearTimeout(bomPreviewTimerRef.current);
    }
    setIsBomPreviewLoading(true);

    bomPreviewTimerRef.current = window.setTimeout(() => {
      try {
        const normalizedWorkspaceCurrencyCode = workspaceCurrencyCode ?? "EUR";
        const catalogItemReferenceLinks = Object.fromEntries(
          catalogItems.map((item) => [item.manufacturerReference, item.id] as const)
        );
        const connectorTechnicalIdLinks = Object.fromEntries(
          connectors.map((connector) => [connector.technicalId, connector.id] as const)
        );
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
            showTraceabilityLabels: !bomTraceabilityLabelsHidden,
            includeComputedDownstreamLoad: bomExportComputedDownstreamLoad
          }
        );

        if (requestId !== bomPreviewRequestIdRef.current) {
          return;
        }

        bomPreviewTimerRef.current = null;
        setActiveBomPreview({
          format: tabularExportFormat,
          headers: networkSummaryBomCsvExport.headers,
          rows: networkSummaryBomCsvExport.rows,
          itemRowCount: networkSummaryBomCsvExport.itemRowCount,
          warnings: networkSummaryBomCsvExport.warnings,
          catalogItemReferenceLinks,
          connectorTechnicalIdLinks,
          workspaceCurrencyCode: normalizedWorkspaceCurrencyCode,
          workspaceTaxEnabled,
          workspaceTaxRatePercent,
          compactColumns: bomExportCompactColumns,
          workbookSheets
        });
        setIsBomPreviewLoading(false);
      } catch (error) {
        if (requestId === bomPreviewRequestIdRef.current) {
          setIsBomPreviewLoading(false);
        }
        throw error;
      }
    }, 0);
  }, [
    bomExportCompactColumns,
    bomExportComputedDownstreamLoad,
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
    bomPreviewRequestIdRef.current += 1;
    if (bomPreviewTimerRef.current !== null) {
      window.clearTimeout(bomPreviewTimerRef.current);
      bomPreviewTimerRef.current = null;
    }
    setIsBomPreviewLoading(false);
    setActiveBomPreview(null);
  }, []);

  const confirmActiveBomPreviewDownload = useCallback(() => {
    const preview = activeBomPreview;
    if (preview === null) {
      return;
    }

    setActiveBomPreview(null);
    setIsBomPreviewLoading(false);
    if (preview.format === "xlsx") {
      void downloadTabularWorkbookFile(`bom-${bomExportBaseName}`, preview.workbookSheets).catch((error: unknown) => {
        console.error("Failed to export BOM workbook", error);
      });
      return;
    }

    void downloadTabularCsvOrXlsxFile(
      `bom-${bomExportBaseName}`,
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
  }, [activeBomPreview, bomExportBaseName]);

  useEffect(() => {
    return () => {
      if (bomPreviewTimerRef.current !== null) {
        window.clearTimeout(bomPreviewTimerRef.current);
      }
    };
  }, []);

  return {
    activeBomPreview,
    bomExportCompactColumns,
    canExportBomCsv,
    closeActiveBomPreview,
    confirmActiveBomPreviewDownload,
    handleExportBomCsv,
    isBomPreviewLoading
  };
}

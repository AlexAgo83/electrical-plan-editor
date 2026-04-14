import { useCallback, useMemo } from "react";
import type { CatalogItem, Connector, Splice, Wire } from "../../../core/entities";
import { buildNetworkSummaryBomCsvExport, buildNetworkSummaryBomWorkbookSheets } from "../../lib/networkSummaryBomCsv";
import { downloadTabularCsvOrXlsxFile, downloadTabularWorkbookFile, type TabularExportFormat } from "../../lib/tabularExport";
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
  bomExportCompactColumns
}: UseAppControllerBomExportHandlersParams) {
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
        bomExportCompactColumns
      ),
    [catalogItems, connectors, splices, wires, workspaceCurrencyCode, workspaceTaxEnabled, workspaceTaxRatePercent, bomExportCompactColumns]
  );

  const canExportBomCsv = networkSummaryBomCsvExport.itemRowCount > 0;

  const handleExportBomCsv = useCallback(() => {
    if (!canExportBomCsv) {
      return;
    }

    if (tabularExportFormat === "xlsx") {
      void downloadTabularWorkbookFile(
        "network-bom",
        buildNetworkSummaryBomWorkbookSheets(
          catalogItems,
          connectors,
          splices,
          wires,
          workspaceCurrencyCode,
          workspaceTaxEnabled,
          workspaceTaxRatePercent,
          bomExportCompactColumns
        )
      );
      return;
    }

    void downloadTabularCsvOrXlsxFile(
      "network-bom",
      tabularExportFormat,
      {
        name: "Network BOM",
        headers: networkSummaryBomCsvExport.headers,
        rows: networkSummaryBomCsvExport.rows,
        freezeHeaderRow: true,
        autoFilter: true
      },
      { includeUtf8Bom: true }
    );
  }, [
    bomExportCompactColumns,
    canExportBomCsv,
    catalogItems,
    connectors,
    networkSummaryBomCsvExport.headers,
    networkSummaryBomCsvExport.rows,
    splices,
    tabularExportFormat,
    wires,
    workspaceCurrencyCode,
    workspaceTaxEnabled,
    workspaceTaxRatePercent
  ]);

  return {
    bomExportCompactColumns,
    canExportBomCsv,
    handleExportBomCsv
  };
}

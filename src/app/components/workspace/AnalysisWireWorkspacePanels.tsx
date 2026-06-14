import { useMemo, useState, type ReactElement } from "react";
import { getWireColorLabel, getWireColorSortValue } from "../../../core/cableColors";
import type { SegmentId, WireEndpoint } from "../../../core/entities";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { getTableAriaSort } from "../../lib/accessibility";
import { sortByTableColumns } from "../../lib/app-utils-shared";
import { normalizeFileNamePart } from "../../lib/exportFileName";
import { downloadTabularCsvOrXlsxFile, downloadTabularWorkbookFile, type TabularWorksheetExport } from "../../lib/tabularExport";
import { getWireColorCsvValue, renderWireColorCellValue } from "../../lib/wireColorPresentation";
import {
  buildWireTwistGroupExportCounts,
  resolveWireExportLengthMm
} from "../../lib/wireExportLength";
import { resolveWireExportEndpointMaterials } from "../../lib/wireListExport";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";
import { TabularExportPreviewDialog } from "../dialogs/TabularExportPreviewDialog";
import { EntityReferenceButton } from "./EntityReferenceButton";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";

export function AnalysisWireWorkspacePanels(props: AnalysisWorkspaceContentProps): ReactElement {
  const {
    isWireSubScreen,
    wireRouteFilter,
    wireFunctionalTagFilter,
    setWireFunctionalTagFilter,
    wireFunctionalTagOptions,
    wireFilterField,
    setWireFilterField,
    wireEndpointFilterQuery,
    setWireEndpointFilterQuery,
    tabularExportFormat,
    wireExportLengthPreferences,
    catalogItems,
    connectors,
    segments,
    nodeLabelById,
    splices,
    wires,
    visibleWires,
    wireSort: _wireSort,
    setWireSort: _setWireSort,
    selectedWireId,
    onSelectWire,
    onSelectConnector,
    onSelectSplice,
    onOpenSegmentFromAnalysisTable,
    onSelectCatalogItem,
    onOpenWireOnboardingHelp,
    selectedWire,
    showEntityTables = true,
    describeWireEndpoint,
    describeWireEndpointCsvParts,
    getSortIndicator: _getSortIndicator,
    wireForcedRouteInput,
    setWireForcedRouteInput,
    handleLockWireRoute,
    handleResetWireRoute,
    wireFormError,
    hideWireAnalysisRoutePanel = false
  } = props;
  void _wireSort;
  void _setWireSort;
  void _getSortIndicator;
  type WireAnalysisTableSortField = "name" | "technicalId" | "color" | "endpointA" | "endpointB" | "sectionMm2" | "lengthMm" | "routeMode";
  const isMobileViewport = useIsMobileViewport();
  const connectorById = useMemo(() => new Map(connectors.map((connector) => [connector.id, connector] as const)), [connectors]);
  const segmentById = useMemo(() => new Map(segments.map((segment) => [segment.id, segment] as const)), [segments]);
  const spliceById = useMemo(() => new Map(splices.map((splice) => [splice.id, splice] as const)), [splices]);
  const [wireAnalysisTableSort, setWireAnalysisTableSort] = useState<{ field: WireAnalysisTableSortField; direction: "asc" | "desc" }>({
    field: "name",
    direction: "asc"
  });
  const [wireExportPreview, setWireExportPreview] = useState<{
    filenameBase: string;
    sheets: TabularWorksheetExport[];
  } | null>(null);
  const catalogItemById = useMemo(() => new Map(catalogItems.map((item) => [item.id, item] as const)), [catalogItems]);
  const showWireRouteModeColumn = wireRouteFilter === "all" && !isMobileViewport;
  const sortedVisibleWires = useMemo(
    () =>
      sortByTableColumns(
        visibleWires,
        wireAnalysisTableSort,
        (wire, field) => {
          const endpointA = describeWireEndpoint(wire.endpointA);
          const endpointB = describeWireEndpoint(wire.endpointB);
          if (field === "name") return wire.name;
          if (field === "technicalId") return wire.technicalId;
          if (field === "color") return getWireColorSortValue(wire);
          if (field === "endpointA") return endpointA;
          if (field === "endpointB") return endpointB;
          if (field === "sectionMm2") return wire.sectionMm2;
          if (field === "lengthMm") return wire.lengthMm;
          return wire.isRouteLocked ? "Locked" : "Auto";
        },
        (wire) => wire.id
      ),
    [describeWireEndpoint, visibleWires, wireAnalysisTableSort]
  );
  const wireListSortIndicator = (field: WireAnalysisTableSortField) =>
    wireAnalysisTableSort.field === field ? (wireAnalysisTableSort.direction === "asc" ? "▲" : "▼") : "";
  const wireFilterPlaceholder =
    wireFilterField === "endpoints"
      ? "Connector/Splice or ID"
      : wireFilterField === "name"
        ? "Wire name"
        : wireFilterField === "technicalId"
          ? "Technical ID"
        : "Name, technical ID, endpoint...";
  const getWireFuseManufacturerReference = (wire: (typeof visibleWires)[number]): string | null => {
    if (wire.protection?.kind !== "fuse") {
      return null;
    }
    return catalogItemById.get(wire.protection.catalogItemId)?.manufacturerReference ?? "(missing catalog item)";
  };
  const getWireColorSummaryLabel = (wire: (typeof visibleWires)[number]): string | null => {
    const label = getWireColorLabel(wire);
    return label === "No color" || label === "Free color (unspecified)" ? null : label;
  };
  const getRouteSegmentLabel = (segment: (typeof segments)[number]): string => {
    const nodeALabel = nodeLabelById.get(segment.nodeA) ?? segment.nodeA;
    const nodeBLabel = nodeLabelById.get(segment.nodeB) ?? segment.nodeB;
    return `${nodeALabel} -> ${nodeBLabel} (${segment.id})`;
  };
  const renderCurrentRoutePath = (segmentIds: readonly string[]): ReactElement => {
    if (segmentIds.length === 0) {
      return <p className="route-preview-path analysis-current-route-empty">(none)</p>;
    }

    return (
      <ol className="analysis-current-route-path" aria-label="Current route segment order">
        {segmentIds.map((segmentId, index) => {
          const segment = segmentById.get(segmentId as SegmentId);
          const segmentLabel = segment === undefined ? segmentId : getRouteSegmentLabel(segment);

          return (
            <li key={`${segmentId}-${index}`} className="analysis-current-route-step">
              <span className="analysis-current-route-index">{index + 1}</span>
              {segment === undefined ? (
                <span className="analysis-current-route-segment technical-id" title={segmentLabel}>
                  {segmentLabel}
                </span>
              ) : (
                <EntityReferenceButton
                  className="analysis-current-route-segment"
                  title={segmentLabel}
                  onClick={() => onOpenSegmentFromAnalysisTable(segment.id)}
                >
                  {segmentLabel}
                </EntityReferenceButton>
              )}
            </li>
          );
        })}
      </ol>
    );
  };
  const renderWireEndpointReference = (endpoint: WireEndpoint): ReactElement => {
    const label = describeWireEndpoint(endpoint);
    if (endpoint.kind === "connectorCavity") {
      const connector = connectorById.get(endpoint.connectorId);
      if (connector === undefined) {
        return <>{label}</>;
      }
      return (
        <EntityReferenceButton title={`Open connector ${connector.technicalId}`} onClick={() => onSelectConnector(endpoint.connectorId)}>
          {label}
        </EntityReferenceButton>
      );
    }

    const splice = spliceById.get(endpoint.spliceId);
    if (splice === undefined) {
      return <>{label}</>;
    }
    return (
      <EntityReferenceButton title={`Open splice ${splice.technicalId}`} onClick={() => onSelectSplice(endpoint.spliceId)}>
        {label}
      </EntityReferenceButton>
    );
  };
  return (
    <>
<section className="panel analysis-wire-route-panel" hidden={!isWireSubScreen || !showEntityTables}>
  <header className="list-panel-header list-panel-header-mobile-inline-tools">
    <h2>Wires</h2>
    <div className="list-panel-header-tools">
      <div className="list-panel-header-tools-row is-title-actions">
        <button
          type="button"
          className="filter-chip table-export-button"
          onClick={() => {
            const headers = showWireRouteModeColumn
              ? [
                  "Name",
                  "Technical ID",
                  "Twist group",
                  "Color",
                  "Begin ID",
                  "Begin pin",
                  "Begin connection ref",
                  "Begin seal ref",
                  "End ID",
                  "End pin",
                  "End connection ref",
                  "End seal ref",
                  "Section (mm²)",
                  "Length (mm)",
                  "Route mode"
                ]
              : [
                  "Name",
                  "Technical ID",
                  "Color",
                  "Begin ID",
                  "Begin pin",
                  "Begin connection ref",
                  "Begin seal ref",
                  "End ID",
                  "End pin",
                  "End connection ref",
                  "End seal ref",
                  "Section (mm²)",
                  "Length (mm)"
                ];
            const twistGroupCounts = buildWireTwistGroupExportCounts(sortedVisibleWires);
            const rows = sortedVisibleWires.map((wire) => {
              const begin = describeWireEndpointCsvParts(wire.endpointA);
              const end = describeWireEndpointCsvParts(wire.endpointB);
              const colorCode = getWireColorCsvValue(wire);
              const beginMaterials = resolveWireExportEndpointMaterials(wire, "A", connectorById, spliceById, catalogItemById);
              const endMaterials = resolveWireExportEndpointMaterials(wire, "B", connectorById, spliceById, catalogItemById);
              if (showWireRouteModeColumn) {
                return [
                  wire.name,
                  wire.technicalId,
                  wire.twistGroupLabel ?? "",
                  colorCode,
                  begin.endpointId,
                  begin.pin,
                  beginMaterials.connectionRef,
                  beginMaterials.sealRef,
                  end.endpointId,
                  end.pin,
                  endMaterials.connectionRef,
                  endMaterials.sealRef,
                  wire.sectionMm2,
                  resolveWireExportLengthMm(wire, twistGroupCounts, wireExportLengthPreferences),
                  wire.isRouteLocked ? "Locked" : "Auto"
                ];
              }
              return [
                wire.name,
                wire.technicalId,
                wire.twistGroupLabel ?? "",
                colorCode,
                begin.endpointId,
                begin.pin,
                beginMaterials.connectionRef,
                beginMaterials.sealRef,
                end.endpointId,
                end.pin,
                endMaterials.connectionRef,
                endMaterials.sealRef,
                wire.sectionMm2,
                resolveWireExportLengthMm(wire, twistGroupCounts, wireExportLengthPreferences)
              ];
            });
            const sheet = { name: "Analysis Wires", headers, rows, freezeHeaderRow: true, autoFilter: true } satisfies TabularWorksheetExport;
            const filenameBase = `wire-list-${normalizeFileNamePart(selectedWire?.technicalId) ?? "analysis"}`;
            if (tabularExportFormat === "xlsx") {
              setWireExportPreview({
                filenameBase,
                sheets: [sheet]
              });
              return;
            }
            void downloadTabularCsvOrXlsxFile(filenameBase, tabularExportFormat, sheet, { includeUtf8Bom: true });
          }}
          disabled={sortedVisibleWires.length === 0}
        >
          <span className="table-export-icon" aria-hidden="true" />
          {tabularExportFormat.toUpperCase()}
        </button>
        {onOpenWireOnboardingHelp !== undefined ? (
          <button type="button" className="filter-chip onboarding-help-button" onClick={onOpenWireOnboardingHelp}>
            <span className="action-button-icon is-help" aria-hidden="true" />
            <span>Help</span>
          </button>
        ) : null}
      </div>
      <div className="list-panel-header-tools-row is-filter-row is-wire-filter-row">
        <label className="list-inline-number-filter wire-tag-filter">
          <span>Tag</span>
          <select
            className="list-inline-table-filter-select"
            aria-label="Wire tag filter"
            value={wireFunctionalTagFilter}
            onChange={(event) => setWireFunctionalTagFilter(event.target.value)}
          >
            <option value="all">Any</option>
            {wireFunctionalTagOptions.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <TableFilterBar
          label="Filter"
          fieldLabel="Wire filter field"
          fieldValue={wireFilterField}
          onFieldChange={(value) => setWireFilterField(value as "endpoints" | "name" | "technicalId" | "any")}
          fieldOptions={[
            { value: "endpoints", label: "Endpoints" },
            { value: "name", label: "Wire name" },
            { value: "technicalId", label: "Technical ID" },
            { value: "any", label: "Any" }
          ]}
          queryValue={wireEndpointFilterQuery}
          onQueryChange={setWireEndpointFilterQuery}
          placeholder={wireFilterPlaceholder}
        />
      </div>
    </div>
  </header>
  {wires.length === 0 ? (
    <p className="empty-copy">No wire yet.</p>
  ) : sortedVisibleWires.length === 0 ? (
    <>
      <p className="empty-copy">No wire matches the current filters.</p>
      <TableEntryCountFooter count={0} />
    </>
  ) : (
    <>
      <table className="data-table">
        <thead>
          <tr>
            <th aria-sort={getTableAriaSort(wireAnalysisTableSort, "name")}>
              <button
                type="button"
                className="sort-header-button"
                onClick={() =>
                  setWireAnalysisTableSort((current) => ({
                    field: "name",
                    direction: current.field === "name" && current.direction === "asc" ? "desc" : "asc"
                  }))
                }
              >
                Name <span className="sort-indicator">{wireListSortIndicator("name")}</span>
              </button>
            </th>
            <th aria-sort={getTableAriaSort(wireAnalysisTableSort, "technicalId")}>
              <button
                type="button"
                className="sort-header-button"
                onClick={() =>
                  setWireAnalysisTableSort((current) => ({
                    field: "technicalId",
                    direction: current.field === "technicalId" && current.direction === "asc" ? "desc" : "asc"
                  }))
                }
              >
                {isMobileViewport ? "ID" : "Technical ID"} <span className="sort-indicator">{wireListSortIndicator("technicalId")}</span>
              </button>
            </th>
            <th>{isMobileViewport ? "Func tag" : "Functional tag"}</th>
            <th>{isMobileViewport ? "Twist" : "Twist group"}</th>
            <th aria-sort={getTableAriaSort(wireAnalysisTableSort, "color")}>
              <button
                type="button"
                className="sort-header-button"
                onClick={() =>
                  setWireAnalysisTableSort((current) => ({
                    field: "color",
                    direction: current.field === "color" && current.direction === "asc" ? "desc" : "asc"
                  }))
                }
              >
                Color <span className="sort-indicator">{wireListSortIndicator("color")}</span>
              </button>
            </th>
            <th aria-sort={getTableAriaSort(wireAnalysisTableSort, "endpointA")}>
              <button
                type="button"
                className="sort-header-button"
                onClick={() =>
                  setWireAnalysisTableSort((current) => ({
                    field: "endpointA",
                    direction: current.field === "endpointA" && current.direction === "asc" ? "desc" : "asc"
                  }))
                }
              >
                {isMobileViewport ? "End A" : "Endpoint A"} <span className="sort-indicator">{wireListSortIndicator("endpointA")}</span>
              </button>
            </th>
            <th aria-sort={getTableAriaSort(wireAnalysisTableSort, "endpointB")}>
              <button
                type="button"
                className="sort-header-button"
                onClick={() =>
                  setWireAnalysisTableSort((current) => ({
                    field: "endpointB",
                    direction: current.field === "endpointB" && current.direction === "asc" ? "desc" : "asc"
                  }))
                }
              >
                {isMobileViewport ? "End B" : "Endpoint B"} <span className="sort-indicator">{wireListSortIndicator("endpointB")}</span>
              </button>
            </th>
            <th aria-sort={getTableAriaSort(wireAnalysisTableSort, "sectionMm2")}>
              <button
                type="button"
                className="sort-header-button"
                onClick={() =>
                  setWireAnalysisTableSort((current) => ({
                    field: "sectionMm2",
                    direction: current.field === "sectionMm2" && current.direction === "asc" ? "desc" : "asc"
                  }))
                }
              >
                {isMobileViewport ? "Sec" : "Section (mm²)"} <span className="sort-indicator">{wireListSortIndicator("sectionMm2")}</span>
              </button>
            </th>
            <th aria-sort={getTableAriaSort(wireAnalysisTableSort, "lengthMm")}>
              <button
                type="button"
                className="sort-header-button"
                onClick={() =>
                  setWireAnalysisTableSort((current) => ({
                    field: "lengthMm",
                    direction: current.field === "lengthMm" && current.direction === "asc" ? "desc" : "asc"
                  }))
                }
              >
                {isMobileViewport ? "Len" : "Length (mm)"} <span className="sort-indicator">{wireListSortIndicator("lengthMm")}</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedVisibleWires.map((wire) => {
            const isSelected = selectedWireId === wire.id;
            const fuseManufacturerReference = getWireFuseManufacturerReference(wire);
            const fuseCatalogItemId = wire.protection?.catalogItemId;
            const fuseCatalogItem = fuseCatalogItemId === undefined ? undefined : catalogItemById.get(fuseCatalogItemId);
            return (
              <tr
                key={wire.id}
                className={isSelected ? "is-selected is-focusable-row" : "is-focusable-row"}
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => onSelectWire(wire.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectWire(wire.id);
                  }
                }}
              >
                <td>
                  <div>{wire.name}</div>
                  {fuseManufacturerReference !== null ? (
                    <div className="wire-fuse-inline">
                      <span className="status-chip wire-fuse-chip">Fuse</span>
                      {fuseCatalogItemId !== undefined && fuseCatalogItem !== undefined ? (
                        <EntityReferenceButton
                          className="technical-id"
                          title={`Open catalog item ${fuseManufacturerReference}`}
                          onClick={() => onSelectCatalogItem(fuseCatalogItemId)}
                        >
                          {fuseManufacturerReference}
                        </EntityReferenceButton>
                      ) : (
                        <span className="technical-id">{fuseManufacturerReference}</span>
                      )}
                    </div>
                  ) : null}
                </td>
                <td className="technical-id">{wire.technicalId}</td>
                <td>{wire.functionalDomainTag ?? "Auto"}</td>
                <td>{wire.twistGroupLabel ?? ""}</td>
                <td>{renderWireColorCellValue(wire)}</td>
                <td>{renderWireEndpointReference(wire.endpointA)}</td>
                <td>{renderWireEndpointReference(wire.endpointB)}</td>
                <td>{wire.sectionMm2}</td>
                <td>{wire.lengthMm}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <TableEntryCountFooter count={sortedVisibleWires.length} />
    </>
  )}
  {wireExportPreview !== null ? (
    <TabularExportPreviewDialog
      isOpen={wireExportPreview !== null}
      title="Wire export preview"
      summaryLabel="Analysis wires"
      filenameLabel={`${wireExportPreview.filenameBase}.xlsx`}
      sheets={wireExportPreview.sheets}
      onConfirm={() => {
        void downloadTabularWorkbookFile(wireExportPreview.filenameBase, wireExportPreview.sheets).catch((error: unknown) => {
          console.error("Failed to export analysis wires workbook", error);
        });
        setWireExportPreview(null);
      }}
      onCancel={() => setWireExportPreview(null)}
    />
  ) : null}
</section>

<section className="panel analysis-wire-route-panel" hidden={!isWireSubScreen || hideWireAnalysisRoutePanel}>
  <header className="analysis-wire-route-header">
    <h2>Wire analysis</h2>
    {selectedWire !== null ? (
      <span className={selectedWire.isRouteLocked ? "analysis-wire-mode-chip is-locked" : "analysis-wire-mode-chip"}>
        {selectedWire.isRouteLocked ? "Locked route" : "Auto route"}
      </span>
    ) : null}
  </header>
  {selectedWire === null ? (
    <p className="empty-copy">Select a wire to lock a forced route or reset to auto shortest path.</p>
  ) : (
    <div className="analysis-wire-route-content">
      <article className="analysis-wire-identity">
        <span className="analysis-wire-identity-label">Selected wire</span>
        <p className="analysis-wire-identity-value">
          <strong>{selectedWire.name}</strong> <span className="technical-id">({selectedWire.technicalId})</span>
        </p>
        <p className="meta-line" style={{ margin: 0 }}>
          Section {selectedWire.sectionMm2} mm²{getWireColorSummaryLabel(selectedWire) !== null ? ` • ${getWireColorSummaryLabel(selectedWire)}` : ""}
        </p>
      </article>
      {getWireFuseManufacturerReference(selectedWire) !== null ? (
          <article className="analysis-wire-route-current">
            <span>Protection</span>
            <p className="route-preview-path">
              <span className="status-chip wire-fuse-chip">Fuse</span> {getWireFuseManufacturerReference(selectedWire)}
            </p>
          </article>
      ) : null}

      <div className="route-preview-selection-strip">
        <article>
          <span>Start</span>
          <strong>{renderWireEndpointReference(selectedWire.endpointA)}</strong>
        </article>
        <span className="route-preview-selection-arrow" aria-hidden="true">
          &rarr;
        </span>
        <article>
          <span>End</span>
          <strong>{renderWireEndpointReference(selectedWire.endpointB)}</strong>
        </article>
      </div>

      <article className="analysis-wire-route-current">
        <span>Current route</span>
        {renderCurrentRoutePath(selectedWire.routeSegmentIds)}
      </article>
      <article className="analysis-wire-route-current">
        <span>Endpoint references</span>
        <p className="route-preview-path">
          A: {selectedWire.endpointAConnectionReference?.trim() || "No connection ref"} / {selectedWire.endpointASealReference?.trim() || "No seal ref"}
          {" • "}
          B: {selectedWire.endpointBConnectionReference?.trim() || "No connection ref"} / {selectedWire.endpointBSealReference?.trim() || "No seal ref"}
        </p>
      </article>

      <label className="stack-label analysis-wire-route-input">
        Forced route segment IDs (comma-separated)
        <input
          value={wireForcedRouteInput}
          onChange={(event) => setWireForcedRouteInput(event.target.value)}
          placeholder="segment-1, segment-2, segment-3"
        />
      </label>

      <div className="row-actions analysis-wire-route-actions">
        <button type="button" className="button-with-icon" onClick={handleLockWireRoute}>
          <span className="action-button-icon is-lock-move" aria-hidden="true" />
          Lock forced route
        </button>
        <button type="button" className="button-with-icon" onClick={handleResetWireRoute}>
          <span className="action-button-icon is-cancel" aria-hidden="true" />
          Reset to auto route
        </button>
      </div>
      {wireFormError !== null ? <small className="inline-error">{wireFormError}</small> : null}
    </div>
  )}
</section>
    </>
  );
}

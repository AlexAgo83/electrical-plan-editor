import { useMemo, useState, type ReactElement } from "react";
import { getWireColorLabel, getWireColorSortValue } from "../../../core/cableColors";
import { sortByTableColumns } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import { getWireColorCsvValue, renderWireColorCellValue } from "../../lib/wireColorPresentation";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";

export function AnalysisWireWorkspacePanels(props: AnalysisWorkspaceContentProps): ReactElement {
  const {
    isWireSubScreen,
    wireRouteFilter,
    setWireRouteFilter,
    wireFilterField,
    setWireFilterField,
    wireEndpointFilterQuery,
    setWireEndpointFilterQuery,
    wires,
    visibleWires,
    wireSort: _wireSort,
    setWireSort: _setWireSort,
    selectedWireId,
    onSelectWire,
    onOpenWireOnboardingHelp,
    selectedWire,
    describeWireEndpoint,
    describeWireEndpointId,
    getSortIndicator: _getSortIndicator,
    wireForcedRouteInput,
    setWireForcedRouteInput,
    handleLockWireRoute,
    handleResetWireRoute,
    wireFormError
  } = props;
  void _wireSort;
  void _setWireSort;
  void _getSortIndicator;
  type WireAnalysisTableSortField = "name" | "technicalId" | "color" | "endpointA" | "endpointB" | "sectionMm2" | "lengthMm" | "routeMode";
  const [wireAnalysisTableSort, setWireAnalysisTableSort] = useState<{ field: WireAnalysisTableSortField; direction: "asc" | "desc" }>({
    field: "name",
    direction: "asc"
  });
  const showWireRouteModeColumn = wireRouteFilter === "all";
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
  return (
    <>
<section className="panel analysis-wire-route-panel" hidden={!isWireSubScreen}>
  <header className="list-panel-header">
    <h2>Wires</h2>
    <div className="list-panel-header-tools">
      <div className="list-panel-header-tools-row">
        <div className="chip-group list-panel-filters" role="group" aria-label="Wire route mode filter">
          {([
            ["all", "All"],
            ["auto", "Auto"],
            ["locked", "Locked"]
          ] as const).map(([filterId, label]) => (
            <button
              key={filterId}
              type="button"
              className={wireRouteFilter === filterId ? "filter-chip is-active" : "filter-chip"}
              onClick={() => setWireRouteFilter(filterId)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="filter-chip table-export-button"
          onClick={() => {
            const headers = showWireRouteModeColumn
              ? ["Name", "Technical ID", "Color", "Endpoints", "Begin", "End", "Section (mm²)", "Length (mm)", "Route mode"]
              : ["Name", "Technical ID", "Color", "Endpoints", "Begin", "End", "Section (mm²)", "Length (mm)"];
            const rows = sortedVisibleWires.map((wire) => {
              const endpoints = `${describeWireEndpoint(wire.endpointA)} -> ${describeWireEndpoint(wire.endpointB)}`;
              const begin = describeWireEndpointId(wire.endpointA);
              const end = describeWireEndpointId(wire.endpointB);
              const colorCode = getWireColorCsvValue(wire);
              if (showWireRouteModeColumn) {
                return [
                  wire.name,
                  wire.technicalId,
                  colorCode,
                  endpoints,
                  begin,
                  end,
                  wire.sectionMm2,
                  wire.lengthMm,
                  wire.isRouteLocked ? "Locked" : "Auto"
                ];
              }
              return [wire.name, wire.technicalId, colorCode, endpoints, begin, end, wire.sectionMm2, wire.lengthMm];
            });
            downloadCsvFile("analysis-wires", headers, rows);
          }}
          disabled={sortedVisibleWires.length === 0}
        >
          <span className="table-export-icon" aria-hidden="true" />
          CSV
        </button>
        {onOpenWireOnboardingHelp !== undefined ? (
          <button type="button" className="filter-chip onboarding-help-button" onClick={onOpenWireOnboardingHelp}>
            <span className="action-button-icon is-help" aria-hidden="true" />
            <span>Help</span>
          </button>
        ) : null}
      </div>
      <div className="list-panel-header-tools-row">
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
            <th>
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
            <th>
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
                Technical ID <span className="sort-indicator">{wireListSortIndicator("technicalId")}</span>
              </button>
            </th>
            <th>
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
            <th>
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
                Endpoint A <span className="sort-indicator">{wireListSortIndicator("endpointA")}</span>
              </button>
            </th>
            <th>
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
                Endpoint B <span className="sort-indicator">{wireListSortIndicator("endpointB")}</span>
              </button>
            </th>
            <th>
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
                Section (mm²) <span className="sort-indicator">{wireListSortIndicator("sectionMm2")}</span>
              </button>
            </th>
            <th>
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
                Length (mm) <span className="sort-indicator">{wireListSortIndicator("lengthMm")}</span>
              </button>
            </th>
            {showWireRouteModeColumn ? (
              <th>
                <button
                  type="button"
                  className="sort-header-button"
                  onClick={() =>
                    setWireAnalysisTableSort((current) => ({
                      field: "routeMode",
                      direction: current.field === "routeMode" && current.direction === "asc" ? "desc" : "asc"
                    }))
                  }
                >
                  Route mode <span className="sort-indicator">{wireListSortIndicator("routeMode")}</span>
                </button>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {sortedVisibleWires.map((wire) => {
            const isSelected = selectedWireId === wire.id;
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
                <td>{wire.name}</td>
                <td className="technical-id">{wire.technicalId}</td>
                <td>{renderWireColorCellValue(wire)}</td>
                <td>{describeWireEndpoint(wire.endpointA)}</td>
                <td>{describeWireEndpoint(wire.endpointB)}</td>
                <td>{wire.sectionMm2}</td>
                <td>{wire.lengthMm}</td>
                {showWireRouteModeColumn ? <td>{wire.isRouteLocked ? "Locked" : "Auto"}</td> : null}
              </tr>
            );
          })}
        </tbody>
      </table>
      <TableEntryCountFooter count={sortedVisibleWires.length} />
    </>
  )}
</section>

<section className="panel analysis-wire-route-panel" hidden={!isWireSubScreen}>
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
          Section {selectedWire.sectionMm2} mm² • {getWireColorLabel(selectedWire)}
        </p>
      </article>

      <div className="route-preview-selection-strip">
        <article>
          <span>Start</span>
          <strong>{describeWireEndpoint(selectedWire.endpointA)}</strong>
        </article>
        <span className="route-preview-selection-arrow" aria-hidden="true">
          &rarr;
        </span>
        <article>
          <span>End</span>
          <strong>{describeWireEndpoint(selectedWire.endpointB)}</strong>
        </article>
      </div>

      <article className="analysis-wire-route-current">
        <span>Current route</span>
        <p className="route-preview-path">{selectedWire.routeSegmentIds.join(" -> ") || "(none)"}</p>
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

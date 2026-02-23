import type { ReactElement } from "react";
import { CABLE_COLOR_BY_ID } from "../../../core/cableColors";
import { nextSortState } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";
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
    wireSort,
    setWireSort,
    selectedWireId,
    onSelectWire,
    selectedWire,
    describeWireEndpoint,
    describeWireEndpointId,
    getSortIndicator,
    wireForcedRouteInput,
    setWireForcedRouteInput,
    handleLockWireRoute,
    handleResetWireRoute,
    wireFormError
  } = props;
  const showWireRouteModeColumn = wireRouteFilter === "all";
  const wireFilterPlaceholder =
    wireFilterField === "endpoints"
      ? "Connector/Splice or ID"
      : wireFilterField === "name"
        ? "Wire name"
        : wireFilterField === "technicalId"
          ? "Technical ID"
          : "Name, technical ID, endpoint...";
  function renderWireColorCell(wire: AnalysisWorkspaceContentProps["wires"][number]): ReactElement {
    if (wire.primaryColorId === null) {
      return <span className="meta-line">No color</span>;
    }
    const primary = CABLE_COLOR_BY_ID[wire.primaryColorId];
    const secondary = wire.secondaryColorId === null ? null : CABLE_COLOR_BY_ID[wire.secondaryColorId];
    const colorCode = wire.secondaryColorId === null ? wire.primaryColorId : `${wire.primaryColorId}/${wire.secondaryColorId}`;
    const colorLabel =
      wire.secondaryColorId === null
        ? (primary?.label ?? `Unknown (${wire.primaryColorId})`)
        : `${primary?.label ?? `Unknown (${wire.primaryColorId})`} / ${secondary?.label ?? `Unknown (${wire.secondaryColorId})`}`;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }} title={colorLabel}>
        <span
          aria-hidden="true"
          style={{
            width: "0.7rem",
            height: "0.7rem",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.25)",
            background: primary?.hex ?? "#7a7a7a"
          }}
        />
        {wire.secondaryColorId !== null ? (
          <span
            aria-hidden="true"
            style={{
              width: "0.7rem",
              height: "0.7rem",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.25)",
              background: secondary?.hex ?? "#7a7a7a"
            }}
          />
        ) : null}
        <span className="technical-id">{colorCode}</span>
      </span>
    );
  }

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
              ? ["Name", "Technical ID", "Section (mm²)", "Color", "Endpoints", "Begin", "End", "Length (mm)", "Route mode"]
              : ["Name", "Technical ID", "Section (mm²)", "Color", "Endpoints", "Begin", "End", "Length (mm)"];
            const rows = visibleWires.map((wire) => {
              const endpoints = `${describeWireEndpoint(wire.endpointA)} -> ${describeWireEndpoint(wire.endpointB)}`;
              const begin = describeWireEndpointId(wire.endpointA);
              const end = describeWireEndpointId(wire.endpointB);
              const colorCode =
                wire.primaryColorId === null
                  ? "No color"
                  : wire.secondaryColorId === null
                    ? wire.primaryColorId
                    : `${wire.primaryColorId}/${wire.secondaryColorId}`;
              if (showWireRouteModeColumn) {
                return [
                  wire.name,
                  wire.technicalId,
                  wire.sectionMm2,
                  colorCode,
                  endpoints,
                  begin,
                  end,
                  wire.lengthMm,
                  wire.isRouteLocked ? "Locked" : "Auto"
                ];
              }
              return [wire.name, wire.technicalId, wire.sectionMm2, colorCode, endpoints, begin, end, wire.lengthMm];
            });
            downloadCsvFile("analysis-wires", headers, rows);
          }}
          disabled={visibleWires.length === 0}
        >
          <span className="table-export-icon" aria-hidden="true" />
          CSV
        </button>
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
  ) : visibleWires.length === 0 ? (
    <p className="empty-copy">No wire matches the current filters.</p>
  ) : (
    <table className="data-table">
      <thead>
        <tr>
          <th>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setWireSort((current) => nextSortState(current, "name"))}
            >
              Name <span className="sort-indicator">{getSortIndicator(wireSort, "name")}</span>
            </button>
          </th>
          <th>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setWireSort((current) => nextSortState(current, "technicalId"))}
            >
              Technical ID <span className="sort-indicator">{getSortIndicator(wireSort, "technicalId")}</span>
            </button>
          </th>
          <th>Section (mm²)</th>
          <th>Color</th>
          <th>Endpoints</th>
          <th>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setWireSort((current) => nextSortState(current, "lengthMm"))}
            >
              Length (mm) <span className="sort-indicator">{getSortIndicator(wireSort, "lengthMm")}</span>
            </button>
          </th>
          {showWireRouteModeColumn ? <th>Route mode</th> : null}
        </tr>
      </thead>
      <tbody>
        {visibleWires.map((wire) => {
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
              <td>{wire.sectionMm2}</td>
              <td>{renderWireColorCell(wire)}</td>
              <td>
                {describeWireEndpoint(wire.endpointA)} <strong>&rarr;</strong> {describeWireEndpoint(wire.endpointB)}
              </td>
              <td>{wire.lengthMm}</td>
              {showWireRouteModeColumn ? <td>{wire.isRouteLocked ? "Locked" : "Auto"}</td> : null}
            </tr>
          );
        })}
      </tbody>
    </table>
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

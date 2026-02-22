import { useState, type ReactElement } from "react";
import { nextSortState } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";

export function AnalysisSpliceWorkspacePanels(props: AnalysisWorkspaceContentProps): ReactElement {
  const {
    isSpliceSubScreen,
    selectedSplice,
    selectedSpliceId,
    spliceOccupancyFilter,
    setSpliceOccupancyFilter,
    splices,
    visibleSplices,
    spliceSort,
    setSpliceSort,
    spliceOccupiedCountById,
    onSelectSplice,
    splicePortStatuses,
    portIndexInput,
    setPortIndexInput,
    spliceOccupantRefInput,
    setSpliceOccupantRefInput,
    handleReservePort,
    handleReleasePort,
    sortedSpliceSynthesisRows,
    spliceSynthesisSort,
    setSpliceSynthesisSort,
    getSortIndicator
  } = props;
  const [spliceAnalysisView, setSpliceAnalysisView] = useState<"ports" | "synthesis">("ports");

  return (
    <>
<section className="panel" hidden={!isSpliceSubScreen}>
  <header className="list-panel-header">
    <h2>Splices</h2>
    <div className="list-panel-header-tools">
      <div className="chip-group list-panel-filters" role="group" aria-label="Splice occupancy filter">
        {([
          ["all", "All"],
          ["occupied", "Occupied"],
          ["free", "Free"]
        ] as const).map(([filterId, label]) => (
          <button
            key={filterId}
            type="button"
            className={spliceOccupancyFilter === filterId ? "filter-chip is-active" : "filter-chip"}
            onClick={() => setSpliceOccupancyFilter(filterId)}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="filter-chip table-export-button"
        onClick={() =>
          downloadCsvFile(
            "analysis-splices",
            ["Name", "Technical ID", "Ports", "Branches"],
            visibleSplices.map((splice) => [
              splice.name,
              splice.technicalId,
              splice.portCount,
              spliceOccupiedCountById.get(splice.id) ?? 0
            ])
          )
        }
        disabled={visibleSplices.length === 0}
      >
        <span className="table-export-icon" aria-hidden="true" />
        CSV
      </button>
    </div>
  </header>
  {splices.length === 0 ? (
    <p className="empty-copy">No splice yet.</p>
  ) : visibleSplices.length === 0 ? (
    <p className="empty-copy">No splice matches the current filters.</p>
  ) : (
    <table className="data-table">
      <thead>
        <tr>
          <th>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setSpliceSort((current) => nextSortState(current, "name"))}
            >
              Name <span className="sort-indicator">{getSortIndicator(spliceSort, "name")}</span>
            </button>
          </th>
          <th>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setSpliceSort((current) => nextSortState(current, "technicalId"))}
            >
              Technical ID <span className="sort-indicator">{getSortIndicator(spliceSort, "technicalId")}</span>
            </button>
          </th>
          <th>Ports</th>
          <th>Branches</th>
        </tr>
      </thead>
      <tbody>
        {visibleSplices.map((splice) => {
          const occupiedCount = spliceOccupiedCountById.get(splice.id) ?? 0;
          const isSelected = selectedSpliceId === splice.id;
          return (
            <tr
              key={splice.id}
              className={isSelected ? "is-selected is-focusable-row" : "is-focusable-row"}
              aria-selected={isSelected}
              tabIndex={0}
              onClick={() => onSelectSplice(splice.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectSplice(splice.id);
                }
              }}
            >
              <td>{splice.name}</td>
              <td className="technical-id">{splice.technicalId}</td>
              <td>{splice.portCount}</td>
              <td>{occupiedCount}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  )}
</section>

<section className="panel" hidden={!isSpliceSubScreen}>
  <header className="list-panel-header">
    <h2>Splice analysis</h2>
    <div className="list-panel-header-tools">
      <div className="chip-group list-panel-filters" role="group" aria-label="Splice analysis view">
        <button
          type="button"
          className={spliceAnalysisView === "ports" ? "filter-chip is-active" : "filter-chip"}
          onClick={() => setSpliceAnalysisView("ports")}
        >
          Ports
        </button>
        <button
          type="button"
          className={spliceAnalysisView === "synthesis" ? "filter-chip is-active" : "filter-chip"}
          onClick={() => setSpliceAnalysisView("synthesis")}
        >
          Synthesis
        </button>
      </div>
      <button
        type="button"
        className="filter-chip table-export-button"
        onClick={() => {
          if (spliceAnalysisView === "ports") {
            downloadCsvFile(
              `analysis-splice-ports-${selectedSplice?.technicalId ?? "selection"}`,
              ["Port", "Status", "Occupant reference"],
              splicePortStatuses.map((slot) => [
                `P${slot.portIndex}`,
                slot.isOccupied ? "Occupied" : "Free",
                slot.occupantRef ?? ""
              ])
            );
            return;
          }
          downloadCsvFile(
            `analysis-splice-synthesis-${selectedSplice?.technicalId ?? "selection"}`,
            ["Wire", "Technical ID", "Local port", "Destination", "Length (mm)"],
            sortedSpliceSynthesisRows.map((row) => [
              row.wireName,
              row.wireTechnicalId,
              row.localEndpointLabel,
              row.remoteEndpointLabel,
              row.lengthMm
            ])
          );
        }}
        disabled={
          selectedSplice === null ||
          (spliceAnalysisView === "ports" ? splicePortStatuses.length === 0 : sortedSpliceSynthesisRows.length === 0)
        }
      >
        <span className="table-export-icon" aria-hidden="true" />
        CSV
      </button>
    </div>
  </header>
  {selectedSplice === null ? (
    <p className="empty-copy">Select a splice to view ports and synthesis.</p>
  ) : spliceAnalysisView === "ports" ? (
    <>
      <p className="meta-line">
        <span className="splice-badge">Junction</span> <strong>{selectedSplice.name}</strong> ({selectedSplice.technicalId})
      </p>
      <p className="meta-line">Branch count: {splicePortStatuses.filter((slot) => slot.isOccupied).length}</p>
      <form className="row-form" onSubmit={handleReservePort}>
        <label>
          Port index
          <input
            type="number"
            min={1}
            max={selectedSplice.portCount}
            step={1}
            value={portIndexInput}
            onChange={(event) => setPortIndexInput(event.target.value)}
            required
          />
        </label>

        <label>
          Occupant reference
          <input
            value={spliceOccupantRefInput}
            onChange={(event) => setSpliceOccupantRefInput(event.target.value)}
            placeholder="wire-draft-001:B"
            required
          />
        </label>

        <button type="submit">Reserve port</button>
      </form>

      <div className="cavity-grid" aria-label="Splice port occupancy grid">
        {splicePortStatuses.map((slot) => (
          <article key={slot.portIndex} className={slot.isOccupied ? "cavity is-occupied" : "cavity"}>
            <h3>P{slot.portIndex}</h3>
            <p>{slot.isOccupied ? slot.occupantRef : "Free"}</p>
            {slot.isOccupied ? (
              <button type="button" onClick={() => handleReleasePort(slot.portIndex)}>
                Release
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </>
  ) : sortedSpliceSynthesisRows.length === 0 ? (
    <p className="empty-copy">No wire currently connected to this splice.</p>
  ) : (
    <table className="data-table">
      <thead>
        <tr>
          <th>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setSpliceSynthesisSort((current) => nextSortState(current, "name"))}
            >
              Wire <span className="sort-indicator">{getSortIndicator(spliceSynthesisSort, "name")}</span>
            </button>
          </th>
          <th>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setSpliceSynthesisSort((current) => nextSortState(current, "technicalId"))}
            >
              Technical ID <span className="sort-indicator">{getSortIndicator(spliceSynthesisSort, "technicalId")}</span>
            </button>
          </th>
          <th>Local port</th>
          <th>Destination</th>
          <th>Length (mm)</th>
        </tr>
      </thead>
      <tbody>
        {sortedSpliceSynthesisRows.map((row) => (
          <tr key={`${row.wireId}-${row.localEndpointLabel}`}>
            <td>{row.wireName}</td>
            <td className="technical-id">{row.wireTechnicalId}</td>
            <td>{row.localEndpointLabel}</td>
            <td>{row.remoteEndpointLabel}</td>
            <td>{row.lengthMm}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</section>
    </>
  );
}

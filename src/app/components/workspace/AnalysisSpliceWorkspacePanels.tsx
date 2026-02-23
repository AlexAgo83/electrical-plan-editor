import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from "react";
import { formatOccupantRefForDisplay } from "../../lib/app-utils-networking";
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
    wires,
    spliceSort,
    setSpliceSort,
    spliceOccupiedCountById,
    onSelectSplice,
    onOpenSpliceOnboardingHelp,
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
  const wireTechnicalIdById = useMemo(() => new Map(wires.map((wire) => [wire.id, wire.technicalId] as const)), [wires]);
  const formatOccupantRef = (occupantRef: string | null): string =>
    occupantRef === null ? "" : formatOccupantRefForDisplay(occupantRef, wireTechnicalIdById);
  const nextFreePortIndex = splicePortStatuses.find((slot) => !slot.isOccupied)?.portIndex ?? null;
  const parsedPortIndex = Number.parseInt(portIndexInput, 10);
  const portIndexIsInteger = Number.isInteger(parsedPortIndex) && parsedPortIndex > 0;
  const selectedPortSlot = portIndexIsInteger ? splicePortStatuses.find((slot) => slot.portIndex === parsedPortIndex) ?? null : null;
  const portIsOccupied = selectedPortSlot?.isOccupied === true;
  const portIndexOutOfRange =
    selectedSplice !== null && portIndexIsInteger && (parsedPortIndex < 1 || parsedPortIndex > selectedSplice.portCount);
  const spliceReserveValidationMessage =
    selectedSplice === null || portIndexInput.trim() === ""
      ? null
      : !portIndexIsInteger
        ? "Enter a valid port index."
        : portIndexOutOfRange
          ? `Port index must be between 1 and ${selectedSplice.portCount}.`
          : portIsOccupied
            ? `Port P${parsedPortIndex} is already used (${formatOccupantRef(selectedPortSlot.occupantRef)}).${
                nextFreePortIndex === null ? " No available ports." : ` Suggested: P${nextFreePortIndex}.`
              }`
            : null;
  const canReservePort =
    selectedSplice !== null &&
    portIndexInput.trim() !== "" &&
    spliceOccupantRefInput.trim() !== "" &&
    portIndexIsInteger &&
    !portIndexOutOfRange &&
    !portIsOccupied;

  useEffect(() => {
    if (selectedSplice === null || nextFreePortIndex === null) {
      return;
    }
    setPortIndexInput(String(nextFreePortIndex));
  }, [selectedSpliceId, splicePortStatuses, nextFreePortIndex, selectedSplice, setPortIndexInput]);

  function handleReservePortSubmit(event: FormEvent<HTMLFormElement>): void {
    if (!canReservePort) {
      event.preventDefault();
      return;
    }
    handleReservePort(event);
  }

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
      {onOpenSpliceOnboardingHelp !== undefined ? (
        <button type="button" className="filter-chip onboarding-help-button" onClick={onOpenSpliceOnboardingHelp}>
          <span className="action-button-icon is-help" aria-hidden="true" />
          <span>Help</span>
        </button>
      ) : null}
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
                formatOccupantRef(slot.occupantRef)
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
      <form className="row-form" onSubmit={handleReservePortSubmit}>
        <label>
          Port index
          <input
            type="number"
            min={1}
            max={selectedSplice.portCount}
            step={1}
            value={portIndexInput}
            onChange={(event) => setPortIndexInput(event.target.value)}
            aria-invalid={spliceReserveValidationMessage !== null ? true : undefined}
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

        <button type="submit" className="button-with-icon" disabled={!canReservePort}>
          <span className="action-button-icon is-lock-move" aria-hidden="true" />
          Reserve port
        </button>
      </form>
      {spliceReserveValidationMessage !== null ? <small className="inline-error">{spliceReserveValidationMessage}</small> : null}
      {spliceReserveValidationMessage === null && nextFreePortIndex !== null ? (
        <small className="inline-help">Suggested next free port: P{nextFreePortIndex}</small>
      ) : null}
      {spliceReserveValidationMessage === null && nextFreePortIndex === null ? (
        <small className="inline-help">No available ports on this splice.</small>
      ) : null}

      <div className="cavity-grid" aria-label="Splice port occupancy grid">
        {splicePortStatuses.map((slot) => (
          <article key={slot.portIndex} className={slot.isOccupied ? "cavity is-occupied" : "cavity"}>
            <h3>P{slot.portIndex}</h3>
            <p>{slot.isOccupied ? formatOccupantRef(slot.occupantRef) : "Free"}</p>
            {slot.isOccupied ? (
              <button type="button" className="button-with-icon" onClick={() => handleReleasePort(slot.portIndex)}>
                <span className="action-button-icon is-cancel" aria-hidden="true" />
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

import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from "react";
import { formatOccupantRefForDisplay } from "../../lib/app-utils-networking";
import { nextSortState } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";

export function AnalysisConnectorWorkspacePanels(props: AnalysisWorkspaceContentProps): ReactElement {
  const {
    isConnectorSubScreen,
    selectedConnector,
    selectedConnectorId,
    connectorOccupancyFilter,
    setConnectorOccupancyFilter,
    connectors,
    visibleConnectors,
    wires,
    connectorSort,
    setConnectorSort,
    connectorOccupiedCountById,
    onSelectConnector,
    onOpenConnectorOnboardingHelp,
    cavityIndexInput,
    setCavityIndexInput,
    connectorOccupantRefInput,
    setConnectorOccupantRefInput,
    handleReserveCavity,
    connectorCavityStatuses,
    handleReleaseCavity,
    sortedConnectorSynthesisRows,
    connectorSynthesisSort,
    setConnectorSynthesisSort,
    getSortIndicator
  } = props;
  const [connectorAnalysisView, setConnectorAnalysisView] = useState<"cavities" | "synthesis">("cavities");
  const wireTechnicalIdById = useMemo(() => new Map(wires.map((wire) => [wire.id, wire.technicalId] as const)), [wires]);
  const formatOccupantRef = (occupantRef: string | null): string =>
    occupantRef === null ? "" : formatOccupantRefForDisplay(occupantRef, wireTechnicalIdById);
  const nextFreeCavityIndex = connectorCavityStatuses.find((slot) => !slot.isOccupied)?.cavityIndex ?? null;
  const parsedCavityIndex = Number.parseInt(cavityIndexInput, 10);
  const cavityIndexIsInteger = Number.isInteger(parsedCavityIndex) && parsedCavityIndex > 0;
  const selectedCavitySlot = cavityIndexIsInteger
    ? connectorCavityStatuses.find((slot) => slot.cavityIndex === parsedCavityIndex) ?? null
    : null;
  const cavityIsOccupied = selectedCavitySlot?.isOccupied === true;
  const cavityIndexOutOfRange =
    selectedConnector !== null &&
    cavityIndexIsInteger &&
    (parsedCavityIndex < 1 || parsedCavityIndex > selectedConnector.cavityCount);
  const connectorReserveValidationMessage =
    selectedConnector === null || cavityIndexInput.trim() === ""
      ? null
      : !cavityIndexIsInteger
        ? "Enter a valid way index."
        : cavityIndexOutOfRange
          ? `Way index must be between 1 and ${selectedConnector.cavityCount}.`
          : cavityIsOccupied
            ? `Way C${parsedCavityIndex} is already used (${formatOccupantRef(selectedCavitySlot.occupantRef)}).${
                nextFreeCavityIndex === null ? " No available ways." : ` Suggested: C${nextFreeCavityIndex}.`
              }`
            : null;
  const canReserveCavity =
    selectedConnector !== null &&
    cavityIndexInput.trim() !== "" &&
    connectorOccupantRefInput.trim() !== "" &&
    cavityIndexIsInteger &&
    !cavityIndexOutOfRange &&
    !cavityIsOccupied;

  useEffect(() => {
    if (selectedConnector === null || nextFreeCavityIndex === null) {
      return;
    }
    setCavityIndexInput(String(nextFreeCavityIndex));
  }, [selectedConnectorId, connectorCavityStatuses, nextFreeCavityIndex, selectedConnector, setCavityIndexInput]);

  function handleReserveCavitySubmit(event: FormEvent<HTMLFormElement>): void {
    if (!canReserveCavity) {
      event.preventDefault();
      return;
    }
    handleReserveCavity(event);
  }

  return (
    <>
<section className="panel" hidden={!isConnectorSubScreen}>
  <header className="list-panel-header">
    <h2>Connectors</h2>
    <div className="list-panel-header-tools">
      <div className="chip-group list-panel-filters" role="group" aria-label="Connector occupancy filter">
        {([
          ["all", "All"],
          ["occupied", "Occupied"],
          ["free", "Free"]
        ] as const).map(([filterId, label]) => (
          <button
            key={filterId}
            type="button"
            className={connectorOccupancyFilter === filterId ? "filter-chip is-active" : "filter-chip"}
            onClick={() => setConnectorOccupancyFilter(filterId)}
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
            "analysis-connectors",
            ["Name", "Technical ID", "Ways", "Occupied"],
            visibleConnectors.map((connector) => [
              connector.name,
              connector.technicalId,
              connector.cavityCount,
              connectorOccupiedCountById.get(connector.id) ?? 0
            ])
          )
        }
        disabled={visibleConnectors.length === 0}
      >
        <span className="table-export-icon" aria-hidden="true" />
        CSV
      </button>
      {onOpenConnectorOnboardingHelp !== undefined ? (
        <button type="button" className="filter-chip onboarding-help-button" onClick={onOpenConnectorOnboardingHelp}>
          <span className="action-button-icon is-help" aria-hidden="true" />
          <span>Help</span>
        </button>
      ) : null}
    </div>
  </header>
  {connectors.length === 0 ? (
    <p className="empty-copy">No connector yet.</p>
  ) : visibleConnectors.length === 0 ? (
    <p className="empty-copy">No connector matches the current filters.</p>
  ) : (
    <table className="data-table">
      <thead>
        <tr>
          <th>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setConnectorSort((current) => nextSortState(current, "name"))}
            >
              Name <span className="sort-indicator">{getSortIndicator(connectorSort, "name")}</span>
            </button>
          </th>
          <th>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setConnectorSort((current) => nextSortState(current, "technicalId"))}
            >
              Technical ID <span className="sort-indicator">{getSortIndicator(connectorSort, "technicalId")}</span>
            </button>
          </th>
          <th>Ways</th>
          <th>Occupied</th>
        </tr>
      </thead>
      <tbody>
        {visibleConnectors.map((connector) => {
          const occupiedCount = connectorOccupiedCountById.get(connector.id) ?? 0;
          const isSelected = selectedConnectorId === connector.id;
          return (
            <tr
              key={connector.id}
              className={isSelected ? "is-selected is-focusable-row" : "is-focusable-row"}
              aria-selected={isSelected}
              tabIndex={0}
              onClick={() => onSelectConnector(connector.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectConnector(connector.id);
                }
              }}
            >
              <td>{connector.name}</td>
              <td className="technical-id">{connector.technicalId}</td>
              <td>{connector.cavityCount}</td>
              <td>{occupiedCount}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  )}
</section>

<section className="panel" hidden={!isConnectorSubScreen}>
  <header className="list-panel-header">
    <h2>Connector analysis</h2>
    <div className="list-panel-header-tools">
      <div className="chip-group list-panel-filters" role="group" aria-label="Connector analysis view">
        <button
          type="button"
          className={connectorAnalysisView === "cavities" ? "filter-chip is-active" : "filter-chip"}
          onClick={() => setConnectorAnalysisView("cavities")}
        >
          Ways
        </button>
        <button
          type="button"
          className={connectorAnalysisView === "synthesis" ? "filter-chip is-active" : "filter-chip"}
          onClick={() => setConnectorAnalysisView("synthesis")}
        >
          Synthesis
        </button>
      </div>
      <button
        type="button"
        className="filter-chip table-export-button"
        onClick={() => {
          if (connectorAnalysisView === "cavities") {
            downloadCsvFile(
              `analysis-connector-ways-${selectedConnector?.technicalId ?? "selection"}`,
              ["Way", "Status", "Occupant reference"],
              connectorCavityStatuses.map((slot) => [
                `C${slot.cavityIndex}`,
                slot.isOccupied ? "Occupied" : "Free",
                formatOccupantRef(slot.occupantRef)
              ])
            );
            return;
          }
          downloadCsvFile(
            `analysis-connector-synthesis-${selectedConnector?.technicalId ?? "selection"}`,
            ["Wire", "Technical ID", "Local way", "Destination", "Length (mm)"],
            sortedConnectorSynthesisRows.map((row) => [
              row.wireName,
              row.wireTechnicalId,
              row.localEndpointLabel,
              row.remoteEndpointLabel,
              row.lengthMm
            ])
          );
        }}
        disabled={
          selectedConnector === null ||
          (connectorAnalysisView === "cavities"
            ? connectorCavityStatuses.length === 0
            : sortedConnectorSynthesisRows.length === 0)
        }
      >
        <span className="table-export-icon" aria-hidden="true" />
        CSV
      </button>
    </div>
  </header>
  {selectedConnector === null ? (
    <p className="empty-copy">Select a connector to view ways and synthesis.</p>
  ) : connectorAnalysisView === "cavities" ? (
    <>
      <p className="meta-line">
        <strong>{selectedConnector.name}</strong> ({selectedConnector.technicalId})
      </p>
      <form className="row-form" onSubmit={handleReserveCavitySubmit}>
        <label>
          Way index
          <input
            type="number"
            min={1}
            max={selectedConnector.cavityCount}
            step={1}
            value={cavityIndexInput}
            onChange={(event) => setCavityIndexInput(event.target.value)}
            aria-invalid={connectorReserveValidationMessage !== null ? true : undefined}
            required
          />
        </label>

        <label>
          Occupant reference
          <input
            value={connectorOccupantRefInput}
            onChange={(event) => setConnectorOccupantRefInput(event.target.value)}
            placeholder="wire-draft-001:A"
            required
          />
        </label>

        <button type="submit" className="button-with-icon" disabled={!canReserveCavity}>
          <span className="action-button-icon is-lock-move" aria-hidden="true" />
          Reserve way
        </button>
      </form>
      {connectorReserveValidationMessage !== null ? <small className="inline-error">{connectorReserveValidationMessage}</small> : null}
      {connectorReserveValidationMessage === null && nextFreeCavityIndex !== null ? (
        <small className="inline-help">Suggested next free way: C{nextFreeCavityIndex}</small>
      ) : null}
      {connectorReserveValidationMessage === null && nextFreeCavityIndex === null ? (
        <small className="inline-help">No available ways on this connector.</small>
      ) : null}

      <div className="cavity-grid" aria-label="Way occupancy grid">
        {connectorCavityStatuses.map((slot) => (
          <article key={slot.cavityIndex} className={slot.isOccupied ? "cavity is-occupied" : "cavity"}>
            <h3>C{slot.cavityIndex}</h3>
            <p>{slot.isOccupied ? formatOccupantRef(slot.occupantRef) : "Free"}</p>
            {slot.isOccupied ? (
              <button type="button" className="button-with-icon" onClick={() => handleReleaseCavity(slot.cavityIndex)}>
                <span className="action-button-icon is-cancel" aria-hidden="true" />
                Release
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </>
  ) : sortedConnectorSynthesisRows.length === 0 ? (
    <p className="empty-copy">No wire currently connected to this connector.</p>
  ) : (
    <table className="data-table">
      <thead>
        <tr>
          <th>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setConnectorSynthesisSort((current) => nextSortState(current, "name"))}
            >
              Wire <span className="sort-indicator">{getSortIndicator(connectorSynthesisSort, "name")}</span>
            </button>
          </th>
          <th>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setConnectorSynthesisSort((current) => nextSortState(current, "technicalId"))}
            >
              Technical ID <span className="sort-indicator">{getSortIndicator(connectorSynthesisSort, "technicalId")}</span>
            </button>
          </th>
          <th>Local way</th>
          <th>Destination</th>
          <th>Length (mm)</th>
        </tr>
      </thead>
      <tbody>
        {sortedConnectorSynthesisRows.map((row) => (
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

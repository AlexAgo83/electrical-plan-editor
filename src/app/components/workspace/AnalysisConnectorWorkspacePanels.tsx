import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from "react";
import { formatOccupantRefForDisplay } from "../../lib/app-utils-networking";
import { sortByTableColumns } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import { renderWireColorPrefixMarker } from "../../lib/wireColorPresentation";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";

export function AnalysisConnectorWorkspacePanels(props: AnalysisWorkspaceContentProps): ReactElement {
  const {
    isConnectorSubScreen,
    selectedConnector,
    selectedConnectorId,
    connectorOccupancyFilter,
    setConnectorOccupancyFilter,
    connectorFilterField,
    setConnectorFilterField,
    connectorFilterQuery,
    setConnectorFilterQuery,
    connectors,
    visibleConnectors,
    wires,
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
    showEntityTables = true,
    sortedConnectorSynthesisRows,
    connectorSynthesisSort: _connectorSynthesisSort,
    setConnectorSynthesisSort: _setConnectorSynthesisSort,
    getSortIndicator: _getSortIndicator
  } = props;
  void _connectorSynthesisSort;
  void _setConnectorSynthesisSort;
  void _getSortIndicator;
  type ConnectorAnalysisTableSortField = "name" | "technicalId" | "manufacturerReference" | "cavityCount" | "occupiedCount";
  type ConnectorSynthesisTableSortField = "name" | "technicalId" | "localWay" | "destination" | "lengthMm";
  const [connectorAnalysisView, setConnectorAnalysisView] = useState<"cavities" | "synthesis">("cavities");
  const [connectorTableSort, setConnectorTableSort] = useState<{ field: ConnectorAnalysisTableSortField; direction: "asc" | "desc" }>({ field: "name", direction: "asc" });
  const [connectorSynthesisTableSort, setConnectorSynthesisTableSort] = useState<{ field: ConnectorSynthesisTableSortField; direction: "asc" | "desc" }>({ field: "name", direction: "asc" });
  const connectorFilterPlaceholder =
    connectorFilterField === "name" ? "Connector name" : connectorFilterField === "technicalId" ? "Technical ID" : "Name or technical ID...";
  const sortedVisibleConnectors = useMemo(
    () =>
      sortByTableColumns(
        visibleConnectors,
        connectorTableSort,
        (connector, field) => {
          if (field === "name") return connector.name;
          if (field === "technicalId") return connector.technicalId;
          if (field === "manufacturerReference") return connector.manufacturerReference;
          if (field === "cavityCount") return connector.cavityCount;
          return connectorOccupiedCountById.get(connector.id) ?? 0;
        },
        (connector) => connector.id
      ),
    [connectorOccupiedCountById, connectorTableSort, visibleConnectors]
  );
  const wireTechnicalIdById = useMemo(() => new Map(wires.map((wire) => [wire.id, wire.technicalId] as const)), [wires]);
  const wireById = useMemo(() => new Map(wires.map((wire) => [wire.id, wire] as const)), [wires]);
  const formatOccupantRef = (occupantRef: string | null): string =>
    occupantRef === null ? "" : formatOccupantRefForDisplay(occupantRef, wireTechnicalIdById);
  const sortedConnectorSynthesisRowsByColumns = useMemo(
    () =>
      sortByTableColumns(
        sortedConnectorSynthesisRows,
        connectorSynthesisTableSort,
        (row, field) => {
          if (field === "name") return row.wireName;
          if (field === "technicalId") return row.wireTechnicalId;
          if (field === "localWay") return row.localEndpointLabel;
          if (field === "destination") return row.remoteEndpointLabel;
          return row.lengthMm;
        },
        (row) => `${row.wireId}-${row.localEndpointLabel}`
      ),
    [connectorSynthesisTableSort, sortedConnectorSynthesisRows]
  );
  const connectorListSortIndicator = (field: ConnectorAnalysisTableSortField) =>
    connectorTableSort.field === field ? (connectorTableSort.direction === "asc" ? "▲" : "▼") : "";
  const connectorSynthesisSortIndicator = (field: ConnectorSynthesisTableSortField) =>
    connectorSynthesisTableSort.field === field ? (connectorSynthesisTableSort.direction === "asc" ? "▲" : "▼") : "";
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
<section className="panel" hidden={!isConnectorSubScreen || !showEntityTables}>
  <header className="list-panel-header">
    <h2>Connectors</h2>
    <div className="list-panel-header-tools">
      <div className="list-panel-header-tools-row">
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
              ["Name", "Technical ID", "Mfr Ref", "Ways", "Occupied"],
              sortedVisibleConnectors.map((connector) => [
                connector.name,
                connector.technicalId,
                connector.manufacturerReference ?? "",
                connector.cavityCount,
                connectorOccupiedCountById.get(connector.id) ?? 0
              ])
            )
          }
          disabled={sortedVisibleConnectors.length === 0}
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
      <div className="list-panel-header-tools-row">
        <TableFilterBar
          label="Filter"
          fieldLabel="Connector filter field"
          fieldValue={connectorFilterField}
          onFieldChange={(value) => setConnectorFilterField(value as "name" | "technicalId" | "any")}
          fieldOptions={[
            { value: "name", label: "Name" },
            { value: "technicalId", label: "Technical ID" },
            { value: "any", label: "Any" }
          ]}
          queryValue={connectorFilterQuery}
          onQueryChange={setConnectorFilterQuery}
          placeholder={connectorFilterPlaceholder}
        />
      </div>
    </div>
  </header>
  {connectors.length === 0 ? (
    <p className="empty-copy">No connector yet.</p>
  ) : sortedVisibleConnectors.length === 0 ? (
    <>
      <p className="empty-copy">No connector matches the current filters.</p>
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
                setConnectorTableSort((current) => ({
                  field: "name",
                  direction: current.field === "name" && current.direction === "asc" ? "desc" : "asc"
                }))
              }
            >
              Name <span className="sort-indicator">{connectorListSortIndicator("name")}</span>
            </button>
          </th>
          <th>
            <button
              type="button"
              className="sort-header-button"
              onClick={() =>
                setConnectorTableSort((current) => ({
                  field: "technicalId",
                  direction: current.field === "technicalId" && current.direction === "asc" ? "desc" : "asc"
                }))
              }
            >
              Technical ID <span className="sort-indicator">{connectorListSortIndicator("technicalId")}</span>
            </button>
          </th>
          <th>
            <button type="button" className="sort-header-button" onClick={() => setConnectorTableSort((current) => ({ field: "manufacturerReference", direction: current.field === "manufacturerReference" && current.direction === "asc" ? "desc" : "asc" }))}>
              Mfr Ref <span className="sort-indicator">{connectorListSortIndicator("manufacturerReference")}</span>
            </button>
          </th>
          <th>
            <button type="button" className="sort-header-button" onClick={() => setConnectorTableSort((current) => ({ field: "cavityCount", direction: current.field === "cavityCount" && current.direction === "asc" ? "desc" : "asc" }))}>
              Ways <span className="sort-indicator">{connectorListSortIndicator("cavityCount")}</span>
            </button>
          </th>
          <th>
            <button type="button" className="sort-header-button" onClick={() => setConnectorTableSort((current) => ({ field: "occupiedCount", direction: current.field === "occupiedCount" && current.direction === "asc" ? "desc" : "asc" }))}>
              Occupied <span className="sort-indicator">{connectorListSortIndicator("occupiedCount")}</span>
            </button>
          </th>
          </tr>
        </thead>
        <tbody>
          {sortedVisibleConnectors.map((connector) => {
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
                <td className="technical-id">{connector.manufacturerReference ?? ""}</td>
                <td>{connector.cavityCount}</td>
                <td>{occupiedCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <TableEntryCountFooter count={sortedVisibleConnectors.length} />
    </>
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
            sortedConnectorSynthesisRowsByColumns.map((row) => [
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
            : sortedConnectorSynthesisRowsByColumns.length === 0)
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
  ) : sortedConnectorSynthesisRowsByColumns.length === 0 ? (
    <p className="empty-copy">No wire currently connected to this connector.</p>
  ) : (
    <table className="data-table">
      <thead>
        <tr>
          <th>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "name", direction: current.field === "name" && current.direction === "asc" ? "desc" : "asc" }))}
            >
              Wire <span className="sort-indicator">{connectorSynthesisSortIndicator("name")}</span>
            </button>
          </th>
          <th>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "technicalId", direction: current.field === "technicalId" && current.direction === "asc" ? "desc" : "asc" }))}
            >
              Technical ID <span className="sort-indicator">{connectorSynthesisSortIndicator("technicalId")}</span>
            </button>
          </th>
          <th><button type="button" className="sort-header-button" onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "localWay", direction: current.field === "localWay" && current.direction === "asc" ? "desc" : "asc" }))}>Local way <span className="sort-indicator">{connectorSynthesisSortIndicator("localWay")}</span></button></th>
          <th><button type="button" className="sort-header-button" onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "destination", direction: current.field === "destination" && current.direction === "asc" ? "desc" : "asc" }))}>Destination <span className="sort-indicator">{connectorSynthesisSortIndicator("destination")}</span></button></th>
          <th><button type="button" className="sort-header-button" onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "lengthMm", direction: current.field === "lengthMm" && current.direction === "asc" ? "desc" : "asc" }))}>Length (mm) <span className="sort-indicator">{connectorSynthesisSortIndicator("lengthMm")}</span></button></th>
        </tr>
      </thead>
      <tbody>
        {sortedConnectorSynthesisRowsByColumns.map((row) => {
          const wire = wireById.get(row.wireId);
          return (
          <tr key={`${row.wireId}-${row.localEndpointLabel}`}>
            <td>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                {renderWireColorPrefixMarker(wire)}
                <span>{row.wireName}</span>
              </span>
            </td>
            <td className="technical-id">
              <span>{row.wireTechnicalId}</span>
              {row.wireName.trim().length > 0 ? <span className="table-secondary-line">{row.wireName}</span> : null}
            </td>
            <td>{row.localEndpointLabel}</td>
            <td>{row.remoteEndpointLabel}</td>
            <td>{row.lengthMm}</td>
          </tr>
          );
        })}
      </tbody>
    </table>
  )}
</section>
    </>
  );
}

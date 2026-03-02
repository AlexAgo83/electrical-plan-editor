import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from "react";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { getTableAriaSort } from "../../lib/accessibility";
import { formatOccupantRefForDisplay, parseWireOccupantRef } from "../../lib/app-utils-networking";
import { sortByTableColumns } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import { renderWireColorPrefixMarker } from "../../lib/wireColorPresentation";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";

export function AnalysisSpliceWorkspacePanels(props: AnalysisWorkspaceContentProps): ReactElement {
  const {
    isSpliceSubScreen,
    selectedSplice,
    selectedSpliceId,
    spliceOccupancyFilter,
    setSpliceOccupancyFilter,
    spliceFilterField,
    setSpliceFilterField,
    spliceFilterQuery,
    setSpliceFilterQuery,
    splices,
    visibleSplices,
    wires,
    spliceSort: _spliceSort,
    setSpliceSort: _setSpliceSort,
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
    onGoToWireFromAnalysis,
    showEntityTables = true,
    sortedSpliceSynthesisRows,
    spliceSynthesisSort: _spliceSynthesisSort,
    setSpliceSynthesisSort: _setSpliceSynthesisSort,
    getSortIndicator: _getSortIndicator
  } = props;
  void _spliceSort;
  void _setSpliceSort;
  void _spliceSynthesisSort;
  void _setSpliceSynthesisSort;
  void _getSortIndicator;
  type SpliceAnalysisTableSortField = "name" | "technicalId" | "manufacturerReference" | "portCount" | "branchCount";
  type SpliceSynthesisTableSortField = "name" | "technicalId" | "localPort" | "destination" | "lengthMm";
  const isMobileViewport = useIsMobileViewport();
  const [spliceAnalysisView, setSpliceAnalysisView] = useState<"ports" | "synthesis">("ports");
  const [spliceTableSort, setSpliceTableSort] = useState<{ field: SpliceAnalysisTableSortField; direction: "asc" | "desc" }>({ field: "name", direction: "asc" });
  const [spliceSynthesisTableSort, setSpliceSynthesisTableSort] = useState<{ field: SpliceSynthesisTableSortField; direction: "asc" | "desc" }>({ field: "name", direction: "asc" });
  const spliceFilterPlaceholder =
    spliceFilterField === "name" ? "Splice name" : spliceFilterField === "technicalId" ? "Technical ID" : "Name or technical ID...";
  const sortedVisibleSplices = useMemo(
    () =>
      sortByTableColumns(
        visibleSplices,
        spliceTableSort,
        (splice, field) => {
          if (field === "name") return splice.name;
          if (field === "technicalId") return splice.technicalId;
          if (field === "manufacturerReference") return splice.manufacturerReference;
          if (field === "portCount") return splice.portCount;
          return spliceOccupiedCountById.get(splice.id) ?? 0;
        },
        (splice) => splice.id
      ),
    [spliceOccupiedCountById, spliceTableSort, visibleSplices]
  );
  const wireTechnicalIdById = useMemo(() => new Map(wires.map((wire) => [wire.id, wire.technicalId] as const)), [wires]);
  const wireById = useMemo(() => new Map(wires.map((wire) => [wire.id, wire] as const)), [wires]);
  const formatOccupantRef = (occupantRef: string | null): string =>
    occupantRef === null ? "" : formatOccupantRefForDisplay(occupantRef, wireTechnicalIdById);
  const sortedSpliceSynthesisRowsByColumns = useMemo(
    () =>
      sortByTableColumns(
        sortedSpliceSynthesisRows,
        spliceSynthesisTableSort,
        (row, field) => {
          if (field === "name") return row.wireName;
          if (field === "technicalId") return row.wireTechnicalId;
          if (field === "localPort") return row.localEndpointLabel;
          if (field === "destination") return row.remoteEndpointLabel;
          return row.lengthMm;
        },
        (row) => `${row.wireId}-${row.localEndpointLabel}`
      ),
    [sortedSpliceSynthesisRows, spliceSynthesisTableSort]
  );
  const spliceListSortIndicator = (field: SpliceAnalysisTableSortField) =>
    spliceTableSort.field === field ? (spliceTableSort.direction === "asc" ? "▲" : "▼") : "";
  const spliceSynthesisSortIndicator = (field: SpliceSynthesisTableSortField) =>
    spliceSynthesisTableSort.field === field ? (spliceSynthesisTableSort.direction === "asc" ? "▲" : "▼") : "";
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
    if (selectedSplice === null) {
      return;
    }
    if (nextFreePortIndex === null) {
      setPortIndexInput("");
      return;
    }
    if (nextFreePortIndex < 1 || nextFreePortIndex > selectedSplice.portCount) {
      setPortIndexInput("");
      return;
    }
    const suggestedSlot = splicePortStatuses.find((slot) => slot.portIndex === nextFreePortIndex) ?? null;
    if (suggestedSlot === null || suggestedSlot.isOccupied) {
      setPortIndexInput("");
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
<section className="panel" hidden={!isSpliceSubScreen || !showEntityTables}>
  <header className="list-panel-header list-panel-header-mobile-inline-tools">
    <h2>Splices</h2>
    <div className="list-panel-header-tools">
      <div className="list-panel-header-tools-row is-title-actions">
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
              ["Name", "Technical ID", "Mfr Ref", "Ports", "Branches"],
              sortedVisibleSplices.map((splice) => [
                splice.name,
                splice.technicalId,
                splice.manufacturerReference ?? "",
                splice.portCount,
                spliceOccupiedCountById.get(splice.id) ?? 0
              ])
            )
          }
          disabled={sortedVisibleSplices.length === 0}
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
      <div className="list-panel-header-tools-row is-filter-row">
        <TableFilterBar
          label="Filter"
          fieldLabel="Splice filter field"
          fieldValue={spliceFilterField}
          onFieldChange={(value) => setSpliceFilterField(value as "name" | "technicalId" | "any")}
          fieldOptions={[
            { value: "name", label: "Name" },
            { value: "technicalId", label: "Technical ID" },
            { value: "any", label: "Any" }
          ]}
          queryValue={spliceFilterQuery}
          onQueryChange={setSpliceFilterQuery}
          placeholder={spliceFilterPlaceholder}
        />
      </div>
    </div>
  </header>
  {splices.length === 0 ? (
    <p className="empty-copy">No splice yet.</p>
  ) : sortedVisibleSplices.length === 0 ? (
    <>
      <p className="empty-copy">No splice matches the current filters.</p>
      <TableEntryCountFooter count={0} />
    </>
  ) : (
    <>
      <table className="data-table">
        <thead>
          <tr>
          <th aria-sort={getTableAriaSort(spliceTableSort, "name")}>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setSpliceTableSort((current) => ({ field: "name", direction: current.field === "name" && current.direction === "asc" ? "desc" : "asc" }))}
            >
              Name <span className="sort-indicator">{spliceListSortIndicator("name")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(spliceTableSort, "technicalId")}>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setSpliceTableSort((current) => ({ field: "technicalId", direction: current.field === "technicalId" && current.direction === "asc" ? "desc" : "asc" }))}
            >
              {isMobileViewport ? "ID" : "Technical ID"} <span className="sort-indicator">{spliceListSortIndicator("technicalId")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(spliceTableSort, "manufacturerReference")}><button type="button" className="sort-header-button" onClick={() => setSpliceTableSort((current) => ({ field: "manufacturerReference", direction: current.field === "manufacturerReference" && current.direction === "asc" ? "desc" : "asc" }))}>Mfr Ref <span className="sort-indicator">{spliceListSortIndicator("manufacturerReference")}</span></button></th>
          <th aria-sort={getTableAriaSort(spliceTableSort, "portCount")}><button type="button" className="sort-header-button" onClick={() => setSpliceTableSort((current) => ({ field: "portCount", direction: current.field === "portCount" && current.direction === "asc" ? "desc" : "asc" }))}>Ports <span className="sort-indicator">{spliceListSortIndicator("portCount")}</span></button></th>
          <th aria-sort={getTableAriaSort(spliceTableSort, "branchCount")}><button type="button" className="sort-header-button" onClick={() => setSpliceTableSort((current) => ({ field: "branchCount", direction: current.field === "branchCount" && current.direction === "asc" ? "desc" : "asc" }))}>Branches <span className="sort-indicator">{spliceListSortIndicator("branchCount")}</span></button></th>
          </tr>
        </thead>
        <tbody>
          {sortedVisibleSplices.map((splice) => {
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
                <td className="technical-id">{splice.manufacturerReference ?? ""}</td>
                <td>{splice.portCount}</td>
                <td>{occupiedCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <TableEntryCountFooter count={sortedVisibleSplices.length} />
    </>
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
            sortedSpliceSynthesisRowsByColumns.map((row) => [
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
          (spliceAnalysisView === "ports" ? splicePortStatuses.length === 0 : sortedSpliceSynthesisRowsByColumns.length === 0)
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
        {splicePortStatuses.map((slot) => {
          const parsedOccupantRef = slot.occupantRef === null ? null : parseWireOccupantRef(slot.occupantRef);
          const canGoToWire =
            parsedOccupantRef !== null &&
            wireById.has(parsedOccupantRef.wireId);

          return (
            <article key={slot.portIndex} className={slot.isOccupied ? "cavity is-occupied" : "cavity"}>
              <h3>P{slot.portIndex}</h3>
              <p>{slot.isOccupied ? formatOccupantRef(slot.occupantRef) : "Free"}</p>
              {slot.isOccupied ? (
                <div className="cavity-actions">
                  <button
                    type="button"
                    className="validation-row-go-to-button button-with-icon"
                    disabled={!canGoToWire}
                    onClick={() => {
                      if (!canGoToWire || parsedOccupantRef === null) {
                        return;
                      }
                      onGoToWireFromAnalysis(parsedOccupantRef.wireId);
                    }}
                  >
                    <span className="action-button-icon is-open" aria-hidden="true" />
                    Go to
                  </button>
                  <button type="button" className="button-with-icon" onClick={() => handleReleasePort(slot.portIndex)}>
                    <span className="action-button-icon is-cancel" aria-hidden="true" />
                    Release
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </>
  ) : sortedSpliceSynthesisRowsByColumns.length === 0 ? (
    <p className="empty-copy">No wire currently connected to this splice.</p>
  ) : (
    <table className="data-table">
      <thead>
        <tr>
          <th aria-sort={getTableAriaSort(spliceSynthesisTableSort, "name")}>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setSpliceSynthesisTableSort((current) => ({ field: "name", direction: current.field === "name" && current.direction === "asc" ? "desc" : "asc" }))}
            >
              Wire <span className="sort-indicator">{spliceSynthesisSortIndicator("name")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(spliceSynthesisTableSort, "technicalId")}>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setSpliceSynthesisTableSort((current) => ({ field: "technicalId", direction: current.field === "technicalId" && current.direction === "asc" ? "desc" : "asc" }))}
            >
              {isMobileViewport ? "ID" : "Technical ID"} <span className="sort-indicator">{spliceSynthesisSortIndicator("technicalId")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(spliceSynthesisTableSort, "localPort")}><button type="button" className="sort-header-button" onClick={() => setSpliceSynthesisTableSort((current) => ({ field: "localPort", direction: current.field === "localPort" && current.direction === "asc" ? "desc" : "asc" }))}>Local port <span className="sort-indicator">{spliceSynthesisSortIndicator("localPort")}</span></button></th>
          <th aria-sort={getTableAriaSort(spliceSynthesisTableSort, "destination")}><button type="button" className="sort-header-button" onClick={() => setSpliceSynthesisTableSort((current) => ({ field: "destination", direction: current.field === "destination" && current.direction === "asc" ? "desc" : "asc" }))}>Destination <span className="sort-indicator">{spliceSynthesisSortIndicator("destination")}</span></button></th>
          <th aria-sort={getTableAriaSort(spliceSynthesisTableSort, "lengthMm")}><button type="button" className="sort-header-button" onClick={() => setSpliceSynthesisTableSort((current) => ({ field: "lengthMm", direction: current.field === "lengthMm" && current.direction === "asc" ? "desc" : "asc" }))}>{isMobileViewport ? "Len" : "Length (mm)"} <span className="sort-indicator">{spliceSynthesisSortIndicator("lengthMm")}</span></button></th>
        </tr>
      </thead>
      <tbody>
        {sortedSpliceSynthesisRowsByColumns.map((row) => {
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
              {row.wireTechnicalId}
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

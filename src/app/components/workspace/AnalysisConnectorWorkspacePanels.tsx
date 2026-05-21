import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from "react";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { getTableAriaSort } from "../../lib/accessibility";
import { formatOccupantRefForDisplay, parseWireOccupantRef } from "../../lib/app-utils-networking";
import { sortByTableColumns } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import { renderWireColorPrefixMarker } from "../../lib/wireColorPresentation";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";
import { ConnectorPhysicalView } from "./ConnectorPhysicalView";
import { EntityReferenceButton } from "./EntityReferenceButton";
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
    catalogItems,
    visibleConnectors,
    wires,
    connectorOccupiedCountById,
    onSelectConnector,
    onSelectCatalogItem,
    onOpenConnectorOnboardingHelp,
    cavityIndexInput,
    setCavityIndexInput,
    connectorOccupantRefInput,
    setConnectorOccupantRefInput,
    handleReserveCavity,
    connectorCavityStatuses,
    handleReleaseCavity,
    onGoToWireFromAnalysis,
    onOpenWireFromAnalysisTable,
    onOpenConnectorFromAnalysisTable,
    onOpenSpliceFromAnalysisTable,
    showEntityTables = true,
    sortedConnectorSynthesisRows,
    connectorSynthesisSort: _connectorSynthesisSort,
    setConnectorSynthesisSort: _setConnectorSynthesisSort,
    connectorAnalysisView,
    setConnectorAnalysisView,
    getSortIndicator: _getSortIndicator
  } = props;
  void _connectorSynthesisSort;
  void _setConnectorSynthesisSort;
  void _getSortIndicator;
  type ConnectorAnalysisTableSortField = "name" | "technicalId" | "manufacturerReference" | "cavityCount" | "occupiedCount";
  type ConnectorSynthesisTableSortField = "name" | "technicalId" | "localWay" | "destination" | "lengthMm";
  const isMobileViewport = useIsMobileViewport();
  const [connectorTableSort, setConnectorTableSort] = useState<{ field: ConnectorAnalysisTableSortField; direction: "asc" | "desc" }>({ field: "name", direction: "asc" });
  const [connectorSynthesisTableSort, setConnectorSynthesisTableSort] = useState<{ field: ConnectorSynthesisTableSortField; direction: "asc" | "desc" }>({ field: "name", direction: "asc" });
  const catalogItemById = useMemo(() => new Map(catalogItems.map((item) => [item.id, item] as const)), [catalogItems]);
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
  const renderConnectorOccupantRef = (occupantRef: string | null): ReactElement => {
    if (occupantRef === null) {
      return <span>Free</span>;
    }
    const parsed = parseWireOccupantRef(occupantRef);
    if (parsed === null) {
      return <span>{occupantRef}</span>;
    }
    const technicalId = wireTechnicalIdById.get(parsed.wireId) ?? parsed.wireId;
    return (
      <span className="cavity-occupant-ref" aria-label={`Wire ${technicalId} / ${parsed.side}`}>
        <span>{technicalId} / {parsed.side}</span>
      </span>
    );
  };
  const parseOccupantWireId = (occupantRef: string | null) => {
    const parsed = occupantRef === null ? null : parseWireOccupantRef(occupantRef);
    return parsed !== null && wireById.has(parsed.wireId) ? parsed.wireId : null;
  };
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
  const renderDestinationReference = (row: (typeof sortedConnectorSynthesisRowsByColumns)[number]): ReactElement => {
    if (row.remoteEndpoint.kind === "connectorCavity") {
      const connectorId = row.remoteEndpoint.connectorId;
      return (
        <EntityReferenceButton
          title={`Open connector ${row.remoteEndpointLabel}`}
          onClick={() => onOpenConnectorFromAnalysisTable(connectorId)}
        >
          {row.remoteEndpointLabel}
        </EntityReferenceButton>
      );
    }

    const spliceId = row.remoteEndpoint.spliceId;
    return (
      <EntityReferenceButton
        title={`Open splice ${row.remoteEndpointLabel}`}
        onClick={() => onOpenSpliceFromAnalysisTable(spliceId)}
      >
        {row.remoteEndpointLabel}
      </EntityReferenceButton>
    );
  };
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
    if (selectedConnector === null) {
      return;
    }
    if (nextFreeCavityIndex === null) {
      setCavityIndexInput("");
      return;
    }
    if (nextFreeCavityIndex < 1 || nextFreeCavityIndex > selectedConnector.cavityCount) {
      setCavityIndexInput("");
      return;
    }
    const suggestedSlot = connectorCavityStatuses.find((slot) => slot.cavityIndex === nextFreeCavityIndex) ?? null;
    if (suggestedSlot === null || suggestedSlot.isOccupied) {
      setCavityIndexInput("");
      return;
    }
    setCavityIndexInput(String(nextFreeCavityIndex));
  }, [
    selectedConnectorId,
    connectorCavityStatuses,
    nextFreeCavityIndex,
    selectedConnector,
    setCavityIndexInput
  ]);

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
  <header className="list-panel-header list-panel-header-mobile-inline-tools">
    <h2>Connectors</h2>
    <div className="list-panel-header-tools">
      <div className="list-panel-header-tools-row is-title-actions">
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
      <div className="list-panel-header-tools-row is-filter-row">
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
          <th aria-sort={getTableAriaSort(connectorTableSort, "name")}>
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
          <th aria-sort={getTableAriaSort(connectorTableSort, "technicalId")}>
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
              {isMobileViewport ? "ID" : "Technical ID"} <span className="sort-indicator">{connectorListSortIndicator("technicalId")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(connectorTableSort, "manufacturerReference")}>
            <button type="button" className="sort-header-button" onClick={() => setConnectorTableSort((current) => ({ field: "manufacturerReference", direction: current.field === "manufacturerReference" && current.direction === "asc" ? "desc" : "asc" }))}>
              Mfr Ref <span className="sort-indicator">{connectorListSortIndicator("manufacturerReference")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(connectorTableSort, "cavityCount")}>
            <button type="button" className="sort-header-button" onClick={() => setConnectorTableSort((current) => ({ field: "cavityCount", direction: current.field === "cavityCount" && current.direction === "asc" ? "desc" : "asc" }))}>
              Ways <span className="sort-indicator">{connectorListSortIndicator("cavityCount")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(connectorTableSort, "occupiedCount")}>
            <button type="button" className="sort-header-button" onClick={() => setConnectorTableSort((current) => ({ field: "occupiedCount", direction: current.field === "occupiedCount" && current.direction === "asc" ? "desc" : "asc" }))}>
              {isMobileViewport ? "Occup." : "Occupied"} <span className="sort-indicator">{connectorListSortIndicator("occupiedCount")}</span>
            </button>
          </th>
          </tr>
        </thead>
        <tbody>
          {sortedVisibleConnectors.map((connector) => {
            const occupiedCount = connectorOccupiedCountById.get(connector.id) ?? 0;
            const isSelected = selectedConnectorId === connector.id;
            const linkedCatalogItemId = connector.catalogItemId;
            const linkedCatalogItem = linkedCatalogItemId === undefined ? undefined : catalogItemById.get(linkedCatalogItemId);
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
                <td className="technical-id">
                  {linkedCatalogItemId !== undefined && linkedCatalogItem !== undefined ? (
                    <EntityReferenceButton
                      className="technical-id"
                      title={`Open catalog item ${connector.manufacturerReference ?? linkedCatalogItem.manufacturerReference}`}
                      onClick={() => onSelectCatalogItem(linkedCatalogItemId)}
                    >
                      {connector.manufacturerReference ?? linkedCatalogItem.manufacturerReference}
                    </EntityReferenceButton>
                  ) : (
                    connector.manufacturerReference ?? ""
                  )}
                </td>
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
          aria-pressed={connectorAnalysisView === "cavities"}
          onClick={() => setConnectorAnalysisView("cavities")}
        >
          Ways
        </button>
        <button
          type="button"
          className={connectorAnalysisView === "physical" ? "filter-chip is-active" : "filter-chip"}
          aria-pressed={connectorAnalysisView === "physical"}
          onClick={() => setConnectorAnalysisView("physical")}
        >
          Physical
        </button>
        <button
          type="button"
          className={connectorAnalysisView === "synthesis" ? "filter-chip is-active" : "filter-chip"}
          aria-pressed={connectorAnalysisView === "synthesis"}
          onClick={() => setConnectorAnalysisView("synthesis")}
        >
          Synthesis
        </button>
      </div>
      <button
        type="button"
        className="filter-chip table-export-button"
        onClick={() => {
          if (connectorAnalysisView === "cavities" || connectorAnalysisView === "physical") {
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
            || connectorAnalysisView === "physical"
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
      <div className="connector-ways-view">
        <section className="connector-ways-assignment-panel" aria-label="Manual way assignment">
          <form className="row-form connector-ways-assignment-form" onSubmit={handleReserveCavitySubmit}>
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
        </section>

        <div className="cavity-grid connector-ways-cavity-grid" aria-label="Way occupancy grid">
          {connectorCavityStatuses.map((slot) => {
            const parsedOccupantRef = slot.occupantRef === null ? null : parseWireOccupantRef(slot.occupantRef);
            const canGoToWire =
              parsedOccupantRef !== null &&
              wireById.has(parsedOccupantRef.wireId);

            return (
              <article key={slot.cavityIndex} className={slot.isOccupied ? "cavity is-occupied" : "cavity"}>
                <h3>C{slot.cavityIndex}</h3>
                <p className="cavity-occupant-line">
                  {slot.isOccupied ? <span className="action-button-icon is-wires cavity-occupant-ref-icon" aria-hidden="true" /> : null}
                  {slot.isOccupied ? renderWireColorPrefixMarker(parsedOccupantRef === null ? null : wireById.get(parsedOccupantRef.wireId)) : null}
                  {slot.isOccupied ? renderConnectorOccupantRef(slot.occupantRef) : <span>Free</span>}
                </p>
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
                    <button type="button" className="button-with-icon" onClick={() => handleReleaseCavity(slot.cavityIndex)}>
                      <span className="action-button-icon is-cancel" aria-hidden="true" />
                      Release
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </>
  ) : connectorAnalysisView === "physical" ? (
    <>
      <p className="meta-line">
        <strong>{selectedConnector.name}</strong> ({selectedConnector.technicalId})
      </p>
      <ConnectorPhysicalView
        connector={selectedConnector}
        catalogItem={selectedConnector.catalogItemId === undefined ? undefined : catalogItemById.get(selectedConnector.catalogItemId)}
        connectorCavityStatuses={connectorCavityStatuses}
        wireById={wireById}
        parseOccupantWireId={parseOccupantWireId}
        onGoToWire={onGoToWireFromAnalysis}
      />
    </>
  ) : sortedConnectorSynthesisRowsByColumns.length === 0 ? (
    <p className="empty-copy">No wire currently connected to this connector.</p>
  ) : (
    <table className="data-table">
      <thead>
        <tr>
          <th aria-sort={getTableAriaSort(connectorSynthesisTableSort, "name")}>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "name", direction: current.field === "name" && current.direction === "asc" ? "desc" : "asc" }))}
            >
              Wire <span className="sort-indicator">{connectorSynthesisSortIndicator("name")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(connectorSynthesisTableSort, "technicalId")}>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "technicalId", direction: current.field === "technicalId" && current.direction === "asc" ? "desc" : "asc" }))}
            >
              {isMobileViewport ? "ID" : "Technical ID"} <span className="sort-indicator">{connectorSynthesisSortIndicator("technicalId")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(connectorSynthesisTableSort, "localWay")}><button type="button" className="sort-header-button" onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "localWay", direction: current.field === "localWay" && current.direction === "asc" ? "desc" : "asc" }))}>Local way <span className="sort-indicator">{connectorSynthesisSortIndicator("localWay")}</span></button></th>
          <th aria-sort={getTableAriaSort(connectorSynthesisTableSort, "destination")}><button type="button" className="sort-header-button" onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "destination", direction: current.field === "destination" && current.direction === "asc" ? "desc" : "asc" }))}>Destination <span className="sort-indicator">{connectorSynthesisSortIndicator("destination")}</span></button></th>
          <th aria-sort={getTableAriaSort(connectorSynthesisTableSort, "lengthMm")}><button type="button" className="sort-header-button" onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "lengthMm", direction: current.field === "lengthMm" && current.direction === "asc" ? "desc" : "asc" }))}>{isMobileViewport ? "Len" : "Length (mm)"} <span className="sort-indicator">{connectorSynthesisSortIndicator("lengthMm")}</span></button></th>
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
                <EntityReferenceButton
                  title={`Open wire ${row.wireTechnicalId}`}
                  onClick={() => onOpenWireFromAnalysisTable(row.wireId)}
                >
                  {row.wireName}
                </EntityReferenceButton>
              </span>
            </td>
            <td className="technical-id">
              {row.wireTechnicalId}
            </td>
            <td>{row.localEndpointLabel}</td>
            <td>{renderDestinationReference(row)}</td>
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

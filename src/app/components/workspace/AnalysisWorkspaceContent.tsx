import type { FormEvent, ReactElement } from "react";
import { nextSortState } from "../../lib/app-utils";
import type { Connector, Splice, Wire, WireId } from "../../../core/entities";
import type { ConnectorSynthesisRow, SortState, SpliceSynthesisRow } from "../../types/app-controller";

interface OccupancyStatus {
  isOccupied: boolean;
  occupantRef: string | null;
}

interface ConnectorCavityStatus extends OccupancyStatus {
  cavityIndex: number;
}

interface SplicePortStatus extends OccupancyStatus {
  portIndex: number;
}

interface AnalysisWorkspaceContentProps {
  isConnectorSubScreen: boolean;
  isSpliceSubScreen: boolean;
  isWireSubScreen: boolean;
  networkSummaryPanel: ReactElement;
  selectedConnector: Connector | null;
  cavityIndexInput: string;
  setCavityIndexInput: (value: string) => void;
  connectorOccupantRefInput: string;
  setConnectorOccupantRefInput: (value: string) => void;
  handleReserveCavity: (event: FormEvent<HTMLFormElement>) => void;
  connectorCavityStatuses: ConnectorCavityStatus[];
  handleReleaseCavity: (cavityIndex: number) => void;
  sortedConnectorSynthesisRows: ConnectorSynthesisRow[];
  connectorSynthesisSort: SortState;
  setConnectorSynthesisSort: (value: SortState | ((current: SortState) => SortState)) => void;
  getSortIndicator: (sortState: SortState, field: "name" | "technicalId") => string;
  selectedSplice: Splice | null;
  splicePortStatuses: SplicePortStatus[];
  portIndexInput: string;
  setPortIndexInput: (value: string) => void;
  spliceOccupantRefInput: string;
  setSpliceOccupantRefInput: (value: string) => void;
  handleReservePort: (event: FormEvent<HTMLFormElement>) => void;
  handleReleasePort: (portIndex: number) => void;
  sortedSpliceSynthesisRows: SpliceSynthesisRow[];
  spliceSynthesisSort: SortState;
  setSpliceSynthesisSort: (value: SortState | ((current: SortState) => SortState)) => void;
  wireRouteFilter: "all" | "auto" | "locked";
  setWireRouteFilter: (value: "all" | "auto" | "locked") => void;
  wires: Wire[];
  visibleWires: Wire[];
  wireSort: SortState;
  setWireSort: (value: SortState | ((current: SortState) => SortState)) => void;
  selectedWireId: WireId | null;
  onSelectWire: (wireId: WireId) => void;
  selectedWire: Wire | null;
  describeWireEndpoint: (endpoint: Wire["endpointA"]) => string;
  wireForcedRouteInput: string;
  setWireForcedRouteInput: (value: string) => void;
  handleLockWireRoute: () => void;
  handleResetWireRoute: () => void;
  wireFormError: string | null;
}

export function AnalysisWorkspaceContent({
  isConnectorSubScreen,
  isSpliceSubScreen,
  isWireSubScreen,
  networkSummaryPanel,
  selectedConnector,
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
  getSortIndicator,
  selectedSplice,
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
  wireRouteFilter,
  setWireRouteFilter,
  wires,
  visibleWires,
  wireSort,
  setWireSort,
  selectedWireId,
  onSelectWire,
  selectedWire,
  describeWireEndpoint,
  wireForcedRouteInput,
  setWireForcedRouteInput,
  handleLockWireRoute,
  handleResetWireRoute,
  wireFormError
}: AnalysisWorkspaceContentProps): ReactElement {
  return (
    <section className="panel-grid analysis-panel-grid">
      <section className="panel" hidden={!isConnectorSubScreen}>
        <h2>Connector cavities</h2>
        {selectedConnector === null ? (
          <p className="empty-copy">Select a connector to view and manage cavity occupancy.</p>
        ) : (
          <>
            <p className="meta-line">
              <strong>{selectedConnector.name}</strong> ({selectedConnector.technicalId})
            </p>
            <form className="row-form" onSubmit={handleReserveCavity}>
              <label>
                Cavity index
                <input
                  type="number"
                  min={1}
                  max={selectedConnector.cavityCount}
                  step={1}
                  value={cavityIndexInput}
                  onChange={(event) => setCavityIndexInput(event.target.value)}
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

              <button type="submit">Reserve cavity</button>
            </form>

            <div className="cavity-grid" aria-label="Cavity occupancy grid">
              {connectorCavityStatuses.map((slot) => (
                <article key={slot.cavityIndex} className={slot.isOccupied ? "cavity is-occupied" : "cavity"}>
                  <h3>C{slot.cavityIndex}</h3>
                  <p>{slot.isOccupied ? slot.occupantRef : "Free"}</p>
                  {slot.isOccupied ? (
                    <button type="button" onClick={() => handleReleaseCavity(slot.cavityIndex)}>
                      Release
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="panel" hidden={!isConnectorSubScreen}>
        <h2>Connector synthesis</h2>
        {selectedConnector === null ? (
          <p className="empty-copy">Select a connector to view connected wire synthesis.</p>
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
                <th>Local cavity</th>
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

      <section className="panel" hidden={!isSpliceSubScreen}>
        <h2>Splice ports</h2>
        {selectedSplice === null ? (
          <p className="empty-copy">Select a splice to view and manage port occupancy.</p>
        ) : (
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
        )}
      </section>

      <section className="panel" hidden={!isSpliceSubScreen}>
        <h2>Splice synthesis</h2>
        {selectedSplice === null ? (
          <p className="empty-copy">Select a splice to view connected wire synthesis.</p>
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

      <section className="panel analysis-wire-route-panel" hidden={!isWireSubScreen}>
        <header className="list-panel-header">
          <h2>Wires</h2>
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
                <th>Endpoints</th>
                <th>Length (mm)</th>
                <th>Route mode</th>
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
                    <td>
                      {describeWireEndpoint(wire.endpointA)} <strong>&rarr;</strong> {describeWireEndpoint(wire.endpointB)}
                    </td>
                    <td>{wire.lengthMm}</td>
                    <td>{wire.isRouteLocked ? "Locked" : "Auto"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="panel analysis-wire-route-panel" hidden={!isWireSubScreen}>
        <header className="analysis-wire-route-header">
          <h2>Wire route control</h2>
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
              <button type="button" onClick={handleLockWireRoute}>
                Lock forced route
              </button>
              <button type="button" onClick={handleResetWireRoute}>
                Reset to auto route
              </button>
            </div>
            {wireFormError !== null ? <small className="inline-error">{wireFormError}</small> : null}
          </div>
        )}
      </section>

      <section className="analysis-network-summary-row">{networkSummaryPanel}</section>
    </section>
  );
}

import type { FormEvent, ReactElement } from "react";
import { nextSortState } from "../../lib/app-utils";
import type { Connector, Splice, Wire } from "../../../core/entities";
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
  selectedWire,
  describeWireEndpoint,
  wireForcedRouteInput,
  setWireForcedRouteInput,
  handleLockWireRoute,
  handleResetWireRoute,
  wireFormError
}: AnalysisWorkspaceContentProps): ReactElement {
  return (
    <section className="panel-grid">
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

      <section className="panel" hidden={!isWireSubScreen}>
        <h2>Wire route control</h2>
        {selectedWire === null ? (
          <p className="empty-copy">Select a wire to lock a forced route or reset to auto shortest path.</p>
        ) : (
          <>
            <p className="meta-line">
              <strong>{selectedWire.name}</strong> ({selectedWire.technicalId}) - {selectedWire.isRouteLocked ? "Locked" : "Auto"}
            </p>
            <p className="meta-line">
              {describeWireEndpoint(selectedWire.endpointA)} <strong>&rarr;</strong> {describeWireEndpoint(selectedWire.endpointB)}
            </p>
            <p className="meta-line">Current route: {selectedWire.routeSegmentIds.join(" -> ") || "(none)"}</p>
            <label className="stack-label">
              Forced route segment IDs (comma-separated)
              <input
                value={wireForcedRouteInput}
                onChange={(event) => setWireForcedRouteInput(event.target.value)}
                placeholder="segment-1, segment-2, segment-3"
              />
            </label>
            <div className="row-actions">
              <button type="button" onClick={handleLockWireRoute}>
                Lock forced route
              </button>
              <button type="button" onClick={handleResetWireRoute}>
                Reset to auto route
              </button>
            </div>
            {wireFormError !== null ? <small className="inline-error">{wireFormError}</small> : null}
          </>
        )}
      </section>

      {networkSummaryPanel}
    </section>
  );
}

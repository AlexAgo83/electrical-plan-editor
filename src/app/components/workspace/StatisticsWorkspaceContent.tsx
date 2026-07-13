import { translateCurrent as t } from "../../lib/i18n";
import { useMemo, useState, type ReactElement } from "react";
import type { NetworkId } from "../../../core/entities";
import type { AppState, NetworkScopedState } from "../../../store";
import {
  calculateNetworkStatistics,
  type DistributionRow,
  type NetworkStatisticsSlice,
  type PerNetworkStatistics
} from "../../lib/networkStatistics";

interface StatisticsWorkspaceContentProps {
  appState: AppState;
}

type StatisticsScopeMode = "active" | "manual";

function formatCount(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}

function formatMeters(valueMm: number | null): string {
  if (valueMm === null) {
    return "Unavailable";
  }
  return `${new Intl.NumberFormat("en", {
    minimumFractionDigits: valueMm >= 1000 ? 2 : 3,
    maximumFractionDigits: 3
  }).format(valueMm / 1000)} m`;
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return "Unavailable";
  }
  return `${new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(value)}%`;
}

function activeScopedStateFromAppState(state: AppState): NetworkScopedState | null {
  if (state.activeNetworkId === null) {
    return null;
  }
  return {
    catalogItems: state.catalogItems,
    connectors: state.connectors,
    splices: state.splices,
    nodes: state.nodes,
    segments: state.segments,
    wires: state.wires,
    nodePositions: state.nodePositions,
    connectorCavityOccupancy: state.connectorCavityOccupancy,
    splicePortOccupancy: state.splicePortOccupancy,
    networkSummaryViewState: state.networkStates[state.activeNetworkId]?.networkSummaryViewState
  };
}

function buildSliceForNetwork(state: AppState, networkId: NetworkId): NetworkStatisticsSlice | null {
  const network = state.networks.byId[networkId];
  if (network === undefined) {
    return null;
  }
  const scopedState = networkId === state.activeNetworkId ? activeScopedStateFromAppState(state) : state.networkStates[networkId];
  if (scopedState === null || scopedState === undefined) {
    return null;
  }
  return {
    network,
    state: scopedState
  };
}

function KpiTile({ label, value, hint }: { label: string; value: string; hint?: string }): ReactElement {
  return (
    <article>
      <h3>{label}</h3>
      <p>{value}</p>
      {hint === undefined ? null : <small className="meta-line">{hint}</small>}
    </article>
  );
}

function DistributionTable({ title, rows }: { title: string; rows: DistributionRow[] }): ReactElement {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <p className="empty-copy">No data available.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Bucket</th>
              <th>Count</th>
              <th>Total length</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>{formatCount(row.count)}</td>
                <td>{formatMeters(row.totalLengthMm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function ComparisonTable({ rows }: { rows: PerNetworkStatistics[] }): ReactElement {
  return (
    <section className="panel">
      <h2>Per-network comparison</h2>
      {rows.length <= 1 ? (
        <p className="empty-copy">Select several networks to compare them side by side.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Network</th>
              <th>{t("ui.connectors")}</th>
              <th>{t("ui.splices")}</th>
              <th>{t("ui.wires")}</th>
              <th>Total length</th>
              <th>Connector occupancy</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.networkId}>
                <td>
                  <strong>{row.networkName}</strong>
                  <br />
                  <span className="meta-line">{row.networkTechnicalId}</span>
                </td>
                <td>{formatCount(row.counts.connectors)}</td>
                <td>{formatCount(row.counts.splices)}</td>
                <td>{formatCount(row.counts.wires)}</td>
                <td>{formatMeters(row.wireLengths.totalMm)}</td>
                <td>{formatPercent(row.connectorUtilization.occupancyPercent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export function StatisticsWorkspaceContent({ appState }: StatisticsWorkspaceContentProps): ReactElement {
  const [scopeMode, setScopeMode] = useState<StatisticsScopeMode>("active");
  const [selectedNetworkIds, setSelectedNetworkIds] = useState<NetworkId[]>(
    appState.activeNetworkId === null ? [] : [appState.activeNetworkId]
  );

  const networks = useMemo(
    () =>
      appState.networks.allIds
        .flatMap((id) => {
          const network = appState.networks.byId[id];
          return network === undefined ? [] : [network];
        })
        .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: "base" })),
    [appState.networks]
  );

  const selectedSlices = useMemo(() => {
    const ids = scopeMode === "active" ? (appState.activeNetworkId === null ? [] : [appState.activeNetworkId]) : selectedNetworkIds;
    return ids.flatMap((id) => {
      const slice = buildSliceForNetwork(appState, id);
      return slice === null ? [] : [slice];
    });
  }, [appState, scopeMode, selectedNetworkIds]);

  const stats = useMemo(
    () => (selectedSlices.length === 0 ? null : calculateNetworkStatistics({ slices: selectedSlices })),
    [selectedSlices]
  );

  function toggleManualNetwork(networkId: NetworkId): void {
    setSelectedNetworkIds((current) =>
      current.includes(networkId) ? current.filter((id) => id !== networkId) : [...current, networkId]
    );
  }

  if (appState.activeNetworkId === null && scopeMode === "active") {
    return (
      <section className="panel">
        <h2>Statistics</h2>
        <p className="empty-copy">Create or select a network to view statistics.</p>
        {networks.length === 0 ? null : (
          <button type="button" className="button-with-icon" onClick={() => setScopeMode("manual")}>
            Select networks manually
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="panel-grid statistics-workspace">
      <section className="panel">
        <h2>Statistics</h2>
        <div className="validation-toolbar">
          <span>Scope</span>
          <div className="chip-group" role="group" aria-label="Statistics scope">
            <button
              type="button"
              className={scopeMode === "active" ? "filter-chip is-active" : "filter-chip"}
              onClick={() => setScopeMode("active")}
              disabled={appState.activeNetworkId === null}
            >
              Active network
            </button>
            <button
              type="button"
              className={scopeMode === "manual" ? "filter-chip is-active" : "filter-chip"}
              onClick={() => setScopeMode("manual")}
            >
              Manual selection
            </button>
          </div>
        </div>
        {scopeMode === "manual" ? (
          <div className="statistics-manual-selection">
            <h3>{t("ui.networks")}</h3>
            <div className="statistics-network-list">
              {networks.map((network) => (
                <label
                  key={network.id}
                  className={
                    selectedNetworkIds.includes(network.id)
                      ? "statistics-network-option is-selected"
                      : "statistics-network-option"
                  }
                >
                  <input
                    type="checkbox"
                    checked={selectedNetworkIds.includes(network.id)}
                    onChange={() => toggleManualNetwork(network.id)}
                  />
                  <span className="statistics-network-name">{network.name}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {stats === null ? (
        <section className="panel">
          <h2>No statistics to show</h2>
          <p className="empty-copy">Select at least one network to compute statistics.</p>
        </section>
      ) : (
        <>
          <section className="panel statistics-summary-panel">
            <h2>Summary</h2>
            <div className="summary-grid">
              <KpiTile label={t("ui.connectors")} value={formatCount(stats.aggregate.counts.connectors)} />
              <KpiTile label={t("ui.splices")} value={formatCount(stats.aggregate.counts.splices)} />
              <KpiTile label={t("ui.wires")} value={formatCount(stats.aggregate.counts.wires)} />
              <KpiTile
                label="Physical length"
                value={
                  stats.aggregate.wireLengths.includedWireCount === 0
                    ? "Unavailable"
                    : formatMeters(stats.aggregate.wireLengths.totalMm)
                }
                hint={`${formatCount(stats.aggregate.wireLengths.includedWireCount)} routed wires included`}
              />
              <KpiTile label="Route locked" value={formatPercent(stats.aggregate.wireLengths.routeLockedPercent)} />
              <KpiTile label="Connector occupancy" value={formatPercent(stats.aggregate.connectorUtilization.occupancyPercent)} />
            </div>
            {stats.aggregate.wireLengths.ignoredWireCount > 0 ? (
              <p className="meta-line">
                {formatCount(stats.aggregate.wireLengths.ignoredWireCount)} wire
                {stats.aggregate.wireLengths.ignoredWireCount === 1 ? " is" : "s are"} ignored by length metrics because no physical route or explicit length exists.
              </p>
            ) : null}
          </section>

          <ComparisonTable rows={stats.perNetwork} />

          <section className="panel">
            <h2>Wire length metrics</h2>
            {stats.aggregate.wireLengths.includedWireCount === 0 ? (
              <p className="empty-copy">No routed physical wire length available.</p>
            ) : (
              <table className="data-table">
                <tbody>
                  <tr>
                    <th>Total</th>
                    <td>{formatMeters(stats.aggregate.wireLengths.totalMm)}</td>
                  </tr>
                  <tr>
                    <th>Average</th>
                    <td>{formatMeters(stats.aggregate.wireLengths.averageMm)}</td>
                  </tr>
                  <tr>
                    <th>Median</th>
                    <td>{formatMeters(stats.aggregate.wireLengths.medianMm)}</td>
                  </tr>
                  <tr>
                    <th>Minimum</th>
                    <td>{formatMeters(stats.aggregate.wireLengths.minMm)}</td>
                  </tr>
                  <tr>
                    <th>Maximum</th>
                    <td>{formatMeters(stats.aggregate.wireLengths.maxMm)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </section>

          <section className="panel">
            <h2>Longest wires</h2>
            {stats.aggregate.wireLengths.longestWires.length === 0 ? (
              <p className="empty-copy">No routed physical wire length available.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("ui.wire")}</th>
                    <th>Network</th>
                    <th>{t("ui.length")}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.aggregate.wireLengths.longestWires.map((wire) => {
                    const network = appState.networks.byId[wire.networkId];
                    return (
                      <tr key={`${wire.networkId}:${wire.wireId}`}>
                        <td>
                          <strong>{wire.name}</strong>
                          <br />
                          <span className="meta-line">{wire.technicalId}</span>
                        </td>
                        <td>{network?.name ?? wire.networkId}</td>
                        <td>{formatMeters(wire.lengthMm)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          <DistributionTable title="Wire sections" rows={stats.aggregate.sectionDistribution} />
          <DistributionTable title="Wire colors" rows={stats.aggregate.colorDistribution} />

          <section className="panel">
            <h2>Connector utilization</h2>
            <div className="summary-grid">
              <KpiTile label="Total ways" value={formatCount(stats.aggregate.connectorUtilization.totalWays)} />
              <KpiTile label="Occupied ways" value={formatCount(stats.aggregate.connectorUtilization.occupiedWays)} />
              <KpiTile label="Shared ways" value={formatCount(stats.aggregate.connectorUtilization.sharedWays)} />
              <KpiTile label="Occupancy" value={formatPercent(stats.aggregate.connectorUtilization.occupancyPercent)} />
            </div>
            {stats.aggregate.connectorUtilization.topUnusedConnectors.length === 0 ? (
              <p className="empty-copy">No unused connector ways.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("ui.connector")}</th>
                    <th>Network</th>
                    <th>Unused ways</th>
                    <th>Total ways</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.aggregate.connectorUtilization.topUnusedConnectors.map((connector) => {
                    const network = appState.networks.byId[connector.networkId];
                    return (
                      <tr key={`${connector.networkId}:${connector.connectorId}`}>
                        <td>
                          <strong>{connector.name}</strong>
                          <br />
                          <span className="meta-line">{connector.technicalId}</span>
                        </td>
                        <td>{network?.name ?? connector.networkId}</td>
                        <td>{formatCount(connector.unusedWays)}</td>
                        <td>{formatCount(connector.totalWays)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          <section className="panel">
            <h2>Splice utilization</h2>
            <div className="summary-grid">
              <KpiTile label="Finite ports" value={formatCount(stats.aggregate.spliceUtilization.finitePortCapacity)} />
              <KpiTile label="Occupied ports" value={formatCount(stats.aggregate.spliceUtilization.occupiedFinitePorts)} />
              <KpiTile label="Finite occupancy" value={formatPercent(stats.aggregate.spliceUtilization.finiteOccupancyPercent)} />
              <KpiTile label="Unbounded splices" value={formatCount(stats.aggregate.spliceUtilization.unboundedSpliceCount)} />
              <KpiTile label="Directional splices" value={formatCount(stats.aggregate.spliceUtilization.directionalSpliceCount)} />
            </div>
          </section>
        </>
      )}
    </section>
  );
}

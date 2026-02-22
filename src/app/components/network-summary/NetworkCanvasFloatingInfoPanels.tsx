import type { ReactElement } from "react";
import type { SubNetworkSummary } from "../../../store";

interface GraphStat {
  label: string;
  value: number;
}

interface NetworkCanvasFloatingInfoPanelsProps {
  showNetworkInfoPanels: boolean;
  handleZoomAction: (target: "in" | "out" | "reset") => void;
  fitNetworkToContent: () => void;
  onRegenerateLayout: () => void;
  networkScalePercent: number;
  subNetworkSummaries: SubNetworkSummary[];
  graphStats: GraphStat[];
}

export function NetworkCanvasFloatingInfoPanels({
  showNetworkInfoPanels,
  handleZoomAction,
  fitNetworkToContent,
  onRegenerateLayout,
  networkScalePercent,
  subNetworkSummaries,
  graphStats
}: NetworkCanvasFloatingInfoPanelsProps): ReactElement | null {
  if (!showNetworkInfoPanels) {
    return null;
  }

  return (
    <>
      <div className="network-canvas-floating-controls" aria-label="Canvas controls">
        <div className="network-canvas-toolbar">
          <button type="button" className="workspace-tab" onClick={() => handleZoomAction("out")}>
            Zoom -
          </button>
          <button type="button" className="workspace-tab" onClick={() => handleZoomAction("in")}>
            Zoom +
          </button>
          <button type="button" className="workspace-tab" onClick={() => handleZoomAction("reset")}>
            Reset view
          </button>
          <button type="button" className="workspace-tab" onClick={fitNetworkToContent}>
            Fit network
          </button>
          <button type="button" className="workspace-tab" onClick={onRegenerateLayout}>
            Generate
          </button>
        </div>
        <p className="meta-line network-canvas-floating-copy">
          View: {networkScalePercent}% zoom. Hold <strong>Shift</strong> and drag empty canvas to pan.
        </p>
      </div>

      <div className="network-canvas-floating-stack">
        <section className="network-canvas-floating-subnetworks" aria-label="Sub-networks">
          {subNetworkSummaries.length === 0 ? (
            <p className="network-canvas-floating-copy">No sub-network tags yet.</p>
          ) : (
            <ul className="network-canvas-subnetwork-list">
              {subNetworkSummaries.map((group) => (
                <li key={group.tag}>
                  <span className="subnetwork-chip">{group.tag}</span>
                  <span>
                    {group.segmentCount} segment(s), {group.totalLengthMm} mm total
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="network-canvas-floating-stats" aria-label="Graph statistics">
          <ul className="network-canvas-stats-list">
            {graphStats.map((entry) => (
              <li key={entry.label}>
                <span>{entry.label}</span>
                <strong>{entry.value}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

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
  activeSubNetworkTags: ReadonlySet<string>;
  toggleSubNetworkTag: (tag: string) => void;
  enableAllSubNetworkTags: () => void;
  graphStats: GraphStat[];
}

function renderSubNetworkTagLabel(tag: string): ReactElement | string {
  if (tag === "(default)") {
    return <em>DEFAULT</em>;
  }

  return tag;
}

export function NetworkCanvasFloatingInfoPanels({
  showNetworkInfoPanels,
  handleZoomAction,
  fitNetworkToContent,
  onRegenerateLayout,
  networkScalePercent,
  subNetworkSummaries,
  activeSubNetworkTags,
  toggleSubNetworkTag,
  enableAllSubNetworkTags,
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
            <>
              <div className="network-canvas-subnetwork-actions">
                <button
                  type="button"
                  className="workspace-tab network-canvas-subnetwork-enable-all"
                  onClick={enableAllSubNetworkTags}
                  disabled={subNetworkSummaries.every((group) => activeSubNetworkTags.has(group.tag))}
                >
                  Enable all
                </button>
              </div>
              <ul className="network-canvas-subnetwork-list">
              {subNetworkSummaries.map((group) => (
                <li key={group.tag}>
                  <button
                    type="button"
                    className={`subnetwork-chip subnetwork-chip-toggle${
                      activeSubNetworkTags.has(group.tag) ? " is-active" : " is-inactive"
                    }`}
                    onClick={() => toggleSubNetworkTag(group.tag)}
                    aria-pressed={activeSubNetworkTags.has(group.tag)}
                  >
                    {renderSubNetworkTagLabel(group.tag)}
                  </button>
                  <span>
                    {group.segmentCount} segment(s), {group.totalLengthMm} mm total
                  </span>
                </li>
              ))}
              </ul>
            </>
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

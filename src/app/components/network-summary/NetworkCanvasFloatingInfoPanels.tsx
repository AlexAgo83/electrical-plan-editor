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
  globalRenderScalePercent: number;
  setGlobalRenderScalePercent: (value: number) => void;
  selectedCanvasNodeCount: number;
  clearSelectedCanvasNodes: () => void;
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
  globalRenderScalePercent,
  setGlobalRenderScalePercent,
  selectedCanvasNodeCount,
  clearSelectedCanvasNodes,
  subNetworkSummaries,
  activeSubNetworkTags,
  toggleSubNetworkTag,
  enableAllSubNetworkTags,
  graphStats
}: NetworkCanvasFloatingInfoPanelsProps): ReactElement | null {
  if (!showNetworkInfoPanels) {
    return null;
  }
  const visibleSubNetworkSummaries = subNetworkSummaries.filter((summary) => summary.tag !== "(default)");
  const hasOnlyDefaultSubNetwork = subNetworkSummaries.length > 0 && visibleSubNetworkSummaries.length === 0;

  return (
    <>
      <div className="network-canvas-floating-controls" aria-label="Canvas controls">
        <label className="network-canvas-global-scale">
          <span className="network-canvas-global-scale-label">
            <span className="action-button-icon is-zoom" aria-hidden="true" />
            <span>Zoom view</span>
          </span>
          <input
            type="range"
            min={0}
            max={300}
            step={5}
            value={globalRenderScalePercent}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              if (!Number.isFinite(parsed)) {
                return;
              }
              setGlobalRenderScalePercent(Math.min(300, Math.max(0, Math.round(parsed))));
            }}
          />
          <strong>{globalRenderScalePercent}%</strong>
        </label>
        <div className="network-canvas-toolbar">
          <button
            type="button"
            className="workspace-tab network-canvas-zoom-button"
            aria-label="Scale Down"
            title="Scale Down"
            onClick={() => handleZoomAction("out")}
          >
            <span className="action-button-icon is-scale-up" aria-hidden="true" />
            <span aria-hidden="true">-</span>
          </button>
          <button
            type="button"
            className="workspace-tab network-canvas-zoom-button"
            aria-label="Scale Up"
            title="Scale Up"
            onClick={() => handleZoomAction("in")}
          >
            <span className="action-button-icon is-scale-up" aria-hidden="true" />
            <span aria-hidden="true">+</span>
          </button>
          <button type="button" className="workspace-tab" onClick={() => handleZoomAction("reset")}>
            Reset view
          </button>
          <button type="button" className="workspace-tab" onClick={fitNetworkToContent}>
            Fit network
          </button>
        </div>
        <div className="network-canvas-floating-guidance">
          <p className="meta-line network-canvas-floating-copy">Drag empty canvas to pan.</p>
          {selectedCanvasNodeCount > 1 ? (
            <p className="meta-line network-canvas-floating-copy">Drag one selected node to move the full group.</p>
          ) : null}
        </div>
        {selectedCanvasNodeCount > 0 ? (
          <div className="network-canvas-selection-summary" aria-live="polite">
            <p className="meta-line network-canvas-floating-copy">
              {selectedCanvasNodeCount} node{selectedCanvasNodeCount > 1 ? "s" : ""} selected.
            </p>
            <button type="button" className="workspace-tab" onClick={clearSelectedCanvasNodes}>
              Clear selection
            </button>
          </div>
        ) : null}
      </div>

      <div className="network-canvas-floating-stack">
        <section className="network-canvas-floating-subnetworks" aria-label="Sub-networks">
          {subNetworkSummaries.length === 0 || hasOnlyDefaultSubNetwork ? (
            <p className="network-canvas-floating-copy">No sub-network tags yet.</p>
          ) : (
            <>
              {visibleSubNetworkSummaries.length > 0 ? (
                <div className="network-canvas-subnetwork-actions">
                  <button
                    type="button"
                    className="workspace-tab network-canvas-subnetwork-enable-all"
                    onClick={enableAllSubNetworkTags}
                    disabled={visibleSubNetworkSummaries.every((group) => activeSubNetworkTags.has(group.tag))}
                  >
                    Enable all
                  </button>
                </div>
              ) : null}
              <ul className="network-canvas-subnetwork-list">
              {visibleSubNetworkSummaries.map((group) => (
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

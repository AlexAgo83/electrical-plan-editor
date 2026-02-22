import type { ReactElement } from "react";
import type { NetworkNode, NodeId } from "../../../core/entities";
import type { ShortestRouteResult } from "../../../core/pathfinding";

interface NetworkRoutePreviewPanelProps {
  nodes: NetworkNode[];
  describeNode: (node: NetworkNode) => string;
  routePreviewStartNodeId: string;
  setRoutePreviewStartNodeId: (value: string) => void;
  routePreviewEndNodeId: string;
  setRoutePreviewEndNodeId: (value: string) => void;
  routePreview: ShortestRouteResult | null;
}

export function NetworkRoutePreviewPanel({
  nodes,
  describeNode,
  routePreviewStartNodeId,
  setRoutePreviewStartNodeId,
  routePreviewEndNodeId,
  setRoutePreviewEndNodeId,
  routePreview
}: NetworkRoutePreviewPanelProps): ReactElement {
  const hasRouteSelection = routePreviewStartNodeId.length > 0 && routePreviewEndNodeId.length > 0;
  const selectedStartNode = nodes.find((node) => node.id === (routePreviewStartNodeId as NodeId)) ?? null;
  const selectedEndNode = nodes.find((node) => node.id === (routePreviewEndNodeId as NodeId)) ?? null;

  return (
    <section className="panel route-preview-panel">
      <h2>Route preview</h2>
      <form className="row-form network-route-form route-preview-form">
        <label className="route-preview-field">
          <span className="route-preview-label">Start node</span>
          <select value={routePreviewStartNodeId} onChange={(event) => setRoutePreviewStartNodeId(event.target.value)}>
            <option value="">Select node</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {describeNode(node)}
              </option>
            ))}
          </select>
        </label>

        <label className="route-preview-field">
          <span className="route-preview-label">End node</span>
          <select value={routePreviewEndNodeId} onChange={(event) => setRoutePreviewEndNodeId(event.target.value)}>
            <option value="">Select node</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {describeNode(node)}
              </option>
            ))}
          </select>
        </label>
      </form>

      <div className="route-preview-selection-strip" aria-live="polite">
        <article>
          <span>Start</span>
          <strong>{selectedStartNode === null ? "Select node" : describeNode(selectedStartNode)}</strong>
        </article>
        <span className="route-preview-selection-arrow" aria-hidden="true">
          →
        </span>
        <article>
          <span>End</span>
          <strong>{selectedEndNode === null ? "Select node" : describeNode(selectedEndNode)}</strong>
        </article>
      </div>

      {hasRouteSelection ? (
        routePreview === null ? (
          <p className="route-preview-empty">No route currently exists between the selected start and end nodes.</p>
        ) : (
          <div className="route-preview-results">
            <div className="route-preview-status-line">
              <span className="route-preview-status-chip">Route found</span>
              <p>Shortest path computed from current selection.</p>
            </div>
            <div className="route-preview-metrics">
              <article>
                <span>Length</span>
                <strong>{routePreview.totalLengthMm} mm</strong>
              </article>
              <article>
                <span>Segments</span>
                <strong>{routePreview.segmentIds.length}</strong>
              </article>
              <article>
                <span>Nodes</span>
                <strong>{routePreview.nodeIds.length}</strong>
              </article>
            </div>
            <div className="route-preview-path-grid">
              <article>
                <h4>Segments path</h4>
                <p className="route-preview-path">
                  {routePreview.segmentIds.length === 0 ? "(none)" : routePreview.segmentIds.join(" -> ")}
                </p>
              </article>
              <article>
                <h4>Nodes path</h4>
                <p className="route-preview-path">{routePreview.nodeIds.join(" -> ")}</p>
              </article>
            </div>
          </div>
        )
      ) : (
        <p className="route-preview-empty">Select start and end nodes to preview shortest path routing.</p>
      )}
    </section>
  );
}

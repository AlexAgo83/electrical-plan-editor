import type { ReactElement } from "react";
import type { Connector, NetworkNode, Segment, Splice, Wire } from "../../core/entities";
import type { SelectionState } from "../../store/types";

interface InspectorContextPanelProps {
  mode: "open" | "collapsed";
  canExpandFromCollapsed: boolean;
  canCollapseToCollapsed: boolean;
  onExpandFromCollapsed: () => void;
  onCollapseToCollapsed: () => void;
  selected: SelectionState | null;
  selectedSubScreen: "connector" | "splice" | "node" | "segment" | "wire" | null;
  selectedConnector: Connector | null;
  selectedSplice: Splice | null;
  selectedNode: NetworkNode | null;
  selectedSegment: Segment | null;
  selectedWire: Wire | null;
  connectorOccupiedCount: number;
  spliceOccupiedCount: number;
  describeNode: (node: NetworkNode) => string;
  onEditSelected: () => void;
  onOpenAnalysis: () => void;
  onClearSelection: () => void;
}

export function InspectorContextPanel({
  mode,
  canExpandFromCollapsed,
  canCollapseToCollapsed,
  onExpandFromCollapsed,
  onCollapseToCollapsed,
  selected,
  selectedSubScreen,
  selectedConnector,
  selectedSplice,
  selectedNode,
  selectedSegment,
  selectedWire,
  connectorOccupiedCount,
  spliceOccupiedCount,
  describeNode,
  onEditSelected,
  onOpenAnalysis,
  onClearSelection
}: InspectorContextPanelProps): ReactElement {
  const isCollapsed = mode === "collapsed";
  const canOpenAnalysis =
    selectedConnector !== null ||
    selectedSplice !== null ||
    selectedWire !== null ||
    (selectedNode !== null && (selectedNode.kind === "connector" || selectedNode.kind === "splice"));
  const detailRows: Array<{ label: string; value: ReactElement | string }> = [];

  if (selectedConnector !== null) {
    detailRows.push({ label: "Name", value: selectedConnector.name });
    detailRows.push({ label: "Technical ID", value: <span className="technical-id">{selectedConnector.technicalId}</span> });
    detailRows.push({ label: "Ways", value: `${selectedConnector.cavityCount} / Occupied ${connectorOccupiedCount}` });
  }

  if (selectedSplice !== null) {
    detailRows.push({ label: "Name", value: selectedSplice.name });
    detailRows.push({ label: "Technical ID", value: <span className="technical-id">{selectedSplice.technicalId}</span> });
    detailRows.push({ label: "Ports", value: `${selectedSplice.portCount} / Occupied ${spliceOccupiedCount}` });
  }

  if (selectedNode !== null) {
    detailRows.push({ label: "Node kind", value: selectedNode.kind });
    detailRows.push({ label: "Reference", value: describeNode(selectedNode) });
  }

  if (selectedSegment !== null) {
    detailRows.push({ label: "Node A", value: <span className="technical-id">{selectedSegment.nodeA}</span> });
    detailRows.push({ label: "Node B", value: <span className="technical-id">{selectedSegment.nodeB}</span> });
    detailRows.push({ label: "Length", value: `${selectedSegment.lengthMm} mm` });
  }

  if (selectedWire !== null) {
    detailRows.push({ label: "Name", value: selectedWire.name });
    detailRows.push({ label: "Technical ID", value: <span className="technical-id">{selectedWire.technicalId}</span> });
    detailRows.push({
      label: "Route",
      value: `${selectedWire.isRouteLocked ? "Locked" : "Auto"} / ${
        selectedWire.routeSegmentIds.length === 0 ? "(none)" : selectedWire.routeSegmentIds.join(" -> ")
      }`
    });
  }

  return (
    <article className={isCollapsed ? "panel inspector-context-panel is-collapsed" : "panel inspector-context-panel"}>
      <div className="inspector-context-header">
        <h2>Inspector context</h2>
        {isCollapsed && canExpandFromCollapsed ? (
          <button type="button" className="inspector-context-toggle" onClick={onExpandFromCollapsed}>
            <span className="inspector-context-toggle-icon" aria-hidden="true" />
            Expand
          </button>
        ) : null}
        {!isCollapsed && canCollapseToCollapsed ? (
          <button type="button" className="inspector-context-toggle" onClick={onCollapseToCollapsed}>
            <span className="inspector-context-toggle-icon is-collapse" aria-hidden="true" />
            Collapse
          </button>
        ) : null}
      </div>
      {isCollapsed ? (
        selected === null ? (
          <p className="empty-copy">No entity selected. Select a row or a canvas item to inspect details here.</p>
        ) : (
          <p className="meta-line">
            Focused entity: <strong>{selected.kind}</strong> <span className="technical-id">{selected.id}</span>
          </p>
        )
      ) : selected === null ? (
        <p className="empty-copy">No entity selected. Select a row or a canvas item to inspect details here.</p>
      ) : (
        <>
          <div className="inspector-entity-line">
            <span className="inspector-entity-label">Focused entity:</span>
            <span className="inspector-kind-chip">{selected.kind}</span>
            <span className="technical-id inspector-entity-id">{selected.id}</span>
          </div>
          <dl className="inspector-detail-grid">
            {detailRows.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="row-actions compact inspector-actions">
            <button type="button" className="button-with-icon" onClick={onEditSelected} disabled={selectedSubScreen === null}>
              <span className="action-button-icon is-edit" aria-hidden="true" />
              Edit
            </button>
            <button type="button" className="button-with-icon" onClick={onOpenAnalysis} disabled={!canOpenAnalysis}>
              <span className="action-button-icon is-analysis" aria-hidden="true" />
              Analysis
            </button>
            <button type="button" className="button-with-icon" onClick={onClearSelection}>
              <span className="action-button-icon is-unselect" aria-hidden="true" />
              Clear
            </button>
          </div>
        </>
      )}
    </article>
  );
}

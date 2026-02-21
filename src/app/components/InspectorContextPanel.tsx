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
  onFocusCanvas: () => void;
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
  onFocusCanvas,
  onClearSelection
}: InspectorContextPanelProps): ReactElement {
  const isCollapsed = mode === "collapsed";

  return (
    <article className={isCollapsed ? "panel inspector-context-panel is-collapsed" : "panel inspector-context-panel"}>
      <div className="inspector-context-header">
        <h2>Inspector context</h2>
        {isCollapsed && canExpandFromCollapsed ? (
          <button type="button" className="inspector-context-toggle" onClick={onExpandFromCollapsed}>
            Expand
          </button>
        ) : null}
        {!isCollapsed && canCollapseToCollapsed ? (
          <button type="button" className="inspector-context-toggle" onClick={onCollapseToCollapsed}>
            Collapse
          </button>
        ) : null}
      </div>
      {isCollapsed ? (
        selected === null ? (
          <p className="empty-copy">No entity selected. Select a row or a canvas item to inspect details here.</p>
        ) : (
          <>
            <p className="meta-line">
              Focused entity: <strong>{selected.kind}</strong> <span className="technical-id">{selected.id}</span>
            </p>
            <p className="inspector-collapsed-copy">Inspector is collapsed to preserve workspace focus.</p>
          </>
        )
      ) : selected === null ? (
        <p className="empty-copy">No entity selected. Select a row or a canvas item to inspect details here.</p>
      ) : (
        <>
          <p className="meta-line">
            Focused entity: <strong>{selected.kind}</strong> <span className="technical-id">{selected.id}</span>
          </p>
          <div className="selection-snapshot inspector-snapshot">
            {selectedConnector !== null ? (
              <>
                <p>Name: {selectedConnector.name}</p>
                <p>
                  Technical ID: <span className="technical-id">{selectedConnector.technicalId}</span>
                </p>
                <p>
                  Cavities: {selectedConnector.cavityCount} / Occupied: {connectorOccupiedCount}
                </p>
              </>
            ) : null}
            {selectedSplice !== null ? (
              <>
                <p>Name: {selectedSplice.name}</p>
                <p>
                  Technical ID: <span className="technical-id">{selectedSplice.technicalId}</span>
                </p>
                <p>
                  Ports: {selectedSplice.portCount} / Occupied: {spliceOccupiedCount}
                </p>
              </>
            ) : null}
            {selectedNode !== null ? (
              <>
                <p>Node kind: {selectedNode.kind}</p>
                <p>{describeNode(selectedNode)}</p>
              </>
            ) : null}
            {selectedSegment !== null ? (
              <>
                <p>
                  Node A: <span className="technical-id">{selectedSegment.nodeA}</span>
                </p>
                <p>
                  Node B: <span className="technical-id">{selectedSegment.nodeB}</span>
                </p>
                <p>Length: {selectedSegment.lengthMm} mm</p>
              </>
            ) : null}
            {selectedWire !== null ? (
              <>
                <p>Name: {selectedWire.name}</p>
                <p>
                  Technical ID: <span className="technical-id">{selectedWire.technicalId}</span>
                </p>
                <p>
                  Route mode: {selectedWire.isRouteLocked ? "Locked" : "Auto"} / Segments: {" "}
                  {selectedWire.routeSegmentIds.length === 0 ? "(none)" : selectedWire.routeSegmentIds.join(" -> ")}
                </p>
              </>
            ) : null}
          </div>
          <div className="row-actions compact">
            <button type="button" onClick={onEditSelected} disabled={selectedSubScreen === null}>
              Edit
            </button>
            <button type="button" onClick={onFocusCanvas} disabled={selectedSubScreen === null}>
              Focus canvas
            </button>
            <button type="button" onClick={onClearSelection}>
              Clear selection
            </button>
          </div>
        </>
      )}
    </article>
  );
}

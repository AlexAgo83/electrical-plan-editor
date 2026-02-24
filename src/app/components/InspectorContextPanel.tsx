import type { ReactElement } from "react";
import { CABLE_COLOR_BY_ID, getWireColorLabel, isWireFreeColorMode, type WireColorMode } from "../../core/cableColors";
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
  onClearSelection
}: InspectorContextPanelProps): ReactElement {
  function renderCableColorSwatches(
    colorMode: WireColorMode | null | undefined,
    primaryColorId: string | null,
    secondaryColorId: string | null,
    freeColorLabel?: string | null
  ): ReactElement | string {
    const wireColor = { colorMode, primaryColorId, secondaryColorId, freeColorLabel };
    if (isWireFreeColorMode(wireColor)) {
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }} title={getWireColorLabel(wireColor)}>
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "2rem",
              padding: "0.05rem 0.35rem",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.25)",
              fontSize: "0.75rem"
            }}
          >
            Free
          </span>
          <span>{getWireColorLabel(wireColor)}</span>
        </span>
      );
    }

    if (primaryColorId === null) {
      return "No color";
    }

    const primary = CABLE_COLOR_BY_ID[primaryColorId];
    const secondary = secondaryColorId === null ? null : CABLE_COLOR_BY_ID[secondaryColorId];
    const colorLabel =
      secondaryColorId === null
        ? primary?.label ?? `Unknown (${primaryColorId})`
        : `${primary?.label ?? `Unknown (${primaryColorId})`} / ${secondary?.label ?? `Unknown (${secondaryColorId})`}`;
    const colorCode = secondaryColorId === null ? primaryColorId : `${primaryColorId}/${secondaryColorId}`;

    const swatchStyleBase = {
      display: "inline-block",
      width: "0.75rem",
      height: "0.75rem",
      borderRadius: "999px",
      border: "1px solid rgba(255,255,255,0.25)",
      verticalAlign: "middle"
    } satisfies React.CSSProperties;
    const unknownSwatchColor = "#7a7a7a";

    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }} title={colorLabel}>
        <span
          aria-hidden="true"
          style={{ ...swatchStyleBase, background: primary?.hex ?? unknownSwatchColor }}
        />
        {secondary !== null || secondaryColorId !== null ? (
          <span
            aria-hidden="true"
            style={{ ...swatchStyleBase, background: secondary?.hex ?? unknownSwatchColor }}
          />
        ) : null}
        <span className="technical-id">{colorCode}</span>
        <span>{colorLabel}</span>
      </span>
    );
  }

  const isCollapsed = mode === "collapsed";
  const detailRows: Array<{ label: string; value: ReactElement | string }> = [];

  if (selectedConnector !== null) {
    detailRows.push({ label: "Name", value: selectedConnector.name });
    detailRows.push({ label: "Technical ID", value: <span className="technical-id">{selectedConnector.technicalId}</span> });
    if ((selectedConnector.manufacturerReference?.trim() ?? "").length > 0) {
      detailRows.push({ label: "Manufacturer reference", value: selectedConnector.manufacturerReference as string });
    }
    detailRows.push({ label: "Ways", value: `${selectedConnector.cavityCount} / Occupied ${connectorOccupiedCount}` });
  }

  if (selectedSplice !== null) {
    detailRows.push({ label: "Name", value: selectedSplice.name });
    detailRows.push({ label: "Technical ID", value: <span className="technical-id">{selectedSplice.technicalId}</span> });
    if ((selectedSplice.manufacturerReference?.trim() ?? "").length > 0) {
      detailRows.push({ label: "Manufacturer reference", value: selectedSplice.manufacturerReference as string });
    }
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
    detailRows.push({ label: "Section", value: `${selectedWire.sectionMm2} mm²` });
    detailRows.push({
      label: "Cable colors",
      value: renderCableColorSwatches(
        selectedWire.colorMode,
        selectedWire.primaryColorId,
        selectedWire.secondaryColorId,
        selectedWire.freeColorLabel
      )
    });
    if ((selectedWire.endpointAConnectionReference?.trim() ?? "").length > 0) {
      detailRows.push({ label: "Endpoint A connection ref", value: selectedWire.endpointAConnectionReference as string });
    }
    if ((selectedWire.endpointASealReference?.trim() ?? "").length > 0) {
      detailRows.push({ label: "Endpoint A seal ref", value: selectedWire.endpointASealReference as string });
    }
    if ((selectedWire.endpointBConnectionReference?.trim() ?? "").length > 0) {
      detailRows.push({ label: "Endpoint B connection ref", value: selectedWire.endpointBConnectionReference as string });
    }
    if ((selectedWire.endpointBSealReference?.trim() ?? "").length > 0) {
      detailRows.push({ label: "Endpoint B seal ref", value: selectedWire.endpointBSealReference as string });
    }
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
              Select
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

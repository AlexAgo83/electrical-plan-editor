import { useRef, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactElement } from "react";
import type {
  ConnectorId,
  ConnectorLayout,
  ConnectorLayoutKeying,
  ConnectorLayoutKeyingShape,
  ConnectorLayoutShellShape,
  SpliceId,
  Wire
} from "../../../../core/entities";
import {
  DEFAULT_CONNECTOR_LAYOUT_CELL_PADDING,
  DEFAULT_CONNECTOR_LAYOUT_KEYING_SCALE,
  getConnectorLayoutCellPadding,
  getConnectorLayoutKeyingAnchor,
  getConnectorLayoutKeyings,
  getConnectorLayoutShellCornerRadius,
  getConnectorLayoutShellPadding,
  getConnectorLayoutShellStrokeWidth,
  getConnectorLayoutShellShape,
  getConnectorLayoutWayRenderCenter,
  getConnectorLayoutWaySpan,
  getConnectorLayoutWayDisplayLabel
} from "../../../../core/connectorLayout";
import {
  CALLOUT_COLOR_SWATCH_GAP,
  CALLOUT_COLOR_SWATCH_RADIUS,
  getCalloutColorSwatchesWidth,
  getCalloutRowCellValue,
  type CableCalloutViewModel,
  type CalloutTargetKey,
  type RenderedCableCallout
} from "./calloutLayout";

const KEYING_MARKER_SIZE = 0.28;
const KEYING_MARKER_RADIUS = 0.15;
const KEYING_ARROW_WIDTH = 0.32;
const KEYING_ARROW_DEPTH = 0.19;
const DEFAULT_WAY_RENDER_CELL_SIZE = 1 - DEFAULT_CONNECTOR_LAYOUT_CELL_PADDING;
const CONSISTENT_LAYOUT_REFERENCE_WIDTH = 5;
const CONSISTENT_LAYOUT_REFERENCE_HEIGHT = 3;
const DOUBLE_CLICK_INTERVAL_MS = 450;

type RenderableKeying = {
  shape?: ConnectorLayoutKeyingShape;
  color?: string;
  scale?: number;
};

// eslint-disable-next-line react-refresh/only-export-components
export function getHighlightedConnectorCavityIndexes(
  groups: CableCalloutViewModel["groups"],
  selectedWireId: Wire["id"] | null
): Set<number> {
  const highlightedCavityIndexes = new Set<number>();
  if (selectedWireId === null) {
    return highlightedCavityIndexes;
  }

  for (const group of groups) {
    if (!group.entries.some((entry) => entry.wireId === selectedWireId)) {
      continue;
    }
    const cavityIndex = Number(/^C(\d+)$/.exec(group.label)?.[1] ?? Number.NaN);
    if (Number.isInteger(cavityIndex) && cavityIndex > 0) {
      highlightedCavityIndexes.add(cavityIndex);
    }
  }

  return highlightedCavityIndexes;
}

// eslint-disable-next-line react-refresh/only-export-components
export function getConnectorCavityWireIdByIndex(groups: CableCalloutViewModel["groups"]): Map<number, Wire["id"]> {
  const wireIdByCavityIndex = new Map<number, Wire["id"]>();

  for (const group of groups) {
    const cavityIndex = Number(/^C(\d+)$/.exec(group.label)?.[1] ?? Number.NaN);
    const wireId = group.entries[0]?.wireId;
    if (Number.isInteger(cavityIndex) && cavityIndex > 0 && wireId !== undefined) {
      wireIdByCavityIndex.set(cavityIndex, wireId as Wire["id"]);
    }
  }

  return wireIdByCavityIndex;
}

function getKeyingStyle(keying: RenderableKeying): CSSProperties | undefined {
  return keying.color === undefined ? undefined : { fill: keying.color };
}

function getWayRenderScale(cellPadding: number): number {
  return (1 - cellPadding) / DEFAULT_WAY_RENDER_CELL_SIZE;
}

// eslint-disable-next-line react-refresh/only-export-components
export function getConnectorLayoutDrawingViewMetrics(layout: ConnectorLayout): {
  minX: number;
  minY: number;
  viewWidth: number;
  viewHeight: number;
} {
  const shellPadding = getConnectorLayoutShellPadding(layout);
  return {
    minX: 1 - shellPadding - 0.5,
    minY: 1 - shellPadding - 0.5,
    viewWidth: layout.width - 1 + shellPadding * 2 + 1,
    viewHeight: layout.height - 1 + shellPadding * 2 + 1
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export function getConsistentConnectorLayoutDrawingSize(
  layout: ConnectorLayout,
  referenceWidth: number,
  referenceHeight: number
): { width: number; height: number } {
  const metrics = getConnectorLayoutDrawingViewMetrics(layout);
  const unitScale = Math.min(referenceWidth / CONSISTENT_LAYOUT_REFERENCE_WIDTH, referenceHeight / CONSISTENT_LAYOUT_REFERENCE_HEIGHT);
  return {
    width: metrics.viewWidth * unitScale,
    height: metrics.viewHeight * unitScale
  };
}

function renderConnectorKeying(
  keying: ConnectorLayoutKeying,
  layout: ConnectorLayout,
  shellShape: ConnectorLayoutShellShape,
  shellPadding: number
): ReactElement {
  const anchor = getConnectorLayoutKeyingAnchor(keying, layout, shellShape, shellPadding);
  const shape = keying.shape ?? "arrow";
  const keyingScale = keying.scale ?? DEFAULT_CONNECTOR_LAYOUT_KEYING_SCALE;
  const markerSize = KEYING_MARKER_SIZE * keyingScale;
  const markerRadius = KEYING_MARKER_RADIUS * keyingScale;
  const arrowWidth = KEYING_ARROW_WIDTH * keyingScale;
  const arrowDepth = KEYING_ARROW_DEPTH * keyingScale;
  const isFreePlacement = keying.placement?.mode === "free";
  const markerDirection = isFreePlacement ? 0 : shape === "square" ? -1 : shape === "round" || shape === "diamond" ? 0 : 1;
  const markerCenterX = anchor.x + anchor.normalX * (markerSize / 2) * markerDirection;
  const markerCenterY = anchor.y + anchor.normalY * (markerSize / 2) * markerDirection;
  const style = getKeyingStyle(keying);
  const markerAngle = (Math.atan2(anchor.normalY, anchor.normalX) * 180) / Math.PI;
  if (shape === "square") {
    return (
      <rect
        className="network-callout-connector-keying"
        style={style}
        x={markerCenterX - markerSize / 2}
        y={markerCenterY - markerSize / 2}
        width={markerSize}
        height={markerSize}
        rx={0.035}
        transform={isFreePlacement ? undefined : `rotate(${markerAngle} ${markerCenterX} ${markerCenterY})`}
        aria-hidden="true"
      />
    );
  }
  if (shape === "round") {
    return <circle className="network-callout-connector-keying" style={style} cx={markerCenterX} cy={markerCenterY} r={markerRadius} aria-hidden="true" />;
  }
  if (shape === "diamond") {
    return (
      <rect
        className="network-callout-connector-keying"
        style={style}
        x={markerCenterX - markerSize / 2}
        y={markerCenterY - markerSize / 2}
        width={markerSize}
        height={markerSize}
        transform={`rotate(${isFreePlacement ? 45 : markerAngle + 45} ${markerCenterX} ${markerCenterY})`}
        aria-hidden="true"
      />
    );
  }
  const tangentX = -anchor.normalY;
  const tangentY = anchor.normalX;
  const baseX = anchor.x + anchor.normalX * arrowDepth;
  const baseY = anchor.y + anchor.normalY * arrowDepth;
  const halfWidth = arrowWidth / 2;
  const path = [
    `M ${anchor.x} ${anchor.y}`,
    `L ${baseX + tangentX * halfWidth} ${baseY + tangentY * halfWidth}`,
    `L ${baseX - tangentX * halfWidth} ${baseY - tangentY * halfWidth}`,
    "z"
  ].join(" ");
  return <path className="network-callout-connector-keying" style={style} d={path} aria-hidden="true" />;
}

// Reused by connector nodes when the canvas displays physical connector layouts in-place.
// eslint-disable-next-line react-refresh/only-export-components
export function renderConnectorLayoutDrawing(
  layout: ConnectorLayout,
  width: number,
  height: number,
  highlightedCavityIndexes: ReadonlySet<number>,
  titleId?: string,
  wireIdByCavityIndex?: ReadonlyMap<number, Wire["id"]>,
  onSelectCavityWire?: (wireId: Wire["id"]) => void,
  onOpenInspectorForSelection?: () => void
): ReactElement {
  const shellPadding = getConnectorLayoutShellPadding(layout);
  const cellPadding = getConnectorLayoutCellPadding(layout);
  const wayScale = getWayRenderScale(cellPadding);
  const shellShape = getConnectorLayoutShellShape(layout);
  const { minX, minY, viewWidth, viewHeight } = getConnectorLayoutDrawingViewMetrics(layout);
  const scale = Math.min(width / viewWidth, height / viewHeight);
  const inverseDrawingScale = scale > 0 ? 1 / scale : 1;
  const originX = -width / 2 + (width - viewWidth * scale) / 2 - minX * scale;
  const originY = (height - viewHeight * scale) / 2 - minY * scale;
  const shellX = 1 - shellPadding;
  const shellY = 1 - shellPadding;
  const shellWidth = layout.width - 1 + shellPadding * 2;
  const shellHeight = layout.height - 1 + shellPadding * 2;
  const shellCornerRadius = Math.min(0.55, shellPadding) * getConnectorLayoutShellCornerRadius(layout);
  const shellStrokeWidth = getConnectorLayoutShellStrokeWidth(layout);
  const shellTopY = originY + shellY * scale;
  const titleMargin = 1.2;

  return (
    <>
      {titleId === undefined ? null : (
        <text
          className="network-node-label network-node-connector-layout-title"
          x={0}
          y={shellTopY - titleMargin}
          textAnchor="middle"
          dominantBaseline="text-after-edge"
        >
          {titleId}
        </text>
      )}
      <g className="network-callout-connector-drawing" transform={`translate(${originX} ${originY}) scale(${scale})`}>
        {shellShape === "circle" ? (
          <ellipse
            className="network-callout-connector-shell"
            cx={layout.width / 2 + 0.5}
            cy={layout.height / 2 + 0.5}
            rx={shellWidth / 2}
            ry={shellHeight / 2}
            style={{ strokeWidth: shellStrokeWidth }}
          />
        ) : (
          <rect
            className="network-callout-connector-shell"
            x={shellX}
            y={shellY}
            width={shellWidth}
            height={shellHeight}
            rx={shellCornerRadius}
            style={{ strokeWidth: shellStrokeWidth }}
          />
        )}
        {getConnectorLayoutKeyings(layout).map((keying, index) => (
          <g key={`${keying.side}-${keying.shape ?? "arrow"}-${keying.position ?? "auto"}-${keying.scale ?? "default"}-${index}`}>
            {renderConnectorKeying(keying, layout, shellShape, shellPadding)}
          </g>
        ))}
        {layout.ways.map((way) => {
          const wayCenter = getConnectorLayoutWayRenderCenter(way);
          const waySizeScale = getConnectorLayoutWaySpan(way);
          const label = getConnectorLayoutWayDisplayLabel(way);
          const labelClassName = `network-callout-connector-way-label${label.length > 2 ? " is-long-label" : ""}`;
          const labelFontSize = label.length > 2 ? 4.7 : 5.8;
          const isWireHighlighted = highlightedCavityIndexes.has(way.cavityIndex);
          const wireId = wireIdByCavityIndex?.get(way.cavityIndex);
          const canSelectWire = wireId !== undefined && onSelectCavityWire !== undefined;
          const isUnused = wireId === undefined;
          const wayClassName = `network-callout-connector-way${isWireHighlighted ? " is-wire-highlighted" : ""}${
            isUnused ? " is-unused" : ""
          }${way.strokeStyle === "dashed" ? " is-dashed" : ""}${way.size === "big" ? " is-big" : ""}`;
          const handleSelectCavityWire = (event: ReactMouseEvent<SVGGElement>): void => {
            if (!canSelectWire) {
              return;
            }
            event.preventDefault();
            event.stopPropagation();
            onSelectCavityWire(wireId);
          };
          return (
            <g
              key={way.cavityIndex}
              className={`${isWireHighlighted ? "network-callout-connector-way-group is-wire-highlighted" : "network-callout-connector-way-group"}${
                canSelectWire ? " is-selectable-wire" : ""
              }${isUnused ? " is-unused" : ""}`}
              transform={`translate(${wayCenter.x} ${wayCenter.y})`}
              role={canSelectWire ? "button" : undefined}
              tabIndex={canSelectWire ? 0 : undefined}
              aria-label={canSelectWire ? `Select wire connected to ${label}` : undefined}
              onMouseDown={handleSelectCavityWire}
              onClick={(event) => {
                handleSelectCavityWire(event);
                if (canSelectWire && event.detail >= 2) {
                  onOpenInspectorForSelection?.();
                }
              }}
              onDoubleClick={(event) => {
                if (!canSelectWire) {
                  return;
                }
                event.preventDefault();
                event.stopPropagation();
                onSelectCavityWire(wireId);
                onOpenInspectorForSelection?.();
              }}
              onKeyDown={(event: ReactKeyboardEvent<SVGGElement>) => {
                if (!canSelectWire || (event.key !== "Enter" && event.key !== " ")) {
                  return;
                }
                event.preventDefault();
                event.stopPropagation();
                onSelectCavityWire(wireId);
              }}
            >
              {way.shape === "square" ? (
                <rect
                  className={wayClassName}
                  x={-(0.56 * wayScale * waySizeScale) / 2}
                  y={-(0.56 * wayScale * waySizeScale) / 2}
                  width={0.56 * wayScale * waySizeScale}
                  height={0.56 * wayScale * waySizeScale}
                  rx={0.08 * wayScale}
                />
              ) : way.shape === "slot" ? (
                <rect
                  className={wayClassName}
                  x={-(0.64 * wayScale * waySizeScale) / 2}
                  y={-(0.44 * wayScale * waySizeScale) / 2}
                  width={0.64 * wayScale * waySizeScale}
                  height={0.44 * wayScale * waySizeScale}
                  rx={(0.44 * wayScale * waySizeScale) / 2}
                />
              ) : (
                <circle className={wayClassName} r={0.32 * wayScale * waySizeScale} />
              )}
              <text
                className={labelClassName}
                y={0}
                style={{ fontSize: labelFontSize }}
                transform={`scale(${inverseDrawingScale})`}
              >
                {label}
              </text>
            </g>
          );
        })}
      </g>
    </>
  );
}

interface NetworkSummaryCalloutLeadersProps {
  renderedCableCallouts: RenderedCableCallout[];
  networkOffset: { x: number; y: number };
  networkScale: number;
}

export function NetworkSummaryCalloutLeaders({
  renderedCableCallouts,
  networkOffset,
  networkScale
}: NetworkSummaryCalloutLeadersProps): ReactElement {
  return (
    <g transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}>
      {renderedCableCallouts.map(({ callout, lineEnd, calloutClassName }) => (
        <g key={`${callout.key}-leader`} className={calloutClassName}>
          <line
            className="network-callout-leader-line"
            x1={callout.nodePosition.x}
            y1={callout.nodePosition.y}
            x2={lineEnd.x}
            y2={lineEnd.y}
          />
        </g>
      ))}
    </g>
  );
}

interface NetworkSummaryCalloutsLayerProps {
  renderedCableCallouts: RenderedCableCallout[];
  inverseLabelScale: number;
  selectedWireId: Wire["id"] | null;
  onHoverCallout: (calloutKey: CalloutTargetKey | null) => void;
  onCalloutMouseDown: (
    event: ReactMouseEvent<SVGGElement>,
    callout: Pick<CableCalloutViewModel, "key" | "kind" | "entityId" | "position">
  ) => void;
  onSelectConnectorFromCallout: (connectorId: ConnectorId) => void;
  onSelectSpliceFromCallout: (spliceId: SpliceId) => void;
  onSelectWireFromConnectorPin: (wireId: Wire["id"]) => void;
  onOpenInspectorForSelection: () => void;
  networkOffset: { x: number; y: number };
  networkScale: number;
}

export function NetworkSummaryCalloutsLayer({
  renderedCableCallouts,
  inverseLabelScale,
  selectedWireId,
  onHoverCallout,
  onCalloutMouseDown,
  onSelectConnectorFromCallout,
  onSelectSpliceFromCallout,
  onSelectWireFromConnectorPin,
  onOpenInspectorForSelection,
  networkOffset,
  networkScale
}: NetworkSummaryCalloutsLayerProps): ReactElement {
  const lastClickRef = useRef<{ key: string; timestamp: number } | null>(null);
  const isRepeatedClick = (key: string): boolean => {
    const timestamp = Date.now();
    const isRepeated = lastClickRef.current?.key === key && timestamp - lastClickRef.current.timestamp <= DOUBLE_CLICK_INTERVAL_MS;
    lastClickRef.current = { key, timestamp };
    return isRepeated;
  };

  return (
    <g
      className="network-graph-layer network-graph-layer-callouts"
      transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}
    >
      {renderedCableCallouts.map(({ callout, layout, calloutClassName, isVisibleInViewport }) => {
        const contentLeftX = -layout.width / 2 + 4;
        const headerY = -layout.height / 2 + layout.headerY;
        const rowsStartY = -layout.height / 2 + layout.rowsStartY;
        const lastColumn = layout.columns[layout.columns.length - 1];
        const tableRightX =
          lastColumn === undefined ? contentLeftX : contentLeftX + lastColumn.x + lastColumn.width;
        const highlightedCavityIndexes = getHighlightedConnectorCavityIndexes(callout.groups, selectedWireId);
        const wireIdByCavityIndex = getConnectorCavityWireIdByIndex(callout.groups);
        const isInteractive = isVisibleInViewport;

        return (
          <g
            key={callout.key}
            className={calloutClassName}
            onMouseEnter={isInteractive ? () => onHoverCallout(callout.key) : undefined}
            onMouseLeave={isInteractive ? () => onHoverCallout(null) : undefined}
            aria-hidden={isInteractive ? undefined : "true"}
          >
            <g
              className={isInteractive ? "network-callout-anchor" : "network-callout-export-anchor"}
              transform={`translate(${callout.position.x} ${callout.position.y}) scale(${inverseLabelScale})`}
              role={isInteractive ? "button" : undefined}
              tabIndex={isInteractive ? 0 : undefined}
              focusable={isInteractive ? "true" : undefined}
              aria-label={isInteractive ? `Select ${callout.kind} ${callout.title}` : undefined}
              onMouseDown={isInteractive ? (event) => onCalloutMouseDown(event, callout) : undefined}
              onClick={
                isInteractive
                  ? (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (event.detail < 2 && !isRepeatedClick(`callout:${callout.key}`)) {
                        return;
                      }
                      if (callout.kind === "connector") {
                        onSelectConnectorFromCallout(callout.entityId as ConnectorId);
                      } else {
                        onSelectSpliceFromCallout(callout.entityId as SpliceId);
                      }
                      onOpenInspectorForSelection();
                    }
                  : undefined
              }
              onDoubleClick={
                isInteractive
                  ? (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (callout.kind === "connector") {
                        onSelectConnectorFromCallout(callout.entityId as ConnectorId);
                      } else {
                        onSelectSpliceFromCallout(callout.entityId as SpliceId);
                      }
                      onOpenInspectorForSelection();
                    }
                  : undefined
              }
              onKeyDown={
                isInteractive
                  ? (event: ReactKeyboardEvent<SVGGElement>) => {
                      if (event.key !== "Enter" && event.key !== " ") {
                        return;
                      }
                      event.preventDefault();
                      event.stopPropagation();
                      if (callout.kind === "connector") {
                        onSelectConnectorFromCallout(callout.entityId as ConnectorId);
                      } else {
                        onSelectSpliceFromCallout(callout.entityId as SpliceId);
                      }
                    }
                  : undefined
              }
            >
              <rect
                className="network-callout-frame"
                x={-layout.width / 2}
                y={-layout.height / 2}
                width={layout.width}
                height={layout.height}
              />
              <g className="network-callout-content">
                {callout.connectorLayout !== undefined && layout.drawingTopY !== null ? (
                  <g transform={`translate(0 ${-layout.height / 2 + layout.drawingTopY})`}>
                    {renderConnectorLayoutDrawing(
                      callout.connectorLayout,
                      layout.drawingWidth,
                      layout.drawingHeight,
                      highlightedCavityIndexes,
                      undefined,
                      wireIdByCavityIndex,
                      onSelectWireFromConnectorPin,
                      onOpenInspectorForSelection
                    )}
                  </g>
                ) : null}
                <text
                  className="network-callout-title"
                  x={-layout.width / 2 + 4}
                  y={-layout.height / 2 + layout.titleStartY}
                  textAnchor="start"
                  dominantBaseline="hanging"
                >
                  {callout.title}
                </text>
                {layout.subtitleStartY !== null ? (
                  <text
                    className="network-callout-subtitle"
                    x={-layout.width / 2 + 4}
                    y={-layout.height / 2 + layout.subtitleStartY}
                    textAnchor="start"
                    dominantBaseline="hanging"
                  >
                    {callout.subtitle}
                  </text>
                ) : null}
                {layout.rows.length > 0 ? (
                  <>
                    {layout.columns.map((column) => {
                      const x =
                        column.textAnchor === "end"
                          ? contentLeftX + column.x + column.width
                          : contentLeftX + column.x;
                      return (
                        <text
                          key={`${callout.key}-header-${column.key}`}
                          className="network-callout-table-header-cell"
                          x={x}
                          y={headerY}
                          textAnchor={column.textAnchor}
                          dominantBaseline="hanging"
                          data-locale-exempt={
                            column.key === "technicalId" ||
                            column.key === "color" ||
                            column.key === "targetId" ||
                            column.key === "length" ||
                            column.key === "section"
                              ? "true"
                              : undefined
                          }
                        >
                          {column.header}
                        </text>
                      );
                    })}
                    <line
                      className="network-callout-table-divider"
                      x1={contentLeftX}
                      y1={rowsStartY - 0.35}
                      x2={tableRightX}
                      y2={rowsStartY - 0.35}
                    />
                    {layout.rows.map((row, rowIndex) => {
                      const rowY = rowsStartY + rowIndex * layout.rowStep;
                      const isSelectedWireRow = selectedWireId !== null && row.wireId === selectedWireId;
                      const rowClassName = `network-callout-table-row${isSelectedWireRow ? " is-selected-wire" : ""}`;
                      return (
                        <g
                          key={`${callout.key}-row-${rowIndex}`}
                          className={rowClassName}
                          data-wire-id={row.wireId}
                        >
                          {isSelectedWireRow ? (
                            <rect
                              className="network-callout-table-row-highlight"
                              x={contentLeftX - 0.8}
                              y={rowY - 0.25}
                              width={Math.max(0, tableRightX - contentLeftX + 1.6)}
                              height={layout.rowHeight + 0.45}
                              rx={0.5}
                              ry={0.5}
                            />
                          ) : null}
                          {layout.columns.map((column) => {
                            const x =
                              column.textAnchor === "end"
                                ? contentLeftX + column.x + column.width
                                : contentLeftX + column.x;
                            if (column.key === "color") {
                              const swatchWidth = getCalloutColorSwatchesWidth(row);
                              const dotDiameter = CALLOUT_COLOR_SWATCH_RADIUS * 2;
                              const swatchCenterY = rowY + layout.rowHeight / 2;
                              return (
                                <g key={`${callout.key}-row-${rowIndex}-${column.key}`}>
                                  {row.colorPrimaryHex !== null ? (
                                    <circle
                                      className="network-callout-color-dot"
                                      cx={x + CALLOUT_COLOR_SWATCH_RADIUS}
                                      cy={swatchCenterY}
                                      r={CALLOUT_COLOR_SWATCH_RADIUS}
                                      fill={row.colorPrimaryHex}
                                    />
                                  ) : null}
                                  {row.colorSecondaryHex !== null ? (
                                    <circle
                                      className="network-callout-color-dot"
                                      cx={x + CALLOUT_COLOR_SWATCH_RADIUS + dotDiameter + CALLOUT_COLOR_SWATCH_GAP}
                                      cy={swatchCenterY}
                                      r={CALLOUT_COLOR_SWATCH_RADIUS}
                                      fill={row.colorSecondaryHex}
                                    />
                                  ) : null}
                                  <text
                                    className={`network-callout-table-cell${isSelectedWireRow ? " is-selected-wire" : ""}`}
                                    x={x + swatchWidth}
                                    y={rowY}
                                    textAnchor={column.textAnchor}
                                    dominantBaseline="hanging"
                                  >
                                    {getCalloutRowCellValue(row, column.key)}
                                  </text>
                                </g>
                              );
                            }
                            return (
                              <text
                                key={`${callout.key}-row-${rowIndex}-${column.key}`}
                                className={`network-callout-table-cell${isSelectedWireRow ? " is-selected-wire" : ""}`}
                                x={x}
                                y={rowY}
                                textAnchor={column.textAnchor}
                                dominantBaseline="hanging"
                              >
                                {getCalloutRowCellValue(row, column.key)}
                              </text>
                            );
                          })}
                        </g>
                      );
                    })}
                  </>
                ) : null}
              </g>
            </g>
          </g>
        );
      })}
    </g>
  );
}

import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactElement } from "react";
import type {
  ConnectorId,
  ConnectorLayout,
  ConnectorLayoutKeyingShape,
  ConnectorLayoutKeyingSide,
  ConnectorLayoutShellShape,
  SpliceId,
  Wire
} from "../../../../core/entities";
import {
  DEFAULT_CONNECTOR_LAYOUT_KEYING_SCALE,
  getConnectorLayoutKeyings,
  getConnectorLayoutShellPadding,
  getConnectorLayoutShellShape,
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

type RenderableKeying = {
  side: Exclude<ConnectorLayoutKeyingSide, "none">;
  position?: number;
  shape?: ConnectorLayoutKeyingShape;
  color?: string;
  scale?: number;
};

type KeyingAnchor = {
  x: number;
  y: number;
  normalX: number;
  normalY: number;
};

function clampUnit(value: number): number {
  return Math.min(1, Math.max(-1, value));
}

function getKeyingStyle(keying: RenderableKeying): CSSProperties | undefined {
  return keying.color === undefined ? undefined : { fill: keying.color };
}

function getKeyingAnchor(
  keying: RenderableKeying,
  layout: ConnectorLayout,
  shellShape: ConnectorLayoutShellShape,
  shellPadding: number
): KeyingAnchor {
  const centerX = layout.width / 2 + 0.5;
  const centerY = layout.height / 2 + 0.5;
  const left = 1 - shellPadding;
  const top = 1 - shellPadding;
  const right = layout.width + shellPadding;
  const bottom = layout.height + shellPadding;
  if (shellShape === "circle") {
    const radiusX = (layout.width - 1) / 2 + shellPadding;
    const radiusY = (layout.height - 1) / 2 + shellPadding;
    if (keying.side === "top" || keying.side === "bottom") {
      const x = keying.position ?? centerX;
      const relativeX = clampUnit((x - centerX) / radiusX);
      const signedY = (keying.side === "top" ? -1 : 1) * radiusY * Math.sqrt(1 - relativeX * relativeX);
      const y = centerY + signedY;
      const normalX = relativeX / radiusX;
      const normalY = signedY / (radiusY * radiusY);
      const normalLength = Math.hypot(normalX, normalY) || 1;
      return { x, y, normalX: normalX / normalLength, normalY: normalY / normalLength };
    }
    const y = keying.position ?? centerY;
    const relativeY = clampUnit((y - centerY) / radiusY);
    const signedX = (keying.side === "left" ? -1 : 1) * radiusX * Math.sqrt(1 - relativeY * relativeY);
    const x = centerX + signedX;
    const normalX = signedX / (radiusX * radiusX);
    const normalY = relativeY / radiusY;
    const normalLength = Math.hypot(normalX, normalY) || 1;
    return { x, y, normalX: normalX / normalLength, normalY: normalY / normalLength };
  }
  const keyingX = keying.position ?? centerX;
  const keyingY = keying.position ?? centerY;
  const anchorBySide: Record<Exclude<ConnectorLayoutKeyingSide, "none">, KeyingAnchor> = {
    top: { x: keyingX, y: top, normalX: 0, normalY: -1 },
    right: { x: right, y: keyingY, normalX: 1, normalY: 0 },
    bottom: { x: keyingX, y: bottom, normalX: 0, normalY: 1 },
    left: { x: left, y: keyingY, normalX: -1, normalY: 0 }
  };
  return anchorBySide[keying.side];
}

function renderConnectorKeying(
  keying: RenderableKeying,
  layout: ConnectorLayout,
  shellShape: ConnectorLayoutShellShape,
  shellPadding: number
): ReactElement {
  const anchor = getKeyingAnchor(keying, layout, shellShape, shellPadding);
  const shape = keying.shape ?? "arrow";
  const keyingScale = keying.scale ?? DEFAULT_CONNECTOR_LAYOUT_KEYING_SCALE;
  const markerSize = KEYING_MARKER_SIZE * keyingScale;
  const markerRadius = KEYING_MARKER_RADIUS * keyingScale;
  const arrowWidth = KEYING_ARROW_WIDTH * keyingScale;
  const arrowDepth = KEYING_ARROW_DEPTH * keyingScale;
  const markerDirection = shape === "square" ? -1 : shape === "round" || shape === "diamond" ? 0 : 1;
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
        transform={`rotate(${markerAngle} ${markerCenterX} ${markerCenterY})`}
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
        transform={`rotate(${markerAngle + 45} ${markerCenterX} ${markerCenterY})`}
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

function renderConnectorLayoutDrawing(layout: ConnectorLayout, width: number, height: number): ReactElement {
  const shellPadding = getConnectorLayoutShellPadding(layout);
  const shellShape = getConnectorLayoutShellShape(layout);
  const minX = 1 - shellPadding - 0.5;
  const minY = 1 - shellPadding - 0.5;
  const viewWidth = layout.width - 1 + shellPadding * 2 + 1;
  const viewHeight = layout.height - 1 + shellPadding * 2 + 1;
  const scale = Math.min(width / viewWidth, height / viewHeight);
  const inverseDrawingScale = scale > 0 ? 1 / scale : 1;
  const originX = -width / 2 + (width - viewWidth * scale) / 2 - minX * scale;
  const originY = (height - viewHeight * scale) / 2 - minY * scale;
  const shellX = 1 - shellPadding;
  const shellY = 1 - shellPadding;
  const shellWidth = layout.width - 1 + shellPadding * 2;
  const shellHeight = layout.height - 1 + shellPadding * 2;

  return (
    <g className="network-callout-connector-drawing" transform={`translate(${originX} ${originY}) scale(${scale})`}>
      {shellShape === "circle" ? (
        <ellipse
          className="network-callout-connector-shell"
          cx={layout.width / 2 + 0.5}
          cy={layout.height / 2 + 0.5}
          rx={shellWidth / 2}
          ry={shellHeight / 2}
        />
      ) : (
        <rect
          className="network-callout-connector-shell"
          x={shellX}
          y={shellY}
          width={shellWidth}
          height={shellHeight}
          rx={Math.min(0.55, shellPadding)}
        />
      )}
      {getConnectorLayoutKeyings(layout).map((keying, index) => (
        <g key={`${keying.side}-${keying.shape ?? "arrow"}-${keying.position ?? "auto"}-${keying.scale ?? "default"}-${index}`}>
          {renderConnectorKeying(keying as RenderableKeying, layout, shellShape, shellPadding)}
        </g>
      ))}
      {layout.ways.map((way) => {
        const label = getConnectorLayoutWayDisplayLabel(way);
        const labelClassName = `network-callout-connector-way-label${label.length > 2 ? " is-long-label" : ""}`;
        const labelFontSize = label.length > 2 ? 4.7 : 5.8;
        return (
          <g key={way.cavityIndex} transform={`translate(${way.x} ${way.y})`}>
            {way.shape === "square" ? (
              <rect className="network-callout-connector-way" x={-0.28} y={-0.28} width={0.56} height={0.56} rx={0.08} />
            ) : way.shape === "slot" ? (
              <rect className="network-callout-connector-way" x={-0.32} y={-0.22} width={0.64} height={0.44} rx={0.22} />
            ) : (
              <circle className="network-callout-connector-way" r={0.32} />
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
  networkOffset,
  networkScale
}: NetworkSummaryCalloutsLayerProps): ReactElement {
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

        return (
          <g
            key={callout.key}
            className={calloutClassName}
            onMouseEnter={() => onHoverCallout(callout.key)}
            onMouseLeave={() => onHoverCallout(null)}
          >
            <g
              className="network-callout-anchor"
              transform={`translate(${callout.position.x} ${callout.position.y}) scale(${inverseLabelScale})`}
              role="button"
              tabIndex={isVisibleInViewport ? 0 : -1}
              focusable={isVisibleInViewport ? "true" : "false"}
              aria-hidden={isVisibleInViewport ? undefined : true}
              aria-label={`Select ${callout.kind} ${callout.title}`}
              style={isVisibleInViewport ? undefined : { pointerEvents: "none" }}
              onMouseDown={(event) => onCalloutMouseDown(event, callout)}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onKeyDown={(event: ReactKeyboardEvent<SVGGElement>) => {
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
              }}
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
                      layout.drawingHeight
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

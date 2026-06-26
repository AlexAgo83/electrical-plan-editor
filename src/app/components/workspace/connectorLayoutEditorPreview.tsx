import type { CSSProperties, ReactElement } from "react";
import type {
  ConnectorLayout,
  ConnectorLayoutKeying,
  ConnectorLayoutKeyingPlacement,
  ConnectorLayoutShellShape,
  ConnectorLayoutWay
} from "../../../core/entities";
import {
  DEFAULT_CONNECTOR_LAYOUT_CELL_PADDING,
  DEFAULT_CONNECTOR_LAYOUT_KEYING_SCALE,
  getConnectorLayoutCellPadding,
  getConnectorLayoutKeyingAnchor,
  getConnectorLayoutShellCornerRadius,
  getConnectorLayoutShellStrokeWidth,
  getConnectorLayoutWaySizeScale,
  getConnectorLayoutWayDisplayLabel
} from "../../../core/connectorLayout";

const KEYING_MARKER_SIZE = 0.28;
const KEYING_MARKER_RADIUS = 0.15;
const KEYING_ARROW_WIDTH = 0.32;
const KEYING_ARROW_DEPTH = 0.19;
const DEFAULT_WAY_RENDER_CELL_SIZE = 1 - DEFAULT_CONNECTOR_LAYOUT_CELL_PADDING;

type RenderableKeying = {
  color?: string;
};

function getKeyingStyle(keying: RenderableKeying): CSSProperties | undefined {
  return keying.color === undefined ? undefined : { fill: keying.color };
}

function getWayRenderScale(cellPadding: number): number {
  return (1 - cellPadding) / DEFAULT_WAY_RENDER_CELL_SIZE;
}

export function renderConnectorLayoutWay(way: ConnectorLayoutWay, isSelected: boolean, layout: ConnectorLayout): ReactElement {
  const commonProps = {
    className: `connector-layout-way-shape${isSelected ? " is-selected" : ""}${
      way.strokeStyle === "dashed" ? " is-dashed" : ""
    }${way.size === "big" ? " is-big" : ""}${way.size === "small" ? " is-small" : ""}`
  };
  const scale = getWayRenderScale(getConnectorLayoutCellPadding(layout));
  const sizeScale = getConnectorLayoutWaySizeScale(way);
  if (way.shape === "square") {
    const size = 0.56 * scale * sizeScale;
    return <rect {...commonProps} x={-size / 2} y={-size / 2} width={size} height={size} rx={0.08 * scale} />;
  }
  if (way.shape === "slot") {
    const width = 0.64 * scale * sizeScale;
    const height = 0.44 * scale * sizeScale;
    return <rect {...commonProps} x={-width / 2} y={-height / 2} width={width} height={height} rx={height / 2} />;
  }
  return <circle {...commonProps} r={0.32 * scale * sizeScale} />;
}

export function renderConnectorLayoutKeying(
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
        className="connector-layout-keying"
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
    return <circle className="connector-layout-keying" style={style} cx={markerCenterX} cy={markerCenterY} r={markerRadius} aria-hidden="true" />;
  }
  if (shape === "diamond") {
    return (
      <rect
        className="connector-layout-keying"
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
  return <path className="connector-layout-keying" style={style} d={path} aria-hidden="true" />;
}

export function renderConnectorLayoutShell(
  layout: ConnectorLayout,
  shellShape: ConnectorLayoutShellShape,
  shellPadding: number
): ReactElement {
  const x = 1 - shellPadding;
  const y = 1 - shellPadding;
  const width = layout.width - 1 + shellPadding * 2;
  const height = layout.height - 1 + shellPadding * 2;
  const cornerRadius = Math.min(0.55, shellPadding) * getConnectorLayoutShellCornerRadius(layout);
  const strokeWidth = getConnectorLayoutShellStrokeWidth(layout);
  if (shellShape === "circle") {
    return (
      <ellipse
        className="connector-layout-shell"
        cx={layout.width / 2 + 0.5}
        cy={layout.height / 2 + 0.5}
        rx={width / 2}
        ry={height / 2}
        style={{ strokeWidth }}
      />
    );
  }
  return <rect className="connector-layout-shell" x={x} y={y} width={width} height={height} rx={cornerRadius} style={{ strokeWidth }} />;
}

export function renderConnectorLayoutGrid(layout: ConnectorLayout): ReactElement {
  const minX = 0.5;
  const minY = 0.5;
  const maxX = layout.width + 0.5;
  const maxY = layout.height + 0.5;
  return (
    <g className="connector-layout-grid" aria-hidden="true">
      {Array.from({ length: layout.width + 1 }, (_, index) => {
        const x = index + 0.5;
        return <line key={`grid-x-${x}`} className="connector-layout-grid-line" x1={x} y1={minY} x2={x} y2={maxY} />;
      })}
      {Array.from({ length: layout.height + 1 }, (_, index) => {
        const y = index + 0.5;
        return <line key={`grid-y-${y}`} className="connector-layout-grid-line" x1={minX} y1={y} x2={maxX} y2={y} />;
      })}
      {Array.from({ length: layout.width }, (_, index) => {
        const x = index + 1;
        return <line key={`grid-center-x-${x}`} className="connector-layout-grid-center-line" x1={x} y1={minY} x2={x} y2={maxY} />;
      })}
      {Array.from({ length: layout.height }, (_, index) => {
        const y = index + 1;
        return <line key={`grid-center-y-${y}`} className="connector-layout-grid-center-line" x1={minX} y1={y} x2={maxX} y2={y} />;
      })}
    </g>
  );
}

export function getConnectorLayoutViewBox(layout: ConnectorLayout, shellPadding: number): string {
  const minX = 1 - shellPadding - 0.5;
  const minY = 1 - shellPadding - 0.5;
  const width = layout.width - 1 + shellPadding * 2 + 1;
  const height = layout.height - 1 + shellPadding * 2 + 1;
  return `${minX} ${minY} ${width} ${height}`;
}

function snapKeyingCoordinateToGrid(value: number, maxGridCoordinate: number): number {
  return Math.min(maxGridCoordinate + 0.5, Math.max(0.5, Math.round(value * 2) / 2));
}

export function snapKeyingPositionToGrid(layout: ConnectorLayout, position: { x: number; y: number }): { x: number; y: number } {
  return {
    x: snapKeyingCoordinateToGrid(position.x, layout.width),
    y: snapKeyingCoordinateToGrid(position.y, layout.height)
  };
}

function roundPathPosition(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function getHalfStepValues(min: number, max: number): number[] {
  const values: number[] = [];
  const start = Math.ceil(min * 2) / 2;
  const end = Math.floor(max * 2) / 2;
  for (let value = start; value <= end + 0.0001; value += 0.5) {
    values.push(roundPathPosition(value));
  }
  return values;
}

function getCircularPathDistance(left: number, right: number, perimeter: number): number {
  const distance = Math.abs(right - left);
  return Math.min(distance, perimeter - distance);
}

function snapSquareGuidedPathPositionToGrid(layout: ConnectorLayout, pathPosition: number, shellPadding: number): number {
  const left = 1 - shellPadding;
  const top = 1 - shellPadding;
  const right = layout.width + shellPadding;
  const bottom = layout.height + shellPadding;
  const topLength = Math.max(0.0001, right - left);
  const rightLength = Math.max(0.0001, bottom - top);
  const bottomLength = topLength;
  const perimeter = topLength * 2 + rightLength * 2;
  const requestedDistance = Math.min(perimeter, Math.max(0, pathPosition * perimeter));
  const candidateDistances = [
    ...getHalfStepValues(left, right).map((x) => x - left),
    ...getHalfStepValues(top, bottom).map((y) => topLength + y - top),
    ...getHalfStepValues(left, right).map((x) => topLength + rightLength + right - x),
    ...getHalfStepValues(top, bottom).map((y) => topLength + rightLength + bottomLength + bottom - y)
  ];
  const snappedDistance = candidateDistances.reduce((best, candidate) =>
    getCircularPathDistance(requestedDistance, candidate, perimeter) < getCircularPathDistance(requestedDistance, best, perimeter)
      ? candidate
      : best
  );
  return roundPathPosition(snappedDistance / perimeter);
}

function snapCircleGuidedPathPositionToGrid(layout: ConnectorLayout, pathPosition: number, shellPadding: number): number {
  const centerX = layout.width / 2 + 0.5;
  const centerY = layout.height / 2 + 0.5;
  const radiusX = (layout.width - 1) / 2 + shellPadding;
  const radiusY = (layout.height - 1) / 2 + shellPadding;
  const candidates: number[] = [];
  for (const x of getHalfStepValues(centerX - radiusX, centerX + radiusX)) {
    const ratio = (x - centerX) / radiusX;
    const yOffset = Math.sqrt(Math.max(0, 1 - ratio * ratio)) * radiusY;
    for (const y of [centerY - yOffset, centerY + yOffset]) {
      const angle = Math.atan2(y - centerY, x - centerX);
      candidates.push(roundPathPosition(((angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)));
    }
  }
  for (const y of getHalfStepValues(centerY - radiusY, centerY + radiusY)) {
    const ratio = (y - centerY) / radiusY;
    const xOffset = Math.sqrt(Math.max(0, 1 - ratio * ratio)) * radiusX;
    for (const x of [centerX - xOffset, centerX + xOffset]) {
      const angle = Math.atan2(y - centerY, x - centerX);
      candidates.push(roundPathPosition(((angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)));
    }
  }
  return candidates.reduce((best, candidate) =>
    getCircularPathDistance(pathPosition, candidate, 1) < getCircularPathDistance(pathPosition, best, 1) ? candidate : best
  );
}

export function snapGuidedPathPositionToGrid(
  layout: ConnectorLayout,
  pathPosition: number,
  shellShape: ConnectorLayoutShellShape,
  shellPadding: number
): number {
  const normalized = Math.min(1, Math.max(0, pathPosition));
  if (shellShape === "circle") {
    return snapCircleGuidedPathPositionToGrid(layout, normalized, shellPadding);
  }
  return snapSquareGuidedPathPositionToGrid(layout, normalized, shellPadding);
}

export function isKeyingSnapEnabled(placement: ConnectorLayoutKeyingPlacement): boolean {
  return placement.snapToGrid !== false;
}

export { getConnectorLayoutWayDisplayLabel };

import type { CSSProperties, ReactElement } from "react";
import type {
  CatalogItem,
  Connector,
  ConnectorLayout,
  ConnectorLayoutKeying,
  ConnectorLayoutKeyingShape,
  ConnectorLayoutShellShape,
  Wire,
  WireId
} from "../../../core/entities";
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
  getConnectorLayoutWayDisplayLabel,
  resolveConnectorLayout
} from "../../../core/connectorLayout";
import { CABLE_COLOR_BY_ID } from "../../../core/cableColors";
import { parseWireOccupantRef } from "../../lib/app-utils-networking";
import { renderWireColorPrefixMarker } from "../../lib/wireColorPresentation";
import type { ConnectorCavityStatus } from "./AnalysisWorkspaceContent.types";

interface ConnectorPhysicalViewProps {
  connector: Connector;
  catalogItem: CatalogItem | undefined;
  connectorCavityStatuses: ConnectorCavityStatus[];
  wireById: Map<WireId, Wire>;
  selectedWireId: WireId | null;
  parseOccupantWireId: (occupantRef: string | null) => WireId | null;
  onGoToWire: (wireId: WireId) => void;
  onReleaseCavity: (cavityIndex: number) => void;
}

type RenderableKeying = {
  shape?: ConnectorLayoutKeyingShape;
  color?: string;
  scale?: number;
};

const KEYING_MARKER_SIZE = 0.28;
const KEYING_MARKER_RADIUS = 0.15;
const KEYING_ARROW_WIDTH = 0.32;
const KEYING_ARROW_DEPTH = 0.19;
const WIRE_TECHNICAL_ID_FONT_SIZE = 0.08;
const WIRE_TECHNICAL_ID_BACKGROUND_HEIGHT = 0.14;
const WIRE_TECHNICAL_ID_BACKGROUND_MIN_WIDTH = 0.3;
const WIRE_TECHNICAL_ID_BACKGROUND_CHAR_WIDTH = 0.045;
const WIRE_TECHNICAL_ID_BACKGROUND_HORIZONTAL_PADDING = 0.08;
const WIRE_TECHNICAL_ID_COLOR_DOT_RADIUS = 0.035;
const WIRE_TECHNICAL_ID_COLOR_DOT_GAP = 0.025;
const WIRE_TECHNICAL_ID_COLOR_DOT_TEXT_GAP = 0.045;
const DEFAULT_WAY_RENDER_CELL_SIZE = 1 - DEFAULT_CONNECTOR_LAYOUT_CELL_PADDING;

function getPhysicalKeyingStyle(keying: RenderableKeying): CSSProperties | undefined {
  return keying.color === undefined ? undefined : { fill: keying.color };
}

function getPhysicalWayRenderScale(cellPadding: number): number {
  return (1 - cellPadding) / DEFAULT_WAY_RENDER_CELL_SIZE;
}

function renderPhysicalWayShape(shape: string, isOccupied: boolean, isWireHighlighted: boolean, cellPadding: number): ReactElement {
  const className = `connector-physical-way-shape${isOccupied ? " is-occupied" : ""}${
    isWireHighlighted ? " is-wire-highlighted" : ""
  }`;
  const scale = getPhysicalWayRenderScale(cellPadding);
  if (shape === "square") {
    const size = 0.6 * scale;
    return <rect className={className} x={-size / 2} y={-size / 2} width={size} height={size} rx={0.08 * scale} />;
  }
  if (shape === "slot") {
    const width = 0.66 * scale;
    const height = 0.44 * scale;
    return <rect className={className} x={-width / 2} y={-height / 2} width={width} height={height} rx={height / 2} />;
  }
  return <circle className={className} r={0.33 * scale} />;
}

function renderPhysicalKeying(
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
  const style = getPhysicalKeyingStyle(keying);
  const markerAngle = (Math.atan2(anchor.normalY, anchor.normalX) * 180) / Math.PI;
  if (shape === "square") {
    return (
      <rect
        className="connector-physical-keying"
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
    return <circle className="connector-physical-keying" style={style} cx={markerCenterX} cy={markerCenterY} r={markerRadius} aria-hidden="true" />;
  }
  if (shape === "diamond") {
    return (
      <rect
        className="connector-physical-keying"
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
  return <path className="connector-physical-keying" style={style} d={path} aria-hidden="true" />;
}

function renderPhysicalShell(layout: ConnectorLayout, shellShape: ConnectorLayoutShellShape, shellPadding: number): ReactElement {
  const x = 1 - shellPadding;
  const y = 1 - shellPadding;
  const width = layout.width - 1 + shellPadding * 2;
  const height = layout.height - 1 + shellPadding * 2;
  const cornerRadius = Math.min(0.6, shellPadding) * getConnectorLayoutShellCornerRadius(layout);
  const strokeWidth = getConnectorLayoutShellStrokeWidth(layout);
  if (shellShape === "circle") {
    return (
      <ellipse
        className="connector-physical-shell"
        cx={layout.width / 2 + 0.5}
        cy={layout.height / 2 + 0.5}
        rx={width / 2}
        ry={height / 2}
        style={{ strokeWidth }}
      />
    );
  }
  return <rect className="connector-physical-shell" x={x} y={y} width={width} height={height} rx={cornerRadius} style={{ strokeWidth }} />;
}

function getWireTechnicalIdColorDotCount(wire: Wire | null): number {
  if (wire === null || wire.primaryColorId === null) {
    return 0;
  }
  return wire.secondaryColorId === null ? 1 : 2;
}

function getWireTechnicalIdColorDotWidth(wire: Wire | null): number {
  const dotCount = getWireTechnicalIdColorDotCount(wire);
  if (dotCount === 0) {
    return 0;
  }
  return dotCount * WIRE_TECHNICAL_ID_COLOR_DOT_RADIUS * 2 + (dotCount - 1) * WIRE_TECHNICAL_ID_COLOR_DOT_GAP;
}

function getWireTechnicalIdTextWidth(value: string): number {
  return value.length * WIRE_TECHNICAL_ID_BACKGROUND_CHAR_WIDTH;
}

function getWireTechnicalIdContentWidth(value: string, wire: Wire | null): number {
  const colorDotWidth = getWireTechnicalIdColorDotWidth(wire);
  return getWireTechnicalIdTextWidth(value) + (colorDotWidth > 0 ? colorDotWidth + WIRE_TECHNICAL_ID_COLOR_DOT_TEXT_GAP : 0);
}

function getWireTechnicalIdBackgroundWidth(value: string, wire: Wire | null): number {
  return Math.max(
    WIRE_TECHNICAL_ID_BACKGROUND_MIN_WIDTH,
    getWireTechnicalIdContentWidth(value, wire) + WIRE_TECHNICAL_ID_BACKGROUND_HORIZONTAL_PADDING * 2
  );
}

function renderPhysicalWireColorDots(wire: Wire | null, startX: number): ReactElement | null {
  if (wire === null || wire.primaryColorId === null) {
    return null;
  }
  const primary = CABLE_COLOR_BY_ID[wire.primaryColorId];
  const secondary = wire.secondaryColorId === null ? null : CABLE_COLOR_BY_ID[wire.secondaryColorId];
  const secondDotOffset = WIRE_TECHNICAL_ID_COLOR_DOT_RADIUS * 2 + WIRE_TECHNICAL_ID_COLOR_DOT_GAP;
  return (
    <g className="connector-physical-wire-color-dots" aria-hidden="true">
      <circle
        className="connector-physical-wire-color-dot"
        cx={startX + WIRE_TECHNICAL_ID_COLOR_DOT_RADIUS}
        cy={0}
        r={WIRE_TECHNICAL_ID_COLOR_DOT_RADIUS}
        style={{ fill: primary?.hex ?? "#7a7a7a" }}
      />
      {secondary !== null ? (
        <circle
          className="connector-physical-wire-color-dot"
          cx={startX + WIRE_TECHNICAL_ID_COLOR_DOT_RADIUS + secondDotOffset}
          cy={0}
          r={WIRE_TECHNICAL_ID_COLOR_DOT_RADIUS}
          style={{ fill: secondary?.hex ?? "#7a7a7a" }}
        />
      ) : null}
    </g>
  );
}

function renderPhysicalOccupantRef(occupantRef: string | null, wireById: Map<WireId, Wire>): ReactElement {
  if (occupantRef === null) {
    return <span>Free</span>;
  }
  const parsed = parseWireOccupantRef(occupantRef);
  if (parsed === null) {
    return <span>{occupantRef}</span>;
  }
  const technicalId = wireById.get(parsed.wireId)?.technicalId ?? parsed.wireId;
  return (
    <span className="cavity-occupant-ref" aria-label={`Wire ${technicalId} / ${parsed.side}`}>
      <span>{technicalId} / {parsed.side}</span>
    </span>
  );
}

function getPhysicalViewBox(layout: ConnectorLayout, shellPadding: number): string {
  const minX = 1 - shellPadding - 0.5;
  const minY = 1 - shellPadding - 0.5;
  const width = layout.width - 1 + shellPadding * 2 + 1;
  const height = layout.height - 1 + shellPadding * 2 + 1;
  return `${minX} ${minY} ${width} ${height}`;
}

export function ConnectorPhysicalView({
  connector,
  catalogItem,
  connectorCavityStatuses,
  wireById,
  selectedWireId,
  parseOccupantWireId,
  onGoToWire,
  onReleaseCavity
}: ConnectorPhysicalViewProps): ReactElement {
  const layout = resolveConnectorLayout(catalogItem?.connectorLayout, connector.cavityCount);
  const statusByCavity = new Map(connectorCavityStatuses.map((status) => [status.cavityIndex, status] as const));
  const keyings = getConnectorLayoutKeyings(layout);
  const shellShape = getConnectorLayoutShellShape(layout);
  const shellPadding = getConnectorLayoutShellPadding(layout);
  const cellPadding = getConnectorLayoutCellPadding(layout);

  return (
    <div className="connector-physical-view">
      <div className="connector-physical-canvas" aria-label="Connector physical view">
        <svg
          className="connector-physical-svg"
          viewBox={getPhysicalViewBox(layout, shellPadding)}
          role="img"
          aria-label={`${connector.technicalId} physical connector layout`}
        >
          {renderPhysicalShell(layout, shellShape, shellPadding)}
          {keyings.map((keying, index) => (
            <g key={`${keying.side}-${keying.shape ?? "arrow"}-${keying.position ?? "auto"}-${keying.scale ?? "default"}-${index}`}>
              {renderPhysicalKeying(keying, layout, shellShape, shellPadding)}
            </g>
          ))}
          {layout.ways.map((way) => {
            const status = statusByCavity.get(way.cavityIndex);
            const isOccupied = status?.isOccupied === true;
            const wireId = parseOccupantWireId(status?.occupantRef ?? null);
            const isWireHighlighted = selectedWireId !== null && wireId === selectedWireId;
            const wire = wireId === null ? null : wireById.get(wireId) ?? null;
            const wireTechnicalId = wire?.technicalId ?? null;
            const wireTechnicalIdBackgroundWidth =
              wireTechnicalId === null ? 0 : getWireTechnicalIdBackgroundWidth(wireTechnicalId, wire);
            const wireTechnicalIdContentWidth =
              wireTechnicalId === null ? 0 : getWireTechnicalIdContentWidth(wireTechnicalId, wire);
            const wireTechnicalIdColorDotWidth = getWireTechnicalIdColorDotWidth(wire);
            const wireTechnicalIdContentStartX = -wireTechnicalIdContentWidth / 2;
            const wireTechnicalIdTextWidth = wireTechnicalId === null ? 0 : getWireTechnicalIdTextWidth(wireTechnicalId);
            const wireTechnicalIdTextX =
              wireTechnicalIdContentStartX +
              wireTechnicalIdColorDotWidth +
              (wireTechnicalIdColorDotWidth > 0 ? WIRE_TECHNICAL_ID_COLOR_DOT_TEXT_GAP : 0) +
              wireTechnicalIdTextWidth / 2;
            const label = getConnectorLayoutWayDisplayLabel(way);
            const labelClassName = `connector-physical-way-label${label.length > 2 ? " is-long-label" : ""}`;
            const wireName = wire?.name.trim() ?? "";
            return (
              <g
                key={way.cavityIndex}
                className={`connector-physical-way${isWireHighlighted ? " is-wire-highlighted" : ""}`}
                transform={`translate(${way.x} ${way.y})`}
              >
                {wireName.length > 0 ? <title>{wireName}</title> : null}
                {renderPhysicalWayShape(way.shape, isOccupied, isWireHighlighted, cellPadding)}
                <text className={labelClassName} y={0}>
                  {label}
                </text>
                {wireTechnicalId !== null ? (
                  <g className="connector-physical-wire-technical-id-badge" transform="translate(0 0.32)">
                    <rect
                      className="connector-physical-wire-technical-id-bg"
                      x={-wireTechnicalIdBackgroundWidth / 2}
                      y={-WIRE_TECHNICAL_ID_BACKGROUND_HEIGHT / 2}
                      width={wireTechnicalIdBackgroundWidth}
                      height={WIRE_TECHNICAL_ID_BACKGROUND_HEIGHT}
                      rx={0.035}
                      aria-hidden="true"
                    />
                    {renderPhysicalWireColorDots(wire, wireTechnicalIdContentStartX)}
                    <text className="connector-physical-wire-technical-id" x={wireTechnicalIdTextX} y={0} style={{ fontSize: WIRE_TECHNICAL_ID_FONT_SIZE }}>
                      {wireTechnicalId}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="connector-physical-details">
        <div className="cavity-grid connector-physical-way-list" aria-label="Physical way details">
          {layout.ways.map((way) => {
            const status = statusByCavity.get(way.cavityIndex);
            const occupantRef = status?.occupantRef ?? null;
            const wireId = parseOccupantWireId(occupantRef);
            const wire = wireId === null ? null : wireById.get(wireId);
            const isWireHighlighted = selectedWireId !== null && wireId === selectedWireId;
            return (
              <article
                key={way.cavityIndex}
                className={`cavity${status?.isOccupied === true ? " is-occupied" : ""}${
                  isWireHighlighted ? " is-wire-highlighted" : ""
                }`}
              >
                <h3>C{way.cavityIndex}</h3>
                <p className="cavity-occupant-line">
                  {status?.isOccupied === true ? <span className="action-button-icon is-wires cavity-occupant-ref-icon" aria-hidden="true" /> : null}
                  {status?.isOccupied === true ? renderWireColorPrefixMarker(wire) : null}
                  {status?.isOccupied === true ? renderPhysicalOccupantRef(occupantRef, wireById) : <span>Free</span>}
                </p>
                {status?.isOccupied === true ? (
                  <div className="cavity-actions">
                    {wireId !== null ? (
                      <button type="button" className="validation-row-go-to-button button-with-icon" onClick={() => onGoToWire(wireId)}>
                        <span className="action-button-icon is-open" aria-hidden="true" />
                        Go to
                      </button>
                    ) : null}
                    <button type="button" className="button-with-icon" onClick={() => onReleaseCavity(way.cavityIndex)}>
                      Release
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import type { CSSProperties, ReactElement } from "react";
import type {
  CatalogItem,
  Connector,
  ConnectorLayout,
  ConnectorLayoutKeyingShape,
  ConnectorLayoutKeyingSide,
  ConnectorLayoutShellShape,
  Wire,
  WireId
} from "../../../core/entities";
import {
  getConnectorLayoutKeyings,
  getConnectorLayoutShellPadding,
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
  parseOccupantWireId: (occupantRef: string | null) => WireId | null;
  onGoToWire: (wireId: WireId) => void;
}

type RenderableKeying = {
  side: Exclude<ConnectorLayoutKeyingSide, "none">;
  position?: number;
  shape?: ConnectorLayoutKeyingShape;
  color?: string;
};

type KeyingAnchor = {
  x: number;
  y: number;
  normalX: number;
  normalY: number;
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

function clampUnit(value: number): number {
  return Math.min(1, Math.max(-1, value));
}

function getPhysicalKeyingStyle(keying: RenderableKeying): CSSProperties | undefined {
  return keying.color === undefined ? undefined : { fill: keying.color };
}

function renderPhysicalWayShape(shape: string, isOccupied: boolean): ReactElement {
  const className = isOccupied ? "connector-physical-way-shape is-occupied" : "connector-physical-way-shape";
  if (shape === "square") {
    return <rect className={className} x={-0.3} y={-0.3} width={0.6} height={0.6} rx={0.08} />;
  }
  if (shape === "slot") {
    return <rect className={className} x={-0.33} y={-0.22} width={0.66} height={0.44} rx={0.22} />;
  }
  return <circle className={className} r={0.33} />;
}

function getPhysicalKeyingAnchor(
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

function renderPhysicalKeying(
  keying: RenderableKeying,
  layout: ConnectorLayout,
  shellShape: ConnectorLayoutShellShape,
  shellPadding: number
): ReactElement {
  const anchor = getPhysicalKeyingAnchor(keying, layout, shellShape, shellPadding);
  const shape = keying.shape ?? "arrow";
  const markerDirection = shape === "square" ? -1 : shape === "round" || shape === "diamond" ? 0 : 1;
  const markerCenterX = anchor.x + anchor.normalX * (KEYING_MARKER_SIZE / 2) * markerDirection;
  const markerCenterY = anchor.y + anchor.normalY * (KEYING_MARKER_SIZE / 2) * markerDirection;
  const style = getPhysicalKeyingStyle(keying);
  const markerAngle = (Math.atan2(anchor.normalY, anchor.normalX) * 180) / Math.PI;
  if (shape === "square") {
    return (
      <rect
        className="connector-physical-keying"
        style={style}
        x={markerCenterX - KEYING_MARKER_SIZE / 2}
        y={markerCenterY - KEYING_MARKER_SIZE / 2}
        width={KEYING_MARKER_SIZE}
        height={KEYING_MARKER_SIZE}
        rx={0.035}
        transform={`rotate(${markerAngle} ${markerCenterX} ${markerCenterY})`}
        aria-hidden="true"
      />
    );
  }
  if (shape === "round") {
    return <circle className="connector-physical-keying" style={style} cx={markerCenterX} cy={markerCenterY} r={KEYING_MARKER_RADIUS} aria-hidden="true" />;
  }
  if (shape === "diamond") {
    return (
      <rect
        className="connector-physical-keying"
        style={style}
        x={markerCenterX - KEYING_MARKER_SIZE / 2}
        y={markerCenterY - KEYING_MARKER_SIZE / 2}
        width={KEYING_MARKER_SIZE}
        height={KEYING_MARKER_SIZE}
        transform={`rotate(${markerAngle + 45} ${markerCenterX} ${markerCenterY})`}
        aria-hidden="true"
      />
    );
  }
  const tangentX = -anchor.normalY;
  const tangentY = anchor.normalX;
  const baseX = anchor.x + anchor.normalX * KEYING_ARROW_DEPTH;
  const baseY = anchor.y + anchor.normalY * KEYING_ARROW_DEPTH;
  const halfWidth = KEYING_ARROW_WIDTH / 2;
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
  if (shellShape === "circle") {
    return (
      <ellipse
        className="connector-physical-shell"
        cx={layout.width / 2 + 0.5}
        cy={layout.height / 2 + 0.5}
        rx={width / 2}
        ry={height / 2}
      />
    );
  }
  return <rect className="connector-physical-shell" x={x} y={y} width={width} height={height} rx={Math.min(0.6, shellPadding)} />;
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
  parseOccupantWireId,
  onGoToWire
}: ConnectorPhysicalViewProps): ReactElement {
  const layout = resolveConnectorLayout(catalogItem?.connectorLayout, connector.cavityCount);
  const statusByCavity = new Map(connectorCavityStatuses.map((status) => [status.cavityIndex, status] as const));
  const hasCustomLayout = catalogItem?.connectorLayout !== undefined;
  const keyings = getConnectorLayoutKeyings(layout);
  const shellShape = getConnectorLayoutShellShape(layout);
  const shellPadding = getConnectorLayoutShellPadding(layout);

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
            <g key={`${keying.side}-${keying.shape ?? "arrow"}-${keying.position ?? "auto"}-${index}`}>
              {renderPhysicalKeying(keying as RenderableKeying, layout, shellShape, shellPadding)}
            </g>
          ))}
          {layout.ways.map((way) => {
            const status = statusByCavity.get(way.cavityIndex);
            const isOccupied = status?.isOccupied === true;
            const wireId = parseOccupantWireId(status?.occupantRef ?? null);
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
            return (
              <g key={way.cavityIndex} className="connector-physical-way" transform={`translate(${way.x} ${way.y})`}>
                {renderPhysicalWayShape(way.shape, isOccupied)}
                <text className="connector-physical-way-label" y={0}>
                  {getConnectorLayoutWayDisplayLabel(way)}
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
        <p className="meta-line">
          {hasCustomLayout ? "Using catalog physical layout." : "Using generated layout. Edit the catalog item to define the physical face."}
        </p>
        <div className="cavity-grid connector-physical-way-list" aria-label="Physical way details">
          {layout.ways.map((way) => {
            const status = statusByCavity.get(way.cavityIndex);
            const occupantRef = status?.occupantRef ?? null;
            const wireId = parseOccupantWireId(occupantRef);
            const wire = wireId === null ? null : wireById.get(wireId);
            return (
              <article key={way.cavityIndex} className={status?.isOccupied === true ? "cavity is-occupied" : "cavity"}>
                <h3>C{way.cavityIndex}</h3>
                <p className="cavity-occupant-line">
                  {status?.isOccupied === true ? <span className="action-button-icon is-wires cavity-occupant-ref-icon" aria-hidden="true" /> : null}
                  {status?.isOccupied === true ? renderWireColorPrefixMarker(wire) : null}
                  {status?.isOccupied === true ? renderPhysicalOccupantRef(occupantRef, wireById) : <span>Free</span>}
                </p>
                {wireId !== null ? (
                  <div className="cavity-actions">
                    <button type="button" className="validation-row-go-to-button button-with-icon" onClick={() => onGoToWire(wireId)}>
                      <span className="action-button-icon is-open" aria-hidden="true" />
                      Go to
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

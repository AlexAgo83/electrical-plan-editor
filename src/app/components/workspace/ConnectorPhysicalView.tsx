import type { CSSProperties, ReactElement } from "react";
import type {
  CatalogItem,
  Connector,
  ConnectorLayout,
  ConnectorLayoutKeyingShape,
  ConnectorLayoutKeyingSide,
  ConnectorLayoutShellShape,
  WireId
} from "../../../core/entities";
import {
  getConnectorLayoutKeyings,
  getConnectorLayoutShellShape,
  resolveConnectorLayout
} from "../../../core/connectorLayout";
import type { ConnectorCavityStatus } from "./AnalysisWorkspaceContent.types";

interface ConnectorPhysicalViewProps {
  connector: Connector;
  catalogItem: CatalogItem | undefined;
  connectorCavityStatuses: ConnectorCavityStatus[];
  formatOccupantRef: (occupantRef: string | null) => string;
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
  shellShape: ConnectorLayoutShellShape
): KeyingAnchor {
  const centerX = layout.width / 2 + 0.5;
  const centerY = layout.height / 2 + 0.5;
  const right = layout.width + 0.5;
  const bottom = layout.height + 0.5;
  if (shellShape === "circle") {
    const radiusX = layout.width / 2;
    const radiusY = layout.height / 2;
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
    top: { x: keyingX, y: 0.5, normalX: 0, normalY: -1 },
    right: { x: right, y: keyingY, normalX: 1, normalY: 0 },
    bottom: { x: keyingX, y: bottom, normalX: 0, normalY: 1 },
    left: { x: 0.5, y: keyingY, normalX: -1, normalY: 0 }
  };
  return anchorBySide[keying.side];
}

function renderPhysicalKeying(
  keying: RenderableKeying,
  layout: ConnectorLayout,
  shellShape: ConnectorLayoutShellShape
): ReactElement {
  const anchor = getPhysicalKeyingAnchor(keying, layout, shellShape);
  const markerCenterX = anchor.x + anchor.normalX * (KEYING_MARKER_SIZE / 2);
  const markerCenterY = anchor.y + anchor.normalY * (KEYING_MARKER_SIZE / 2);
  const shape = keying.shape ?? "arrow";
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

function renderPhysicalShell(layout: ConnectorLayout, shellShape: ConnectorLayoutShellShape): ReactElement {
  if (shellShape === "circle") {
    return (
      <ellipse
        className="connector-physical-shell"
        cx={layout.width / 2 + 0.5}
        cy={layout.height / 2 + 0.5}
        rx={layout.width / 2}
        ry={layout.height / 2}
      />
    );
  }
  return <rect className="connector-physical-shell" x={0.5} y={0.5} width={layout.width} height={layout.height} rx={0.6} />;
}

export function ConnectorPhysicalView({
  connector,
  catalogItem,
  connectorCavityStatuses,
  formatOccupantRef,
  parseOccupantWireId,
  onGoToWire
}: ConnectorPhysicalViewProps): ReactElement {
  const layout = resolveConnectorLayout(catalogItem?.connectorLayout, connector.cavityCount);
  const statusByCavity = new Map(connectorCavityStatuses.map((status) => [status.cavityIndex, status] as const));
  const hasCustomLayout = catalogItem?.connectorLayout !== undefined;
  const keyings = getConnectorLayoutKeyings(layout);
  const shellShape = getConnectorLayoutShellShape(layout);

  return (
    <div className="connector-physical-view">
      <div className="connector-physical-canvas" aria-label="Connector physical view">
        <svg
          className="connector-physical-svg"
          viewBox={`0 0 ${layout.width + 1} ${layout.height + 1}`}
          role="img"
          aria-label={`${connector.technicalId} physical connector layout`}
        >
          {renderPhysicalShell(layout, shellShape)}
          {keyings.map((keying, index) => (
            <g key={`${keying.side}-${keying.shape ?? "arrow"}-${keying.position ?? "auto"}-${index}`}>
              {renderPhysicalKeying(keying as RenderableKeying, layout, shellShape)}
            </g>
          ))}
          {layout.ways.map((way) => {
            const status = statusByCavity.get(way.cavityIndex);
            const isOccupied = status?.isOccupied === true;
            return (
              <g key={way.cavityIndex} className="connector-physical-way" transform={`translate(${way.x} ${way.y})`}>
                {renderPhysicalWayShape(way.shape, isOccupied)}
                <text className="connector-physical-way-label" y={0}>
                  {way.label ?? way.cavityIndex}
                </text>
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
            return (
              <article key={way.cavityIndex} className={status?.isOccupied === true ? "cavity is-occupied" : "cavity"}>
                <h3>C{way.cavityIndex}</h3>
                <p>{status?.isOccupied === true ? formatOccupantRef(occupantRef) : "Free"}</p>
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

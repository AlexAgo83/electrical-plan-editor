import type { ReactElement } from "react";
import type {
  CatalogItem,
  Connector,
  ConnectorLayout,
  ConnectorLayoutKeyingSide,
  ConnectorLayoutShellShape,
  WireId
} from "../../../core/entities";
import {
  getConnectorLayoutKeyingPosition,
  getConnectorLayoutKeyingSide,
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

function renderPhysicalKeying(side: ConnectorLayoutKeyingSide, position: number | undefined, layout: ConnectorLayout): ReactElement | null {
  if (side === "none") {
    return null;
  }
  const centerX = layout.width / 2 + 0.5;
  const centerY = layout.height / 2 + 0.5;
  const keyingX = position ?? centerX;
  const keyingY = position ?? centerY;
  const right = layout.width + 0.5;
  const bottom = layout.height + 0.5;
  const pathBySide: Record<Exclude<ConnectorLayoutKeyingSide, "none">, string> = {
    top: `M ${keyingX} 0.5 l 0.32 -0.38 h -0.64 z`,
    right: `M ${right} ${keyingY} l 0.38 -0.32 v 0.64 z`,
    bottom: `M ${keyingX} ${bottom} l 0.32 0.38 h -0.64 z`,
    left: `M 0.5 ${keyingY} l -0.38 -0.32 v 0.64 z`
  };
  return <path className="connector-physical-keying" d={pathBySide[side]} aria-hidden="true" />;
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
  const keyingSide = getConnectorLayoutKeyingSide(layout);
  const keyingPosition = getConnectorLayoutKeyingPosition(layout);
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
          {renderPhysicalKeying(keyingSide, keyingPosition, layout)}
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

import type { ReactElement } from "react";
import type { CatalogItem, Connector, WireId } from "../../../core/entities";
import { resolveConnectorLayout } from "../../../core/connectorLayout";
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
    return <rect className={className} x={-0.45} y={-0.22} width={0.9} height={0.44} rx={0.22} />;
  }
  return <circle className={className} r={0.33} />;
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
  const shellRightEdge = layout.width + 0.5;
  const shellVerticalCenter = layout.height / 2 + 0.5;

  return (
    <div className="connector-physical-view">
      <div className="connector-physical-canvas" aria-label="Connector physical view">
        <svg
          className="connector-physical-svg"
          viewBox={`0 0 ${layout.width + 1} ${layout.height + 1}`}
          role="img"
          aria-label={`${connector.technicalId} physical connector layout`}
        >
          <rect className="connector-physical-shell" x={0.5} y={0.5} width={layout.width} height={layout.height} rx={0.6} />
          <path
            className="connector-physical-keying"
            d={`M ${shellRightEdge} ${shellVerticalCenter} l 0.38 -0.32 v 0.64 z`}
            aria-hidden="true"
          />
          {layout.ways.map((way) => {
            const status = statusByCavity.get(way.cavityIndex);
            const isOccupied = status?.isOccupied === true;
            return (
              <g key={way.cavityIndex} className="connector-physical-way" transform={`translate(${way.x} ${way.y})`}>
                {renderPhysicalWayShape(way.shape, isOccupied)}
                <text className="connector-physical-way-label" y={0.1}>
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

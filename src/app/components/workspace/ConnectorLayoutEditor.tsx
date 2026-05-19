import { useMemo, useState, type ReactElement } from "react";
import type { ConnectorLayout, ConnectorLayoutWay, ConnectorLayoutWayShape } from "../../../core/entities";
import { createDefaultConnectorLayout, resolveConnectorLayout } from "../../../core/connectorLayout";

interface ConnectorLayoutEditorProps {
  connectionCount: string;
  connectorLayout: ConnectorLayout | undefined;
  setConnectorLayout: (value: ConnectorLayout | undefined) => void;
}

const WAY_SHAPE_OPTIONS: Array<{ value: ConnectorLayoutWayShape; label: string }> = [
  { value: "round", label: "Round" },
  { value: "square", label: "Square" },
  { value: "slot", label: "Slot" }
];

function parseConnectionCount(value: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function renderWayShape(way: ConnectorLayoutWay, isSelected: boolean): ReactElement {
  const commonProps = {
    className: isSelected ? "connector-layout-way-shape is-selected" : "connector-layout-way-shape"
  };
  if (way.shape === "square") {
    return <rect {...commonProps} x={-0.28} y={-0.28} width={0.56} height={0.56} rx={0.08} />;
  }
  if (way.shape === "slot") {
    return <rect {...commonProps} x={-0.42} y={-0.22} width={0.84} height={0.44} rx={0.22} />;
  }
  return <circle {...commonProps} r={0.32} />;
}

export function ConnectorLayoutEditor({
  connectionCount,
  connectorLayout,
  setConnectorLayout
}: ConnectorLayoutEditorProps): ReactElement {
  const parsedConnectionCount = parseConnectionCount(connectionCount);
  const layout = useMemo(
    () => resolveConnectorLayout(connectorLayout, parsedConnectionCount),
    [connectorLayout, parsedConnectionCount]
  );
  const [selectedCavityIndex, setSelectedCavityIndex] = useState(1);
  const selectedWay =
    layout.ways.find((way) => way.cavityIndex === selectedCavityIndex) ?? layout.ways[0] ?? null;

  function commitLayout(nextLayout: ConnectorLayout): void {
    setConnectorLayout(resolveConnectorLayout(nextLayout, parsedConnectionCount));
  }

  function updateSelectedWay(patch: Partial<ConnectorLayoutWay>): void {
    if (selectedWay === null) {
      return;
    }
    commitLayout({
      ...layout,
      ways: layout.ways.map((way) =>
        way.cavityIndex === selectedWay.cavityIndex
          ? { ...way, ...patch }
          : way
      )
    });
  }

  function updateLayoutSize(axis: "width" | "height", value: string): void {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return;
    }
    commitLayout({ ...layout, [axis]: parsed });
  }

  return (
    <fieldset className="inline-fieldset connector-layout-editor">
      <legend>Connector physical layout</legend>
      <div className="connector-layout-editor-actions">
        <button
          type="button"
          className="button-with-icon"
          onClick={() => setConnectorLayout(createDefaultConnectorLayout(parsedConnectionCount))}
        >
          <span className="action-button-icon is-catalog" aria-hidden="true" />
          Auto layout
        </button>
        <button type="button" className="button-with-icon" onClick={() => setConnectorLayout(undefined)}>
          <span className="action-button-icon is-cancel" aria-hidden="true" />
          Clear custom layout
        </button>
      </div>

      <div className="connector-layout-editor-grid">
        <div className="connector-layout-preview" aria-label="Connector layout editor preview">
          <svg
            className="connector-layout-svg"
            viewBox={`0 0 ${layout.width + 1} ${layout.height + 1}`}
            role="img"
            aria-label="Editable connector physical layout"
          >
            <rect className="connector-layout-shell" x={0.5} y={0.5} width={layout.width} height={layout.height} rx={0.55} />
            {layout.ways.map((way) => {
              const isSelected = selectedWay?.cavityIndex === way.cavityIndex;
              return (
                <g
                  key={way.cavityIndex}
                  className="connector-layout-way"
                  transform={`translate(${way.x} ${way.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select way ${way.cavityIndex}`}
                  onClick={() => setSelectedCavityIndex(way.cavityIndex)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedCavityIndex(way.cavityIndex);
                    }
                  }}
                >
                  {renderWayShape(way, isSelected)}
                  <text className="connector-layout-way-label" y={0.09}>
                    {way.label ?? way.cavityIndex}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="connector-layout-fields">
          <div className="form-split">
            <label>
              Grid width
              <input
                type="number"
                min={1}
                step={1}
                value={layout.width}
                onChange={(event) => updateLayoutSize("width", event.target.value)}
              />
            </label>
            <label>
              Grid height
              <input
                type="number"
                min={1}
                step={1}
                value={layout.height}
                onChange={(event) => updateLayoutSize("height", event.target.value)}
              />
            </label>
          </div>

          {selectedWay !== null ? (
            <>
              <p className="meta-line">Selected way C{selectedWay.cavityIndex}</p>
              <div className="form-split">
                <label>
                  X
                  <input
                    type="number"
                    min={1}
                    max={layout.width}
                    step={1}
                    value={selectedWay.x}
                    onChange={(event) => updateSelectedWay({ x: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Y
                  <input
                    type="number"
                    min={1}
                    max={layout.height}
                    step={1}
                    value={selectedWay.y}
                    onChange={(event) => updateSelectedWay({ y: Number(event.target.value) })}
                  />
                </label>
              </div>
              <label>
                Shape
                <select
                  value={selectedWay.shape}
                  onChange={(event) => updateSelectedWay({ shape: event.target.value as ConnectorLayoutWayShape })}
                >
                  {WAY_SHAPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Label
                <input
                  value={selectedWay.label ?? ""}
                  maxLength={24}
                  onChange={(event) => updateSelectedWay({ label: event.target.value.trim().length === 0 ? undefined : event.target.value })}
                  placeholder={`C${selectedWay.cavityIndex}`}
                />
              </label>
            </>
          ) : null}
        </div>
      </div>
    </fieldset>
  );
}

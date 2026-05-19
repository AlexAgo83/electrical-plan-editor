import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactElement } from "react";
import type {
  ConnectorLayout,
  ConnectorLayoutKeyingSide,
  ConnectorLayoutShellShape,
  ConnectorLayoutWay,
  ConnectorLayoutWayShape
} from "../../../core/entities";
import {
  createDefaultConnectorLayout,
  getConnectorLayoutDuplicatePositions,
  getConnectorLayoutKeyingPosition,
  getConnectorLayoutKeyingSide,
  getConnectorLayoutShellShape,
  moveConnectorLayoutWayIfFree,
  resolveConnectorLayout,
  updateConnectorLayoutShellShape,
  updateConnectorLayoutKeyingPosition,
  updateConnectorLayoutKeyingSide
} from "../../../core/connectorLayout";

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

const KEYING_SIDE_OPTIONS: Array<{ value: ConnectorLayoutKeyingSide; label: string }> = [
  { value: "none", label: "None" },
  { value: "top", label: "Top" },
  { value: "right", label: "Right" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" }
];

const SHELL_SHAPE_OPTIONS: Array<{ value: ConnectorLayoutShellShape; label: string }> = [
  { value: "square", label: "Square" },
  { value: "circle", label: "Circle" }
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
    return <rect {...commonProps} x={-0.32} y={-0.22} width={0.64} height={0.44} rx={0.22} />;
  }
  return <circle {...commonProps} r={0.32} />;
}

function renderKeying(side: ConnectorLayoutKeyingSide, position: number | undefined, layout: ConnectorLayout): ReactElement | null {
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
  return <path className="connector-layout-keying" d={pathBySide[side]} aria-hidden="true" />;
}

function renderLayoutShell(layout: ConnectorLayout, shellShape: ConnectorLayoutShellShape): ReactElement {
  if (shellShape === "circle") {
    return (
      <ellipse
        className="connector-layout-shell"
        cx={layout.width / 2 + 0.5}
        cy={layout.height / 2 + 0.5}
        rx={layout.width / 2}
        ry={layout.height / 2}
      />
    );
  }
  return <rect className="connector-layout-shell" x={0.5} y={0.5} width={layout.width} height={layout.height} rx={0.55} />;
}

export function ConnectorLayoutEditor({
  connectionCount,
  connectorLayout,
  setConnectorLayout
}: ConnectorLayoutEditorProps): ReactElement {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const parsedConnectionCount = parseConnectionCount(connectionCount);
  const layout = useMemo(
    () => resolveConnectorLayout(connectorLayout, parsedConnectionCount),
    [connectorLayout, parsedConnectionCount]
  );
  const [selectedCavityIndex, setSelectedCavityIndex] = useState(1);
  const [draggingCavityIndex, setDraggingCavityIndex] = useState<number | null>(null);
  const [layoutSizeError, setLayoutSizeError] = useState<string | null>(null);
  const selectedWay =
    layout.ways.find((way) => way.cavityIndex === selectedCavityIndex) ?? layout.ways[0] ?? null;
  const duplicatePositionGroups = useMemo(() => getConnectorLayoutDuplicatePositions(layout), [layout]);
  const keyingSide = getConnectorLayoutKeyingSide(layout);
  const keyingPosition = getConnectorLayoutKeyingPosition(layout);
  const shellShape = getConnectorLayoutShellShape(layout);
  const keyingPositionMax = keyingSide === "top" || keyingSide === "bottom" ? layout.width : layout.height;

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
    const blockedWays = layout.ways.filter((way) => (axis === "width" ? way.x : way.y) > parsed);
    if (blockedWays.length > 0) {
      setLayoutSizeError(
        `Cannot reduce grid ${axis}: move ${blockedWays.map((way) => `C${way.cavityIndex}`).join(", ")} inside the new ${axis} first.`
      );
      return;
    }
    setLayoutSizeError(null);
    commitLayout({ ...layout, [axis]: parsed });
  }

  function updateKeyingSide(side: ConnectorLayoutKeyingSide): void {
    commitLayout(updateConnectorLayoutKeyingSide(layout, side));
  }

  function updateShellShape(nextShellShape: ConnectorLayoutShellShape): void {
    commitLayout(updateConnectorLayoutShellShape(layout, nextShellShape));
  }

  function updateKeyingPosition(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return;
    }
    commitLayout(updateConnectorLayoutKeyingPosition(layout, parsed));
  }

  function getPointerGridPosition(event: PointerEvent<SVGElement>): { x: number; y: number } | null {
    const svg = svgRef.current;
    if (svg === null) {
      return null;
    }

    const screenCtm = svg.getScreenCTM();
    if (screenCtm !== null) {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const svgPoint = point.matrixTransform(screenCtm.inverse());
      return {
        x: Math.min(layout.width, Math.max(1, Math.round(svgPoint.x))),
        y: Math.min(layout.height, Math.max(1, Math.round(svgPoint.y)))
      };
    }

    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return null;
    }
    return {
      x: Math.min(layout.width, Math.max(1, Math.round(((event.clientX - rect.left) / rect.width) * (layout.width + 1)))),
      y: Math.min(layout.height, Math.max(1, Math.round(((event.clientY - rect.top) / rect.height) * (layout.height + 1))))
    };
  }

  function moveWayToGridPosition(cavityIndex: number, x: number, y: number): void {
    commitLayout(moveConnectorLayoutWayIfFree(layout, cavityIndex, x, y));
  }

  function handleWayPointerDown(event: PointerEvent<SVGGElement>, cavityIndex: number): void {
    event.preventDefault();
    setSelectedCavityIndex(cavityIndex);
    setDraggingCavityIndex(cavityIndex);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleLayoutPointerMove(event: PointerEvent<SVGSVGElement>): void {
    if (draggingCavityIndex === null) {
      return;
    }
    const position = getPointerGridPosition(event);
    if (position === null) {
      return;
    }
    moveWayToGridPosition(draggingCavityIndex, position.x, position.y);
  }

  function handleLayoutPointerEnd(): void {
    setDraggingCavityIndex(null);
  }

  function handleWayKeyDown(event: KeyboardEvent<SVGGElement>, way: ConnectorLayoutWay): void {
    const deltaByKey: Partial<Record<string, { dx: number; dy: number }>> = {
      ArrowDown: { dx: 0, dy: 1 },
      ArrowLeft: { dx: -1, dy: 0 },
      ArrowRight: { dx: 1, dy: 0 },
      ArrowUp: { dx: 0, dy: -1 }
    };
    const delta = deltaByKey[event.key];
    if (delta !== undefined) {
      event.preventDefault();
      setSelectedCavityIndex(way.cavityIndex);
      moveWayToGridPosition(way.cavityIndex, way.x + delta.dx, way.y + delta.dy);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedCavityIndex(way.cavityIndex);
    }
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
            ref={svgRef}
            className="connector-layout-svg"
            viewBox={`0 0 ${layout.width + 1} ${layout.height + 1}`}
            role="img"
            aria-label="Editable connector physical layout"
            onPointerMove={handleLayoutPointerMove}
            onPointerUp={handleLayoutPointerEnd}
            onPointerCancel={handleLayoutPointerEnd}
          >
            {renderLayoutShell(layout, shellShape)}
            {renderKeying(keyingSide, keyingPosition, layout)}
            {layout.ways.map((way) => {
              const isSelected = selectedWay?.cavityIndex === way.cavityIndex;
              return (
                <g
                  key={way.cavityIndex}
                  className="connector-layout-way"
                  transform={`translate(${way.x} ${way.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select and move way ${way.cavityIndex}`}
                  onClick={() => setSelectedCavityIndex(way.cavityIndex)}
                  onPointerDown={(event) => handleWayPointerDown(event, way.cavityIndex)}
                  onKeyDown={(event) => handleWayKeyDown(event, way)}
                >
                  {renderWayShape(way, isSelected)}
                  <text className="connector-layout-way-label" y={0}>
                    {way.label ?? way.cavityIndex}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="connector-layout-fields">
          {duplicatePositionGroups.length > 0 ? (
            <small className="inline-error">
              Overlapping ways:{" "}
              {duplicatePositionGroups
                .map((ways) => ways.map((way) => `C${way.cavityIndex}`).join("/"))
                .join(", ")}
              .
            </small>
          ) : null}
          {layoutSizeError !== null ? <small className="inline-error">{layoutSizeError}</small> : null}
          <section className="connector-layout-control-card connector-layout-control-card-global">
            <header className="connector-layout-control-card-header">
              <h3>Global layout</h3>
              <span>{layout.ways.length} ways</span>
            </header>
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

            <label>
              Border shape
              <select
                value={shellShape}
                onChange={(event) => updateShellShape(event.target.value as ConnectorLayoutShellShape)}
              >
                {SHELL_SHAPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Keying
              <select
                value={keyingSide}
                onChange={(event) => updateKeyingSide(event.target.value as ConnectorLayoutKeyingSide)}
              >
                {KEYING_SIDE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {keyingSide !== "none" ? (
              <label>
                Keying position
                <input
                  type="number"
                  min={1}
                  max={keyingPositionMax}
                  step={0.5}
                  value={keyingPosition ?? 1}
                  onChange={(event) => updateKeyingPosition(event.target.value)}
                />
              </label>
            ) : null}
          </section>

          {selectedWay !== null ? (
            <section className="connector-layout-control-card connector-layout-control-card-selected">
              <header className="connector-layout-control-card-header">
                <h3>Selected way</h3>
                <span>C{selectedWay.cavityIndex}</span>
              </header>
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
            </section>
          ) : null}
        </div>
      </div>
    </fieldset>
  );
}

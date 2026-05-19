import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactElement } from "react";
import type {
  ConnectorLayout,
  ConnectorLayoutKeyingShape,
  ConnectorLayoutKeyingSide,
  ConnectorLayoutShellShape,
  ConnectorLayoutWay,
  ConnectorLayoutWayShape
} from "../../../core/entities";
import {
  addConnectorLayoutKeying,
  createDefaultConnectorLayout,
  getConnectorLayoutDuplicatePositions,
  getConnectorLayoutKeyings,
  getConnectorLayoutShellShape,
  moveConnectorLayoutWayIfFree,
  removeConnectorLayoutKeying,
  resolveConnectorLayout,
  updateConnectorLayoutKeyingAt,
  updateConnectorLayoutShellShape,
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
  { value: "top", label: "Top" },
  { value: "right", label: "Right" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" }
];

const KEYING_SHAPE_OPTIONS: Array<{ value: ConnectorLayoutKeyingShape; label: string }> = [
  { value: "arrow", label: "Arrow" },
  { value: "square", label: "Square" },
  { value: "round", label: "Round" },
  { value: "diamond", label: "Diamond" }
];

const SHELL_SHAPE_OPTIONS: Array<{ value: ConnectorLayoutShellShape; label: string }> = [
  { value: "square", label: "Square" },
  { value: "circle", label: "Circle" }
];

const KEYING_MARKER_SIZE = 0.28;
const KEYING_MARKER_RADIUS = 0.15;
const KEYING_ARROW_WIDTH = 0.32;
const KEYING_ARROW_DEPTH = 0.19;
const DEFAULT_KEYING_COLOR_PICKER_VALUE = "#2563eb";

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

function parseConnectionCount(value: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function clampUnit(value: number): number {
  return Math.min(1, Math.max(-1, value));
}

function getKeyingStyle(keying: RenderableKeying): CSSProperties | undefined {
  return keying.color === undefined ? undefined : { fill: keying.color };
}

function normalizeHexColor(value: string): string | null {
  const normalized = value.trim();
  return /^#[\da-f]{6}$/i.test(normalized) ? normalized.toLowerCase() : null;
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

function getKeyingAnchor(
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

function renderKeying(
  keying: RenderableKeying,
  layout: ConnectorLayout,
  shellShape: ConnectorLayoutShellShape
): ReactElement {
  const anchor = getKeyingAnchor(keying, layout, shellShape);
  const markerCenterX = anchor.x + anchor.normalX * (KEYING_MARKER_SIZE / 2);
  const markerCenterY = anchor.y + anchor.normalY * (KEYING_MARKER_SIZE / 2);
  const shape = keying.shape ?? "arrow";
  const style = getKeyingStyle(keying);
  const markerAngle = (Math.atan2(anchor.normalY, anchor.normalX) * 180) / Math.PI;
  if (shape === "square") {
    return (
      <rect
        className="connector-layout-keying"
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
    return <circle className="connector-layout-keying" style={style} cx={markerCenterX} cy={markerCenterY} r={KEYING_MARKER_RADIUS} aria-hidden="true" />;
  }
  if (shape === "diamond") {
    return (
      <rect
        className="connector-layout-keying"
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
  return <path className="connector-layout-keying" style={style} d={path} aria-hidden="true" />;
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
  const keyings = getConnectorLayoutKeyings(layout);
  const shellShape = getConnectorLayoutShellShape(layout);

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

  function updateShellShape(nextShellShape: ConnectorLayoutShellShape): void {
    commitLayout(updateConnectorLayoutShellShape(layout, nextShellShape));
  }

  function getDefaultKeyingColor(): string {
    const themePrimary = svgRef.current === null ? "" : getComputedStyle(svgRef.current).getPropertyValue("--theme-primary");
    return normalizeHexColor(themePrimary) ?? DEFAULT_KEYING_COLOR_PICKER_VALUE;
  }

  function addKeyingWithDefaultColor(): void {
    const nextLayout = addConnectorLayoutKeying(layout);
    const nextKeyingIndex = getConnectorLayoutKeyings(nextLayout).length - 1;
    commitLayout(updateConnectorLayoutKeyingAt(nextLayout, nextKeyingIndex, { color: getDefaultKeyingColor() }));
  }

  function updateKeyingPosition(index: number, value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return;
    }
    commitLayout(updateConnectorLayoutKeyingAt(layout, index, { position: parsed }));
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
            {keyings.map((keying, index) => (
              <g key={`${keying.side}-${keying.shape ?? "arrow"}-${keying.position ?? "auto"}-${index}`}>
                {renderKeying(keying as RenderableKeying, layout, shellShape)}
              </g>
            ))}
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

            <div className="connector-layout-keying-list" aria-label="Keying features">
              <div className="connector-layout-keying-list-header">
                <h4>Keying features</h4>
                <button type="button" className="button-with-icon" onClick={addKeyingWithDefaultColor}>
                  <span className="action-button-icon is-new" aria-hidden="true" />
                  Add keying
                </button>
              </div>
              {keyings.length === 0 ? <p className="meta-line">No keying features.</p> : null}
              {keyings.map((keying, index) => {
                const keyingPositionMax = keying.side === "top" || keying.side === "bottom" ? layout.width : layout.height;
                const colorInputId = `connector-layout-keying-color-${index}`;
                return (
                  <div key={`${keying.side}-${keying.shape ?? "arrow"}-${keying.position ?? "auto"}-${index}`} className="connector-layout-keying-row">
                    <label>
                      Side
                      <select
                        value={keying.side}
                        onChange={(event) =>
                          commitLayout(
                            updateConnectorLayoutKeyingAt(layout, index, {
                              side: event.target.value as ConnectorLayoutKeyingSide,
                              position: undefined
                            })
                          )
                        }
                      >
                        {KEYING_SIDE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Shape
                      <select
                        value={keying.shape ?? "arrow"}
                        onChange={(event) =>
                          commitLayout(
                            updateConnectorLayoutKeyingAt(layout, index, {
                              shape: event.target.value as ConnectorLayoutKeyingShape
                            })
                          )
                        }
                      >
                        {KEYING_SHAPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="connector-layout-keying-color-control">
                      <label htmlFor={colorInputId}>Color</label>
                      <div>
                        <input
                          id={colorInputId}
                          type="color"
                          value={keying.color ?? DEFAULT_KEYING_COLOR_PICKER_VALUE}
                          onChange={(event) =>
                            commitLayout(
                              updateConnectorLayoutKeyingAt(layout, index, {
                                color: event.target.value
                              })
                            )
                          }
                        />
                      </div>
                    </div>
                    <label>
                      Position
                      <input
                        type="number"
                        min={1}
                        max={keyingPositionMax}
                        step={0.5}
                        value={keying.position ?? 1}
                        onChange={(event) => updateKeyingPosition(index, event.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className="button-with-icon"
                      onClick={() => commitLayout(removeConnectorLayoutKeying(layout, index))}
                    >
                      <span className="action-button-icon is-delete" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
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

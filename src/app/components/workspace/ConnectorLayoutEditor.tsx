import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactElement } from "react";
import type {
  ConnectorLayout,
  ConnectorLayoutKeying,
  ConnectorLayoutKeyingPlacement,
  ConnectorLayoutKeyingShape,
  ConnectorLayoutShellShape,
  ConnectorLayoutWay,
  ConnectorLayoutWayShape
} from "../../../core/entities";
import {
  addConnectorLayoutKeying,
  createDefaultConnectorLayout,
  getConnectorLayoutShellPadding,
  getConnectorLayoutDuplicatePositions,
  getConnectorLayoutKeyings,
  getConnectorLayoutShellShape,
  getConnectorLayoutWayDisplayLabel,
  DEFAULT_CONNECTOR_LAYOUT_KEYING_SCALE,
  DEFAULT_CONNECTOR_LAYOUT_KEYING_PATH_POSITION,
  getConnectorLayoutKeyingAnchor,
  MIN_CONNECTOR_LAYOUT_SHELL_PADDING,
  MAX_CONNECTOR_LAYOUT_SHELL_PADDING,
  MIN_CONNECTOR_LAYOUT_KEYING_SCALE,
  MAX_CONNECTOR_LAYOUT_KEYING_SCALE,
  moveConnectorLayoutWayIfFree,
  removeConnectorLayoutKeying,
  resolveConnectorLayout,
  updateConnectorLayoutKeyingAt,
  updateConnectorLayoutShellPadding,
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
const DEFAULT_KEYING_COLOR_PICKER_VALUE = "#7a7a7a";

type RenderableKeying = {
  placement?: ConnectorLayoutKeyingPlacement;
  shape?: ConnectorLayoutKeyingShape;
  color?: string;
  scale?: number;
};

function parseConnectionCount(value: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function getKeyingStyle(keying: RenderableKeying): CSSProperties | undefined {
  return keying.color === undefined ? undefined : { fill: keying.color };
}

function normalizeHexColor(value: string): string | null {
  const normalized = value.trim();
  return /^#[\da-f]{6}$/i.test(normalized) ? normalized.toLowerCase() : null;
}

function normalizeCssColorToHex(value: string): string | null {
  const hex = normalizeHexColor(value);
  if (hex !== null) {
    return hex;
  }
  const rgbMatch = value.trim().match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch === null) {
    return null;
  }
  const [, red, green, blue] = rgbMatch;
  return `#${[red, green, blue]
    .map((component) => Math.min(255, Math.max(0, Number(component))).toString(16).padStart(2, "0"))
    .join("")}`;
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

function renderKeying(
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

function renderLayoutShell(layout: ConnectorLayout, shellShape: ConnectorLayoutShellShape, shellPadding: number): ReactElement {
  const x = 1 - shellPadding;
  const y = 1 - shellPadding;
  const width = layout.width - 1 + shellPadding * 2;
  const height = layout.height - 1 + shellPadding * 2;
  if (shellShape === "circle") {
    return (
      <ellipse
        className="connector-layout-shell"
        cx={layout.width / 2 + 0.5}
        cy={layout.height / 2 + 0.5}
        rx={width / 2}
        ry={height / 2}
      />
    );
  }
  return <rect className="connector-layout-shell" x={x} y={y} width={width} height={height} rx={Math.min(0.55, shellPadding)} />;
}

function getLayoutViewBox(layout: ConnectorLayout, shellPadding: number): string {
  const minX = 1 - shellPadding - 0.5;
  const minY = 1 - shellPadding - 0.5;
  const width = layout.width - 1 + shellPadding * 2 + 1;
  const height = layout.height - 1 + shellPadding * 2 + 1;
  return `${minX} ${minY} ${width} ${height}`;
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
  const [draggingKeyingIndex, setDraggingKeyingIndex] = useState<number | null>(null);
  const [layoutSizeError, setLayoutSizeError] = useState<string | null>(null);
  const selectedWay =
    layout.ways.find((way) => way.cavityIndex === selectedCavityIndex) ?? layout.ways[0] ?? null;
  const duplicatePositionGroups = useMemo(() => getConnectorLayoutDuplicatePositions(layout), [layout]);
  const keyings = getConnectorLayoutKeyings(layout);
  const shellShape = getConnectorLayoutShellShape(layout);
  const shellPadding = getConnectorLayoutShellPadding(layout);

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

  function updateShellPadding(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return;
    }
    commitLayout(updateConnectorLayoutShellPadding(layout, parsed));
  }

  function getDefaultKeyingColor(): string {
    const currentColor = svgRef.current === null ? "" : getComputedStyle(svgRef.current).color;
    return normalizeCssColorToHex(currentColor) ?? DEFAULT_KEYING_COLOR_PICKER_VALUE;
  }

  function addKeyingWithDefaultColor(): void {
    commitLayout(addConnectorLayoutKeying(layout));
  }

  function updateKeyingPlacementMode(index: number, mode: ConnectorLayoutKeyingPlacement["mode"]): void {
    const current = keyings[index];
    if (current === undefined) {
      return;
    }
    if (mode === "guided") {
      commitLayout(
        updateConnectorLayoutKeyingAt(layout, index, {
          placement: {
            mode: "guided",
            pathPosition: current.placement?.mode === "guided" ? current.placement.pathPosition : DEFAULT_CONNECTOR_LAYOUT_KEYING_PATH_POSITION
          }
        })
      );
      return;
    }
    const anchor = getConnectorLayoutKeyingAnchor(current, layout, shellShape, shellPadding);
    commitLayout(
      updateConnectorLayoutKeyingAt(layout, index, {
        placement: { mode: "free", x: anchor.x, y: anchor.y }
      })
    );
  }

  function updateKeyingGuidedPosition(index: number, value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return;
    }
    commitLayout(updateConnectorLayoutKeyingAt(layout, index, { placement: { mode: "guided", pathPosition: parsed } }));
  }

  function updateKeyingFreePosition(index: number, patch: Partial<Extract<ConnectorLayoutKeyingPlacement, { mode: "free" }>>): void {
    const current = keyings[index];
    if (current === undefined) {
      return;
    }
    const anchor = getConnectorLayoutKeyingAnchor(current, layout, shellShape, shellPadding);
    commitLayout(
      updateConnectorLayoutKeyingAt(layout, index, {
        placement: {
          mode: "free",
          x: patch.x ?? (current.placement?.mode === "free" ? current.placement.x : anchor.x),
          y: patch.y ?? (current.placement?.mode === "free" ? current.placement.y : anchor.y)
        }
      })
    );
  }

  function updateKeyingScale(index: number, value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return;
    }
    commitLayout(updateConnectorLayoutKeyingAt(layout, index, { scale: parsed }));
  }

  function getPointerGridPosition(event: PointerEvent<SVGElement>): { x: number; y: number } | null {
    const position = getPointerLayoutPosition(event);
    if (position === null) {
      return null;
    }
    return {
      x: Math.min(layout.width, Math.max(1, Math.round(position.x))),
      y: Math.min(layout.height, Math.max(1, Math.round(position.y)))
    };
  }

  function getPointerLayoutPosition(event: PointerEvent<SVGElement>): { x: number; y: number } | null {
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
        x: svgPoint.x,
        y: svgPoint.y
      };
    }

    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return null;
    }
    return {
      x: ((event.clientX - rect.left) / rect.width) * (layout.width + 1),
      y: ((event.clientY - rect.top) / rect.height) * (layout.height + 1)
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

  function handleKeyingPointerDown(event: PointerEvent<SVGGElement>, index: number): void {
    const keying = keyings[index];
    if (keying?.placement?.mode !== "free") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setDraggingKeyingIndex(index);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleLayoutPointerMove(event: PointerEvent<SVGSVGElement>): void {
    if (draggingKeyingIndex !== null) {
      const position = getPointerLayoutPosition(event);
      if (position === null) {
        return;
      }
      updateKeyingFreePosition(draggingKeyingIndex, position);
      return;
    }
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
    setDraggingKeyingIndex(null);
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
            viewBox={getLayoutViewBox(layout, shellPadding)}
            role="img"
            aria-label="Editable connector physical layout"
            onPointerMove={handleLayoutPointerMove}
            onPointerUp={handleLayoutPointerEnd}
            onPointerCancel={handleLayoutPointerEnd}
          >
            {renderLayoutShell(layout, shellShape, shellPadding)}
            {keyings.map((keying, index) => (
              <g
                key={`keying-preview-${index}`}
                className={keying.placement?.mode === "free" ? "connector-layout-keying-handle is-free" : "connector-layout-keying-handle"}
                role={keying.placement?.mode === "free" ? "button" : undefined}
                tabIndex={keying.placement?.mode === "free" ? 0 : undefined}
                aria-label={keying.placement?.mode === "free" ? `Drag keying ${index + 1}` : undefined}
                onPointerDown={(event) => handleKeyingPointerDown(event, index)}
              >
                {renderKeying(keying, layout, shellShape, shellPadding)}
              </g>
            ))}
            {layout.ways.map((way) => {
              const isSelected = selectedWay?.cavityIndex === way.cavityIndex;
              const label = getConnectorLayoutWayDisplayLabel(way);
              const labelClassName = `connector-layout-way-label${label.length > 2 ? " is-long-label" : ""}`;
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
                  <text className={labelClassName} y={0}>
                    {label}
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
            <label className="connector-layout-slider-field">
              <span>
                Shell padding
                <strong>{shellPadding.toFixed(2)} grid</strong>
              </span>
              <input
                type="range"
                min={MIN_CONNECTOR_LAYOUT_SHELL_PADDING}
                max={MAX_CONNECTOR_LAYOUT_SHELL_PADDING}
                step={0.05}
                value={shellPadding}
                onChange={(event) => updateShellPadding(event.target.value)}
              />
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
                const colorInputId = `connector-layout-keying-color-${index}`;
                const placement = keying.placement ?? { mode: "guided", pathPosition: DEFAULT_CONNECTOR_LAYOUT_KEYING_PATH_POSITION };
                return (
                  <div key={`keying-${index}`} className="connector-layout-keying-row">
                    <label>
                      Placement
                      <select
                        value={placement.mode}
                        onChange={(event) => updateKeyingPlacementMode(index, event.target.value as ConnectorLayoutKeyingPlacement["mode"])}
                      >
                        <option value="guided">Guided</option>
                        <option value="free">Free</option>
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
                          value={keying.color ?? getDefaultKeyingColor()}
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
                    {placement.mode === "guided" ? (
                      <label className="connector-layout-slider-field">
                        <span>
                          Position
                          <strong>{Math.round(placement.pathPosition * 100)}%</strong>
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={placement.pathPosition}
                          onChange={(event) => updateKeyingGuidedPosition(index, event.target.value)}
                        />
                      </label>
                    ) : null}
                    <label className="connector-layout-slider-field">
                      <span>
                        Scale
                        <strong>{(keying.scale ?? DEFAULT_CONNECTOR_LAYOUT_KEYING_SCALE).toFixed(2)}x</strong>
                      </span>
                      <input
                        type="range"
                        min={MIN_CONNECTOR_LAYOUT_KEYING_SCALE}
                        max={MAX_CONNECTOR_LAYOUT_KEYING_SCALE}
                        step={0.05}
                        value={keying.scale ?? DEFAULT_CONNECTOR_LAYOUT_KEYING_SCALE}
                        onChange={(event) => updateKeyingScale(index, event.target.value)}
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

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactElement } from "react";
import type {
  ConnectorLayout,
  ConnectorLayoutKeyingPlacement,
  ConnectorLayoutKeyingShape,
  ConnectorLayoutShellShape,
  ConnectorLayoutWay,
  ConnectorLayoutWayShape
} from "../../../core/entities";
import {
  addConnectorLayoutKeying,
  getConnectorLayoutShellPadding,
  getConnectorLayoutShellCornerRadius,
  getConnectorLayoutShellStrokeWidth,
  getConnectorLayoutCellPadding,
  getConnectorLayoutDuplicatePositions,
  getConnectorLayoutKeyings,
  getConnectorLayoutShellShape,
  getConnectorLayoutWayDisplayLabel,
  DEFAULT_CONNECTOR_LAYOUT_KEYING_SCALE,
  DEFAULT_CONNECTOR_LAYOUT_KEYING_PATH_POSITION,
  getConnectorLayoutKeyingAnchor,
  MIN_CONNECTOR_LAYOUT_SHELL_PADDING,
  MAX_CONNECTOR_LAYOUT_SHELL_PADDING,
  MIN_CONNECTOR_LAYOUT_SHELL_CORNER_RADIUS,
  MAX_CONNECTOR_LAYOUT_SHELL_CORNER_RADIUS,
  MIN_CONNECTOR_LAYOUT_SHELL_STROKE_WIDTH,
  MAX_CONNECTOR_LAYOUT_SHELL_STROKE_WIDTH,
  MIN_CONNECTOR_LAYOUT_CELL_PADDING,
  MAX_CONNECTOR_LAYOUT_CELL_PADDING,
  MIN_CONNECTOR_LAYOUT_KEYING_SCALE,
  MAX_CONNECTOR_LAYOUT_KEYING_SCALE,
  MAX_CONNECTOR_LAYOUT_SIZE,
  moveConnectorLayoutWayIfFree,
  removeConnectorLayoutKeying,
  resolveConnectorLayout,
  updateConnectorLayoutCellPadding,
  updateConnectorLayoutKeyingAt,
  updateConnectorLayoutShellCornerRadius,
  updateConnectorLayoutShellPadding,
  updateConnectorLayoutShellStrokeWidth,
  updateConnectorLayoutShellShape
} from "../../../core/connectorLayout";
import {
  getConnectorLayoutViewBox,
  isKeyingSnapEnabled,
  renderConnectorLayoutGrid,
  renderConnectorLayoutKeying,
  renderConnectorLayoutShell,
  renderConnectorLayoutWay,
  snapGuidedPathPositionToGrid,
  snapKeyingPositionToGrid
} from "./connectorLayoutEditorPreview";

interface ConnectorLayoutEditorProps {
  connectionCount: string;
  connectorLayout: ConnectorLayout | undefined;
  setConnectorLayout: (value: ConnectorLayout | undefined) => void;
  showLegend?: boolean;
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

const DEFAULT_KEYING_COLOR_PICKER_VALUE = "#7a7a7a";

type ConnectorLayoutDetailPanel = "global" | "selectedWay" | "keying";
type ConnectorLayoutResizeSide = "left" | "right" | "top" | "bottom";

function parseConnectionCount(value: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
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
  if (rgbMatch !== null) {
    const [, red, green, blue] = rgbMatch;
    return `#${[red, green, blue]
      .map((component) => Math.min(255, Math.max(0, Number(component))).toString(16).padStart(2, "0"))
      .join("")}`;
  }

  const srgbMatch = value.trim().match(/^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/i);
  if (srgbMatch === null) {
    return null;
  }
  const [, red, green, blue] = srgbMatch;
  return `#${[red, green, blue]
    .map((component) => Math.round(Math.min(1, Math.max(0, Number(component))) * 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function ConnectorLayoutEditor({
  connectionCount,
  connectorLayout,
  setConnectorLayout,
  showLegend = true
}: ConnectorLayoutEditorProps): ReactElement {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const parsedConnectionCount = parseConnectionCount(connectionCount);
  const layout = useMemo(
    () => resolveConnectorLayout(connectorLayout, parsedConnectionCount),
    [connectorLayout, parsedConnectionCount]
  );
  const [selectedCavityIndex, setSelectedCavityIndex] = useState(1);
  const [selectedKeyingIndex, setSelectedKeyingIndex] = useState<number | null>(null);
  const [detailPanel, setDetailPanel] = useState<ConnectorLayoutDetailPanel>("global");
  const [draggingCavityIndex, setDraggingCavityIndex] = useState<number | null>(null);
  const [draggingKeyingIndex, setDraggingKeyingIndex] = useState<number | null>(null);
  const [layoutSizeError, setLayoutSizeError] = useState<string | null>(null);
  const selectedWay =
    layout.ways.find((way) => way.cavityIndex === selectedCavityIndex) ?? layout.ways[0] ?? null;
  const duplicatePositionGroups = useMemo(() => getConnectorLayoutDuplicatePositions(layout), [layout]);
  const keyings = getConnectorLayoutKeyings(layout);
  const selectedKeying = selectedKeyingIndex === null ? null : keyings[selectedKeyingIndex] ?? null;
  const shellShape = getConnectorLayoutShellShape(layout);
  const shellPadding = getConnectorLayoutShellPadding(layout);
  const shellCornerRadius = getConnectorLayoutShellCornerRadius(layout);
  const shellStrokeWidth = getConnectorLayoutShellStrokeWidth(layout);
  const cellPadding = getConnectorLayoutCellPadding(layout);

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

  function selectWay(cavityIndex: number): void {
    setSelectedCavityIndex(cavityIndex);
    setDetailPanel("selectedWay");
  }

  function selectKeying(index: number): void {
    setSelectedKeyingIndex(index);
    setDetailPanel("keying");
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

  function updateShellCornerRadius(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return;
    }
    commitLayout(updateConnectorLayoutShellCornerRadius(layout, parsed));
  }

  function updateShellStrokeWidth(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return;
    }
    commitLayout(updateConnectorLayoutShellStrokeWidth(layout, parsed));
  }

  function updateCellPadding(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return;
    }
    commitLayout(updateConnectorLayoutCellPadding(layout, parsed));
  }

  function getDefaultKeyingColor(): string {
    const shellColor =
      svgRef.current === null
        ? ""
        : getComputedStyle(svgRef.current.querySelector(".connector-layout-shell") ?? svgRef.current).fill;
    const currentColor = svgRef.current === null ? "" : getComputedStyle(svgRef.current).color;
    return normalizeCssColorToHex(shellColor) ?? normalizeCssColorToHex(currentColor) ?? DEFAULT_KEYING_COLOR_PICKER_VALUE;
  }

  function addKeyingWithDefaultColor(): void {
    setSelectedKeyingIndex(keyings.length);
    setDetailPanel("keying");
    commitLayout(addConnectorLayoutKeying(layout));
  }

  function updateKeyingPlacementMode(index: number, mode: ConnectorLayoutKeyingPlacement["mode"]): void {
    const current = keyings[index];
    if (current === undefined) {
      return;
    }
    const snapToGrid = current.placement === undefined ? true : isKeyingSnapEnabled(current.placement);
    if (mode === "guided") {
      const pathPosition =
        current.placement?.mode === "guided" ? current.placement.pathPosition : DEFAULT_CONNECTOR_LAYOUT_KEYING_PATH_POSITION;
      commitLayout(
        updateConnectorLayoutKeyingAt(layout, index, {
          placement: {
            mode: "guided",
            pathPosition: snapToGrid ? snapGuidedPathPositionToGrid(layout, pathPosition, shellShape, shellPadding) : pathPosition,
            snapToGrid: snapToGrid ? undefined : false
          }
        })
      );
      return;
    }
    const anchor = getConnectorLayoutKeyingAnchor(current, layout, shellShape, shellPadding);
    commitLayout(
      updateConnectorLayoutKeyingAt(layout, index, {
        placement: {
          mode: "free",
          ...(snapToGrid ? snapKeyingPositionToGrid(layout, anchor) : { x: anchor.x, y: anchor.y }),
          snapToGrid: snapToGrid ? undefined : false
        }
      })
    );
  }

  function updateKeyingGuidedPosition(index: number, value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return;
    }
    const current = keyings[index];
    const snapToGrid = current?.placement === undefined ? true : isKeyingSnapEnabled(current.placement);
    commitLayout(
      updateConnectorLayoutKeyingAt(layout, index, {
        placement: {
          mode: "guided",
          pathPosition: snapToGrid ? snapGuidedPathPositionToGrid(layout, parsed, shellShape, shellPadding) : parsed,
          snapToGrid: snapToGrid ? undefined : false
        }
      })
    );
  }

  function updateKeyingSnap(index: number, snapToGrid: boolean): void {
    const current = keyings[index];
    if (current === undefined) {
      return;
    }
    const placement = current.placement ?? { mode: "guided", pathPosition: DEFAULT_CONNECTOR_LAYOUT_KEYING_PATH_POSITION };
    if (placement.mode === "free") {
      updateKeyingFreePosition(index, { snapToGrid: snapToGrid ? undefined : false });
      return;
    }
    commitLayout(
      updateConnectorLayoutKeyingAt(layout, index, {
        placement: {
          mode: "guided",
          pathPosition: snapToGrid
            ? snapGuidedPathPositionToGrid(layout, placement.pathPosition, shellShape, shellPadding)
            : placement.pathPosition,
          snapToGrid: snapToGrid ? undefined : false
        }
      })
    );
  }

  function updateKeyingFreePosition(index: number, patch: Partial<Extract<ConnectorLayoutKeyingPlacement, { mode: "free" }>>): void {
    const current = keyings[index];
    if (current === undefined) {
      return;
    }
    const anchor = getConnectorLayoutKeyingAnchor(current, layout, shellShape, shellPadding);
    const currentFreePlacement = current.placement?.mode === "free" ? current.placement : null;
    const snapToGrid = patch.snapToGrid ?? currentFreePlacement?.snapToGrid ?? true;
    const position = {
      x: patch.x ?? currentFreePlacement?.x ?? anchor.x,
      y: patch.y ?? currentFreePlacement?.y ?? anchor.y
    };
    const nextPosition = snapToGrid === true ? snapKeyingPositionToGrid(layout, position) : position;
    commitLayout(
      updateConnectorLayoutKeyingAt(layout, index, {
        placement: {
          mode: "free",
          x: nextPosition.x,
          y: nextPosition.y,
          snapToGrid: snapToGrid ? undefined : false
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

  function canResizeLayout(side: ConnectorLayoutResizeSide, delta: 1 | -1): boolean {
    const isHorizontal = side === "left" || side === "right";
    const currentSize = isHorizontal ? layout.width : layout.height;
    if (delta > 0) {
      return currentSize < MAX_CONNECTOR_LAYOUT_SIZE;
    }
    if (currentSize <= 1) {
      return false;
    }
    if (side === "left") {
      return !layout.ways.some((way) => way.x <= 1);
    }
    if (side === "right") {
      return !layout.ways.some((way) => way.x >= layout.width);
    }
    if (side === "top") {
      return !layout.ways.some((way) => way.y <= 1);
    }
    return !layout.ways.some((way) => way.y >= layout.height);
  }

  function resizeLayout(side: ConnectorLayoutResizeSide, delta: 1 | -1): void {
    if (!canResizeLayout(side, delta)) {
      return;
    }

    const shiftX = side === "left" ? delta : 0;
    const shiftY = side === "top" ? delta : 0;
    commitLayout({
      ...layout,
      width: side === "left" || side === "right" ? layout.width + delta : layout.width,
      height: side === "top" || side === "bottom" ? layout.height + delta : layout.height,
      ways: layout.ways.map((way) => ({
        ...way,
        x: way.x + shiftX,
        y: way.y + shiftY
      })),
      keyings: keyings.map((keying) =>
        keying.placement?.mode === "free"
          ? {
              ...keying,
              placement: {
                ...keying.placement,
                x: keying.placement.x + shiftX,
                y: keying.placement.y + shiftY
              }
            }
          : keying
      )
    });
  }

  function renderResizeButton(side: ConnectorLayoutResizeSide, delta: 1 | -1): ReactElement {
    const isHorizontal = side === "left" || side === "right";
    const sideLabel =
      side === "left"
        ? "left"
        : side === "right"
          ? "right"
          : side === "top"
            ? "top"
            : "bottom";
    const actionLabel =
      delta > 0
        ? isHorizontal
          ? "Add column"
          : "Add row"
        : isHorizontal
          ? "Remove column"
          : "Remove row";
    const actionClassName = delta > 0 ? "is-add" : "is-remove";
    return (
      <button
        key={`${actionClassName}-${side}`}
        type="button"
        className={`connector-layout-resize-button ${actionClassName} is-${side}`}
        aria-label={`${actionLabel} on ${sideLabel}`}
        disabled={!canResizeLayout(side, delta)}
        onClick={() => resizeLayout(side, delta)}
      >
        {delta > 0 ? "+" : "-"}
      </button>
    );
  }

  function handleWayPointerDown(event: PointerEvent<SVGGElement>, cavityIndex: number): void {
    event.preventDefault();
    selectWay(cavityIndex);
    setDraggingCavityIndex(cavityIndex);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleKeyingPointerDown(event: PointerEvent<SVGGElement>, index: number): void {
    const keying = keyings[index];
    selectKeying(index);
    event.preventDefault();
    event.stopPropagation();
    if (keying?.placement?.mode !== "free") {
      return;
    }
    setDraggingKeyingIndex(index);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleKeyingKeyDown(event: KeyboardEvent<SVGGElement>, index: number): void {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    selectKeying(index);
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
      selectWay(way.cavityIndex);
      moveWayToGridPosition(way.cavityIndex, way.x + delta.dx, way.y + delta.dy);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectWay(way.cavityIndex);
    }
  }

  const fieldsetClassName = showLegend ? "inline-fieldset connector-layout-editor" : "inline-fieldset connector-layout-editor is-embedded";
  const selectedKeyingControlIndex = selectedKeying === null ? -1 : selectedKeyingIndex ?? -1;
  const selectedKeyingPlacement =
    selectedKeying?.placement ?? { mode: "guided" as const, pathPosition: DEFAULT_CONNECTOR_LAYOUT_KEYING_PATH_POSITION };

  return (
    <fieldset className={fieldsetClassName}>
      {showLegend ? <legend>Connector physical layout</legend> : null}
      <div className="connector-layout-editor-grid">
        <div className="connector-layout-preview" aria-label="Connector layout editor preview">
          <div className="connector-layout-resize-controls" aria-label="Layout size controls">
            {(["left", "right", "top", "bottom"] as const).flatMap((side) => [
              renderResizeButton(side, 1),
              renderResizeButton(side, -1)
            ])}
          </div>
          <svg
            ref={svgRef}
            className="connector-layout-svg"
            viewBox={getConnectorLayoutViewBox(layout, shellPadding)}
            role="img"
            aria-label="Editable connector physical layout"
            onPointerMove={handleLayoutPointerMove}
            onPointerUp={handleLayoutPointerEnd}
            onPointerCancel={handleLayoutPointerEnd}
          >
            {renderConnectorLayoutShell(layout, shellShape, shellPadding)}
            {renderConnectorLayoutGrid(layout)}
            {keyings.map((keying, index) => (
              <g
                key={`keying-preview-${index}`}
                className={`connector-layout-keying-handle${keying.placement?.mode === "free" ? " is-free" : ""}${
                  detailPanel === "keying" && selectedKeyingIndex === index ? " is-selected" : ""
                }`}
                role="button"
                tabIndex={0}
                aria-label={`${keying.placement?.mode === "free" ? "Select and drag" : "Select"} keying ${index + 1}`}
                onPointerDown={(event) => handleKeyingPointerDown(event, index)}
                onKeyDown={(event) => handleKeyingKeyDown(event, index)}
              >
                {renderConnectorLayoutKeying(keying, layout, shellShape, shellPadding)}
              </g>
            ))}
            {layout.ways.map((way) => {
              const isSelected = detailPanel === "selectedWay" && selectedWay?.cavityIndex === way.cavityIndex;
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
                  onClick={() => selectWay(way.cavityIndex)}
                  onPointerDown={(event) => handleWayPointerDown(event, way.cavityIndex)}
                  onKeyDown={(event) => handleWayKeyDown(event, way)}
                >
                  {renderConnectorLayoutWay(way, isSelected, layout)}
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

          <div className="chip-group connector-layout-detail-switch" role="group" aria-label="Connector layout detail panel">
            <button
              type="button"
              className={detailPanel === "global" ? "filter-chip is-active" : "filter-chip"}
              aria-pressed={detailPanel === "global"}
              onClick={() => setDetailPanel("global")}
            >
              Global layout
            </button>
            <button
              type="button"
              className={detailPanel === "selectedWay" ? "filter-chip is-active" : "filter-chip"}
              aria-pressed={detailPanel === "selectedWay"}
              onClick={() => setDetailPanel("selectedWay")}
            >
              Selected way
            </button>
            <button
              type="button"
              className={detailPanel === "keying" ? "filter-chip is-active" : "filter-chip"}
              aria-pressed={detailPanel === "keying"}
              onClick={() => setDetailPanel("keying")}
            >
              Keying features
            </button>
          </div>

          {detailPanel === "global" ? (
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
              {shellShape === "square" ? (
                <label className="connector-layout-slider-field">
                  <span>
                    Rounded
                    <strong>{Math.round(shellCornerRadius * 100)}%</strong>
                  </span>
                  <input
                    type="range"
                    min={MIN_CONNECTOR_LAYOUT_SHELL_CORNER_RADIUS}
                    max={MAX_CONNECTOR_LAYOUT_SHELL_CORNER_RADIUS}
                    step={0.05}
                    value={shellCornerRadius}
                    onChange={(event) => updateShellCornerRadius(event.target.value)}
                  />
                </label>
              ) : null}
              <label className="connector-layout-slider-field">
                <span>
                  Shape thickness
                  <strong>{shellStrokeWidth.toFixed(2)} grid</strong>
                </span>
                <input
                  type="range"
                  min={MIN_CONNECTOR_LAYOUT_SHELL_STROKE_WIDTH}
                  max={MAX_CONNECTOR_LAYOUT_SHELL_STROKE_WIDTH}
                  step={0.01}
                  value={shellStrokeWidth}
                  onChange={(event) => updateShellStrokeWidth(event.target.value)}
                />
              </label>
              <label className="connector-layout-slider-field">
                <span>
                  Cell padding
                  <strong>{cellPadding.toFixed(2)} grid</strong>
                </span>
                <input
                  type="range"
                  min={MIN_CONNECTOR_LAYOUT_CELL_PADDING}
                  max={MAX_CONNECTOR_LAYOUT_CELL_PADDING}
                  step={0.02}
                  value={cellPadding}
                  onChange={(event) => updateCellPadding(event.target.value)}
                />
              </label>
            </section>
          ) : null}

          {detailPanel === "selectedWay" && selectedWay !== null ? (
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
                    onChange={(event) => moveWayToGridPosition(selectedWay.cavityIndex, Number(event.target.value), selectedWay.y)}
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
                    onChange={(event) => moveWayToGridPosition(selectedWay.cavityIndex, selectedWay.x, Number(event.target.value))}
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

          {detailPanel === "keying" ? (
            <section className="connector-layout-control-card connector-layout-control-card-keying">
              <header className="connector-layout-control-card-header">
                <h3>Keying features</h3>
                <span>
                  {selectedKeying === null ? "No selection" : `Keying ${selectedKeyingControlIndex + 1}`} / {keyings.length}
                </span>
              </header>
              <div className="connector-layout-keying-list" aria-label="Keying features">
                <div className="connector-layout-keying-list-header">
                  <p className="meta-line">
                    {keyings.length === 0 ? "Add a keying marker to configure the connector shell." : "Select a keying marker in the preview to edit it."}
                  </p>
                  <button type="button" className="button-with-icon" onClick={addKeyingWithDefaultColor}>
                    <span className="action-button-icon is-new" aria-hidden="true" />
                    Add keying
                  </button>
                </div>
                {keyings.length === 0 ? <p className="meta-line">No keying features.</p> : null}
                {keyings.length > 0 && selectedKeying === null ? <p className="meta-line">No keying selected.</p> : null}
                {selectedKeying !== null && selectedKeyingControlIndex >= 0 ? (
                    <div key={`keying-${selectedKeyingControlIndex}`} className="connector-layout-keying-row">
                      <label>
                        Placement
                        <select
                          value={selectedKeyingPlacement.mode}
                          onChange={(event) => updateKeyingPlacementMode(selectedKeyingControlIndex, event.target.value as ConnectorLayoutKeyingPlacement["mode"])}
                        >
                          <option value="guided">Guided</option>
                          <option value="free">Free</option>
                        </select>
                      </label>
                      <label>
                        Shape
                        <select
                          value={selectedKeying.shape ?? "arrow"}
                          onChange={(event) =>
                            commitLayout(
                              updateConnectorLayoutKeyingAt(layout, selectedKeyingControlIndex, {
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
                        <label htmlFor={`connector-layout-keying-color-${selectedKeyingControlIndex}`}>Color</label>
                        <div>
                          <input
                            id={`connector-layout-keying-color-${selectedKeyingControlIndex}`}
                            type="color"
                            value={selectedKeying.color ?? getDefaultKeyingColor()}
                            onChange={(event) =>
                              commitLayout(
                                updateConnectorLayoutKeyingAt(layout, selectedKeyingControlIndex, {
                                  color: event.target.value
                                })
                              )
                            }
                          />
                        </div>
                      </div>
                      {selectedKeyingPlacement.mode === "guided" ? (
                        <label className="connector-layout-slider-field">
                          <span>
                            Position
                            <strong>{Math.round(selectedKeyingPlacement.pathPosition * 100)}%</strong>
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={selectedKeyingPlacement.pathPosition}
                            onChange={(event) => updateKeyingGuidedPosition(selectedKeyingControlIndex, event.target.value)}
                          />
                        </label>
                      ) : null}
                      <label className="connector-layout-slider-field">
                        <span>
                          Scale
                          <strong>{(selectedKeying.scale ?? DEFAULT_CONNECTOR_LAYOUT_KEYING_SCALE).toFixed(2)}x</strong>
                        </span>
                        <input
                          type="range"
                          min={MIN_CONNECTOR_LAYOUT_KEYING_SCALE}
                          max={MAX_CONNECTOR_LAYOUT_KEYING_SCALE}
                          step={0.05}
                          value={selectedKeying.scale ?? DEFAULT_CONNECTOR_LAYOUT_KEYING_SCALE}
                          onChange={(event) => updateKeyingScale(selectedKeyingControlIndex, event.target.value)}
                        />
                      </label>
                      <button
                        type="button"
                        className="button-with-icon connector-layout-keying-remove-button"
                        onClick={() => {
                          setSelectedKeyingIndex(keyings.length <= 1 ? null : Math.min(selectedKeyingControlIndex, keyings.length - 2));
                          commitLayout(removeConnectorLayoutKeying(layout, selectedKeyingControlIndex));
                        }}
                      >
                        <span className="action-button-icon is-delete" aria-hidden="true" />
                        Remove
                      </button>
                      <label className="connector-layout-checkbox-field">
                        <input
                          type="checkbox"
                          checked={isKeyingSnapEnabled(selectedKeyingPlacement)}
                          onChange={(event) => updateKeyingSnap(selectedKeyingControlIndex, event.target.checked)}
                        />
                        Snap
                      </label>
                    </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </fieldset>
  );
}

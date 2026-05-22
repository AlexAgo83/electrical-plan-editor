import type {
  ConnectorLayout,
  ConnectorLayoutKeying,
  ConnectorLayoutKeyingPlacement,
  ConnectorLayoutKeyingShape,
  ConnectorLayoutKeyingSide,
  ConnectorLayoutShellShape,
  ConnectorLayoutWay,
  ConnectorLayoutWayShape
} from "./entities";

const MIN_LAYOUT_SIZE = 1;
export const MAX_CONNECTOR_LAYOUT_SIZE = 48;
const MAX_LAYOUT_SIZE = MAX_CONNECTOR_LAYOUT_SIZE;
const DEFAULT_WAY_SHAPE: ConnectorLayoutWayShape = "round";
const DEFAULT_KEYING_SIDE: ConnectorLayoutKeyingSide = "right";
const DEFAULT_KEYING_SHAPE: ConnectorLayoutKeyingShape = "arrow";
const DEFAULT_SHELL_SHAPE: ConnectorLayoutShellShape = "square";
export const DEFAULT_CONNECTOR_LAYOUT_KEYING_SCALE = 1;
export const MIN_CONNECTOR_LAYOUT_KEYING_SCALE = 0.5;
export const MAX_CONNECTOR_LAYOUT_KEYING_SCALE = 2;
export const DEFAULT_CONNECTOR_LAYOUT_KEYING_PATH_POSITION = 0.25;
export const DEFAULT_CONNECTOR_LAYOUT_SHELL_PADDING = 0.5;
export const MIN_CONNECTOR_LAYOUT_SHELL_PADDING = 0.35;
export const MAX_CONNECTOR_LAYOUT_SHELL_PADDING = 1.5;
export const DEFAULT_CONNECTOR_LAYOUT_CELL_PADDING = 0.36;
export const MIN_CONNECTOR_LAYOUT_CELL_PADDING = 0.12;
export const MAX_CONNECTOR_LAYOUT_CELL_PADDING = 0.72;

function clampInteger(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  const normalized = Math.trunc(value);
  if (normalized < min) {
    return min;
  }
  if (normalized > max) {
    return max;
  }
  return normalized;
}

function clampNumber(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function normalizeWayShape(value: unknown): ConnectorLayoutWayShape {
  return value === "square" || value === "slot" || value === "round" ? value : DEFAULT_WAY_SHAPE;
}

function normalizeShellShape(value: unknown): ConnectorLayoutShellShape {
  return value === "circle" || value === "square" ? value : DEFAULT_SHELL_SHAPE;
}

function normalizeShellPadding(value: unknown): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isFinite(parsed)) {
    return DEFAULT_CONNECTOR_LAYOUT_SHELL_PADDING;
  }
  const clamped = Math.min(MAX_CONNECTOR_LAYOUT_SHELL_PADDING, Math.max(MIN_CONNECTOR_LAYOUT_SHELL_PADDING, parsed));
  return Math.round(clamped * 100) / 100;
}

function normalizeCellPadding(value: unknown): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isFinite(parsed)) {
    return DEFAULT_CONNECTOR_LAYOUT_CELL_PADDING;
  }
  const clamped = Math.min(MAX_CONNECTOR_LAYOUT_CELL_PADDING, Math.max(MIN_CONNECTOR_LAYOUT_CELL_PADDING, parsed));
  return Math.round(clamped * 100) / 100;
}

function normalizeWayLabel(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length === 0 ? undefined : normalized.slice(0, 24);
}

function normalizeKeyingSide(value: unknown): ConnectorLayoutKeyingSide {
  return value === "none" || value === "top" || value === "right" || value === "bottom" || value === "left"
    ? value
    : DEFAULT_KEYING_SIDE;
}

function normalizeKeyingShape(value: unknown): ConnectorLayoutKeyingShape {
  return value === "square" || value === "round" || value === "diamond" || value === "arrow"
    ? value
    : DEFAULT_KEYING_SHAPE;
}

function normalizeKeyingColor(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim();
  return /^#[\da-f]{6}$/i.test(normalized) ? normalized.toLowerCase() : undefined;
}

function normalizeKeyingScale(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = typeof value === "string" ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isFinite(parsed)) {
    return undefined;
  }
  const clamped = Math.min(MAX_CONNECTOR_LAYOUT_KEYING_SCALE, Math.max(MIN_CONNECTOR_LAYOUT_KEYING_SCALE, parsed));
  const rounded = Math.round(clamped * 100) / 100;
  return rounded === DEFAULT_CONNECTOR_LAYOUT_KEYING_SCALE ? undefined : rounded;
}

function getDefaultKeyingPosition(side: ConnectorLayoutKeyingSide, width: number, height: number): number | undefined {
  if (side === "none") {
    return undefined;
  }
  const span = side === "top" || side === "bottom" ? width : height;
  return (span + 1) / 2;
}

function getShellBounds(width: number, height: number, shellPadding: number): { left: number; top: number; right: number; bottom: number } {
  return {
    left: 1 - shellPadding,
    top: 1 - shellPadding,
    right: width + shellPadding,
    bottom: height + shellPadding
  };
}

function normalizePathPosition(value: unknown): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isFinite(parsed)) {
    return DEFAULT_CONNECTOR_LAYOUT_KEYING_PATH_POSITION;
  }
  return roundTo(Math.min(1, Math.max(0, parsed)), 4);
}

function getPathPositionMetrics(width: number, height: number, shellPadding: number) {
  const { left, top, right, bottom } = getShellBounds(width, height, shellPadding);
  const topLength = Math.max(0.0001, right - left);
  const rightLength = Math.max(0.0001, bottom - top);
  const bottomLength = topLength;
  const leftLength = rightLength;
  const perimeter = topLength + rightLength + bottomLength + leftLength;
  return { left, top, right, bottom, topLength, rightLength, bottomLength, leftLength, perimeter };
}

function legacyKeyingToPathPosition(
  side: ConnectorLayoutKeyingSide,
  position: number | undefined,
  width: number,
  height: number,
  shellPadding: number
): number {
  if (side === "none") {
    return DEFAULT_CONNECTOR_LAYOUT_KEYING_PATH_POSITION;
  }
  const metrics = getPathPositionMetrics(width, height, shellPadding);
  const keyingPosition = position ?? getDefaultKeyingPosition(side, width, height) ?? 1;
  let distance = 0;
  if (side === "top") {
    distance = Math.min(metrics.topLength, Math.max(0, keyingPosition - metrics.left));
  } else if (side === "right") {
    distance = metrics.topLength + Math.min(metrics.rightLength, Math.max(0, keyingPosition - metrics.top));
  } else if (side === "bottom") {
    distance = metrics.topLength + metrics.rightLength + Math.min(metrics.bottomLength, Math.max(0, metrics.right - keyingPosition));
  } else {
    distance =
      metrics.topLength +
      metrics.rightLength +
      metrics.bottomLength +
      Math.min(metrics.leftLength, Math.max(0, metrics.bottom - keyingPosition));
  }
  return roundTo(distance / metrics.perimeter, 4);
}

function pathPositionToLegacyKeying(
  pathPosition: number,
  width: number,
  height: number,
  shellPadding: number
): Pick<ConnectorLayoutKeying, "side" | "position"> {
  const metrics = getPathPositionMetrics(width, height, shellPadding);
  let distance = normalizePathPosition(pathPosition) * metrics.perimeter;
  if (distance <= metrics.topLength) {
    return { side: "top", position: roundTo(metrics.left + distance, 2) };
  }
  distance -= metrics.topLength;
  if (distance <= metrics.rightLength) {
    return { side: "right", position: roundTo(metrics.top + distance, 2) };
  }
  distance -= metrics.rightLength;
  if (distance <= metrics.bottomLength) {
    return { side: "bottom", position: roundTo(metrics.right - distance, 2) };
  }
  distance -= metrics.bottomLength;
  return { side: "left", position: roundTo(metrics.bottom - Math.min(distance, metrics.leftLength), 2) };
}

function normalizeVector(x: number, y: number): { x: number; y: number } {
  const length = Math.hypot(x, y);
  return length > 0.0001 ? { x: x / length, y: y / length } : { x: 1, y: 0 };
}

export function getConnectorLayoutKeyingAnchor(
  keying: ConnectorLayoutKeying,
  layout: ConnectorLayout,
  shellShape: ConnectorLayoutShellShape = getConnectorLayoutShellShape(layout),
  shellPadding: number = getConnectorLayoutShellPadding(layout)
): { x: number; y: number; normalX: number; normalY: number } {
  const placement = keying.placement ?? {
    mode: "guided",
    pathPosition: legacyKeyingToPathPosition(keying.side, keying.position, layout.width, layout.height, shellPadding)
  };
  const centerX = layout.width / 2 + 0.5;
  const centerY = layout.height / 2 + 0.5;
  if (placement.mode === "free") {
    if (shellShape === "square") {
      const { left, top, right, bottom } = getShellBounds(layout.width, layout.height, shellPadding);
      const distances = [
        { distance: Math.abs(placement.y - top), normalX: 0, normalY: -1 },
        { distance: Math.abs(placement.x - right), normalX: 1, normalY: 0 },
        { distance: Math.abs(placement.y - bottom), normalX: 0, normalY: 1 },
        { distance: Math.abs(placement.x - left), normalX: -1, normalY: 0 }
      ];
      const nearest = distances.reduce((best, candidate) => (candidate.distance < best.distance ? candidate : best));
      return { x: placement.x, y: placement.y, normalX: nearest.normalX, normalY: nearest.normalY };
    }
    const normal = normalizeVector(placement.x - centerX, placement.y - centerY);
    return { x: placement.x, y: placement.y, normalX: normal.x, normalY: normal.y };
  }
  const pathPosition = normalizePathPosition(placement.pathPosition);
  if (shellShape === "circle") {
    const radiusX = (layout.width - 1) / 2 + shellPadding;
    const radiusY = (layout.height - 1) / 2 + shellPadding;
    const angle = pathPosition * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radiusX;
    const y = centerY + Math.sin(angle) * radiusY;
    const normal = normalizeVector(Math.cos(angle) / radiusX, Math.sin(angle) / radiusY);
    return { x, y, normalX: normal.x, normalY: normal.y };
  }
  const metrics = getPathPositionMetrics(layout.width, layout.height, shellPadding);
  let distance = pathPosition * metrics.perimeter;
  if (distance <= metrics.topLength) {
    return { x: metrics.left + distance, y: metrics.top, normalX: 0, normalY: -1 };
  }
  distance -= metrics.topLength;
  if (distance <= metrics.rightLength) {
    return { x: metrics.right, y: metrics.top + distance, normalX: 1, normalY: 0 };
  }
  distance -= metrics.rightLength;
  if (distance <= metrics.bottomLength) {
    return { x: metrics.right - distance, y: metrics.bottom, normalX: 0, normalY: 1 };
  }
  distance -= metrics.bottomLength;
  return { x: metrics.left, y: metrics.bottom - Math.min(distance, metrics.leftLength), normalX: -1, normalY: 0 };
}

function normalizeKeyingPlacement(
  value: unknown,
  legacySide: ConnectorLayoutKeyingSide,
  legacyPosition: number | undefined,
  width: number,
  height: number,
  shellPadding: number
): ConnectorLayoutKeyingPlacement {
  const { left, top, right, bottom } = getShellBounds(width, height, shellPadding);
  if (value !== undefined && typeof value === "object") {
    const placement = value as Partial<ConnectorLayoutKeyingPlacement>;
    if (placement.mode === "free") {
      return {
        mode: "free",
        x: roundTo(clampNumber(placement.x, left - 0.5, right + 0.5) ?? (left + right) / 2, 2),
        y: roundTo(clampNumber(placement.y, top - 0.5, bottom + 0.5) ?? (top + bottom) / 2, 2)
      };
    }
    if (placement.mode === "guided") {
      return {
        mode: "guided",
        pathPosition: normalizePathPosition(placement.pathPosition)
      };
    }
  }
  return {
    mode: "guided",
    pathPosition: legacyKeyingToPathPosition(legacySide, legacyPosition, width, height, shellPadding)
  };
}

function getKeyingPositionBounds(side: ConnectorLayoutKeyingSide, width: number, height: number): { min: number; max: number } | null {
  if (side === "none") {
    return null;
  }
  return {
    min: 1,
    max: side === "top" || side === "bottom" ? width : height
  };
}

function normalizeKeying(
  value: unknown,
  width: number,
  height: number,
  shellPadding: number
): ConnectorLayoutKeying | null {
  if (value === undefined || typeof value !== "object") {
    return null;
  }
  const keying = value as Partial<ConnectorLayoutKeying>;
  const side = normalizeKeyingSide(keying.side);
  if (side === "none" && keying.placement === undefined) {
    return null;
  }
  const legacySide = side === "none" ? DEFAULT_KEYING_SIDE : side;
  const bounds = getKeyingPositionBounds(legacySide, width, height);
  if (bounds === null) {
    return null;
  }
  const color = normalizeKeyingColor(keying.color);
  const scale = normalizeKeyingScale(keying.scale);
  const legacyPosition = clampNumber(keying.position, bounds.min, bounds.max) ?? getDefaultKeyingPosition(legacySide, width, height);
  const placement = normalizeKeyingPlacement(keying.placement, legacySide, legacyPosition, width, height, shellPadding);
  const legacy = placement.mode === "guided"
    ? pathPositionToLegacyKeying(placement.pathPosition, width, height, shellPadding)
    : { side: legacySide, position: legacyPosition };
  return {
    side: legacy.side,
    shape: normalizeKeyingShape(keying.shape),
    ...(color !== undefined ? { color } : {}),
    ...(scale !== undefined ? { scale } : {}),
    placement,
    position: legacy.position
  };
}

function normalizeKeyings(value: unknown, legacyKeying: unknown, width: number, height: number, shellPadding: number): ConnectorLayoutKeying[] {
  const rawKeyings = Array.isArray(value) ? value : legacyKeying === undefined ? [] : [legacyKeying];
  return rawKeyings
    .map((rawKeying) => normalizeKeying(rawKeying, width, height, shellPadding))
    .filter((keying): keying is ConnectorLayoutKeying => keying !== null);
}

function buildFallbackWay(cavityIndex: number, connectionCount: number): ConnectorLayoutWay {
  const generated = createDefaultConnectorLayout(connectionCount);
  return generated.ways.find((way) => way.cavityIndex === cavityIndex) ?? {
    cavityIndex,
    x: cavityIndex,
    y: 1,
    shape: DEFAULT_WAY_SHAPE
  };
}

export function createDefaultConnectorLayout(connectionCount: number): ConnectorLayout {
  const safeCount = Math.max(1, Math.trunc(connectionCount));
  const columns = Math.max(1, Math.ceil(Math.sqrt(safeCount)));
  const rows = Math.max(1, Math.ceil(safeCount / columns));
  const ways = Array.from({ length: safeCount }, (_, index) => {
    const cavityIndex = index + 1;
    return {
      cavityIndex,
      x: (index % columns) + 1,
      y: Math.floor(index / columns) + 1,
      shape: DEFAULT_WAY_SHAPE
    };
  });

  return {
    version: 1,
    units: "grid",
    width: columns,
    height: rows,
    shellShape: DEFAULT_SHELL_SHAPE,
    shellPadding: DEFAULT_CONNECTOR_LAYOUT_SHELL_PADDING,
    cellPadding: DEFAULT_CONNECTOR_LAYOUT_CELL_PADDING,
    keyings: [],
    ways
  };
}

export function normalizeConnectorLayout(
  value: Partial<ConnectorLayout> | undefined,
  connectionCount: number
): ConnectorLayout | undefined {
  if (value === undefined || typeof value !== "object") {
    return undefined;
  }

  const safeCount = Math.max(1, Math.trunc(connectionCount));
  const fallback = createDefaultConnectorLayout(safeCount);
  const width = clampInteger(value.width, MIN_LAYOUT_SIZE, MAX_LAYOUT_SIZE) ?? fallback.width;
  const height = clampInteger(value.height, MIN_LAYOUT_SIZE, MAX_LAYOUT_SIZE) ?? fallback.height;
  const rawWays = Array.isArray(value.ways) ? value.ways : [];
  const normalizedByIndex = new Map<number, ConnectorLayoutWay>();

  for (const rawWay of rawWays) {
    if (rawWay === undefined || typeof rawWay !== "object") {
      continue;
    }
    const candidate = rawWay as Partial<ConnectorLayoutWay>;
    const cavityIndex = clampInteger(candidate.cavityIndex, 1, safeCount);
    if (cavityIndex === null || normalizedByIndex.has(cavityIndex)) {
      continue;
    }
    const fallbackWay = buildFallbackWay(cavityIndex, safeCount);
    normalizedByIndex.set(cavityIndex, {
      cavityIndex,
      x: clampInteger(candidate.x, 1, width) ?? clampInteger(fallbackWay.x, 1, width) ?? 1,
      y: clampInteger(candidate.y, 1, height) ?? clampInteger(fallbackWay.y, 1, height) ?? 1,
      shape: normalizeWayShape(candidate.shape),
      label: normalizeWayLabel(candidate.label)
    });
  }

  for (let cavityIndex = 1; cavityIndex <= safeCount; cavityIndex += 1) {
    if (!normalizedByIndex.has(cavityIndex)) {
      const fallbackWay = buildFallbackWay(cavityIndex, safeCount);
      normalizedByIndex.set(cavityIndex, {
        ...fallbackWay,
        x: clampInteger(fallbackWay.x, 1, width) ?? 1,
        y: clampInteger(fallbackWay.y, 1, height) ?? 1
      });
    }
  }

  const shellPadding = normalizeShellPadding(value.shellPadding);
  return {
    version: 1,
    units: "grid",
    width,
    height,
    shellShape: normalizeShellShape(value.shellShape),
    shellPadding,
    cellPadding: normalizeCellPadding(value.cellPadding),
    keyings: normalizeKeyings(value.keyings, value.keying, width, height, shellPadding),
    ways: [...normalizedByIndex.values()].sort((left, right) => left.cavityIndex - right.cavityIndex)
  };
}

export function resolveConnectorLayout(
  value: Partial<ConnectorLayout> | undefined,
  connectionCount: number
): ConnectorLayout {
  return normalizeConnectorLayout(value, connectionCount) ?? createDefaultConnectorLayout(connectionCount);
}

function connectorLayoutKeyingsMatch(left: ConnectorLayoutKeying[] | undefined, right: ConnectorLayoutKeying[] | undefined): boolean {
  const leftKeyings = left ?? [];
  const rightKeyings = right ?? [];
  return (
    leftKeyings.length === rightKeyings.length &&
    leftKeyings.every((leftKeying, index) => {
      const rightKeying = rightKeyings[index];
      return (
        rightKeying !== undefined &&
        leftKeying.side === rightKeying.side &&
        leftKeying.shape === rightKeying.shape &&
        leftKeying.position === rightKeying.position &&
        leftKeying.color === rightKeying.color &&
        leftKeying.scale === rightKeying.scale &&
        JSON.stringify(leftKeying.placement) === JSON.stringify(rightKeying.placement)
      );
    })
  );
}

function connectorLayoutWaysMatch(left: ConnectorLayoutWay[], right: ConnectorLayoutWay[]): boolean {
  return (
    left.length === right.length &&
    left.every((leftWay, index) => {
      const rightWay = right[index];
      return (
        rightWay !== undefined &&
        leftWay.cavityIndex === rightWay.cavityIndex &&
        leftWay.x === rightWay.x &&
        leftWay.y === rightWay.y &&
        leftWay.shape === rightWay.shape &&
        leftWay.label === rightWay.label
      );
    })
  );
}

export function isEditedConnectorLayout(
  value: Partial<ConnectorLayout> | undefined,
  connectionCount: number
): boolean {
  const layout = normalizeConnectorLayout(value, connectionCount);
  if (layout === undefined) {
    return false;
  }
  const generatedLayout = createDefaultConnectorLayout(connectionCount);
  return !(
    layout.version === generatedLayout.version &&
    layout.units === generatedLayout.units &&
    layout.width === generatedLayout.width &&
    layout.height === generatedLayout.height &&
    getConnectorLayoutShellShape(layout) === getConnectorLayoutShellShape(generatedLayout) &&
    getConnectorLayoutShellPadding(layout) === getConnectorLayoutShellPadding(generatedLayout) &&
    getConnectorLayoutCellPadding(layout) === getConnectorLayoutCellPadding(generatedLayout) &&
    connectorLayoutKeyingsMatch(getConnectorLayoutKeyings(layout), getConnectorLayoutKeyings(generatedLayout)) &&
    connectorLayoutWaysMatch(layout.ways, generatedLayout.ways)
  );
}

export function resolveEditedConnectorLayout(
  value: Partial<ConnectorLayout> | undefined,
  connectionCount: number
): ConnectorLayout | undefined {
  return isEditedConnectorLayout(value, connectionCount) ? normalizeConnectorLayout(value, connectionCount) : undefined;
}

export function getConnectorLayoutWayDisplayLabel(way: Pick<ConnectorLayoutWay, "cavityIndex" | "label">): string {
  return way.label ?? `C${way.cavityIndex}`;
}

export function moveConnectorLayoutWay(
  layout: ConnectorLayout,
  cavityIndex: number,
  x: number,
  y: number
): ConnectorLayout {
  const nextX = clampInteger(x, 1, layout.width) ?? 1;
  const nextY = clampInteger(y, 1, layout.height) ?? 1;

  return {
    ...layout,
    ways: layout.ways.map((way) =>
      way.cavityIndex === cavityIndex
        ? { ...way, x: nextX, y: nextY }
        : way
    )
  };
}

export function canMoveConnectorLayoutWay(
  layout: ConnectorLayout,
  cavityIndex: number,
  x: number,
  y: number
): boolean {
  const nextX = clampInteger(x, 1, layout.width) ?? 1;
  const nextY = clampInteger(y, 1, layout.height) ?? 1;
  return !layout.ways.some((way) => way.cavityIndex !== cavityIndex && way.x === nextX && way.y === nextY);
}

export function moveConnectorLayoutWayIfFree(
  layout: ConnectorLayout,
  cavityIndex: number,
  x: number,
  y: number
): ConnectorLayout {
  return canMoveConnectorLayoutWay(layout, cavityIndex, x, y)
    ? moveConnectorLayoutWay(layout, cavityIndex, x, y)
    : layout;
}

export function getConnectorLayoutDuplicatePositions(layout: ConnectorLayout): ConnectorLayoutWay[][] {
  const waysByPosition = new Map<string, ConnectorLayoutWay[]>();

  for (const way of layout.ways) {
    const key = `${way.x}:${way.y}`;
    const ways = waysByPosition.get(key) ?? [];
    ways.push(way);
    waysByPosition.set(key, ways);
  }

  return [...waysByPosition.values()].filter((ways) => ways.length > 1);
}

export function getConnectorLayoutKeyingSide(layout: ConnectorLayout): ConnectorLayoutKeyingSide {
  return getConnectorLayoutKeyings(layout)[0]?.side ?? "none";
}

export function getConnectorLayoutKeyingPosition(layout: ConnectorLayout): number | undefined {
  return getConnectorLayoutKeyings(layout)[0]?.position;
}

export function getConnectorLayoutKeyings(layout: ConnectorLayout): ConnectorLayoutKeying[] {
  return normalizeKeyings(layout.keyings, layout.keying, layout.width, layout.height, getConnectorLayoutShellPadding(layout));
}

export function getConnectorLayoutShellShape(layout: ConnectorLayout): ConnectorLayoutShellShape {
  return normalizeShellShape(layout.shellShape);
}

export function getConnectorLayoutShellPadding(layout: ConnectorLayout): number {
  return normalizeShellPadding(layout.shellPadding);
}

export function getConnectorLayoutCellPadding(layout: ConnectorLayout): number {
  return normalizeCellPadding(layout.cellPadding);
}

export function updateConnectorLayoutShellShape(
  layout: ConnectorLayout,
  shellShape: ConnectorLayoutShellShape
): ConnectorLayout {
  return {
    ...layout,
    shellShape: normalizeShellShape(shellShape)
  };
}

export function updateConnectorLayoutShellPadding(layout: ConnectorLayout, shellPadding: number): ConnectorLayout {
  return {
    ...layout,
    shellPadding: normalizeShellPadding(shellPadding)
  };
}

export function updateConnectorLayoutCellPadding(layout: ConnectorLayout, cellPadding: number): ConnectorLayout {
  return {
    ...layout,
    cellPadding: normalizeCellPadding(cellPadding)
  };
}

export function updateConnectorLayoutKeyingSide(
  layout: ConnectorLayout,
  side: ConnectorLayoutKeyingSide
): ConnectorLayout {
  const normalizedSide = normalizeKeyingSide(side);
  if (normalizedSide === "none") {
    return { ...layout, keying: undefined, keyings: [] };
  }
  return {
    ...layout,
    keying: undefined,
    keyings: [
      normalizeKeying(
        {
          side: normalizedSide,
          position: getConnectorLayoutKeyingSide(layout) === normalizedSide ? getConnectorLayoutKeyingPosition(layout) : undefined
        },
        layout.width,
        layout.height,
        getConnectorLayoutShellPadding(layout)
      )
    ].filter((keying): keying is ConnectorLayoutKeying => keying !== null)
  };
}

export function updateConnectorLayoutKeyingPosition(layout: ConnectorLayout, position: number): ConnectorLayout {
  const side = getConnectorLayoutKeyingSide(layout);
  return {
    ...layout,
    keying: undefined,
    keyings: [normalizeKeying({ side, position }, layout.width, layout.height, getConnectorLayoutShellPadding(layout))].filter(
      (keying): keying is ConnectorLayoutKeying => keying !== null
    )
  };
}

export function addConnectorLayoutKeying(layout: ConnectorLayout): ConnectorLayout {
  const defaultPosition = getDefaultKeyingPosition(DEFAULT_KEYING_SIDE, layout.width, layout.height);
  const shellPadding = getConnectorLayoutShellPadding(layout);
  return {
    ...layout,
    keying: undefined,
    keyings: [
      ...getConnectorLayoutKeyings(layout),
      {
        side: DEFAULT_KEYING_SIDE,
        shape: DEFAULT_KEYING_SHAPE,
        placement: {
          mode: "guided",
          pathPosition: legacyKeyingToPathPosition(DEFAULT_KEYING_SIDE, defaultPosition, layout.width, layout.height, shellPadding)
        },
        position: defaultPosition
      }
    ]
  };
}

export function removeConnectorLayoutKeying(layout: ConnectorLayout, index: number): ConnectorLayout {
  return {
    ...layout,
    keying: undefined,
    keyings: getConnectorLayoutKeyings(layout).filter((_, keyingIndex) => keyingIndex !== index)
  };
}

export function updateConnectorLayoutKeyingAt(
  layout: ConnectorLayout,
  index: number,
  patch: Partial<ConnectorLayoutKeying>
): ConnectorLayout {
  return {
    ...layout,
    keying: undefined,
    keyings: getConnectorLayoutKeyings(layout).map((keying, keyingIndex) => {
      if (keyingIndex !== index) {
        return keying;
      }
      const nextKeying = { ...keying, ...patch };
      if (patch.placement === undefined && ("side" in patch || "position" in patch)) {
        delete nextKeying.placement;
      }
      return normalizeKeying(nextKeying, layout.width, layout.height, getConnectorLayoutShellPadding(layout)) ?? keying;
    })
  };
}

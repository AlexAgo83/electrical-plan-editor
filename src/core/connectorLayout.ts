import type { ConnectorLayout, ConnectorLayoutWay, ConnectorLayoutWayShape } from "./entities";

const MIN_LAYOUT_SIZE = 1;
const MAX_LAYOUT_SIZE = 48;
const DEFAULT_WAY_SHAPE: ConnectorLayoutWayShape = "round";

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

function normalizeWayShape(value: unknown): ConnectorLayoutWayShape {
  return value === "square" || value === "slot" || value === "round" ? value : DEFAULT_WAY_SHAPE;
}

function normalizeWayLabel(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length === 0 ? undefined : normalized.slice(0, 24);
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

  return {
    version: 1,
    units: "grid",
    width,
    height,
    ways: [...normalizedByIndex.values()].sort((left, right) => left.cavityIndex - right.cavityIndex)
  };
}

export function resolveConnectorLayout(
  value: Partial<ConnectorLayout> | undefined,
  connectionCount: number
): ConnectorLayout {
  return normalizeConnectorLayout(value, connectionCount) ?? createDefaultConnectorLayout(connectionCount);
}

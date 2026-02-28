import type { SortDirection, SortField, SortState } from "../types/app-controller";

export const NETWORK_VIEW_WIDTH = 760;
export const NETWORK_VIEW_HEIGHT = 420;
export const HISTORY_LIMIT = 60;
export const NETWORK_GRID_STEP = 20;
export const NETWORK_MIN_SCALE = 0.03;
export const NETWORK_MAX_SCALE = 2.2;
export const MOBILE_BREAKPOINT_PX = 900;

export function createEntityId(prefix: string): string {
  const randomPart = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  return `${prefix}-${randomPart}`;
}

export function toPositiveInteger(raw: string): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.trunc(parsed));
}

export function toPositiveNumber(raw: string): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return parsed;
}

export function normalizeSearch(raw: string): string {
  return raw.trim().toLocaleLowerCase();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function snapToGrid(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function sortByNameAndTechnicalId<T>(
  items: T[],
  sortState: SortState,
  getName: (item: T) => string,
  getTechnicalId: (item: T) => string
): T[] {
  return [...items].sort((left, right) => {
    const leftPrimary = sortState.field === "name" ? getName(left) : getTechnicalId(left);
    const rightPrimary = sortState.field === "name" ? getName(right) : getTechnicalId(right);
    const primaryComparison = leftPrimary.localeCompare(rightPrimary, undefined, { sensitivity: "base" });
    if (primaryComparison !== 0) {
      return sortState.direction === "asc" ? primaryComparison : -primaryComparison;
    }

    const leftSecondary = sortState.field === "name" ? getTechnicalId(left) : getName(left);
    const rightSecondary = sortState.field === "name" ? getTechnicalId(right) : getName(right);
    return leftSecondary.localeCompare(rightSecondary, undefined, { sensitivity: "base" });
  });
}

export function sortById<T>(items: T[], direction: SortDirection, getId: (item: T) => string): T[] {
  return [...items].sort((left, right) => {
    const comparison = getId(left).localeCompare(getId(right), undefined, { sensitivity: "base" });
    return direction === "asc" ? comparison : -comparison;
  });
}

export function nextSortState(current: SortState, field: SortField): SortState {
  if (current.field !== field) {
    return { field, direction: "asc" };
  }

  return {
    field,
    direction: current.direction === "asc" ? "desc" : "asc"
  };
}

export type SortablePrimitive = string | number | null | undefined;

function isEmptySortableValue(value: SortablePrimitive): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  return typeof value === "string" && value.trim().length === 0;
}

export function compareSortableValues(left: SortablePrimitive, right: SortablePrimitive, direction: SortDirection): number {
  const leftEmpty = isEmptySortableValue(left);
  const rightEmpty = isEmptySortableValue(right);
  if (leftEmpty && rightEmpty) {
    return 0;
  }
  if (leftEmpty) {
    return 1;
  }
  if (rightEmpty) {
    return -1;
  }

  if (typeof left === "number" && typeof right === "number") {
    const delta = left - right;
    if (delta === 0) {
      return 0;
    }
    return direction === "asc" ? delta : -delta;
  }

  const comparison = String(left).localeCompare(String(right), undefined, { sensitivity: "base" });
  return direction === "asc" ? comparison : -comparison;
}

export function sortByTableColumns<T, Field extends string>(
  items: T[],
  sortState: { field: Field; direction: SortDirection },
  getValue: (item: T, field: Field) => SortablePrimitive,
  getTieBreaker?: (item: T) => string
): T[] {
  const fallback = getTieBreaker ?? (() => "");
  return [...items].sort((left, right) => {
    const primary = compareSortableValues(getValue(left, sortState.field), getValue(right, sortState.field), sortState.direction);
    if (primary !== 0) {
      return primary;
    }
    return fallback(left).localeCompare(fallback(right), undefined, { sensitivity: "base" });
  });
}

export function buildUniqueNetworkTechnicalId(baseTechnicalId: string, existingTechnicalIds: Set<string>): string {
  if (!existingTechnicalIds.has(baseTechnicalId)) {
    return baseTechnicalId;
  }

  let index = 1;
  let candidate = `${baseTechnicalId}-COPY`;
  while (existingTechnicalIds.has(candidate)) {
    index += 1;
    candidate = `${baseTechnicalId}-COPY-${index}`;
  }

  return candidate;
}

export function focusSelectedTableRowInPanel(panelSelector: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const tryFocus = (remainingFrames: number) => {
    const panel = document.querySelector(panelSelector);
    const row = panel?.querySelector<HTMLElement>("tr.is-selected.is-focusable-row");
    if (row !== undefined && row !== null) {
      row.focus();
      if (typeof row.scrollIntoView === "function") {
        row.scrollIntoView({ block: "nearest" });
      }
      return;
    }

    if (remainingFrames <= 0) {
      return;
    }

    window.requestAnimationFrame(() => {
      tryFocus(remainingFrames - 1);
    });
  };

  window.requestAnimationFrame(() => {
    tryFocus(3);
  });
}

export function focusElementWithoutScroll(element: HTMLElement | null | undefined): void {
  if (element === null || element === undefined) {
    return;
  }
  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
}

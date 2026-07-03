function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
}

function areArraysShallowEqual(left: readonly unknown[], right: readonly unknown[]): boolean {
  return left.length === right.length && left.every((value, index) => {
    const rightValue = right[index];
    return Object.is(value, rightValue) || (isPlainRecord(value) && isPlainRecord(rightValue) && arePlainObjectsShallowEqual(value, rightValue));
  });
}

function areMapsShallowEqual(left: ReadonlyMap<unknown, unknown>, right: ReadonlyMap<unknown, unknown>): boolean {
  return left.size === right.size && [...left].every(([key, value]) => Object.is(value, right.get(key)));
}

function areSetsShallowEqual(left: ReadonlySet<unknown>, right: ReadonlySet<unknown>): boolean {
  return left.size === right.size && [...left].every((value) => right.has(value));
}

function arePlainObjectsShallowEqual(left: Record<string, unknown>, right: Record<string, unknown>): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return leftKeys.length === rightKeys.length && leftKeys.every((key) => {
    const leftValue = left[key];
    const rightValue = right[key];
    return Object.is(leftValue, rightValue) || (isPlainRecord(leftValue) && isPlainRecord(rightValue) && arePlainObjectsShallowEqual(leftValue, rightValue));
  });
}

export function arePanelMemoPropsEqual<TProps extends Record<string, unknown>>(previous: TProps, next: TProps): boolean {
  const previousKeys = Object.keys(previous);
  const nextKeys = Object.keys(next);
  if (previousKeys.length !== nextKeys.length) return false;
  for (const key of nextKeys) {
    const previousValue = previous[key];
    const nextValue = next[key];
    if (Object.is(previousValue, nextValue) || (typeof previousValue === "function" && typeof nextValue === "function")) continue;
    if (Array.isArray(previousValue) && Array.isArray(nextValue) && areArraysShallowEqual(previousValue, nextValue)) continue;
    if (previousValue instanceof Map && nextValue instanceof Map && areMapsShallowEqual(previousValue, nextValue)) continue;
    if (previousValue instanceof Set && nextValue instanceof Set && areSetsShallowEqual(previousValue, nextValue)) continue;
    if (isPlainRecord(previousValue) && isPlainRecord(nextValue) && arePlainObjectsShallowEqual(previousValue, nextValue)) continue;
    return false;
  }
  return true;
}

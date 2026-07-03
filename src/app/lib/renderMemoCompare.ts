function areArraysShallowEqual(left: readonly unknown[], right: readonly unknown[]): boolean {
  return left.length === right.length && left.every((value, index) => Object.is(value, right[index]));
}

function areMapsShallowEqual(left: ReadonlyMap<unknown, unknown>, right: ReadonlyMap<unknown, unknown>): boolean {
  if (left.size !== right.size) {
    return false;
  }
  for (const [key, value] of left) {
    if (!Object.is(value, right.get(key))) {
      return false;
    }
  }
  return true;
}

function areSetsShallowEqual(left: ReadonlySet<unknown>, right: ReadonlySet<unknown>): boolean {
  if (left.size !== right.size) {
    return false;
  }
  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }
  return true;
}

function arePlainObjectsShallowEqual(left: Record<string, unknown>, right: Record<string, unknown>): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every((key) => {
      const leftValue = left[key];
      const rightValue = right[key];
      if (Object.is(leftValue, rightValue)) {
        return true;
      }
      return (
        leftValue !== null &&
        rightValue !== null &&
        Object.getPrototypeOf(leftValue) === Object.prototype &&
        Object.getPrototypeOf(rightValue) === Object.prototype &&
        arePlainObjectsShallowEqual(leftValue as Record<string, unknown>, rightValue as Record<string, unknown>)
      );
    })
  );
}

export function arePanelMemoPropsEqual<TProps extends Record<string, unknown>>(previous: TProps, next: TProps): boolean {
  const previousKeys = Object.keys(previous);
  const nextKeys = Object.keys(next);
  if (previousKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of nextKeys) {
    const previousValue = previous[key];
    const nextValue = next[key];
    if (Object.is(previousValue, nextValue) || (typeof previousValue === "function" && typeof nextValue === "function")) {
      continue;
    }
    if (Array.isArray(previousValue) && Array.isArray(nextValue) && areArraysShallowEqual(previousValue, nextValue)) {
      continue;
    }
    if (previousValue instanceof Map && nextValue instanceof Map && areMapsShallowEqual(previousValue, nextValue)) {
      continue;
    }
    if (previousValue instanceof Set && nextValue instanceof Set && areSetsShallowEqual(previousValue, nextValue)) {
      continue;
    }
    if (
      previousValue !== null &&
      nextValue !== null &&
      Object.getPrototypeOf(previousValue) === Object.prototype &&
      Object.getPrototypeOf(nextValue) === Object.prototype &&
      arePlainObjectsShallowEqual(previousValue as Record<string, unknown>, nextValue as Record<string, unknown>)
    ) {
      continue;
    }
    return false;
  }

  return true;
}

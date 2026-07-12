/**
 * Helpers for connector-way occupancy, whose stored value is a list of occupant
 * refs (`string[]`). A way normally holds a single occupant; a "shared" way holds
 * 2+ occupants (several wires crimped into one terminal — see `allowSharedCavity`).
 *
 * These helpers tolerate legacy single-string values and `undefined`, so read-sites
 * and migrations can rely on a uniform list view.
 */

/** Coerce a stored occupancy value (list, legacy single string, or missing) into a ref list. */
export function occupantsAt(entry: readonly string[] | string | undefined): string[] {
  if (entry === undefined) {
    return [];
  }
  if (typeof entry === "string") {
    return entry.length > 0 ? [entry] : [];
  }
  return entry.filter((ref) => typeof ref === "string" && ref.length > 0);
}

/** Whether a connector way holds at least one occupant. */
export function isCavityOccupied(entry: readonly string[] | string | undefined): boolean {
  return occupantsAt(entry).length > 0;
}

/** The primary (first) occupant ref of a way, or `undefined` when free. */
export function primaryOccupant(entry: readonly string[] | string | undefined): string | undefined {
  return occupantsAt(entry)[0];
}

/** Whether a connector way is shared by 2+ occupants. */
export function isCavityShared(entry: readonly string[] | string | undefined): boolean {
  return occupantsAt(entry).length > 1;
}

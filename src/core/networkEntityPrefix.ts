/**
 * Network entity prefix helpers.
 *
 * A network may declare an `entityPrefix` (for example `LAT-` or `PRI-`) that is
 * anchored into the canonical `technicalId` of every entity it owns. The prefix
 * is purely a display/authoring convenience: canonical stored IDs and AI-agent
 * JSON always keep the full prefixed value. UI surfaces and human-readable
 * exports may hide the active network prefix when the display setting is off so
 * bare IDs (for example `N-01`) stay legible inside a single network.
 *
 * These helpers are pure and deterministic so they can be unit tested in
 * isolation and reused across the model, persistence, rendering, and export
 * layers.
 */

export const NETWORK_ENTITY_PREFIX_MAX_LENGTH = 24;

/**
 * Allowed prefix shape: letters, digits, underscore and hyphen. Prefixes
 * conventionally end with a separator (`LAT-`) but the trailing separator is not
 * required by validation so partial editing stays permissive.
 */
const NETWORK_ENTITY_PREFIX_ALLOWED_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Entity-type tokens that lead generated IDs (`C-001`, `N-02`, `SEG-3`, ...).
 * They are never treated as a network prefix during auto-detection so we do not
 * mistake the connector/node/segment type marker for a network-scope prefix.
 */
const ENTITY_TYPE_LEAD_TOKENS = new Set(["C", "S", "W", "N", "P", "SEG", "CT"]);

export function isNetworkEntityPrefixValid(value: string): boolean {
  return NETWORK_ENTITY_PREFIX_ALLOWED_PATTERN.test(value);
}

/**
 * Normalizes a raw prefix value: trims, drops empties, enforces the max length,
 * and rejects values with unsupported characters (returning `undefined`).
 */
export function normalizeNetworkEntityPrefix(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  const sliced = trimmed.slice(0, NETWORK_ENTITY_PREFIX_MAX_LENGTH);
  if (!isNetworkEntityPrefixValid(sliced)) {
    return undefined;
  }
  return sliced;
}

function leadToken(id: string): string | null {
  const separatorIndex = id.indexOf("-");
  if (separatorIndex <= 0) {
    return null;
  }
  return id.slice(0, separatorIndex);
}

/**
 * Conservatively auto-detects a network prefix shared by a set of canonical
 * entity IDs. Returns the prefix (including the trailing separator, e.g. `LAT-`)
 * only when every non-empty ID shares the same leading `<token>-` segment and
 * that token is not a generic entity-type token. Ambiguous or mixed sets return
 * `undefined` so the field is left blank.
 */
export function detectNetworkEntityPrefix(ids: Iterable<string>): string | undefined {
  const candidates: string[] = [];
  for (const rawId of ids) {
    if (typeof rawId !== "string") {
      continue;
    }
    const trimmed = rawId.trim();
    if (trimmed.length > 0) {
      candidates.push(trimmed);
    }
  }
  if (candidates.length < 2) {
    return undefined;
  }

  let sharedToken: string | null = null;
  for (const id of candidates) {
    const token = leadToken(id);
    if (token === null) {
      return undefined;
    }
    const upper = token.toUpperCase();
    if (ENTITY_TYPE_LEAD_TOKENS.has(upper)) {
      return undefined;
    }
    if (sharedToken === null) {
      sharedToken = token;
      continue;
    }
    if (sharedToken.toUpperCase() !== upper) {
      return undefined;
    }
  }

  if (sharedToken === null) {
    return undefined;
  }
  const prefix = `${sharedToken}-`;
  return normalizeNetworkEntityPrefix(prefix);
}

/** True when `id` already carries `prefix` (case-insensitive). */
export function hasEntityPrefix(id: string, prefix: string | undefined): boolean {
  if (prefix === undefined || prefix.length === 0) {
    return false;
  }
  return id.toLowerCase().startsWith(prefix.toLowerCase());
}

/** Removes the leading `prefix` from `id` when present (case-insensitive). */
export function stripEntityPrefix(id: string, prefix: string | undefined): string {
  if (!hasEntityPrefix(id, prefix)) {
    return id;
  }
  return id.slice((prefix as string).length);
}

/**
 * Anchors `prefix` onto `id`, avoiding a double prefix when the ID already
 * carries it. Used so new-entity creation stores prefixed canonical IDs.
 */
export function applyEntityPrefix(id: string, prefix: string | undefined): string {
  if (prefix === undefined || prefix.length === 0) {
    return id;
  }
  if (hasEntityPrefix(id, prefix)) {
    return id;
  }
  return `${prefix}${id}`;
}

/**
 * Display formatting for a canonical entity ID. When the prefix display is shown
 * (or there is no prefix) the canonical ID is returned unchanged; when hidden,
 * the active network prefix is stripped for legibility. Canonical IDs are never
 * mutated by this helper — it only produces a display string.
 */
export function formatEntityIdForDisplay(
  id: string,
  prefix: string | undefined,
  showPrefix: boolean
): string {
  if (showPrefix) {
    return id;
  }
  return stripEntityPrefix(id, prefix);
}

/**
 * Detects bare IDs that collide once prefixes are hidden across multiple
 * networks. Each entry maps the bare display ID to the list of distinct network
 * prefixes that would render it. Only collisions (2+ networks) are returned, so
 * callers can show a disambiguation hint in harness assembly / multi-network
 * contexts and stay silent in ordinary single-network views.
 */
export function findHiddenPrefixCollisions(
  networks: ReadonlyArray<{ prefix: string | undefined; ids: readonly string[] }>
): Map<string, string[]> {
  const bareIdToPrefixes = new Map<string, Set<string>>();
  for (const network of networks) {
    const prefixKey = network.prefix ?? "";
    for (const id of network.ids) {
      const bare = stripEntityPrefix(id, network.prefix);
      const entry = bareIdToPrefixes.get(bare) ?? new Set<string>();
      entry.add(prefixKey);
      bareIdToPrefixes.set(bare, entry);
    }
  }

  const collisions = new Map<string, string[]>();
  for (const [bare, prefixes] of bareIdToPrefixes) {
    if (prefixes.size > 1) {
      collisions.set(bare, [...prefixes].sort());
    }
  }
  return collisions;
}

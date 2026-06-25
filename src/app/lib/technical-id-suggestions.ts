import type { NodeId } from "../../core/entities";

function toCaseInsensitiveSet(values: Iterable<string>): Set<string> {
  const result = new Set<string>();
  for (const value of values) {
    result.add(value.trim().toUpperCase());
  }
  return result;
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function suggestNextTechnicalId(existingTechnicalIds: Iterable<string>, prefix: string, minimumPadding = 3): string {
  const normalizedPrefix = prefix.trim().toUpperCase();
  const taken = toCaseInsensitiveSet(existingTechnicalIds);
  const matcher = new RegExp(`^${escapeRegex(normalizedPrefix)}-(\\d+)$`, "i");

  let highest = 0;
  let detectedPadding = minimumPadding;
  for (const rawId of taken) {
    const match = rawId.match(matcher);
    if (match === null) {
      continue;
    }

    const numericPart = match[1] ?? "";
    const parsed = Number.parseInt(numericPart, 10);
    if (!Number.isFinite(parsed)) {
      continue;
    }

    highest = Math.max(highest, parsed);
    detectedPadding = Math.max(detectedPadding, numericPart.length);
  }

  let next = Math.max(1, highest + 1);
  while (true) {
    const candidate = `${normalizedPrefix}-${String(next).padStart(detectedPadding, "0")}`;
    if (!taken.has(candidate)) {
      return candidate;
    }
    next += 1;
  }
}

/**
 * Anchors the network entity prefix (e.g. `LAT-`) in front of a type prefix
 * (`C`) so prefixed networks generate IDs like `LAT-C-001` (AC12). Returns the
 * bare type prefix when no network prefix is active.
 */
function withNetworkEntityPrefix(typePrefix: string, networkEntityPrefix?: string): string {
  if (networkEntityPrefix === undefined || networkEntityPrefix.length === 0) {
    return typePrefix;
  }
  const base = networkEntityPrefix.replace(/-+$/, "");
  return base.length === 0 ? typePrefix : `${base}-${typePrefix}`;
}

export function suggestNextConnectorTechnicalId(
  existingTechnicalIds: Iterable<string>,
  networkEntityPrefix?: string
): string {
  return suggestNextTechnicalId(existingTechnicalIds, withNetworkEntityPrefix("C", networkEntityPrefix));
}

export function suggestNextSpliceTechnicalId(
  existingTechnicalIds: Iterable<string>,
  networkEntityPrefix?: string
): string {
  return suggestNextTechnicalId(existingTechnicalIds, withNetworkEntityPrefix("S", networkEntityPrefix));
}

export function suggestNextWireTechnicalId(
  existingTechnicalIds: Iterable<string>,
  networkEntityPrefix?: string
): string {
  return suggestNextTechnicalId(existingTechnicalIds, withNetworkEntityPrefix("W", networkEntityPrefix));
}

export function suggestNextNodeId(existingNodeIds: Iterable<string>, networkEntityPrefix?: string): string {
  return suggestNextTechnicalId(existingNodeIds, withNetworkEntityPrefix("N", networkEntityPrefix));
}

export function suggestNextSegmentId(existingSegmentIds: Iterable<string>, networkEntityPrefix?: string): string {
  return suggestNextTechnicalId(existingSegmentIds, withNetworkEntityPrefix("SEG", networkEntityPrefix));
}

function sanitizeNodeIdToken(value: string): string {
  const token = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return token.length > 0 ? token : "AUTO";
}

function suggestAutoNodeId(existingNodeIds: Iterable<string>, base: string): NodeId {
  const taken = toCaseInsensitiveSet(existingNodeIds);
  let candidate = base.toUpperCase();
  let suffix = 1;
  while (taken.has(candidate)) {
    suffix += 1;
    candidate = `${base.toUpperCase()}-${suffix}`;
  }
  return candidate as NodeId;
}

export function suggestAutoConnectorNodeId(connectorTechnicalId: string, existingNodeIds: Iterable<string>): NodeId {
  return suggestAutoNodeId(existingNodeIds, `N-CONN-${sanitizeNodeIdToken(connectorTechnicalId)}`);
}

export function suggestAutoSpliceNodeId(spliceTechnicalId: string, existingNodeIds: Iterable<string>): NodeId {
  return suggestAutoNodeId(existingNodeIds, `N-SPLICE-${sanitizeNodeIdToken(spliceTechnicalId)}`);
}

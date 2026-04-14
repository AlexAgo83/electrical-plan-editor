import type { Wire } from "./entities";

export const MAX_WIRE_ENDPOINT_REFERENCE_NAME_LENGTH = 120;

function normalizeWireReferenceName(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return undefined;
  }

  return normalized.length > MAX_WIRE_ENDPOINT_REFERENCE_NAME_LENGTH
    ? normalized.slice(0, MAX_WIRE_ENDPOINT_REFERENCE_NAME_LENGTH)
    : normalized;
}

export function normalizeWireEndpointReferenceName(value: unknown): string | undefined {
  return normalizeWireReferenceName(value);
}

export interface WireEndpointReferenceNameLookup {
  connection: Map<string, string>;
  seal: Map<string, string>;
}

export interface WireEndpointReferenceEntry {
  reference: string;
  name?: string;
  quantity: number;
}

export interface WireEndpointReferenceEntries {
  connection: WireEndpointReferenceEntry[];
  seal: WireEndpointReferenceEntry[];
}

function setLookupEntryIfAbsent(map: Map<string, string>, key: string, value: string): void {
  if (!map.has(key)) {
    map.set(key, value);
  }
}

export function buildWireEndpointReferenceNameLookup(wires: Iterable<Wire>): WireEndpointReferenceNameLookup {
  const lookup: WireEndpointReferenceNameLookup = {
    connection: new Map<string, string>(),
    seal: new Map<string, string>()
  };

  for (const wire of wires) {
    const connectionNameA = normalizeWireEndpointReferenceName(wire.endpointAConnectionName);
    const connectionNameB = normalizeWireEndpointReferenceName(wire.endpointBConnectionName);
    const sealNameA = normalizeWireEndpointReferenceName(wire.endpointASealName);
    const sealNameB = normalizeWireEndpointReferenceName(wire.endpointBSealName);

    const connectionReferenceA = wire.endpointAConnectionReference?.trim();
    const connectionReferenceB = wire.endpointBConnectionReference?.trim();
    const sealReferenceA = wire.endpointASealReference?.trim();
    const sealReferenceB = wire.endpointBSealReference?.trim();

    if (connectionReferenceA !== undefined && connectionReferenceA.length > 0 && connectionNameA !== undefined) {
      setLookupEntryIfAbsent(lookup.connection, connectionReferenceA, connectionNameA);
    }
    if (connectionReferenceB !== undefined && connectionReferenceB.length > 0 && connectionNameB !== undefined) {
      setLookupEntryIfAbsent(lookup.connection, connectionReferenceB, connectionNameB);
    }
    if (sealReferenceA !== undefined && sealReferenceA.length > 0 && sealNameA !== undefined) {
      setLookupEntryIfAbsent(lookup.seal, sealReferenceA, sealNameA);
    }
    if (sealReferenceB !== undefined && sealReferenceB.length > 0 && sealNameB !== undefined) {
      setLookupEntryIfAbsent(lookup.seal, sealReferenceB, sealNameB);
    }
  }

  return lookup;
}

export function buildWireEndpointReferenceEntries(wires: Iterable<Wire>): WireEndpointReferenceEntries {
  const connectionEntries = new Map<string, WireEndpointReferenceEntry>();
  const sealEntries = new Map<string, WireEndpointReferenceEntry>();

  const register = (
    map: Map<string, WireEndpointReferenceEntry>,
    reference: string | undefined,
    name: string | undefined
  ): void => {
    const normalizedReference = reference?.trim();
    if (normalizedReference === undefined || normalizedReference.length === 0) {
      return;
    }
    const normalizedName = normalizeWireEndpointReferenceName(name);
    const existing = map.get(normalizedReference);
    if (existing !== undefined) {
      existing.quantity += 1;
      if (existing.name === undefined && normalizedName !== undefined) {
        existing.name = normalizedName;
      }
      return;
    }
    map.set(normalizedReference, {
      reference: normalizedReference,
      name: normalizedName,
      quantity: 1
    });
  };

  for (const wire of wires) {
    register(connectionEntries, wire.endpointAConnectionReference, wire.endpointAConnectionName);
    register(connectionEntries, wire.endpointBConnectionReference, wire.endpointBConnectionName);
    register(sealEntries, wire.endpointASealReference, wire.endpointASealName);
    register(sealEntries, wire.endpointBSealReference, wire.endpointBSealName);
  }

  const sortEntries = (entries: Map<string, WireEndpointReferenceEntry>): WireEndpointReferenceEntry[] =>
    [...entries.values()].sort((left, right) => left.reference.localeCompare(right.reference, undefined, { sensitivity: "base" }));

  return {
    connection: sortEntries(connectionEntries),
    seal: sortEntries(sealEntries)
  };
}

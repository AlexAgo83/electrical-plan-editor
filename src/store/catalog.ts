import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  Splice,
} from "../core/entities";
import type { EntityState, NetworkScopedState } from "./types";

const MAX_MANUFACTURER_REFERENCE_LENGTH = 120;

type LegacySourceKind = "connector" | "splice";

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeManufacturerReference(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    return undefined;
  }
  return normalized.length > MAX_MANUFACTURER_REFERENCE_LENGTH
    ? normalized.slice(0, MAX_MANUFACTURER_REFERENCE_LENGTH)
    : normalized;
}

export function normalizeCatalogName(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length === 0 ? undefined : normalized;
}

export function normalizeCatalogConnectionCount(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  if (!Number.isInteger(value) || value < 1) {
    return undefined;
  }
  return value;
}

export function normalizeCatalogUnitPriceExclTax(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return undefined;
  }
  return value;
}

export function normalizeCatalogUrl(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    return undefined;
  }
  return isAbsoluteHttpUrl(normalized) ? normalized : undefined;
}

export function isValidCatalogUrlInput(value: string): boolean {
  const normalized = value.trim();
  return normalized.length === 0 || isAbsoluteHttpUrl(normalized);
}

export function normalizeCatalogItem(candidate: Partial<CatalogItem>): CatalogItem | null {
  if (typeof candidate.id !== "string" || candidate.id.trim().length === 0) {
    return null;
  }
  const manufacturerReference = normalizeManufacturerReference(candidate.manufacturerReference);
  const connectionCount = normalizeCatalogConnectionCount(candidate.connectionCount);
  if (manufacturerReference === undefined || connectionCount === undefined) {
    return null;
  }

  return {
    id: candidate.id,
    manufacturerReference,
    connectionCount,
    name: normalizeCatalogName(candidate.name),
    unitPriceExclTax: normalizeCatalogUnitPriceExclTax(candidate.unitPriceExclTax),
    url: normalizeCatalogUrl(candidate.url)
  };
}

function stableSlug(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length === 0 ? "item" : slug.slice(0, 48);
}

function buildLegacyNoRefToken(value: string): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized.length === 0 ? "ITEM" : normalized.slice(0, 48);
}

function buildMissingManufacturerReferencePlaceholder(
  kind: LegacySourceKind,
  sourceToken: string,
  connectionCount: number
): string {
  void connectionCount;
  return `LEGACY-NOREF-${kind === "connector" ? "C" : "S"}-${sourceToken}`;
}

function legacySuffix(kind: LegacySourceKind, connectionCount: number): string {
  return ` [legacy-${connectionCount}${kind === "connector" ? "c" : "p"}]`;
}

function legacyNoRefCollisionSuffix(kind: LegacySourceKind, connectionCount: number): string {
  return `-LEGACY-${connectionCount}${kind === "connector" ? "C" : "P"}`;
}

function resolveUniqueManufacturerReference(base: string, taken: Set<string>, preferredSuffix: string): string {
  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }

  let attempt = `${base}${preferredSuffix}`;
  let index = 2;
  while (taken.has(attempt)) {
    attempt = `${base}${preferredSuffix}-${index}`;
    index += 1;
  }
  taken.add(attempt);
  return attempt;
}

function buildStableLegacyCatalogId(
  kind: LegacySourceKind,
  sourceId: string,
  manufacturerReference: string,
  connectionCount: number,
  takenIds: Set<string>
): CatalogItemId {
  const base = `catalog-legacy-${kind}-${stableSlug(manufacturerReference)}-${connectionCount}-${stableSlug(sourceId)}`;
  let candidate = base;
  let index = 2;
  while (takenIds.has(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  takenIds.add(candidate);
  return candidate as CatalogItemId;
}

function cloneEntityState<T, Id extends string>(state: EntityState<T, Id>): EntityState<T, Id> {
  return {
    byId: { ...state.byId },
    allIds: [...state.allIds]
  };
}

function normalizeCatalogCollection(
  catalogItems: NetworkScopedState["catalogItems"]
): NetworkScopedState["catalogItems"] {
  const next = cloneEntityState(catalogItems);
  next.byId = {} as NetworkScopedState["catalogItems"]["byId"];
  next.allIds = [];

  const takenRefs = new Set<string>();
  for (const id of catalogItems.allIds) {
    const rawItem = catalogItems.byId[id];
    const normalized = normalizeCatalogItem(rawItem === undefined ? {} : (rawItem as Partial<CatalogItem>));
    if (normalized === null) {
      continue;
    }
    const uniqueManufacturerReference = resolveUniqueManufacturerReference(
      normalized.manufacturerReference,
      takenRefs,
      " [duplicate]"
    );
    const finalItem =
      uniqueManufacturerReference === normalized.manufacturerReference
        ? normalized
        : { ...normalized, manufacturerReference: uniqueManufacturerReference };
    next.byId[finalItem.id] = finalItem;
    next.allIds.push(finalItem.id);
  }

  next.allIds.sort((left, right) => left.localeCompare(right));
  return next;
}

function findCatalogItemByManufacturerReference(
  catalogItems: NetworkScopedState["catalogItems"],
  manufacturerReference: string
): CatalogItem | undefined {
  for (const id of catalogItems.allIds) {
    const item = catalogItems.byId[id];
    if (item?.manufacturerReference === manufacturerReference) {
      return item;
    }
  }
  return undefined;
}

function syncConnectorFromCatalog(connector: Connector, catalogItem: CatalogItem): Connector {
  return {
    ...connector,
    catalogItemId: catalogItem.id,
    manufacturerReference: catalogItem.manufacturerReference,
    cavityCount: catalogItem.connectionCount
  };
}

function syncSpliceFromCatalog(splice: Splice, catalogItem: CatalogItem): Splice {
  return {
    ...splice,
    catalogItemId: catalogItem.id,
    manufacturerReference: catalogItem.manufacturerReference,
    portCount: catalogItem.connectionCount
  };
}

export function bootstrapCatalogForScopedState(scoped: NetworkScopedState): NetworkScopedState {
  const nextScoped: NetworkScopedState = {
    ...scoped,
    catalogItems: normalizeCatalogCollection(scoped.catalogItems),
    connectors: cloneEntityState(scoped.connectors),
    splices: cloneEntityState(scoped.splices)
  };

  const takenCatalogIds = new Set<string>(nextScoped.catalogItems.allIds);
  const takenRefs = new Set<string>(
    nextScoped.catalogItems.allIds
      .map((id) => nextScoped.catalogItems.byId[id]?.manufacturerReference)
      .filter((value): value is string => typeof value === "string")
  );

  const ensureCatalogItem = (
    sourceKind: LegacySourceKind,
    sourceId: string,
    manufacturerReference: string,
    connectionCount: number
  ): CatalogItem => {
    const exactExisting = findCatalogItemByManufacturerReference(nextScoped.catalogItems, manufacturerReference);
    if (exactExisting !== undefined && exactExisting.connectionCount === connectionCount) {
      return exactExisting;
    }

    if (exactExisting !== undefined && exactExisting.connectionCount !== connectionCount) {
      const preferredSuffix = manufacturerReference.startsWith("LEGACY-NOREF-")
        ? legacyNoRefCollisionSuffix(sourceKind, connectionCount)
        : legacySuffix(sourceKind, connectionCount);
      const uniqueManufacturerReference = resolveUniqueManufacturerReference(
        manufacturerReference,
        takenRefs,
        preferredSuffix
      );
      const id = buildStableLegacyCatalogId(sourceKind, sourceId, uniqueManufacturerReference, connectionCount, takenCatalogIds);
      const item: CatalogItem = {
        id,
        manufacturerReference: uniqueManufacturerReference,
        connectionCount
      };
      nextScoped.catalogItems.byId[id] = item;
      nextScoped.catalogItems.allIds.push(id);
      nextScoped.catalogItems.allIds.sort((left, right) => left.localeCompare(right));
      return item;
    }

    const uniqueManufacturerReference = resolveUniqueManufacturerReference(manufacturerReference, takenRefs, "");
    const id = buildStableLegacyCatalogId(sourceKind, sourceId, uniqueManufacturerReference, connectionCount, takenCatalogIds);
    const item: CatalogItem = {
      id,
      manufacturerReference: uniqueManufacturerReference,
      connectionCount
    };
    nextScoped.catalogItems.byId[id] = item;
    nextScoped.catalogItems.allIds.push(id);
    nextScoped.catalogItems.allIds.sort((left, right) => left.localeCompare(right));
    return item;
  };

  for (const connectorId of nextScoped.connectors.allIds) {
    const connector = nextScoped.connectors.byId[connectorId];
    if (connector === undefined) {
      continue;
    }

    const linkedItem =
      connector.catalogItemId !== undefined ? nextScoped.catalogItems.byId[connector.catalogItemId] : undefined;
    if (linkedItem !== undefined) {
      nextScoped.connectors.byId[connectorId] = syncConnectorFromCatalog(connector, linkedItem);
      continue;
    }

    if (!Number.isInteger(connector.cavityCount) || connector.cavityCount < 1) {
      continue;
    }
    const manufacturerReference =
      normalizeManufacturerReference(connector.manufacturerReference) ??
      buildMissingManufacturerReferencePlaceholder(
        "connector",
        buildLegacyNoRefToken(
          typeof connector.technicalId === "string" && connector.technicalId.trim().length > 0
            ? connector.technicalId
            : connectorId
        ),
        connector.cavityCount
      );

    const item = ensureCatalogItem("connector", connectorId, manufacturerReference, connector.cavityCount);
    nextScoped.connectors.byId[connectorId] = syncConnectorFromCatalog(connector, item);
  }

  for (const spliceId of nextScoped.splices.allIds) {
    const splice = nextScoped.splices.byId[spliceId];
    if (splice === undefined) {
      continue;
    }

    const linkedItem = splice.catalogItemId !== undefined ? nextScoped.catalogItems.byId[splice.catalogItemId] : undefined;
    if (linkedItem !== undefined) {
      nextScoped.splices.byId[spliceId] = syncSpliceFromCatalog(splice, linkedItem);
      continue;
    }

    if (!Number.isInteger(splice.portCount) || splice.portCount < 1) {
      continue;
    }
    const manufacturerReference =
      normalizeManufacturerReference(splice.manufacturerReference) ??
      buildMissingManufacturerReferencePlaceholder(
        "splice",
        buildLegacyNoRefToken(
          typeof splice.technicalId === "string" && splice.technicalId.trim().length > 0 ? splice.technicalId : spliceId
        ),
        splice.portCount
      );

    const item = ensureCatalogItem("splice", spliceId, manufacturerReference, splice.portCount);
    nextScoped.splices.byId[spliceId] = syncSpliceFromCatalog(splice, item);
  }

  return nextScoped;
}

export function getCatalogItemById(
  catalogItems: EntityState<CatalogItem, CatalogItemId>,
  id: CatalogItemId | undefined
): CatalogItem | undefined {
  return id === undefined ? undefined : catalogItems.byId[id];
}

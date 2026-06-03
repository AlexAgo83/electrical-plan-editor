import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  Network,
  Splice,
  Wire
} from "../../../core/entities";
import { computePinElectricalLoad } from "../../../core/pinElectricalLoad";
import { resolveAmpacityA } from "../../../core/wireAmpacity";
import { resolveWireMaterial } from "../../../core/wireSizing";
import type { ValidationIssue } from "../../types/app-controller";

export const ELECTRICAL_DIMENSIONING_CATEGORY = "Electrical dimensioning";

interface AppendElectricalDimensioningIssuesParams {
  connectors: Connector[];
  splices: Splice[];
  wires: Wire[];
  catalogItems: CatalogItem[];
  network: Network | null;
}

export function appendElectricalDimensioningIssues(
  issues: ValidationIssue[],
  params: AppendElectricalDimensioningIssuesParams
): void {
  const { connectors, splices, wires, catalogItems, network } = params;

  const catalogItemsById = new Map<CatalogItemId, CatalogItem>();
  for (const item of catalogItems) {
    catalogItemsById.set(item.id, item);
  }

  const result = computePinElectricalLoad({
    connectors,
    splices,
    wires,
    catalogItemsById
  });

  // D1 — Wire section vs. carried current
  for (const wire of wires) {
    const branch = result.branchLoadByWire.get(wire.id);
    const engineCurrent = branch?.continuousA ?? 0;
    const manualCurrent = typeof wire.currentA === "number" && wire.currentA > 0 ? wire.currentA : 0;
    const effective = Math.max(engineCurrent, manualCurrent);
    if (effective <= 0) {
      continue;
    }
    const material = resolveWireMaterial(wire.material);
    const ampacity = resolveAmpacityA(wire.sectionMm2, material, network ?? undefined);
    if (ampacity === undefined) {
      continue;
    }
    const ratio = effective / ampacity;
    if (ratio > 1.0) {
      issues.push({
        id: `electrical-d1-${wire.id}`,
        severity: "error",
        category: ELECTRICAL_DIMENSIONING_CATEGORY,
        message: `Wire '${wire.name}' carries ${effective.toFixed(1)} A but its ${wire.sectionMm2} mm² ${material} section is rated for ${ampacity} A (ratio ${(ratio * 100).toFixed(0)}%).`,
        subScreen: "wire",
        selectionKind: "wire",
        selectionId: wire.id
      });
    } else if (ratio > 0.9) {
      issues.push({
        id: `electrical-d1-${wire.id}`,
        severity: "warning",
        category: ELECTRICAL_DIMENSIONING_CATEGORY,
        message: `Wire '${wire.name}' carries ${effective.toFixed(1)} A on a ${wire.sectionMm2} mm² ${material} section rated for ${ampacity} A (ratio ${(ratio * 100).toFixed(0)}%).`,
        subScreen: "wire",
        selectionKind: "wire",
        selectionId: wire.id
      });
    } else if (ratio >= 0.8) {
      issues.push({
        id: `electrical-d1-${wire.id}`,
        severity: "warning",
        category: ELECTRICAL_DIMENSIONING_CATEGORY,
        message: `Wire '${wire.name}' carries ${effective.toFixed(1)} A on a ${wire.sectionMm2} mm² ${material} section rated for ${ampacity} A (ratio ${(ratio * 100).toFixed(0)}%) — approaching limit.`,
        subScreen: "wire",
        selectionKind: "wire",
        selectionId: wire.id
      });
    }
  }

  // D2 — Fuse rating vs. downstream load
  // Wire-level fuses
  for (const wire of wires) {
    if (!wire.protection || wire.protection.kind !== "fuse") {
      continue;
    }
    const downstream = result.fuseProtectedLoad.get(`wireFuse:${wire.id}`)?.continuousA ?? 0;
    const fuseCatalog = catalogItemsById.get(wire.protection.catalogItemId);
    const rating = extractFuseRatingA(fuseCatalog);
    if (rating === undefined) {
      if (downstream > 0) {
        issues.push({
          id: `electrical-d2-missing-${wire.id}`,
          severity: "warning",
          category: ELECTRICAL_DIMENSIONING_CATEGORY,
          message: `Wire '${wire.name}' is fuse-protected but the fuse rating is unknown while the downstream load is ${downstream.toFixed(1)} A.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      }
      continue;
    }
    if (downstream > rating) {
      issues.push({
        id: `electrical-d2-${wire.id}`,
        severity: "error",
        category: ELECTRICAL_DIMENSIONING_CATEGORY,
        message: `Fuse on wire '${wire.name}' is rated ${rating} A but downstream load is ${downstream.toFixed(1)} A.`,
        subScreen: "wire",
        selectionKind: "wire",
        selectionId: wire.id
      });
    } else if (downstream > 0 && downstream / rating >= 0.8) {
      issues.push({
        id: `electrical-d2-${wire.id}`,
        severity: "warning",
        category: ELECTRICAL_DIMENSIONING_CATEGORY,
        message: `Fuse on wire '${wire.name}' (${rating} A) is loaded at ${downstream.toFixed(1)} A (${((downstream / rating) * 100).toFixed(0)}%).`,
        subScreen: "wire",
        selectionKind: "wire",
        selectionId: wire.id
      });
    }
  }

  // Fuse-box pairs
  for (const connector of connectors) {
    const catalogItem = connector.catalogItemId ? catalogItemsById.get(connector.catalogItemId) : undefined;
    const pairs = connector.fusePairOverrides ?? catalogItem?.fuseBoxConfig?.pairs ?? [];
    if (pairs.length === 0) {
      continue;
    }
    for (const pair of pairs) {
      const downstream =
        result.fuseProtectedLoad.get(`fuseBoxPair:${connector.id}:${pair.pairIndex}`)?.continuousA ?? 0;
      const rating = connector.fusePairRatings?.[pair.pairIndex];
      if (rating === undefined || rating <= 0) {
        if (downstream > 0) {
          issues.push({
            id: `electrical-d2-fuse-box-missing-${connector.id}-${pair.pairIndex}`,
            severity: "warning",
            category: ELECTRICAL_DIMENSIONING_CATEGORY,
            message: `Fuse-box pair ${pair.pairIndex} on connector '${connector.name}' has no rating but carries ${downstream.toFixed(1)} A.`,
            subScreen: "connector",
            selectionKind: "connector",
            selectionId: connector.id
          });
        }
        continue;
      }
      if (downstream > rating) {
        issues.push({
          id: `electrical-d2-fuse-box-${connector.id}-${pair.pairIndex}`,
          severity: "error",
          category: ELECTRICAL_DIMENSIONING_CATEGORY,
          message: `Fuse-box pair ${pair.pairIndex} on '${connector.name}' is rated ${rating} A but carries ${downstream.toFixed(1)} A.`,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: connector.id
        });
      } else if (downstream > 0 && downstream / rating >= 0.8) {
        issues.push({
          id: `electrical-d2-fuse-box-${connector.id}-${pair.pairIndex}`,
          severity: "warning",
          category: ELECTRICAL_DIMENSIONING_CATEGORY,
          message: `Fuse-box pair ${pair.pairIndex} on '${connector.name}' (${rating} A) is loaded at ${downstream.toFixed(1)} A (${((downstream / rating) * 100).toFixed(0)}%).`,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: connector.id
        });
      }
    }
  }

  // D3 — Device supply pin vs. declared output sum
  for (const [connectorId, balance] of result.deviceBalance) {
    if (balance.supplyPins.length === 0 || balance.totalSourceA === 0) {
      continue;
    }
    if (balance.totalConsumerA === 0) {
      continue; // No declared supply current; nothing to compare.
    }
    if (balance.totalConsumerA < balance.totalSourceA) {
      const connector = connectors.find((c) => c.id === connectorId);
      issues.push({
        id: `electrical-d3-${connectorId}`,
        severity: "warning",
        category: ELECTRICAL_DIMENSIONING_CATEGORY,
        message: `Supply pins on '${connector?.name ?? connectorId}' declared at ${balance.totalConsumerA.toFixed(1)} A are under-rated vs. declared output sum of ${balance.totalSourceA.toFixed(1)} A.`,
        subScreen: "connector",
        selectionKind: "connector",
        selectionId: connectorId
      });
    }
  }

  // D4 — Branch source/consumer coherence
  // For each wire, examine its branch load: consumer pins with no source -> info (warning here),
  // facing sources -> warning.
  for (const wire of wires) {
    const branch = result.branchLoadByWire.get(wire.id);
    if (!branch) {
      // The wire has no engine load — check the endpoints directly for consumer-only branches.
      const endpointConsumers = collectEndpointPins(wire, connectors, catalogItemsById, "consumer");
      const endpointSources = collectEndpointPins(wire, connectors, catalogItemsById, "source");
      if (endpointConsumers.length > 0 && endpointSources.length === 0) {
        issues.push({
          id: `electrical-d4-no-source-${wire.id}`,
          severity: "warning",
          category: ELECTRICAL_DIMENSIONING_CATEGORY,
          message: `Wire '${wire.name}' connects a declared consumer but no declared source is reachable.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      }
      continue;
    }
    if (branch.sourceRefs.length >= 2) {
      issues.push({
        id: `electrical-d4-facing-sources-${wire.id}`,
        severity: "warning",
        category: ELECTRICAL_DIMENSIONING_CATEGORY,
        message: `Wire '${wire.name}' is reached by ${branch.sourceRefs.length} declared sources, suggesting a conflict.`,
        subScreen: "wire",
        selectionKind: "wire",
        selectionId: wire.id
      });
    }
  }
}

function extractFuseRatingA(catalogItem: CatalogItem | undefined): number | undefined {
  if (!catalogItem) {
    return undefined;
  }
  // Best-effort extraction from manufacturer reference (e.g. "F-10A" or "10A").
  const match = /(\d+(?:\.\d+)?)\s*A/i.exec(catalogItem.manufacturerReference);
  if (match && match[1]) {
    const value = Number(match[1]);
    if (Number.isFinite(value) && value > 0) {
      return value;
    }
  }
  return undefined;
}

function collectEndpointPins(
  wire: Wire,
  connectors: Connector[],
  catalogItemsById: Map<CatalogItemId, CatalogItem>,
  targetRole: "source" | "consumer"
): Array<{ connectorId: ConnectorId; cavityIndex: number }> {
  const matches: Array<{ connectorId: ConnectorId; cavityIndex: number }> = [];
  for (const endpoint of [wire.endpointA, wire.endpointB]) {
    if (endpoint.kind !== "connectorCavity") {
      continue;
    }
    const connector = connectors.find((c) => c.id === endpoint.connectorId);
    if (!connector) {
      continue;
    }
    const catalog = connector.catalogItemId ? catalogItemsById.get(connector.catalogItemId) : undefined;
    const override = connector.pinElectricalRoles?.[endpoint.cavityIndex];
    const fallback = catalog?.connectorDefaults?.pinElectricalRoles?.[endpoint.cavityIndex];
    const resolved = override ?? fallback;
    if (resolved && resolved.role === targetRole) {
      matches.push({ connectorId: endpoint.connectorId, cavityIndex: endpoint.cavityIndex });
    }
  }
  return matches;
}

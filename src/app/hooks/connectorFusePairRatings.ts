import type { Connector, FuseBoxPair } from "../../core/entities";

export type ConnectorFusePairRatingDrafts = Record<number, string>;

export type ConnectorFusePairOverrideDrafts = Record<number, { pinA: string; pinB: string }>;

export function getFusePairOverrideDraftError(
  value: { pinA: string; pinB: string },
  cavityCount: number
): string | null {
  for (const raw of [value.pinA, value.pinB]) {
    const normalized = raw.trim();
    if (normalized.length === 0) {
      return "Pin numbers are required.";
    }
    const pin = Number(normalized);
    if (!Number.isInteger(pin) || pin < 1 || pin > cavityCount) {
      return `Pin must be an integer between 1 and ${cavityCount}.`;
    }
  }
  if (value.pinA.trim() === value.pinB.trim()) {
    return "Pin A and pin B must differ.";
  }
  return null;
}

export function hasInvalidFusePairOverrideDraft(
  drafts: ConnectorFusePairOverrideDrafts,
  cavityCount: number
): boolean {
  return Object.values(drafts).some((draft) => getFusePairOverrideDraftError(draft, cavityCount) !== null);
}

export function formatFusePairOverrideDrafts(
  pairs: ReadonlyArray<FuseBoxPair> | undefined
): ConnectorFusePairOverrideDrafts {
  if (pairs === undefined) {
    return {};
  }
  return Object.fromEntries(
    pairs.map((pair) => [pair.pairIndex, { pinA: String(pair.pinA), pinB: String(pair.pinB) }])
  );
}

export function serializeFusePairOverrides(
  drafts: ConnectorFusePairOverrideDrafts,
  catalogPairs: ReadonlyArray<FuseBoxPair> | undefined
): FuseBoxPair[] | undefined {
  if (catalogPairs === undefined || catalogPairs.length === 0) {
    return undefined;
  }
  const pairs: FuseBoxPair[] = catalogPairs.map((catalogPair) => {
    const draft = drafts[catalogPair.pairIndex];
    if (draft === undefined) {
      return { ...catalogPair };
    }
    const pinA = Number(draft.pinA.trim());
    const pinB = Number(draft.pinB.trim());
    if (!Number.isInteger(pinA) || !Number.isInteger(pinB)) {
      return { ...catalogPair };
    }
    return { pairIndex: catalogPair.pairIndex, pinA, pinB };
  });
  const equalsCatalog = pairs.every((pair, index) => {
    const catalogPair = catalogPairs[index];
    return catalogPair !== undefined && pair.pinA === catalogPair.pinA && pair.pinB === catalogPair.pinB;
  });
  return equalsCatalog ? undefined : pairs;
}

export function getFusePairRatingDraftError(value: string): string | null {
  const normalized = value.trim();
  if (normalized.length === 0) {
    return null;
  }

  const rating = Number(normalized);
  if (!Number.isFinite(rating)) {
    return "Enter a numeric rating.";
  }
  if (rating < 0) {
    return "Rating must be 0 A or greater.";
  }
  return null;
}

export function serializeFusePairRatings(
  drafts: ConnectorFusePairRatingDrafts,
  allowedPairIndexes?: ReadonlySet<number>
): NonNullable<Connector["fusePairRatings"]> | undefined {
  const ratings: NonNullable<Connector["fusePairRatings"]> = {};

  for (const [pairIndexText, draft] of Object.entries(drafts)) {
    const pairIndex = Number(pairIndexText);
    if (!Number.isInteger(pairIndex) || (allowedPairIndexes !== undefined && !allowedPairIndexes.has(pairIndex))) {
      continue;
    }

    const normalized = draft.trim();
    if (normalized.length === 0) {
      continue;
    }
    if (getFusePairRatingDraftError(normalized) !== null) {
      continue;
    }

    ratings[pairIndex] = Number(normalized);
  }

  return Object.keys(ratings).length === 0 ? undefined : ratings;
}

export function hasInvalidFusePairRatingDraft(drafts: ConnectorFusePairRatingDrafts): boolean {
  return Object.values(drafts).some((draft) => getFusePairRatingDraftError(draft) !== null);
}

export function formatFusePairRatingDrafts(ratings: Connector["fusePairRatings"]): ConnectorFusePairRatingDrafts {
  if (ratings === undefined) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(ratings)
      .sort(([left], [right]) => Number(left) - Number(right))
      .map(([pairIndex, amps]) => [Number(pairIndex), String(amps)])
  );
}

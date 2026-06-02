import type { Connector } from "../../core/entities";

export type ConnectorFusePairRatingDrafts = Record<number, string>;

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

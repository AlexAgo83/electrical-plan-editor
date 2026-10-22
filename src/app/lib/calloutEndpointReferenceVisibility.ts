import type { CalloutEndpointReferenceVisibility } from "../types/app-controller";

export const DEFAULT_CALLOUT_ENDPOINT_REFERENCE_VISIBILITY: CalloutEndpointReferenceVisibility = Object.freeze({
  localConnection: false,
  localSeal: false,
  oppositeConnection: false,
  oppositeSeal: false
});

/** Missing, legacy or malformed flags default to hidden so existing plans keep their appearance. */
export function normalizeCalloutEndpointReferenceVisibility(value: unknown): CalloutEndpointReferenceVisibility {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_CALLOUT_ENDPOINT_REFERENCE_VISIBILITY;
  }
  const candidate = value as Record<string, unknown>;
  return {
    localConnection: candidate.localConnection === true,
    localSeal: candidate.localSeal === true,
    oppositeConnection: candidate.oppositeConnection === true,
    oppositeSeal: candidate.oppositeSeal === true
  };
}

/**
 * Single tested configuration for portable package limits. Limits are enforced on actual decoded
 * bytes, not only on declared ZIP metadata. Documented in docs/workspace-lineages.md.
 */
export const LINEAGE_LIMITS = {
  maxEntries: 10_000,
  maxTotalUncompressedBytes: 500 * 1024 * 1024,
  maxAttachmentBytes: 100 * 1024 * 1024,
  maxCompressionRatio: 100
} as const;

export type LineageLimits = { -readonly [Key in keyof typeof LINEAGE_LIMITS]: number };

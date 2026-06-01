import type { Connector } from "../../core/entities";

export function parseFusePairRatings(text: string): NonNullable<Connector["fusePairRatings"]> | undefined {
  const entries = text
    .split(/\r?\n/)
    .flatMap((line) => {
      const [pairStr = "", ampsStr = ""] = line.trim().split(",").map((p) => p.trim());
      const pairIndex = Number(pairStr);
      const amps = Number(ampsStr);
      return pairStr.length > 0 && ampsStr.length > 0 && Number.isFinite(pairIndex) && Number.isFinite(amps)
        ? [[pairIndex, amps] as const]
        : [];
    });
  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries);
}

export function formatFusePairRatings(ratings: Connector["fusePairRatings"]): string {
  if (ratings === undefined) return "";
  return Object.entries(ratings)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([pairIndex, amps]) => `${pairIndex},${amps}`)
    .join("\n");
}

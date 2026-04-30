import type { Splice } from "./entities";

export type SplicePortMode = "bounded" | "unbounded" | "directional";

export const DEFAULT_SPLICE_PORT_MODE: SplicePortMode = "bounded";
export const DEFAULT_NEW_SPLICE_PORT_MODE: SplicePortMode = "bounded";
export const DEFAULT_UNBOUNDED_FREE_PORT_BUFFER = 2;
export const DIRECTIONAL_SPLICE_PORT_COUNT = 2;

export function normalizeSplicePortMode(value: unknown): SplicePortMode {
  if (value === "unbounded" || value === "directional") {
    return value;
  }
  return "bounded";
}

export function resolveSplicePortMode(splice: Pick<Splice, "portMode">): SplicePortMode {
  return normalizeSplicePortMode(splice.portMode);
}

export function isSplicePortIndexValid(
  splice: Pick<Splice, "portMode" | "portCount">,
  portIndex: number
): boolean {
  if (!Number.isInteger(portIndex) || portIndex < 1) {
    return false;
  }

  const portMode = resolveSplicePortMode(splice);
  if (portMode === "unbounded") {
    return true;
  }
  if (portMode === "directional") {
    return portIndex === 1 || portIndex === 2;
  }

  return portIndex <= splice.portCount;
}

export function normalizeUnboundedPortCountFallback(value: number | undefined): number {
  if (!Number.isInteger(value) || value === undefined || value < 1) {
    return 1;
  }
  return value;
}

import type { Splice } from "./entities";

export type SplicePortMode = "bounded" | "unbounded";

export const DEFAULT_SPLICE_PORT_MODE: SplicePortMode = "bounded";
export const DEFAULT_UNBOUNDED_FREE_PORT_BUFFER = 2;

export function normalizeSplicePortMode(value: unknown): SplicePortMode {
  return value === "unbounded" ? "unbounded" : "bounded";
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

  if (resolveSplicePortMode(splice) === "unbounded") {
    return true;
  }

  return portIndex <= splice.portCount;
}

export function normalizeUnboundedPortCountFallback(value: number | undefined): number {
  if (!Number.isInteger(value) || value === undefined || value < 1) {
    return 1;
  }
  return value;
}

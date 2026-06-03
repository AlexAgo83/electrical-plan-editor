import type { Connector } from "../../core/entities";

export interface ParsedConnectorTerminalOverride {
  cavityIndex: number;
  material: NonNullable<Connector["terminalOverrides"]>[number];
}

export type ParseConnectorTerminalOverridesResult =
  | {
      ok: true;
      terminalOverrides: Connector["terminalOverrides"];
    }
  | {
      ok: false;
      message: string;
    };

export function parseConnectorTerminalOverridesDraft(
  text: string,
  cavityCount: number
): ParseConnectorTerminalOverridesResult {
  const terminalOverrides = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [cavityIndexText = "", terminalReference = "", sealReference = "", terminalName = "", sealName = ""] = line
        .split(",")
        .map((part) => part.trim());
      const cavityIndex = Number(cavityIndexText);
      return {
        cavityIndex,
        material: {
          terminalReference: terminalReference || undefined,
          terminalName: terminalName || undefined,
          sealReference: sealReference || undefined,
          sealName: sealName || undefined
        }
      };
    });

  if (
    terminalOverrides.some(
      (override) =>
        !Number.isInteger(override.cavityIndex) ||
        override.cavityIndex < 1 ||
        override.cavityIndex > cavityCount ||
        (override.material.terminalReference === undefined && override.material.sealReference === undefined)
    )
  ) {
    return {
      ok: false,
      message: "Terminal overrides must use one line per override: cavity,terminal,seal,terminal name,seal name."
    };
  }

  return {
    ok: true,
    terminalOverrides:
      terminalOverrides.length === 0
        ? undefined
        : terminalOverrides.reduce<NonNullable<Connector["terminalOverrides"]>>((overrides, override) => {
            overrides[override.cavityIndex] = override.material;
            return overrides;
          }, {})
  };
}

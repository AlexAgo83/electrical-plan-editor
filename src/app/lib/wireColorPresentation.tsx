import type { CSSProperties, ReactElement } from "react";
import { CABLE_COLOR_BY_ID, getWireColorCode, getWireColorLabel, isWireFreeColorMode } from "../../core/cableColors";
import type { Wire } from "../../core/entities";

const circleStyleBase: CSSProperties = {
  width: "0.7rem",
  height: "0.7rem",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.25)"
};

const neutralBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "2rem",
  padding: "0.05rem 0.35rem",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.25)",
  fontSize: "0.75rem",
  lineHeight: 1.2
};

export function getWireColorCsvValue(wire: Pick<Wire, "primaryColorId" | "secondaryColorId" | "freeColorLabel">): string {
  if (isWireFreeColorMode(wire)) {
    return getWireColorLabel(wire);
  }
  if (wire.primaryColorId === null) {
    return "No color";
  }
  return getWireColorCode(wire);
}

export function renderWireColorCellValue(
  wire: Pick<Wire, "primaryColorId" | "secondaryColorId" | "freeColorLabel">
): ReactElement {
  if (isWireFreeColorMode(wire)) {
    const colorLabel = getWireColorLabel(wire);
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }} title={colorLabel}>
        <span aria-hidden="true" style={neutralBadgeStyle}>Free</span>
        <span>{colorLabel.replace(/^Free:\s*/, "")}</span>
      </span>
    );
  }

  if (wire.primaryColorId === null) {
    return <span className="meta-line">No color</span>;
  }

  const primary = CABLE_COLOR_BY_ID[wire.primaryColorId];
  const secondary = wire.secondaryColorId === null ? null : CABLE_COLOR_BY_ID[wire.secondaryColorId];
  const colorCode = getWireColorCode(wire);
  const colorLabel = getWireColorLabel(wire);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }} title={colorLabel}>
      <span aria-hidden="true" style={{ ...circleStyleBase, background: primary?.hex ?? "#7a7a7a" }} />
      {wire.secondaryColorId !== null ? (
        <span aria-hidden="true" style={{ ...circleStyleBase, background: secondary?.hex ?? "#7a7a7a" }} />
      ) : null}
      <span className="technical-id">{colorCode}</span>
    </span>
  );
}

export function renderWireColorPrefixMarker(
  wire: Pick<Wire, "primaryColorId" | "secondaryColorId" | "freeColorLabel"> | null | undefined
): ReactElement | null {
  if (wire === null || wire === undefined) {
    return null;
  }
  if (isWireFreeColorMode(wire)) {
    return (
      <span aria-hidden="true" title={getWireColorLabel(wire)} style={neutralBadgeStyle}>
        Free
      </span>
    );
  }
  if (wire.primaryColorId === null) {
    return null;
  }
  const primary = CABLE_COLOR_BY_ID[wire.primaryColorId];
  const secondary = wire.secondaryColorId === null ? null : CABLE_COLOR_BY_ID[wire.secondaryColorId];
  return (
    <>
      <span aria-hidden="true" title={getWireColorLabel(wire)} style={{ ...circleStyleBase, background: primary?.hex ?? "#7a7a7a" }} />
      {secondary !== null ? (
        <span aria-hidden="true" title={getWireColorLabel(wire)} style={{ ...circleStyleBase, background: secondary?.hex ?? "#7a7a7a" }} />
      ) : null}
    </>
  );
}

import { translateCurrent as t } from "./i18n";
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

type WireColorPresentationWire = Pick<Wire, "colorMode" | "primaryColorId" | "secondaryColorId" | "freeColorLabel">;

export function getWireColorCsvValue(wire: WireColorPresentationWire): string {
  if (isWireFreeColorMode(wire)) {
    return wire.freeColorLabel === null ? "" : getWireColorLabel(wire);
  }
  if (wire.primaryColorId === null) {
    return "";
  }
  return getWireColorCode(wire);
}

function getFreeColorCellText(wire: WireColorPresentationWire): string {
  const colorLabel = getWireColorLabel(wire);
  if (colorLabel === "Free color (unspecified)") {
    return "Unspecified";
  }
  return colorLabel.replace(/^Free:\s*/, "");
}

export function renderWireColorCellValue(
  wire: WireColorPresentationWire
): ReactElement {
  if (isWireFreeColorMode(wire)) {
    const colorLabel = getWireColorLabel(wire);
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }} title={colorLabel}>
        <span aria-hidden="true" style={neutralBadgeStyle}>{t("ui.free")}</span>
        {wire.freeColorLabel !== null ? <span>{getFreeColorCellText(wire)}</span> : null}
      </span>
    );
  }

  if (wire.primaryColorId === null) {
    return <></>;
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
  wire: WireColorPresentationWire | null | undefined
): ReactElement | null {
  if (wire === null || wire === undefined) {
    return null;
  }
  if (isWireFreeColorMode(wire)) {
    if (wire.freeColorLabel === null) {
      return null;
    }
    return (
      <span aria-hidden="true" title={getWireColorLabel(wire)} style={neutralBadgeStyle}>
        
        {t("ui.free")}
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

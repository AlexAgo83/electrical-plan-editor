import { afterEach, describe, expect, it } from "vitest";
import {
  buildCalloutLayoutMetrics,
  CALLOUT_MISSING_REFERENCE_PLACEHOLDER,
  disposeCalloutMeasurementResources,
  wrapCalloutCellText,
  type CalloutEntry,
  type CalloutGroup
} from "../app/components/network-summary/callouts/calloutLayout";
import { normalizeCalloutEndpointReferenceVisibility } from "../app/lib/calloutEndpointReferenceVisibility";
import { getSettingsSections, normalizeSettingsSearch, settingsLabelMatches } from "../app/components/settings/settingsSearchModel";
import { setActiveLocale } from "../app/lib/i18n";
import type { CalloutEndpointReferenceVisibility } from "../app/types/app-controller";

const ALL_OFF: CalloutEndpointReferenceVisibility = {
  localConnection: false,
  localSeal: false,
  oppositeConnection: false,
  oppositeSeal: false
};
const ALL_ON: CalloutEndpointReferenceVisibility = {
  localConnection: true,
  localSeal: true,
  oppositeConnection: true,
  oppositeSeal: true
};

function entry(overrides: Partial<CalloutEntry> = {}): CalloutEntry {
  return {
    wireId: "W1",
    name: "Wire 1",
    technicalId: "W-1",
    color: "",
    colorPrimaryHex: null,
    colorSecondaryHex: null,
    targetId: "C-2",
    targetPin: "3",
    lengthMm: 100,
    sectionMm2: 0.5,
    localEndpointSide: "A",
    localConnectionReference: "A-CONN",
    localSealReference: "A-SEAL",
    oppositeConnectionReference: "B-CONN",
    oppositeSealReference: null,
    ...overrides
  };
}

function groups(entries: CalloutEntry[]): CalloutGroup[] {
  return [{ key: "connector:C1:C1", label: "1", cavityIndex: 1, entries }];
}

function layout(entries: CalloutEntry[], flags: CalloutEndpointReferenceVisibility, locale: "en" | "fr" = "en") {
  setActiveLocale(locale);
  return buildCalloutLayoutMetrics("C-1", "", groups(entries), "normal", false, false, 1, 1.35, flags, locale);
}

afterEach(() => {
  setActiveLocale("en");
  disposeCalloutMeasurementResources();
});

describe("callout endpoint reference columns", () => {
  it("keeps the existing columns when every reference flag is off", () => {
    expect(layout([entry()], ALL_OFF).columns.map((column) => column.key)).toEqual([
      "pin",
      "technicalId",
      "color",
      "targetId",
      "targetPin",
      "length",
      "section"
    ]);
  });

  it("places local columns beside the pin and opposite columns beside End ID/PIN", () => {
    expect(layout([entry()], ALL_ON).columns.map((column) => [column.key, column.header])).toEqual([
      ["pin", "Pin"],
      ["localConnection", "Local contact"],
      ["localSeal", "Local seal"],
      ["technicalId", "Wire ID"],
      ["color", "Color"],
      ["targetId", "End ID"],
      ["targetPin", "PIN"],
      ["oppositeConnection", "Opp. contact"],
      ["oppositeSeal", "Opp. seal"],
      ["length", "Length"],
      ["section", "Section"]
    ]);
  });

  it.each([
    ["local only", { ...ALL_OFF, localConnection: true, localSeal: true }, ["localConnection", "localSeal"]],
    ["opposite only", { ...ALL_OFF, oppositeConnection: true, oppositeSeal: true }, ["oppositeConnection", "oppositeSeal"]],
    ["connections both sides", { ...ALL_OFF, localConnection: true, oppositeConnection: true }, ["localConnection", "oppositeConnection"]],
    ["seal this side", { ...ALL_OFF, localSeal: true }, ["localSeal"]]
  ])("shows only the enabled reference columns (%s)", (_label, flags, expected) => {
    const keys = layout([entry()], flags).columns.map((column) => column.key);
    expect(keys.filter((key) => /Connection|Seal/.test(key))).toEqual(expected);
  });

  it("renders distinct row values and an em dash for a missing reference without borrowing the other side", () => {
    const [row] = layout([entry()], ALL_ON).rows;
    expect(row).toMatchObject({
      localConnection: "A-CONN",
      localSeal: "A-SEAL",
      oppositeConnection: "B-CONN",
      oppositeSeal: CALLOUT_MISSING_REFERENCE_PLACEHOLDER
    });
  });

  it("does not overlap columns and keeps headers inside their measured width", () => {
    const { columns } = layout([entry()], ALL_ON);
    for (let index = 1; index < columns.length; index += 1) {
      const previous = columns[index - 1]!;
      expect(columns[index]!.x).toBeGreaterThanOrEqual(previous.x + previous.width);
    }
  });

  it("wraps long references with measured row height instead of truncating them", () => {
    const longReference = "TERMINAL-0123456789-ABCDEFGHIJ-KLMNOPQRST-UVWXYZ";
    const short = layout([entry()], ALL_ON);
    const wrapped = layout([entry({ localConnectionReference: longReference }), entry({ wireId: "W2", technicalId: "W-2" })], ALL_ON);

    const lines = wrapped.rowLayouts[0]?.wrappedCells.localConnection ?? [];
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join("")).toBe(longReference);
    expect(wrapped.rowLayouts[0]!.height).toBeGreaterThan(wrapped.rowHeight);
    expect(wrapped.rowLayouts[1]!.offsetY).toBeGreaterThanOrEqual(wrapped.rowLayouts[0]!.height);
    expect(wrapped.height).toBeGreaterThan(short.height + wrapped.rowStep);
    expect(wrapped.width).toBeLessThanOrEqual(520);
  });

  it("keeps unwrapped rows on the historical row step", () => {
    const metrics = layout([entry(), entry({ wireId: "W2" }), entry({ wireId: "W3" })], ALL_OFF);
    expect(metrics.rowLayouts.map((row) => row.offsetY)).toEqual([0, metrics.rowStep, metrics.rowStep * 2]);
  });

  it("breaks a single unbroken token and prefers separators otherwise", () => {
    expect(wrapCalloutCellText("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", 30, 6.3).join("")).toBe(
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    );
    expect(wrapCalloutCellText("ABCD-EFGH-IJKL-MNOP-QRST", 30, 6.3)[0]?.endsWith("-")).toBe(true);
    expect(wrapCalloutCellText("SHORT", 30, 6.3)).toEqual(["SHORT"]);
  });

  it("invalidates the cached layout when flags, reference values or locale change", () => {
    const base = layout([entry()], ALL_ON);
    expect(layout([entry()], ALL_ON)).toBe(base);
    expect(layout([entry()], { ...ALL_ON, oppositeSeal: false })).not.toBe(base);
    expect(layout([entry({ localConnectionReference: "A-CONN-2" })], ALL_ON).rows[0]?.localConnection).toBe("A-CONN-2");
    const french = layout([entry()], ALL_ON, "fr");
    expect(french).not.toBe(base);
    expect(french.columns.map((column) => column.header)).toEqual(
      expect.arrayContaining(["Contact local", "Joint local", "Contact opp.", "Joint opp."])
    );
  });
});

describe("callout endpoint reference preferences", () => {
  it("defaults missing or malformed flags to false", () => {
    expect(normalizeCalloutEndpointReferenceVisibility(undefined)).toEqual(ALL_OFF);
    expect(normalizeCalloutEndpointReferenceVisibility("yes")).toEqual(ALL_OFF);
    expect(normalizeCalloutEndpointReferenceVisibility({ localConnection: "true", localSeal: 1, oppositeSeal: true })).toEqual({
      ...ALL_OFF,
      oppositeSeal: true
    });
  });

  it.each([
    ["en", ["connection", "contact", "seal", "local", "opposite"]],
    ["fr", ["connexion", "contact", "joint", "local", "opposé"]]
  ] as const)("is findable in %s Settings search by connection, seal and side terms", (locale, terms) => {
    setActiveLocale(locale);
    const labels = getSettingsSections().find((section) => section.id === "settings-canvas-tools")?.labels ?? [];
    for (const term of terms) {
      const query = normalizeSettingsSearch(term);
      expect(labels.filter((label) => settingsLabelMatches(label, query)).length, term).toBeGreaterThan(0);
    }
  });
});

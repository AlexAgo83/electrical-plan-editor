import { describe, expect, it } from "vitest";
import { buildCalloutHeaderDisplay } from "../app/components/network-summary/callouts/calloutLayout";

describe("buildCalloutHeaderDisplay", () => {
  it("AC1: strips a raw prefixed technical ID embedded in the name", () => {
    // name carries the raw, un-stripped ID; technicalId is the prefix-stripped display form
    const header = buildCalloutHeaderDisplay("AV-EP-01 Epissure Masse", "EP-01", "AV-EP-01");
    expect(header.title).toBe("EP-01 · Epissure Masse");
  });

  it("AC2: strips the already prefix-stripped ID embedded in the name", () => {
    const header = buildCalloutHeaderDisplay("EP-01 Epissure Masse", "EP-01", "AV-EP-01");
    expect(header.title).toBe("EP-01 · Epissure Masse");
  });

  it("AC3: leaves a name without an embedded ID untouched", () => {
    const header = buildCalloutHeaderDisplay("Epissure Masse", "EP-01", "AV-EP-01");
    expect(header.title).toBe("EP-01 · Epissure Masse");
  });

  it("AC5: shows the ID only when the name equals the raw ID exactly", () => {
    const header = buildCalloutHeaderDisplay("AV-EP-01", "EP-01", "AV-EP-01");
    expect(header.title).toBe("EP-01");
  });

  it("AC5: shows the ID only when the name equals the stripped ID exactly", () => {
    const header = buildCalloutHeaderDisplay("EP-01", "EP-01", "AV-EP-01");
    expect(header.title).toBe("EP-01");
  });

  it("AC5: keeps the original name when stripping would leave it empty", () => {
    const header = buildCalloutHeaderDisplay("AV-EP-01 -", "EP-01", "AV-EP-01");
    expect(header.title).toBe("EP-01 · AV-EP-01 -");
  });

  it("accepts varied separators between the ID and the label", () => {
    expect(buildCalloutHeaderDisplay("AV-EP-01: Masse", "EP-01", "AV-EP-01").title).toBe(
      "EP-01 · Masse",
    );
    expect(buildCalloutHeaderDisplay("AV-EP-01_Masse", "EP-01", "AV-EP-01").title).toBe(
      "EP-01 · Masse",
    );
    expect(buildCalloutHeaderDisplay("AV-EP-01 · Masse", "EP-01", "AV-EP-01").title).toBe(
      "EP-01 · Masse",
    );
  });

  it("does not strip when the leading token only resembles the ID without a separator", () => {
    // "EP-010" must not be truncated by the "EP-01" candidate
    const header = buildCalloutHeaderDisplay("EP-010 Masse", "EP-01", "AV-EP-01");
    expect(header.title).toBe("EP-01 · EP-010 Masse");
  });

  it("falls back to (unnamed) when both the name and the technical ID are empty", () => {
    const header = buildCalloutHeaderDisplay("", "", "");
    expect(header.title).toBe("(unnamed)");
  });

  it("remains backward compatible without a raw technical ID argument", () => {
    expect(buildCalloutHeaderDisplay("EP-01 Masse", "EP-01").title).toBe("EP-01 · Masse");
    expect(buildCalloutHeaderDisplay("Masse", "EP-01").title).toBe("EP-01 · Masse");
  });
});

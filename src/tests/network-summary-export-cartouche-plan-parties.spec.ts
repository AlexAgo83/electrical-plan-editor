import { afterEach, describe, expect, it } from "vitest";
import type { NetworkPlanParties } from "../core/networkMetadata";
import {
  applyExportDecorations,
  formatCartouchePlanPartyRow,
  type ExportDecorationsResult
} from "../app/components/network-summary/export/networkSummaryExport";
import { setActiveLocale } from "../app/lib/i18n";

const SVG_NS = "http://www.w3.org/2000/svg";

const BOTH_ROLES: NetworkPlanParties = {
  planManufacturerName: "Manufacturer A",
  planManufacturerReference: "MFG-001",
  planSupplierName: "Supplier B",
  planSupplierReference: "SUP-009"
};

async function renderCartouche(params: {
  planParties?: NetworkPlanParties;
  includeCartouche?: boolean;
  width?: number;
  height?: number;
  notes?: string;
}): Promise<{ cloneSvg: SVGSVGElement; rows: string[]; result: ExportDecorationsResult }> {
  const sourceSvg = document.createElementNS(SVG_NS, "svg");
  const cloneSvg = document.createElementNS(SVG_NS, "svg");
  const width = params.width ?? 1200;
  const height = params.height ?? 800;
  cloneSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  document.body.appendChild(sourceSvg);
  const result = await applyExportDecorations({
    sourceSvg,
    cloneSvg,
    width,
    height,
    includeFrame: true,
    includeCartouche: params.includeCartouche ?? true,
    cartoucheNetworkName: "Body harness",
    cartouchePlanRevision: "B02",
    cartoucheCreatedAt: "2026-01-10T12:00:00.000Z",
    cartouchePlanParties: params.planParties,
    cartoucheNotes: params.notes
  });
  sourceSvg.remove();
  const rows = Array.from(cloneSvg.querySelectorAll(".network-export-cartouche-meta")).map((row) => row.textContent ?? "");
  return { cloneSvg, rows, result };
}

describe("export cartouche manufacturer and supplier rows", () => {
  afterEach(() => {
    setActiveLocale("en");
  });

  it("renders both roles after plan issue rows, manufacturer before supplier", async () => {
    const { rows } = await renderCartouche({ planParties: BOTH_ROLES });
    const manufacturerIndex = rows.indexOf("Manufacturer (Manufacturer A): MFG-001");
    const supplierIndex = rows.indexOf("Supplier (Supplier B): SUP-009");
    expect(manufacturerIndex).toBeGreaterThan(rows.indexOf("Revision: B02"));
    expect(supplierIndex).toBeGreaterThan(manufacturerIndex);
    expect(rows.at(-1)?.startsWith("Created: ")).toBe(true);
  });

  it("localizes role labels in French while keeping names and references literal", async () => {
    setActiveLocale("fr");
    const { rows } = await renderCartouche({ planParties: BOTH_ROLES });
    expect(rows).toContain("Fabricant (Manufacturer A) : MFG-001");
    expect(rows).toContain("Fournisseur (Supplier B) : SUP-009");
  });

  it("formats every partial and empty combination without dangling separators", async () => {
    expect(formatCartouchePlanPartyRow("Manufacturer", undefined, "MFG-001")).toBe("Manufacturer: MFG-001");
    expect(formatCartouchePlanPartyRow("Supplier", "Supplier B", undefined)).toBe("Supplier (Supplier B)");
    expect(formatCartouchePlanPartyRow("Supplier", undefined, undefined)).toBeNull();

    const { rows } = await renderCartouche({
      planParties: { planManufacturerReference: "000123", planSupplierName: "  ", planSupplierReference: undefined }
    });
    expect(rows).toContain("Manufacturer: 000123");
    expect(rows.some((row) => row.startsWith("Supplier"))).toBe(false);

    const empty = await renderCartouche({ planParties: {} });
    expect(empty.rows.some((row) => row.startsWith("Manufacturer") || row.startsWith("Supplier"))).toBe(false);
  });

  it("emits no rows when the cartouche is disabled", async () => {
    const { cloneSvg, rows, result } = await renderCartouche({ planParties: BOTH_ROLES, includeCartouche: false, height: 120 });
    expect(rows).toEqual([]);
    expect(cloneSvg.textContent).not.toContain("MFG-001");
    expect(result.height).toBe(120);
  });

  it("wraps long unbroken codes and keeps notes below the rows, growing export bounds when needed", async () => {
    const longCode = "X".repeat(120);
    const longName = "N".repeat(80);
    const { cloneSvg, rows, result } = await renderCartouche({
      planParties: { ...BOTH_ROLES, planManufacturerName: longName, planManufacturerReference: longCode },
      width: 260,
      height: 120,
      notes: "Prototype notes"
    });
    const manufacturerRow = Array.from(cloneSvg.querySelectorAll(".network-export-cartouche-meta")).find((row) =>
      row.textContent?.startsWith("Manufacturer")
    );
    const lineSpans = Array.from(manufacturerRow?.querySelectorAll("tspan") ?? []);
    expect(lineSpans.length).toBeGreaterThan(1);
    // No characters are lost or ellipsized when the row wraps.
    expect(lineSpans.map((span) => span.textContent).join("").replace(/\s/g, "")).toBe(
      `Manufacturer(${longName}):${longCode}`
    );
    expect(rows.map((row) => row.replace(/\s/g, ""))).toContain("Supplier(SupplierB):SUP-009");

    const frame = cloneSvg.querySelector(".network-export-cartouche-frame");
    const frameBottom = Number(frame?.getAttribute("y")) + Number(frame?.getAttribute("height"));
    expect(result.height).toBeGreaterThan(120);
    expect(frameBottom).toBeLessThanOrEqual(result.height);
    expect(cloneSvg.getAttribute("height")).toBe(String(result.height));
    expect(cloneSvg.getAttribute("viewBox")).toBe(`0 0 260 ${result.height}`);

    const metaRows = Array.from(cloneSvg.querySelectorAll(".network-export-cartouche-meta"));
    const lastRowY = Number(metaRows.at(-1)?.getAttribute("y"));
    const lastRowLines = Math.max(1, metaRows.at(-1)?.querySelectorAll("tspan").length ?? 1);
    const notesLabelY = Number(cloneSvg.querySelector(".network-export-cartouche-notes-label")?.getAttribute("y"));
    expect(notesLabelY).toBeGreaterThan(lastRowY + (lastRowLines - 1) * 14);
  });

  it("keeps XML-sensitive and non-Latin text literal and safely serialized", async () => {
    const { cloneSvg, rows } = await renderCartouche({
      planParties: { planManufacturerName: "A&B <Ltd>", planManufacturerReference: "\"R'1\"", planSupplierName: "供应商 Ω" }
    });
    expect(rows).toContain("Manufacturer (A&B <Ltd>): \"R'1\"");
    expect(rows).toContain("Supplier (供应商 Ω)");
    const markup = new XMLSerializer().serializeToString(cloneSvg);
    expect(markup).toContain("A&amp;B &lt;Ltd&gt;");
    expect(markup).not.toContain("<Ltd>");
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { applyExportDecorations } from "../app/components/network-summary/export/networkSummaryExport";
import { setActiveLocale } from "../app/lib/i18n";

const SVG_NS = "http://www.w3.org/2000/svg";

function createSvgPair(): { sourceSvg: SVGSVGElement; cloneSvg: SVGSVGElement } {
  const sourceSvg = document.createElementNS(SVG_NS, "svg");
  const cloneSvg = document.createElementNS(SVG_NS, "svg");
  document.body.appendChild(sourceSvg);
  return { sourceSvg, cloneSvg };
}

async function renderCartoucheRows(params: {
  includeCartouche?: boolean;
  planRevision?: string;
  planIssueDate?: string;
  width?: number;
}): Promise<string[]> {
  const { sourceSvg, cloneSvg } = createSvgPair();
  await applyExportDecorations({
    sourceSvg,
    cloneSvg,
    width: params.width ?? 1200,
    height: 800,
    includeFrame: false,
    includeCartouche: params.includeCartouche ?? true,
    cartoucheNetworkName: "Body harness",
    cartoucheCreatedAt: "2026-01-10T12:00:00.000Z",
    cartouchePlanRevision: params.planRevision,
    cartouchePlanIssueDate: params.planIssueDate
  });
  sourceSvg.remove();
  return Array.from(cloneSvg.querySelectorAll(".network-export-cartouche-meta")).map((row) => row.textContent ?? "");
}

describe("export cartouche plan issue rows", () => {
  afterEach(() => {
    setActiveLocale("en");
  });

  it("renders revision and issue date distinct from the creation date", async () => {
    const rows = await renderCartoucheRows({ planRevision: "B02", planIssueDate: "2026-10-22" });
    expect(rows).toContain("Revision: B02");
    expect(rows).toContain("Issue date: 2026-10-22");
    expect(rows.some((row) => row.startsWith("Created: 2026-01-1"))).toBe(true);
  });

  it("keeps the issue date verbatim regardless of timezone edges", async () => {
    const rows = await renderCartoucheRows({ planIssueDate: "2026-01-01" });
    expect(rows).toContain("Issue date: 2026-01-01");
  });

  it("omits unset plan issue values like other optional cartouche metadata", async () => {
    const rows = await renderCartoucheRows({});
    expect(rows.some((row) => row.startsWith("Revision"))).toBe(false);
    expect(rows.some((row) => row.startsWith("Issue date"))).toBe(false);
  });

  it("localizes the rows in French", async () => {
    setActiveLocale("fr");
    const rows = await renderCartoucheRows({ planRevision: "03", planIssueDate: "2026-10-22" });
    expect(rows).toContain("Indice : 03");
    expect(rows).toContain("Date de diffusion : 2026-10-22");
  });

  it("keeps long revisions readable in narrow exports and respects a disabled cartouche", async () => {
    const narrowRows = await renderCartoucheRows({ planRevision: "R".repeat(40), planIssueDate: "2026-10-22", width: 240 });
    const revisionRow = narrowRows.find((row) => row.startsWith("Revision: R")) ?? "";
    // Overflowing rows follow the existing cartouche convention: single-line ellipsis, never overlap.
    expect(revisionRow === `Revision: ${"R".repeat(40)}` || revisionRow.endsWith("...")).toBe(true);
    expect(narrowRows.some((row) => row.startsWith("Issue date"))).toBe(true);

    const wideRows = await renderCartoucheRows({ planRevision: "R".repeat(40), planIssueDate: "2026-10-22", width: 1600 });
    expect(wideRows).toContain(`Revision: ${"R".repeat(40)}`);

    const disabledRows = await renderCartoucheRows({ includeCartouche: false, planRevision: "A" });
    expect(disabledRows).toEqual([]);
  });
});

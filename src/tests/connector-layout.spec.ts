import { describe, expect, it } from "vitest";
import {
  createDefaultConnectorLayout,
  getConnectorLayoutCellPadding,
  getConnectorLayoutDuplicatePositions,
  getConnectorLayoutKeyingPosition,
  getConnectorLayoutKeyingAnchor,
  getConnectorLayoutKeyings,
  getConnectorLayoutKeyingSide,
  getConnectorLayoutShellCornerRadius,
  getConnectorLayoutShellPadding,
  getConnectorLayoutShellStrokeWidth,
  getConnectorLayoutShellShape,
  getConnectorLayoutWayDisplayLabel,
  addConnectorLayoutKeying,
  moveConnectorLayoutWay,
  moveConnectorLayoutWayIfFree,
  normalizeConnectorLayout,
  removeConnectorLayoutKeying,
  resolveEditedConnectorLayout,
  resolveConnectorLayout,
  updateConnectorLayoutKeyingAt,
  updateConnectorLayoutCellPadding,
  updateConnectorLayoutShellCornerRadius,
  updateConnectorLayoutShellPadding,
  updateConnectorLayoutShellStrokeWidth,
  updateConnectorLayoutShellShape
} from "../core/connectorLayout";

describe("connector layout", () => {
  it("creates deterministic default layouts from connection count", () => {
    const layout = createDefaultConnectorLayout(6);

    expect(layout.version).toBe(1);
    expect(layout.units).toBe("grid");
    expect(layout.width).toBe(3);
    expect(layout.height).toBe(2);
    expect(getConnectorLayoutShellShape(layout)).toBe("square");
    expect(getConnectorLayoutShellPadding(layout)).toBe(0.5);
    expect(getConnectorLayoutShellCornerRadius(layout)).toBe(1);
    expect(getConnectorLayoutShellStrokeWidth(layout)).toBe(0.08);
    expect(getConnectorLayoutCellPadding(layout)).toBe(0.36);
    expect(getConnectorLayoutKeyings(layout)).toEqual([]);
    expect(getConnectorLayoutKeyingSide(layout)).toBe("none");
    expect(getConnectorLayoutKeyingPosition(layout)).toBeUndefined();
    expect(layout.ways.map((way) => way.cavityIndex)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(layout.ways[0]).toMatchObject({ cavityIndex: 1, x: 1, y: 1, shape: "round" });
    expect(layout.ways[5]).toMatchObject({ cavityIndex: 6, x: 3, y: 2, shape: "round" });
    expect(getConnectorLayoutWayDisplayLabel(layout.ways[0]!)).toBe("C1");
  });

  it("normalizes custom layouts and fills missing ways", () => {
    const layout = normalizeConnectorLayout(
      {
        version: 1,
        units: "grid",
        width: 8,
        height: 7,
        shellShape: "circle",
        shellPadding: 1.25,
        cellPadding: 0.22,
        keying: { side: "bottom", position: 99 },
        ways: [
          { cavityIndex: 2, x: 4, y: 3, shape: "slot", label: "B" },
          { cavityIndex: 99, x: 50, y: 50, shape: "square" },
          { cavityIndex: 2, x: 1, y: 1, shape: "round" }
        ]
      },
      3
    );

    expect(layout?.ways).toHaveLength(3);
    expect(layout !== undefined ? getConnectorLayoutShellShape(layout) : null).toBe("circle");
    expect(layout !== undefined ? getConnectorLayoutShellPadding(layout) : null).toBe(1.25);
    expect(layout !== undefined ? getConnectorLayoutCellPadding(layout) : null).toBe(0.22);
    expect(layout !== undefined ? getConnectorLayoutKeyings(layout) : []).toEqual([
      { side: "bottom", shape: "arrow", placement: { mode: "guided", pathPosition: 0.5347 }, position: 8 }
    ]);
    expect(layout !== undefined ? getConnectorLayoutKeyingSide(layout) : null).toBe("bottom");
    expect(layout !== undefined ? getConnectorLayoutKeyingPosition(layout) : null).toBe(8);
    expect(layout?.ways[1]).toEqual({ cavityIndex: 2, x: 4, y: 3, shape: "slot", label: "B" });
    expect(layout?.ways[2]?.cavityIndex).toBe(3);
  });

  it("resolves malformed layout input to a generated fallback", () => {
    const layout = resolveConnectorLayout(undefined, 4);

    expect(layout.ways).toHaveLength(4);
  });

  it("only resolves edited layouts for connector callout drawings", () => {
    const generated = createDefaultConnectorLayout(4);
    const edited = {
      ...generated,
      ways: generated.ways.map((way) => (way.cavityIndex === 2 ? { ...way, x: 1, y: 2 } : way))
    };

    expect(resolveEditedConnectorLayout(undefined, 4)).toBeUndefined();
    expect(resolveEditedConnectorLayout(generated, 4)).toBeUndefined();
    expect(resolveEditedConnectorLayout(edited, 4)?.ways[1]).toMatchObject({ cavityIndex: 2, x: 1, y: 2 });
  });

  it("moves ways within layout bounds and reports duplicate positions", () => {
    const layout = createDefaultConnectorLayout(4);
    const moved = moveConnectorLayoutWay(layout, 4, 20, -5);

    expect(moved.ways[3]).toMatchObject({ cavityIndex: 4, x: 2, y: 1 });
    expect(getConnectorLayoutDuplicatePositions(moved).map((ways) => ways.map((way) => way.cavityIndex))).toEqual([[2, 4]]);
  });

  it("keeps interactive moves from overlapping occupied positions", () => {
    const layout = createDefaultConnectorLayout(3);
    const blocked = moveConnectorLayoutWayIfFree(layout, 2, 1, 1);
    const moved = moveConnectorLayoutWayIfFree(layout, 3, 2, 2);

    expect(blocked.ways[1]).toMatchObject({ cavityIndex: 2, x: 2, y: 1 });
    expect(moved.ways[2]).toMatchObject({ cavityIndex: 3, x: 2, y: 2 });
  });

  it("updates connector shell shape with malformed values falling back to square", () => {
    const layout = createDefaultConnectorLayout(2);
    const circle = updateConnectorLayoutShellShape(layout, "circle");
    const square = normalizeConnectorLayout({ ...circle, shellShape: "triangle" as never }, 2);

    expect(getConnectorLayoutShellShape(circle)).toBe("circle");
    expect(square !== undefined ? getConnectorLayoutShellShape(square) : null).toBe("square");
  });

  it("updates connector shell padding within supported bounds", () => {
    const layout = createDefaultConnectorLayout(2);
    const expanded = updateConnectorLayoutShellPadding(layout, 1.2);
    const normalizedLow = normalizeConnectorLayout({ ...layout, shellPadding: -1 }, 2);
    const normalizedHigh = normalizeConnectorLayout({ ...layout, shellPadding: 99 }, 2);

    expect(getConnectorLayoutShellPadding(expanded)).toBe(1.2);
    expect(normalizedLow !== undefined ? getConnectorLayoutShellPadding(normalizedLow) : null).toBe(0.35);
    expect(normalizedHigh !== undefined ? getConnectorLayoutShellPadding(normalizedHigh) : null).toBe(1.5);
  });

  it("updates connector shell corner radius within supported bounds", () => {
    const layout = createDefaultConnectorLayout(2);
    const squared = updateConnectorLayoutShellCornerRadius(layout, 0);
    const normalizedLow = normalizeConnectorLayout({ ...layout, shellCornerRadius: -1 }, 2);
    const normalizedHigh = normalizeConnectorLayout({ ...layout, shellCornerRadius: 99 }, 2);

    expect(getConnectorLayoutShellCornerRadius(squared)).toBe(0);
    expect(normalizedLow !== undefined ? getConnectorLayoutShellCornerRadius(normalizedLow) : null).toBe(0);
    expect(normalizedHigh !== undefined ? getConnectorLayoutShellCornerRadius(normalizedHigh) : null).toBe(1);
    expect(resolveEditedConnectorLayout(squared, 2)).toBeDefined();
  });

  it("updates connector shell stroke width within supported bounds", () => {
    const layout = createDefaultConnectorLayout(2);
    const thick = updateConnectorLayoutShellStrokeWidth(layout, 0.16);
    const normalizedLow = normalizeConnectorLayout({ ...layout, shellStrokeWidth: -1 }, 2);
    const normalizedHigh = normalizeConnectorLayout({ ...layout, shellStrokeWidth: 99 }, 2);

    expect(getConnectorLayoutShellStrokeWidth(thick)).toBe(0.16);
    expect(normalizedLow !== undefined ? getConnectorLayoutShellStrokeWidth(normalizedLow) : null).toBe(0.02);
    expect(normalizedHigh !== undefined ? getConnectorLayoutShellStrokeWidth(normalizedHigh) : null).toBe(0.2);
    expect(resolveEditedConnectorLayout(thick, 2)).toBeDefined();
  });

  it("updates connector cell padding within supported bounds", () => {
    const layout = createDefaultConnectorLayout(2);
    const expanded = updateConnectorLayoutCellPadding(layout, 0.52);
    const normalizedLow = normalizeConnectorLayout({ ...layout, cellPadding: -1 }, 2);
    const normalizedHigh = normalizeConnectorLayout({ ...layout, cellPadding: 99 }, 2);

    expect(getConnectorLayoutCellPadding(expanded)).toBe(0.52);
    expect(normalizedLow !== undefined ? getConnectorLayoutCellPadding(normalizedLow) : null).toBe(0.12);
    expect(normalizedHigh !== undefined ? getConnectorLayoutCellPadding(normalizedHigh) : null).toBe(0.72);
    expect(resolveEditedConnectorLayout(expanded, 2)).toBeDefined();
  });

  it("supports zero to many connector keying features", () => {
    const layout = createDefaultConnectorLayout(4);
    const first = addConnectorLayoutKeying(layout);
    const second = addConnectorLayoutKeying(first);
    const updated = updateConnectorLayoutKeyingAt(second, 1, { side: "bottom", shape: "diamond", color: "#ff8800", position: 2, scale: 1.45 });
    const removed = removeConnectorLayoutKeying(updated, 0);
    const normalizedLowScale = normalizeConnectorLayout({ ...layout, keyings: [{ side: "right", scale: -1 }] }, 4);
    const normalizedHighScale = normalizeConnectorLayout({ ...layout, keyings: [{ side: "right", scale: 99 }] }, 4);

    expect(getConnectorLayoutKeyings(layout)).toEqual([]);
    expect(getConnectorLayoutKeyings(second)).toEqual([
      { side: "right", shape: "arrow", placement: { mode: "guided", pathPosition: 0.375 }, position: 1.5 },
      { side: "right", shape: "arrow", placement: { mode: "guided", pathPosition: 0.375 }, position: 1.5 }
    ]);
    expect(getConnectorLayoutKeyings(updated)[1]).toEqual({
      side: "bottom",
      shape: "diamond",
      color: "#ff8800",
      scale: 1.45,
      placement: { mode: "guided", pathPosition: 0.5625 },
      position: 2
    });
    expect(getConnectorLayoutKeyings(removed)).toEqual([
      { side: "bottom", shape: "diamond", color: "#ff8800", scale: 1.45, placement: { mode: "guided", pathPosition: 0.5625 }, position: 2 }
    ]);
    expect(normalizedLowScale !== undefined ? getConnectorLayoutKeyings(normalizedLowScale)[0]?.scale : null).toBe(0.5);
    expect(normalizedHighScale !== undefined ? getConnectorLayoutKeyings(normalizedHighScale)[0]?.scale : null).toBe(2);
  });

  it("snaps free keying arrow orientation to square shell axes", () => {
    const layout = {
      ...createDefaultConnectorLayout(4),
      width: 4,
      height: 3,
      shellShape: "square" as const,
      keyings: [
        { side: "right" as const, shape: "arrow" as const, placement: { mode: "free" as const, x: 2.2, y: 0.62, snapToGrid: false } },
        { side: "right" as const, shape: "arrow" as const, placement: { mode: "free" as const, x: 4.42, y: 2 } }
      ]
    };
    const keyings = getConnectorLayoutKeyings(layout);

    expect(keyings[0]?.placement).toEqual({ mode: "free", x: 2.2, y: 0.62, snapToGrid: false });
    expect(getConnectorLayoutKeyingAnchor(keyings[0]!, layout)).toMatchObject({ normalX: 0, normalY: -1 });
    expect(getConnectorLayoutKeyingAnchor(keyings[1]!, layout)).toMatchObject({ normalX: 1, normalY: 0 });
  });
});

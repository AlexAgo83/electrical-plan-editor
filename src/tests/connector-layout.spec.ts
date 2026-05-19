import { describe, expect, it } from "vitest";
import { createDefaultConnectorLayout, normalizeConnectorLayout, resolveConnectorLayout } from "../core/connectorLayout";

describe("connector layout", () => {
  it("creates deterministic default layouts from connection count", () => {
    const layout = createDefaultConnectorLayout(6);

    expect(layout.version).toBe(1);
    expect(layout.units).toBe("grid");
    expect(layout.width).toBe(3);
    expect(layout.height).toBe(2);
    expect(layout.ways.map((way) => way.cavityIndex)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(layout.ways[0]).toMatchObject({ cavityIndex: 1, x: 1, y: 1, shape: "round" });
    expect(layout.ways[5]).toMatchObject({ cavityIndex: 6, x: 3, y: 2, shape: "round" });
  });

  it("normalizes custom layouts and fills missing ways", () => {
    const layout = normalizeConnectorLayout(
      {
        version: 1,
        units: "grid",
        width: 8,
        height: 7,
        ways: [
          { cavityIndex: 2, x: 4, y: 3, shape: "slot", label: "B" },
          { cavityIndex: 99, x: 50, y: 50, shape: "square" },
          { cavityIndex: 2, x: 1, y: 1, shape: "round" }
        ]
      },
      3
    );

    expect(layout?.ways).toHaveLength(3);
    expect(layout?.ways[1]).toEqual({ cavityIndex: 2, x: 4, y: 3, shape: "slot", label: "B" });
    expect(layout?.ways[2]?.cavityIndex).toBe(3);
  });

  it("resolves malformed layout input to a generated fallback", () => {
    const layout = resolveConnectorLayout(undefined, 4);

    expect(layout.ways).toHaveLength(4);
  });
});

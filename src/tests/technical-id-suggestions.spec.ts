import { describe, expect, it } from "vitest";
import {
  suggestAutoConnectorNodeId,
  suggestAutoSpliceNodeId,
  suggestNextConnectorTechnicalId,
  suggestNextNodeId,
  suggestNextSegmentId,
  suggestNextSpliceTechnicalId,
  suggestNextTechnicalId,
  suggestNextWireTechnicalId
} from "../app/lib/technical-id-suggestions";

describe("technical ID suggestions", () => {
  it("suggests next connector and splice technical IDs with zero padding", () => {
    expect(suggestNextConnectorTechnicalId([])).toBe("C-001");
    expect(suggestNextConnectorTechnicalId(["C-001", "C-002"])).toBe("C-003");
    expect(suggestNextSpliceTechnicalId(["S-009"])).toBe("S-010");
    expect(suggestNextWireTechnicalId(["W-001", "W-002"])).toBe("W-003");
    expect(suggestNextSegmentId(["SEG-004"])).toBe("SEG-005");
    expect(suggestNextNodeId(["N-001", "N-CONN-C-001"])).toBe("N-002");
  });

  it("ignores non-matching IDs while keeping deterministic fallback", () => {
    expect(suggestNextTechnicalId(["ABC", "C-FOO", "C-2A"], "C")).toBe("C-001");
  });

  it("avoids collisions for auto-generated connector/splice node IDs", () => {
    expect(suggestAutoConnectorNodeId("C-001", [])).toBe("N-CONN-C-001");
    expect(suggestAutoConnectorNodeId("C-001", ["N-CONN-C-001"])).toBe("N-CONN-C-001-2");
    expect(suggestAutoSpliceNodeId("S 001", ["N-SPLICE-S-001"])).toBe("N-SPLICE-S-001-2");
  });

  it("anchors the network entity prefix into new IDs (AC12)", () => {
    expect(suggestNextConnectorTechnicalId([], "LAT-")).toBe("LAT-C-001");
    expect(suggestNextSpliceTechnicalId(["LAT-S-001"], "LAT-")).toBe("LAT-S-002");
    expect(suggestNextWireTechnicalId([], "LAT-")).toBe("LAT-W-001");
    expect(suggestNextNodeId([], "LAT-")).toBe("LAT-N-001");
    expect(suggestNextSegmentId([], "LAT-")).toBe("LAT-SEG-001");
  });

  it("continues numbering from prefixed IDs and tolerates a missing trailing separator", () => {
    expect(suggestNextConnectorTechnicalId(["LAT-C-001", "LAT-C-002", "C-005"], "LAT-")).toBe("LAT-C-003");
    expect(suggestNextConnectorTechnicalId([], "LAT")).toBe("LAT-C-001");
  });
});

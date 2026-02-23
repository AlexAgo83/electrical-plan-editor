import { describe, expect, it } from "vitest";
import {
  suggestAutoConnectorNodeId,
  suggestAutoSpliceNodeId,
  suggestNextConnectorTechnicalId,
  suggestNextSpliceTechnicalId,
  suggestNextTechnicalId
} from "../app/lib/technical-id-suggestions";

describe("technical ID suggestions", () => {
  it("suggests next connector and splice technical IDs with zero padding", () => {
    expect(suggestNextConnectorTechnicalId([])).toBe("C-001");
    expect(suggestNextConnectorTechnicalId(["C-001", "C-002"])).toBe("C-003");
    expect(suggestNextSpliceTechnicalId(["S-009"])).toBe("S-010");
  });

  it("ignores non-matching IDs while keeping deterministic fallback", () => {
    expect(suggestNextTechnicalId(["ABC", "C-FOO", "C-2A"], "C")).toBe("C-001");
  });

  it("avoids collisions for auto-generated connector/splice node IDs", () => {
    expect(suggestAutoConnectorNodeId("C-001", [])).toBe("N-CONN-C-001");
    expect(suggestAutoConnectorNodeId("C-001", ["N-CONN-C-001"])).toBe("N-CONN-C-001-2");
    expect(suggestAutoSpliceNodeId("S 001", ["N-SPLICE-S-001"])).toBe("N-SPLICE-S-001-2");
  });
});


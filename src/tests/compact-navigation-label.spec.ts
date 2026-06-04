import { describe, expect, it } from "vitest";
import { getCountedNavigationAriaLabel, getCountedNavigationLabel } from "../app/lib/compactNavigationLabel";

describe("compact navigation labels", () => {
  it("keeps labels unchanged until the count exceeds 9", () => {
    expect(getCountedNavigationLabel("Connectors", 9)).toBe("Connectors");
    expect(getCountedNavigationLabel("Connectors", 10)).toBe("Conn.");
  });

  it("does not abbreviate labels shorter than 6 characters", () => {
    expect(getCountedNavigationLabel("Nodes", 10)).toBe("Nodes");
    expect(getCountedNavigationLabel("Wires", 12)).toBe("Wires");
  });

  it("abbreviates the entity navigation labels used in English and French", () => {
    expect(getCountedNavigationLabel("Catalog", 10)).toBe("Cat.");
    expect(getCountedNavigationLabel("Catalogue", 10)).toBe("Cat.");
    expect(getCountedNavigationLabel("Connector", 10)).toBe("Conn.");
    expect(getCountedNavigationLabel("Connecteurs", 10)).toBe("Conn.");
    expect(getCountedNavigationLabel("Splices", 10)).toBe("Spl.");
    expect(getCountedNavigationLabel("Epissures", 10)).toBe("Epis.");
    expect(getCountedNavigationLabel("Segments", 10)).toBe("Seg.");
  });

  it("keeps the full label available for accessibility", () => {
    expect(getCountedNavigationAriaLabel("Connectors", 12)).toBe("Connectors");
  });
});

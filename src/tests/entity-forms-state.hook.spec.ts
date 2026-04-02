import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useEntityFormsState } from "../app/hooks/useEntityFormsState";

describe("useEntityFormsState", () => {
  it("exposes the default form modes and seeded field values", () => {
    const { result } = renderHook(() => useEntityFormsState());

    expect(result.current.catalogFormMode).toBe("idle");
    expect(result.current.connectorFormMode).toBe("idle");
    expect(result.current.spliceFormMode).toBe("idle");
    expect(result.current.nodeFormMode).toBe("idle");
    expect(result.current.segmentFormMode).toBe("idle");
    expect(result.current.wireFormMode).toBe("idle");
    expect(result.current.cavityCount).toBe("4");
    expect(result.current.portCount).toBe("4");
    expect(result.current.wireSectionMm2).toBe("0.5");
    expect(result.current.wireEndpointACavityIndex).toBe("1");
    expect(result.current.wireEndpointBPortIndex).toBe("1");
  });

  it("updates representative connector and wire fields independently", () => {
    const { result } = renderHook(() => useEntityFormsState());

    act(() => {
      result.current.setConnectorFormMode("create");
      result.current.setConnectorName("Junction connector");
      result.current.setConnectorTechnicalId("C-101");
      result.current.setWireFuseEnabled(true);
      result.current.setWireFreeColorLabel("orange / noir");
    });

    expect(result.current.connectorFormMode).toBe("create");
    expect(result.current.connectorName).toBe("Junction connector");
    expect(result.current.connectorTechnicalId).toBe("C-101");
    expect(result.current.wireFuseEnabled).toBe(true);
    expect(result.current.wireFreeColorLabel).toBe("orange / noir");
  });
});

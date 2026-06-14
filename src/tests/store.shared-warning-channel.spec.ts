import { describe, expect, it } from "vitest";
import { createInitialState } from "../store";
import { withWarning } from "../store/reducer/shared";
import { normalizeAppError } from "../store/types";

describe("withWarning channel exclusivity", () => {
  it("surfaces the warning while clearing any pre-existing blocking error", () => {
    const base = createInitialState();
    const withBlockingError = {
      ...base,
      ui: {
        ...base.ui,
        lastError: normalizeAppError("blocking failure")
      }
    };

    const result = withWarning(withBlockingError, "offset clamped to segment length");

    expect(result.ui.lastError).toBeNull();
    expect(result.ui.lastWarning).not.toBeNull();
    expect(result.ui.lastWarning?.message).toBe("offset clamped to segment length");
  });

  it("does not clear the freshly-set warning when there was no prior error", () => {
    const base = createInitialState();

    const result = withWarning(base, "relative position shifted");

    expect(result.ui.lastError).toBeNull();
    expect(result.ui.lastWarning?.message).toBe("relative position shifted");
  });
});

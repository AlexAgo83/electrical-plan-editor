import { describe, expect, it } from "vitest";
import { buildModelingDynamicSelectOptions, sortModelingDynamicSelectOptions } from "../app/lib/modelingSelectOptions";

describe("modeling select options", () => {
  it("sorts by visible label with trimmed case-insensitive comparison and stable tie-breaks", () => {
    const options = sortModelingDynamicSelectOptions([
      { value: "b", label: " bravo", technicalId: "T-2" },
      { value: "a3", label: "Alpha", technicalId: "T-2" },
      { value: "a1", label: " alpha ", technicalId: "T-1" },
      { value: "a2", label: "alpha", technicalId: "T-2" }
    ]);

    expect(options.map((option) => option.value)).toEqual(["a1", "a2", "a3", "b"]);
  });

  it("pins a selected missing option above the sorted list", () => {
    const options = buildModelingDynamicSelectOptions({
      options: [
        { value: "z", label: "Zulu" },
        { value: "a", label: "Alpha" }
      ],
      selectedValue: "missing-id",
      missingOption: { label: "Missing connector (missing-id)" }
    });

    expect(options.map((option) => option.label)).toEqual(["Missing connector (missing-id)", "Alpha", "Zulu"]);
    expect(options[0]?.isMissing).toBe(true);
  });

  it("does not duplicate the selected option when it already exists in the list", () => {
    const options = buildModelingDynamicSelectOptions({
      options: [
        { value: "z", label: "Zulu" },
        { value: "a", label: "Alpha" }
      ],
      selectedValue: "a",
      missingOption: { label: "Missing connector (a)" }
    });

    expect(options.map((option) => option.label)).toEqual(["Alpha", "Zulu"]);
  });
});

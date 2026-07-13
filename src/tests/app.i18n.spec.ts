import { beforeEach, describe, expect, it } from "vitest";
import { setActiveLocale, translate, translateCurrent } from "../app/lib/i18n";

describe("semantic i18n", () => {
  beforeEach(() => setActiveLocale("en"));

  it("resolves semantic keys in each locale", () => {
    expect(translate("en", "ui.save")).toBe("Save");
    expect(translate("fr", "ui.save")).toBe("Enregistrer");
  });

  it("interpolates named placeholders", () => {
    expect(translate("fr", "ui.stepProgress", { step: 2, total: 9 })).toBe("Étape 2 sur 9");
  });

  it("uses the active application locale for call sites without a locale prop", () => {
    setActiveLocale("fr");
    expect(translateCurrent("ui.catalog")).toBe("Catalogue");
  });
});

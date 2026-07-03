import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAppLocaleDomTranslation } from "../app/hooks/useAppLocaleDomTranslation";
import type { AppLocale } from "../app/types/app-controller";

type ObserverCallback = ConstructorParameters<typeof MutationObserver>[0];

let observerCallback: ObserverCallback | null = null;
const observe = vi.fn();
const disconnect = vi.fn();

function LocaleHarness({ locale }: { locale: AppLocale }) {
  useAppLocaleDomTranslation(locale);
  return null;
}

function installMutationObserverMock() {
  observerCallback = null;
  observe.mockReset();
  disconnect.mockReset();

  vi.stubGlobal(
    "MutationObserver",
    vi.fn(function MutationObserverMock(callback: ObserverCallback) {
      observerCallback = callback;
      return { observe, disconnect };
    })
  );
}

describe("useAppLocaleDomTranslation", () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = "";
    document.documentElement.lang = "en";
    installMutationObserverMock();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("skips the mutation observer in English", () => {
    document.body.innerHTML = "<button title=\"Save\">Save</button>";

    render(<LocaleHarness locale="en" />);

    expect(MutationObserver).not.toHaveBeenCalled();
    expect(observe).not.toHaveBeenCalled();
    expect(document.body.textContent).toBe("Save");
  });

  it("restores English text before reconnecting for French", () => {
    document.body.innerHTML = "<button title=\"Save\">Save</button>";
    const { rerender } = render(<LocaleHarness locale="fr" />);

    expect(document.body.textContent).toBe("Enregistrer");
    expect(document.querySelector("button")?.getAttribute("title")).toBe("Enregistrer");

    rerender(<LocaleHarness locale="en" />);
    expect(document.body.textContent).toBe("Save");
    expect(document.querySelector("button")?.getAttribute("title")).toBe("Save");

    rerender(<LocaleHarness locale="fr" />);
    expect(document.body.textContent).toBe("Enregistrer");
    expect(document.querySelector("button")?.getAttribute("title")).toBe("Enregistrer");
  });

  it("does not walk descendant text for French attribute mutations", () => {
    document.body.innerHTML = "<button title=\"Save\"><span>Save</span></button>";
    render(<LocaleHarness locale="fr" />);

    const button = document.querySelector("button");
    const span = document.querySelector("span");
    expect(button).not.toBeNull();
    expect(span).not.toBeNull();
    expect(observerCallback).not.toBeNull();

    button?.setAttribute("title", "Cancel");
    if (span !== null) {
      span.textContent = "Save";
    }

    observerCallback?.([{ type: "attributes", target: button } as unknown as MutationRecord], {} as MutationObserver);

    expect(button?.getAttribute("title")).toBe("Annuler");
    expect(span?.textContent).toBe("Save");
  });
});

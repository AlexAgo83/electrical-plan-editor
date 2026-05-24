const DEFAULT_SCROLL_ATTEMPTS = 6;

export const FORM_PANEL_IDS = {
  catalog: "catalog-item-form",
  catalogConnectorDefaults: "catalog-connector-defaults-form",
  catalogConnectorLayout: "catalog-connector-layout-form",
  connector: "modeling-connector-form",
  splice: "modeling-splice-form",
  node: "modeling-node-form",
  segment: "modeling-segment-form",
  wire: "modeling-wire-form",
  networkScope: "network-scope-form"
} as const;

export type FormPanelId = (typeof FORM_PANEL_IDS)[keyof typeof FORM_PANEL_IDS];

function isFormPanelSufficientlyVisible(element: HTMLElement): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return false;
  }

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  if (viewportHeight <= 0) {
    return false;
  }

  const topThreshold = Math.max(24, viewportHeight * 0.12);
  const bottomThreshold = Math.max(24, viewportHeight * 0.15);
  return rect.top >= topThreshold && rect.bottom <= viewportHeight - bottomThreshold;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToFormPanel(panelId: FormPanelId): void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const selector = `[data-form-panel="${panelId}"]`;

  const tryScroll = (remainingAttempts: number) => {
    const target = document.querySelector(selector);
    if (!(target instanceof HTMLElement) || target.hidden) {
      if (remainingAttempts <= 0) {
        return;
      }
      window.requestAnimationFrame(() => {
        tryScroll(remainingAttempts - 1);
      });
      return;
    }

    if (isFormPanelSufficientlyVisible(target)) {
      return;
    }

    if (typeof target.scrollIntoView !== "function") {
      return;
    }

    target.scrollIntoView({
      block: "start",
      inline: "nearest",
      behavior: prefersReducedMotion() ? "auto" : "smooth"
    });
  };

  window.requestAnimationFrame(() => {
    tryScroll(DEFAULT_SCROLL_ATTEMPTS);
  });
}

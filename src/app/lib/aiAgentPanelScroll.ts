const AI_AGENT_PANEL_SELECTOR = "[data-ai-agent-panel='true']";
const AI_AGENT_PANEL_SCROLL_ATTEMPTS = 10;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToAiAgentPanel(): void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const tryScroll = (remainingAttempts: number): void => {
    const target = document.querySelector(AI_AGENT_PANEL_SELECTOR);
    if (target instanceof HTMLElement && !target.hidden && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ block: "start", inline: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
      return;
    }

    if (remainingAttempts > 0) {
      window.requestAnimationFrame(() => tryScroll(remainingAttempts - 1));
    }
  };

  window.requestAnimationFrame(() => tryScroll(AI_AGENT_PANEL_SCROLL_ATTEMPTS));
}

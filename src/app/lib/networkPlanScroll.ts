export function scrollNetworkPlanIntoView(): void {
  if (typeof document === "undefined") {
    return;
  }
  const planElement = document.querySelector(".network-summary-canvas-region");
  if (planElement instanceof HTMLElement && typeof planElement.scrollIntoView === "function") {
    planElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

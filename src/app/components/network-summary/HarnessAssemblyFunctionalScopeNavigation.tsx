import type { ReactElement } from "react";
import type { HarnessAssembly } from "../../../core/entities";

interface HarnessAssemblyFunctionalScopeNavigationProps {
  activeScope: "assembly" | "current";
  displayedHarnessAssembly: HarnessAssembly | null;
  onOpenAssemblyPicker: () => void;
  onShowCurrentNetwork: () => void;
  variant?: "panel" | "header";
}

export function HarnessAssemblyFunctionalScopeNavigation({
  activeScope,
  displayedHarnessAssembly,
  onOpenAssemblyPicker,
  onShowCurrentNetwork,
  variant = "panel"
}: HarnessAssemblyFunctionalScopeNavigationProps): ReactElement {
  const sectionClassName =
    variant === "header"
      ? "header-quick-entity-nav-panel"
      : "panel network-summary-quick-entity-nav-panel harness-assembly-functional-scope-nav-panel";
  const groupClassName =
    variant === "header"
      ? "network-summary-quick-entity-nav header-quick-entity-nav harness-assembly-functional-scope-nav"
      : "network-summary-quick-entity-nav harness-assembly-functional-scope-nav";

  return (
    <section
      className={sectionClassName}
      aria-label="Functional graph scope"
      data-quick-entity-nav-source={variant === "panel" ? "true" : undefined}
    >
      <div className={groupClassName} role="tablist" aria-label="Functional graph scope tabs">
        <button
          type="button"
          role="tab"
          className="filter-chip network-summary-export-button"
          aria-selected={activeScope === "assembly"}
          onClick={onOpenAssemblyPicker}
          title={displayedHarnessAssembly === null ? "Select a harness assembly" : `Selected: ${displayedHarnessAssembly.name}`}
        >
          <span className="action-button-icon network-summary-quick-entity-nav-icon is-harness-assembly" aria-hidden="true" />
          <span className="network-summary-quick-entity-nav-label">Select harness assembly</span>
        </button>
        <button
          type="button"
          role="tab"
          className={activeScope === "current" ? "filter-chip is-active" : "filter-chip"}
          aria-selected={activeScope === "current"}
          onClick={onShowCurrentNetwork}
        >
          <span className="action-button-icon network-summary-quick-entity-nav-icon is-network-scope" aria-hidden="true" />
          <span className="network-summary-quick-entity-nav-label">Current network functional</span>
        </button>
      </div>
    </section>
  );
}

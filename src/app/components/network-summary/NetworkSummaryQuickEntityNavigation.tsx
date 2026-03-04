import type { ReactElement } from "react";
import type { SubScreenId } from "../../types/app-controller";

interface NetworkSummaryQuickEntityNavigationProps {
  quickEntityNavigationMode: "modeling" | "analysis";
  activeSubScreen: SubScreenId;
  entityCountBySubScreen: Record<SubScreenId, number>;
  onQuickEntityNavigation: (subScreen: SubScreenId) => void;
}

const QUICK_ENTITY_NAV_ITEMS: Record<
  NetworkSummaryQuickEntityNavigationProps["quickEntityNavigationMode"],
  ReadonlyArray<{ subScreen: SubScreenId; label: string }>
> = {
  modeling: [
    { subScreen: "catalog", label: "Catalog" },
    { subScreen: "connector", label: "Connectors" },
    { subScreen: "splice", label: "Splices" },
    { subScreen: "node", label: "Nodes" },
    { subScreen: "segment", label: "Segments" },
    { subScreen: "wire", label: "Wires" }
  ],
  analysis: [
    { subScreen: "connector", label: "Connectors" },
    { subScreen: "splice", label: "Splices" },
    { subScreen: "node", label: "Nodes" },
    { subScreen: "segment", label: "Segments" },
    { subScreen: "wire", label: "Wires" }
  ]
};

const SUB_SCREEN_ICON_CLASS_BY_ID: Record<SubScreenId, string> = {
  catalog: "is-catalog",
  connector: "is-connectors",
  splice: "is-splices",
  node: "is-nodes",
  segment: "is-segments",
  wire: "is-wires"
};

export function NetworkSummaryQuickEntityNavigation({
  quickEntityNavigationMode,
  activeSubScreen,
  entityCountBySubScreen,
  onQuickEntityNavigation
}: NetworkSummaryQuickEntityNavigationProps): ReactElement {
  return (
    <section className="panel network-summary-quick-entity-nav-panel" aria-label="Quick entity navigation">
      <div className="network-summary-quick-entity-nav" role="group" aria-label="Quick entity navigation strip">
        {QUICK_ENTITY_NAV_ITEMS[quickEntityNavigationMode].map((item) => (
          <button
            key={item.subScreen}
            type="button"
            className={activeSubScreen === item.subScreen ? "filter-chip is-active" : "filter-chip"}
            onClick={() => onQuickEntityNavigation(item.subScreen)}
            aria-pressed={activeSubScreen === item.subScreen}
          >
            <span
              className={`action-button-icon network-summary-quick-entity-nav-icon ${SUB_SCREEN_ICON_CLASS_BY_ID[item.subScreen]}`}
              aria-hidden="true"
            />
            <span className="network-summary-quick-entity-nav-label">{item.label}</span>
            <span className="filter-chip-count">{entityCountBySubScreen[item.subScreen]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

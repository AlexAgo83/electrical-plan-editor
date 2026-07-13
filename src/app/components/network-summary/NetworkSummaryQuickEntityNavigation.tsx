import { translateCurrent as t } from "../../lib/i18n";
import type { ReactElement } from "react";
import { getCountedNavigationAriaLabel, getCountedNavigationLabel } from "../../lib/compactNavigationLabel";
import type { SubScreenId } from "../../types/app-controller";

interface NetworkSummaryQuickEntityNavigationProps {
  quickEntityNavigationMode: "modeling" | "analysis";
  activeSubScreen: SubScreenId;
  entityCountBySubScreen: Record<SubScreenId, number>;
  onQuickEntityNavigation: (subScreen: SubScreenId) => void;
  isAiAgentOpen?: boolean;
  isAiAgentReady?: boolean;
  aiAgentDisabledReason?: string;
  onOpenAiAgent?: () => void;
  variant?: "panel" | "header";
}

const QUICK_ENTITY_NAV_ITEMS: Record<
  NetworkSummaryQuickEntityNavigationProps["quickEntityNavigationMode"],
  ReadonlyArray<{ subScreen: SubScreenId; labelKey: string }>
> = {
  modeling: [
    { subScreen: "catalog", labelKey: "ui.catalog" },
    { subScreen: "connector", labelKey: "ui.connectors" },
    { subScreen: "splice", labelKey: "ui.splices" },
    { subScreen: "node", labelKey: "ui.nodes" },
    { subScreen: "segment", labelKey: "ui.segments" },
    { subScreen: "wire", labelKey: "ui.wires" }
  ],
  analysis: [
    { subScreen: "connector", labelKey: "ui.connectors" },
    { subScreen: "splice", labelKey: "ui.splices" },
    { subScreen: "node", labelKey: "ui.nodes" },
    { subScreen: "segment", labelKey: "ui.segments" },
    { subScreen: "wire", labelKey: "ui.wires" }
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
  onQuickEntityNavigation,
  isAiAgentOpen = false,
  isAiAgentReady = false,
  aiAgentDisabledReason,
  onOpenAiAgent,
  variant = "panel"
}: NetworkSummaryQuickEntityNavigationProps): ReactElement {
  const resolvedAiAgentDisabledReason = aiAgentDisabledReason ?? t("ui.configureAValidAIProviderInSettings");
  const sectionClassName =
    variant === "header"
      ? "header-quick-entity-nav-panel"
      : "panel network-summary-quick-entity-nav-panel";
  const groupClassName =
    variant === "header"
      ? "network-summary-quick-entity-nav header-quick-entity-nav"
      : "network-summary-quick-entity-nav";

  return (
    <section
      className={sectionClassName}
      aria-label={t("ui.quickEntityNavigation")}
      data-quick-entity-nav-source={variant === "panel" ? "true" : undefined}
    >
      <div className={groupClassName} role="group" aria-label={t("ui.quickEntityNavigationStrip")}>
        {QUICK_ENTITY_NAV_ITEMS[quickEntityNavigationMode].map((item) => {
          const entityCount = entityCountBySubScreen[item.subScreen];
          const itemLabel = t(item.labelKey);
          const navigationLabel = getCountedNavigationLabel(itemLabel, entityCount, variant === "header");
          return (
            <button
              key={item.subScreen}
              type="button"
              className={!isAiAgentOpen && activeSubScreen === item.subScreen ? "filter-chip is-active" : "filter-chip"}
              onClick={() => onQuickEntityNavigation(item.subScreen)}
              aria-pressed={!isAiAgentOpen && activeSubScreen === item.subScreen}
              aria-label={navigationLabel === itemLabel ? undefined : getCountedNavigationAriaLabel(itemLabel, entityCount)}
              title={itemLabel}
            >
              <span
                className={`action-button-icon network-summary-quick-entity-nav-icon ${SUB_SCREEN_ICON_CLASS_BY_ID[item.subScreen]}`}
                aria-hidden="true"
              />
              <span className="network-summary-quick-entity-nav-label">{navigationLabel}</span>
              <span className="filter-chip-count">{entityCount}</span>
            </button>
          );
        })}
        {quickEntityNavigationMode === "modeling" ? (
          <button
            type="button"
            className={isAiAgentOpen ? "filter-chip is-ai-agent-tab is-active" : "filter-chip is-ai-agent-tab"}
            onClick={onOpenAiAgent}
            aria-label={t("navigation.aiAgent")}
            aria-description={isAiAgentReady ? t("navigation.aiAgentWorkspace") : resolvedAiAgentDisabledReason}
            aria-pressed={isAiAgentOpen}
            disabled={!isAiAgentReady || onOpenAiAgent === undefined}
            title={t("navigation.aiAgent")}
          >
            <span className="action-button-icon network-summary-quick-entity-nav-icon is-ai-agent" aria-hidden="true" />
            {variant === "header" ? null : <span className="network-summary-quick-entity-nav-label">{t("navigation.aiAgent")}</span>}
          </button>
        ) : null}
      </div>
    </section>
  );
}

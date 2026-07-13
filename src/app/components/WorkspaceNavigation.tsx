import type { ReactElement } from "react";
import { getCountedNavigationAriaLabel, getCountedNavigationLabel } from "../lib/compactNavigationLabel";
import { translate } from "../lib/i18n";
import type { AppLocale, ScreenId, SubScreenId } from "../types/app-controller";

interface WorkspaceNavigationProps {
  locale: AppLocale;
  activeScreen: ScreenId;
  activeSubScreen: SubScreenId;
  isModelingScreen: boolean;
  isAnalysisScreen: boolean;
  isStatisticsScreen: boolean;
  isValidationScreen: boolean;
  validationIssuesCount: number;
  validationErrorCount: number;
  entityCountBySubScreen: Record<SubScreenId, number>;
  isAiAgentOpen?: boolean;
  isAiAgentReady?: boolean;
  aiAgentDisabledReason?: string;
  onScreenChange: (screen: ScreenId) => void;
  onSubScreenChange: (subScreen: SubScreenId) => void;
  onOpenAiAgent?: () => void;
}

export function WorkspaceNavigation({
  locale,
  activeScreen,
  activeSubScreen,
  isModelingScreen,
  isAnalysisScreen,
  isStatisticsScreen,
  isValidationScreen,
  validationIssuesCount,
  validationErrorCount,
  entityCountBySubScreen,
  isAiAgentOpen = false,
  isAiAgentReady = false,
  aiAgentDisabledReason,
  onScreenChange,
  onSubScreenChange,
  onOpenAiAgent
}: WorkspaceNavigationProps): ReactElement {
  const validationCounterDescription = translate(
    locale,
    validationErrorCount > 0 ? "ui.issuesWithErrors" : "ui.issuesWithoutErrors",
    { issues: validationIssuesCount, errors: validationErrorCount }
  );
  const resolvedAiAgentDisabledReason =
    aiAgentDisabledReason ?? translate(locale, "ui.configureAValidAIProviderInSettings");
  const screenIconClassById: Partial<Record<ScreenId, string>> = {
    home: "is-home",
    networkScope: "is-network-scope",
    harnessAssembly: "is-harness-assembly",
    modeling: "is-edit",
    analysis: "is-analysis",
    statistics: "is-statistics",
    validation: "is-validation"
  };
  const subScreenIconClassById: Record<SubScreenId, string> = {
    catalog: "is-catalog",
    connector: "is-connectors",
    splice: "is-splices",
    node: "is-nodes",
    segment: "is-segments",
    wire: "is-wires"
  };
  const showEntityNavigation = isModelingScreen || isAnalysisScreen;
  const subScreenEntries = isAnalysisScreen
    ? ([
        ["connector", "navigation.entities.connector"],
        ["splice", "navigation.entities.splice"],
        ["node", "navigation.entities.node"],
        ["segment", "navigation.entities.segment"],
        ["wire", "navigation.entities.wire"]
      ] as const)
    : ([
        ["catalog", "navigation.entities.catalog"],
        ["connector", "navigation.entities.connector"],
        ["splice", "navigation.entities.splice"],
        ["node", "navigation.entities.node"],
        ["segment", "navigation.entities.segment"],
        ["wire", "navigation.entities.wire"]
      ] as const);

  return (
    <section className="workspace-switcher">
      <div className="workspace-nav-row">
        {([
          ["home", "navigation.screens.home"],
          ["networkScope", "navigation.screens.networkScope"],
          ["harnessAssembly", "navigation.screens.harnessAssembly"],
          ["modeling", "navigation.screens.modeling"],
          ["statistics", "navigation.screens.statistics"],
          ["validation", "navigation.screens.validation"]
        ] as const).map(([screenId, labelKey]) => (
          <button
            key={screenId}
            type="button"
            className={
              activeScreen === screenId || (screenId === "modeling" && isAnalysisScreen)
                ? "workspace-tab is-active"
                : "workspace-tab"
            }
            aria-description={screenId === "validation" ? validationCounterDescription : undefined}
            onClick={() => onScreenChange(screenId)}
          >
            <span className="workspace-tab-content">
              {screenIconClassById[screenId] ? (
                <span className={`action-button-icon ${screenIconClassById[screenId]}`} aria-hidden="true" />
              ) : null}
              <span data-locale-exempt="true">{translate(locale, labelKey)}</span>
              {screenId === "validation" ? (
                <>
                  <span
                    className={validationErrorCount > 0 ? "workspace-tab-badge is-error" : "workspace-tab-badge"}
                    aria-hidden="true"
                  >
                    {validationIssuesCount}
                  </span>
                </>
              ) : null}
            </span>
          </button>
        ))}
      </div>
      {showEntityNavigation ? (
        <section className="workspace-nav-subsection" aria-label={translate(locale, "navigation.entityNavigation")} data-locale-exempt="true">
          <p className="meta-line workspace-nav-divider">{translate(locale, "navigation.entityNavigation")}</p>
          <div className="workspace-nav-row secondary">
            {subScreenEntries.map(([subScreenId, labelKey]) => {
              const entityCount = entityCountBySubScreen[subScreenId];
              const label = translate(locale, labelKey);
              const navigationLabel = getCountedNavigationLabel(label, entityCount);
              return (
                <button
                  key={subScreenId}
                  type="button"
                  className={!isAiAgentOpen && activeSubScreen === subScreenId ? "workspace-tab is-active" : "workspace-tab"}
                  onClick={() => onSubScreenChange(subScreenId)}
                  aria-label={navigationLabel === label ? undefined : getCountedNavigationAriaLabel(label, entityCount)}
                  title={label}
                >
                  <span className="workspace-tab-content">
                    <span className={`action-button-icon ${subScreenIconClassById[subScreenId]}`} aria-hidden="true" />
                    <span>{navigationLabel}</span>
                    <span className="workspace-tab-badge" aria-hidden="true">
                      {entityCount}
                    </span>
                  </span>
                </button>
              );
            })}
            {!isAnalysisScreen ? (
              <button
                type="button"
                className={isAiAgentOpen ? "workspace-tab is-ai-agent-tab is-active" : "workspace-tab is-ai-agent-tab"}
                onClick={onOpenAiAgent}
                aria-label={translate(locale, "navigation.aiAgent")}
            aria-description={isAiAgentReady ? translate(locale, "navigation.aiAgentWorkspace") : resolvedAiAgentDisabledReason}
                disabled={!isAiAgentReady || onOpenAiAgent === undefined}
                title={translate(locale, "navigation.aiAgent")}
                data-locale-exempt="true"
              >
                <span className="workspace-tab-content">
                  <span className="action-button-icon is-ai-agent" aria-hidden="true" />
                  <span>{translate(locale, "navigation.aiAgent")}</span>
                </span>
              </button>
            ) : null}
          </div>
        </section>
      ) : null}
      <p className="meta-line screen-description">
        <span data-locale-exempt="true">{activeScreen === "networkScope"
          ? translate(locale, "navigation.descriptions.networkScope")
          : activeScreen === "harnessAssembly"
          ? translate(locale, "navigation.descriptions.harnessAssembly")
          : activeScreen === "home"
          ? translate(locale, "navigation.descriptions.home")
          : isModelingScreen || isAnalysisScreen
          ? translate(locale, "navigation.descriptions.modeling")
          : isStatisticsScreen
          ? translate(locale, "navigation.descriptions.statistics")
          : isValidationScreen
          ? translate(locale, "navigation.descriptions.validation")
          : translate(locale, "navigation.descriptions.settings")}</span>
      </p>
    </section>
  );
}

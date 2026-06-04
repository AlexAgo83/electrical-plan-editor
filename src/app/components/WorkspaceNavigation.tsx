import type { ReactElement } from "react";
import { getCountedNavigationAriaLabel, getCountedNavigationLabel } from "../lib/compactNavigationLabel";
import type { ScreenId, SubScreenId } from "../types/app-controller";

interface WorkspaceNavigationProps {
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
  aiAgentDisabledReason = "Configure a valid AI provider in Settings.",
  onScreenChange,
  onSubScreenChange,
  onOpenAiAgent
}: WorkspaceNavigationProps): ReactElement {
  const validationCounterDescription = `${validationIssuesCount} issue${validationIssuesCount === 1 ? "" : "s"}${
    validationErrorCount > 0
      ? `, ${validationErrorCount} error${validationErrorCount === 1 ? "" : "s"}`
      : ", no errors"
  }`;
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
        ["connector", "Connector"],
        ["splice", "Splice"],
        ["node", "Node"],
        ["segment", "Segment"],
        ["wire", "Wire"]
      ] as const)
    : ([
        ["catalog", "Catalog"],
        ["connector", "Connector"],
        ["splice", "Splice"],
        ["node", "Node"],
        ["segment", "Segment"],
        ["wire", "Wire"]
      ] as const);

  return (
    <section className="workspace-switcher">
      <div className="workspace-nav-row">
        {([
          ["home", "Home"],
          ["networkScope", "Network Scope"],
          ["harnessAssembly", "Harness Assembly"],
          ["modeling", "Modeling"],
          ["statistics", "Statistics"],
          ["validation", "Validation"]
        ] as const).map(([screenId, label]) => (
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
              <span>{label}</span>
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
        <section className="workspace-nav-subsection" aria-label="Entity navigation">
          <p className="meta-line workspace-nav-divider">Entity navigation</p>
          <div className="workspace-nav-row secondary">
            {subScreenEntries.map(([subScreenId, label]) => {
              const entityCount = entityCountBySubScreen[subScreenId];
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
                aria-label="AI Agent"
                aria-description={isAiAgentReady ? "AI Agent modeling workspace" : aiAgentDisabledReason}
                disabled={!isAiAgentReady || onOpenAiAgent === undefined}
                title="AI Agent"
              >
                <span className="workspace-tab-content">
                  <span className="action-button-icon is-ai-agent" aria-hidden="true" />
                  <span>AI Agent</span>
                </span>
              </button>
            ) : null}
          </div>
        </section>
      ) : null}
      <p className="meta-line screen-description">
        {activeScreen === "networkScope"
          ? "Network Scope workspace: active network context and lifecycle management."
          : activeScreen === "harnessAssembly"
          ? "Harness Assembly workspace: cross-harness grouping and functional trace."
          : activeScreen === "home"
          ? "Home workspace: start, resume, shortcuts, and quick preferences."
          : isModelingScreen || isAnalysisScreen
          ? "Modeling workspace: entity editor, operational lists, and analysis panels."
          : isStatisticsScreen
          ? "Statistics workspace: read-only network metrics and manual multi-network comparison."
          : isValidationScreen
          ? "Validation center: grouped model integrity issues with one-click navigation."
          : "Settings workspace: workspace preferences and project-level options."}
      </p>
    </section>
  );
}

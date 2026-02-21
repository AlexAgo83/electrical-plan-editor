import type { ReactElement } from "react";

type ScreenId = "networkScope" | "modeling" | "analysis" | "validation" | "settings";
type SubScreenId = "connector" | "splice" | "node" | "segment" | "wire";

interface WorkspaceNavigationProps {
  activeScreen: ScreenId;
  activeSubScreen: SubScreenId;
  isModelingScreen: boolean;
  isAnalysisScreen: boolean;
  isValidationScreen: boolean;
  validationIssuesCount: number;
  validationErrorCount: number;
  entityCountBySubScreen: Record<SubScreenId, number>;
  onScreenChange: (screen: ScreenId) => void;
  onSubScreenChange: (subScreen: SubScreenId) => void;
}

export function WorkspaceNavigation({
  activeScreen,
  activeSubScreen,
  isModelingScreen,
  isAnalysisScreen,
  isValidationScreen,
  validationIssuesCount,
  validationErrorCount,
  entityCountBySubScreen,
  onScreenChange,
  onSubScreenChange
}: WorkspaceNavigationProps): ReactElement {
  const showEntityNavigation = isModelingScreen || isAnalysisScreen;

  return (
    <section className="workspace-switcher">
      <div className="workspace-nav-row">
        {([
          ["networkScope", "Network Scope"],
          ["modeling", "Modeling"],
          ["analysis", "Analysis"],
          ["validation", "Validation"]
        ] as const).map(([screenId, label]) => (
          <button
            key={screenId}
            type="button"
            className={activeScreen === screenId ? "workspace-tab is-active" : "workspace-tab"}
            onClick={() => onScreenChange(screenId)}
          >
            <span className="workspace-tab-content">
              <span>{label}</span>
              {screenId === "validation" ? (
                <span
                  className={validationErrorCount > 0 ? "workspace-tab-badge is-error" : "workspace-tab-badge"}
                  aria-hidden="true"
                >
                  {validationIssuesCount}
                </span>
              ) : null}
            </span>
          </button>
        ))}
      </div>
      {showEntityNavigation ? (
        <section className="workspace-nav-subsection" aria-label="Entity navigation">
          <p className="meta-line workspace-nav-divider">Entity navigation</p>
          <div className="workspace-nav-row secondary">
            {([
              ["connector", "Connector"],
              ["splice", "Splice"],
              ["node", "Node"],
              ["segment", "Segment"],
              ["wire", "Wire"]
            ] as const).map(([subScreenId, label]) => (
              <button
                key={subScreenId}
                type="button"
                className={activeSubScreen === subScreenId ? "workspace-tab is-active" : "workspace-tab"}
                onClick={() => onSubScreenChange(subScreenId)}
              >
                <span className="workspace-tab-content">
                  <span>{label}</span>
                  <span className="workspace-tab-badge" aria-hidden="true">
                    {entityCountBySubScreen[subScreenId]}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
      <p className="meta-line screen-description">
        {activeScreen === "networkScope"
          ? "Network Scope workspace: active network context and lifecycle management."
          : isModelingScreen
          ? "Modeling workspace: entity editor + operational lists."
          : isAnalysisScreen
            ? "Analysis workspace: synthesis, route control, and network insight."
            : isValidationScreen
              ? "Validation center: grouped model integrity issues with one-click navigation."
              : "Settings workspace: workspace preferences and project-level options."}
      </p>
    </section>
  );
}

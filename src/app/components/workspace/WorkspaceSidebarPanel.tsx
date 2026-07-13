import type { ReactElement } from "react";
import { WorkspaceNavigation } from "../WorkspaceNavigation";
import type { AppLocale, ScreenId, SubScreenId } from "../../types/app-controller";

interface WorkspaceSidebarPanelProps {
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

export function WorkspaceSidebarPanel({
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
  isAiAgentOpen,
  isAiAgentReady,
  aiAgentDisabledReason,
  onScreenChange,
  onSubScreenChange,
  onOpenAiAgent
}: WorkspaceSidebarPanelProps): ReactElement {
  return (
    <aside className="workspace-sidebar">
      <WorkspaceNavigation
        locale={locale}
        activeScreen={activeScreen}
        activeSubScreen={activeSubScreen}
        isModelingScreen={isModelingScreen}
        isAnalysisScreen={isAnalysisScreen}
        isStatisticsScreen={isStatisticsScreen}
        isValidationScreen={isValidationScreen}
        validationIssuesCount={validationIssuesCount}
        validationErrorCount={validationErrorCount}
        entityCountBySubScreen={entityCountBySubScreen}
        isAiAgentOpen={isAiAgentOpen}
        isAiAgentReady={isAiAgentReady}
        aiAgentDisabledReason={aiAgentDisabledReason}
        onScreenChange={onScreenChange}
        onSubScreenChange={onSubScreenChange}
        onOpenAiAgent={onOpenAiAgent}
      />
    </aside>
  );
}

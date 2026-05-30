import type { ReactElement } from "react";
import { WorkspaceNavigation } from "../WorkspaceNavigation";
import type { ScreenId, SubScreenId } from "../../types/app-controller";

interface WorkspaceSidebarPanelProps {
  activeScreen: ScreenId;
  activeSubScreen: SubScreenId;
  isModelingScreen: boolean;
  isAnalysisScreen: boolean;
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
  activeScreen,
  activeSubScreen,
  isModelingScreen,
  isAnalysisScreen,
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
        activeScreen={activeScreen}
        activeSubScreen={activeSubScreen}
        isModelingScreen={isModelingScreen}
        isAnalysisScreen={isAnalysisScreen}
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

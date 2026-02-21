import type { ReactElement } from "react";
import { WorkspaceNavigation } from "../WorkspaceNavigation";
import type { SubScreenId } from "../../types/app-controller";

interface WorkspaceSidebarPanelProps {
  activeScreen: "networkScope" | "modeling" | "analysis" | "validation" | "settings";
  activeSubScreen: SubScreenId;
  isModelingScreen: boolean;
  isAnalysisScreen: boolean;
  isValidationScreen: boolean;
  validationIssuesCount: number;
  validationErrorCount: number;
  entityCountBySubScreen: Record<SubScreenId, number>;
  onScreenChange: (screen: "networkScope" | "modeling" | "analysis" | "validation" | "settings") => void;
  onSubScreenChange: (subScreen: SubScreenId) => void;
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
  onScreenChange,
  onSubScreenChange
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
        onScreenChange={onScreenChange}
        onSubScreenChange={onSubScreenChange}
      />
    </aside>
  );
}

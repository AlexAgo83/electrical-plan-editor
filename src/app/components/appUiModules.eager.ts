import { NetworkSummaryPanel } from "./NetworkSummaryPanel";
import { AnalysisScreen } from "./screens/AnalysisScreen";
import { ModelingScreen } from "./screens/ModelingScreen";
import { NetworkScopeScreen } from "./screens/NetworkScopeScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ValidationScreen } from "./screens/ValidationScreen";
import { AnalysisWorkspaceContent } from "./workspace/AnalysisWorkspaceContent";
import { ModelingFormsColumn } from "./workspace/ModelingFormsColumn";
import { ModelingPrimaryTables } from "./workspace/ModelingPrimaryTables";
import { ModelingSecondaryTables } from "./workspace/ModelingSecondaryTables";
import { NetworkScopeWorkspaceContent } from "./workspace/NetworkScopeWorkspaceContent";
import { SettingsWorkspaceContent } from "./workspace/SettingsWorkspaceContent";
import { ValidationWorkspaceContent } from "./workspace/ValidationWorkspaceContent";

export const appUiModulesEager = {
  NetworkSummaryPanel,
  AnalysisScreen,
  ModelingScreen,
  NetworkScopeScreen,
  SettingsScreen,
  ValidationScreen,
  AnalysisWorkspaceContent,
  ModelingFormsColumn,
  ModelingPrimaryTables,
  ModelingSecondaryTables,
  NetworkScopeWorkspaceContent,
  SettingsWorkspaceContent,
  ValidationWorkspaceContent
} as const;

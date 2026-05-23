import { useMemo, type CSSProperties } from "react";
import { clamp, NETWORK_MAX_SCALE, NETWORK_MIN_SCALE } from "../lib/app-utils-shared";
import { getThemeClassNames } from "../lib/themeModes";
import type { ThemeMode } from "../../store";
import type { TableDensity, TableFontSize, WorkspacePanelsLayoutMode } from "../types/app-controller";

interface UseAppControllerShellDerivedStateParams {
  themeMode: ThemeMode;
  tableDensity: TableDensity;
  tableFontSize: TableFontSize;
  workspacePanelsLayoutMode: WorkspacePanelsLayoutMode;
  workspaceWideScreen: boolean;
  headerOffsetPx: number;
  canvasResetZoomPercentInput: string;
}

export function useAppControllerShellDerivedState({
  themeMode,
  tableDensity,
  tableFontSize,
  workspacePanelsLayoutMode,
  workspaceWideScreen,
  headerOffsetPx,
  canvasResetZoomPercentInput
}: UseAppControllerShellDerivedStateParams) {
  const resolvedThemeClassNames = getThemeClassNames(themeMode);
  const appShellClassName = [
    "app-shell",
    tableDensity === "compact" ? "table-density-compact" : "",
    `table-font-${tableFontSize}`,
    workspacePanelsLayoutMode === "singleColumn" ? "workspace-panels-layout-single-column" : "",
    workspaceWideScreen ? "workspace-wide-screen" : "",
    ...resolvedThemeClassNames
  ]
    .filter((token) => token.length > 0)
    .join(" ");

  const workspaceShellStyle = useMemo(
    () =>
      ({
        "--workspace-header-offset": `${headerOffsetPx}px`
      }) as CSSProperties,
    [headerOffsetPx]
  );

  const configuredResetScale = useMemo(() => {
    const parsedPercent = Number(canvasResetZoomPercentInput);
    if (!Number.isFinite(parsedPercent) || parsedPercent <= 0) {
      return 1;
    }

    return clamp(parsedPercent / 100, NETWORK_MIN_SCALE, NETWORK_MAX_SCALE);
  }, [canvasResetZoomPercentInput]);
  const configuredResetZoomPercent = Math.round(configuredResetScale * 100);

  return {
    appShellClassName,
    workspaceShellStyle,
    configuredResetScale,
    configuredResetZoomPercent
  };
}

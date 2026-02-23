import { useMemo, type CSSProperties } from "react";
import { clamp, NETWORK_MAX_SCALE, NETWORK_MIN_SCALE } from "../lib/app-utils-shared";
import type { ThemeMode } from "../../store";
import type { TableDensity, TableFontSize } from "../types/app-controller";

interface UseAppControllerShellDerivedStateParams {
  themeMode: ThemeMode;
  tableDensity: TableDensity;
  tableFontSize: TableFontSize;
  headerOffsetPx: number;
  canvasResetZoomPercentInput: string;
}

export function useAppControllerShellDerivedState({
  themeMode,
  tableDensity,
  tableFontSize,
  headerOffsetPx,
  canvasResetZoomPercentInput
}: UseAppControllerShellDerivedStateParams) {
  const themeClassNamesByMode: Record<ThemeMode, string[]> = {
    normal: ["theme-normal"],
    dark: ["theme-dark"],
    slateNeon: ["theme-dark", "theme-slate-neon"],
    paperBlueprint: ["theme-normal", "theme-paper-blueprint"],
    warmBrown: ["theme-normal", "theme-warm-brown"],
    deepGreen: ["theme-dark", "theme-deep-green"],
    roseQuartz: ["theme-normal", "theme-paper-blueprint", "theme-rose-quartz"],
    burgundyNoir: ["theme-dark", "theme-burgundy-noir"],
    lavenderHaze: ["theme-normal", "theme-paper-blueprint", "theme-lavender-haze"],
    amberNight: ["theme-dark", "theme-deep-green", "theme-amber-night"],
    cyberpunk: ["theme-dark", "theme-amber-night", "theme-cyberpunk"],
    olive: ["theme-dark", "theme-deep-green", "theme-olive"]
  };
  const resolvedThemeClassNames = themeClassNamesByMode[themeMode] ?? themeClassNamesByMode.normal;
  const appShellClassName = [
    "app-shell",
    tableDensity === "compact" ? "table-density-compact" : "",
    `table-font-${tableFontSize}`,
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

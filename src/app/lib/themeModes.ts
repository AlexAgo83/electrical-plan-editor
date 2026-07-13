import { translateCurrent as t } from "./i18n";
import type { ThemeMode } from "../../store";

export const THEME_CLASS_NAMES_BY_MODE: Record<ThemeMode, string[]> = {
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
  olive: ["theme-dark", "theme-deep-green", "theme-olive"],
  mistGray: ["theme-mist-gray"],
  sagePaper: ["theme-sage-paper"],
  sandSlate: ["theme-sand-slate"],
  iceBlue: ["theme-ice-blue"],
  softTeal: ["theme-soft-teal"],
  dustyRose: ["theme-dusty-rose"],
  paleOlive: ["theme-pale-olive"],
  cloudLavender: ["theme-cloud-lavender"],
  steelBlue: ["theme-steel-blue"],
  forestGraphite: ["theme-forest-graphite"],
  petrolSlate: ["theme-petrol-slate"],
  copperNight: ["theme-copper-night"],
  mossTaupe: ["theme-moss-taupe"],
  navyAsh: ["theme-navy-ash"],
  charcoalPlum: ["theme-charcoal-plum"],
  smokedTeal: ["theme-smoked-teal"],
  circleMobilityLight: ["theme-sage-paper", "theme-circle-mobility-light"],
  circleMobilityDark: ["theme-petrol-slate", "theme-circle-mobility-dark"]
};

export function getThemeModeOptions(): Array<{ value: ThemeMode; label: string }> {
  return [
  { value: "normal", label: t("ui.light") },
  { value: "paperBlueprint", label: t("ui.paperBlueprintLight") },
  { value: "warmBrown", label: t("ui.warmBrownLight") },
  { value: "mistGray", label: t("ui.mistGrayLight") },
  { value: "sagePaper", label: t("ui.sagePaperLight") },
  { value: "sandSlate", label: t("ui.sandSlateLight") },
  { value: "iceBlue", label: t("ui.iceBlueLight") },
  { value: "softTeal", label: t("ui.softTealLight") },
  { value: "dustyRose", label: t("ui.dustyRoseLight") },
  { value: "paleOlive", label: t("ui.paleOliveLight") },
  { value: "cloudLavender", label: t("ui.cloudLavenderLight") },
  { value: "roseQuartz", label: t("ui.roseQuartzLight") },
  { value: "lavenderHaze", label: t("ui.lavenderHazeLight") },
  { value: "circleMobilityLight", label: t("ui.circleMobilityLight") },
  { value: "dark", label: t("ui.dark") },
  { value: "slateNeon", label: t("ui.slateNeonDark") },
  { value: "deepGreen", label: t("ui.deepGreenDark") },
  { value: "burgundyNoir", label: t("ui.burgundyNoirDark") },
  { value: "amberNight", label: t("ui.amberNightDark") },
  { value: "cyberpunk", label: t("ui.cyberpunkDark") },
  { value: "olive", label: t("ui.oliveDark") },
  { value: "steelBlue", label: t("ui.steelBlueDark") },
  { value: "forestGraphite", label: t("ui.forestGraphiteDark") },
  { value: "petrolSlate", label: t("ui.petrolSlateDark") },
  { value: "copperNight", label: t("ui.copperNightDark") },
  { value: "mossTaupe", label: t("ui.mossTaupeDark") },
  { value: "navyAsh", label: t("ui.navyAshDark") },
  { value: "charcoalPlum", label: t("ui.charcoalPlumDark") },
  { value: "smokedTeal", label: t("ui.smokedTealDark") },
  { value: "circleMobilityDark", label: t("ui.circleMobilityDark") }
  ];
}

export function getThemeClassNames(themeMode: ThemeMode): string[] {
  return THEME_CLASS_NAMES_BY_MODE[themeMode] ?? THEME_CLASS_NAMES_BY_MODE.normal;
}

import type { ReactElement } from "react";

export interface SettingsSectionDefinition {
  id: string;
  title: string;
  labels: string[];
}

export const SETTINGS_SECTIONS: SettingsSectionDefinition[] = [
  {
    id: "settings-workspace-storage",
    title: "Workspace storage",
    labels: ["Persistence mode", "Linked file", "Permission", "Open", "Save as", "Unlink"]
  },
  {
    id: "settings-ai-provider",
    title: "AI provider",
    labels: ["Provider", "Model", "API key", "Endpoint", "Timeout (ms)", "Strict structured output mode", "Enable experimental direct execution"]
  },
  {
    id: "settings-canvas-render",
    title: "Canvas render preferences",
    labels: [
      "Label stroke mode",
      "2D label size",
      "Callout text size",
      "Connector drawing display",
      "Connector drawing size (%)",
      "Summary global scale (%)",
      "Auto segment label rotation",
      "2D label rotation",
      "Reset zoom target (%)",
      "Viewport resize behavior"
    ]
  },
  {
    id: "settings-canvas-tools",
    title: "Canvas tools preferences",
    labels: [
      "Show grid by default",
      "Snap node movement by default",
      "Lock node movement by default",
      "Show info overlays by default",
      "Show segment names",
      "Show segment lengths by default",
      "Show connector/splice cable callouts by default",
      "Show only selected connector/splice callout",
      "Show wire names in callout table",
      "Keep connector/splice/node shape size constant while zooming",
      "Node shape target size (%)",
      "Include background in PNG export",
      "Include frame in SVG/PNG export",
      "Include identity cartouche in SVG/PNG export"
    ]
  },
  {
    id: "settings-appearance",
    title: "Appearance preferences",
    labels: ["Theme mode", "Table density", "Table font size", "Default sort column", "Default sort direction", "Default ID sort direction"]
  },
  {
    id: "settings-global-preferences",
    title: "Global preferences",
    labels: [
      "Show floating inspector panel on supported screens",
      "Show route preview panel",
      "Hide Wire analysis auto route panel",
      "Workspace panels layout",
      "Wide screen (remove app max width cap)",
      "Default wire section (mm²)",
      "Default auto-create linked nodes for connectors/splices",
      "Directional splice imbalance limit (%)",
      "Language"
    ]
  },
  {
    id: "settings-shortcuts",
    title: "Action bar and shortcuts",
    labels: ["Show shortcut hints in the action bar", "Enable keyboard shortcuts (undo/redo/navigation/issues/view)", "Restore network viewport on undo/redo"]
  },
  {
    id: "settings-catalog-bom",
    title: "Catalog & BOM setup",
    labels: ["Currency (Catalog/BOM)", "Enable tax / VAT (TVA)", "Tabular export format", "Compact BOM export columns", "Hide BOM traceability labels", "Tax rate (%)"]
  },
  {
    id: "settings-import-export",
    title: "Import / Export networks",
    labels: ["Selected networks for export", "Export active", "Export selected", "Export all", "Import from file"]
  },
  {
    id: "settings-sample-network",
    title: "Sample network controls",
    labels: ["Recreate sample network", "Reset sample network to baseline"]
  }
];

export function normalizeSettingsSearch(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function settingsLabelMatches(label: string, normalizedQuery: string): boolean {
  return normalizedQuery.length > 0 && label.toLowerCase().includes(normalizedQuery);
}

export function sectionMatches(section: SettingsSectionDefinition, normalizedQuery: string): number {
  if (normalizedQuery.length === 0) {
    return 0;
  }

  return [section.title, ...section.labels].filter((label) => settingsLabelMatches(label, normalizedQuery)).length;
}

export function SettingsLabelText({ text, normalizedQuery }: { text: string; normalizedQuery: string }): ReactElement {
  if (!settingsLabelMatches(text, normalizedQuery)) {
    return <span className="settings-label-text">{text}</span>;
  }

  const lowerText = text.toLowerCase();
  const matchIndex = lowerText.indexOf(normalizedQuery);
  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + normalizedQuery.length);
  const after = text.slice(matchIndex + normalizedQuery.length);

  return (
    <span className="settings-label-text">
      {before}
      <mark className="settings-search-highlight">{match}</mark>
      {after}
    </span>
  );
}

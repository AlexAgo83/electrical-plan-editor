import type { ReactElement } from "react";
import { settingsLabelMatches } from "./settingsSearchModel";

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

import type { ReactElement } from "react";
import type { UndoHistoryEntry } from "../../types/app-controller";

interface NetworkRecentChangesListProps {
  entries: UndoHistoryEntry[];
}

export function NetworkRecentChangesList({ entries }: NetworkRecentChangesListProps): ReactElement | null {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="network-recent-changes-list-shell home-network-recent-changes" aria-label="Recent changes for active network">
      <ul className="network-recent-changes-list" aria-label="Recent changes list">
        {entries.map((entry) => (
          <li key={entry.sequence} className="network-recent-changes-item">
            <time dateTime={entry.timestampIso} className="network-recent-changes-time">
              {new Date(entry.timestampIso).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
              })}
            </time>
            <span className="network-recent-changes-label">{entry.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

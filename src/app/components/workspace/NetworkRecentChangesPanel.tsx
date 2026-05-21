import type { ReactElement } from "react";
import type { UndoHistoryEntry } from "../../types/app-controller";
import { TableEntryCountFooter } from "./TableEntryCountFooter";

interface NetworkRecentChangesPanelProps {
  entries: UndoHistoryEntry[];
}

export function NetworkRecentChangesPanel({ entries }: NetworkRecentChangesPanelProps): ReactElement | null {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="panel network-recent-changes-panel" aria-label="Recent changes for active network">
      <header className="network-recent-changes-header">
        <h2>Recent changes</h2>
      </header>
      <div className="network-recent-changes-list-shell">
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
      <TableEntryCountFooter count={entries.length} />
    </section>
  );
}

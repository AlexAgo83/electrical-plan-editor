## item_389_recent_changes_entry_labeling_and_time_format_contract - Recent-changes entry labeling and time-format contract
> From version: 0.9.14
> Understanding: 95%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Readable and deterministic recent-change entries for operators
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Raw action type names are not operator-friendly. `req_075` requires explicit readable labels, identifier-rich wording, and short local time formatting.

# Scope
- In:
  - Map internal action types to deterministic user-facing labels.
  - Include target identifier when available (example: `Wire W-001 updated`).
  - Render timestamp in local short format `HH:mm:ss`.
  - Exclude standalone undo/redo lines from the list.
- Out:
  - Localization framework changes.
  - Relative-time phrasing (`x minutes ago`).

# Acceptance criteria
- Entries show deterministic readable labels with identifier when available.
- Timestamp is rendered as local short time `HH:mm:ss`.
- Undo/redo control actions are not rendered as rows.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_075`, `item_387`, `item_388`.
- Blocks: `item_390`, `task_069`.
- Related AC: AC3, AC5.
- References:
  - `logics/request/req_075_network_scope_recent_changes_panel_from_undo_history.md`
  - `src/app/hooks/useStoreHistory.ts`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`

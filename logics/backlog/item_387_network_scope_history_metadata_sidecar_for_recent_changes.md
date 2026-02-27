## item_387_network_scope_history_metadata_sidecar_for_recent_changes - Network Scope history metadata sidecar for recent-changes rendering
> From version: 0.9.14
> Understanding: 96%
> Confidence: 93%
> Progress: 100%
> Complexity: Medium-High
> Theme: Undo-history observability model for operator-facing recent changes
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Undo/redo currently stores state snapshots only. `req_075` needs a readable "Recent changes" feed, which requires lightweight per-mutation metadata without introducing expensive state diffing.

# Scope
- In:
  - Add a bounded metadata sidecar aligned with undo stack lifecycle.
  - Persist enough fields for UI rendering: action type, target kind/id, network scope, timestamp.
  - Keep metadata inclusion rules aligned with history tracking (`trackHistory: true` only).
  - Keep undo/redo synchronization coherent between snapshot stack and metadata stack.
- Out:
  - Full before/after state diffing.
  - Cross-session persistent audit logs.

# Acceptance criteria
- Metadata entries are captured only for tracked business mutations.
- Metadata capacity follows the same history limit strategy as undo snapshots.
- Undo/redo operations keep metadata ordering and stack parity consistent.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_075`.
- Blocks: `item_388`, `item_389`, `item_390`, `task_069`.
- Related AC: AC2, AC3, AC6.
- References:
  - `logics/request/req_075_network_scope_recent_changes_panel_from_undo_history.md`
  - `src/app/hooks/useStoreHistory.ts`
  - `src/app/AppController.tsx`

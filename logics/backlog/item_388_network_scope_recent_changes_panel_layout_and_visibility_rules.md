## item_388_network_scope_recent_changes_panel_layout_and_visibility_rules - Network Scope recent-changes panel layout and visibility rules
> From version: 0.9.14
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: Network Scope UX composition for recent activity visibility
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Network Scope currently has no panel between the network list and edit form for surfacing recent tracked changes of the active network.

# Scope
- In:
  - Insert a new `Recent changes` panel between `Network Scope` and `Edit network`.
  - Render last 10 entries, newest first, with scrollable list behavior.
  - Apply active-network filtering to displayed entries.
  - Hide the full panel when active-network history count is 0.
  - Preserve responsive grid behavior and avoid layout regressions.
- Out:
  - New navigation routes or tabs.
  - Rework of existing `Network Scope` and `Edit network` business actions.

# Acceptance criteria
- Panel appears in the expected position between the two existing panels.
- Panel lists only active-network entries, newest first, capped to 10.
- Panel is not rendered when active-network history is empty.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_075`, `item_387`.
- Blocks: `item_389`, `item_390`, `task_069`.
- Related AC: AC1, AC2, AC4.
- References:
  - `logics/request/req_075_network_scope_recent_changes_panel_from_undo_history.md`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/app/styles/workspace/workspace-panels-and-responsive/workspace-panels-and-actions.css`

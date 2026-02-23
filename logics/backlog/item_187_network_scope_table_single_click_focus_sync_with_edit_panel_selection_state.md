## item_187_network_scope_table_single_click_focus_sync_with_edit_panel_selection_state - Network Scope Table Single-Click Focus Sync with Edit Panel Selection State
> From version: 0.7.2
> Understanding: 97%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Table Focus/Selection Synchronization for Network Scope Row Interactions
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
In `Network scope`, clicking a table row updates the edit panel content, but the row does not receive the expected focus/visual focus state until a second click. This creates a mismatch between selection-driven data updates and visible table focus feedback.

# Scope
- In:
  - Fix the `Network scope` row interaction so single-click updates both edit panel state and row focus/visual focus state.
  - Preserve keyboard focus behavior and table accessibility semantics.
  - Keep row focus and selected network state synchronized after create/edit flows that restore focus.
  - Add/adjust regression coverage for first-click focus behavior.
- Out:
  - Broad redesign of `Network scope` table interaction patterns.
  - New navigation shortcuts or multi-select behavior.

# Acceptance criteria
- A single click on a `Network scope` row updates the edit panel and applies the expected row focus/visual focus state.
- No second click is required to get visible focus on the row.
- Existing keyboard navigation/focus behavior remains functional.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_032`.
- Blocks: item_194.
- Related AC: AC1, AC8.
- References:
  - `logics/request/req_032_user_feedback_followup_network_scope_focus_minimum_numeric_constraints_empty_callout_suppression_settings_persistence_and_cavity_to_way_terminology.md`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/tests/app.ui.networks.spec.tsx`


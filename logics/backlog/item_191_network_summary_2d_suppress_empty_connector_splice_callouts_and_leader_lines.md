## item_191_network_summary_2d_suppress_empty_connector_splice_callouts_and_leader_lines - Network Summary 2D Suppress Empty Connector/Splice Callouts and Leader Lines
> From version: 0.7.2
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Reduce Diagram Noise by Hiding Empty Callout Artifacts
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
When callouts are enabled in `Network summary`, connectors/splices with no wires can still render empty callout artifacts. This adds visual clutter and reduces signal in the 2D view.

# Scope
- In:
  - Suppress rendering of connector/splice callouts when the computed wire list is empty.
  - Suppress all linked artifacts for empty callouts (frame, content, dashed leader line).
  - Preserve rendering/interaction for non-empty callouts.
  - Ensure fit/zoom/callout layering logic remains stable when some callouts are omitted.
  - Add/adjust regression coverage for empty-callout suppression.
- Out:
  - Changes to callout placement heuristics for non-empty callouts.
  - Callout content formatting redesign.

# Acceptance criteria
- No empty callout frame is rendered when a connector/splice has no wires to display.
- No leader line is rendered for suppressed empty callouts.
- Non-empty callouts continue to render and behave as expected.

# Priority
- Impact: Medium-High.
- Urgency: High.

# Notes
- Dependencies: `req_032`.
- Blocks: item_194.
- Related AC: AC5, AC8.
- References:
  - `logics/request/req_032_user_feedback_followup_network_scope_focus_minimum_numeric_constraints_empty_callout_suppression_settings_persistence_and_cavity_to_way_terminology.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/styles/canvas/canvas-diagram-and-overlays/network-callouts.css`
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`


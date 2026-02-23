## item_189_splice_port_count_minimum_value_guard_ui_and_submit_validation - Splice Port Count Minimum Value Guard (UI and Submit Validation)
> From version: 0.7.2
> Understanding: 98%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Defense-in-Depth Numeric Validation for Splice Port Count
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Splice `port` count can be set below `1`, which creates invalid edit state and risks persisting invalid topology metadata.

# Scope
- In:
  - Enforce minimum `1` on splice port count input at the form control level.
  - Enforce submit/update validation to prevent values `< 1` from being persisted.
  - Keep behavior consistent with connector/segment minimum-guard UX.
  - Add/adjust regression coverage for invalid splice port count handling.
- Out:
  - Redesign of splice form validation UX beyond the minimum guard.
  - Schema-wide validation changes unrelated to splice ports.

# Acceptance criteria
- Splice port count cannot be persisted below `1`.
- UI prevents or clearly rejects values `< 1` in create/edit flows.
- Regression tests cover the minimum-value guard path.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_032`.
- Blocks: item_194.
- Related AC: AC3, AC8.
- References:
  - `logics/request/req_032_user_feedback_followup_network_scope_focus_minimum_numeric_constraints_empty_callout_suppression_settings_persistence_and_cavity_to_way_terminology.md`
  - `src/app/components/workspace/ModelingSpliceFormPanel.tsx`
  - `src/app/hooks/useSpliceHandlers.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`


## item_188_connector_way_count_minimum_value_guard_ui_and_submit_validation - Connector Way Count Minimum Value Guard (UI and Submit Validation)
> From version: 0.7.2
> Understanding: 98%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Defense-in-Depth Numeric Validation for Connector Way Count
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Connector count input (currently backed by `cavityCount`) can be set below `1`, which allows invalid values to enter the edit flow and potentially be persisted.

# Scope
- In:
  - Enforce minimum `1` on connector count input (UI-level guard, e.g. `min=1`).
  - Enforce submit/update validation so values `< 1` cannot be persisted via manual typing or malformed form state.
  - Keep validation/error messaging aligned with existing connector form patterns.
  - Update tests for connector form validation and/or save prevention.
- Out:
  - Internal model field renaming (`cavityCount` -> `wayCount`) unless explicitly required in a separate refactor.
  - Changes to max bounds or advanced validation rules.

# Acceptance criteria
- Connector count input cannot persist a value below `1`.
- UI prevents or clearly rejects values `< 1` during create/edit flows.
- Regression tests cover the minimum-value guard path.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_032`.
- Blocks: item_194.
- Related AC: AC2, AC8.
- References:
  - `logics/request/req_032_user_feedback_followup_network_scope_focus_minimum_numeric_constraints_empty_callout_suppression_settings_persistence_and_cavity_to_way_terminology.md`
  - `src/app/components/workspace/ModelingConnectorFormPanel.tsx`
  - `src/app/hooks/useConnectorHandlers.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`


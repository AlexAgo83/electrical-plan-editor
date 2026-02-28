## req_081_canvas_tools_preference_selected_callout_only_visibility_override - Canvas tools preference for selected-callout-only visibility override
> From version: 0.9.18
> Status: Draft
> Understanding: 99%
> Confidence: 97%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Add a new option in `Canvas tools preferences` to display only the callout of the currently selected element.
- Keep this option disabled by default.
- When enabled, this option must override the full callout rendering mode (all connector/splice callouts).

# Context
- Current `Callouts` behavior in the 2D `Network summary` renders all eligible connector/splice callouts when enabled.
- On dense networks, this can create visual noise and reduce readability during focused inspection.
- Users need a focused mode where clicking/selecting an entity shows only its callout.

# Objective
- Introduce a focus-first callout display mode controlled from settings, without breaking existing default behavior.
- Keep persistence and "apply defaults now" semantics aligned with other canvas tool preferences.

# Scope
- In:
  - add a new `Canvas tools preferences` toggle for "selected callout only" behavior;
  - default value is `false` (disabled);
  - persist this preference in UI preferences storage and restore it on app reload;
  - apply the preference to `Network summary` callout rendering as an override over full callout mode;
  - add/update UI integration tests for default, persistence, and runtime visibility behavior.
- Out:
  - redesign of callout visual style, typography, or geometry;
  - changes to segment/node label rendering behavior;
  - manual callout pinning policy redesign.

# Locked execution decisions
- Decision 1: Option placement is in `Canvas tools preferences`.
- Decision 2: Default remains `off` to preserve current behavior for existing users.
- Decision 3: When enabled, filtering is selection-driven and overrides full callout visibility.
- Decision 4: Selection source is strictly the active store selection; hover/focus states must not affect selected-callout-only rendering.

# Functional behavior contract
- With `selected-callout-only = false`:
  - current behavior remains unchanged.
- With `selected-callout-only = true`:
  - if selected entity is a connector with a non-empty callout payload, only that connector callout is rendered;
  - if selected entity is a splice with a non-empty callout payload, only that splice callout is rendered;
  - if no entity is selected, or selected entity has no callout payload, no callout is rendered;
  - hover/focus-only states do not render callouts in this mode unless the store selection is eligible;
  - if global `Callouts` toggle is off, no callout is rendered regardless of selection.

# Acceptance criteria
- AC1: A new toggle exists in `Canvas tools preferences` for selected-callout-only visibility and is unchecked by default.
- AC2: The new preference is persisted and restored across remount/reload.
- AC3: Enabling selected-callout-only mode shows at most one callout, bound to current connector/splice selection.
- AC4: In selected-callout-only mode, selecting non-callout entities (for example segment/node/wire) renders no callout.
- AC5: Disabling selected-callout-only restores full callout rendering behavior (subject to existing `Callouts` toggle).
- AC6: `lint`, `typecheck`, and `test:ci` pass with updated callout/settings tests.

# Validation and regression safety
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted:
  - `src/tests/app.ui.settings-canvas-render.spec.tsx`
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Selection-driven filtering can feel inconsistent if selection state changes are not synchronized with callout rendering.
- Persistence wiring can drift if preference schema updates are incomplete.
- Existing tests asserting full-callout counts may need deterministic fixture updates.

# Backlog
- To create from this request:
  - `item_417_canvas_tools_selected_callout_only_preference_state_and_persistence.md`
  - `item_418_network_summary_callout_render_filter_bound_to_selection.md`
  - `item_419_selected_callout_only_ui_integration_regression_coverage.md`
  - `item_420_req_081_validation_matrix_and_closure_traceability.md`

# References
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/AppController.tsx`
- `src/tests/app.ui.settings-canvas-render.spec.tsx`
- `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `logics/request/req_032_user_feedback_followup_network_scope_focus_minimum_numeric_constraints_empty_callout_suppression_settings_persistence_and_cavity_to_way_terminology.md`

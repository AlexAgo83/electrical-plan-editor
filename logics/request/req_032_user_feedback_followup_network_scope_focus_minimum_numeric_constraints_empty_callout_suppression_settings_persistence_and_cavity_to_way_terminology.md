## req_032_user_feedback_followup_network_scope_focus_minimum_numeric_constraints_empty_callout_suppression_settings_persistence_and_cavity_to_way_terminology - User Feedback Follow-up: Network Scope Focus, Numeric Minimum Guards, Empty Callout Suppression, Settings Persistence Audit, and Cavity→Way Terminology
> From version: 0.7.2
> Understanding: 99%
> Confidence: 98%
> Complexity: Medium
> Theme: UX/Data-Entry Safeguards and Terminology Cleanup from Real User Feedback
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Fix a `Network scope` table focus bug where clicking a row updates the edit panel but the row focus/visual focus state is only applied after a second click.
- Prevent entering values lower than `1` for connector `cavities`.
- Prevent entering values lower than `1` for splice `ports`.
- In the 2D `Network summary`, do not render a connector/splice callout when it has no wires to display (empty wire list).
- Prevent entering values lower than `1` for segment `length`.
- Verify and harden local persistence of `Settings` values (UI preferences must persist reliably across reloads).
- Replace user-facing terminology `Cavity / Cavities` with `Way / Ways`.

# Context
Recent iterations added substantial UX features in `Network summary`, `Settings`, theming, and modeling/analysis workflows. New user feedback highlights a set of practical issues that reduce usability in everyday use:

1. A focus synchronization bug in `Network scope` table interactions.
2. Missing lower-bound guards on key numeric inputs (`cavities`, `ports`, `segment length`).
3. Visual noise from empty connector/splice callouts in the 2D diagram.
4. Need for confidence that `Settings` are consistently persisted locally.
5. Product terminology update from `Cavity/Cavities` to `Way/Ways` for user-facing UI text.

These items are small-to-medium individually, but together form a coherent user-feedback polish pass and should be delivered with regression coverage.

## Objectives
- Restore single-click focus behavior in `Network scope` so visual focus and edit panel updates stay synchronized.
- Enforce minimum numeric values (`>= 1`) on connector ways, splice ports, and segment lengths in the UI and submit/update paths.
- Suppress empty 2D callouts when no wire content exists.
- Confirm `Settings` preference persistence remains correct and add/adjust tests where needed.
- Apply the `Way / Ways` terminology consistently across user-facing UI without destabilizing the internal model unless required.

## Functional Scope
### A. `Network scope` row focus bug fix (high priority)
- Fix the `Network scope` interaction so a single click on a row applies the expected row focus/visual focus state in the table.
- Current observed behavior to eliminate:
  - first click updates the edit panel content
  - but the focused row styling/focus state is not applied until a second click
- Ensure selection/focus behavior remains keyboard-accessible and does not regress edit/open actions.
- If row focus is driven by a deferred effect/token mechanism, align timing/order so focus state and panel updates happen coherently on first interaction.

### B. Minimum value guard for connector `cavities` (rename target: `ways`) (high priority)
- In connector forms/UI, users must not be able to set a value lower than `1` for the count field currently represented as `cavityCount`.
- Required behavior (V1 baseline):
  - input-level guard (`min=1` where applicable)
  - submit/update guard (validation and/or clamp) so invalid values cannot be persisted via manual typing
- Error messaging (if validation path is used) should be clear and user-facing.
- Imported legacy data handling (if value `< 1` exists) must be explicitly defined (reject, normalize, or display-with-fix prompt).

### C. Minimum value guard for splice `ports` (high priority)
- In splice forms/UI, users must not be able to set `portCount < 1`.
- Apply the same defense-in-depth approach as connectors:
  - input-level minimum
  - submit/update validation/normalization guard
- Preserve existing edit flows and validation UX conventions.

### D. Minimum value guard for segment `length` (high priority)
- In segment forms/UI, users must not be able to set `length < 1` (mm).
- Apply the same defense-in-depth approach:
  - input-level minimum
  - submit/update guard preventing invalid persisted values
- Ensure downstream calculations/routing behavior do not receive zero/negative lengths from interactive editing.

### E. 2D callout suppression when wire list is empty (high priority)
- When cable callouts are enabled in `Network summary`, do not render a callout frame for a connector/splice if the computed callout wire list is empty.
- Suppression must include all linked visual artifacts for that callout:
  - callout frame
  - callout text/content
  - leader/dashed line
- Behavior should be deterministic and compatible with existing callout toggles, drag persistence, and fit/zoom logic.
- Non-empty callouts continue to render normally.

### F. Settings persistence verification and hardening (medium-high priority)
- Audit the `Settings` preferences persistence flow (local storage / hydration / reset defaults) and ensure values persist reliably across reloads.
- Confirm behavior for recently added settings, including but not limited to:
  - theme / table display preferences
  - canvas defaults and render preferences
  - shortcut preferences
  - floating inspector visibility
  - workspace panel layout preference
- Add/adjust regression tests for settings persistence where gaps exist.
- If any settings are intentionally non-persistent, document that behavior explicitly.

### G. User-facing terminology change: `Cavity/Cavities` -> `Way/Ways` (high priority)
- Replace user-facing UI terminology `Cavity` / `Cavities` with `Way` / `Ways`.
- Scope includes visible labels, table headers, form labels, helper text, badges, empty states, and validation/user messages.
- Prefer preserving internal technical/model field names (`cavityCount`, etc.) unless a broader refactor is required and justified.
- Keep singular/plural correctness (`Way`, `Ways`) and avoid mixed terminology in the same UI flow.
- Update tests that assert visible copy.

## Non-functional requirements
- Preserve existing behavior for valid numeric values and standard edit flows.
- Keep terminology changes isolated to user-facing strings where possible.
- Avoid introducing regressions in `Network summary` callout drag/render performance.
- Maintain compatibility with persisted UI preferences and existing local storage schema/versioning strategy.

## Validation and regression safety
- Targeted tests (minimum, depending on touched areas):
  - `src/tests/app.ui.settings.spec.tsx` (settings persistence and related toggles/preferences)
  - `src/tests/app.ui.networks.spec.tsx` and/or network-scope-focused UI tests (row focus behavior)
  - `src/tests/app.ui.navigation-canvas.spec.tsx` or `src/tests/app.ui.network-summary-workflow-polish.spec.tsx` (callout rendering suppression)
  - modeling form/table UI tests covering connector/splice/segment validation behavior
- Closure validation (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`

## Acceptance criteria
- AC1: In `Network scope`, a single click on a row applies the expected row focus/visual focus state while also updating the edit panel (no second click required).
- AC2: Connectors cannot be saved/updated with a `cavity/way` count below `1`, and UI input prevents or clearly rejects such values.
- AC3: Splices cannot be saved/updated with a `port` count below `1`, and UI input prevents or clearly rejects such values.
- AC4: Segments cannot be saved/updated with `length < 1` (mm), and UI input prevents or clearly rejects such values.
- AC5: In 2D `Network summary`, connector/splice callouts with no wires are not rendered (including no empty frame and no leader line).
- AC6: `Settings` values are persisted locally across reloads for supported preferences, and regression tests cover the persistence wiring for affected settings.
- AC7: User-facing UI terminology uses `Way / Ways` instead of `Cavity / Cavities` consistently across impacted screens and messages.
- AC8: Validation suites and Logics lint pass with traceability documented.

## Out of scope
- Full domain/model renaming from `cavity*` fields to `way*` fields across persistence/schema/export contracts (unless explicitly required in a follow-up request).
- Broad redesign of network-scope table interactions beyond fixing the single-click focus bug.
- Changes to callout placement heuristics, callout typography, or leader-line styling (except suppression of empty callouts).
- Global validation-rule redesign beyond the specified minimum guards.

# Backlog
- `logics/backlog/item_187_network_scope_table_single_click_focus_sync_with_edit_panel_selection_state.md`
- `logics/backlog/item_188_connector_way_count_minimum_value_guard_ui_and_submit_validation.md`
- `logics/backlog/item_189_splice_port_count_minimum_value_guard_ui_and_submit_validation.md`
- `logics/backlog/item_190_segment_length_minimum_value_guard_ui_and_submit_validation.md`
- `logics/backlog/item_191_network_summary_2d_suppress_empty_connector_splice_callouts_and_leader_lines.md`
- `logics/backlog/item_192_settings_local_persistence_audit_and_regression_coverage_for_ui_preferences.md`
- `logics/backlog/item_193_user_facing_cavity_to_way_terminology_replacement_with_copy_and_test_updates.md`
- `logics/backlog/item_194_req_032_user_feedback_polish_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# References
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/components/workspace/ModelingConnectorFormPanel.tsx`
- `src/app/components/workspace/ModelingSpliceFormPanel.tsx`
- `src/app/components/workspace/ModelingSegmentFormPanel.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `src/tests/app.ui.networks.spec.tsx`

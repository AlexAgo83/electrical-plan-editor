## task_032_user_feedback_followup_network_scope_focus_numeric_guards_empty_callout_suppression_settings_persistence_and_cavity_to_way_terminology_orchestration_and_delivery_control - User Feedback Follow-up Orchestration and Delivery Control (Network Scope Focus, Numeric Guards, Empty Callout Suppression, Settings Persistence, and Cavity→Way Terminology)
> From version: 0.7.2
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Delivery Orchestration for Multi-Area UX/Data Validation Polish from User Feedback
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_032`. This task coordinates a user-feedback-driven polish pass spanning:
- `Network scope` row focus synchronization (single-click focus bug),
- numeric minimum guards for connector ways (internally `cavityCount`), splice ports, and segment length,
- 2D callout suppression when no wires are available,
- `Settings` local persistence verification/hardening,
- user-facing terminology replacement `Cavity/Cavities` -> `Way/Ways`.

The work touches multiple UI workflows and should be delivered in small waves with explicit regression coverage and closure validation.

Backlog scope covered:
- `item_187_network_scope_table_single_click_focus_sync_with_edit_panel_selection_state.md`
- `item_188_connector_way_count_minimum_value_guard_ui_and_submit_validation.md`
- `item_189_splice_port_count_minimum_value_guard_ui_and_submit_validation.md`
- `item_190_segment_length_minimum_value_guard_ui_and_submit_validation.md`
- `item_191_network_summary_2d_suppress_empty_connector_splice_callouts_and_leader_lines.md`
- `item_192_settings_local_persistence_audit_and_regression_coverage_for_ui_preferences.md`
- `item_193_user_facing_cavity_to_way_terminology_replacement_with_copy_and_test_updates.md`
- `item_194_req_032_user_feedback_polish_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 `Network scope` single-click row focus synchronization fix and regression coverage (`item_187`)
- [ ] 2. Deliver Wave 1 connector minimum count guard (`>= 1`) with UI + submit validation and tests (`item_188`)
- [ ] 3. Deliver Wave 2 splice port minimum guard (`>= 1`) with UI + submit validation and tests (`item_189`)
- [ ] 4. Deliver Wave 3 segment length minimum guard (`>= 1 mm`) with UI + submit validation and tests (`item_190`)
- [ ] 5. Deliver Wave 4 `Network summary` suppression of empty connector/splice callouts (+ leader lines) and regression coverage (`item_191`)
- [ ] 6. Deliver Wave 5 settings local persistence audit/hardening + persistence regression coverage (`item_192`)
- [ ] 7. Deliver Wave 6 user-facing terminology replacement `Cavity/Cavities` -> `Way/Ways` + copy/test updates (`item_193`)
- [ ] 8. Deliver Wave 7 closure: CI-equivalent validation, AC traceability, and Logics updates (`item_194`)
- [ ] FINAL: Update related Logics docs (request/task/backlog progress + delivery summary)

# Validation
- Documentation / Logics:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static analysis / compile safety:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run quality:ui-modularization`
  - `npm run quality:store-modularization`
- Automated tests:
  - Targeted runs during implementation (recommended):
    - `src/tests/app.ui.networks.spec.tsx` (Network scope row focus behavior)
    - `src/tests/app.ui.settings.spec.tsx` (settings persistence + preference wiring)
    - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx` and/or `src/tests/app.ui.navigation-canvas.spec.tsx` (callout suppression / canvas regressions)
    - Modeling form-related UI tests covering connector/splice/segment validation behavior
  - `npm run test:ci`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 (Network scope row focus sync): pending
  - Wave 1 (connector minimum guard): pending
  - Wave 2 (splice minimum guard): pending
  - Wave 3 (segment minimum guard): pending
  - Wave 4 (empty callout suppression): pending
  - Wave 5 (settings persistence audit): pending
  - Wave 6 (Cavity->Way terminology): pending
  - Wave 7 (closure + AC traceability): pending
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Fixing row focus may interact with existing deferred focus restoration/token flows in `Network scope`.
  - Input-level `min` attributes alone may not block invalid typed values; submit path guards are required.
  - Empty-callout suppression may accidentally desynchronize callout leader-line rendering or fit-content bounds if filtering is not centralized.
  - Terminology replacement may unintentionally affect internal identifiers or test fixtures if search/replace is too broad.
  - Settings persistence audit may reveal inconsistencies across recently added preferences.
- Mitigation strategy:
  - Land row-focus fix and each numeric guard in isolated waves with targeted tests.
  - Use defense-in-depth validation (UI control + submit/update guard) for numeric fields.
  - Centralize callout visibility filtering on computed wire-list content before rendering all callout artifacts.
  - Restrict terminology changes to user-facing strings first; review model identifiers separately.
  - Run `app.ui.settings` persistence coverage before and after changes to confirm no drift.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` pending for these new planning artifacts.
- Delivery snapshot:
  - Pending.
- AC traceability (`req_032`) target mapping:
  - AC1 -> `item_187`, `item_194`
  - AC2 -> `item_188`, `item_194`
  - AC3 -> `item_189`, `item_194`
  - AC4 -> `item_190`, `item_194`
  - AC5 -> `item_191`, `item_194`
  - AC6 -> `item_192`, `item_194`
  - AC7 -> `item_193`, `item_194`
  - AC8 -> `item_194` (+ targeted regressions from items 187-193)

# References
- `logics/request/req_032_user_feedback_followup_network_scope_focus_minimum_numeric_constraints_empty_callout_suppression_settings_persistence_and_cavity_to_way_terminology.md`
- `logics/backlog/item_187_network_scope_table_single_click_focus_sync_with_edit_panel_selection_state.md`
- `logics/backlog/item_188_connector_way_count_minimum_value_guard_ui_and_submit_validation.md`
- `logics/backlog/item_189_splice_port_count_minimum_value_guard_ui_and_submit_validation.md`
- `logics/backlog/item_190_segment_length_minimum_value_guard_ui_and_submit_validation.md`
- `logics/backlog/item_191_network_summary_2d_suppress_empty_connector_splice_callouts_and_leader_lines.md`
- `logics/backlog/item_192_settings_local_persistence_audit_and_regression_coverage_for_ui_preferences.md`
- `logics/backlog/item_193_user_facing_cavity_to_way_terminology_replacement_with_copy_and_test_updates.md`
- `logics/backlog/item_194_req_032_user_feedback_polish_closure_ci_e2e_build_pwa_and_ac_traceability.md`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/components/workspace/ModelingConnectorFormPanel.tsx`
- `src/app/components/workspace/ModelingSpliceFormPanel.tsx`
- `src/app/components/workspace/ModelingSegmentFormPanel.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/tests/app.ui.networks.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `.github/workflows/ci.yml`
- `package.json`


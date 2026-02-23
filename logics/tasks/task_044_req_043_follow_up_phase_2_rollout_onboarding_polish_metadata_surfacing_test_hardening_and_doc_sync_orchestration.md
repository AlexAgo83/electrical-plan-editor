## task_044_req_043_follow_up_phase_2_rollout_onboarding_polish_metadata_surfacing_test_hardening_and_doc_sync_orchestration - req_043 Follow-up Orchestration: Phase-2 Rollout, Onboarding Polish, Metadata Surfacing, Test Hardening, and Documentation Sync
> From version: 0.8.0
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Very High
> Theme: Follow-up Delivery Orchestration for Post req_035-042 UX, Surfacing, Hardening, and Closure Work
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_043`, which consolidates follow-up work after the baseline delivery of `req_035` through `req_042`.

This task coordinates execution of:
- onboarding UX polish + onboarding copy refresh
- edit-form `Save` row-focus restoration ergonomics
- connector/splice auto-node creation checkbox + Settings default preset
- panel action-row consistency (`Help` placement) + `Network Scope` export action
- phase-2 rollout of the reusable table filter bar to remaining table panels
- optional metadata surfacing in additional views (wire / connector / splice)
- test hardening (JSDOM canvas mock + E2E onboarding-dismiss helper cleanup)
- `README.md` review/update + `logics` closure/traceability sync + manual QA checklist

This task does not replace request-specific implementation judgment, but it defines sequencing, validation discipline, commit discipline, and documentation synchronization expectations for the full `req_043` follow-up bundle.

# Objective
- Deliver all in-scope work described by `req_043` in checkpointed waves with controlled regression risk.
- Preserve the behavior shipped in `req_035` through `req_042` while applying follow-up improvements.
- Enforce validation gates and commits between waves.
- Finish with synchronized documentation updates across all related `.md` artifacts and a clear closure snapshot.

# Scope
- In:
  - Wave-based execution order for the full `req_043` follow-up bundle
  - Validation and commit gates between waves
  - Cross-feature sequencing and collision tracking (onboarding, table panels, forms, settings, tests, docs)
  - Final documentation synchronization across request/task/backlog/closure docs and QA notes
- Out:
  - Rewriting or superseding the original `req_035`...`req_042` requirements
  - Large product redesigns beyond the follow-up scope already captured in `req_043`
  - Git history rewrite/squash strategy (unless explicitly requested)

# Backlog scope covered
- `logics/backlog/item_255_table_filter_bar_phase_2_rollout_to_connectors_splices_nodes_and_segments_panels.md`
- `logics/backlog/item_256_wire_metadata_follow_up_surfacing_for_section_mm2_and_color_in_tables_inspector_and_optional_exports.md`
- `logics/backlog/item_257_connector_splice_and_wire_optional_reference_metadata_follow_up_surfacing_in_views_and_optional_exports.md`
- `logics/backlog/item_258_test_hardening_canvas_jsdom_mock_and_e2e_onboarding_dismiss_helper_refactor.md`
- `logics/backlog/item_259_req_035_to_req_042_logics_closure_traceability_status_updates_and_defer_mapping.md`
- `logics/backlog/item_260_manual_qa_checklist_for_req_035_to_req_042_follow_up_bundle.md`
- `logics/backlog/item_261_req_043_follow_up_rollout_hardening_and_closure_ci_build_pwa_e2e_traceability.md`
- `logics/backlog/item_262_onboarding_follow_up_icon_badges_primary_next_button_and_connectors_splices_dual_cta_polish.md`
- `logics/backlog/item_263_contextual_onboarding_splices_panel_scroll_parity_and_navigation_focus_behavior.md`
- `logics/backlog/item_264_edit_forms_save_restores_focus_to_edited_table_row_ergonomics.md`
- `logics/backlog/item_265_connector_splice_auto_node_creation_checkbox_and_settings_default_preset.md`
- `logics/backlog/item_266_table_panel_action_row_help_button_alignment_and_network_scope_export_action.md`
- `logics/backlog/item_267_onboarding_copy_refresh_for_req_036_to_req_042_feature_additions.md`
- `logics/backlog/item_268_readme_review_and_feature_documentation_refresh_for_req_035_to_req_043_changes.md`

# Attention points (mandatory delivery discipline)
- **Wave-based delivery is mandatory:** implement in small waves with explicit checkpoints (no monolithic batch).
- **Validation gate after every wave:** run and record the required validations before moving on.
- **Checkpoint commit after every wave:** create a commit after each completed wave with a clear message referencing the delivered follow-up scope.
- **Final gate must include all validation types:** Logics lint, static checks, unit/integration tests, build, PWA quality, and E2E.
- **Documentation synchronization is mandatory at the end:** update all impacted `.md` files (request/task/backlog/closure/QA docs) to reflect what was actually delivered, deferred, and validated.

# Execution strategy (recommended wave order)
Rationale:
- Start with onboarding polish/copy because it is visible and relatively isolated.
- Apply save-focus and create-flow toggles next while form context is localized.
- Stabilize panel action-row layout before broad filter-bar rollout.
- Roll out table filters and metadata surfacing once panel header/layout patterns are set.
- Run test hardening before/alongside later UI work when practical to reduce iteration noise.
- Finish with docs synchronization + QA checklist + closure validation.

# Plan
- [ ] Wave 0. Test hardening early pass (`item_258`) to reduce JSDOM canvas noise and centralize E2E onboarding-dismiss helper logic (recommended early)
- [ ] Wave 1. Onboarding UX polish (`item_262`, `item_263`) and onboarding copy refresh for new req_036-042 fields/features (`item_267`)
- [ ] Wave 2. Edit-form `Save` row-focus restoration ergonomics across in-scope table-backed forms (`item_264`)
- [ ] Wave 3. Connector/splice auto-node creation checkbox + Settings default preset (`item_265`)
- [ ] Wave 4. Panel action-row consistency (`Help` alignment) + `Network Scope` export action (`item_266`)
- [ ] Wave 5. Table filter-bar phase-2 rollout to `Connectors`, `Splices`, `Nodes`, `Segments` (`item_255`)
- [ ] Wave 6. Optional metadata surfacing in additional views (wire/connector/splice; optional export additions as low-risk) (`item_256`, `item_257`)
- [ ] Wave 7. README review/update (`item_268`), Logics closure/traceability updates (`item_259`), and manual QA checklist (`item_260`)
- [ ] Wave 8. Final closure validation, CI-equivalent checks, build/PWA/E2E, AC traceability, and delivery report (`item_261`)
- [ ] FINAL. Update all related `.md` files to final state (request/task/backlog items/closure notes/QA docs) and verify no stale statuses remain

# Validation gates
## A. Minimum wave gate (apply after each Wave 0-7)
- Documentation (when `.md` changed):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static checks:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:ui-modularization`
  - `npm run -s quality:store-modularization`
- Tests/build:
  - Targeted tests for touched features/panels (recommended first)
  - `npm run -s test:ci`
  - `npm run -s build`

## B. Final closure gate (mandatory at Wave 8)
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s test:ci`
- `npm run -s build`
- `npm run -s quality:pwa`
- `npm run -s test:e2e`

## C. Commit gate (apply after each Wave 0-8 and FINAL docs sync if separate)
- Commit only after the wave validation gate passes (green checkpoint preferred).
- Commit message must reference the delivered follow-up wave/scope (and `req_043` if useful).
- Update this task report after each wave with:
  - wave status
  - validation snapshot
  - commit SHA
  - blockers/deviations/defers

# Cross-feature dependency / collision watchlist
- Onboarding files are touched by multiple follow-up asks:
  - icon badges, CTA styling, dual CTA actions, contextual scroll parity, copy refresh
  - Risk: regressions in modal layout, CTA behavior, or onboarding tests
- Table panel header/action rows are shared UX surfaces:
  - filter-bar rollout + `Help` alignment + panel-specific buttons (`CSV`, `Export`)
  - Risk: layout regressions and inconsistent control grouping across panels
- Form handlers/state/settings are coupled for connector/splice create ergonomics:
  - auto-node checkbox + settings preset + save-focus restoration
  - Risk: subtle create/edit behavior regressions
- Metadata surfacing can touch tables/inspectors/exports:
  - Risk: duplicated formatting logic, noisy tables, or export schema churn
- Test hardening changes can hide real issues if over-broad:
  - Risk: mocking canvas too aggressively or suppressing onboarding coverage in E2E

# Mitigation strategy
- Land onboarding changes with targeted onboarding/UI tests before moving on.
- Keep panel layout changes and filter-rollout changes in separate waves where possible.
- Reuse shared components/helpers (`TableFilterBar`, existing icons, export utilities) rather than duplicating.
- Scope save-focus restoration to table-backed forms only and document panel defers explicitly.
- Prioritize inspector surfacing for longer metadata fields to avoid table clutter.
- Keep test hardening minimal and transparent (test-only mocks/helpers, no production logic shortcuts).
- Maintain explicit defer notes in the task report and final `.md` sync pass.

# Report
- Wave status:
  - Wave 0 (test hardening early pass): pending
  - Wave 1 (onboarding polish + copy refresh): pending
  - Wave 2 (save-focus row restoration): pending
  - Wave 3 (connector/splice auto-node checkbox + settings preset): pending
  - Wave 4 (action-row consistency + Network Scope export): pending
  - Wave 5 (filter-bar phase-2 rollout): pending
  - Wave 6 (metadata surfacing): pending
  - Wave 7 (README + Logics closure + QA checklist): pending
  - Wave 8 (final closure validation + AC traceability): pending
  - FINAL (`.md` synchronization verification): pending
- Checkpoint commits:
  - Wave 0: pending
  - Wave 1: pending
  - Wave 2: pending
  - Wave 3: pending
  - Wave 4: pending
  - Wave 5: pending
  - Wave 6: pending
  - Wave 7: pending
  - Wave 8: pending
  - FINAL: pending
- Current blockers:
  - None at kickoff.
- Validation snapshot (kickoff):
  - `req_043` drafted and updated with follow-up scope/decisions ✅
- Delivery snapshot:
  - No implementation started under `task_044` yet.
- Documentation synchronization checklist (to complete at end):
  - `req_043` final delivered scope/defers/AC traceability updated
  - `task_044` progress/report/validation/commit SHAs updated
  - related `item_255`...`item_268` statuses/notes updated
  - any touched prior tasks/closure notes updated with defer references as needed
  - manual QA checklist doc/status updated
  - README review outcome recorded (changed or no-change rationale)

# References
- `logics/request/req_043_post_req_035_to_req_042_phase_2_rollout_optional_metadata_surfacing_test_hardening_and_delivery_closure.md`
- `logics/tasks/task_043_super_orchestration_delivery_execution_for_req_035_to_req_042_with_validation_gates_and_stepwise_commits.md`
- `logics/backlog/item_255_table_filter_bar_phase_2_rollout_to_connectors_splices_nodes_and_segments_panels.md`
- `logics/backlog/item_256_wire_metadata_follow_up_surfacing_for_section_mm2_and_color_in_tables_inspector_and_optional_exports.md`
- `logics/backlog/item_257_connector_splice_and_wire_optional_reference_metadata_follow_up_surfacing_in_views_and_optional_exports.md`
- `logics/backlog/item_258_test_hardening_canvas_jsdom_mock_and_e2e_onboarding_dismiss_helper_refactor.md`
- `logics/backlog/item_259_req_035_to_req_042_logics_closure_traceability_status_updates_and_defer_mapping.md`
- `logics/backlog/item_260_manual_qa_checklist_for_req_035_to_req_042_follow_up_bundle.md`
- `logics/backlog/item_261_req_043_follow_up_rollout_hardening_and_closure_ci_build_pwa_e2e_traceability.md`
- `logics/backlog/item_262_onboarding_follow_up_icon_badges_primary_next_button_and_connectors_splices_dual_cta_polish.md`
- `logics/backlog/item_263_contextual_onboarding_splices_panel_scroll_parity_and_navigation_focus_behavior.md`
- `logics/backlog/item_264_edit_forms_save_restores_focus_to_edited_table_row_ergonomics.md`
- `logics/backlog/item_265_connector_splice_auto_node_creation_checkbox_and_settings_default_preset.md`
- `logics/backlog/item_266_table_panel_action_row_help_button_alignment_and_network_scope_export_action.md`
- `logics/backlog/item_267_onboarding_copy_refresh_for_req_036_to_req_042_feature_additions.md`
- `logics/backlog/item_268_readme_review_and_feature_documentation_refresh_for_req_035_to_req_043_changes.md`
- `src/app/components/onboarding/OnboardingModal.tsx`
- `src/app/lib/onboarding.ts`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/components/workspace/TableFilterBar.tsx`
- `src/app/hooks/useConnectorHandlers.ts`
- `src/app/hooks/useSpliceHandlers.ts`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/tests/setup.ts`
- `tests/e2e/smoke.spec.ts`
- `README.md`
- `package.json`
- `.github/workflows/ci.yml`

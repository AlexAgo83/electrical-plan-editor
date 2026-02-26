## task_066_req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability_orchestration_and_delivery_control - req_068 review follow-ups hardening, coverage, bundle perf, and test reliability orchestration and delivery control
> From version: 0.9.10
> Understanding: 96% (umbrella orchestration for phased engineering-quality improvements spanning reducer/catalog hardening, CI signal, bundle performance, and form-validation consistency)
> Confidence: 90% (scope is broad but manageable with phased execution and strict validation gates)
> Progress: 0%
> Complexity: High
> Theme: Quality follow-up orchestration after broad project review
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
`req_068` formalizes cross-cutting review findings into an umbrella quality initiative. The request is intentionally broad, so delivery must be phased to avoid blocking feature work.

Default execution strategy from `req_068`:
- quick wins first
- non-blocking CI signals before strict gates
- measured perf work before hard thresholds
- `test:ci` remains canonical while segmented helpers may be added

# Objective
- Deliver `req_068` in pragmatic phases while preserving current green baseline behavior.
- Keep improvements measurable and reversible where possible.
- Synchronize `logics` docs as each phase lands.

# Scope
- In:
  - Orchestrate `item_369`..`item_377`
  - Enforce phase-by-phase validation gates
  - Keep `test:ci` canonical during CI tooling changes
  - Track deferred decisions/rationale explicitly if any sub-scope is postponed
- Out:
  - Feature-domain changes unrelated to review findings
  - Large architecture rewrites
  - Blocking feature delivery on full umbrella completion

# Backlog scope covered
- `logics/backlog/item_369_reducer_hardening_for_wire_fuse_catalog_link_normalization_and_catalog_ref_canonical_policy.md`
- `logics/backlog/item_370_catalog_csv_import_alignment_with_case_insensitive_manufacturer_reference_policy.md`
- `logics/backlog/item_371_catalog_reference_conflict_detection_surfacing_for_load_and_legacy_bootstrap_paths.md`
- `logics/backlog/item_372_ui_coverage_reporting_visibility_for_src_app_non_blocking_ci_signal.md`
- `logics/backlog/item_373_test_ci_segmentation_commands_and_slow_test_top_n_observability.md`
- `logics/backlog/item_374_bundle_size_measurement_reporting_and_non_blocking_budget_baseline.md`
- `logics/backlog/item_375_bundle_code_splitting_quick_wins_and_lazy_loading_regression_safety.md`
- `logics/backlog/item_376_form_validation_consistency_doctrine_and_wire_catalog_targeted_harmonization.md`
- `logics/backlog/item_377_regression_coverage_for_req_068_quality_followups_hardening_ci_perf_and_validation_consistency.md`

# Phase plan
- [ ] Phase 1 (Quick wins hardening): deliver `item_369`, `item_370`, `item_371`
- [ ] Phase 1 regression coverage updates: deliver relevant parts of `item_377`
- [ ] Phase 2 (Quality signal / CI observability): deliver `item_372`, `item_373`
- [ ] Phase 3 (Bundle measurement + perf quick wins): deliver `item_374`, `item_375`
- [ ] Phase 4 (Validation consistency review and targeted harmonization): deliver `item_376`
- [ ] Final regression sweep and close `item_377`
- [ ] FINAL: sync request/backlog/task docs and record delivery notes

# Validation gates
## Minimum gate (after each phase)
- `npm run -s lint`
- `npm run -s typecheck`
- targeted tests for touched scope

## Full gate (before task closure)
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:pwa`
- `npm run -s build`
- `npm run -s test:ci`
- `npm run -s test:e2e`

# Delivery notes guardrails
- Preserve `test:ci` as canonical full-suite command even if segmented commands are added.
- Prefer CI-visible informational reporting before strict thresholds (UI coverage, bundle budgets).
- Do not silently auto-rename catalog references during normal runtime/import conflict handling unless explicitly scoped.
- Keep feature behavior stable; if trade-offs are required, document rationale in `req_068` / task report.

# Report
- Current blockers: none.
- Risks to track:
  - Scope creep across phases (umbrella request turns into long-running “cleanup” stream).
  - CI signal additions becoming noisy or ignored if not clearly labeled.
  - Bundle split changes regressing lazy-loading UX or PWA behavior.
  - Validation consistency work causing UX churn across forms without clear doctrine adoption.
- Execution recommendation:
  - Start with Phase 1 quick wins immediately (`item_369`..`item_371`) before perf/test tooling work.

# References
- `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`
- `vite.config.ts`
- `package.json`
- `src/store/reducer/wireReducer.ts`
- `src/store/reducer/catalogReducer.ts`
- `src/store/catalog.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/tests/app.ui.list-ergonomics.spec.tsx`

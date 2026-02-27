## task_071_super_orchestration_delivery_execution_for_req_077_and_req_078_with_validation_gates - Super orchestration delivery execution for req_077 and req_078 with validation gates
> From version: 0.9.16
> Understanding: 99% (orchestration now includes locked implementation contracts for timestamp normalization and changelog lazy-loading)
> Confidence: 96% (decision ambiguity is reduced by explicit deterministic policies)
> Progress: 0%
> Complexity: High
> Theme: Cross-request delivery orchestration for reliability hardening and UX/export follow-ups
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
This super-orchestration task coordinates delivery for:
- `req_077` review follow-up hardening across persistence/import/export contracts.
- `req_078` UX/export follow-ups for update-ready glow behavior, timestamped filenames, and Home changelog lazy loading.

The queue is cross-cutting and touches critical paths:
- persistence adapters and migrations,
- portability import/export adapters,
- app export hook behavior,
- Home and header UI behaviors.

# Objective
- Deliver `req_077` and `req_078` in a controlled sequence with explicit quality gates.
- Minimize regressions in persistence safety, import/export compatibility, and UI behavior.
- Keep one orchestration source of truth for progress, blockers, and closure readiness.

# Scope
- In:
  - Orchestrate backlog items `item_398`..`item_408`.
  - Define execution order, validation gates, and checkpoint discipline.
  - Track cross-request collision risks (version contract, timestamp normalization, export behavior, Home lazy loading).
  - Require synchronized request/backlog/task status updates at closure.
- Out:
  - New feature scope outside `req_077` and `req_078`.
  - Git history rewrite strategy.

# Request scope covered
- `logics/request/req_077_review_followups_persistence_version_sync_import_normalization_and_export_hardening.md`
- `logics/request/req_078_update_app_button_breathing_glow_and_timestamped_save_filename.md`

# Backlog scope covered
- `logics/backlog/item_398_persistence_load_guard_when_storage_read_throws_and_safe_fallback_continuity.md`
- `logics/backlog/item_399_app_release_version_single_source_of_truth_from_package_json.md`
- `logics/backlog/item_400_network_import_timestamp_normalization_and_warning_diagnostics.md`
- `logics/backlog/item_401_persistence_save_state_created_at_stability_without_full_payload_reparse.md`
- `logics/backlog/item_402_csv_export_formula_injection_neutralization_contract.md`
- `logics/backlog/item_403_json_export_download_revoke_timing_hardening.md`
- `logics/backlog/item_404_req_077_hardening_bundle_closure_validation_and_traceability.md`
- `logics/backlog/item_405_update_app_button_breathing_glow_motion_policy_and_theme_safety.md`
- `logics/backlog/item_406_timestamped_network_export_filename_contract_scope_preservation.md`
- `logics/backlog/item_407_home_changelog_feed_progressive_lazy_loading_on_scroll.md`
- `logics/backlog/item_408_req_078_update_glow_export_filename_and_changelog_lazy_loading_closure_validation_and_traceability.md`

# Attention points (mandatory delivery discipline)
- Validation gate after each wave before moving forward.
- Keep each hardening decision deterministic and test-backed.
- No schema drift or silent export contract changes.
- No hidden behavior changes in PWA update flow, Ctrl/Cmd+S export path, or Home ordering.

# Locked implementation decisions
- Import timestamp normalization (`item_400`):
  - capture `importBaseIso` once per import,
  - invalid/valid pair fallback by counterpart copy,
  - both invalid => both set to `importBaseIso`,
  - enforce `updatedAt >= createdAt` after normalization.
- Home changelog lazy loading (`item_407`):
  - initial batch = `4`,
  - incremental batch = `+4`,
  - bottom sentinel + `IntersectionObserver` trigger.

# Recommended execution strategy
Rationale:
- Deliver `req_077` first because it defines foundational safety contracts (version source, timestamps, export hardening) that `req_078` export filename refinements depend on.
- Then deliver `req_078` UI/export enhancements and complete closure traceability.

# Plan
- [ ] Step 1. Deliver persistence load guard and save-path efficiency (`item_398`, `item_401`)
- [ ] Step 2. Deliver release version single source and import timestamp normalization (`item_399`, `item_400`)
- [ ] Step 3. Deliver export hardening contracts (CSV neutralization + deferred JSON revoke) (`item_402`, `item_403`)
- [ ] Step 4. Run req_077 targeted validation and close req_077 traceability (`item_404`)
- [ ] Step 5. Deliver update-ready breathing glow and reduced-motion safety (`item_405`)
- [ ] Step 6. Deliver timestamped export filenames with scope preservation (`item_406`)
- [ ] Step 7. Deliver Home changelog progressive lazy loading on scroll (`item_407`)
- [ ] Step 8. Run req_078 targeted validation and close req_078 traceability (`item_408`)
- [ ] FINAL. Update request/backlog/task progress and closure notes for req_077 and req_078

# Validation gates
## A. Minimum wave gate (after each Step 1-7)
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` (if logics docs changed)
- `npm run -s typecheck`
- targeted tests for touched scope

## B. Req_077 closure gate (Step 4 mandatory)
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:segmentation:check`
- `npm run -s test:ci:fast -- --coverage`
- `npm run -s test:ci:ui`

## C. Req_078 closure gate (Step 8 mandatory)
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test -- src/tests/pwa.header-actions.spec.tsx`
- `npm run -s test -- src/tests/app.ui.settings.spec.tsx`
- `npm run -s test -- src/tests/app.ui.home.spec.tsx`
- `npm run -s test:ci:ui`

# Targeted validation guidance
- `npx vitest run src/tests/persistence.localStorage.spec.ts`
- `npx vitest run src/tests/portability.network-file.spec.ts`
- `npx vitest run src/tests/csv.export.spec.ts`
- `npx vitest run src/tests/pwa.header-actions.spec.tsx src/tests/app.ui.settings.spec.tsx src/tests/app.ui.home.spec.tsx`

# Cross-request dependency / collision watchlist
- `APP_RELEASE_VERSION` sync with `package.json` must not drift in persistence/export metadata.
- Timestamp normalization must avoid changing valid imported data and must emit deterministic warnings only when needed.
- CSV formula neutralization must not degrade normal data readability.
- Deferred JSON URL revoke must not leak object URLs or break download flow.
- Timestamped filenames must preserve scope semantics and remain filesystem-safe.
- Home lazy loading must preserve changelog order and avoid scroll UX regressions.

# Mitigation strategy
- Keep normalization and neutralization policies small, explicit, and unit-tested.
- Prefer reuse of current export helper path over introducing parallel logic.
- Add targeted UI assertions for reduced-motion and lazy-loading behavior.
- Validate no regression on existing PWA/update/export integration tests before closure.

# Report
- Current blockers: none.
- Current status: planned (not started).

# References
- `logics/request/req_077_review_followups_persistence_version_sync_import_normalization_and_export_hardening.md`
- `logics/request/req_078_update_app_button_breathing_glow_and_timestamped_save_filename.md`
- `src/adapters/persistence/localStorage.ts`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `src/core/schema.ts`
- `src/app/lib/csv.ts`
- `src/app/hooks/useNetworkImportExport.ts`
- `src/app/components/workspace/AppHeaderAndStats.tsx`
- `src/app/components/workspace/HomeWorkspaceContent.tsx`
- `src/app/lib/changelogFeed.ts`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/portability.network-file.spec.ts`
- `src/tests/csv.export.spec.ts`
- `src/tests/pwa.header-actions.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `src/tests/app.ui.home.spec.tsx`

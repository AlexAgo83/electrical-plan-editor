## req_015_runtime_robustness_persistence_empty_workspace_semantics_and_ci_release_safety - Runtime Robustness, Empty Workspace Persistence Semantics, and CI Release Safety
> From version: 0.5.0
> Understanding: 99%
> Confidence: 97%
> Complexity: Medium
> Theme: Reliability Hardening and Delivery Safety
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Prevent app boot/runtime crashes when browser storage access is blocked or unavailable (`localStorage` access can throw in some contexts).
- Preserve valid user intent when a persisted workspace is empty (do not silently re-bootstrap the sample network on reload).
- Strengthen CI so a green pipeline guarantees production build + PWA artifacts are valid.
- Improve CSV export reliability across browsers by avoiding premature object URL revocation.
- Add regression tests that explicitly cover these robustness scenarios.

# Context
The project currently has strong coverage for lint/typecheck/unit/integration/E2E, but a global review surfaced a few reliability gaps:

- `localStorage` access is assumed available in the default persistence adapter path.
- A valid persisted snapshot with an empty workspace is treated as a "bootstrap sample" trigger.
- CI validates behavior and E2E flows, but does not currently validate production build or generated PWA artifacts.
- CSV export revokes the Blob object URL immediately after click, which can be fragile on some browsers.

These are not feature gaps but reliability gaps. This request focuses on low-risk hardening changes with explicit behavioral contracts and regression coverage.

Architecture references to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`
- `logics/request/req_011_pwa_enablement_installability_and_offline_reliability.md`
- `logics/request/req_012_environment_configuration_and_runtime_defaults.md`
- `logics/request/req_013_list_form_workspace_harmonization_based_on_network_scope.md`

## Objectives
- Make persistence adapter resilient when `window.localStorage` throws on access.
- Define and enforce clear semantics for valid empty persisted workspace snapshots.
- Upgrade CI pipeline to include production build and PWA artifact validation.
- Make CSV export trigger more robust across browsers.
- Add tests covering all new robustness behaviors.

## Functional Scope
### A. Persistence adapter storage access hardening
- Guard `window.localStorage` access in the default persistence adapter path with `try/catch`.
- If browser storage is unavailable or throws (e.g. privacy/security constraints), fall back to deterministic non-crashing behavior.
- Preferred fallback behavior:
  - return `null` storage from adapter default getter,
  - allow app to continue with in-memory runtime state behavior (non-persistent) instead of crashing.
- Keep existing migration/corruption fallback behavior intact.

### B. Empty workspace persistence semantics (behavior contract)
- Change persistence load behavior so that a **valid persisted snapshot** is respected even if the workspace is empty.
- Preserve sample bootstrap only for:
  - first run / no persisted payload,
  - invalid/corrupted payload,
  - unrecoverable migration failures.
- Do **not** re-bootstrap sample when:
  - payload is valid,
  - snapshot migrated successfully,
  - workspace is intentionally empty.
- Document this behavior clearly (runtime contract and user expectation).

### C. CSV export reliability hardening
- Update CSV export helper to avoid immediate `URL.revokeObjectURL(...)` after synthetic click.
- Use a safe deferred cleanup strategy (e.g. `setTimeout` or equivalent) to improve compatibility.
- Keep filename normalization and CSV formatting behavior unchanged.

### D. CI release safety completion
- Extend CI workflow to validate production delivery artifacts in addition to existing tests:
  - `npm run build`
  - `npm run quality:pwa`
- Preserve existing lint/typecheck/quality/test/E2E steps.
- Prefer fail-fast sequencing where practical, or document ordering rationale.

### E. Regression tests and validation coverage
- Add tests for storage access hardening:
  - `localStorage` getter/access throws -> app/persistence load does not crash.
- Add tests for empty workspace persistence semantics:
  - valid empty persisted snapshot remains empty after reload.
- Add tests for CSV export helper behavior:
  - object URL creation and deferred revocation flow (with mocks/timers).
- Ensure existing tests still pass and E2E behavior is unaffected.

## Acceptance criteria
- AC1: App no longer crashes when default `localStorage` access throws; persistence adapter falls back to deterministic non-crashing behavior.
- AC2: A valid persisted empty workspace snapshot remains empty after reload (no automatic sample bootstrap).
- AC3: Sample bootstrap still occurs on first run (no payload) and on invalid/corrupted persisted payloads.
- AC4: CSV export uses deferred object URL revocation (or equivalent safe cleanup) and remains functionally unchanged for users.
- AC5: CI workflow includes production build validation (`npm run build`) and PWA artifact validation (`npm run quality:pwa`).
- AC6: Automated regression tests cover storage access failure and empty persisted workspace semantics.
- AC7: Existing validation suite remains green (`lint`, `typecheck`, quality gates, `test:ci`, `test:e2e`).

## Non-functional requirements
- Keep changes minimal and behavior-focused (no broad refactor scope creep).
- Preserve local-first deterministic behavior and existing migration semantics.
- Maintain compatibility with static hosting and PWA deployment flow.
- Keep error handling silent/non-blocking where current UX intentionally avoids surfacing technical storage failures.

## Out of scope
- Refactoring large UI files / modularization wave 2 (covered by `req_014`).
- New persistence backends (IndexedDB, server sync, etc.).
- CSV import feature additions.
- CI parallelization redesign beyond adding required release-safety checks.

# Backlog
- To create from this request:
  - `item_089_persistence_adapter_local_storage_access_guard_and_fallback.md`
  - `item_090_empty_workspace_persistence_contract_and_sample_bootstrap_rule_fix.md`
  - `item_091_csv_export_blob_url_cleanup_timing_hardening.md`
  - `item_092_ci_workflow_build_and_pwa_quality_gate_extension.md`
  - `item_093_robustness_regression_tests_for_storage_empty_workspace_and_csv_export.md`

# References
- `src/adapters/persistence/localStorage.ts`
- `src/store/sampleNetwork.ts`
- `src/tests/persistence.localStorage.spec.ts`
- `src/app/lib/csv.ts`
- `.github/workflows/ci.yml`
- `package.json`
- `vite.config.ts`
- `src/app/pwa/registerServiceWorker.ts`

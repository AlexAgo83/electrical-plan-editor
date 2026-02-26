## req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability - Project review follow-ups for hardening, coverage visibility, bundle performance, and test reliability
> From version: 0.9.10
> Understanding: 97% (request now captures review follow-ups plus default implementation stances for reference policy, validation doctrine, CI test segmentation, and bundle/perf execution strategy)
> Confidence: 92% (scope remains broad but key ambiguities are reduced with explicit defaults that can later be overridden intentionally)
> Complexity: High
> Theme: Engineering quality follow-up after broad project review
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- The project is feature-rich and currently green on the full validation matrix, but recent review surfaced several quality follow-ups that should be tracked explicitly instead of remaining ad hoc notes.
- The team needs a single request that consolidates hardening, performance, and test reliability improvements so they can be prioritized and delivered intentionally.
- The request should preserve current behavior while improving robustness, observability of quality, and CI confidence.

# Context
The current state is functionally healthy:
- full validation matrix passes (`logics_lint`, `lint`, `typecheck`, `quality:*`, `build`, `test:ci`, `test:e2e`)
- recent `req_067` fuse-wire changes are delivered and covered

However, broad review identified follow-up concerns worth formalizing:
- reducer-level normalization hardening gap for `wire.protection.catalogItemId` trimming
- catalog manufacturer-reference policy is implicit (not clearly locked case-sensitive vs case-insensitive uniqueness/canonicalization)
- some catalog bootstrap/import flows rely on linear manufacturer-reference lookups that may not scale well with larger imports
- test coverage reporting excludes the UI layer (`src/app/**`), which can create a false sense of overall coverage
- production build warns about an oversized main chunk (>500 kB)
- at least one heavy UI test needed an explicit timeout bump, suggesting growing flakiness risk as suite size increases
- form validation behavior mixes native HTML validation and custom inline validation, which may become inconsistent across forms

# Objective
- Capture and prioritize the current review findings as a dedicated engineering-quality request.
- Improve correctness hardening in cross-entity validation paths (starting with wire/catalog linkage normalization).
- Improve signal quality of automated quality metrics (coverage scope, CI runtime reliability).
- Reduce performance and maintenance risk (bundle size / test flakiness / validation consistency).
- Keep the request usable as an umbrella quality initiative while enabling phased execution with clear default decisions.

# Default decisions (to reduce ambiguity before implementation)
- Catalog `manufacturerReference` uniqueness policy default:
  - uniqueness comparisons are case-insensitive (ex: `ABC123` and `abc123` are treated as duplicates)
  - V1 canonical comparison strategy default: `trim + lower` (no advanced Unicode normalization unless a real need is demonstrated)
  - original user-entered casing may still be preserved for display
- Existing data conflicts under stricter catalog reference policy:
  - detect and fail with explicit error/reporting by default (no silent auto-rename outside already-defined legacy normalization flows)
  - default load behavior: do not crash the app; surface an actionable error/issue/report and keep behavior deterministic
  - preferred surfacing target: validation issues (with optional transient UI error feedback when action-triggered)
- UI coverage rollout default:
  - add non-blocking `src/app/**` coverage visibility first (reporting/metrics), defer hard thresholds
  - a dedicated script/report path is preferred before changing the canonical `test:ci` flow (example naming: `coverage:ui:report`)
  - run this reporting in CI as non-blocking signal when feasible
- Bundle/perf rollout default:
  - start with measurement and low-risk quick wins (manual chunking/lazy split refinements) before deeper refactors
  - initial tracked metrics should include at least: main JS chunk size and total JS gzip size
- Test command strategy default:
  - keep `test:ci` as the canonical full-suite command
  - add complementary segmented commands (ex: faster `core/store` path and heavier UI path) without replacing `test:ci`
  - example command naming is acceptable: `test:ci:fast` and `test:ci:ui`
  - prefer file-pattern based segmentation first (lower implementation cost than tags/projects)
- Form validation doctrine default:
  - native HTML validation for simple required-field constraints
  - custom inline validation for business rules, cross-field rules, and reducer-backed integrity cases
- Catalog import/bootstrap scaling work default:
  - prefer local refactors + instrumentation/measurement before broad optimization work
- Delivery prioritization default:
  - non-blocking to feature delivery; execute in phased quality batches (quick wins first)
  - recommended phase order:
    1. quick wins hardening (reducers / catalog ref policy / tests)
    2. quality signal & CI observability (coverage UI, segmented scripts, slow-test reporting)
    3. bundle performance/code-splitting
    4. targeted UI test stabilization and validation consistency follow-ups as needed
  - recommended immediate execution start: phase 1 quick wins

# Functional scope
## A. Reducer and normalization hardening (high priority)
- Harden reducer normalization paths so ID references are consistently normalized before lookup/persistence where appropriate.
- Include the fuse-wire catalog linkage path (`wire.protection.catalogItemId`) as an explicit reviewed case.
- Clarify and document catalog manufacturer-reference normalization/canonicalization policy (including case sensitivity expectations).
- Align reducer/store-level catalog reference handling with the chosen uniqueness policy and conflict-handling strategy.
- Apply the chosen catalog reference comparison policy consistently across reducer flows and catalog CSV import paths in the same implementation wave when feasible.
- Ensure hardening changes preserve backward compatibility and existing error messaging intent.

## B. Coverage signal improvements (medium-high priority)
- Improve visibility of quality coverage for the UI layer (`src/app/**`) in automated reporting.
- V1 may use a separate coverage report or non-blocking metric before introducing hard thresholds.
- Preserve current `core/store` coverage reporting while expanding observability.
- Make the reporting output understandable (clear distinction between domain/store coverage and UI coverage).
- Prefer introducing a dedicated reporting command first (e.g. `coverage:ui:report`) before changing `test:ci`.
- Prefer CI-visible non-blocking reporting before any blocking thresholds are considered.

## C. Bundle performance and code-splitting review (medium-high priority)
- Investigate and reduce the oversized main bundle/chunk warning in production builds.
- Review code-splitting strategy (screen-level and shared chunk composition).
- Propose and implement low-risk chunking improvements (e.g. manual chunk boundaries or lazy-loading refinements) if justified.
- Add a measurable bundle-size tracking approach (budget/check/report) so regressions are visible in CI.
- Initial bundle tracking should report at least `main JS chunk` and `total JS gzip` values; warning thresholds may be introduced before hard failure thresholds.
- Avoid regressions to app shell boot behavior, PWA flow, and lazy-loading UX.
- Prefer measured improvements over cosmetic suppression of warnings.

## D. UI test reliability and CI runtime stability (high priority)
- Identify heavy/flaky UI tests and stabilize them without hiding real regressions.
- Prefer root-cause fixes (fixture size, synchronization, split tests, shared setup optimizations) over broad timeout inflation.
- Preserve current regression intent and coverage breadth.
- Consider test-suite segmentation/scripts (e.g. fast `core/store` vs heavier `app.ui`) to improve local feedback loops while preserving full CI coverage.
- Improve CI confidence while keeping total runtime reasonable.
- Keep `test:ci` intact as the canonical aggregate command while adding optional segmented commands.
- If segmented commands are introduced, they should be documented as complements (not replacements) to `test:ci` and preserve equivalent aggregate coverage when combined.
- Add lightweight slow-test observability first (for example a console top-N slowest tests summary) before introducing more complex reporting artifacts.

## E. Form validation consistency review (medium priority)
- Review consistency between native HTML validation and custom inline validation across forms.
- Define an explicit validation strategy for the app (when native validation is preferred vs when custom inline errors are required).
- Apply targeted fixes where the current mixed behavior is confusing or inconsistent.
- Preserve accessibility semantics and current save/cancel workflows.
- Document expected test behavior for native-validation-blocked submits vs custom inline error rendering.
- Start with recently touched forms (`wire`, `catalog`) before broader form-wide harmonization.

## F. Catalog lookup performance and import/boot scalability (medium priority)
- Review repeated linear manufacturer-reference lookups in catalog bootstrap/import compatibility flows.
- Evaluate introducing temporary/local indices (or reusable lookup maps) for large catalog import/normalization paths.
- Keep behavior deterministic and stable for legacy compatibility migrations.
- Avoid speculative optimization without measurement; focus on identified hot paths first.

# Non-functional requirements
- Changes should be incremental and low-risk; do not block feature development unnecessarily.
- Quality metrics should become more informative, not just more strict.
- Any CI/runtime optimization should preserve deterministic behavior and debugging clarity.

# Validation and regression safety
- Run targeted tests for touched domains (reducers/forms/UI tests/build config) during implementation.
- Run full validation matrix before closing this request:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:ui-modularization`
  - `npm run -s quality:store-modularization`
  - `npm run -s quality:pwa`
  - `npm run -s build`
  - `npm run -s test:ci`
  - `npm run -s test:e2e`

# Acceptance criteria
- AC1: A documented implementation plan exists for the review follow-ups (hardening, coverage visibility, bundle performance, test reliability, validation consistency).
- AC2: The fuse-wire reducer catalog linkage normalization path is hardened or explicitly validated as intentionally unchanged with rationale.
- AC3: UI coverage visibility is improved (even if initially non-blocking).
- AC3a: UI coverage visibility can be obtained via a dedicated non-blocking reporting command before `test:ci` is changed.
- AC3b: If UI coverage reporting runs in CI, it is initially non-blocking and clearly labeled as informational.
- AC4: A concrete bundle-size reduction strategy is implemented or a measured rationale is documented if deferred.
- AC5: Known heavy/flaky UI tests are stabilized with targeted changes and no meaningful regression-signal loss.
- AC6: Form validation strategy is clarified and applied to at least the reviewed inconsistent cases.
- AC7: Catalog manufacturer-reference policy (including case-sensitivity expectation) is explicit and covered by implementation/tests or documented rationale.
- AC8: `test:ci` remains available as the canonical full-suite command while segmented test commands/reporting are added if adopted.
- AC9: The chosen default catalog `manufacturerReference` canonical comparison strategy (`trim + lower`, unless revised with rationale) is explicit.
- AC10: Initial slow-test visibility is available (at least console top-N) to support targeted UI test stabilization prioritization.

# Out of scope
- Major architecture rewrite of the app shell or state management model.
- Replacing the test stack (Vitest/Playwright) wholesale.
- Full performance optimization program across every screen and interaction.
- New feature-domain work unrelated to review findings.
- Forcing feature work to wait on the full quality umbrella request completion.

# Backlog
- `logics/backlog/item_369_reducer_hardening_for_wire_fuse_catalog_link_normalization_and_catalog_ref_canonical_policy.md`
- `logics/backlog/item_370_catalog_csv_import_alignment_with_case_insensitive_manufacturer_reference_policy.md`
- `logics/backlog/item_371_catalog_reference_conflict_detection_surfacing_for_load_and_legacy_bootstrap_paths.md`
- `logics/backlog/item_372_ui_coverage_reporting_visibility_for_src_app_non_blocking_ci_signal.md`
- `logics/backlog/item_373_test_ci_segmentation_commands_and_slow_test_top_n_observability.md`
- `logics/backlog/item_374_bundle_size_measurement_reporting_and_non_blocking_budget_baseline.md`
- `logics/backlog/item_375_bundle_code_splitting_quick_wins_and_lazy_loading_regression_safety.md`
- `logics/backlog/item_376_form_validation_consistency_doctrine_and_wire_catalog_targeted_harmonization.md`
- `logics/backlog/item_377_regression_coverage_for_req_068_quality_followups_hardening_ci_perf_and_validation_consistency.md`

# Orchestration task
- `logics/tasks/task_066_req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability_orchestration_and_delivery_control.md`

# References
- `src/store/reducer/wireReducer.ts`
- `src/store/reducer/catalogReducer.ts`
- `src/store/catalog.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
- `vite.config.ts`
- `package.json`

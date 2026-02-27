## req_069_ci_observability_execution_order_test_segmentation_and_ui_test_reliability - CI observability execution order, test segmentation hardening, and UI test reliability follow-up
> From version: 0.9.11
> Understanding: 99% (delivery completed with explicit CI always-run semantics, segmented lane contract guardrails, and targeted UI stabilization)
> Confidence: 96% (acceptance criteria are implemented and validated through the full matrix)
> Complexity: Medium
> Theme: CI signal robustness and test reliability hardening
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- The project now exposes useful informational signals (`coverage:ui:report`, slow-test top-N, bundle metrics), but CI execution order still limits their diagnostic value when core tests fail first.
- Test-suite segmentation currently relies on naming conventions (`app.ui*`) that are easy to drift from and can produce blurred fast/UI boundaries.
- Several UI integration tests require timeout increases to stay stable under `test:ci --coverage`, indicating a reliability/performance follow-up should be formalized.

# Context
Recent quality work (req_068) delivered:
- reducer/import hardening and coverage improvements
- non-blocking CI observability scripts
- bundle metrics and chunking quick wins
- validation-doctrine alignment for wire/catalog forms

Current residual risks:
- UI suites still dominate runtime cost and can benefit from additional stabilization waves
- segmented lane contract requires intentional updates when adding new UI spec files (by design)

# Objective
- Ensure diagnostic observability still runs when the main suite fails.
- Make test segmentation deterministic and maintainable.
- Reduce UI test fragility without weakening regression intent.

# Default decisions
- CI observability steps with `if: always()` scope (still non-blocking):
  - `coverage:ui:report`
  - `test:ci:ui:slow-top`
- `bundle:metrics:report` remains informational/non-blocking but only runs when `build` succeeded.
- `test:ci` remains canonical and unchanged in role.
- Segmentation should use explicit glob/domain contracts (not prefix-only filename assumptions).
- `pwa.*` test files default to the fast/core lane (not the UI-heavy lane).
- No hard CI runtime threshold in V1; use trend-based monitoring with top-N slow tests.
- Existing `10_000ms` timeout exceptions are accepted as temporary debt; new timeout increases require explicit rationale.
- Keep `coverage:ui:report` as a separate run in V1 for clarity/simplicity; optimize duplication later only if needed.

# Functional scope
## A. CI execution-order hardening (high priority)
- Ensure informational observability steps execute even after upstream failures:
  - UI coverage report
  - slow-test top-N report
- Keep bundle metrics report informational/non-blocking, but tied to successful build artifacts.
- Keep these steps non-blocking.
- Make logs explicit that they are diagnostic signals and not release gates.

## B. Segmentation contract hardening (high priority)
- Rework `test:ci:fast` and `test:ci:ui` segmentation to rely on stable explicit targeting (paths/patterns/contracts), not only `app.ui*` naming.
- Keep `pwa.*` tests in `test:ci:fast` by default unless future data justifies reassignment.
- Ensure combined segmented runs approximate the same test universe as canonical `test:ci`.
- Document the segmentation policy in README and/or testing docs.

## C. UI test reliability follow-up (medium-high priority)
- Identify top recurrent slow tests from slow-top reporting.
- Apply targeted stabilizations (fixture shaping, setup reuse, await strategy, interaction batching, DOM query tightening) before adding more timeout exceptions.
- Preserve existing temporary `10_000ms` exceptions but track them as explicit debt.
- Keep runtime-oriented changes assertion-preserving.

## D. Coverage/reporting efficiency follow-up (medium priority)
- Keep the separate `coverage:ui:report` run in V1.
- Re-evaluate duplicate CI work later if observability cost becomes problematic.

# Non-functional requirements
- No regression in release confidence: canonical `test:ci` + `test:e2e` remain required.
- Observability enhancements should improve triage speed and not add noisy ambiguous output.
- Changes should stay incremental and reversible.

# Validation and regression safety
- Run full validation matrix before closure:
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
- AC1: `coverage:ui:report` and `test:ci:ui:slow-top` run even when earlier validation steps fail (`if: always()`), remaining non-blocking.
- AC2: `test:ci:fast` / `test:ci:ui` segmentation contract is explicit and documented.
- AC3: Segmented commands remain complementary to canonical `test:ci`, not replacements.
- AC4: `bundle:metrics:report` remains informational/non-blocking and runs only on successful build artifacts.
- AC5: At least the top unstable UI tests receive root-cause stabilization work or explicit documented rationale when deferred.
- AC6: No material regression in CI runtime reliability and debugging clarity.

# Delivery status
- Delivered via `task_067`.
- Full validation matrix executed and green (`logics_lint`, `lint`, `typecheck`, `quality:*`, `build`, `test:ci`, `test:e2e`).

# Out of scope
- Replacing Vitest/Playwright tooling.
- Rewriting the entire UI integration suite architecture in one pass.
- Turning informational observability into strict blocking thresholds in this request.

# Backlog
- `logics/backlog/item_378_ci_workflow_observability_execution_order_always_run_non_blocking_ui_signals.md`
- `logics/backlog/item_379_test_ci_segmentation_contract_explicit_globs_and_pwa_fast_lane_assignment.md`
- `logics/backlog/item_380_ui_test_reliability_stabilization_wave_1_for_top_slow_specs.md`
- `logics/backlog/item_381_coverage_ui_report_v1_separate_execution_and_cost_baseline_tracking.md`
- `logics/backlog/item_382_regression_coverage_for_req_069_ci_observability_segmentation_and_ui_reliability.md`

# Orchestration task
- `logics/tasks/task_067_req_069_ci_observability_execution_order_test_segmentation_and_ui_test_reliability_orchestration_and_delivery_control.md`

# References
- `.github/workflows/ci.yml`
- `package.json`
- `scripts/quality/run-vitest-segmented.mjs`
- `scripts/quality/report-ui-coverage.mjs`
- `scripts/quality/report-slowest-tests.mjs`
- `scripts/quality/report-bundle-metrics.mjs`
- `src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/app.ui.settings-wire-defaults.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`

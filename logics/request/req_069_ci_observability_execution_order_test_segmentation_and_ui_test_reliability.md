## req_069_ci_observability_execution_order_test_segmentation_and_ui_test_reliability - CI observability execution order, test segmentation hardening, and UI test reliability follow-up
> From version: 0.9.11
> Understanding: 96% (focused follow-up request after req_068 delivery to improve CI diagnostic signal quality and reduce test-runtime fragility)
> Confidence: 93% (scope is narrow, actionable, and mostly tooling/test-architecture level)
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
- informational CI jobs do not run if `test:ci` fails earlier in the pipeline
- segmented commands are file-name-coupled rather than explicitly scoped
- heavy UI tests remain near timeout limits under full coverage runs

# Objective
- Ensure diagnostic observability still runs when the main suite fails.
- Make test segmentation deterministic and maintainable.
- Reduce UI test fragility without weakening regression intent.

# Default decisions
- CI observability steps should run with `if: always()` (still non-blocking).
- `test:ci` remains canonical and unchanged in role.
- Segmentation should move toward explicit glob/domain contracts rather than prefix-only filename assumptions.
- Timeout increases are acceptable only as short-term mitigations; root-cause stabilization remains the target.

# Functional scope
## A. CI execution-order hardening (high priority)
- Ensure informational observability steps execute even after upstream failures:
  - UI coverage report
  - slow-test top-N report
  - bundle metrics report (when build artifacts are available)
- Keep these steps non-blocking.
- Make logs explicit that they are diagnostic signals and not release gates.

## B. Segmentation contract hardening (high priority)
- Rework `test:ci:fast` and `test:ci:ui` segmentation to rely on stable explicit targeting (paths/patterns/contracts), not only `app.ui*` naming.
- Ensure combined segmented runs approximate the same test universe as canonical `test:ci`.
- Document the segmentation policy in README and/or testing docs.

## C. UI test reliability follow-up (medium-high priority)
- Identify top recurrent slow tests from slow-top reporting.
- Apply targeted stabilizations (fixture shaping, setup reuse, await strategy, interaction batching, DOM query tightening) before adding more timeout exceptions.
- Keep runtime-oriented changes assertion-preserving.

## D. Coverage/reporting efficiency follow-up (medium priority)
- Evaluate reducing duplicate CI work between `test:ci` and `coverage:ui:report`.
- Keep UI coverage visibility intact while reducing redundant full-suite executions when possible.

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
- AC1: Informational CI observability steps run even when earlier validation steps fail.
- AC2: `test:ci:fast` / `test:ci:ui` segmentation contract is explicit and documented.
- AC3: Segmented commands remain complementary to canonical `test:ci`, not replacements.
- AC4: At least the top unstable UI tests receive root-cause stabilization work or explicit documented rationale when deferred.
- AC5: No material regression in CI runtime reliability and debugging clarity.

# Out of scope
- Replacing Vitest/Playwright tooling.
- Rewriting the entire UI integration suite architecture in one pass.
- Turning informational observability into strict blocking thresholds in this request.

# Backlog
- To be derived from this request (new items for CI execution order, segmentation contract, and UI test stabilization).

# References
- `.github/workflows/ci.yml`
- `package.json`
- `scripts/quality/report-ui-coverage.mjs`
- `scripts/quality/report-slowest-tests.mjs`
- `scripts/quality/report-bundle-metrics.mjs`
- `src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/app.ui.settings-wire-defaults.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`

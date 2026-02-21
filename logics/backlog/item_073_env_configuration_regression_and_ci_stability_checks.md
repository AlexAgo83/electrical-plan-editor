## item_073_env_configuration_regression_and_ci_stability_checks - Env Configuration Regression and CI Stability Checks
> From version: 0.3.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Configuration QA Closure
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Env-based runtime changes can silently break scripts, CI, and local predictability unless validated through dedicated regression coverage.

# Scope
- In:
  - Add checks for default/override/invalid env behavior.
  - Validate dev/build/test/e2e scripts remain stable under new config layer.
  - Validate Playwright base URL coherence with env defaults.
  - Validate storage key override behavior does not break persistence baseline.
  - Capture final AC traceability for `req_012`.
- Out:
  - Performance benchmarking infrastructure changes.
  - Cross-cloud deployment environment matrix.

# Acceptance criteria
- Automated and/or scripted checks cover AC1..AC8 from `req_012`.
- CI pipeline remains green with env support enabled.
- Default local startup and E2E workflow remain deterministic.
- No persistence regression introduced by `VITE_STORAGE_KEY` behavior.

# Priority
- Impact: Very high (release confidence and regression prevention).
- Urgency: High before closing `req_012`.

# Notes
- Dependencies: item_069, item_070, item_071, item_072.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8.
- References:
  - `logics/request/req_012_environment_configuration_and_runtime_defaults.md`
  - `vite.config.ts`
  - `playwright.config.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `tests/e2e/smoke.spec.ts`
  - `.github/workflows/ci.yml`


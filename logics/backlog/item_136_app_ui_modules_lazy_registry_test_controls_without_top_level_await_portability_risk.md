## item_136_app_ui_modules_lazy_registry_test_controls_without_top_level_await_portability_risk - appUiModules Lazy Registry/Test Controls Without Top-Level-Await Portability Risk
> From version: 0.5.8
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Keep Real Lazy Chunking and Testability While Reducing Module Portability Risk
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`appUiModules` currently uses top-level await in a Vitest-only branch to load the eager registry, which works today but introduces a portability/tooling risk because the module becomes async. The goal is to preserve real lazy chunking and test controls while reducing that risk.

# Scope
- In:
  - Reduce/remove top-level-await dependency in `appUiModules`.
  - Preserve real production lazy chunking.
  - Preserve lazy/eager test controls and lazy-path regression coverage.
  - Validate build output and chunking behavior.
- Out:
  - Replacing the lazy/eager registry architecture entirely.
  - Broad build pipeline redesign.

# Acceptance criteria
- Real lazy chunking remains intact in production build output.
- Lazy-path regression coverage and test controls remain working.
- Top-level-await portability risk in `appUiModules` is reduced or explicitly justified/documented.
- Build and tests pass.

# Priority
- Impact: Medium (portability/tooling robustness).
- Urgency: Medium (follow-up risk reduction).

# Notes
- Dependencies: `req_022` lazy chunking baseline.
- Blocks: item_138.
- Related AC: AC4, AC6, AC7.
- References:
  - `logics/request/req_023_post_req_022_review_followup_settings_empty_state_precedence_remaining_compute_scoping_lazy_registry_tla_portability_and_test_helper_signal.md`
  - `src/app/components/appUiModules.tsx`
  - `src/app/components/appUiModules.eager.ts`
  - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
  - `vite.config.ts`

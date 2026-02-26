## item_375_bundle_code_splitting_quick_wins_and_lazy_loading_regression_safety - Bundle code-splitting quick wins and lazy-loading regression safety
> From version: 0.9.10
> Understanding: 94%
> Confidence: 88%
> Progress: 0%
> Complexity: Medium-High
> Theme: Low-risk bundle reduction via measured code-splitting improvements
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The main bundle remains large and build warnings persist; low-risk code-splitting improvements are needed, but must not regress lazy-loading behavior or shell UX.

# Scope
- In:
  - Implement low-risk code-splitting improvements (manual chunking and/or lazy-loading refinements) based on measurements from `item_374`.
  - Validate that app shell, lazy-loaded screens, and PWA behaviors remain non-regressed.
  - Document rationale for any deferred chunking opportunities.
- Out:
  - Full performance rewrite
  - Major screen architecture restructuring

# Acceptance criteria
- At least one measured bundle-size improvement is landed or a documented rationale explains deferral after measurement.
- Lazy-loading and app shell regression coverage remains green.
- Build and PWA outputs remain valid.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_068`, `item_374`.
- Blocks: `item_377`, `task_066`.
- Related AC: AC4.
- References:
  - `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`
  - `vite.config.ts`
  - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`

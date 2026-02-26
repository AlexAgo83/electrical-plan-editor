## item_373_test_ci_segmentation_commands_and_slow_test_top_n_observability - Test CI segmentation commands and slow-test top-N observability
> From version: 0.9.10
> Understanding: 95%
> Confidence: 91%
> Progress: 0%
> Complexity: Medium
> Theme: CI/local feedback loop improvements without replacing canonical full-suite test command
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The UI-heavy test suite is growing in runtime, and isolated timeout increases are an early flakiness signal. Developers need faster feedback tools and basic slow-test observability without weakening regression coverage.

# Scope
- In:
  - Add segmented test commands (default naming acceptable: `test:ci:fast`, `test:ci:ui`) using file-pattern-based segmentation first.
  - Keep `test:ci` as canonical full-suite command.
  - Add lightweight slow-test observability (console top-N summary is sufficient for V1).
  - Document segmented commands as complements, not replacements.
- Out:
  - Replacing Vitest/Playwright tooling
  - Complex test analytics dashboards/artifacts in V1
  - Changing the semantics of `test:ci`

# Acceptance criteria
- Segmented test commands exist and run meaningful subsets.
- `test:ci` remains canonical and intact.
- Slow-test visibility is available at least as console top-N output.

# Priority
- Impact: Medium-High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_068`.
- Blocks: `task_066`.
- Related AC: AC5, AC8, AC10.
- References:
  - `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`
  - `package.json`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

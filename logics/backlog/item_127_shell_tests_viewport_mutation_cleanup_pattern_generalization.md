## item_127_shell_tests_viewport_mutation_cleanup_pattern_generalization - Shell Tests Viewport Mutation Cleanup Pattern Generalization
> From version: 0.5.6
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Low
> Theme: Generalize Reliable Viewport Cleanup Beyond Workspace-Shell Tests
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`src/tests/app.ui.workspace-shell-regression.spec.tsx` now uses a robust viewport helper with guaranteed `try/finally` cleanup, but other shell tests (such as inspector-shell) still mutate `window.innerWidth` directly without guaranteed restoration, leaving a residual flakiness risk.

# Scope
- In:
  - Reuse or generalize a guaranteed-cleanup viewport helper pattern across touched shell tests.
  - Update direct viewport mutations in shell tests to use the guardrailed pattern.
  - Preserve test readability and intent.
- Out:
  - Global testing framework changes.
  - Refactoring unrelated tests outside the shell/UI scope.

# Acceptance criteria
- Touched shell tests restore viewport mutations reliably even if assertions fail.
- Direct ad hoc viewport mutation patterns are reduced/removed in targeted shell tests.
- Test readability remains acceptable.

# Priority
- Impact: Medium (test reliability and debugging cost).
- Urgency: Medium (follow-up cleanup after partial hardening).

# Notes
- Dependencies: none strict, pairs well with item_126.
- Blocks: item_128.
- Related AC: AC6, AC7.
- References:
  - `logics/request/req_021_app_controller_post_req_020_review_followup_inactive_screen_computation_lazy_test_path_and_shell_test_guardrails.md`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - `src/tests/helpers/app-ui-test-utils.tsx`

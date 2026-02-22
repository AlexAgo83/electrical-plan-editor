## item_122_shell_test_viewport_mutation_cleanup_guardrails - Shell Test Viewport Mutation Cleanup Guardrails
> From version: 0.5.5
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Low
> Theme: Reliable Viewport Cleanup in Shell Regression Tests
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Shell regression tests that mutate `window.innerWidth` restore viewport state only at the end of the test body, which can leak mutated global state when assertions fail and cause flaky downstream failures.

# Scope
- In:
  - Introduce reliable viewport mutation cleanup pattern(s) for shell tests (`try/finally`, helper wrapper, or equivalent).
  - Apply to shell regression tests that mutate viewport width.
  - Preserve test readability and behavior intent.
- Out:
  - Broad testing framework changes.
  - Refactoring unrelated tests.

# Acceptance criteria
- Viewport mutations are restored reliably even when a test assertion throws.
- Shell tests remain readable and behavior-oriented.
- No regressions introduced in shell test outcomes.

# Priority
- Impact: Medium (test reliability / flake prevention).
- Urgency: Medium (important with new breakpoint coverage work).

# Notes
- Dependencies: none strict, but pairs naturally with item_121.
- Blocks: item_123.
- Related AC: AC5, AC6, AC7.
- References:
  - `logics/request/req_020_app_shell_desktop_overlay_hardening_alignment_and_workspace_suspense_scoping.md`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`

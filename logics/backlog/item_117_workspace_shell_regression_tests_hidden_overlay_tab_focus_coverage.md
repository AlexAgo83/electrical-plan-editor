## item_117_workspace_shell_regression_tests_hidden_overlay_tab_focus_coverage - Workspace Shell Regression Tests for Hidden Overlay Tab/Focus Coverage
> From version: 0.5.4
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Lock Hidden-Overlay Keyboard Behavior with Tests
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Current shell regression tests cover Escape and focus-loss interactions, but they do not assert keyboard tab traversal behavior when drawer/ops overlays are closed. This leaves the new a11y/focus hardening behavior unprotected.

# Scope
- In:
  - Extend shell regression tests to verify closed drawer/ops panel/backdrop elements are not keyboard-focusable/reachable.
  - Add targeted regression coverage for any shell loading-state behavior introduced by `Suspense` boundary changes (if applicable).
  - Keep tests behavior-oriented and resilient to minor markup refactors.
- Out:
  - Snapshot-heavy tests tied to incidental DOM structure.
  - Broad test rewrites unrelated to shell hardening.

# Acceptance criteria
- Tests fail if closed overlays/backdrops re-enter tab order or receive focus unexpectedly.
- Existing shell regression assertions remain intact (Escape/focus-loss/focus restoration).
- Any loading-behavior coverage added validates user-visible shell continuity rather than implementation details.
- Test suite remains stable and readable.

# Priority
- Impact: High (prevents reintroduction of subtle keyboard/a11y regressions).
- Urgency: High (should accompany shell hardening work immediately).

# Notes
- Dependencies: item_114 (and item_115 if loading behavior changes materially).
- Blocks: item_118.
- Related AC: AC1, AC2, AC3, AC6.
- References:
  - `logics/request/req_019_app_controller_post_wave_5_hardening_accessibility_loading_and_contract_clarity.md`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/app/AppController.tsx`

## item_121_workspace_shell_regression_desktop_breakpoint_overlay_accessibility_coverage - Workspace Shell Regression Desktop/Breakpoint Overlay Accessibility Coverage
> From version: 0.5.5
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Protect Desktop Drawer A11y Semantics with Breakpoint-Aware Tests
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Current shell regression coverage added in `task_018` validates hidden overlay semantics only under a narrow viewport scenario. It does not protect desktop breakpoint behavior, leaving the drawer hardening mismatch untested.

# Scope
- In:
  - Add desktop/breakpoint shell regression tests for drawer hidden-state accessibility semantics.
  - Cover the intended contract across breakpoint transitions relevant to drawer overlay behavior.
  - Keep tests behavior-oriented and compatible with future minor markup refactors.
- Out:
  - Snapshot-heavy tests tied to implementation details.
  - Broad shell test rewrites unrelated to drawer accessibility semantics.

# Acceptance criteria
- Tests fail if desktop hidden drawer semantics regress to hidden-but-focusable/AT-visible behavior (when visually hidden).
- Breakpoint-aware behavior is documented in tests and remains readable.
- Existing shell regression assertions continue to pass and remain meaningful.

# Priority
- Impact: High (prevents recurrence of subtle a11y regressions).
- Urgency: High (should land with drawer alignment fix).

# Notes
- Dependencies: item_119.
- Blocks: item_123.
- Related AC: AC1, AC2, AC5.
- References:
  - `logics/request/req_020_app_shell_desktop_overlay_hardening_alignment_and_workspace_suspense_scoping.md`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/app/styles/workspace/workspace-shell-and-nav.css`
  - `src/app/styles/workspace/workspace-panels-and-responsive.css`

## item_119_app_shell_drawer_hardening_breakpoint_visibility_contract_alignment - App Shell Drawer Hardening Breakpoint Visibility Contract Alignment
> From version: 0.5.5
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Align Drawer Accessibility Hardening with Real Visibility Rules
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The navigation drawer accessibility hardening introduced in `task_018` is gated by a JS viewport threshold (`viewportWidth < 960`), but the drawer remains visually hidden by default via CSS transform outside explicit open state. This can leave hidden desktop drawer content keyboard-focusable or AT-visible.

# Scope
- In:
  - Align JS hardening logic and CSS drawer visibility behavior across breakpoints.
  - Ensure hidden drawer semantics are safe at all breakpoints where the drawer is visually hidden.
  - Preserve drawer interactions (open/close, Escape, focus restoration, desktop behavior if intentionally interactive).
  - Adjust breakpoint constants/contracts if needed, with explicit rationale.
- Out:
  - Shell visual redesign.
  - New drawer features.

# Acceptance criteria
- Drawer hidden-state accessibility semantics are correct on desktop and mobile.
- No hidden-but-focusable/AT-visible drawer state remains due to JS/CSS mismatch.
- Drawer behavior remains stable in existing shell interactions.
- Breakpoint/visibility contract is explicit and reviewable.

# Priority
- Impact: High (a11y correctness + keyboard navigation).
- Urgency: High (follow-up regression risk in core shell).

# Notes
- Dependencies: `req_019` shell hardening baseline.
- Blocks: item_121, item_123.
- Related AC: AC1, AC2, AC5, AC7.
- References:
  - `logics/request/req_020_app_shell_desktop_overlay_hardening_alignment_and_workspace_suspense_scoping.md`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/app/styles/workspace/workspace-shell-and-nav.css`
  - `src/app/styles/workspace/workspace-panels-and-responsive.css`
  - `src/app/hooks/useWorkspaceShellChrome.ts`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`

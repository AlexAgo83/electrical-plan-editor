## item_114_app_shell_overlay_accessibility_and_focus_isolation_hardening - App Shell Overlay Accessibility and Focus Isolation Hardening
> From version: 0.5.4
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Hidden Overlay Keyboard/AT Isolation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`AppShellLayout` keeps navigation drawer / operations panel overlays and backdrops mounted while closed, relying on CSS visibility/pointer-state changes. Hidden elements may still remain reachable via keyboard focus or assistive technologies.

# Scope
- In:
  - Harden closed drawer/ops panel/backdrop behavior so hidden UI is not keyboard-focusable and is hidden from assistive technologies.
  - Preserve current visual behavior, transitions, Escape handling, focus-loss closing, and focus restoration semantics.
  - Update shell markup/attributes and/or mounting strategy as needed.
- Out:
  - Redesigning shell layout visuals.
  - New navigation/operations features.

# Acceptance criteria
- Closed navigation drawer and operations panel are not reachable via keyboard tab order.
- Closed backdrops do not participate in keyboard or assistive-technology navigation.
- Existing shell interactions (Escape close, focus-loss close, focus restoration) remain behaviorally stable.
- Changes remain compatible with current integration tests and follow-up regression coverage additions.

# Priority
- Impact: High (a11y and keyboard navigation correctness).
- Urgency: High (post-review hardening issue in core shell).

# Notes
- Dependencies: baseline wave-5 shell extraction (`AppShellLayout`) from `req_018`.
- Blocks: item_117, item_118.
- Related AC: AC1, AC2, AC6, AC7.
- References:
  - `logics/request/req_019_app_controller_post_wave_5_hardening_accessibility_loading_and_contract_clarity.md`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/app/styles/workspace/workspace-shell-and-nav.css`
  - `src/app/hooks/useWorkspaceShellChrome.ts`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`

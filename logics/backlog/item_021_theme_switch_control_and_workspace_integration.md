## item_021_theme_switch_control_and_workspace_integration - Theme Switch Control and Workspace Integration
> From version: 0.1.0
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: UX/UI Interaction
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Users need a visible, low-friction control to switch visual mode from anywhere in the workspace. Without unified integration, the feature is hard to discover and inconsistent.

# Scope
- In:
  - Add a persistent theme switch control in workspace shell.
  - Expose current mode and allow one-click toggle `normal` <-> `dark`.
  - Keep switch available across `Modeling`, `Analysis`, `Validation`, and `Settings`.
  - Ensure immediate UI refresh after toggle with no page reload.
- Out:
  - Advanced preference panel for custom themes.
  - Per-screen theme overrides.

# Acceptance criteria
- Theme switch control is always available in the main workspace chrome.
- Switching mode updates visible UI in-place and preserves current user context.
- Control state is synchronized with persisted theme mode on startup.
- Theme switching works in all top-level sections.

# Priority
- Impact: High (direct user-facing functionality).
- Urgency: High after state foundation.

# Notes
- Dependencies: item_009, item_010, item_020.
- Blocks: item_022, item_024.
- Related AC: AC1, AC2, AC3.
- References:
  - `logics/request/req_003_theme_mode_switch_normal_dark.md`
  - `src/app/App.tsx`
  - `src/app/styles.css`
  - `src/store/selectors.ts`


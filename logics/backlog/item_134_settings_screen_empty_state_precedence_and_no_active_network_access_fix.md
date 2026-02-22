## item_134_settings_screen_empty_state_precedence_and_no_active_network_access_fix - Settings Screen Empty-State Precedence and No-Active-Network Access Fix
> From version: 0.5.8
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Keep Global Settings Reachable Without an Active Network
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`AppShellLayout` renders the `No active network` empty-state before checking `isSettingsScreen`, which blocks access to Settings when no active network exists. This conflicts with `SettingsWorkspaceContent`, which explicitly supports `activeNetworkId: null` and global preference workflows.

# Scope
- In:
  - Fix branch precedence so Settings is reachable without an active network.
  - Preserve empty-state behavior for non-settings screens.
  - Add/update regression coverage for Settings access on no-active-network path.
- Out:
  - Settings feature redesign.
  - Empty-state visual redesign.

# Acceptance criteria
- Settings screen renders when selected and no active network exists.
- Other relevant screens still show the empty-state branch without active network.
- Regression coverage protects the no-active-network Settings path.
- Existing shell behavior remains stable.

# Priority
- Impact: High (user-visible access bug).
- Urgency: High (core UX correctness).

# Notes
- Dependencies: `req_022` baseline.
- Blocks: item_138.
- Related AC: AC1, AC2, AC6, AC7.
- References:
  - `logics/request/req_023_post_req_022_review_followup_settings_empty_state_precedence_remaining_compute_scoping_lazy_registry_tla_portability_and_test_helper_signal.md`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.settings.spec.tsx`

## item_151_home_workspace_mvp_start_and_resume_action_modules - Home Workspace MVP Start and Resume Action Modules
> From version: 0.5.11
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Action-First Home Content for Fast Start and Return-to-Work Flows
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with a home screen entry, users still need clear high-value actions to start work and resume an existing workspace without digging through multiple operational screens.

# Scope
- In:
  - Implement Home MVP modules for **Start actions** and **Resume**.
  - Provide action wiring for creating an empty workspace, importing from file, and opening workspace-management entry points (e.g. network scope).
  - Provide resume actions and compact workspace summary (active network, network count, save status where available).
  - Handle both empty-workspace and active-workspace states gracefully.
- Out:
  - Quick shortcuts and quick preferences modules (tracked separately).
  - Post-MVP history/session/what's-new modules.

# Acceptance criteria
- Home screen shows actionable Start and Resume sections with clear CTAs.
- Start actions trigger the intended existing flows/screens without regression.
- Resume section remains useful in both empty and non-empty workspace states.
- Summary text/status stays consistent with current app state.

# Priority
- Impact: High (core utility of the home screen).
- Urgency: High.

# Notes
- Dependencies: item_150.
- Blocks: item_155.
- Related AC: AC2, AC3, AC4, AC6.
- Resolution: Closed with Home `Start` + `Resume` modules and workflow-entry CTAs wired to existing app flows (empty/non-empty workspace handling covered).
- References:
  - `logics/request/req_026_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub.md`
  - `src/app/components/workspace/HomeWorkspaceContent.tsx`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.home.spec.tsx`

## item_150_home_workspace_screen_shell_navigation_integration_and_menu_return_entry - Home Workspace Screen Shell Navigation Integration and Menu Return Entry
> From version: 0.5.11
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Introduce Home as a First-Class Top-Level Screen in the Workspace Navigation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The app lacks a dedicated home/landing screen and currently has no explicit top-level navigation control to return to such a screen once the user navigates into operational views.

# Scope
- In:
  - Add a new top-level `home` screen in app navigation state/shell integration.
  - Add an explicit menu/navigation entry to return to the home screen.
  - Define default/initial screen behavior and transitions between home and existing screens.
  - Preserve existing keyboard/focus behavior in the app shell.
- Out:
  - Full home screen content implementation beyond minimal shell placeholders.
  - Post-MVP home modules/history analytics.

# Acceptance criteria
- `home` exists as a top-level screen and is selectable through the standard workspace navigation.
- A visible menu/navigation control allows returning to home from other screens.
- Navigation transitions to/from home do not regress existing shell behavior.
- Screen selection state remains consistent across desktop/mobile layouts.

# Priority
- Impact: High (foundational IA/navigation change).
- Urgency: High (blocks all home-screen content work).

# Notes
- Dependencies: `req_026` home-screen request.
- Blocks: item_151, item_152, item_153, item_154, item_155.
- Related AC: AC1, AC1b, AC3, AC4, AC6.
- Resolution: Closed via Home top-level screen integration, explicit menu/navigation return entry, and Home-first startup behavior.
- References:
  - `logics/request/req_026_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub.md`
  - `src/app/AppController.tsx`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/app/components/WorkspaceNavigation.tsx`
  - `src/app/hooks/useWorkspaceShellChrome.ts`
  - `src/app/hooks/useWorkspaceNavigation.ts`

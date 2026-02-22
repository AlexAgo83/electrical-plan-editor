## item_152_home_workspace_quick_shortcuts_and_quick_preferences_modules - Home Workspace Quick Shortcuts and Quick Preferences Modules
> From version: 0.5.11
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Fast Utility Actions and Preference Toggles on the Home Screen
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
A home screen without curated shortcuts and quick preference access still forces extra navigation for routine operations (validation/settings/theme/inspector visibility/canvas defaults).

# Scope
- In:
  - Implement **Quick shortcuts** module with a curated, compact set of high-value actions or shortcut hints.
  - Implement **Quick preferences** module with low-friction controls (theme, floating inspector visibility, optional canvas defaults if low-cost).
  - Reuse existing preference persistence and handlers.
  - Keep module density compact and consistent with panel design language.
- Out:
  - Full settings screen replacement.
  - Overloading home with every existing preference.

# Acceptance criteria
- Home screen exposes a concise and useful Quick shortcuts section.
- Home screen exposes Quick preferences controls that update/persist via existing preference mechanisms.
- The module remains visually coherent with current panels and does not introduce heavy duplication of Settings.
- Existing settings flows continue to work unchanged.

# Priority
- Impact: Medium-High (speed and ergonomics).
- Urgency: Medium.

# Notes
- Dependencies: item_150.
- Blocks: item_155.
- Related AC: AC2, AC4, AC6.
- References:
  - `logics/request/req_026_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/hooks/useInspectorPanelVisibility.ts`
  - `src/app/components/workspace/OperationsHealthPanel.tsx`

## item_192_settings_local_persistence_audit_and_regression_coverage_for_ui_preferences - Settings Local Persistence Audit and Regression Coverage for UI Preferences
> From version: 0.7.2
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Reliability Audit for UI Preferences Hydration and Local Persistence
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
User feedback explicitly requests confidence that `Settings` values are persisted locally. Recent additions increased the number of preferences, making it easy for persistence/hydration/reset wiring to drift or regress.

# Scope
- In:
  - Audit local persistence wiring (`read`, `hydrate`, `write`, `reset`) for `Settings`/UI preferences.
  - Verify persistence coverage for recent settings (canvas defaults/render prefs, inspector toggle, workspace panel layout, etc.).
  - Add/adjust regression tests for persistence and reload behavior where gaps exist.
  - Document intentionally non-persisted settings (if any) in tests/comments/logics notes.
- Out:
  - Redesign of UI preference storage schema/versioning unless required for a bug fix.
  - Migration framework changes unrelated to UI preferences.

# Acceptance criteria
- Supported `Settings` values persist locally and restore correctly after reload.
- Regression tests cover persistence/hydration for affected settings.
- Reset/default flows remain coherent with persisted values.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_032`.
- Blocks: item_194.
- Related AC: AC6, AC8.
- References:
  - `logics/request/req_032_user_feedback_followup_network_scope_focus_minimum_numeric_constraints_empty_callout_suppression_settings_persistence_and_cavity_to_way_terminology.md`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/hooks/useAppControllerPreferencesState.ts`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/tests/app.ui.settings.spec.tsx`


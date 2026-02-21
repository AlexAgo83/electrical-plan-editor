## item_058_global_settings_relocation_and_default_preference_update - Global Settings Relocation and Default Preference Update
> From version: 0.3.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Global Preferences Consistency
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Global preferences are currently attached to inconsistent navigation contexts, and default values do not reflect the desired startup experience.

# Scope
- In:
  - Relocate global settings controls into `Network Scope` content.
  - Apply defaults for fresh/reset preference state: theme `dark` and snap-to-grid `enabled`.
  - Preserve existing persisted preferences during upgrade (no forced overwrite).
  - Keep reset-to-default behavior aligned with new defaults.
- Out:
  - Per-network preference model.
  - Extended theme families beyond normal/dark mode behavior.

# Acceptance criteria
- Global settings are managed in the `Network Scope` area, not under validation workflow.
- Fresh or reset preference state starts with dark mode and snap enabled.
- Existing persisted preferences remain untouched during migration.
- Default reset flow reproduces the new default baseline consistently.

# Priority
- Impact: High (user expectation and first-run experience).
- Urgency: High (explicit user request and UX consistency dependency).

# Notes
- Dependencies: item_055, item_020, item_031.
- Blocks: item_062.
- Related AC: AC1, AC5, AC6.
- References:
  - `logics/request/req_010_network_scope_workspace_shell_and_global_defaults.md`
  - `logics/request/req_003_theme_mode_switch_normal_dark.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/store/reducer/uiReducer.ts`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/app.ui.theme.spec.tsx`
  - `src/tests/persistence.localStorage.spec.ts`


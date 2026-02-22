## item_167_settings_2d_label_size_and_rotation_preferences_ui_and_persistence_wiring - Settings 2D Label Size and Rotation Preferences UI and Persistence Wiring
> From version: 0.6.2
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: User-Configurable 2D Label Readability Controls in Settings
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Users currently have no Settings controls to tune 2D label readability. The request requires explicit UI preferences for label size and rotation, persisted with other UI preferences and applied to the 2D renderer.

# Scope
- In:
  - Add a `Settings` control for 2D label size with `Small / Normal / Large`.
  - Add a `Settings` control for 2D label rotation with `0° / 20° / 45° / 90°`.
  - Wire both controls to the UI preferences system and runtime rendering.
  - Include both preferences in UI preference reset/default flows.
- Out:
  - Additional typography settings beyond size/rotation.
  - Per-screen/per-network overrides (global UI preference only).

# Acceptance criteria
- `Settings` exposes the two requested controls with the exact requested options.
- Preference changes apply at runtime to the 2D labels.
- Preferences persist across reloads/sessions through the existing UI preferences mechanism.
- UI preference reset behavior includes the new settings.

# Priority
- Impact: High (core user-facing control layer).
- Urgency: High.

# Notes
- Dependencies: item_166.
- Blocks: item_168, item_169, item_170.
- Related AC: AC3, AC4, AC5, AC6.
- References:
  - `logics/request/req_029_network_summary_2d_zoom_invariant_labels_with_size_and_rotation_preferences.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.settings.spec.tsx`


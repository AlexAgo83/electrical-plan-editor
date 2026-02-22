## item_178_network_summary_callout_visibility_toggle_and_settings_default_preference_for_connector_splice_cable_frames - Network Summary Callout Visibility Toggle and Settings Default Preference for Connector/Splice Cable Frames
> From version: 0.6.4
> Understanding: 98%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Global Visibility Control and Default Preference for 2D Connector/Splice Cable Callouts
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_031` introduces a potentially dense set of 2D callout frames (one per connector/splice). Users need an immediate runtime toggle in `Network summary` plus a persisted default in `Settings` so the feature can be enabled intentionally without overwhelming the diagram by default.

# Scope
- In:
  - Add a `Network summary` toolbar toggle for connector/splice cable callouts.
  - Place the toggle immediately after `Length`.
  - Add a `Settings` preference controlling the default visibility of these callouts.
  - Default value must be disabled.
  - Persist preference in UI preferences and wire it to reset/default preference flows.
  - Ensure `Apply canvas defaults now` applies the callout visibility default to the live view.
- Out:
  - Per-entity/per-group visibility filtering.
  - Advanced callout display presets beyond the single global toggle.

# Acceptance criteria
- `Network summary` toolbar exposes a callout visibility toggle positioned after `Length`.
- `Settings` exposes a default visibility preference for connector/splice cable callouts.
- Default preference is disabled and persists across sessions.
- `Apply canvas defaults now` reapplies the callout visibility default to runtime state.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_031`.
- Blocks: item_186.
- Related AC: AC1, AC9, AC10.
- References:
  - `logics/request/req_031_network_summary_2d_connector_and_splice_cable_info_frames_with_draggable_callouts.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/tests/app.ui.settings.spec.tsx`


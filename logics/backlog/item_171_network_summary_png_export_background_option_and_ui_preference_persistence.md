## item_171_network_summary_png_export_background_option_and_ui_preference_persistence - Network Summary PNG Export Background Option and UI Preference Persistence
> From version: 0.6.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Optional Background Inclusion for PNG Export with Transparent Default Preserved
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
PNG export currently behaves with a transparent background by default, but users need an opt-in way to include the rendered canvas background in PNG exports without changing the current default behavior.

# Scope
- In:
  - Add a `Settings` option to include/exclude background in PNG export.
  - Keep default disabled (transparent export) and preserve current behavior for existing users.
  - Persist the option in UI preferences and include it in reset/default flows.
  - Wire the option to the PNG export implementation so the exported image reflects the setting.
- Out:
  - New export formats or broader export workflow redesign.
  - Per-export modal/one-shot override UI unless explicitly added and documented.

# Acceptance criteria
- `Settings` exposes a PNG export background option.
- Default remains transparent export (background option disabled).
- When enabled, exported PNG includes the canvas background.
- Preference persists across sessions and is covered by reset/default behavior.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_030`.
- Blocks: item_177.
- Related AC: AC1, AC7.
- References:
  - `logics/request/req_030_network_summary_png_export_background_wires_length_sort_quick_entity_navigation_table_theming_and_2d_grid_negative_coordinates.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/tests/app.ui.settings.spec.tsx`


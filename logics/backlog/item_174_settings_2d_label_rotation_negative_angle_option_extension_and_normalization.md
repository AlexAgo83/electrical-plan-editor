## item_174_settings_2d_label_rotation_negative_angle_option_extension_and_normalization - Settings 2D Label Rotation Negative-Angle Option Extension and Normalization
> From version: 0.6.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Extend 2D Label Rotation Preferences with Inverse Angles and Safe Persistence Semantics
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The `2D label rotation` feature now exists, but users also need inverse (negative) angles (e.g. `-20°`, `-45°`) for symmetric readability choices. The option set, normalization, and persistence logic must be extended safely.

# Scope
- In:
  - Extend rotation option set to include negative counterparts for non-zero preset angles.
  - Preserve `0°` and centered rotation semantics.
  - Update UI preference normalization/persistence for the expanded value set.
  - Update Settings UI and regression coverage accordingly.
- Out:
  - Arbitrary freeform/custom rotation values.
  - Per-label rotation settings.

# Acceptance criteria
- `2D label rotation` exposes inverse (negative) angles for preset non-zero values.
- Negative values persist and normalize safely like positive values.
- Rotation remains centered and compatible with zoom-invariant labels.

# Priority
- Impact: Medium-high.
- Urgency: Medium-high.

# Notes
- Dependencies: `req_030`, and existing `req_029` label rotation implementation.
- Blocks: item_177.
- Related AC: AC3b, AC7.
- References:
  - `logics/request/req_030_network_summary_png_export_background_wires_length_sort_quick_entity_navigation_table_theming_and_2d_grid_negative_coordinates.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`


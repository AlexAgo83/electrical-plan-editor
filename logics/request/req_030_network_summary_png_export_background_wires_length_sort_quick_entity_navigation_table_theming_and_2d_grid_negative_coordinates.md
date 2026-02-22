## req_030_network_summary_png_export_background_wires_length_sort_quick_entity_navigation_table_theming_and_2d_grid_negative_coordinates - Network Summary PNG Export Background, Wires Length Sorting, Quick Entity Navigation, Table Theming/Highlight Refinement, and 2D Grid Negative Coordinates
> From version: 0.6.3
> Understanding: 99%
> Confidence: 100%
> Complexity: Medium-High
> Theme: Workflow and Visualization Polish Across Export, Tables, Navigation, Theming, and 2D Canvas Placement
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Add a `Settings` option to include the canvas background in PNG export while preserving current transparent-default behavior.
- Allow sorting `Wires` tables by `Length (mm)`.
- Add a compact quick entity navigation strip after `Route preview` to speed switching between entities (modeling/analysis variants differ).
- Improve theme coverage on table headers (including icons).
- Make highlighted table rows/cells more discreet while emphasizing names/IDs via bold text.
- Remove the current effective limitation that prevents free placement toward negative X/Y coordinates in the 2D grid.
- Increase the `zoom -` (zoom-out) range so users can zoom out further (target: potentially up to about double the current limit) while keeping the view usable.

# Context
Recent UI/UX refinements improved the 2D `Network summary`, validation workflows, Home screen, and theme coverage. The next round of polish spans several adjacent areas:

1. **PNG export background control**: users sometimes want a transparent export (current behavior) and sometimes want the themed/grid background included.
2. **Wires table sorting gap**: `Length (mm)` is a key analysis field but is not yet an available sort key in the `Wires` tables.
3. **Quick entity switching**: `Entity navigation` exists, but a compact inline navigation strip near `Route preview` would reduce pointer travel while inspecting routing-related entities.
4. **Theme consistency drift**: table headers (and header icons) still show places where theme colors are not fully applied.
5. **Highlight rendering density**: highlighted rows/cells can feel visually heavy; the background highlight should be more subtle while text emphasis remains clear.
6. **2D grid placement freedom**: entity movement appears clamped to non-negative coordinates, which blocks free positioning upward/leftward in the canvas.
7. **Zoom-out range limit**: the current `zoom -` range feels too restrictive for broader framing on larger layouts.

This request groups these refinements because they affect the same day-to-day modeling/analysis workflows and should be delivered with coherent regression coverage.

## Objectives
- Keep transparent PNG export as default, while offering an opt-in `include background` export mode in `Settings`.
- Make `Wires` sorting more useful by supporting `Length (mm)` in relevant tables.
- Add a compact, route-adjacent quick navigation strip for entity switching in `Modeling` and `Analysis`.
- Improve theme completeness on table headers/icons and reduce visual heaviness of highlight backgrounds.
- Ensure 2D entity movement supports negative coordinates (X and/or Y < 0) and the zoom-out range is expanded, without breaking grid/snap interactions.

## Functional Scope
### A. PNG export background option (high priority)
- Add a `Settings` option controlling whether PNG export includes the rendered background (grid/theme background) or remains transparent.
- Default must remain **disabled** (transparent PNG export, same as current behavior).
- When enabled, PNG export should include the background consistently with the current visual canvas theme/background state.
- The option should be persisted with UI preferences and included in reset/default preference flows.

### B. Wires table sorting by `Length (mm)` (high priority)
- Add `Length (mm)` as a sortable field in `Wires` tables where sorting controls are already present.
- Sorting behavior should align with existing sort interactions (ascending/descending semantics, active sort indicators, etc.).
- Numeric sorting must be used (not string sorting).

### C. Compact quick entity navigation strip after `Route preview` (high priority)
- Add a compact panel/strip immediately after `Route preview` (full width, no title) to switch between entities quickly.
- Layout constraints:
  - compact rendering
  - no title
  - placed directly after `Route preview`
  - takes full available width
  - items fit on one line (compact chips/buttons; horizontal scroll acceptable only if explicitly designed and documented)
- Behavior should be based on `Entity navigation` semantics, but adapted for context:
  - `Modeling` and `Analysis` may expose different item counts/types
  - active state and selection/focus synchronization should remain coherent
- If item metadata includes the subnetwork label, display the field label as `Sub-network tag (optional)`.
- Avoid duplicating business logic if existing navigation models can be reused/derived.

### C2. 2D label rotation option extension (high priority)
- Extend the `2D label rotation` setting option set to include inverse angles as well (negative values), e.g. `-20°`, `-45°`, and symmetric counterparts for any positive non-zero values offered.
- Keep `0°` available.
- Apply the same persistence/normalization expectations to negative rotation values as to positive ones.
- Rotation remains centered on labels (same geometry rules as existing rotation support).

### D. Theme application on table headers (including icons) (medium priority)
- Ensure table headers and header icons consistently use the active theme palette across supported themes.
- Cover both legacy and newer composed themes.
- Keep contrast/readability acceptable.

### E. Highlighted table row/cell rendering refinement (medium priority)
- For highlighted row/cell states, significantly increase background transparency (more discreet highlight).
- Apply bold text styling to names and IDs within highlighted rows/cells to preserve salience.
- Keep selected/focused/hover states visually distinguishable (avoid ambiguity after reducing background strength).

### F. 2D grid negative-coordinate movement support (high priority)
- Remove/relax the effective constraint preventing entities from being moved to negative X and/or Y positions.
- Preserve grid and snap behavior when enabled.
- Ensure `Fit network`, panning, and zoom interactions still behave correctly after negative-coordinate placement is possible.
- Expand the `zoom -` range (lower zoom bound) so users can zoom out further; target a safe increase up to roughly **2x** the current zoom-out room unless testing indicates a smaller bound is required.
- Preserve usability at the expanded zoom-out range (grid readability, labels, hit targets, and pan/zoom feel).
- Non-regression requirement: existing subnetwork deemphasis behavior remains correct, including applying transparency to a node when none of its connected subnetworks remain active.

### G. Validation and delivery traceability (closure target)
- Add/adjust regression tests for affected UI behavior (sorting, quick navigation strip, PNG export setting wiring if testable, 2D movement constraints, and subnetwork node deemphasis non-regression).
- Document implementation decisions and AC traceability in Logics artifacts.

## Non-functional requirements
- Preserve current performance characteristics in `Network summary` and tables (no heavy recomputation for quick navigation rendering).
- Keep the quick navigation strip compact and visually aligned with existing panels/controls.
- Maintain theme compatibility across all supported themes.
- Keep changes localized and reviewable (avoid broad table/canvas architecture rewrites unless necessary to remove negative-coordinate clamp).

## Validation and regression safety
- Targeted tests (minimum, depending on touched areas):
  - `src/tests/app.ui.navigation-canvas.spec.tsx` (2D movement/grid behavior, quick nav interactions if wired here, subnetwork node deemphasis non-regression)
  - `src/tests/app.ui.settings.spec.tsx` (PNG export background setting persistence/wiring)
  - table-related UI tests touching wires sorting (e.g. modeling/analysis table suites)
- Visual/build checks (recommended):
  - `npm run build`
  - manual verification across representative themes for table headers/icons and row highlights
- Closure validation (recommended):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: `Settings` includes a persisted option to include background in PNG export; default remains disabled (transparent export).
- AC2: `Wires` tables support sorting by `Length (mm)` using numeric ordering and existing sort UX conventions.
- AC3: A compact full-width quick entity navigation strip appears immediately after `Route preview`, without a title, and supports fast entity switching with screen-specific item sets (`Modeling` vs `Analysis`).
- AC3b: `2D label rotation` options include inverse (negative) angle values (e.g. `-20°`, `-45°`) with persistence/normalization and centered application semantics preserved.
- AC4: Table headers (including icons) consistently apply the active theme palette across supported themes.
- AC5: Highlighted table row/cell backgrounds become noticeably more discreet while names/IDs are bolded in highlighted state and state clarity is preserved.
- AC6: 2D entity movement supports negative X/Y placement and expanded `zoom -` range while preserving grid/snap, fit, pan, and zoom usability, without regressing subnetwork deemphasis (including nodes with no active connected subnetworks).
- AC7: Regression coverage, theme verification, and validation suites / Logics lint pass.

## Out of scope
- New export formats beyond the existing PNG flow.
- Broad redesign of all table layouts beyond header theming and highlight styling refinements.
- Replacing `Entity navigation` entirely (this request adds a compact complementary quick-navigation strip near `Route preview`).
- Changing network data schema for coordinate storage unless required and explicitly documented.

# Backlog
- `logics/backlog/item_171_network_summary_png_export_background_option_and_ui_preference_persistence.md`
- `logics/backlog/item_172_wires_table_length_mm_sorting_support_and_numeric_ordering.md`
- `logics/backlog/item_173_route_preview_adjacent_quick_entity_navigation_strip_modeling_analysis_variants_and_optional_subnetwork_tag.md`
- `logics/backlog/item_174_settings_2d_label_rotation_negative_angle_option_extension_and_normalization.md`
- `logics/backlog/item_175_table_header_theme_coverage_with_icons_and_highlight_row_cell_visual_refinement.md`
- `logics/backlog/item_176_network_summary_2d_negative_coordinate_placement_zoom_out_range_expansion_and_subnetwork_node_deemphasis_non_regression.md`
- `logics/backlog/item_177_req_030_workflow_canvas_polish_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# References
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useCanvasInteractionHandlers.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
- `src/app/components/workspace/ValidationWorkspaceContent.tsx`
- `src/app/styles/base/base-theme-overrides.css`
- `src/app/styles/tables.css`
- `src/app/styles/workspace/workspace-panels-and-responsive.css`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`

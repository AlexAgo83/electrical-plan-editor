## task_029_network_summary_png_export_background_wires_length_sort_quick_entity_navigation_table_theming_and_2d_grid_negative_coordinates_orchestration_and_delivery_control - Network Summary PNG Export Background, Wires Length Sorting, Quick Entity Navigation, Table Theming/Highlight Refinement, and 2D Grid Negative Coordinates Orchestration and Delivery Control
> From version: 0.6.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium-High
> Theme: Delivery Orchestration for Cross-Cutting Workflow/Table/Canvas Polish and Interaction Freedom Improvements
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_030`. This task coordinates delivery of: PNG export background option (transparent default preserved), `Wires` sorting by `Length (mm)`, a compact quick entity navigation strip after `Route preview`, extension of `2D label rotation` to include inverse angles, table header theme/icon coverage and highlight styling refinement, and 2D negative-coordinate movement + expanded zoom-out range without regressing subnetwork node deemphasis behavior.

Backlog scope covered:
- `item_171_network_summary_png_export_background_option_and_ui_preference_persistence.md`
- `item_172_wires_table_length_mm_sorting_support_and_numeric_ordering.md`
- `item_173_route_preview_adjacent_quick_entity_navigation_strip_modeling_analysis_variants_and_optional_subnetwork_tag.md`
- `item_174_settings_2d_label_rotation_negative_angle_option_extension_and_normalization.md`
- `item_175_table_header_theme_coverage_with_icons_and_highlight_row_cell_visual_refinement.md`
- `item_176_network_summary_2d_negative_coordinate_placement_zoom_out_range_expansion_and_subnetwork_node_deemphasis_non_regression.md`
- `item_177_req_030_workflow_canvas_polish_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 PNG export background setting with transparent-default preservation and UI preference persistence (`item_171`)
- [ ] 2. Deliver Wave 1 `Wires` table sorting by `Length (mm)` with numeric ordering (`item_172`)
- [ ] 3. Deliver Wave 2 compact quick entity navigation strip after `Route preview` (Modeling/Analysis variants + optional subnetwork label wording) (`item_173`)
- [ ] 4. Deliver Wave 3 `2D label rotation` negative-angle option extension and normalization/persistence coverage (`item_174`)
- [ ] 5. Deliver Wave 4 table header theme/icon coverage and highlighted row/cell visual refinement (`item_175`)
- [ ] 6. Deliver Wave 5 2D negative-coordinate movement + expanded zoom-out range with subnetwork node deemphasis non-regression (`item_176`)
- [ ] 7. Deliver Wave 6 closure: CI/E2E/build/PWA pass and `req_030` AC traceability (`item_177`)
- [ ] FINAL: Update related Logics docs (request/task/backlog statuses + delivery summary)

# Validation
- Documentation / Logics:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static analysis / compile safety:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run quality:ui-modularization`
  - `npm run quality:store-modularization`
- Automated tests:
  - Targeted runs during implementation (recommended):
    - `src/tests/app.ui.settings.spec.tsx`
    - `src/tests/app.ui.navigation-canvas.spec.tsx`
    - table-related UI suites touched by wires sorting and highlight styling
  - `npm run test:ci`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 pending: PNG export background setting (transparent default preserved) + UI preference persistence wiring.
  - Wave 1 pending: `Wires` sort support for `Length (mm)` with numeric ordering and UI sort indicators.
  - Wave 2 pending: compact quick entity navigation strip after `Route preview` with Modeling/Analysis-specific item sets and optional `Sub-network tag (optional)` metadata labeling.
  - Wave 3 pending: negative `2D label rotation` options (e.g. `-20°`, `-45°`) added with persistence/normalization safety and centered rotation semantics preserved.
  - Wave 4 pending: table header/icon theme coverage plus more discreet highlight background styling and bold names/IDs in highlighted rows/cells.
  - Wave 5 pending: remove negative-coordinate placement clamp and expand zoom-out range while preserving grid/snap/fit/pan/zoom and subnetwork node deemphasis behavior.
  - Wave 6 pending: closure validation suite and AC traceability.
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - PNG export background implementation breaks transparent export default or leaks theme/background unexpectedly.
  - `Wires` sorting introduces lexical sort bugs for lengths.
  - Quick nav strip duplicates navigation logic and drifts from `Entity navigation` behavior.
  - Table highlight refinements reduce distinguishability between hover/selected/highlight states.
  - Negative-coordinate/zoom-out changes regress fit behavior or subnetwork deemphasis node logic.
  - Negative label rotation option extension conflicts with existing preference normalization.
- Mitigation strategy:
  - Add targeted tests per wave before running full CI.
  - Reuse existing navigation and preference models instead of parallel logic where possible.
  - Validate representative themes manually after table header/highlight styling changes.
  - Add explicit navigation-canvas regression assertions for negative coordinates, expanded zoom-out range, and node deemphasis non-regression.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` OK (`req_030` planning doc)
- Delivery snapshot:
  - To be completed during implementation.
- AC traceability (`req_030`) target mapping:
  - AC1 target: Wave 0 (`item_171`) + Wave 6 (`item_177`)
  - AC2 target: Wave 1 (`item_172`) + Wave 6 (`item_177`)
  - AC3 target: Wave 2 (`item_173`) + Wave 6 (`item_177`)
  - AC3b target: Wave 3 (`item_174`) + Wave 6 (`item_177`)
  - AC4 target: Wave 4 (`item_175`) + Wave 6 (`item_177`)
  - AC5 target: Wave 4 (`item_175`) + Wave 6 (`item_177`)
  - AC6 target: Wave 5 (`item_176`) + Wave 6 (`item_177`)
  - AC7 target: Waves 0-6 + FINAL docs update

# References
- `logics/request/req_030_network_summary_png_export_background_wires_length_sort_quick_entity_navigation_table_theming_and_2d_grid_negative_coordinates.md`
- `logics/backlog/item_171_network_summary_png_export_background_option_and_ui_preference_persistence.md`
- `logics/backlog/item_172_wires_table_length_mm_sorting_support_and_numeric_ordering.md`
- `logics/backlog/item_173_route_preview_adjacent_quick_entity_navigation_strip_modeling_analysis_variants_and_optional_subnetwork_tag.md`
- `logics/backlog/item_174_settings_2d_label_rotation_negative_angle_option_extension_and_normalization.md`
- `logics/backlog/item_175_table_header_theme_coverage_with_icons_and_highlight_row_cell_visual_refinement.md`
- `logics/backlog/item_176_network_summary_2d_negative_coordinate_placement_zoom_out_range_expansion_and_subnetwork_node_deemphasis_non_regression.md`
- `logics/backlog/item_177_req_030_workflow_canvas_polish_closure_ci_e2e_build_pwa_and_ac_traceability.md`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useCanvasInteractionHandlers.ts`
- `src/app/hooks/useCanvasState.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `package.json`


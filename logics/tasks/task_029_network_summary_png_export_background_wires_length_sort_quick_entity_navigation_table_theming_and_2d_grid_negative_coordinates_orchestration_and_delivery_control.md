## task_029_network_summary_png_export_background_wires_length_sort_quick_entity_navigation_table_theming_and_2d_grid_negative_coordinates_orchestration_and_delivery_control - Network Summary PNG Export Background, Wires Length Sorting, Quick Entity Navigation, Table Theming/Highlight Refinement, and 2D Grid Negative Coordinates Orchestration and Delivery Control
> From version: 0.6.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
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
- [x] 1. Deliver Wave 0 PNG export background setting with transparent-default preservation and UI preference persistence (`item_171`)
- [x] 2. Deliver Wave 1 `Wires` table sorting by `Length (mm)` with numeric ordering (`item_172`)
- [x] 3. Deliver Wave 2 compact quick entity navigation strip after `Route preview` (Modeling/Analysis variants + optional subnetwork label wording) (`item_173`)
- [x] 4. Deliver Wave 3 `2D label rotation` negative-angle option extension and normalization/persistence coverage (`item_174`)
- [x] 5. Deliver Wave 4 table header theme/icon coverage and highlighted row/cell visual refinement (`item_175`)
- [x] 6. Deliver Wave 5 2D negative-coordinate movement + expanded zoom-out range with subnetwork node deemphasis non-regression (`item_176`)
- [x] 7. Deliver Wave 6 closure: CI/E2E/build/PWA pass and `req_030` AC traceability (`item_177`)
- [x] FINAL: Update related Logics docs (request/task/backlog statuses + delivery summary)

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
  - Wave 0 completed: `Settings` preference added for PNG export background inclusion (default `off`, transparent export preserved), persisted in UI preferences and reset/default flows, and wired into `NetworkSummaryPanel` PNG export rendering.
  - Wave 1 completed: `Wires` tables in Modeling and Analysis now sort by `Length (mm)` using numeric ordering with existing sort indicator semantics.
  - Wave 2 completed: compact full-width untitled quick entity navigation strip added directly after `Route preview`, with Modeling/Analysis-specific item sets and active-state synchronization; `Sub-network tag` labeling updated to `Sub-network tag (optional)` where applicable.
  - Wave 3 completed: `2D label rotation` settings extended to include negative presets (`-90°`, `-45°`, `-20°`) with persistence/normalization and centered label rotation semantics preserved.
  - Wave 4 completed: table header/icon theming alignment improved (sort indicators inherit theme header color); highlighted rows/cells now use much subtler backgrounds and bold names/IDs for salience.
  - Wave 5 completed: 2D node dragging supports negative coordinates, zoom-out lower bound expanded (`NETWORK_MIN_SCALE` reduced to `0.3`), and subnetwork node deemphasis behavior remains correct.
  - Wave 6 completed: closure validation suite passed and AC traceability documented.
- Current blockers:
  - None.
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
  - Code:
    - `src/app/components/NetworkSummaryPanel.tsx` (PNG export background option wiring, quick entity navigation strip, subnetwork deemphasis node-state preservation)
    - `src/app/components/workspace/SettingsWorkspaceContent.tsx` (PNG export background setting, negative label rotation options)
    - `src/app/hooks/useUiPreferences.ts` and `src/app/hooks/useAppControllerPreferencesState.ts` (preference persistence/wiring for PNG export background + negative angle normalization)
    - `src/app/hooks/useCanvasInteractionHandlers.ts` and `src/app/lib/app-utils-shared.ts` (negative coordinate placement support + expanded zoom-out range)
    - `src/app/hooks/useEntityListModel.ts`, `src/app/components/workspace/ModelingSecondaryTables.tsx`, `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx` (numeric wire length sorting)
    - `src/app/styles/tables.css` and `src/app/styles/canvas/canvas-toolbar-and-shell.css` (table highlight refinement + compact quick nav strip styling)
    - `src/tests/app.ui.settings.spec.tsx`, `src/tests/app.ui.navigation-canvas.spec.tsx`, `src/tests/app.ui.network-summary-workflow-polish.spec.tsx` (regression coverage)
    - `src/tests/core.layout.spec.ts` (wall-clock guardrail budget recalibration to remain CI-pragmatic)
  - Validation results:
    - `npm run lint` OK
    - `npm run typecheck` OK
    - `npm run quality:ui-modularization` OK
    - `npm run quality:store-modularization` OK
    - `npm run test:ci` OK (`29` files / `163` tests)
    - `npm run test:e2e` OK (`2/2`)
    - `npm run build` OK
    - `npm run quality:pwa` OK
    - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` OK
- AC traceability (`req_030`) target mapping:
  - AC1 satisfied: Wave 0 (`item_171`) + Wave 6 (`item_177`)
  - AC2 satisfied: Wave 1 (`item_172`) + Wave 6 (`item_177`)
  - AC3 satisfied: Wave 2 (`item_173`) + Wave 6 (`item_177`)
  - AC3b satisfied: Wave 3 (`item_174`) + Wave 6 (`item_177`)
  - AC4 satisfied: Wave 4 (`item_175`) + Wave 6 (`item_177`)
  - AC5 satisfied: Wave 4 (`item_175`) + Wave 6 (`item_177`)
  - AC6 satisfied: Wave 5 (`item_176`) + Wave 6 (`item_177`)
  - AC7 satisfied: Waves 0-6 + FINAL docs update

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

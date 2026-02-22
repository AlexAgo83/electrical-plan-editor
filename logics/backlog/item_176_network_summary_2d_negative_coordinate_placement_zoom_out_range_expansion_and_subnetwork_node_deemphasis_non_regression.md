## item_176_network_summary_2d_negative_coordinate_placement_zoom_out_range_expansion_and_subnetwork_node_deemphasis_non_regression - Network Summary 2D Negative-Coordinate Placement, Zoom-Out Range Expansion, and Subnetwork Node Deemphasis Non-Regression
> From version: 0.6.3
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium-High
> Theme: Remove Canvas Placement Constraints While Preserving Deemphasis and Interaction Usability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The 2D grid/canvas interaction currently appears to prevent free movement into negative coordinates, and the zoom-out range is too restrictive. These constraints limit composition freedom and high-level framing. Changes here must not regress subnetwork deemphasis behavior (including node opacity rules).

# Scope
- In:
  - Remove/relax clamping that blocks X/Y < 0 placement in 2D movement workflows.
  - Expand `zoom -` range (lower zoom bound), targeting roughly up to 2x current zoom-out room if usability allows.
  - Preserve grid/snap, fit network, pan, zoom, and hit interactions.
  - Preserve subnetwork deemphasis correctness, including node transparency when no active connected subnetwork remains.
  - Add targeted regression coverage for movement/zoom/deemphasis interactions.
- Out:
  - Rewriting the 2D renderer architecture.
  - New snapping modes or coordinate systems.

# Acceptance criteria
- Entities can be moved to negative X and/or Y positions.
- Zoom-out range is expanded with usable interaction behavior.
- Grid/snap/fit/pan/zoom remain usable after the change.
- Subnetwork node deemphasis non-regression is verified (nodes with no active connected subnetworks still become transparent).

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_030`.
- Blocks: item_177.
- Related AC: AC6, AC7.
- References:
  - `logics/request/req_030_network_summary_png_export_background_wires_length_sort_quick_entity_navigation_table_theming_and_2d_grid_negative_coordinates.md`
  - `src/app/hooks/useCanvasInteractionHandlers.ts`
  - `src/app/hooks/useCanvasState.ts`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`


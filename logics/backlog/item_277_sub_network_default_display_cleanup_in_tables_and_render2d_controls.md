## item_277_sub_network_default_display_cleanup_in_tables_and_render2d_controls - Sub-network Default Display Cleanup in Tables and Render2D Controls
> From version: 0.8.1
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Reduce `(default)` label noise in table and 2D sub-network controls
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Showing literal `(default)` in sub-network table cells and render2d controls adds noise and visual clutter, and `Enable all` is not useful when no non-default sub-networks exist.

# Scope
- In:
  - Hide `(default)` in relevant `Sub-network` table cells (render blank).
  - Hide `(default)` from render2d sub-network info/control listings.
  - Hide `Enable all` when no non-default sub-networks exist.
  - Ensure controls return correctly when non-default sub-networks exist later.
- Out:
  - Sub-network sorting infrastructure across all tables (item_269 covers sortability baseline).
  - Callout section enrichment (item_276).
  - Table header theming (item_278).

# Acceptance criteria
- `(default)` is not rendered in relevant table cells or render2d sub-network listings.
- `Enable all` is hidden when only default sub-network exists.
- Behavior is deterministic when non-default sub-networks appear.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_044`.
- Blocks: item_281.
- Related AC: AC9, AC17.
- References:
  - `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
  - `src/app/styles/canvas/canvas-diagram-and-overlays.css`

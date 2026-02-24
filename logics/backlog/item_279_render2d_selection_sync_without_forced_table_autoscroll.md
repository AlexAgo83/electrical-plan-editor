## item_279_render2d_selection_sync_without_forced_table_autoscroll - Render2D Selection Sync Without Forced Table Auto-scroll
> From version: 0.8.1
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium-High
> Theme: Selection synchronization UX refinement for canvas-origin interactions
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
When selection originates from a render2d/canvas click, the UI currently auto-scrolls to the linked table row, causing disruptive viewport jumps across screens with table-backed focus synchronization.

# Scope
- In:
  - Preserve selection synchronization and row highlight/focus state updates.
  - Remove forced viewport auto-scroll when selection origin is render2d/canvas.
  - Apply across in-scope screens with shared row-focus scroll behavior.
  - Preserve keyboard/list-origin focus ergonomics and explicit row navigation behavior.
  - Parameterize/split shared focus helper behavior if needed by selection origin.
- Out:
  - Changing list-origin focus/scroll behavior after table clicks.
  - General selection model redesign.
  - Analysis panel content enrichment unrelated to scroll behavior.

# Acceptance criteria
- Canvas-origin selection no longer forces table viewport scroll.
- Selection synchronization and row highlighting remain functional.
- Table-origin focus/scroll interactions continue to work as before.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_044`.
- Blocks: item_281.
- Related AC: AC11, AC17.
- References:
  - `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
  - `src/app/lib/app-utils-shared.ts`
  - `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

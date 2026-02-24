## item_273_wires_table_column_order_section_before_length_and_analysis_info_enrichment - Wires Table Column Order (Section Before Length) and Analysis Info Enrichment
> From version: 0.8.1
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium-High
> Theme: Wire table ordering and wire analysis metadata surfacing baseline
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Wire metadata is richer than current wire tables/analysis surfaces expose, and `Section` column placement is not aligned with the desired reading order next to `Length`.

# Scope
- In:
  - Move `Section` column to immediately before `Length` in relevant wire tables.
  - Enrich Wires analysis with at least: section, wire color(s), and endpoint references when present.
  - Keep optional-value rendering safe (`No color`, empty references).
  - Document the final delivered Wires analysis additions in closure notes/task traceability.
- Out:
  - Connector/splice analysis swatches (item_275).
  - Callout `length + section` rendering (item_276).
  - Global sortability infrastructure (item_269).

# Acceptance criteria
- `Section` appears immediately before `Length` in relevant wire tables.
- Wires analysis surfaces at least section, color(s), and endpoint references (when present).
- Delivered Wires analysis additions are explicitly documented.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_044`.
- Blocks: item_281.
- Related AC: AC5, AC7, AC17.
- References:
  - `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/lib/cable-colors.ts`

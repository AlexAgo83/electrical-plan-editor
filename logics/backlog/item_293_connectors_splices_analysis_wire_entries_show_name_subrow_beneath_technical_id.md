## item_293_connectors_splices_analysis_wire_entries_show_name_subrow_beneath_technical_id - Connectors/Splices Analysis Wire Entries Show Name Subrow Beneath Technical ID
> From version: 0.9.1
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Connector/Splice analysis readability through two-line wire identity rendering
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
In `Connectors` and `Splices` analysis views, wire entries grouped by `Way` / `Port` emphasize the wire technical ID but do not consistently surface the wire/cable name inline. This slows scanability when operators recognize cables by name first.

# Scope
- In:
  - Update wire entry rendering in `Connectors` and `Splices` analysis group lists (`Way` / `Port`) to show:
    - primary line: wire technical ID
    - secondary line: wire/cable name (when available)
  - Preserve existing grouping by `Way` / `Port`.
  - Preserve existing wire color swatches / metadata already rendered in these lists.
  - Handle missing/empty names without introducing blank lines or noisy duplication.
  - Keep theme/readability consistency for the new secondary line styling.
- Out:
  - Rework of grouping logic or sort order semantics beyond the two-line identity presentation.
  - Changes to 2D callout wire content rendering (unless implementation intentionally reuses shared renderer with no regression).
  - Shared table entry-count footer rollout (handled in item_294).
  - `Wires` table endpoint column split (handled in item_292).

# Acceptance criteria
- Connector and splice analysis wire entries grouped by `Way` / `Port` show the wire name on a secondary line beneath the technical ID when a name exists.
- Missing/empty wire names do not create blank spacing or duplicated noisy labels.
- Existing analysis interactions/grouping remain functional and non-regressed.

# Priority
- Impact: Medium-High.
- Urgency: High.

# Notes
- Dependencies: `req_047`, `req_044` (analysis enrichment baseline and wire swatch rendering context).
- Blocks: item_296.
- Related AC: AC3, AC8, AC9.
- References:
  - `logics/request/req_047_table_readability_endpoint_column_split_analysis_wire_name_subrows_and_filtered_entry_count_footers.md`
  - `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
  - `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
  - `src/app/styles/tables.css`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`

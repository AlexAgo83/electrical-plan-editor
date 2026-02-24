## item_269_shared_table_sortability_completion_audit_and_column_comparator_rollout - Shared Table Sortability Completion Audit and Column Comparator Rollout
> From version: 0.8.1
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Shared sortability infrastructure, comparator normalization, and all-table column audit
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Sortability is inconsistent across workspace tables and columns. Before panel-by-panel UI changes, the implementation needs a shared audit and comparator rollout strategy so optional, derived, and formatted columns sort deterministically without regressions.

# Scope
- In:
  - Audit in-scope workspace tables/columns and identify unsortable columns.
  - Define/extend shared comparator helpers for text, numeric, optional, and formatted values.
  - Document and implement the empty-value sorting strategy (recommended: empties bottom in both directions).
  - Wire sortability support for audited columns or establish a normalized pattern that panel items can apply.
  - Preserve current sort indicators and interactions while expanding support.
- Out:
  - Connector/splice manufacturer reference column addition (item_270).
  - New analysis panels for Nodes/Segments (items_271-272).
  - Callout and analysis enrichment UI polish (later items).

# Acceptance criteria
- An auditable list of in-scope sortable columns is established and implemented (or explicitly deferred with rationale).
- Shared comparator behavior safely handles optional/empty values and formatted columns.
- Column sorting support can be reused consistently by downstream req_044 items.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_044`.
- Blocks: item_270, item_271, item_272, item_273, item_278, item_281.
- Related AC: AC1, AC16, AC17.
- References:
  - `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
  - `src/app/hooks/useEntityListModel.ts`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`

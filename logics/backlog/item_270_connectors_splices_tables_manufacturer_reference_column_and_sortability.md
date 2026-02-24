## item_270_connectors_splices_tables_manufacturer_reference_column_and_sortability - Connectors/Splices Tables Manufacturer Reference Column and Sortability
> From version: 0.8.1
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Expose manufacturer reference in connector/splice tables with compact header and sorting
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`manufacturerReference` exists in the model and forms but is not surfaced in connector/splice tables, reducing list-level visibility and forcing users into forms/inspectors for a common identification field.

# Scope
- In:
  - Add a `manufacturerReference` column to connector tables.
  - Add a `manufacturerReference` column to splice tables.
  - Use an abbreviated header label (recommended: `Mfr Ref`).
  - Ensure clean empty rendering and sortability for the new column.
  - Preserve existing table selection/edit interactions and widths as much as possible.
- Out:
  - Inspector-only metadata surfacing unrelated to connector/splice tables.
  - Nodes/Segments analysis panel creation.
  - Cross-table sort infrastructure changes beyond what item_269 provides.

# Acceptance criteria
- Connector and splice tables display a `manufacturerReference` column with abbreviated header text.
- The new column is sortable and handles empty values safely.
- No regression in row selection/edit flows is introduced by the added column.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_044`.
- Blocks: item_281.
- Related AC: AC2, AC17.
- References:
  - `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`

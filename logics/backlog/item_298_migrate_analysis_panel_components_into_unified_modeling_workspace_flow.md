## item_298_migrate_analysis_panel_components_into_unified_modeling_workspace_flow - Migrate Analysis Panel Components into Unified Modeling Workspace Flow
> From version: 0.9.1
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Reusing existing Analysis panel components within the unified Modeling workflow
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even if `Modeling` gains a unified composition shell, users still need the actual analysis panel capabilities (`Connectors`, `Splices`, `Wires`, `Nodes`, `Segments`) available inside that workspace. The migration must preserve delivered analysis functionality without duplicating logic.

# Scope
- In:
  - Integrate existing analysis panel components into the unified `Modeling` workspace flow:
    - `AnalysisConnectorWorkspacePanels`
    - `AnalysisSpliceWorkspacePanels`
    - `AnalysisWireWorkspacePanels`
    - `AnalysisNodeSegmentWorkspacePanels`
  - Preserve analysis panel behavior after migration:
    - rendering
    - filtering
    - sorting
    - selection/focused-row interactions
    - existing analysis enrichments (wire metadata, swatches, etc.)
  - Prefer reuse/composition of existing `Analysis*WorkspacePanels` rather than cloning panel logic.
  - Ensure panel-family discoverability via unified `Modeling` sub-navigation/focus controls.
- Out:
  - Top-level `Analysis` nav alias/redirect behavior (handled in item_299).
  - Cross-panel state continuity hardening and broader regression test pass (handled in item_300).
  - Post-stabilization cleanup/removal of legacy `Analysis` wrappers.

# Acceptance criteria
- All analysis panel families currently available in `Analysis` are accessible from the unified `Modeling` workspace.
- Migrated analysis panels preserve core functionality (render/filter/sort/selection) after integration.
- The migration reuses existing analysis panel components or shared logic paths (no unnecessary duplicated implementations).

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_048`, item_297, `req_044` (analysis panel baseline delivered features).
- Blocks: item_299, item_300, item_301.
- Related AC: AC1, AC2, AC6, AC8, AC9.
- References:
  - `logics/request/req_048_merge_modeling_and_analysis_by_migrating_analysis_panels_into_modeling_workspace.md`
  - `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
  - `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
  - `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`

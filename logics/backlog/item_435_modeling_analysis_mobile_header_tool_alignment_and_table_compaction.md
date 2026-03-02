## item_435_modeling_analysis_mobile_header_tool_alignment_and_table_compaction - Modeling/Analysis mobile header-tool alignment and table compaction
> From version: 0.9.18
> Status: Draft
> Understanding: 99%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Mobile table/readability compaction across Catalog, Modeling, Analysis, and Validation
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Multiple table/list surfaces still use desktop-sized labels and columns in mobile mode, causing avoidable wrapping and horizontal pressure.

# Scope
- In:
  - keep `CSV` + `Help` on the same title row (right-aligned) for `Catalog`, `Connectors`, `Splices`, `Nodes`, `Segments`, and `Wires`;
  - mobile label compaction in `Catalog`: `Manufacturer ref` -> `Mnf ref`, `Unit price HT (DEV)` -> `Price`, `Connections` -> `Con.`, `Import CSV` -> `Import`;
  - shared mobile table label compaction: `Reference` -> `Ref.`, `Technical ID` -> `ID`, `Endpoint A/B` -> `End A/B`, `Length (mm)` -> `Len`, `Section (mm2|mm²)` -> `Sec`, `Occupied` -> `Occup.`;
  - mobile column visibility compaction: hide `Route mode` in wire tables and hide `Severity` in Validation table.
- Out:
  - desktop/tablet copy changes;
  - data/export schema changes;
  - sorting/filtering logic changes beyond presentation-level label/visibility adjustments.

# Acceptance criteria
- AC1: On mobile, targeted panel title rows keep `CSV`/`Help` aligned on the same line for `Catalog`, `Connectors`, `Splices`, `Nodes`, `Segments`, and `Wires`.
- AC2: On mobile, Catalog header/action labels are compacted to `Mnf ref`, `Price`, `Con.`, and `Import`.
- AC3: On mobile, shared headers use compact labels (`Ref.`, `ID`, `End A/B`, `Len`, `Sec`, `Occup.`) where applicable.
- AC4: On mobile, `Route mode` is hidden in affected wire tables.
- AC5: On mobile, `Severity` is hidden in Validation table.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_085`.
- Blocks: `item_436`, `task_074`.
- Related AC: `AC5`, `AC6`, `AC7`, `AC8`, `AC9`, `AC10`, `AC11`.
- References:
  - `logics/request/req_085_mobile_onboarding_and_workspace_header_compaction_for_small_screens.md`
  - `src/app/components/workspace/ModelingCatalogListPanel.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/components/workspace/ValidationWorkspaceContent.tsx`
  - `src/app/styles/tables.css`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.catalog.spec.tsx`

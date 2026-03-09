## item_521_wire_csv_begin_end_connection_and_seal_reference_columns_alignment - Wire CSV begin/end connection and seal reference columns alignment
> From version: 1.3.3
> Status: Ready
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Export / Wire CSV / Schema
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Wire CSV exports currently stop at endpoint ID/pin plus section/length/route mode, so per-side connection and seal reference metadata is not available in exported `fil a fil` documents.

# Scope
- In:
  - add four explicit columns to Modeling and Analysis wire CSV exports:
    - `Begin connection ref`
    - `Begin seal ref`
    - `End connection ref`
    - `End seal ref`
  - keep current `Begin ID`, `Begin pin`, `End ID`, `End pin`, and route-mode behavior;
  - export blank cells when a reference is absent;
  - preserve current UTF-8 BOM behavior for wire CSV exports.
- Out:
  - changes to on-screen wire table columns;
  - endpoint domain-model redesign;
  - BOM aggregation work.

# Acceptance criteria
- AC1: Modeling wire CSV export includes the four new termination-reference columns.
- AC2: Analysis wire CSV export includes the same four columns in the same schema order.
- AC3: Values are taken from `endpointA/BConnectionReference` and `endpointA/BSealReference`.
- AC4: Missing values export as blank cells.
- AC5: Existing wire CSV UTF-8 and CSV-safety behavior remains non-regressed.

# AC Traceability
- AC1/AC2/AC3/AC4 -> `src/app/components/workspace/ModelingSecondaryTables.tsx` and `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`.
- AC5 -> `src/tests/app.ui.list-ergonomics.spec.tsx` and `src/tests/csv.export.spec.ts`.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_106_bom_export_wire_termination_coverage_wire_csv_termination_columns_and_horizontal_label_offset_harmonization.md`.
- Orchestrated by `logics/tasks/task_085_req_106_export_analysis_navigation_and_render_readability_orchestration_and_delivery_control.md`.
- Supplied workbook evidence:
  - current header ends at `Route mode`, confirming the four termination-reference columns are absent today.
- Risks:
  - downstream tools depending on the old column count/order may require update;
  - partial rollout to one surface only would create schema drift.
- References:
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/csv.export.spec.ts`

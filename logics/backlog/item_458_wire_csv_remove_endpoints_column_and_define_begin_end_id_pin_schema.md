## item_458_wire_csv_remove_endpoints_column_and_define_begin_end_id_pin_schema - wire csv remove endpoints column and define begin end id pin schema
> From version: 0.9.18
> Status: Ready
> Understanding: 100%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Wire CSV currently exports dense `Endpoints` aggregate plus `Begin`/`End` text fields, which are ambiguous for filtering and downstream processing.

# Scope
- In:
  - remove `Endpoints` column from wire CSV exports.
  - define explicit endpoint columns: `Begin ID`, `Begin pin`, `End ID`, `End pin`.
  - enforce `pin` format convention:
    - connector cavity -> `C{index}`,
    - splice port -> `P{index}`.
  - keep other wire CSV fields unchanged unless needed for schema alignment.
- Out:
  - viewport table column redesign in UI.
  - endpoint domain model changes.

# Acceptance criteria
- AC1: `Endpoints` column is removed from wire CSV export headers/rows.
- AC2: Headers include `Begin ID`, `Begin pin`, `End ID`, `End pin`.
- AC3: Exported pin values follow `C{index}` / `P{index}` convention.
- AC4: Values are derived deterministically from endpoint A/B metadata.

# AC Traceability
- AC1/AC2/AC4 -> `src/app/components/workspace/ModelingSecondaryTables.tsx` and `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx` export row builders.
- AC3 -> `src/app/hooks/useWireEndpointDescriptions.ts` (or equivalent helper) and CSV row generation logic.

# Priority
- Impact: High (requested schema change).
- Urgency: High (paired with encoding fix for user-facing export quality).

# Notes
- Risks:
  - downstream tools depending on old `Endpoints` column may break.
  - inconsistent A/B formatting across surfaces can create schema drift.
- References:
  - `logics/request/req_091_wire_csv_export_encoding_hardening_and_endpoint_column_split_for_begin_end_id_pin.md`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/hooks/useWireEndpointDescriptions.ts`

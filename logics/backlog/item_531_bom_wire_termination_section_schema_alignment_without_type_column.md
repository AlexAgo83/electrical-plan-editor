## item_531_bom_wire_termination_section_schema_alignment_without_type_column - BOM wire-termination section schema alignment without Type column
> From version: 1.4.1
> Status: Draft
> Understanding: 100%
> Confidence: 97%
> Progress: 0%
> Complexity: Low-Medium
> Theme: BOM / CSV schema / UX contract
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Once wire-termination aggregation is merged by reference text only, the existing `Type` column becomes misleading and no longer matches the exported grouping model.

# Scope
- In:
  - remove the `Type` column from the BOM `Wire terminations` section;
  - align the section headers with the merged aggregation contract;
  - preserve the existing catalog-backed BOM section and pricing context rows unchanged.
- Out:
  - redesign of the broader BOM CSV layout;
  - additional metadata columns for provenance/source typing.

# Acceptance criteria
- AC1: The `Wire terminations` section exports headers aligned to merged aggregation, with `Reference` and `Quantity`.
- AC2: The `Type` column is no longer present in the `Wire terminations` section.
- AC3: The section remains appended after the existing BOM rows with deterministic placement.
- AC4: Existing catalog-backed rows and totals remain non-regressed.

# AC Traceability
- AC1/AC2/AC3/AC4 -> `src/app/lib/networkSummaryBomCsv.ts`.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_108_bom_wire_termination_reference_aggregation_by_reference_text_across_connection_and_seal.md`.
- Orchestrated by `logics/tasks/task_087_req_108_bom_wire_termination_reference_only_aggregation_orchestration_and_delivery_control.md`.
- References:
  - `src/app/lib/networkSummaryBomCsv.ts`
  - `src/tests/network-summary-bom-csv.spec.ts`
  - `src/tests/app.ui.network-summary-bom-export.spec.tsx`


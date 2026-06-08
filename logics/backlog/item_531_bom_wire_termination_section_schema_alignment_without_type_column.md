## item_531_bom_wire_termination_section_schema_alignment_without_type_column - BOM wire-termination section schema alignment without Type column
> From version: 1.4.1
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
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
- request-AC1 -> This backlog slice. Evidence needed: The BOM `Wire terminations` section counts occurrences from all four wire-side termination fields.
- request-AC2 -> This backlog slice. Evidence needed: Occurrences with identical normalized reference text are merged into a single exported row even when some came from `Connection` fields and others from `Seal` fields.
- request-AC3 -> This backlog slice. Evidence needed: The `Wire terminations` section exports one row per normalized reference text with a deterministic quantity.
- request-AC4 -> This backlog slice. Evidence needed: The `Type` column is removed from the `Wire terminations` section and replaced by a schema aligned with merged aggregation.
- request-AC5 -> This backlog slice. Evidence needed: Empty/whitespace-only termination references remain ignored.
- request-AC6 -> This backlog slice. Evidence needed: Existing catalog-backed BOM rows and pricing context rows remain non-regressed.
- request-AC7 -> This backlog slice. Evidence needed: Regression tests cover:
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

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

# Delivery
- The BOM `Wire terminations` section schema is now aligned with merged aggregation semantics.
- The obsolete `Type` column was removed.
- Section headers now export `Reference` and `Quantity`.

# Validation
- `npm test -- --run src/tests/network-summary-bom-csv.spec.ts src/tests/app.ui.network-summary-bom-export.spec.tsx`
- `npm run -s lint`
- `npm run -s typecheck`

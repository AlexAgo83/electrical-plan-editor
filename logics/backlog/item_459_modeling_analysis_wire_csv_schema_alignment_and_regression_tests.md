## item_459_modeling_analysis_wire_csv_schema_alignment_and_regression_tests - modeling analysis wire csv schema alignment and regression tests
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`req_091` requires identical wire CSV schema in Modeling and Analysis. Without explicit alignment/tests, one surface can diverge silently.

# Scope
- In:
  - align Modeling and Analysis wire CSV header order and row schema.
  - ensure route-mode optionality remains coherent where applicable.
  - add regression tests asserting shared schema and critical field semantics.
  - verify encoding and formula safety remain non-regressed in end-to-end CSV generation path.
- Out:
  - broader export refactors across non-wire domains.

# Acceptance criteria
- AC1: Modeling and Analysis wire CSV exports share the same endpoint column schema.
- AC2: Header order and row structure are consistent across both surfaces.
- AC3: Tests fail if one surface reintroduces `Endpoints` or mismatched Begin/End columns.
- AC4: Existing CSV safety rules remain covered.

# AC Traceability
- AC1/AC2 -> export builders in `src/app/components/workspace/ModelingSecondaryTables.tsx` and `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`.
- AC3/AC4 -> `src/tests/csv.export.spec.ts` plus targeted UI/export tests as needed.
- request-AC1 -> This backlog slice. Evidence needed: Accented characters in wire CSV export are preserved correctly (no `Ã©`-style corruption).
- request-AC2 -> This backlog slice. Evidence needed: `Endpoints` column is no longer present in wire CSV exports.
- request-AC3 -> This backlog slice. Evidence needed: Wire CSV exports include explicit `Begin ID`, `Begin pin`, `End ID`, `End pin` columns.
- request-AC4 -> This backlog slice. Evidence needed: Begin/end split values are populated deterministically from wire endpoint A/B metadata, with `pin` values using `C{index}` / `P{index}` convention.
- request-AC5 -> This backlog slice. Evidence needed: Modeling and Analysis wire CSV exports share the same endpoint column schema.
- request-AC6 -> This backlog slice. Evidence needed: Existing CSV formula-injection neutralization remains non-regressed.
- request-AC7 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and relevant tests pass after the change.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

# Priority
- Impact: High (schema consistency and maintainability).
- Urgency: Medium-High (after 457/458, before closure).

# Notes
- Risks:
  - duplicated export logic can drift again without explicit tests.
  - route-mode conditionals can accidentally produce asymmetric headers.
- References:
  - `logics/request/req_091_wire_csv_export_encoding_hardening_and_endpoint_column_split_for_begin_end_id_pin.md`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/tests/csv.export.spec.ts`

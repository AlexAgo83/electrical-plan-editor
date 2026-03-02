## item_459_modeling_analysis_wire_csv_schema_alignment_and_regression_tests - modeling analysis wire csv schema alignment and regression tests
> From version: 0.9.18
> Status: Ready
> Understanding: 100%
> Confidence: 95%
> Progress: 0%
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

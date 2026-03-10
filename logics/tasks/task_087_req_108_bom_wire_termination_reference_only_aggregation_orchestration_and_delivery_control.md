## task_087_req_108_bom_wire_termination_reference_only_aggregation_orchestration_and_delivery_control - Req 108 BOM wire-termination reference-only aggregation orchestration and delivery control
> From version: 1.4.1
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: General
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Request: `req_108_bom_wire_termination_reference_aggregation_by_reference_text_across_connection_and_seal`.
- Backlog anchors:
  - `item_530_bom_wire_termination_aggregation_key_change_from_type_plus_reference_to_reference_only`
  - `item_531_bom_wire_termination_section_schema_alignment_without_type_column`
  - `item_532_regression_coverage_for_mixed_connection_and_seal_reference_aggregation`
  - `item_533_req_108_validation_matrix_and_closure_traceability`

# Plan
- [x] 1. Replace BOM wire-termination aggregation key from `type + reference` to normalized `reference` only
- [x] 2. Align the `Wire terminations` section schema with the merged aggregation model and remove the obsolete `Type` column
- [x] 3. Update targeted regression coverage for mixed connection/seal same-text aggregation and section headers
- [x] 4. Generate a changelog entry in `changelogs/` using the project version current at task completion time
- [x] 5. Complete req_108 validation and traceability closure
- [x] FINAL: Update related Logics docs and synchronize statuses

# AC Traceability
- AC1 -> Orchestration is explicit. Proof: plan and linked backlog slices are documented.

# Request AC Proof Coverage
- AC1 Proof: item `530`.
- AC2 Proof: items `530` and `532`.
- AC3 Proof: items `530` and `531`.
- AC4 Proof: item `531`.
- AC5 Proof: item `530`.
- AC6 Proof: items `530` and `531`.
- AC7 Proof: item `532`.

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm test -- --run src/tests/network-summary-bom-csv.spec.ts src/tests/app.ui.network-summary-bom-export.spec.tsx`
- `npm run -s build`

# Definition of Done (DoD)
- [x] Scope implemented and acceptance criteria covered.
- [x] A changelog file is generated in `changelogs/` using the project version current when the task is finished.
- [x] Validation commands executed and results captured.
- [x] Linked request/backlog/task docs updated.
- [x] Status is `Done` and progress is `100%`.

# Notes
- This task is a contract-correction follow-up to req_106, not a brand-new export surface.
- The delivery must explicitly supersede the prior `Type + Reference` aggregation semantics to avoid ambiguous future maintenance.

# Report
- Delivered:
  - BOM wire-termination aggregation now merges connection and seal occurrences by normalized reference text;
  - the `Wire terminations` section now exports `Reference` and `Quantity`;
  - regression coverage was updated for mixed connection/seal same-text cases and the new export schema.
- Validation executed:
  - `npm test -- --run src/tests/network-summary-bom-csv.spec.ts src/tests/app.ui.network-summary-bom-export.spec.tsx`
  - `npm run -s lint`
  - `npm run -s typecheck`

## item_460_req_091_wire_csv_export_validation_matrix_and_closure_traceability - req 091 wire csv export validation matrix and closure traceability
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`req_091` combines bug fix (encoding) and schema changes (columns). Closure needs strict proof to avoid regressions in exported contracts.

# Scope
- In:
  - run closure validation matrix for req_091 AC1-AC7.
  - gather AC evidence from items 457-459.
  - synchronize status/progress in request/backlog/task artifacts.
  - document downstream compatibility notes if header contract changes are breaking.
- Out:
  - implementation outside req_091 scope.

# Acceptance criteria
- AC1: Required gates pass (`lint`, `typecheck`, `test:ci`, `logics_lint`).
- AC2: Evidence confirms accent compatibility fix and no mojibake reproduction.
- AC3: Evidence confirms `Endpoints` removal and Begin/End ID+pin schema in both surfaces.
- AC4: Documentation/status updates are complete and traceable.

# AC Traceability
- AC1 -> validation command evidence.
- AC2 -> item_457 test/implementation evidence.
- AC3 -> item_458/item_459 schema and test evidence.
- AC4 -> request/backlog/task indicator updates.
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
- Impact: High (release quality and user-facing export correctness).
- Urgency: Medium (closure step after implementation items).

# Notes
- Risks:
  - incomplete cross-surface evidence can hide schema drift.
  - documentation of breaking header changes may be omitted.
- References:
  - `logics/request/req_091_wire_csv_export_encoding_hardening_and_endpoint_column_split_for_begin_end_id_pin.md`
  - `logics/backlog/item_457_wire_csv_export_utf8_accent_compatibility_hardening_and_download_contract.md`
  - `logics/backlog/item_458_wire_csv_remove_endpoints_column_and_define_begin_end_id_pin_schema.md`
  - `logics/backlog/item_459_modeling_analysis_wire_csv_schema_alignment_and_regression_tests.md`

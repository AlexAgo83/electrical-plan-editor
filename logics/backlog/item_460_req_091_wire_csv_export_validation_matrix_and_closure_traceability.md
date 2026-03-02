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

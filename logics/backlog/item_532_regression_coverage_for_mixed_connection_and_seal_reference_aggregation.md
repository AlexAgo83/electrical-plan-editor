## item_532_regression_coverage_for_mixed_connection_and_seal_reference_aggregation - Regression coverage for mixed connection and seal reference aggregation
> From version: 1.4.1
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Tests / BOM / Regression coverage
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
The previous regression suite validates separation by `Type + Reference`. Without targeted updates, the new merged-by-reference contract could regress silently or remain ambiguously specified in tests.

# Scope
- In:
  - update unit coverage for BOM export aggregation semantics;
  - update UI/export-facing coverage for the `Wire terminations` section schema;
  - cover mixed `Connection` + `Seal` same-text scenarios explicitly;
  - cover empty-value ignoring behavior and deterministic ordering.
- Out:
  - unrelated export/regression suites;
  - end-to-end tests beyond the BOM export surface unless required by existing coverage patterns.

# Acceptance criteria
- AC1: Unit tests cover connection-only repeated references.
- AC2: Unit tests cover seal-only repeated references.
- AC3: Unit tests cover mixed connection/seal same-text references collapsing into one row.
- AC4: Tests cover empty/whitespace-only values being ignored.
- AC5: Export-facing tests reflect the removal of the `Type` column and the new section headers.

# AC Traceability
- AC1/AC2/AC3/AC4/AC5 -> `src/tests/network-summary-bom-csv.spec.ts` and `src/tests/app.ui.network-summary-bom-export.spec.tsx`.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_108_bom_wire_termination_reference_aggregation_by_reference_text_across_connection_and_seal.md`.
- Orchestrated by `logics/tasks/task_087_req_108_bom_wire_termination_reference_only_aggregation_orchestration_and_delivery_control.md`.
- References:
  - `src/tests/network-summary-bom-csv.spec.ts`
  - `src/tests/app.ui.network-summary-bom-export.spec.tsx`

# Delivery
- Regression coverage now asserts one-row-per-reference BOM semantics.
- Mixed connection/seal same-text occurrences are covered explicitly.
- Export-facing tests now assert the `Reference,Quantity` section schema.

# Validation
- `npm test -- --run src/tests/network-summary-bom-csv.spec.ts src/tests/app.ui.network-summary-bom-export.spec.tsx`
- `npm run -s lint`
- `npm run -s typecheck`

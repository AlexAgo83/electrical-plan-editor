## item_248_wire_endpoint_connection_seal_reference_regression_tests - Wire Endpoint Connection/Seal Reference Regression Tests
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Regression Coverage for Per-Side Wire Endpoint Reference Form/Store/Compatibility Behavior
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Per-side wire endpoint references touch wire contract persistence, form normalization, endpoint-type UX behavior, and legacy compatibility. Without regression tests, trim/clear behavior and non-destructive endpoint-type changes may regress silently.

# Scope
- In:
  - Add store/reducer tests for persistence of all four per-side fields.
  - Add tests for normalization behavior:
    - trim applied
    - empty -> `undefined`
    - max length guard behavior (`120`) if enforced in form/reducer
  - Add UI tests for wire create/edit/clear flow of per-side references.
  - Add UI tests confirming values are preserved when endpoint type changes.
  - Add persistence/import compatibility tests for legacy data missing new fields.
- Out:
  - Full E2E/BOM/export coverage.
  - Broad table/inspector/search display tests unless explicitly added in implementation scope.

# Acceptance criteria
- Regression tests cover create/edit/clear persistence and normalization of per-side connection/seal references.
- Tests cover endpoint-type change preservation behavior.
- Legacy compatibility tests cover missing-field persistence/import payloads.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_041`, item_245, item_246, item_247.
- Blocks: item_249.
- Related AC: AC2, AC3, AC3a, AC5, AC6, AC7.
- References:
  - `logics/request/req_041_wire_endpoint_connection_reference_and_seal_reference_per_side.md`
  - `src/tests/store.reducer.entities.spec.ts`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/portability.network-file.spec.ts`


## item_368_regression_coverage_for_wire_fuse_mode_required_reference_and_legacy_compatibility - Regression coverage for wire fuse mode, required catalog association validation, and legacy compatibility
> From version: 0.9.8
> Understanding: 95%
> Confidence: 91%
> Progress: 100%
> Complexity: Medium
> Theme: Regression safety for wire fuse-mode workflows and compatibility
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Wire fuse-mode support spans entity validation, form UX, and persistence compatibility; without focused regression coverage, future wire changes can silently break the new semantics.

# Scope
- In:
  - Add regression tests for fuse-mode UI controls and conditional catalog-selection behavior.
  - Add validation tests for required fuse catalog association rejection.
  - Add save/cancel behavior tests for fuse draft edits.
  - Add regression test(s) for catalog-item deletion guard when referenced by fuse-mode wires.
  - Add compatibility tests for legacy wires without protection metadata.
  - Add non-regression assertions for normal wire creation/edit validation paths.
- Out:
  - New end-to-end test infrastructure changes
  - Full BOM pricing integration tests for fuse wires (out of V1 scope)

# Acceptance criteria
- Automated tests cover fuse-mode required catalog-association validation and wire form save/cancel semantics.
- Automated tests cover the catalog deletion guard for fuse-referenced catalog items.
- Legacy payload compatibility is covered by tests.
- Normal wire flows remain covered/non-regressed in the targeted test suite.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_067`, `item_365`, `item_366`, `item_367`.
- Blocks: `task_065`.
- Related AC: AC2, AC3, AC4, AC5, AC6.
- References:
  - `logics/request/req_067_wire_protection_metadata_v1_fuse_kind_with_required_reference.md`
  - `src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
  - `src/tests/store.reducer.wires.spec.ts`
  - `src/tests/store.reducer.catalog.spec.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/portability.network-file.spec.ts`

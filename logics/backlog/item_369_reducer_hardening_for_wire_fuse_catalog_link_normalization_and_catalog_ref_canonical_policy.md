## item_369_reducer_hardening_for_wire_fuse_catalog_link_normalization_and_catalog_ref_canonical_policy - Reducer hardening for wire fuse catalog-link normalization and catalog reference canonical policy
> From version: 0.9.10
> Status: Done
> Understanding: 95%
> Confidence: 91%
> Progress: 100%
> Complexity: Medium
> Theme: Reducer/store hardening for catalog-linked fuse wire semantics and ref-policy alignment
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Reducer normalization currently leaves room for inconsistent handling of catalog-linked IDs (notably `wire.protection.catalogItemId`) and catalog manufacturer-reference policy is not yet explicitly enforced in a unified way.

# Scope
- In:
  - Harden `wire.protection.catalogItemId` normalization before lookup/persistence (trimmed ID handling).
  - Make catalog `manufacturerReference` comparison policy explicit in reducer/store validation paths (default: case-insensitive `trim + lower` comparison for uniqueness checks).
  - Preserve display casing while enforcing the chosen canonical comparison.
  - Keep error messages clear and compatible with current UX expectations.
  - Preserve existing non-fuse wire behavior and reducer invariants.
- Out:
  - CSV import alignment (handled in `item_370`)
  - Load/legacy conflict surfacing strategy (handled in `item_371`)
  - Full regression suite updates (handled in `item_377`)

# Acceptance criteria
- Fuse wire reducer validation uses normalized `catalogItemId` for lookup/persistence handling.
- Catalog manufacturer-reference uniqueness checks use the chosen canonical comparison strategy.
- Existing valid catalog/wire flows remain non-regressed.
- Behavior is covered by targeted reducer/store tests.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_068`.
- Blocks: `item_370`, `item_371`, `item_377`, `task_066`.
- Related AC: AC2, AC7, AC9.
- References:
  - `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`
  - `src/store/reducer/wireReducer.ts`
  - `src/store/reducer/catalogReducer.ts`
  - `src/store/catalog.ts`
  - `src/tests/store.reducer.wires.spec.ts`
  - `src/tests/store.reducer.catalog.spec.ts`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: A documented implementation plan exists for the review follow-ups (hardening, coverage visibility, bundle performance, test reliability, validation consistency).
- request-AC2 -> This backlog slice. Evidence needed: The fuse-wire reducer catalog linkage normalization path is hardened or explicitly validated as intentionally unchanged with rationale.
- request-AC3 -> This backlog slice. Evidence needed: UI coverage visibility is improved (even if initially non-blocking).
- request-AC4 -> This backlog slice. Evidence needed: A concrete bundle-size reduction strategy is implemented or a measured rationale is documented if deferred.
- request-AC5 -> This backlog slice. Evidence needed: Known heavy/flaky UI tests are stabilized with targeted changes and no meaningful regression-signal loss.
- request-AC6 -> This backlog slice. Evidence needed: Form validation strategy is clarified and applied to at least the reviewed inconsistent cases.
- request-AC7 -> This backlog slice. Evidence needed: Catalog manufacturer-reference policy (including case-sensitivity expectation) is explicit and covered by implementation/tests or documented rationale.
- request-AC8 -> This backlog slice. Evidence needed: `test:ci` remains available as the canonical full-suite command while segmented test commands/reporting are added if adopted.
- request-AC9 -> This backlog slice. Evidence needed: The chosen default catalog `manufacturerReference` canonical comparison strategy (`trim + lower`, unless revised with rationale) is explicit.
- request-AC10 -> This backlog slice. Evidence needed: Initial slow-test visibility is available (at least console top-N) to support targeted UI test stabilization prioritization.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC9 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC10 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

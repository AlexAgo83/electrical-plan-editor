## item_377_regression_coverage_for_req_068_quality_followups_hardening_ci_perf_and_validation_consistency - Regression coverage for req_068 quality follow-ups (hardening, CI signal, perf, validation consistency)
> From version: 0.9.10
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium-High
> Theme: Regression safety for cross-cutting quality improvements
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_068` spans reducers, import/load behavior, test tooling, and build/perf-related changes. Without deliberate regression coverage updates, quality improvements can accidentally weaken runtime stability or CI reliability.

# Scope
- In:
  - Add/adjust tests for reducer hardening and catalog reference policy changes (including case-insensitive behavior).
  - Add coverage for CSV import conflict policy alignment and load/legacy conflict surfacing behavior.
  - Add/adjust checks for new CI tooling commands/reporting where testable.
  - Add/adjust regression coverage for bundle/code-splitting changes and validation-consistency updates as relevant.
  - Ensure existing key UI regression suites remain green after changes.
- Out:
  - Rewriting the test framework
  - Creating exhaustive performance benchmarks for every screen interaction

# Acceptance criteria
- Regression coverage is updated for changed hardening/policy behaviors.
- CI/tooling changes are validated (script presence/behavior and/or smoke checks as appropriate).
- Perf and validation consistency follow-ups land without reducing meaningful regression coverage.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_068`, `item_369`, `item_370`, `item_371`, `item_372`, `item_373`, `item_374`, `item_375`, `item_376`.
- Blocks: `task_066`.
- Related AC: AC2, AC3, AC4, AC5, AC6, AC7, AC8, AC10.
- References:
  - `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`
  - `src/tests/store.reducer.catalog.spec.ts`
  - `src/tests/store.reducer.wires.spec.ts`
  - `src/tests/catalog.csv-import-export.spec.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/sample-network.compat.spec.ts`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.lazy-loading-regression.spec.tsx`

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

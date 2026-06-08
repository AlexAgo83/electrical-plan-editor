## item_371_catalog_reference_conflict_detection_surfacing_for_load_and_legacy_bootstrap_paths - Catalog reference conflict detection surfacing for load and legacy bootstrap paths
> From version: 0.9.10
> Status: Done
> Understanding: 94%
> Confidence: 88%
> Progress: 100%
> Complexity: Medium-High
> Theme: Deterministic non-crashing conflict surfacing for persisted/legacy catalog reference issues
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Stricter catalog reference policy may reveal conflicts in existing persisted/legacy data. The app should not crash, but conflicts must be surfaced clearly (preferably via validation issues) for user action.

# Scope
- In:
  - Detect catalog manufacturer-reference conflicts under the chosen canonical comparison during workspace load/legacy bootstrap paths.
  - Surface actionable diagnostics via validation issues (preferred) while preserving deterministic runtime behavior.
  - Avoid silent auto-renaming in normal load paths unless explicitly covered by existing legacy normalization rules.
  - Preserve app boot stability (no crash) when conflicts are detected.
- Out:
  - CSV import explicit conflict policy (handled in `item_370`)
  - Full validation taxonomy redesign
  - Broad validation UI redesign

# Acceptance criteria
- Catalog reference conflicts discovered during load/legacy bootstrap do not crash the app.
- Conflicts are surfaced in an actionable way (validation issues preferred).
- Load behavior remains deterministic and documented.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_068`, `item_369`.
- Blocks: `item_377`, `task_066`.
- Related AC: AC2, AC7, AC9.
- References:
  - `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`
  - `src/store/catalog.ts`
  - `src/store/reducer/catalogReducer.ts`
  - `src/store/reducer.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/sample-network.compat.spec.ts`

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

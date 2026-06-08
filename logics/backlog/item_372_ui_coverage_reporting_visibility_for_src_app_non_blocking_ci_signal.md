## item_372_ui_coverage_reporting_visibility_for_src_app_non_blocking_ci_signal - UI coverage reporting visibility for `src/app/**` as non-blocking CI signal
> From version: 0.9.10
> Status: Done
> Understanding: 95%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Quality signal observability for UI layer coverage
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Current coverage reporting emphasizes `core/store` and omits `src/app/**`, which can mislead quality discussions for a UI-heavy project.

# Scope
- In:
  - Add a dedicated non-blocking UI coverage reporting path (example: `coverage:ui:report`) covering `src/app/**`.
  - Keep `test:ci` unchanged as the canonical aggregate command.
  - Make output labeling clear (domain/store vs UI coverage).
  - Enable CI-visible informational reporting when feasible.
- Out:
  - Immediate hard thresholds for UI coverage
  - Replacing the existing `test:ci` command
  - Broad test refactors unrelated to coverage visibility

# Acceptance criteria
- A UI coverage report path exists and is documented.
- `test:ci` remains available and unchanged in role.
- UI coverage signal is visible and clearly labeled as informational/non-blocking (initially).

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_068`.
- Blocks: `task_066`.
- Related AC: AC3, AC3a, AC3b, AC8.
- References:
  - `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`
  - `vite.config.ts`
  - `package.json`

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

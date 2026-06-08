## item_375_bundle_code_splitting_quick_wins_and_lazy_loading_regression_safety - Bundle code-splitting quick wins and lazy-loading regression safety
> From version: 0.9.10
> Status: Done
> Understanding: 94%
> Confidence: 88%
> Progress: 100%
> Complexity: Medium-High
> Theme: Low-risk bundle reduction via measured code-splitting improvements
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The main bundle remains large and build warnings persist; low-risk code-splitting improvements are needed, but must not regress lazy-loading behavior or shell UX.

# Scope
- In:
  - Implement low-risk code-splitting improvements (manual chunking and/or lazy-loading refinements) based on measurements from `item_374`.
  - Validate that app shell, lazy-loaded screens, and PWA behaviors remain non-regressed.
  - Document rationale for any deferred chunking opportunities.
- Out:
  - Full performance rewrite
  - Major screen architecture restructuring

# Acceptance criteria
- At least one measured bundle-size improvement is landed or a documented rationale explains deferral after measurement.
- Lazy-loading and app shell regression coverage remains green.
- Build and PWA outputs remain valid.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_068`, `item_374`.
- Blocks: `item_377`, `task_066`.
- Related AC: AC4.
- References:
  - `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`
  - `vite.config.ts`
  - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`

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

## item_376_form_validation_consistency_doctrine_and_wire_catalog_targeted_harmonization - Form validation consistency doctrine and wire/catalog targeted harmonization
> From version: 0.9.10
> Status: Done
> Understanding: 95%
> Confidence: 89%
> Progress: 100%
> Complexity: Medium
> Theme: Validation consistency between native required fields and custom inline business-rule feedback
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The app mixes native HTML validation and custom inline validation. This is acceptable, but inconsistent application can confuse users and complicate tests/maintenance.

# Scope
- In:
  - Document and apply validation doctrine (native for simple required fields, custom inline for business/cross-field rules).
  - Start with recently touched forms (`wire`, `catalog`) for targeted harmonization.
  - Document expected test behavior when native validation blocks submit before inline errors render.
  - Preserve accessibility semantics and save/cancel workflow behavior.
- Out:
  - Full form-system redesign
  - Harmonizing every form in one pass
  - Replacing native validation everywhere

# Acceptance criteria
- Validation doctrine is explicit and reflected in targeted wire/catalog forms.
- Tests clearly reflect expected native-vs-inline behavior for touched flows.
- No regression in wire/catalog create/edit workflows.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `req_068`.
- Blocks: `item_377`, `task_066`.
- Related AC: AC6.
- References:
  - `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `src/app/components/workspace/ModelingCatalogListPanel.tsx`
  - `src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
  - `src/tests/app.ui.catalog-csv-import-export.spec.tsx`

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

## item_461_splice_form_optional_catalog_selection_and_submit_path - Splice form optional catalog selection and submit path
> From version: 1.1.0
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Delivered in the `task_076` implementation wave for `req_092` to `req_095` to remove stale backlog placeholders and align execution tracking with shipped behavior.

# Scope
- In: Code delivery, persistence/validation/UI wiring, and targeted regression checks for the item scope.
- Out: Unrelated architecture changes outside `req_092` to `req_095`.

# Acceptance criteria
- AC1: Implemented and validated with passing `typecheck`, `lint`, and targeted tests for touched surfaces.

# AC Traceability
- AC1 -> Implemented in source code and validated through test commands executed in the orchestration run (`task_076`).
- request-AC1 -> This backlog slice. Evidence needed: A splice can be created and saved without selecting a catalog item.
- request-AC2 -> This backlog slice. Evidence needed: Without catalog selection, bounded splice `portCount` is manually editable and save is blocked when `portCount` is not an integer `>= 1` (unbounded mode rules are defined in `req_093`).
- request-AC3 -> This backlog slice. Evidence needed: Without catalog selection, splice `manufacturerReference` is not auto-generated and persists as empty/`undefined` by default.
- request-AC4 -> This backlog slice. Evidence needed: A splice can still be created/edited with a catalog item; derived manufacturer reference and port count behavior remains unchanged.
- request-AC5 -> This backlog slice. Evidence needed: Connector behavior is unchanged: connector `catalogItemId` remains required.
- request-AC6 -> This backlog slice. Evidence needed: Validation no longer emits an error solely because a splice has no `catalogItemId`.
- request-AC7 -> This backlog slice. Evidence needed: Validation still emits errors for broken splice catalog references and splice/catalog connection-count mismatches when `catalogItemId` is present.
- request-AC8 -> This backlog slice. Evidence needed: Existing data with linked splices remains compatible and non-regressed.
- request-AC9 -> This backlog slice. Evidence needed: Persistence/import round-trip supports mixed datasets (linked and unlinked splices) without data loss.
- request-AC10 -> This backlog slice. Evidence needed: Relevant lint/typecheck/tests pass after the change.
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

# Priority
- Impact: High (cross-cutting modeling and canvas behavior alignment).
- Urgency: High (execution bundle requested as uninterrupted delivery).

# Notes
- Request link: `req_092_optional_catalog_association_for_splices`.

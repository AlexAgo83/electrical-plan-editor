## item_478_hover_descriptions_for_buttons_selects_and_options - Hover descriptions for buttons, selects, and options
> From version: 1.2.1
> Status: Done
> Understanding: 100%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Accessibility / UI clarity
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Hover descriptions are inconsistent across interactive controls, especially for compact and icon-heavy actions.
This reduces discoverability for mouse users and creates non-deterministic UX between screens.

# Scope
- In:
  - enforce non-empty hover descriptions (`title`) on all rendered `button`, `select`, and `option` controls;
  - include disabled controls in the same coverage contract;
  - keep explicit authored `title` values unchanged;
  - define deterministic fallback resolution for generated descriptions;
  - add/adjust regression tests for representative controls and dynamic surfaces.
- Out:
  - custom tooltip system implementation;
  - copy redesign outside description fallback needs;
  - control types outside `button`/`select`/`option`.

# Acceptance criteria
- AC1: Every rendered `button` has a non-empty hover description (`title`) including disabled buttons.
- AC2: Every rendered `select` has a non-empty hover description (`title`) including disabled selects.
- AC3: Every rendered `option` has a non-empty hover description (`title`) including disabled options.
- AC4: Explicitly authored `title` values are preserved and never overridden.
- AC5: Coverage remains valid after dynamic UI transitions (drawers/dialogs/screen switches).

# AC Traceability
- AC1 -> Global control coverage for buttons.
- AC2 -> Global control coverage for selects.
- AC3 -> Global control coverage for options.
- AC4 -> Author-specified title precedence contract.
- AC5 -> Dynamic rendering regression safety.
- request-AC1 -> This backlog slice. Evidence needed: Every rendered `button` in the app (enabled or disabled) has a non-empty hover description via explicit or computed `title`.
- request-AC2 -> This backlog slice. Evidence needed: Every rendered `select` in the app (enabled or disabled) has a non-empty hover description via explicit or computed `title`.
- request-AC3 -> This backlog slice. Evidence needed: Every rendered `option` in the app (enabled or disabled) has a non-empty hover description via explicit or computed `title`.
- request-AC4 -> This backlog slice. Evidence needed: Explicitly authored `title` values are never overridden by fallback generation.
- request-AC5 -> This backlog slice. Evidence needed: Hover-description coverage holds after dynamic UI transitions (screen switch, modal open/close, drawer open/close, conditional section rendering).
- request-AC6 -> This backlog slice. Evidence needed: Existing a11y/interaction semantics are non-regressed.
- request-AC7 -> This backlog slice. Evidence needed: `logics_lint`, `lint`, `typecheck`, and relevant tests pass.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

# Priority
- Impact: High (cross-app UX consistency and usability clarity).
- Urgency: High (explicit user-requested behavior contract).

# Notes
- Derived from `logics/request/req_097_hover_descriptions_for_buttons_selects_and_options.md`.
- Orchestrated by `logics/tasks/task_077_super_orchestration_delivery_execution_for_req_097_and_req_098_with_validation_gates.md`.

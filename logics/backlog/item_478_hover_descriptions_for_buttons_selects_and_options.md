## item_478_hover_descriptions_for_buttons_selects_and_options - Hover descriptions for buttons, selects, and options
> From version: 1.2.1
> Status: Ready
> Understanding: 100%
> Confidence: 96%
> Progress: 0%
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

# Priority
- Impact: High (cross-app UX consistency and usability clarity).
- Urgency: High (explicit user-requested behavior contract).

# Notes
- Derived from `logics/request/req_097_hover_descriptions_for_buttons_selects_and_options.md`.
- Orchestrated by `logics/tasks/task_077_super_orchestration_delivery_execution_for_req_097_and_req_098_with_validation_gates.md`.

## item_264_edit_forms_save_restores_focus_to_edited_table_row_ergonomics - Edit Forms: Save Restores Focus to Edited Table Row Ergonomics
> From version: 0.8.1
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Return focus to edited row after Save in table-backed forms
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_043` groups multiple follow-up improvements after the successful baseline delivery of `req_035` through `req_042`. This backlog item tracks one execution slice of that follow-up bundle and records the delivery outcome for traceability.

# Scope
- In:
  - The work slice described by this item within `req_043` / `task_044`.
  - Implementation, targeted validation, and checkpoint commit recording for the associated wave.
  - Documentation traceability updates referencing the final outcome.
- Out:
  - Unrelated baseline rework from `req_035` through `req_042`.
  - Broader redesigns outside `req_043` follow-up scope.

# Acceptance criteria
- The scoped follow-up change is implemented (or explicitly deferred with rationale in task/request closure notes).
- Targeted validation for the touched scope is executed and recorded in `task_044`.
- The outcome is traceable to a checkpoint commit and/or final closure documentation.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Delivery outcome
- Status: Delivered.
- Planned wave: Wave 2.
- Delivered in `2c2d34c` (connectors/splices/nodes/segments/wires row focus restore on edit->create transition) plus regression tests.
- See `logics/tasks/task_044_req_043_follow_up_phase_2_rollout_onboarding_polish_metadata_surfacing_test_hardening_and_doc_sync_orchestration.md` for validation snapshots and final gate traceability.

# Notes
- Dependencies: `req_043`, `task_044`.
- Related AC: `req_043` ACs (see request for exact mapping).
- References:
  - `logics/request/req_043_post_req_035_to_req_042_phase_2_rollout_optional_metadata_surfacing_test_hardening_and_delivery_closure.md`
  - `logics/tasks/task_044_req_043_follow_up_phase_2_rollout_onboarding_polish_metadata_surfacing_test_hardening_and_doc_sync_orchestration.md`

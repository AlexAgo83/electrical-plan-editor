## item_444_req_087_validation_matrix_and_closure_traceability - req 087 validation matrix and closure traceability
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`req_087` spans settings placement, runtime rendering logic, and persistence/apply-default semantics. Closure needs explicit AC-to-evidence mapping to avoid partial completion.

# Scope
- In:
  - define validation matrix for AC1-AC8 of req_087.
  - collect implementation + test evidence from items 441-443.
  - update request/backlog/task indicators at completion.
  - document any residual risk and follow-up requirement.
- Out:
  - implementation work outside req_087.

# Acceptance criteria
- AC1: Required quality gates run and pass (`lint`, `typecheck`, `test:ci`, `logics_lint`).
- AC2: AC traceability explicitly maps each req AC to code paths and tests.
- AC3: Status/progress indicators are synchronized in logics docs at closure.
- AC4: Residual risk statement is included if any AC has conditional evidence.

# AC Traceability
- AC1 -> command logs and CI/local evidence references.
- AC2 -> item_441/item_442/item_443 output links.
- AC3 -> `logics/request/req_087_*.md` + this backlog chain indicators.
- AC4 -> closure report notes section.
- request-AC1 -> This backlog slice. Evidence needed: `Canvas tools preferences` includes a new segment-name visibility option above `Show segment lengths by default`.
- request-AC2 -> This backlog slice. Evidence needed: The new segment-name preference default is `enabled` when no prior stored value exists.
- request-AC3 -> This backlog slice. Evidence needed: Disabling segment names hides segment name/ID labels in the 2D `Network summary`.
- request-AC4 -> This backlog slice. Evidence needed: Disabling segment names does not disable or alter segment-length visibility behavior.
- request-AC5 -> This backlog slice. Evidence needed: Enabling segment lengths while segment names are disabled renders lengths without rendering names.
- request-AC6 -> This backlog slice. Evidence needed: The new segment-name preference is persisted and restored across reload/relaunch.
- request-AC7 -> This backlog slice. Evidence needed: `Apply canvas defaults now` applies the segment-name default consistently with other canvas defaults.
- request-AC8 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and relevant UI tests pass after the change.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

# Priority
- Impact: High (delivery governance).
- Urgency: Medium (finalization step).

# Notes
- Risks:
  - missing mapping can hide regressions in name/length independence matrix.
  - documentation drift can block closure readiness.
- References:
  - `logics/request/req_087_canvas_tools_option_to_hide_segment_names_independently_from_segment_lengths.md`
  - `logics/backlog/item_441_canvas_tools_segment_name_visibility_preference_and_settings_placement.md`
  - `logics/backlog/item_442_network_summary_segment_name_render_gating_independent_from_length_labels.md`
  - `logics/backlog/item_443_segment_name_visibility_persistence_apply_defaults_and_regression_coverage.md`

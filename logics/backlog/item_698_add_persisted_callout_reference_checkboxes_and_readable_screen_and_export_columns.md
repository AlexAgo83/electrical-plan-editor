## item_698_add_persisted_callout_reference_checkboxes_and_readable_screen_and_export_columns - Add persisted callout reference checkboxes and readable screen and export columns
> From version: 1.20.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Callout display preferences
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-22 20:30:10

# AI Context
- Summary: Consume the endpoint model through four persisted global booleans and measured optional columns shared with exports; invalidate layout for flags, values and locale.
- Keywords: UI preferences, Settings search, calloutLayout, wrapping, SVG, PNG, PDF
- Use when: Implementing display controls after the endpoint-model slice or validating live screen/export parity.
- Skip when: Adding per-wire overrides, new wire fields or changing rendering content modes.

# Problem
- Users cannot choose endpoint material visibility and the current measured/cached table layout does not account for additional reference columns.

# Scope
- In:
  - Add four default-false global UI preferences and propagate them through storage, hooks/controller slices, Settings and rendering/export contracts. Localize and index labels and side explanations for Settings search.
  - Consume the endpoint model slice; add dynamic clearly labeled columns near their corresponding endpoint fields. Wrap long codes with measured row height, include flags/values/locale in cache keys and expand export bounds without overlap or clipped text.
  - Exercise all-off, local-only, opposite-only, both and independent connection/seal combinations. Cover live updates, reload, switches, malformed legacy preferences, historical display, drawing modes, selected filtering and SVG/PNG/PDF consumers.
  - Record per-AC evidence, update callout guidance and run relevant quality gates for this slice and the full request.
- Out:
  - Per-network business persistence or per-row overrides, altering callout visibility/content modes, changing wire routing or adding a new PDF flow.

# Acceptance criteria
- AC1: Localized searchable checkboxes and persistent immediate read-only updates satisfy request AC1-AC2.
- AC2: Table measurement/cache behavior and export parity satisfy request AC5-AC6 with long-reference and locale regressions.
- AC3: Evidence and documentation cover the callout portions of request AC9 and trace model evidence from the prerequisite slice.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Localized searchable checkboxes and persistent immediate read-only updates satisfy request AC1-AC2.
- request-AC2 -> This backlog slice. Proof: AC2: Table measurement/cache behavior and export parity satisfy request AC5-AC6 with long-reference and locale regressions.
- request-AC5 -> This backlog slice. Proof: AC3: Evidence and documentation cover the callout portions of request AC9 and trace model evidence from the prerequisite slice.
- request-AC6 -> This backlog slice. Proof: AC3: Evidence and documentation cover the callout portions of request AC9 and trace model evidence from the prerequisite slice.
- request-AC9 -> This backlog slice. Proof: AC3: Evidence and documentation cover the callout portions of request AC9 and trace model evidence from the prerequisite slice.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_023_configurable_endpoint_material_references_on_plans_and_direct_workspace_folder_access`
- Architecture decision(s): (none yet)
- Request: `req_172_show_local_and_opposite_endpoint_connection_and_seal_references_in_plan_callouts_and_expose_open_folder_beside_workspace_actions`
- Primary task(s): `task_169_deliver_configurable_callout_endpoint_references_and_current_workspace_open_folder_access`

# Priority
- Priority: Medium
- Rationale: Requested additive usability improvement; no blocking defect reported. Deliver the endpoint-model prerequisite before its display consumer.

# Tasks
- `task_169_deliver_configurable_callout_endpoint_references_and_current_workspace_open_folder_access`

# Notes
- Task `task_169_deliver_configurable_callout_endpoint_references_and_current_workspace_open_folder_access` was finished via `logics-manager flow finish task` on 2026-10-22.

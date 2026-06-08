## item_424_req_082_validation_matrix_and_closure_traceability - Req 082 validation matrix and closure traceability
> From version: 0.9.18
> Status: Done
> Understanding: 96%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: Closure governance for import/export panel compaction
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`req_082` is a layout-focused change with responsive constraints; closure requires explicit AC coverage and parity proof.

# Scope
- In:
  - build AC matrix for req_082 with UI/test evidence;
  - capture validation results for settings/import-export suites;
  - synchronize request/backlog/task status fields.
- Out:
  - new portability feature work.

# Acceptance criteria
- AC1: Req_082 AC traceability is complete and auditable.
- AC2: Validation evidence includes required commands and targeted tests.
- AC3: Linked docs are status-aligned at closure.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `item_421`, `item_422`, `item_423`.
- Blocks: `task_073` completion.
- Related AC: `AC1`, `AC2`, `AC3`, `AC4`, `AC5`, `AC6`.
- References:
  - `logics/request/req_082_import_export_networks_panel_two_column_compaction_and_right_side_selected_export_list.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/tests/app.ui.import-export.spec.tsx`
  - `src/tests/app.ui.settings.spec.tsx`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: `Import / Export networks` renders in two columns on desktop/tablet breakpoints.
- request-AC2 -> This backlog slice. Evidence needed: `Selected networks for export` is displayed in the right column.
- request-AC3 -> This backlog slice. Evidence needed: `Import from file` is positioned below the export actions (`Export active`, `Export selected`, `Export all`) in the left column.
- request-AC4 -> This backlog slice. Evidence needed: No regression in import/export actions, selected network export behavior, and import summary/status rendering.
- request-AC5 -> This backlog slice. Evidence needed: On mobile/narrow widths, layout collapses to a readable single-column flow without clipping/overflow.
- request-AC6 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and relevant UI tests pass after the layout change.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

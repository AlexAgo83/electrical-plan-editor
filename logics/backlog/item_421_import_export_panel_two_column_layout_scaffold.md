## item_421_import_export_panel_two_column_layout_scaffold - Import/Export panel two-column layout scaffold
> From version: 0.9.18
> Status: Done
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Low
> Theme: Settings panel layout compaction
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
The current Import/Export panel layout is vertically stretched and lacks a two-column scaffold on readable widths.

# Scope
- In:
  - introduce two-column structure for panel body on desktop/tablet;
  - place selected-networks fieldset in right column;
  - ensure responsive collapse to one column when width is insufficient.
- Out:
  - import/export behavior changes;
  - unrelated settings panel redesign.

# Acceptance criteria
- AC1: Two-column layout is active when readable width allows.
- AC2: Right column hosts `Selected networks for export`.
- AC3: Mobile/narrow fallback collapses cleanly to one column.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `req_082`.
- Blocks: `item_422`, `item_424`, `task_073`.
- Related AC: `AC1`, `AC2`, `AC5`, `AC6`.
- References:
  - `logics/request/req_082_import_export_networks_panel_two_column_compaction_and_right_side_selected_export_list.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/styles/validation-settings/validation-and-settings-layout.css`

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

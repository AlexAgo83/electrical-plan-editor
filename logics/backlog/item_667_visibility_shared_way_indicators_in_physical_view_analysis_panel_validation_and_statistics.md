## item_667_visibility_shared_way_indicators_in_physical_view_analysis_panel_validation_and_statistics - Visibility: shared-way indicators in physical view, analysis panel, validation and statistics
> From version: 1.18.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: wiring-modeling
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Occupancy display assumes one occupant per way: last-wins Maps in ConnectorPhysicalView.tsx:277 and AnalysisConnectorWorkspacePanels.tsx:233, single occupantRef in selectors.ts:258-284, and buildValidationIssues.ts:145-161 flags any shared way as an error.

# Scope
- In:
  - Selectors expose occupant lists per way (selectConnectorCavityStatuses).
  - Physical view renders all occupants of a shared way plus a shared indicator (e.g. badge/count); analysis panel lists each occupant with per-occupant release.
  - Validation center: shared way with at least one flagged endpoint -> warning notice; none flagged -> keep the existing error.
  - networkStatistics.ts: shared way counts as one occupied way; add a sharedWays count surfaced in StatisticsWorkspaceContent.
- Out:
  - Exports and functional view regression (next slice).

# Acceptance criteria
- AC1: A way with 2+ occupants shows all of them with a shared indicator in physical view and analysis panel, and releasing one occupant leaves the others assigned.
- AC2: Validation shows an warning-level (non-blocking) shared-way notice when flagged, the legacy error otherwise; occupancy percent is unchanged by sharing and a shared-way count is visible in statistics.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: A way with 2+ occupants shows all of them with a shared indicator in physical view and analysis panel, and releasing one occupant leaves the others assigned.
- request-AC5 -> This backlog slice. Proof: AC2: Validation shows an warning-level (non-blocking) shared-way notice when flagged, the legacy error otherwise; occupancy percent is unchanged by sharing and a shared-way count is visible in statistics.
- request-AC6 -> This backlog slice. Proof: AC2: Validation shows an warning-level (non-blocking) shared-way notice when flagged, the legacy error otherwise; occupancy percent is unchanged by sharing and a shared-way count is visible in statistics.
- request-AC3 -> This backlog slice. Evidence needed: The wire endpoint form shows an 'allow overload' checkbox next to the way index for connector endpoints; when the selected way is occupied and the box is unchecked the hint suggests a free way (current behavior), when checked the hint states the way is shared and with whom.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_016_shared_connector_way_multi_wire_crimp`
- Architecture decision(s): (none yet)
- Request: `req_165_shared_connector_way_multi_wire_crimp_with_opt_in_overload_checkbox`
- Primary task(s): `task_161_orchestrate_shared_connector_way_multi_wire_crimp`

# AI Context
- Summary: Visibility: shared-way indicators in physical view, analysis panel, validation and statistics
- Keywords: scaffolded-backlog, visibility: shared-way indicators in physical view, analysis panel, validation and statistics, implementation-ready
- Use when: Implementing the scaffolded slice for Visibility: shared-way indicators in physical view, analysis panel, validation and statistics.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_161_orchestrate_shared_connector_way_multi_wire_crimp`

# Notes
- Task `task_161_orchestrate_shared_connector_way_multi_wire_crimp` was finished via `logics-manager flow finish task` on 2026-07-12.

## item_688_restructure_settings_workspace_storage_hierarchy_and_simplify_legacy_mode - Restructure Settings workspace storage hierarchy and simplify legacy mode
> From version: 1.19.1
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 10%
> Complexity: High
> Theme: Workspace UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-08 17:37:36

# AI Context
- Restructure SettingsWorkspaceStorageSection only; keep the settings-workspace-storage id, notice action ids, focus requests and mode-aware search labels.
- Legacy single-file tools stay functional; collapse them unless a link or conflict is active.
- Reuse status components from item_686 for the header status.

# Problem
- Settings > Workspace storage presents equal-weight button stacks without a primary action or useful version summary, and legacy mode shows redundant controls.

# Scope
- In:
  - Current workspace header with name, selector, status, primary Save and secondary Rename/New.
  - Versions summary with latest version label/title/date, correct plurals, primary Create version, secondary History and Record supplier handoff.
  - Compact Transfer and recovery row; Import old workspace files under an Advanced disclosure once a workspace exists.
  - Legacy mode: remove the disabled selector and redundant chip, single create action, single-file tools collapsed unless a link or conflict is active.
  - Keep settings-workspace-storage id, focus targets, notice action ids and mode-aware search labels working.
- Out:
  - Other Settings sections and network Import/Export.

# Acceptance criteria
- AC1: Header, summary and action hierarchy render as specified in named and legacy modes at 360px and desktop.
- AC2: Every req_168 action, gate, search label and focus target still works; tests updated accordingly.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Header, summary and action hierarchy render as specified in named and legacy modes at 360px and desktop.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_020_workspace_experience_polish_after_the_1_19_1_visual_review`
- Architecture decision(s): (none yet)
- Request: `req_169_remediate_workspace_ui_and_ux_findings_from_the_1_19_1_visual_review_on_home_and_settings`
- Primary task(s): `task_166_deliver_workspace_ux_remediation_from_the_1_19_1_visual_review`

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

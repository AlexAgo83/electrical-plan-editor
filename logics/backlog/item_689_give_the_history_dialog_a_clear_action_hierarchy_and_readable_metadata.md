## item_689_give_the_history_dialog_a_clear_action_hierarchy_and_readable_metadata - Give the History dialog a clear action hierarchy and readable metadata
> From version: 1.19.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Workspace UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-08 15:35:56

# AI Context
- HistoryDialog in WorkspaceLineagePanels.tsx; resume keeps the existing confirmation and recovery-before-restore.
- Device labels come from useWorkspaceLineages.resolveDeviceLabel; display only, stored metadata unchanged.
- Secondary menu must be keyboard accessible and themed.

# Problem
- History rows show four equal buttons including the risky resume, duplicate handoff entry points, cryptic device labels and noisy chrome.

# Scope
- In:
  - Per row: primary Open read-only, secondary menu for Download file, Record supplier handoff and Resume from this version marked as risky with the existing confirmation.
  - Toolbar keeps one Record supplier handoff and Export package; remove the storage line; human-readable or hidden device labels without changing stored version metadata; normal rest state for the filter; toasts visible above the dialog or grouped.
- Out:
  - Changes to version, handoff or restore semantics and to stored device labels in existing files.

# Acceptance criteria
- AC1: Each row exposes one primary action and a keyboard-accessible secondary menu; resume remains confirmed.
- AC2: No storage line, no cryptic device id, filter not highlighted at rest, toasts not hidden under the dialog.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: Each row exposes one primary action and a keyboard-accessible secondary menu; resume remains confirmed.

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

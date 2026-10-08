## item_689_give_the_history_dialog_a_clear_action_hierarchy_and_readable_metadata - Give the History dialog a clear action hierarchy and readable metadata
> From version: 1.19.1
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Workspace UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-08 18:17:32

# AI Context
- HistoryDialog in WorkspaceLineagePanels.tsx; resume keeps the existing confirmation and recovery-before-restore.
- Device labels come from useWorkspaceLineages.resolveDeviceLabel; display only, stored metadata unchanged.
- Secondary menu must be keyboard accessible and themed.

# Problem
- History rows show four equal buttons including the risky resume, duplicate handoff entry points, cryptic device labels and noisy chrome.

# Scope
- In:
  - Per row: primary Open read-only, secondary dropdown menu (themed, keyboard accessible) for Download file, Record supplier handoff and Resume from this version; Resume sits last after a separator, uses the theme danger color and a warning sub-label, and keeps the existing confirmation (decision 2026-10-08).
  - Toolbar keeps one Record supplier handoff and Export package; remove the storage line; device labels hidden from the History rows without changing stored version metadata; normal rest state for the filter; success toasts rendered above the dialog (decisions 2026-10-08).
- Out:
  - Changes to version, handoff or restore semantics and to stored device labels in existing files.

# Acceptance criteria
- AC1: Each row exposes one primary action and a keyboard-accessible secondary menu; resume remains confirmed.
- AC2: No storage line, no cryptic device id, filter not highlighted at rest, toasts not hidden under the dialog.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: Each row exposes one primary action and a keyboard-accessible secondary menu; resume remains confirmed.
- request-AC8 -> This backlog slice. Proof: Implemented in abd7668f, dc98be17, 8942262e, d0dd7042, 0d5421b6, e6e551fd, 10165d8f; validated with npm run -s ci:local (lint, typecheck, quality:i18n, Logics lint/audit, vitest fast+ui segments, Playwright e2e incl. tests/e2e/workspace-ux-remediation.spec.ts, build, PWA) passing on 2026-10-08. Source: `10165d8f`

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

# Tasks
- `task_166_deliver_workspace_ux_remediation_from_the_1_19_1_visual_review`

# Notes
- Task `task_166_deliver_workspace_ux_remediation_from_the_1_19_1_visual_review` was finished via `logics-manager flow finish task` on 2026-10-08.

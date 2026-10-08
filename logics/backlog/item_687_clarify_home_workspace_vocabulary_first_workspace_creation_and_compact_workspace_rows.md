## item_687_clarify_home_workspace_vocabulary_first_workspace_creation_and_compact_workspace_rows - Clarify Home workspace vocabulary, first workspace creation and compact workspace rows
> From version: 1.19.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Workspace UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-08 15:35:55

# AI Context
- Keep the Home selector the user asked for in 1.19.1; cards become compact rows for the other workspaces.
- Create your first workspace opens the existing create dialog via model.openDialog("create"), not a new flow.
- Rename the active network panel and Quick start copy per mode in EN/FR only; network actions unchanged.

# Problem
- Home mixes three meanings of workspace, makes the first workspace a two-step detour and duplicates the selector with heavy cards.

# Scope
- In:
  - Rename the active network panel and adjust Quick start labels/intro per mode in EN/FR; keep legacy file shortcuts only in legacy mode.
  - Empty library: primary Create your first workspace action opening the create dialog directly.
  - Keep the themed selector; render other workspaces as compact rows (name, versions, last save, status hint) with whole-row resume, active first or excluded, ellipsis for long names.
- Out:
  - Changes to Quick start network actions or the What's new panel.

# Acceptance criteria
- AC1: Home copy distinguishes named workspaces, active network and legacy files in EN/FR.
- AC2: First workspace can be created from Home in one step; rows resume on click and never wrap into multi-line buttons.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: Home copy distinguishes named workspaces, active network and legacy files in EN/FR.

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

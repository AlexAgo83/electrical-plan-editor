## item_690_validate_the_workspace_ux_remediation_and_update_the_workflow_guide - Validate the workspace UX remediation and update the workflow guide
> From version: 1.19.1
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 10%
> Complexity: Medium
> Theme: Workspace UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-08 17:37:36

# AI Context
- Cover AC1-AC7 of req_169 with UI, theme, locale and e2e tests at 360px and desktop, EN/FR, keyboard.
- Attach before/after screenshots (light, dark, custom theme) to the task report.
- Record repository gate results per request AC before closeout.

# Problem
- Layout, theming, locale and flow changes across Home, Settings and History can regress persistence safety, accessibility and documented paths.

# Scope
- In:
  - Extend app.ui.home, theme, settings-locale, workspace-lineages and storage section specs plus the e2e lineage spec for AC1 to AC7, including 360px/desktop, keyboard and EN/FR.
  - Capture before/after screenshots for representative light, dark and custom themes and attach them to the task report.
  - Update docs/workspace-lineages.md; run repository delivery gates and record results per request AC.
- Out:
  - Release publication.

# Acceptance criteria
- AC1: Tests cover every request AC and pass with the repository gates.
- AC2: Workflow guide and screenshots reflect the delivered Home, Settings and History flows.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: Tests cover every request AC and pass with the repository gates.

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

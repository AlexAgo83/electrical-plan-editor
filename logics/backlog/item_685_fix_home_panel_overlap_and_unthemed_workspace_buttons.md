## item_685_fix_home_panel_overlap_and_unthemed_workspace_buttons - Fix Home panel overlap and unthemed workspace buttons
> From version: 1.19.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Workspace UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-08 18:17:32

# AI Context
- Summary: home.css >=980px gives .home-left-column a fixed viewport height, overflow hidden and two grid rows for three panels; themed buttons only match .row-actions button, so notice, read-only banner and Home card buttons render with browser defaults.
- Keywords: home.css, home-left-column, row-actions, button theming, overlap
- Use when: Fixing Home panel layout or unthemed lineage buttons; verify 0/1/2/8 workspaces, long names and all theme modes.
- Skip when: Changing workspace behavior or persistence.

# Problem
- On desktop the Home left column clips and overlaps its panels, and several workspace buttons render with browser default styling in every theme.

# Scope
- In:
  - Rework the >=980px .home-left-column layout so three panels fit (auto rows with internal scrolling, or move Named workspaces next to What's new or merge it with the active network panel); verify 0/1/2/8 workspaces and long names.
  - Apply the global themed button style to notice actions, read-only banner buttons, Settings storage buttons and Home workspace row buttons through the existing row-actions convention or one shared class; check hover, focus-visible and disabled in all theme modes.
- Out:
  - Home redesign beyond the workspace panels; persistence changes.

# Acceptance criteria
- AC1: No overlap, clipping or large gap between Home panels from 980px to 1920px for the listed workspace counts; Quick start remains fully clickable.
- AC2: No lineage button falls back to browser default styling in any theme; covered by a theme test.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: No overlap, clipping or large gap between Home panels from 980px to 1920px for the listed workspace counts; Quick start remains fully clickable.
- request-AC2 -> This backlog slice. Proof: AC2: No lineage button falls back to browser default styling in any theme; covered by a theme test.
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
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_166_deliver_workspace_ux_remediation_from_the_1_19_1_visual_review`

# Notes
- Task `task_166_deliver_workspace_ux_remediation_from_the_1_19_1_visual_review` was finished via `logics-manager flow finish task` on 2026-10-08.

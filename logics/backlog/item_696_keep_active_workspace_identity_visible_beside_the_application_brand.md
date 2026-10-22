## item_696_keep_active_workspace_identity_visible_beside_the_application_brand - Keep active workspace identity visible beside the application brand
> From version: 1.19.3
> Schema version: 1.0
> Status: In progress
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Workspace visibility
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-22 12:00:13

# AI Context
- Bind lineage displayName to AppHeaderAndStats through shell composition. Preserve visible identity at 360px, accessible full text and correct historical/legacy/loading context through rename and switch.

# Problem
- The persistent header shows the application brand without the current workspace, making workspace context easy to lose.

# Scope
- In:
  - Thread the authoritative lineage display identity and historical/legacy/loading state through the existing shell/header composition. Render the workspace name directly to the right of the brand on every screen.
  - Handle initial restore, rename/create/open/switch and same-name workspaces without stale values or network-name substitution. Keep accessible full text for ellipsis and responsive identity visibility at 360px and desktop.
  - Add focused header state/reactivity and browser navigation coverage, keyboard/EN/FR/theme checks, and update guide screenshots as applicable. Collect per-request AC evidence and run applicable delivery gates for the complete orchestration.
- Out:
  - New workspace navigation architecture and replacing existing workspace selectors.

# Acceptance criteria
- AC1: All AC9 state transitions and header layouts pass focused UI and browser checks.
- AC2: Task evidence maps AC1-AC10 to tests/docs/performance findings and applicable repository checks; no implementation closeout before the required evidence exists.

# AC Traceability
- request-AC9 -> This backlog slice. Proof: Delivered in c91b5e3b; validated by task_168 evidence: reactive identity and responsive header assertions (slice AC1).
- request-AC10 -> This backlog slice. Proof: Delivered in c91b5e3b; validated by task_168 evidence: consolidated AC matrix, EN/FR/browser checks and delivery gate results (slice AC2).

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_022_plan_issue_traceability_and_everyday_workspace_confidence`
- Architecture decision(s): (none yet)
- Request: `req_171_add_plan_issue_metadata_proactive_routing_drift_warnings_and_visible_portable_workspace_controls`
- Primary task(s): `task_168_deliver_plan_issue_metadata_routing_drift_checks_and_workspace_copy_visibility`

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

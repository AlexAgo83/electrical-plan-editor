## item_693_persist_plan_issue_revision_and_date_and_render_them_in_export_cartouches - Persist plan issue revision and date and render them in export cartouches
> From version: 1.19.3
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Plan metadata
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-22 12:53:37

# AI Context
- Extend explicit metadata allowlists in network normalization, migrations and portability, then propagate calendar-date values through forms, previews and export cartouches. Existing files leave both fields unset.

# Problem
- Exported plans lack explicit user-controlled issue metadata; technical revisions and creation dates cannot represent a plan issue.

# Scope
- In:
  - Introduce optional Network planRevision/planIssueDate with shared normalization and strict calendar-date validation; extend action/types, forms, drafts, clone/import, migrations, serializers and read-only gates. Keep dates as calendar strings without timezone conversion.
  - Propagate metadata through controller slices, export parameter types, preview and cartouche rendering; inspect the existing PDF path to cover consumers of the canvas exporter. Preserve cartouche toggle behavior.
  - Add metadata isolation/validation, persistence/network portability/lineage roundtrip, undo and export cartouche tests. Document field meaning and empty values.
- Out:
  - Workspace version numbering, issue approvals and unrelated export formats.

# Acceptance criteria
- AC1: Request AC1-AC3 pass with independent network metadata, backward compatibility and localized export evidence.
- AC2: Relevant checks and docs provide evidence for AC10.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: Delivered in e049bcad; validated by task_168 evidence: form validation and manual revision/date behavior tests (slice AC1).
- request-AC2 -> This backlog slice. Proof: Delivered in e049bcad; validated by task_168 evidence: persistence, network import/clone, undo and immutable-version roundtrips (slice AC1).
- request-AC3 -> This backlog slice. Proof: Delivered in e049bcad; validated by task_168 evidence: localized cartouche previews and SVG/PNG/PDF consumer assertions (slice AC1).
- request-AC10 -> This backlog slice. Proof: Delivered in e049bcad; validated by task_168 evidence: metadata/export regression results and help updates (slice AC2).

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

# Tasks
- `task_168_deliver_plan_issue_metadata_routing_drift_checks_and_workspace_copy_visibility`

# Notes
- Task `task_168_deliver_plan_issue_metadata_routing_drift_checks_and_workspace_copy_visibility` was finished via `logics-manager flow finish task` on 2026-10-22.

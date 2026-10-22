## item_695_download_the_current_workspace_snapshot_from_a_copy_action - Download the current workspace snapshot from a Copy action
> From version: 1.19.3
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Workspace portability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-22 11:57:04

# AI Context
- Serialize the captured displayed state, including unsaved edits, through workspaceFile. Preserve lineage identity, source dirty status and technical save base. Historical copy exports the displayed frozen snapshot.

# Problem
- Current workspace has no direct single-file snapshot download alongside its primary controls.

# Scope
- In:
  - Add a Copy operation through the lineage model/controller and Current workspace action row, using canonical workspace serialization and safe filenames. Capture the entire displayed state at click time, including unsaved edits; preserve identity and correct current/historical content.
  - Keep source files, dirty/save base/durability/timestamps, milestones and active selection unchanged. Support browser/folder sources without requiring source write access; retain session/busy guards and accurate download-only feedback.
  - Localize labels/tooltips, include Settings search discovery, and test download roundtrip, two-network content, unsaved edits, metadata, historical mode, unsupported direct file access, failure and workspace-switch races. Update the workspace guide to distinguish Copy snapshot from full package export.
- Out:
  - Creating an independent workspace identity, clipboard copy, ZIP export and copying history or attachments.

# Acceptance criteria
- AC1: The action placement, filename and portable current-state content meet AC7.
- AC2: Source/session invariants, historical snapshot behavior and accurate feedback meet AC8; targeted UI/roundtrip/browser evidence supports AC10.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: Planned evidence: action placement, filename and unsaved multi-network download roundtrip (slice AC1).
- request-AC8 -> This backlog slice. Proof: Planned evidence: source/session invariants, read-only export and download failure tests (slice AC2).
- request-AC10 -> This backlog slice. Proof: Planned evidence: copy browser regression and workspace guide updates (slice AC2).

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

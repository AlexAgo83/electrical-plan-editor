## item_682_retire_obsolete_storage_controls_with_explicit_legacy_compatibility - Retire obsolete storage controls with explicit legacy compatibility
> From version: 1.19.0
> Schema version: 1.0
> Status: Ready
> Understanding: 95%
> Confidence: 90%
> Progress: 0%
> Complexity: High
> Theme: Workspace storage settings
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# AI Context
- Old single-file Settings status can contradict the active named workspace and expose unrelated save targets.
- Follow the parent request action disposition and storage-mode contracts. Preserve lineage recovery and history semantics.

# Problem
- Old single-file Settings status can contradict the active named workspace and expose unrelated save targets.

# Scope
- In:
  - Branch the storage presentation on active named workspace versus legacy session and consume the correct authoritative status/actions in each branch.
  - Apply the explicit keep/move/remove matrix from the request; update OperationsHealthPanel and Home storage shortcuts. Remove dead UI props/styles/translations only after a reference audit confirms no compatibility consumer.
  - Retain old-file reading, no-lineage save/resume/relink/conflict flows and recovery downloads; prevent hidden legacy actions and stale asynchronous callbacks from mutating named or historical sessions.
- Out:
  - New persistence formats, cloud sync, network import/export redesign and deletion of user history.

# Acceptance criteria
- AC1: Named sessions show only their actual target/save status and lineage actions; no linked-file conflict or autosave control is exposed for an unrelated handle.
- AC2: An existing legacy linked-file session can still resume, save, relink and recover a conflict; a fallback session can download and adopt snapshots without data deletion.
- AC3: Read-only, busy, cancelled permissions, save failure and workspace switches retain existing mutation and isolation guarantees; network Import/Export behavior remains intact.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Named sessions show only their actual target/save status and lineage actions; no linked-file conflict or autosave control is exposed for an unrelated handle.
- request-AC4 -> This backlog slice. Proof: AC2: An existing legacy linked-file session can still resume, save, relink and recover a conflict; a fallback session can download and adopt snapshots without data deletion.
- request-AC6 -> This backlog slice. Proof: AC3: Read-only, busy, cancelled permissions, save failure and workspace switches retain existing mutation and isolation guarantees; network Import/Export behavior remains intact.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_019_workspace_storage_settings_information_architecture_and_theme_consistency`
- Architecture decision(s): (none yet)
- Request: `req_168_consolidate_release_1_19_workspace_controls_in_settings_storage_and_align_global_ui`
- Primary task(s): `task_165_deliver_workspace_storage_settings_consolidation_and_ui_alignment`

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

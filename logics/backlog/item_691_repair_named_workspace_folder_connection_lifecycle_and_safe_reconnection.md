## item_691_repair_named_workspace_folder_connection_lifecycle_and_safe_reconnection - Repair named workspace folder connection lifecycle and safe reconnection
> From version: 1.19.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Workspace persistence
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-19 18:08:07

# AI Context
- Summary: Implement the connection lifecycle and localized recovery actions for request AC1-AC7. Candidate selection must preserve identity and dirty edits, validate before connection commit, retain the original save base and ignore results from stale sessions.
- Keywords: workspaceId, child directory handle, IndexedDB, relinkFolder, dirty recovery
- Use when: Investigating the reported new-workspace missing-folder failure or implementing its scoped recovery criteria.
- Skip when: Publishing a release, changing portable schemas or converting browser-only storage.

# Problem
- New folder-backed workspaces can end up without a usable repository; reconnect may fail before selection, reject the creation parent, hide the cause or leave Save using stale error/status. Existing asynchronous and conflict boundaries must protect edits during recovery.

# Scope
- In:
  - Reproduce the reported error from the Settings create/reconnect/Save paths; record browser/context, actual exception and failing stage. Compare immediate creation with reload and investigate handle storage/readback; identify hypotheses separately from confirmed cause.
  - Repair creation setup and handle/repository activation sequencing. Preserve a recoverable initialized folder on partial failure and make retry avoid registering duplicate identities or overwriting an existing lineage.
  - Implement explicit reconnect outcomes and a gesture-safe permission/Choose folder flow, including stale handles and failures before repository.open. Map failures at the originating stage rather than blanket catch-to-null or stale save.error substitution.
  - Resolve either the selected root or a single immediate child matching workspaceId; reject ambiguity/foreign/invalid folders without writes. Validate before committing the handle, repository and registry folder hint; keep rollback/retry semantics for failed persistence.
  - Preserve current dirty edits and their disk base, detect changed/divergent same-ID copies and route to existing conservative recovery/conflict behavior. Update status on connection versus actual verified Save; restore subsequent autosave.
  - Serialize connection commits, guard all asynchronous results by identity/session and retain historical read-only gates. Keep browser-only storage unchanged.
  - Update EN/FR outcome messages, folder instructions, Settings actions/notices, focus and search labels. Cancel neutrally; describe browser/ZIP fallback for unsupported access without implicit conversion.
- Out:
  - Portable format changes, new storage modes, deleted-folder recreation, general UI redesign and release publication.

# Acceptance criteria
- AC1: Fresh creation and reload keep a usable stable folder connection or report a recoverable setup failure with no duplicate workspace.
- AC2: Permission, retrieval, selection and stale-handle outcomes settle predictably with gesture-safe explicit retries and matching root/parent identity validation.
- AC3: Reconnect preserves dirty work and divergent disk heads, cannot cross active-session/read-only boundaries, and reports connected independently from verified Save.
- AC4: Save, autosave and localized Settings recovery guidance satisfy request AC1-AC7, including neutral cancellation and browser-only behavior.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Fresh creation and reload keep a usable stable folder connection or report a recoverable setup failure with no duplicate workspace.
- request-AC2 -> This backlog slice. Proof: AC2: Permission, retrieval, selection and stale-handle outcomes settle predictably with gesture-safe explicit retries and matching root/parent identity validation.
- request-AC3 -> This backlog slice. Proof: AC3: Reconnect preserves dirty work and divergent disk heads, cannot cross active-session/read-only boundaries, and reports connected independently from verified Save.
- request-AC4 -> This backlog slice. Proof: AC4: Save, autosave and localized Settings recovery guidance satisfy request AC1-AC7, including neutral cancellation and browser-only behavior.
- request-AC5 -> This backlog slice. Proof: AC4: Save, autosave and localized Settings recovery guidance satisfy request AC1-AC7, including neutral cancellation and browser-only behavior.
- request-AC6 -> This backlog slice. Proof: AC4: Save, autosave and localized Settings recovery guidance satisfy request AC1-AC7, including neutral cancellation and browser-only behavior.
- request-AC7 -> This backlog slice. Proof: AC4: Save, autosave and localized Settings recovery guidance satisfy request AC1-AC7, including neutral cancellation and browser-only behavior.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_021_reliable_folder_reconnection_for_named_workspace_persistence`
- Architecture decision(s): (none yet)
- Request: `req_170_make_folder_reconnection_reliable_for_newly_created_named_workspaces`
- Primary task(s): `task_167_deliver_reliable_new_workspace_folder_reconnection`

# Priority
- Priority: High
- Rationale: The reported failure blocks reliable disk saving for new folder-backed workspaces.

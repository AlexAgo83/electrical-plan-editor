## item_675_lineage_repository_with_durable_folder_storage_and_isolated_local_recovery - Lineage repository with durable folder storage and isolated local recovery
> From version: 1.18.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Portable workspace version history
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-07 16:16:37

# AI Context
- Summary: The storage hook and IndexedDB handle registry currently track one file; adding folders and history without isolating async work risks writing one project into another.
- Keywords: lineage, repository, durable, folder, storage, isolated, local, recovery
- Use when: Add repository interfaces for folder and browser-backed modes, per-lineage registry/handles and lazy metadata reads; integrate with current file access helpers.
- Skip when: Implementing sibling slices beyond the scope listed below.

# Problem
- The storage hook and IndexedDB handle registry currently track one file; adding folders and history without isolating async work risks writing one project into another.

# Scope
- In:
  - Add repository interfaces for folder and browser-backed modes, per-lineage registry/handles and lazy metadata reads; integrate with current file access helpers.
  - Implement serialized working saves, staged immutable version publication, manifest revision checks, recovery of partially published operations, and prior-working-copy recovery around replacement.
  - Make create-version idempotent per submitted operation; require successful close/readback/validation before disk success, and distinguish browser durable commit from portable disk persistence.
  - Guard queued autosave and delayed callbacks using captured lineage/session identity. Preserve a valid legacy browser snapshot on first registry migration. Provide actionable unavailable/quota/permission statuses.
  - Preserve published history without automatic retention deletion; expose recoverable orphan versions or pending operations when index publication fails.
- Out:
  - Changes outside this item are delivered by the other linked backlog items.

# Acceptance criteria
- AC1: Save/switch with a delayed write cannot put Series state into Prototypes or attach the wrong handle; reload recovers both local sessions.
- AC2: Injected failure at each snapshot/working/manifest stage leaves the previous committed state usable, reports pending recovery and permits a retry without duplicate publication.
- AC3: Denied/revoked permissions and cache quota errors never produce a saved-to-disk indicator; switch is blocked if unsaved work cannot be preserved.
- AC4: Directory reload without original browser data reconstructs all committed metadata and working state; missing/corrupt files are isolated and visible.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Save/switch with a delayed write cannot put Series state into Prototypes or attach the wrong handle; reload recovers both local sessions.
- request-AC3 -> This backlog slice. Proof: AC2: Injected failure at each snapshot/working/manifest stage leaves the previous committed state usable, reports pending recovery and permits a retry without duplicate publication.
- request-AC6 -> This backlog slice. Proof: AC3: Denied/revoked permissions and cache quota errors never produce a saved-to-disk indicator; switch is blocked if unsaved work cannot be preserved.
- request-AC9 -> This backlog slice. Proof: AC4: Directory reload without original browser data reconstructs all committed metadata and working state; missing/corrupt files are isolated and visible.

# Decision framing
- Product framing: Defined in the linked product brief and request; this slice follows their folder/ZIP and milestone decisions.
- Architecture framing: Apply the repository and format boundaries in the request; record implementation details and failure semantics before dependent slices start.

# Links
- Product brief(s): `prod_018_portable_named_workspace_lineages_and_supplier_history`
- Architecture decision(s): (none yet)
- Request: `req_167_named_portable_workspace_lineages_with_immutable_version_history_and_supplier_handoffs`
- Primary task(s): `task_164_deliver_named_workspace_lineages_version_history_and_supplier_archives`

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_164_deliver_named_workspace_lineages_version_history_and_supplier_archives`

# Notes
- Task `task_164_deliver_named_workspace_lineages_version_history_and_supplier_archives` was finished via `logics-manager flow finish task` on 2026-10-07.

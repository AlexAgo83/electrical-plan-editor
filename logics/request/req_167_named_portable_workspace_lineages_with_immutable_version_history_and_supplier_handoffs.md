## req_167_named_portable_workspace_lineages_with_immutable_version_history_and_supplier_handoffs - Named portable workspace lineages with immutable version history and supplier handoffs
> From version: 1.18.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Portable workspace version history
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Indicators reviewed: 2026-10-07 16:16:36

# AI Context
- Summary: Two independent named workspaces replace timestamp-only backups with stable working files and deliberately frozen milestones. Folder/ZIP copies preserve history and exact supplier artifacts.
- Keywords: named, portable, workspace, lineages, immutable, version, history, supplier, handoffs
- Use when: Scoping or implementing the complete lineage persistence and historical consultation workflow.
- Skip when: Changing individual harness exports or adding hosted collaboration.

# Needs
- Maintain separate named Series and Prototype workspace lineages with convenient resume/save/transfer.
- Replace timestamp-only piles with deliberate readable numbered snapshots and a browsable immutable history.
- Recover exactly the design and delivered artifacts used for a supplier handoff.
- Preserve file ownership, offline use and manual copying across computers without a hosted backend.

# Context
- User workflow: a folder contains successive full snapshots of one project, is copied manually between computers, and mostly serves latest-state editing; occasionally an old supplier delivery must be reconstructed. The accepted proposal introduces two initially desired independent lineages (Series and Prototypes), a stable working file, deliberate numbered milestones and read-only history. No application code is authorized in this scoping task.
- Current implementation: src/app/lib/workspaceFile.ts defines schema v1 with workspaceId, revisionId, timestamps and full AppState; buildWorkspaceFileName generates electrical-workspace-<timestamp>.epe.json. revisionId is regenerated on saves for conflict detection, not a user-visible business version. Preserve that distinction in the new format.
- Current useWorkspaceFileStorage has one linkedHandleRef, one lastLoadedPayloadRef and a debounced autosave. workspaceFileAccess.ts stores one last-linked-handle in IndexedDB and only models file pickers, not directory access. Extend through a storage/repository abstraction rather than adding all history/archive logic to this hook. Directory support requires explicit capability detection.
- The archived prod_005_cloud_file_workspace_sync is background context, not an active delivery parent. This feature combines named lineages, deliberate milestones and supplier archives and receives a fresh product brief. Reuse current parse/migration, file conflict and permission handling where appropriate; do not treat the archived brief as an implemented contract.
- Decision: portable root per lineage contains workspace-manifest.json, <slug>-travail.epe.json, Versions/<slug>-vNNN-<label>-<shortVersionId>.epe.json, Handoffs/<handoffId>/ metadata and attachments, and Recovery/ only for explicit pre-restore or interrupted-save recovery. IDs are authoritative; slugs and filenames are presentation. Freeze the slug at creation so renaming the display name does not trigger unsafe bulk file moves. Examples use serie and protos; UI labels are localized.
- Data contract: manifest has schemaVersion, workspaceId, displayName, stable slug, manifestRevisionId, working head revision/baseVersionId and an index of immutable versions and handoffs. Each version embeds workspace identity/name, versionId, displayNumber, technical revisionId, parentVersionId, restoredFromVersionId when relevant, createdAt, title/comment and a full persisted project snapshot. Actual divergent ancestry is retained; imported unrelated legacy snapshots use chronological ordering metadata without fabricated historical parentage.
- Numbering: v001, v002 etc. are allocated when an explicit version commits, not on ordinary saves. Next number is max known committed displayNumber + 1 within the lineage, never count + 1. Unique IDs prevent filename collisions offline. On reunion, existing numbers stay unchanged; show v006 with short ID/device provenance if two distinct v006 exist. Explicitly choose a working head, retain both variants, then allocate v007. No auto-merge or timestamp winner.
- Snapshot boundary: preserve all current portable AppState project content, including networks, harness assemblies, catalog and layouts. Do not add machine file handles, browser permissions or provider secrets to portable metadata. Existing local UI preferences remain local. Undo/redo and pending mutations are scoped/reset at workspace boundaries, distinct from durable history.
- Persistence contract: implement lineage-scoped IndexedDB recovery/registry while maintaining compatibility with legacy browser persistence; a browser cache is not proof of a disk save. Validate before activation, serialize writes per lineage, capture workspace identity in asynchronous operations, stage immutable files before manifest publication, and recover interrupted working-file replacement from a verified prior copy. Directory APIs provide no universal multi-file transaction or distributed lock; explicitly detect and recover incomplete operations instead of promising atomic cloud sync.
- Read-only consultation must gate every project mutation path, autosave, keyboard undo/redo, imports and agent-driven mutations, while allowing navigation and exports. A suspended working session is retained separately. Restore first durably preserves displaced work in Recovery (or a complete downloadable recovery package); failure/cancellation aborts restore. Source snapshot bytes are never rewritten by in-memory schema migration.
- Supplier handoff is a recorded event referencing an existing frozen version or creating one from current work. Capture exact files chosen by the user; do not regenerate historical PDFs and call them originals. Handoff record and files become immutable on publication; later corrections are a new explicitly superseding record. Regenerated exports are separately identified. No mail, cloud account or supplier integration is included.
- Fallback: without directory access, retain the library in browser storage and offer explicit ZIP import/export with a pending-export indicator; Ctrl/Cmd+S initiates a portable package download when no writable target exists, and says download initiated rather than file verified. Users can always download an individual snapshot. ZIP contains a single lineage root using the same folder layout; users transfer both lineages by copying their common parent folder or exporting two ZIPs.
- Archive validation: reject absolute paths, traversal, duplicate normalized entries and unsupported schema before activation; verify declared hashes and ownership references. Initial documented limits are 10000 entries, 500 MiB total uncompressed content, 100 MiB per attachment, and 100:1 per-entry compression ratio, enforced on actual decoded bytes as well as metadata. Oversize imports fail without partial activation; limits live in one tested configuration. No attachment is executed or rendered as active content.
- Legacy adoption: current deterministic fallback workspace IDs can differ per old snapshot; never infer Series/Prototypes from these IDs. Preview valid embedded dates first, valid filename timestamp second, otherwise require user placement; ties require review. Record original filename, source IDs, original bytes digest and chosen ordering. Identical source content is reported for explicit skip/keep; assigned version numbers follow confirmed order. A fresh bulk import uses v001 onward; appending uses next available numbers. Newest valid date is only a suggested working-state choice.
- Performance scope: lazy-load snapshot contents and attachment blobs; open/history-list must not parse every snapshot eagerly. Verify a fixture with 100 versions and 150 wires per snapshot, and document observed package size and timing without an arbitrary hardware-specific pass threshold. Full snapshots are intentional in V1; deltas and compression beyond ZIP are deferred.

# Acceptance criteria
- AC1: Users can create, name, rename and switch between independent workspaces, including Series harnesses and Prototype harnesses, from a persistent selector and Home resume cards; identity survives renaming, copying and reopening on another computer. No fixed two-workspace limit is introduced.
- AC2: Save and Ctrl/Cmd+S update the active working copy without creating a numbered version. Dirty local state, locally recovered state, verified disk save, pending portable export and failures are distinguishable. Switching preserves each workspace and prevents delayed writes, undo history or selections from crossing workspace boundaries.
- AC3: Create version freezes a complete standalone workspace snapshot with a stable immutable version ID, monotonically increasing display number, creation date, optional title/comment and ancestry. Repeated clicks and failed writes cannot publish duplicates or claim a successful version before its durable commit.
- AC4: History lists versions by lineage with date, number, label, supplier handoff and provenance, supports text filtering and opens snapshots read-only. Resume from an older snapshot preserves the current working copy first and records the source version; resuming v002 after v005 produces a subsequent v006 without altering v003-v005.
- AC5: A supplier handoff binds one frozen version to an anonymized-example recipient, declared handoff date and note, and optionally preserves exact user-supplied delivered PDF/BOM/other files with original filename, byte size and content digest. The app does not send anything or claim delivery verification; attachments round-trip byte-for-byte.
- AC6: Copying a complete lineage folder to another computer and opening it recovers its working state, named history and handoff attachments without the original browser cache. Export/import of a ZIP provides equivalent portability, including a manual fallback where folder access is unavailable; individual version files remain independently openable.
- AC7: Divergent copies of the same workspace are detected by stable IDs and ancestry, not timestamps or display numbers. Import/open against a known divergent lineage preserves both heads and requires an explicit continuation choice; same-number distinct versions never overwrite each other and receive visible disambiguation.
- AC8: Existing timestamped workspace files remain readable. A previewable bulk import lets users explicitly assign files to a lineage, review chronological ordering, label versions and select the working state. Original files remain untouched; duplicate content is reported; invalid or ambiguous entries are not silently assigned or discarded.
- AC9: Interrupted writes, revoked permissions, malformed/future schemas, incomplete copies, stale manifest entries, missing attachments and archive import limits produce recoverable actionable states. No failure silently discards the previous valid working copy or a published version. Durable history is never automatically pruned.
- AC10: English/French accessible UI, targeted model/storage/UI regressions and end-to-end two-lineage portability, historical consultation, supplier handoff and divergence scenarios demonstrate the complete workflow; existing standalone workspace and network import/export behavior remains supported.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_018_portable_named_workspace_lineages_and_supplier_history`
- Architecture decision(s): (none yet)

# References
- src/app/lib/workspaceFile.ts
- src/app/lib/workspaceFileAccess.ts
- src/app/lib/workspaceFileOpenActions.ts
- src/app/lib/workspaceFileStorageStatus.ts
- src/app/hooks/useWorkspaceFileStorage.ts
- src/app/hooks/workspaceFileStorageTypes.ts
- src/app/hooks/useStoreHistory.ts
- src/app/hooks/useKeyboardShortcuts.ts
- src/app/components/workspace/HomeWorkspaceContent.tsx
- src/app/components/workspace/SettingsWorkspaceContent.tsx
- src/app/hooks/controller/useAppControllerHistoryDispatch.ts
- src/store/types.ts
- src/adapters/persistence/migrations.ts
- src/tests/workspace-file.spec.ts
- src/tests/workspace-file-storage.hook.spec.tsx
- logics/product/prod_005_cloud_file_workspace_sync.md

# Backlog
- `item_674_named_lineage_and_immutable_workspace_version_contracts`
- `item_675_lineage_repository_with_durable_folder_storage_and_isolated_local_recovery`
- `item_676_workspace_selector_home_resume_and_safe_history_consultation`
- `item_677_supplier_handoff_records_and_exact_delivered_artifact_archives`
- `item_678_portable_zip_transfer_and_divergence_reconciliation`
- `item_679_previewable_adoption_of_legacy_timestamped_workspace_collections`
- `item_680_workspace_lineage_release_validation_and_user_workflow_documentation`

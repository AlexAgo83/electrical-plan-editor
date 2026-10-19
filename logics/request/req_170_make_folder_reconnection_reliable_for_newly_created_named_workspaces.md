## req_170_make_folder_reconnection_reliable_for_newly_created_named_workspaces - Make folder reconnection reliable for newly created named workspaces
> From version: 1.19.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Workspace persistence
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Indicators reviewed: 2026-10-19 18:08:07

# AI Context
- Summary: The reported missing-folder error is the reproduction target. Check child-handle persistence, permission activation, stale handles and parent selection before attributing a root cause. Eight acceptance criteria protect edits, identity, verified saving and browser recovery.
- Keywords: workspaceId, child directory handle, IndexedDB, relinkFolder, dirty recovery
- Use when: Investigating the reported new-workspace missing-folder failure or implementing its scoped recovery criteria.
- Skip when: Publishing a release, changing portable schemas or converting browser-only storage.

# Needs
- Fix the user-reported failure on newly created folder-backed workspaces: Workspace action failed / The workspace folder is unavailable. Reconnect it to save to disk.
- Make Reconnect folder restore a usable connection and allow Save and autosave to persist current edits after initial creation, permission loss, missing handle or reload.
- Keep all local edits, workspace identity and immutable history safe while reporting permissions, cancellation, access failures and disk durability truthfully.

# Context
- User report on 2026-10-19, repository version 1.19.2. The exact failing browser, permission state and folder selection sequence are not yet known; the error alone does not establish a root cause. Development must reproduce and record the actual path before choosing a fix.
- createLineage selects a parent directory, creates a slug subdirectory, writes that child handle to the library, initializes the repository, registers the workspace and reactivates it by reading the handle back. The fresh handle is not retained as the active repository through activation. Investigate handle persistence/readback and failures between initialization and activation; failed setup must not masquerade as successful creation.
- resolveDirectory awaits IndexedDB handle retrieval and ensureFolderPermission. relinkFolder awaits that resolution before its repository-open try/catch; permission and handle errors may escape without a usable recovery action. A granted but stale/inaccessible handle leads to repository-open failure without another selection path.
- relinkFolder currently accepts only a selected root whose workspace-manifest.json matches workspaceId; creation asked for the parent. Selecting the same parent again is rejected. openFolder already supports roots or immediate child lineages but imports/reconciles them; reconnect must remain scoped to the active identity.
- pickLineageFolder is called after asynchronous work in reconnection; ensureFolderPermission may request permission after asynchronous retrieval/querying. Investigate transient user activation with an actual supported browser. All current picker errors except AbortError can be collapsed to null by controller catch handlers, obscuring the cause.
- saveNow invokes relinkFolder only when repository is null and substitutes save.error or the generic missing-folder message when reconnect fails. A repository that remains non-null after revoked access is another path to cover. Reconnection currently replaces context.repository and clears error without persisting current edits or re-evaluating dirty/durability against that repository.
- The existing folder tests use in-memory File System Access handles and cover creation, parent open and revoked writes, but have no dedicated relinkFolder regression. The current guide records no real OS folder-picker validation. Mock success alone cannot prove activation or persistent handle behavior.
- This is a focused reliability follow-up under prod_018 portable lineage contracts and req_168 Settings storage actions. It does not reopen the settled workspace architecture. The companion brief describes only reconnection behavior. Existing working-copy commit verification, read-only protection, session tokens, recovery and conflict handling remain authoritative.

# Acceptance criteria
- AC1: In a supported secure browser context, create a folder-backed workspace from current content and from empty content, edit and Save immediately, then reload and Save again. The registered workspaceId and slug child root stay stable; successful creation has an accessible initialized repository, and successful saving reads back the expected working file. Handle persistence/readback or setup failures produce an actionable result and recoverable content, never a false fully connected success or duplicate workspace on retry.
- AC2: Reconnect handles stored-handle permission states granted/prompt/denied, missing handles, handle retrieval/query/request exceptions and stale handles whose permission is granted but reads fail. Each outcome settles busy state and produces no unhandled rejection. A usable stored handle is reused; unavailable access offers a deliberate Choose folder retry. Picker and permission prompts run from a valid user gesture; if an await consumes activation, show a separate explicit action rather than automatically prompting after that await. Reload never triggers a permission prompt without user action.
- AC3: Reconnect accepts the exact lineage root or the original/common parent, using only a unique matching root or immediate child with the active workspaceId. Names and slugs alone never establish identity. Zero matches, multiple matching copies, another workspace, an empty folder or an invalid/unsupported manifest yield precise guidance without changing the connection or writing to candidates. Do not recursively scan the disk, initialize an empty folder or attach a different lineage. Persist the resolved child handle and refresh folderName only after candidate identity and repository validation succeed.
- AC4: Reconnection preserves in-memory edits, local recovery, working identity, versions and handoff bytes. It never loads disk content over dirty editor content or changes the technical save base in a way that bypasses conflict detection. If the same-ID disk copy has advanced or diverged from the cached/local base, preserve both heads and use existing conflict/reconciliation choices before saving; never silently overwrite either side. Cancellation, denial, corrupt candidate, read failure or handle persistence failure leave the previous session recoverable and emit no success.
- AC5: After successful reconnect, explicitly saving commits the latest editable state through the existing verified write protocol; normal autosave resumes on subsequent edits. Reconnect itself reports connected, not saved. Dirty/error/permission/durability and last durable save time reflect actual operations; no disk-verified claim is made for newer unsaved changes. A write or readback failure keeps dirty/recovery state and a retry action. Save reuses the correct reconnect result instead of replacing cancellation, wrong-folder or permission guidance with the stale generic missing-folder error.
- AC6: A delayed picker/permission/repository result for workspace A cannot attach to, alter status for or write editor content from workspace B after switching; repeated clicks and autosave cannot interleave connection commits. Capture active identity/session and recheck across asynchronous boundaries. Reconnect in historical read-only mode cannot persist historical content or bypass existing mutation gates; return to the working copy remains possible. Browser-only workspaces retain browser/ZIP behavior and never receive a folder reconnect requirement.
- AC7: Settings > Workspace storage and its recovery notice provide an accessible retry path with the current folder hint and root-or-parent instructions. EN/FR distinguish cancellation (neutral, no failure toast), permission required/denied, unsupported API or insecure context, wrong/missing/ambiguous workspace, read/write failure and successful reconnection. Unsupported folder access explains the existing browser/ZIP alternative without silently migrating storage. Buttons, notice focus targets and Settings search remain usable; expected reconnect states do not show only Workspace action failed.
- AC8: Add controller/folder, UI and browser regression evidence mapped to AC1-AC7. Cover fresh creation, reload with persisted handle, revoked/missing/stale handle, root/parent selection, invalid/foreign/duplicate-ID candidates, cancellation, unavailable API, persistence/write/readback failures, dirty/divergent state, workspace switching and historical mode. Record a supported-browser run against a real OS directory picker for create > edit > Save > reload > revoke/regrant or reselect > reconnect > edit > Save > verify disk bytes; if unavailable, record the outstanding limitation and do not claim this evidence completed. Update docs/workspace-lineages.md and pass applicable repository delivery gates before implementation closeout.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_021_reliable_folder_reconnection_for_named_workspace_persistence`
- Architecture decision(s): (none yet)

# References
- logics/request/req_167_named_portable_workspace_lineages_with_immutable_version_history_and_supplier_handoffs.md
- logics/product/prod_018_portable_named_workspace_lineages_and_supplier_history.md
- logics/request/req_168_consolidate_release_1_19_workspace_controls_in_settings_storage_and_align_global_ui.md
- src/app/lib/lineage/lineageSessionController.ts
- src/app/lib/lineage/lineageLibrary.ts
- src/app/lib/lineage/lineageRepository.ts
- src/app/lib/lineage/lineageStatus.ts
- src/app/lib/lineage/lineageNotices.ts
- src/app/lib/workspaceSessionGate.ts
- src/app/hooks/useWorkspaceLineages.ts
- src/app/components/workspace/SettingsWorkspaceStorageSection.tsx
- src/app/components/settings/settingsSearchModel.ts
- src/app/i18n/en.json
- src/app/i18n/fr.json
- src/tests/workspace-lineage-folder.spec.ts
- src/tests/workspace-lineage-session.spec.ts
- src/tests/app.ui.workspace-lineages.spec.tsx
- src/tests/workspace-storage-settings-section.spec.tsx
- tests/e2e/workspace-lineages.spec.ts
- docs/workspace-lineages.md
- package.json

# Backlog
- `item_691_repair_named_workspace_folder_connection_lifecycle_and_safe_reconnection`
- `item_692_validate_folder_reconnection_regressions_and_document_the_recovery_workflow`

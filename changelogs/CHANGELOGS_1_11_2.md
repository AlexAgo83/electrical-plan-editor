# Changelog (`1.11.1 -> 1.11.2`)

## Major Highlights

- Added cloud-file workspace storage with direct file linking, resume, relink, manual save, save-as, unlink, and fallback download flows.
- Added Workspace storage controls in Settings and Ops with compact labels capped to three action columns.
- Improved Workspace storage status reporting for linked/local mode, autosave target, permissions, resumable file state, file availability, last-save time, and conflict handling.
- Added workspace-file previews before replacing the current workspace, including network counts, active network, workspace ID, revision, and app/schema metadata.
- Hardened linked-file autosave so stale, externally changed, invalid, unavailable, or download-fallback file states do not silently overwrite the wrong target.
- Improved Home recent-change logs with action categories, detail sub-reasons, readable business references, persisted metadata, and direct navigation back to changed objects.
- Added detail labels for catalog, connector, splice, wire, network, harness assembly, node, segment, route, layout, import, and cascade-delete changes.
- Added visible `AI Agent` labels in the entity navigation menus while keeping provider readiness gating.

## Version 1.11.2 - Workspace File Sync and Recent Change Clarity

### Workspace file storage

- Added a versioned `.epe.json` workspace file format that wraps the app state with workspace identity, revision, timestamps, app version, and schema metadata.
- Added open/resume/relink/save-now/save-as/unlink actions for user-owned workspace files.
- Added direct File System Access support when the browser allows it, with JSON download fallback when it does not.
- Added resumable file handles through IndexedDB so a previous workspace file can be reopened from the browser when permission remains available.
- Added linked-file conflict detection when another tab or external editor changes the workspace revision.
- Blocked destructive autosave when the linked file no longer parses as a valid workspace, requiring the user to choose whether to load the file, keep local, or save a copy.
- Cleared stale linked handles after save-as download fallback so later edits do not keep autosaving into the previous linked file.
- Preserved backward compatibility with legacy persisted workspace snapshots and made their synthetic workspace/revision IDs stable across parses.

### Workspace storage UX

- Added Workspace storage status and quick actions to Settings.
- Added the same storage quick actions to the Ops panel using compact labels: `Resume`, `Open`, `Link`/`Relink`, `Save now`, `Save as`, and `Unlink`.
- Kept the storage action grids to a maximum of three columns on desktop, two on medium viewports, and one on narrow screens.
- Added clear status text for local-only mode, linked file mode, direct access support, fallback download mode, resume availability, permission state, and file availability.
- Added clickable linked/resumable file references in Settings when handles are available.

### Recent changes

- Persisted recent-change metadata across reloads without restoring undo stack snapshots.
- Added a richer Home recent-changes row with target kind, action label, detail sub-reason, target reference, time, tone, and optional open-target action.
- Added readable labels that prefer technical IDs, manufacturer references, connector/splice references, wire names, node labels, and endpoint/segment descriptions instead of opaque IDs.
- Added sub-reasons for common update buckets such as identity, metadata, export cartouche, pricing, physical layout, catalog link, terminal defaults, route, endpoints, electrical spec, color, members, and master connectors.
- Reset the recent-change list to a replacement entry when the whole workspace state is replaced, preventing logs from a previous workspace from leaking into a newly opened workspace with matching IDs.

### Navigation polish

- Added visible `AI Agent` labels in Workspace entity navigation and Network Summary quick entity navigation.
- Kept the AI Agent button disabled until the configured provider is ready.

### Validation and Regression Evidence

- `rtk npm run -s typecheck`
- `rtk npm run -s test -- src/tests/workspace-file-storage.hook.spec.tsx src/tests/store-history.hook.spec.tsx src/tests/app.ui.undo-redo-global.spec.tsx src/tests/app.ui.networks.spec.tsx --run`

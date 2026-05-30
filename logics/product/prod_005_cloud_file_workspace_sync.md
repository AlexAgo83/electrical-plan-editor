## prod_005_cloud_file_workspace_sync - Cloud file workspace sync
> Date: 2026-05-30
> Status: Draft
> Related request: TBD
> Related backlog: TBD
> Related task: TBD
> Related architecture: TBD
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
The product direction is to let users move an Electrical Plan Editor workspace between computers, and optionally mobile devices, by linking the app to a user-owned workspace file stored in a cloud drive.

The sync model should stay file-based rather than account-based. Users keep control of their data through iCloud Drive, Dropbox, Google Drive, OneDrive, or another filesystem-backed sync provider. The app reads and writes a structured workspace JSON file, while browser `localStorage` remains a local cache and fallback.

This direction avoids a hosted backend, avoids app accounts, and fits the current snapshot persistence model. It should feel like working on a normal project file: open a workspace file, edit, autosave, then open the same file from another device after the cloud provider has synced it.

```mermaid
flowchart LR
    Local[Local browser cache] --> Open[Open workspace file]
    Open --> File[Cloud-synced workspace JSON]
    File --> Edit[Edit in app]
    Edit --> Autosave[Autosave to linked file]
    Autosave --> Cloud[Cloud drive sync provider]
    Cloud --> Other[Open same file on laptop or phone]
```

# Product Problem
Today, workspace persistence is local to one browser profile. A user can work comfortably on one laptop, but moving to another laptop or a phone requires manual import/export discipline.

That creates friction in common situations:
- continuing work from laptop 1 on laptop 2;
- reviewing a plan on a phone or tablet;
- keeping a project file in the same place as other project documents;
- avoiding accidental divergence between browser-local copies;
- recovering work when changing machines or browser profiles.

The product problem is not real-time collaboration. The immediate need is portable personal continuity across devices with minimal infrastructure.

# Target Users and Situations
Primary users:
- engineers or operators who work across more than one computer;
- users who store project documents in a cloud drive;
- users who occasionally need to inspect or continue a plan from a phone or tablet.

Typical situations:
- start a harness plan on a work laptop and continue on a home or workshop laptop;
- keep one project workspace file next to exports, BOM files, and reference documents;
- send or share a workspace file through an existing cloud-drive workflow;
- recover the latest workspace after browser storage is cleared or unavailable.

# Goals
- Support a user-owned workspace file as a first-class persistence target.
- Preserve local browser persistence as cache, fallback, and offline safety net.
- Let users open, save as, and relink workspace files without creating an app account.
- Autosave the current workspace to the linked file when browser capabilities allow it.
- Detect external file changes before overwriting a newer file version.
- Provide clear conflict choices instead of silent last-write-wins behavior.
- Keep the workspace file format versioned and migration-compatible with the existing persistence model.
- Provide graceful fallback for browsers and mobile environments with limited file API support.

# Non-Goals
- Build a hosted sync backend.
- Add user accounts, cloud storage credentials, or server-side workspaces.
- Implement real-time multi-user collaboration.
- Merge concurrent edits automatically in V1.
- Depend on one specific cloud-drive vendor.
- Guarantee identical capability across all mobile browsers.
- Replace import/export network portability flows.

# Experience Direction
The app should expose file sync as a workspace-level capability, with quick actions where users work and deeper controls in Settings.

Primary workspace entry points:
- a header or workspace toolbar action named `Open workspace file`;
- a secondary action named `Save workspace file as...`;
- a compact status indicator showing `Local only`, `Linked to file`, `Saving`, `Saved`, `File changed`, or `Conflict`.

Settings should own configuration, diagnostics, and recovery controls in a section named `Workspace storage`, not `Sync`. The naming matters because the feature is file-backed storage through a user-owned cloud drive, not a hosted real-time sync service.

`Settings > Workspace storage` should include:
- current persistence mode: `Local only` or `Linked file`;
- linked file name and last known save time;
- file permission status when available;
- relink, unlink, and save-as actions;
- manual download/import fallback actions;
- conflict and write-failure details;
- optional inclusion rules for local UI preferences if that becomes configurable.

The basic flow:

```text
Local only
[Open workspace file] [Save workspace file as...]

User chooses my-project.epe.json from a cloud drive folder.

Linked to file: my-project.epe.json
Saved 14:32
```

When the app cannot keep a durable file permission, the experience should degrade to explicit import/export:

```text
This browser cannot autosave directly to the selected file.

[Download latest workspace] [Import updated workspace]
```

The user should not need to open Settings for the common path of opening or saving a workspace file. Settings exists to explain and manage the storage relationship after the workspace is linked.

# Workspace File Model
The workspace file should store a full application snapshot, not a partial export of one network.

Recommended V1 payload:

```json
{
  "payloadKind": "electrical-plan-editor.workspace-file",
  "schemaVersion": 1,
  "appVersion": "1.11.1",
  "appSchemaVersion": 1,
  "workspaceId": "workspace_...",
  "revisionId": "rev_...",
  "createdAtIso": "2026-05-30T12:00:00.000Z",
  "updatedAtIso": "2026-05-30T12:30:00.000Z",
  "state": {}
}
```

The file format should be intentionally close to the existing persisted state snapshot:
- reuse current state migration and validation paths where possible;
- keep app schema and file schema separate;
- include a stable `workspaceId` for user-facing identity;
- include a `revisionId` for conflict detection;
- include `createdAtIso` and `updatedAtIso` for transparency and recovery.

# Persistence Behavior
Local storage remains useful even when a file is linked.

Recommended behavior:
- app boot loads from local storage unless the user explicitly opens a workspace file;
- opening a workspace file imports the file snapshot into app state and local cache;
- linked-file metadata is stored locally when the browser allows persistent handles;
- every app-state change saves to local storage first;
- if a linked file is writable, autosave then writes the latest snapshot to the file;
- if writing fails, the app keeps local changes and surfaces a non-blocking warning.

This keeps edits resilient if:
- the cloud drive is temporarily offline;
- the browser loses a file permission;
- the file provider has not finished syncing;
- the user is on a mobile browser with limited write access.

# Conflict Handling
V1 should avoid automatic merging.

Before writing to a linked file, the app should compare the last loaded file revision with the current file revision. If the file has changed externally, autosave must stop and surface a conflict state.

Required conflict choices:
- `Load file version`: replace local state with the newer file snapshot.
- `Keep local version`: overwrite the file with the current local snapshot.
- `Save local copy`: export the current local workspace to a new file.

The app should never silently overwrite a newer file revision. If exact revision comparison is unavailable, the app should fall back to `updatedAtIso` and conservative conflict detection.

# Browser Capability Direction
Preferred implementation:
- use the File System Access API where supported;
- use `showOpenFilePicker`, `showSaveFilePicker`, `FileSystemFileHandle.getFile`, and `createWritable`;
- store file handles in IndexedDB if persistent permission is available.

Fallback implementation:
- upload/import a workspace JSON file through an `<input type="file">`;
- download/export the latest workspace JSON;
- show explicit copy/update actions instead of claiming autosave.

Mobile should be supported opportunistically:
- reading a workspace file is more important than durable autosave in V1;
- the app should explain capability limits through status and actions, not long help text;
- if a mobile browser cannot preserve write access, the product should still allow manual import/export of the same workspace format.

# Safety and Trust
Required safeguards:
- validate and migrate workspace files before applying them to state;
- preserve a local backup before replacing local state from a file;
- preserve existing corrupted-persistence recovery behavior;
- use clear conflict states before destructive replacement;
- avoid cloud-provider-specific lock-in or hidden credentials;
- keep the file human-inspectable enough for recovery while treating manual edits as unsupported.

# Success Signals
- A user can create a workspace file on laptop 1, let their cloud drive sync it, and open the same workspace on laptop 2.
- The app clearly shows whether it is local-only or linked to a file.
- Autosave failures do not lose local changes.
- External file modification is detected before overwrite.
- The same workspace file can be imported/exported on browsers without durable file write support.
- Existing localStorage persistence, migrations, import/export, and recovery tests remain stable.

# Scope and Guardrails
In:
- full-workspace file format;
- open workspace file;
- save workspace file as;
- linked-file autosave where browser support exists;
- local fallback cache;
- conservative conflict detection;
- manual import/export fallback for limited browsers.

Out:
- cloud-provider SDK integrations;
- account pairing or QR-code device linking;
- real-time collaboration;
- operation-log sync;
- CRDT or merge engine;
- server-side backups;
- mobile parity guarantees beyond supported browser APIs.

# Key Product Decisions
- Prefer a user-owned file over hosted sync to avoid accounts, backend operations, and vendor storage decisions.
- Use full snapshots in V1 because the current app already persists and migrates full application state.
- Treat `localStorage` as a cache/fallback rather than the source of truth once a file is linked.
- Prefer explicit conflict resolution over automatic merge or last-write-wins.
- Keep the workspace file distinct from network import/export files: workspace files represent the whole app state; network exports remain portability artifacts for selected network bundles.
- Put common open/save/status affordances in the header or workspace toolbar, while putting durable configuration and diagnostics under `Settings > Workspace storage`.

# References
- `src/adapters/persistence/localStorage.ts`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `src/app/store.ts`
- `logics/request/req_004_network_import_export_file_workflow.md`
- `logics/request/req_011_pwa_enablement_installability_and_offline_reliability.md`
- `logics/request/req_015_runtime_robustness_persistence_empty_workspace_semantics_and_ci_release_safety.md`
- `logics/request/req_113_technical_debt_hardening_persistence_safety_performance_and_architecture_quality.md`

# Open Questions
- Should linked-file metadata live in IndexedDB, localStorage, or a small persistence sidecar?
- Should opening a workspace file replace the whole current app state immediately, or show a preview summary first?
- Should the app support multiple recent workspace files, or only one linked file in V1?
- What is the minimum acceptable mobile behavior for the first release?
- Should workspace files include local UI preferences, AI provider settings, and onboarding state, or only modeling/project state?

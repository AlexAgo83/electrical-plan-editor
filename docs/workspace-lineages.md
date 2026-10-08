# Named workspaces, version history and supplier archives

This document is both the **user workflow guide** and the **portable format contract** for named
workspace lineages (delivered by `req_167` / `task_164`).

## 1. User workflow

### Where to manage workspaces

**Settings > Workspace storage** is the single management surface (since the `req_168`
consolidation, reorganised by `req_169`). It is organised in three stacked groups, each with one
main action (stronger outline) and secondary actions:

| Group | Actions |
| --- | --- |
| **Current workspace** | Workspace selector (switch), save status and export hint, main action **Save** (Ctrl/Cmd+S), then **Rename** and **New workspace**. |
| **Versions and handoffs** | Summary of the latest version (label, title, date) with the version and handoff counts, main action **Create version**, then **History** (read-only consultation, resume, version download, handoff files) and **Record supplier handoff**. |
| **Transfer and recovery** | **Export package (ZIP)**, **Import package (ZIP)**, **Open workspace folder** (when the browser supports folders), **Reconnect folder** (folder workspaces); **Import old workspace files** sits under **Advanced** once a workspace exists. The preserved previous browser content, when there is one, is shown here as a neutral recovery copy with **Download preserved snapshot** / **Dismiss**. |

Recovery messages that need attention (choose the working state after a divergence, reconnect a
folder, recover interrupted publications, missing files) appear at the top of the section with
their action.

Outside Settings there is no permanent workspace bar:

- **Home** has a **Named workspaces** panel: with an empty library it offers **Create your first
  workspace** (opens the creation dialog directly); otherwise it shows the workspace selector (the
  active workspace, same themed field as in Settings) and the *other* workspaces as compact rows
  (name, version count, last save; most recent first). Clicking a row resumes that workspace and
  opens Modeling. **Manage workspaces** opens and focuses Settings > Workspace storage. The **Active
  network** panel lists the recent changes of the active network, and **Quick start** holds the
  network actions.
- While a version is open read-only, a single banner appears under the header on every screen,
  Settings included, with **Return to working copy** and **Resume from this version**; Settings
  explains why its editing actions are disabled instead of repeating the banner. Visiting screens
  never raises a "Read-only version" message; only an actual edit attempt does.
- The operations panel shows the active workspace, its save status and export hint with
  **Manage workspaces**.
- **Ctrl/Cmd+S** saves the active working copy from any screen.

### Single-file compatibility (sessions without a named workspace)

When no named workspace is active, the section shows a **Single-file compatibility** subsection
with the previous tools: current save location, **Open workspace file**, **Save as file / Save as
copy**, **Resume last file**, **Use a file for autosave**, linked-file **Save now** /
**Stop autosave link**, the linked-file conflict choices (**Load file version**, **Keep local
version**, **Save local copy**) and storage details. These tools are collapsed under a summary
showing the current save location, and open automatically while a file is linked, a conflict is
pending or a Settings search is active. The only create action is **New workspace** in Current
workspace (it starts from the current content by default); no disabled selector or "no named
workspace" chip is shown. The Home quick-start **Save workspace file** / **Open workspace file**
shortcuts and **Start from empty content** are shown only in this mode; with a named workspace
active, Quick start offers **Clear current content** (the working copy is emptied, versions are kept,
the change can be undone).

When a named workspace is active, these single-file controls (and their Settings search entries)
are hidden: saving, status and portability come from the named workspace (ZIP package, version
download). Nothing is deleted when controls are hidden: old schema files still open, stored file
handles, preserved snapshots and recovery data are kept.

### Named workspaces

A *named workspace* (lineage) is an independent project line, for example **Series harnesses** and
**Prototype harnesses**. There is no fixed limit on how many you create.

- **New workspace** (Settings > Workspace storage): enter a name, start from the current content or empty,
  and choose where it lives:
  - **A folder on disk** (recommended, Chromium-based browsers): pick a parent folder; the app
    creates one sub-folder per workspace (`serie/`, `protos/`). Copying the parent folder copies
    every workspace with its history.
  - **This browser only**: the workspace stays in the browser library (IndexedDB). Export a ZIP
    package to copy it to another computer.
- **Switch** with the selector on Home or in Settings > Workspace storage, or with a workspace row
  on Home.
  Unsaved work of the workspace you leave is preserved first; if that is impossible (storage full,
  folder permission revoked) the switch is refused. Undo/redo history never crosses workspaces.
- **Rename** (Current workspace group) changes only the display name; identity, folder and file names stay.

### Save versus Create version

| Action | Effect |
| --- | --- |
| **Save** / **Ctrl/Cmd+S** | Updates the working copy (`<slug>-travail.epe.json`). Never creates a numbered version. In browser-only mode it commits to the browser library *and* initiates a ZIP package download, reported as "download initiated" (not as a verified file). |
| Autosave | A recovery copy of unsaved work is kept in this browser per workspace, then the working copy is updated. |
| **Create version** | Freezes the complete current work as an immutable numbered milestone (`v001`, `v002`…) with optional label and comment. Repeated clicks cannot create duplicates. |

The status chip distinguishes: *Unsaved changes*, *Unsaved changes · recovery copy in this browser*,
*Recovered unsaved changes*, *Unsaved changes · not protected*, *Saved to folder HH:MM (verified)*,
*Stored in this browser HH:MM* (success: the normal state of a browser-only workspace), *Package
download initiated*, *Conflict* and *Not saved: reason*. Times and dates follow the application
language (EN/FR), not the browser locale.

For browser-only workspaces, an **export hint** is shown next to the status with **Export now**
while changes have not been exported as a ZIP package. It is neutral, and becomes a warning only
when the last package export — or the workspace creation, if it was never exported — is older than
**7 days** (`EXPORT_REMINDER_WARNING_AFTER_DAYS` in `src/app/lib/lineage/lineageStatus.ts`). On Home,
such a workspace row shows *Export overdue*. The last export date is kept in the browser library
record (`lastPortableExportIso`, optional; records written before 1.19.2 fall back to the creation
date).

### History, read-only consultation and resume

**History** lists versions newest first with number, date, label, comment, provenance (legacy
import source, parent, "resumed from"; technical device identifiers are not displayed), supplier
handoff markers and a text filter. The toolbar holds **Record supplier handoff** and **Export
package (ZIP)**. Each row has one main action, **Open read-only**, and a **More** menu (keyboard:
Enter or Arrow Down opens it, arrows / Home / End move, Escape closes it and keeps the dialog open)
with **Download file**, **Record supplier handoff** and, after a separator and in the danger colour,
**Resume from this version**. Confirmation messages stay visible above the dialog.

- **Open read-only** shows a frozen version. The working session is suspended; every editing route
  (forms, canvas, undo/redo, imports, AI agent) and every background save is blocked. Navigation
  and exports stay available. **Return to working copy** restores the working state unchanged.
- **Resume from this version** first writes the displaced working copy to `Recovery/` and verifies
  it; any failure or cancellation aborts. Published versions are never modified. Example: resuming
  `v002` after `v005` keeps `v003`–`v005`, and the next milestone is `v006` with
  "resumed from v002".
- **Download file** downloads the exact version file; it opens on its own as a workspace file.

### Supplier handoffs

**Record supplier handoff** binds a frozen version (or freezes the current work first) to a
recipient (use anonymized examples such as *Supplier A*), a declared date and a note, and can keep
the **exact delivered files** (PDF, BOM, …). The application sends nothing and does not verify
delivery. Files are stored byte-for-byte with name, size and SHA-256; they are only ever downloaded,
never opened or rendered. A record without files is shown as "record only, no archived files".
Corrections create a new record that *supersedes* the earlier one; nothing is overwritten.

### Transfer between computers

- **Folder mode**: copy the workspace folder (or the parent holding several workspaces) and use
  **Open workspace folder** on the other computer. The full working state, history and handoff files
  are reconstructed without the original browser data.
- **ZIP mode**: **Export package (ZIP)** and **Import package (ZIP)** (Settings > Workspace storage >
  Transfer and recovery; export is also available in History). One package
  contains one workspace; export two packages to move two workspaces.
- **Divergence**: if both copies continued separately, importing/opening detects it by IDs and
  recorded ancestry (never timestamps). Both working states are kept and you must **Choose working
  state**; the unchosen one stays in `Recovery/heads/`. Two different `v006` stay distinct and are
  labelled `v006 · <shortId> · <device>`; the next version is `v007`. No automatic merge.
- **Limits**: folders are not locked. Do not edit the same workspace folder from two computers at
  the same time through a sync service; the app detects concurrent working-copy changes
  (*Conflict*) and incomplete operations, but there is no distributed lock or atomic cloud sync.

### Importing old timestamped files

**Import old workspace files** previews `electrical-workspace-<timestamp>.epe.json` files (and older
persisted-state payloads). You choose the target workspace explicitly (never inferred from legacy
IDs). Dates come from the date stored in the file, otherwise from the file name — never from the
file-system date. Undated files must be placed by hand; files sharing a date require confirming the
order; identical content is flagged for an explicit skip/keep; unreadable files are listed and never
imported silently. Accepted files become numbered versions in the reviewed order (appended after
existing versions), with original file name, digest and source IDs recorded. The originals are only
read.

When named workspaces are first introduced, the previous browser workspace is preserved and can be
downloaded from Settings > Workspace storage > Transfer and recovery (**Download preserved
snapshot**). Empty content and the untouched built-in sample are not preserved; a sample-only
snapshot kept by an earlier release stays stored but is no longer announced.

## 2. Portable format contract

### Folder layout (identical in a ZIP package, under one root folder)

```
workspace-manifest.json
<slug>-travail.epe.json                                 working copy
Versions/<slug>-vNNN[-<label>]-<shortVersionId>.epe.json immutable versions
Handoffs/<handoffId>/handoff.json                       immutable handoff record
Handoffs/<handoffId>/files/<nn>-<safe-name>             exact delivered bytes
Recovery/working-previous.epe.json                      verified copy of the previous working file
Recovery/pre-restore-*.epe.json                         displaced work before a resume
Recovery/heads/*.epe.json                               alternative working heads (divergence)
Recovery/quarantine/*                                   same-ID/different-content objects
```

IDs are authoritative; slugs and file names are presentation. The slug is frozen at creation.
No file handle, browser permission, provider secret or UI preference is written to portable files.

### Workspace file (`electrical-plan-editor.workspace-file`, schema 2)

Schema 2 is a superset of schema 1 (still readable). Fields: `workspaceId`, technical `revisionId`
(new on every save, never a business version), timestamps, full `state`, plus optional:

- `lineage`: `{ displayName, slug }`
- `working`: `{ baseVersionId, restoredFromVersionId, ancestorRevisionIds[≤64] }` — ancestry used
  to prove fast-forwards.
- `version`: `{ versionId, displayNumber, parentVersionId, restoredFromVersionId, title, comment,
  createdAtIso, deviceLabel, operationId, provenance }` where provenance is `created` or
  `legacy-import` (`originalFileName`, `originalDigest`, `sourceWorkspaceId`, `sourceRevisionId`,
  `orderingSource`, `orderingDateIso`). Imported legacy versions have no fabricated parent.

A future schema is rejected with an explicit message and no state change. Source bytes of a version
are never rewritten by in-memory migration.

### Manifest (`electrical-plan-editor.workspace-manifest`, schema 1)

`workspaceId`, `displayName`, `slug`, `manifestRevisionId`, `workingFileName`, and indexes
`versions[]` (number, file, digest, ancestry, provenance), `handoffs[]` (record path and digest),
`recovery[]` and `divergentHeads[]`. Version numbers are allocated as **max known number + 1**
(never count + 1) when an explicit version commits.

### Handoff record (`electrical-plan-editor.supplier-handoff`, schema 1)

`handoffId`, `workspaceId`, `versionId`, `recipient`, `handoffDate` (declared, `YYYY-MM-DD`),
`note`, `createdAtIso`, `supersedesHandoffId`, `attachments[]` (`originalFileName`, `storagePath`,
`mimeHint`, `byteLength`, `sha256`).

### Commit protocol and failure semantics

- Every write is read back and compared before it counts; only then is a disk save reported.
- Writes are serialized per workspace; asynchronous saves carry a session token so a delayed write
  after a switch or during read-only consultation is dropped.
- Ordinary save: previous valid working file → `Recovery/working-previous.epe.json` (verified) →
  new working file (verified). An interrupted replacement is recovered on the next open.
- Version / handoff: immutable files are staged and verified **before** the manifest is published.
  A failure leaves an *orphan* that is reported ("interrupted publication") and adopted on retry;
  operation IDs make retries idempotent.
- Missing or corrupt files are isolated and shown; other versions stay usable. A missing manifest is
  reconstructed from the files. Durable history is never pruned automatically.
- Imports validate everything before activation: safe relative paths (no absolute, traversal or
  duplicate normalized/case-folded paths), supported schemas, declared SHA-256 digests, ownership of
  versions/handoffs, a required working copy, and decoded-size limits.

### Package limits (single configuration: `src/app/lib/lineage/lineageLimits.ts`)

| Limit | Value |
| --- | --- |
| Entries | 10 000 |
| Total uncompressed content | 500 MiB |
| Per attachment / entry | 100 MiB |
| Per-entry compression ratio | 100:1 |

Limits are enforced on the actual decoded byte stream, not only on ZIP metadata. ZIP64, encryption
and multi-disk archives are rejected. The ZIP codec is in-house (`zipArchive.ts`, no dependency,
no bundle-size increase from a library) and uses the platform `CompressionStream("deflate-raw")`,
falling back to uncompressed entries.

## 3. Validation evidence (2026-10-07)

- Automated: `src/tests/workspace-lineage-*.spec.ts`, `src/tests/app.ui.workspace-lineages.spec.tsx`,
  `src/tests/store.persistence-durability.spec.ts`, `tests/e2e/workspace-lineages.spec.ts`.
- Tested environments: Vitest/jsdom on Node 24.21 (folder mode exercised through an in-memory File
  System Access handle with permission and write-failure simulation); Playwright 1.61.1 with
  Chrome Headless Shell 149 (browser-library mode, IndexedDB, ZIP export, clean-context import,
  reload). No manual run against a real OS folder picker was performed in this delivery; folder
  access in Firefox/Safari is not available and those browsers use the browser-only + ZIP mode.
- Large history (100 versions × 150 wires, `workspace-lineage-performance.spec.ts`, Node 24 / WSL2):
  raw lineage 24.89 MiB, ZIP 1.46 MiB; open (manifest + working copy, zero version files read)
  2.6 ms; history list 0.1 ms; lazily reading one version 1.9 ms; package export 222 ms. These are
  observations, not hardware-independent thresholds.

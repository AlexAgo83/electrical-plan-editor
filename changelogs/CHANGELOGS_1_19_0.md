# Changelog (`1.18.2 -> 1.19.0`)

## Major Highlights

- Named workspaces: keep independent project lines (for example Series and Prototype harnesses) side by side, each with its own working copy, numbered immutable versions and history.
- Supplier handoffs: record which frozen version was delivered to whom and when, with byte-exact copies of the delivered PDF/BOM files.
- Portable history: copy a workspace folder or exchange a ZIP package between computers without losing versions, provenance or archived deliveries.

## Patch Notes

- Added a persistent workspace selector with a save status that distinguishes unsaved changes, local recovery copies, verified folder saves, pending package exports and failures; Home now shows resume cards.
- Save and Ctrl/Cmd+S update the working copy only; Create version freezes a numbered milestone (`v001`, `v002`, …) with optional label and comment, protected against duplicate submissions.
- History lists versions with filtering, provenance and handoff markers; versions open read-only (all editing, undo/redo, imports, AI agent changes and background saves are blocked) and can be resumed after the current work is preserved in `Recovery/`.
- Workspaces can live in a folder on disk (Chromium-based browsers) or in the browser library with ZIP export/import; divergent copies are detected by IDs and ancestry, both states are kept and an explicit choice is required.
- Old timestamped workspace files can be adopted through a reviewed preview (target, order, duplicates, undated and unreadable files) without modifying the originals.
- Workspace files move to schema 2 (schema 1 remains readable; newer schemas are rejected safely). Format contract and workflow: `docs/workspace-lineages.md`.
- Completed the semantic EN/FR localization migration and retired the runtime translation compatibility layer.
- Updated runtime and development dependencies and cleared open npm advisories.

## Verification

- Local `npm run ci:blocking` before push.
- GitHub Actions CI on `main`.

## Notes

- Builds on `1.18.2`.
- Folder mode was validated with a simulated File System Access handle and headless Chromium; no manual run against a native OS folder picker was performed for this release.

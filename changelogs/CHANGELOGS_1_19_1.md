# Changelog (`1.19.0 -> 1.19.1`)

## Major Highlights

- Named workspaces are managed from one place: Settings > Workspace storage.
- The always-visible workspace bar is gone; switching stays available on Home and in Settings.

## Patch Notes

- Settings > Workspace storage groups every named workspace action: Current workspace (selector, save status, Save, Rename, New workspace), Versions and handoffs (Create version, History, Record supplier handoff) and Transfer and recovery (ZIP export/import, open or reconnect a folder, import old workspace files). Recovery messages (divergent working state, folder permission, interrupted publications, missing files, preserved previous browser workspace) appear at the top of the section with their action.
- Home keeps the resume cards, adds the workspace selector and a Manage workspaces shortcut that opens and focuses the storage settings. Outside Settings, a warning with Return to working copy is shown only while a version is open read-only.
- The workspace selector uses the theme form field (rounded corners, theme font and colors); lineage status colors now come from shared theme tokens instead of fixed hues, and lineage dialogs follow the selected theme.
- Single-file autosave, link, resume and conflict tools are shown only for sessions without a named workspace, in a Single-file compatibility subsection that also offers to create a named workspace from the current content. No stored file, handle or recovery data is removed; old workspace files still open.
- Settings search only lists the storage actions available in the current mode, and the match count is localized in English and French.
- Updated development dependencies through the npm dev minor/patch Dependabot group (`@types/node`, `typescript-eslint`, `vite`).
- Release contract now requires the GitHub release gate before production deployment.

## Verification

- Local `npm run ci:blocking` before push.
- GitHub Actions CI on `main`.

## Notes

- Builds on `1.19.0`.
- Workflow guide: `docs/workspace-lineages.md`.

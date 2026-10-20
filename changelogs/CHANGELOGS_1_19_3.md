# Changelog (`1.19.2 -> 1.19.3`)

## Major Highlights

- Newly created folder workspaces stay connected: creation no longer reports success without a usable folder, and reloading keeps the folder link.
- Reconnecting a folder is reliable and safe: a separate Choose folder… action opens the system picker directly, and reconnection never overwrites edits made on disk or in the editor.

## Patch Notes

- Creating a folder-backed workspace keeps the freshly initialized folder even when the browser cannot read the stored folder link back immediately; a failure to store the link is reported before any file is created, and retrying does not create a duplicate workspace.
- Settings > Workspace storage > Transfer and recovery offers Reconnect folder (reuses the stored access without a permission prompt) and Choose folder… (opens the system picker from the click). Reloading the page never asks for permission on its own.
- Reconnection accepts the workspace folder itself or its original parent folder when exactly one child belongs to the active workspace. Empty, unrelated, unsupported, corrupt or duplicated candidates are rejected with precise guidance and are never modified.
- Reconnecting keeps unsaved edits and does not save them; click Save afterwards. If the disk copy changed in the meantime, both states are kept and Choose working state resolves it explicitly. A cached older base is no longer rebased onto the disk copy after reload.
- Cancelling the picker is neutral (no failure message). Permission required or denied, unsupported folder access, wrong or missing workspace and read/write failures each have their own English and French message.
- Save and reconnect no longer stay blocked with "already in progress" after a save was interrupted by a workspace change.

## Verification

- Local `npm run ci:blocking` before push.
- GitHub Actions CI on `main`.
- Real system folder picker run on Chromium 149: create, edit, Save, reload, Save, reconnect through the parent folder, edit, Save, disk contents verified.

## Notes

- Builds on `1.19.2`; delivered by `task_167` (`req_170`).
- Portable workspace, manifest and package formats are unchanged.
- Workflow guide: `docs/workspace-lineages.md` (section "Reconnecting a folder").

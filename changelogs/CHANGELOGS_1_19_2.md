# Changelog (`1.19.1 -> 1.19.2`)

## Major Highlights

- Home and Settings > Workspace storage are clearer: no overlapping panels, every workspace button follows the theme, and each group has one obvious main action.
- Workspace status is truthful and calm: a browser-only save reads as saved, and the export reminder only becomes a warning after 7 days without a package export.
- The History dialog has one main action per version (Open read-only) and a More menu for the rest, with Resume from this version clearly marked as risky.

## Patch Notes

- Home no longer overlaps or clips its panels on desktop (980 to 1920 px), whatever the number of named workspaces; What's new follows the column height.
- Home vocabulary distinguishes the Named workspaces panel, the Active network panel and the single-file shortcuts. An empty library offers Create your first workspace, which opens the creation dialog directly. Other workspaces appear as compact rows (name, version count, last save, most recent first); clicking a row resumes it. The active workspace stays in the selector.
- Quick start labels follow the mode: Clear current content with a named workspace; Start from empty content, Save workspace file and Open workspace file otherwise.
- Settings > Workspace storage: current workspace header with save status and a primary Save; versions summary with the latest version label, title and date and correctly pluralized counts; compact transfer actions with Import old workspace files under Advanced; in legacy mode, a single New workspace action and the single-file tools collapsed unless a file link or conflict is active.
- Browser-only workspaces show a success status and a separate export hint with Export now; the hint becomes a warning when the last package export (or the creation, if never exported) is older than 7 days. Home rows show Export overdue in that case.
- The preserved previous browser workspace is shown only when it holds real content (never the untouched sample), as a neutral recovery copy in Transfer and recovery with Download and Dismiss.
- Lineage times and dates follow the application language (English or French) instead of the browser locale.
- While a version is open read-only, one themed banner with Return to working copy and Resume from this version is shown on every screen; Settings explains why editing actions are disabled. Visiting Modeling or other screens no longer raises a Read-only version message; real edit attempts still do and remain blocked.
- History: Download file, Record supplier handoff and Resume from this version move to a keyboard-accessible More menu; the storage line and technical device identifiers are no longer shown; the filter keeps a normal look at rest; confirmation messages stay above the dialog.

## Verification

- Local `npm run ci:blocking` before push.
- GitHub Actions CI on `main`.

## Notes

- Builds on `1.19.1`; delivered by `task_166` (`req_169`).
- The browser workspace library now records the last package export date (optional field); portable workspace, manifest and package formats are unchanged.
- Workflow guide: `docs/workspace-lineages.md`.

# Changelog (`1.20.0 -> 1.21.0`)

## Major Highlights

- Endpoint material references on plans: connector and splice callouts can show the effective connection (contact) and seal reference of each wire, for this side and/or the opposite side, in the drawing and in SVG/PNG/PDF exports.
- Direct workspace folder access: Open workspace folder now sits in Current workspace next to Save, Rename and Copy.

## Patch Notes

- Settings > Canvas tools preferences: four independent EN/FR checkboxes (connection reference – this side, seal reference – this side, connection reference – opposite side, seal reference – opposite side), all off by default so existing plans keep their appearance. They apply immediately, persist with the other display preferences, never change wires or mark the workspace unsaved, and are found by Settings search (connection/contact, seal/joint, local/opposite).
- "This side" is the wire end on the callout's own connector or splice; "opposite side" is the other end of the same wire, including on splice rows, self-loops and shared cavities. Swapping A/B with its metadata keeps references on the right physical end.
- Displayed codes are the effective ones, as in the BOM: the wire's manual value first, otherwise the connector cavity / catalog terminal material. Turning off catalog seals on a connector suppresses the automatic seal but keeps a manual one. Splice ends only show explicit values. A missing reference shows `—` and never borrows the other end.
- Reference columns (Local contact / Local seal beside Pin, Opp. contact / Opp. seal beside End ID / PIN) wrap long codes on several lines instead of truncating them; callout size, export bounds and the layout cache follow the enabled columns, the values and the app language.
- BOM endpoint material resolution is now shared with callouts; BOM output is unchanged.
- Settings > Workspace storage > Current workspace: order Save, Rename, Copy, Open workspace folder, New workspace. The action is also available when no workspace is active, is disabled while busy or not ready, and is no longer duplicated under Transfer and recovery. Unsupported browsers keep the folder access explanation in Current workspace. Opening a folder registers its workspaces in the selector without switching to them or discarding unsaved work; Reconnect folder, ZIP import/export and Copy are unchanged.

## Verification

- Local lint, typecheck, `quality:i18n`, Vitest fast and UI lanes, Playwright e2e and `build:vite` before push.
- GitHub Actions CI on `main`.

## Notes

- Builds on `1.20.0`; delivered by `task_169` (`req_172`).
- Guides: `README.md` (callout reference columns) and `docs/workspace-lineages.md` (Current workspace actions).
- No dedicated browser scenario yet for the new callout columns or the 360 px wrap of Current workspace actions.

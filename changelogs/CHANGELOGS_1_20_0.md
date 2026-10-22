# Changelog (`1.19.3 -> 1.20.0`)

## Major Highlights

- Plan issue traceability: each network carries its own plan revision (for example `A`, `B02`, `03`) and plan issue date, shown in the export cartouche next to the creation date.
- Proactive routing checks: Validation warns when Network Scope > Recompute routes would change stored routes, lengths or directional splice sides, without ever changing the design on its own.
- Everyday workspace confidence: a Copy action downloads a portable snapshot of the current workspace, and the active workspace name is always visible next to the application brand.

## Patch Notes

- Network create/edit forms accept, validate and clear an optional plan revision (up to 40 characters) and plan issue date (a real calendar date). Neither value is ever inferred or updated automatically (Save, export, recompute, versions); existing plans start unset. EN/FR labels.
- Plan issue metadata survives undo/redo, reload, workspace save/open/copy, versions and network export/import/duplicate. Files without the fields still open; invalid imported values are dropped with an import warning. Workspace and network file schemas are unchanged.
- SVG, PNG and PDF exports with the identity cartouche show Revision / Indice and Issue date / Date de diffusion from the exported network. The issue date is printed exactly as entered (no timezone shift); unset values are omitted like other optional metadata.
- The manual recompute report now lists every persisted routing change: ordered route, length, endpoint route details and directional splice side transitions, including previously unset sides.
- New Validation category Routing consistency (Cohérence du routage): one network warning with the number of affected wires and a Go to that opens Network Scope on Recompute routes, plus one warning per affected wire with its technical ID and changes. If the full recompute itself fails, a single "check unavailable" warning is shown instead of an all-clear. The Validation summary shows the check status (checking, consistent, wires would change, unavailable).
- The routing check runs 500 ms after the latest routing edit (and after restore, import, workspace activation and network switch) in small idle-time slices, reuses cached results (for example after undo) and ignores selection, viewport, language, naming and metadata changes. It never edits the model, marks the workspace unsaved, records history or opens the recompute report.
- Settings > Workspace storage > Current workspace: Copy (Copier) next to Save, Rename and New workspace downloads one `.epe.json` file with every network and unsaved edits. It does not save, create a version or register a new workspace, works without folder write permission, and keeps the workspace identity for portable reopening. While a version is consulted read-only, Copy downloads only that displayed version.
- The header shows the current workspace right after e-Plan Editor on every screen, with loading, unnamed and read-only version states; long names are shortened with the full name in the tooltip and for screen readers. At 360 px the name stays visible next to the menu, Settings and Ops buttons; on narrow screens the docked entity shortcuts move to a second header row.
- Updated Vitest to 4.1.12 (development dependency security advisories).

## Verification

- Local `npm run ci:blocking` before push.
- GitHub Actions CI on `main`.
- Routing check performance measured in Chromium on 300- and 1,500-wire networks (10 runs each): no diagnostic task above 50 ms and no measurable input-latency impact above 50 ms p95.

## Notes

- Builds on `1.19.3`; delivered by `task_168` (`req_171`).
- Guides: `docs/workspace-lineages.md` (Copy, header workspace name) and `README.md` (plan metadata, routing consistency).

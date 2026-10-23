# Changelog (`1.21.0 -> 1.22.0`)

## Major Highlights

- Manufacturer and supplier plan references: each network can record a manufacturer and a supplier, each with an editable company name and the reference that company gives this network plan, and both appear in the export cartouche of SVG/PNG/PDF plans.

## Patch Notes

- Network Scope create/edit form: two EN/FR groups, Manufacturer plan reference and Supplier plan reference, each with a company name (up to 80 characters) and a reference (up to 120 characters). All four inputs are optional, including name-only and reference-only. Placeholders are generic; no company name is built in.
- Values are kept literally (case, punctuation, internal spaces, leading zeroes) and are single-line; blank values are unset. Saving changes only the edited network, through the usual save and undo/redo history; cancel, reopen, network switch and create never carry another network's values.
- The values identify the whole network plan and are unrelated to component catalog references, wire endpoint material references, BOM references, technical IDs, project code or plan revision.
- Export cartouche: one row per filled role, after the plan revision and issue date, manufacturer before supplier: `Manufacturer (Manufacturer A): MFG-001`, `Manufacturer: MFG-001` with only a reference, `Manufacturer (Manufacturer A)` with only a name (French: `Fabricant`, `Fournisseur`). Company names and references are never translated, and a role with no value is omitted. A disabled cartouche shows none of these rows.
- Long names and unbroken 120-character codes wrap on several lines instead of being truncated; the cartouche keeps logo and notes clear and grows the export height when needed. Special characters (`&`, `<`, quotes) and non-Latin text are exported as literal text.
- The values survive duplicate, reload, workspace save/open, Copy, workspace versions and network export/import, including import conflicts. Older files without them load unchanged; malformed imported values are normalized with an import warning instead of dropping the network.

## Verification

- Local lint, typecheck, `quality:i18n`, dependency audit, Vitest fast and UI lanes, Playwright e2e, `build:vite` and the PWA gate before push.
- GitHub Actions CI on `main`.

## Notes

- Builds on `1.21.0`; delivered by `task_170` (`req_173`).
- Guide: `README.md` (network metadata and export cartouche).
- In a wrapped cartouche row, text copied out of the SVG has no space at the line break; the rendered plan is correct.

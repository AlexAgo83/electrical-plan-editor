# Changelog (`1.16.0 -> 1.16.1`)

## Major Highlights

- Wire list exports (CSV / XLSX and the in-app wire export preview) now report each splice end's **real connection material** instead of a single hardcoded reference, so the wire list and the BOM agree on the splice material for the same splice.
- Operator-set connection references on splice ends are now honored in the wire list, matching how connector ends already behave.
- Placement feedback warnings and blocking errors are now mutually exclusive, so a stale error no longer lingers next to a fresh non-blocking warning.

## Patch Notes

- Fixed wire list export emitting a hardcoded `"Preden 13mm"` connection reference for every splice-port wire end. The connection reference now resolves, in priority order, from the operator-set endpoint reference, then the splice catalog item's `manufacturerReference` (and name), then the splice's own `manufacturerReference`, and is left empty when no material exists (`src/app/lib/wireListExport.ts`).
- Threaded the splice map through `resolveWireExportEndpointMaterials` and `buildWireListSheet`, and updated the Modeling and Analysis wire export preview tables so the preview matches the downloaded file (`src/app/components/workspace/ModelingSecondaryTables.tsx`, `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`).
- Splice ends still carry no seal reference, and connector connection/seal resolution is unchanged.
- `withWarning` now clears any pre-existing blocking `lastError` while surfacing the warning, keeping the non-blocking warning channel distinct from blocking errors (`src/store/reducer/shared.ts`).
- Synced the root `VERSION` file with the released `1.16.1` version.

## Version 1.16.1 - Floating Splice Export Connection Reference Uniformity

### Export

- Wire list CSV/XLSX and the in-app wire export preview resolve splice connection references from the same catalog source the BOM uses, restoring cross-sheet uniformity for the floating-splice deliverable.
- Manual connection references on splice ends are preserved through the export.

### Feedback Channels

- Non-blocking placement warnings and blocking errors are now mutually exclusive by construction.

### Verification

- `npm run -s lint`
- `npm run -s typecheck`
- `logics-manager lint --require-status`
- `logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`
- `npm run -s ci:blocking`

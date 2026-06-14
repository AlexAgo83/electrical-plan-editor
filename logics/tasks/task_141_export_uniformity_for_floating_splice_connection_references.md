## task_141_export_uniformity_for_floating_splice_connection_references - Export uniformity for floating splice connection references
> From version: 1.16.0
> Schema version: 1.0
> Status: In progress
> Understanding: 98%
> Confidence: 95%
> Progress: 80%
> Complexity: Medium
> Theme: Export
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [x] `resolveEndpointConnectionMaterial` resolves splice-port ends from real splice data instead of the hardcoded `"Preden 13mm"`: manual endpoint connection reference/name first, then `splice.catalogItemId` -> `catalogItem.manufacturerReference` (+ name), then `splice.manufacturerReference`, then empty.
- [x] `resolveWireExportEndpointMaterials` and `buildWireListSheet` accept the splice map; both wire export preview callers pass it so the preview matches the downloaded CSV/XLSX.
- [x] Splice seal resolution and connector connection/seal resolution are unchanged.
- [x] `withWarning` clears any pre-existing blocking `lastError` while keeping the new warning.
- [x] Targeted tests cover splice-end connection resolution branches and warning/error channel exclusivity; existing export/persistence/reducer tests stay green.
- [ ] Logics lint, lint, typecheck, and the relevant focused tests pass (full local CI + remote CI pending).

# Implementation plan
- Step 1: In `src/app/lib/wireListExport.ts`, give `resolveEndpointConnectionMaterial` and `resolveWireExportEndpointMaterials` access to a `spliceById` map and a catalog map; resolve splice material via manual ref -> catalog `manufacturerReference` -> `splice.manufacturerReference`. Remove the `"Preden 13mm"` literal. Thread the splice map through `buildWireListSheet`.
- Step 2: Update `ModelingSecondaryTables.tsx` and `AnalysisWireWorkspacePanels.tsx` callers to pass the already-available `spliceById` map.
- Step 3: In `src/store/reducer/shared.ts`, make `withWarning` start from a state with `lastError` cleared (keeping the new `lastWarning`).
- Step 4: Add/extend tests: `src/tests/wire-list-export.spec.ts` for the four splice resolution branches and BOM parity; a reducer test for `withWarning` clearing `lastError`.
- Step 5: Run focused validation and the segmented CI gates touched by these files.

# Backlog
- `item_632_export_uniformity_for_floating_splice_connection_references`


```mermaid
%% logics-kind: task
%% logics-signature: task|export-uniformity-for-floating-splice-co|item-632-export-uniformity-for-floating-|1-confirm-scope|run-python3-m-logics-manager-lint-requi
flowchart TD
    Backlog[Backlog item] --> Build[Implementation]
    Build --> Validate[Validation]
    Validate --> Close[Finish workflow]
```

# Acceptance criteria
- AC1: For a wire end connected to a splice port, the wire list connection reference column resolves, in priority order: (1) the operator-set endpoint connection reference/name, then (2) the splice catalog item's `manufacturerReference` (and name) via `splice.catalogItemId`, then (3) `splice.manufacturerReference`, and is empty when none exist. The hardcoded `"Preden 13mm"` literal is removed.
- AC2: The resolved splice connection reference is identical across the wire list CSV, the XLSX export, and the in-app wire export preview tables (single shared resolver), and matches the splice material reported by the BOM for the same splice.
- AC3: Splice seal reference behavior is unchanged (splice ends have no seal material), and connector endpoint connection/seal resolution is unchanged.
- AC4: `withWarning` surfaces a warning while clearing any pre-existing blocking `lastError`, so the warning and error channels are mutually exclusive by construction (task_139 AC30), without clearing a freshly-set warning.
- AC5: Targeted unit/UI tests cover splice-end connection resolution (manual ref, catalog ref, bare `manufacturerReference`, none) and the warning/error channel exclusivity; existing export, persistence, and reducer tests stay green.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `npm run -s lint`.
- Run `npm run -s typecheck`.
- Run focused tests: `src/tests/wire-list-export.spec.ts`, `src/tests/csv.export.spec.ts`, `src/tests/store.reducer.entities.spec.ts`, and the relevant reducer/shared test.
- Run `npm run -s test:ci:fast -- --coverage` and `npm run -s test:ci:ui` when the export/UI surfaces are touched.
- Run `python3 -m logics_manager flow closeout task_141_export_uniformity_for_floating_splice_connection_references --validation "<evidence>" --lint` after implementation and evidence capture.

# Report
- Implemented in `src/app/lib/wireListExport.ts`: new `resolveSpliceConnectionMaterial` resolves a splice-port wire end via manual endpoint reference -> `splice.catalogItemId` catalog `manufacturerReference` (+ catalog `name`) -> `splice.manufacturerReference` -> empty; the hardcoded `"Preden 13mm"` literal is removed. `resolveEndpointConnectionMaterial`, `resolveWireExportEndpointMaterials`, and `buildWireListSheet` now thread a `spliceById` map.
- Callers updated to pass the existing splice map: `src/app/components/workspace/ModelingSecondaryTables.tsx` and `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`, so the in-app wire export preview matches the downloaded CSV/XLSX.
- `src/store/reducer/shared.ts`: `withWarning` now clears `lastError` while setting the new `lastWarning`, keeping the two feedback channels mutually exclusive (task_139 AC30).
- Tests: extended `src/tests/wire-list-export.spec.ts` (manual ref, catalog ref + name, bare `manufacturerReference`, none, splice ends carry no seal) and added `src/tests/store.shared-warning-channel.spec.ts` (error cleared on warning; fresh warning preserved).
- Local validation so far: `logics-manager lint --require-status` OK; `npm run -s typecheck` OK; `npm run -s lint` OK; focused vitest (`wire-list-export`, `store.shared-warning-channel`, `csv.export`, `app.ui.wire-export-preview`, `network-summary-bom-csv`, `store.reducer.entities/wires/rear-backshell`) all green.
- Remaining: full `npm run -s ci:local`, push, remote CI confirmation, and workflow closeout.

# AI Context
- Summary: Implement export uniformity for floating splice connection references.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_146_floating_splice_export_connection_reference_uniformity`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

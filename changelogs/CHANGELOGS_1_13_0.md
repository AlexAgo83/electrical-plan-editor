# Changelog (`1.12.5 -> 1.13.0`)

## Major Highlights

- Network import now detects every identity collision (network `id`, `technicalId`, `name`, or stripped `nameVariant`) and always asks the user for an explicit decision instead of silently renaming or dropping the incoming network.
- The overwrite dialog offers three per-candidate choices — **Overwrite existing**, **Skip**, **Keep both (rename incoming)** — all available regardless of match reason, with a default on **Overwrite existing**.
- Multi-candidate imports get a new **Apply to all remaining** bulk row; per-candidate clicks still override the bulk default.
- **Overwrite existing** now preserves the existing network's `id`, so intra-workspace references (harness assemblies, master connector refs, connector links) keep resolving after an overwrite.
- Every terminal import outcome surfaces user feedback: success/partial/failed toasts, an `info` "Import cancelled" toast on user cancel, and an `ImportFailureDialog` with copyable per-network reasons for parse, schema, resolved-zero, and reducer-level rejections.
- Reducer-level rejections (`empty name`, `payload incomplete`, `ID already exists`, `technical ID already exists`) are now collected per-network in `ui.lastImportRejections` and surfaced to the user instead of being dropped silently.

## Version 1.13.0 - Network Import Conflict Resolution and Explicit Feedback

### Conflict detection

- `detectOverwriteCandidates` now matches imported networks against existing ones by raw `id` in addition to `technicalId`, `name`, and `nameVariant`.
- When several reasons apply to the same imported network, the strongest reason is reported (priority: `id` > `technicalId` > `name` > `nameVariant`).

### Overwrite dialog

- Replaced the binary overwrite/import-as-new toggle by three per-candidate radios: **Overwrite existing**, **Skip**, **Keep both (rename incoming)**.
- Added a bulk row **Apply to all remaining** with the same three actions, displayed when at least two candidates are present.
- Bulk actions only affect candidates that have not yet been resolved individually; later per-candidate clicks override the bulk default.
- Default highlighted choice is **Overwrite existing**.

### Import semantics

- `resolveImportConflicts` now consumes a typed `ImportDecisionMap` (`overwrite` / `skip` / `keep-both`) instead of the previous binary `overwriteMap`.
- **Overwrite existing** reuses the existing network's `id` in the upsert, preserving intra-workspace references.
- **Skip** leaves the existing network untouched and lists the candidate in `summary.skippedNetworkIds`.
- **Keep both** runs the existing `-import` / `-IMP` suffix dedupe path and lists the rename in `summary.warnings`.
- A colliding network without an explicit decision now produces a `summary.errors` entry instead of silently renaming.

### Reducer rejection visibility

- Added `ImportRejection` type and `ui.lastImportRejections?` slice on `AppState`.
- `network/importMany` collects every per-network rejection (empty name, id/technicalId collision under overwrite, payload incomplete, metadata error) and surfaces them all-or-nothing in `lastImportRejections` plus an enriched `lastError`.

### Feedback contract

- File read / parse / schema / resolved-zero failures emit an `error` toast and open `ImportFailureDialog` with the reason list.
- Partial imports emit a `warning` toast with the existing `{imported}/{skipped}/{warnings}/{errors}` summary.
- Clean successes emit a `success` toast with the imported count.
- Reducer-level rejections emit a `warning` toast and open `ImportFailureDialog` with the per-network identity + reducer-side reason list.
- Cancelling the overwrite dialog emits an `info` toast "Import cancelled" and leaves the workspace state untouched.

### Refactor

- Extracted reducer helpers (`cloneScopedState`, `hasDuplicateNetworkTechnicalId`, `normalizeNetworkMetadata`, `normalizeOptionalText`) to `src/store/reducer/helpers/networkClone.ts`.
- Extracted the per-network import validation loop to `src/store/reducer/helpers/networkImport.ts`, keeping `networkReducer.ts` under the 500-line store-modularization gate.

### Tests

- Added adapter coverage for the new `id` match reason, the `skip` decision, and the `overwrite-preserves-id` behavior.
- Added reducer coverage for per-network rejection metadata in `ui.lastImportRejections`.
- New `app.ui.import-overwrite-dialog.spec.tsx` covers the three radios, the bulk row, per-candidate overrides, and the single-candidate hidden-bulk-row case.

### Verification

- `npm run lint`
- `npm run typecheck`
- `npm run quality:dependency-audit`
- `npm run test:ci:segmentation:check`
- `npm run quality:ui-modularization`
- `npm run quality:ui-timeout-governance`
- `npm run quality:hooks-modularization`
- `npm run quality:store-modularization`
- `npm run quality:exceljs-boundary`
- `npm run test:ci:fast -- --coverage`
- `npm run test:ci:ui`
- `npm run test:e2e`
- `npm run build:vite`
- `npm run quality:pwa`

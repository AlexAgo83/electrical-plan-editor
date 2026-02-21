## req_004_network_import_export_traceability - Acceptance Criteria Traceability
> Request: `req_004_network_import_export_file_workflow`
> Last updated: 2026-02-21

# Traceability Matrix
- AC1: Users can export active and all networks to valid JSON.
  - Evidence:
    - `src/adapters/portability/networkFile.ts` (`buildNetworkFilePayload`, `serializeNetworkFilePayload`)
    - `src/app/App.tsx` (settings export actions)
    - `src/tests/portability.network-file.spec.ts`
    - `src/tests/app.ui.import-export.spec.tsx`

- AC2: Users can import valid export files and see imported networks in app scope.
  - Evidence:
    - `src/adapters/portability/networkFile.ts` (`parseNetworkFilePayload`, `resolveImportConflicts`)
    - `src/store/reducer/networkReducer.ts` (`network/importMany`)
    - `src/app/App.tsx` (import flow + summary)

- AC3: Older supported schema versions migrate on import.
  - Evidence:
    - `src/adapters/portability/networkFile.ts` (schema `0` -> `1` migration path)
    - `src/tests/portability.network-file.spec.ts`

- AC4: Technical ID conflicts are resolved deterministically without overwrite.
  - Evidence:
    - `src/adapters/portability/networkFile.ts` (`dedupeWithSuffix`, conflict summary)
    - `src/tests/portability.network-file.spec.ts`

- AC5: Imported networks preserve routing/occupancy/validation behavior.
  - Evidence:
    - `src/store/networking.ts`
    - `src/store/reducer.ts`
    - `src/store/reducer/wireReducer.ts`
    - `src/tests/store.reducer.wires.spec.ts`

- AC6: Invalid files are rejected safely with clear feedback and no state corruption.
  - Evidence:
    - `src/app/App.tsx` (`handleImportFileChange` guarded parsing)
    - `src/tests/app.ui.import-export.spec.tsx`
    - `src/tests/portability.network-file.spec.ts`

- AC7: Automated coverage protects export/import contract, conflict handling, and rollback paths.
  - Evidence:
    - `src/tests/portability.network-file.spec.ts`
    - `src/tests/app.ui.import-export.spec.tsx`
    - `src/tests/persistence.localStorage.spec.ts`
    - `tests/e2e/smoke.spec.ts`

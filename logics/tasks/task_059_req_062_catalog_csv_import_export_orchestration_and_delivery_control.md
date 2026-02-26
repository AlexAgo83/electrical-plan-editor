## task_059_req_062_catalog_csv_import_export_orchestration_and_delivery_control - req_062 Catalog CSV import/export orchestration and delivery control
> From version: 0.9.8
> Understanding: 100% (UI placements plus V1 policy decisions are locked: match key, duplicate handling, strict import validation + strict headers, schema without internal ID, non-empty-catalog confirmation, local Catalog summary)
> Confidence: 95% (contract is implementation-ready; remaining risk is execution/regression only)
> Progress: 0%
> Complexity: High
> Theme: Orchestration for catalog CSV portability features (export + import) and UI integration
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
`req_062` introduces catalog portability workflows directly in the `Catalog` screen:
- CSV export (header tools row, before `Help`)
- CSV import (bottom action row, between `Edit` and `Delete`)

This request spans multiple layers:
- catalog CSV schema/serialization,
- import parser + deterministic conflict policy,
- UI action placement and browser workflows,
- regression coverage and round-trip confidence.

Locked V1 decisions for implementation:
- export/import schema excludes internal `Catalog item ID`
- export/import headers are strict exact-match (no aliases in V1)
- import match key = trimmed `manufacturerReference`
- duplicate rows in import file = `last row wins` + warning summary
- strict row validation for required fields, numeric fields, and URL format (when URL is present)
- import mode = merge/upsert (not replace-all)
- if Catalog is non-empty, require confirmation before import
- import feedback summary is shown in the Catalog panel (local status/message)

Because imports can mutate many catalog rows, delivery should be sequenced to stabilize the CSV schema first, then import behavior, then UI wiring, then regression coverage.

# Objective
- Deliver `req_062` end-to-end with deterministic catalog CSV export/import behavior and the exact user-requested Catalog UI action placements.
- Preserve existing Catalog CRUD, Help, pricing display, and validation workflows.
- Synchronize `logics` docs after delivery.

# Scope
- In:
  - Orchestrate `item_348`..`item_351`
  - Sequence export schema before import parsing and UI wiring
  - Run targeted and final validation gates
  - Update request/backlog/task progress and delivery notes
- Out:
  - XLSX import/export or advanced mapping wizard UX
  - Cross-network bulk catalog merge workflows

# Backlog scope covered
- `logics/backlog/item_348_catalog_csv_export_schema_serialization_and_download_contract_for_network_scoped_catalog_items.md`
- `logics/backlog/item_349_catalog_csv_import_parser_mapping_conflict_policy_and_row_level_error_reporting.md`
- `logics/backlog/item_350_catalog_panel_csv_export_import_action_placement_and_browser_file_workflow_integration.md`
- `logics/backlog/item_351_regression_coverage_for_catalog_csv_import_export_round_trip_and_action_placement.md`

# Plan
- [ ] 1. Implement catalog CSV export schema/serialization/download contract (`item_348`)
- [ ] 2. Implement catalog CSV import parser, row mapping, conflict policy, and error reporting (`item_349`)
- [ ] 3. Integrate Catalog UI actions with requested placement and browser workflows (`item_350`)
- [ ] 4. Add regression coverage for UI placement, import/export behavior, and round-trip smoke paths (`item_351`)
- [ ] 5. Run targeted validation suites and fix regressions
- [ ] 6. Run final validation matrix
- [ ] FINAL: Update related `logics` docs (request/backlog/task progress + delivery summary)

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:pwa`
- `npm run -s build`
- `npm run -s test:ci`
- `npm run -s test:e2e`

# Targeted validation guidance (recommended during implementation)
- `npx vitest run src/tests/app.ui.catalog.spec.tsx`
- `npx vitest run src/tests/csv.export.spec.ts`
- `npx vitest run src/tests/store.reducer.catalog.spec.ts`
- `npx vitest run src/tests/app.ui.settings-samples.spec.tsx`
- add a dedicated catalog CSV import/export spec when implementation starts (recommended split if `app.ui.catalog.spec.tsx` exceeds line gate)

# Report
- Current blockers: none.
- Risks to track:
  - UI action placement regressions in Catalog panel (header tools row and bottom row ordering).
  - Confirmation/local-summary UX coupling drifting into Settings import/export patterns.
  - Import conflict-policy implementation drift from locked V1 rules (`manufacturerReference` match, last-row-wins).
  - CSV schema/header drift between export and import paths breaking round-trip expectations.
  - Import error handling surfacing inconsistently (silent skips vs strict row rejection reporting).
- Delivery notes:
  - Prefer explicit schema constants/shared helpers to keep export/import aligned.
  - Treat header names as contract constants (strict exact-match in V1).
  - Keep import summary feedback concise and deterministic (created/updated/skipped/errors).
  - Include duplicate-resolution warnings in the import summary (`last row wins` cases).
  - Keep import summary local to Catalog and do not reuse Settings import/export status state.
  - Preserve `Delete` danger semantics and `Help` discoverability when inserting the new actions.

# References
- `logics/request/req_062_catalog_csv_import_export_actions_and_round_trip_support.md`
- `logics/backlog/item_348_catalog_csv_export_schema_serialization_and_download_contract_for_network_scoped_catalog_items.md`
- `logics/backlog/item_349_catalog_csv_import_parser_mapping_conflict_policy_and_row_level_error_reporting.md`
- `logics/backlog/item_350_catalog_panel_csv_export_import_action_placement_and_browser_file_workflow_integration.md`
- `logics/backlog/item_351_regression_coverage_for_catalog_csv_import_export_round_trip_and_action_placement.md`
- `src/app/components/workspace/ModelingCatalogListPanel.tsx`
- `src/app/lib/csv.ts`
- `src/store/catalog.ts`
- `src/tests/app.ui.catalog.spec.tsx`

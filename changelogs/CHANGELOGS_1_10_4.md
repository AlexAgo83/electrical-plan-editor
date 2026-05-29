# Changelog (`1.10.3 -> 1.10.4`)

## Major Highlights

- Stabilized the flaky `app.ui.network-summary-bom-export` XLSX preview tab assertion by waiting for the post-click `aria-selected="true"` state instead of asserting synchronously.
- Removed the last five non-null assertions in `src/app/components/network-summary/FunctionalSchematicPanel.tsx` and replaced them with explicit `undefined` guards.
- Introduced a new strict `quality:hooks-modularization` gate covering `src/app/hooks/**`, wired into `ci:blocking`, with 12 documented oversize exceptions retiring against `adr_009_app_controller_decomposition_plan`.
- Extended `store.reducer.sync-invariant.spec.ts` from 2 cases to 14, parametrically covering every scoped domain action prefix (`catalog/`, `connector/`, `splice/`, `node/`, `segment/`, `wire/`, `layout/`).
- Added an informational `coverage:full:report` CI step that emits unified core + store + app coverage totals.
- Authored ADR `adr_009_app_controller_decomposition_plan` with a 4-wave incremental decomposition roadmap, plus the matching Logics request, backlog, and task.

## Version 1.10.4 - Quality Gate Hardening And Coverage Visibility

### Test stability

- Replaced the synchronous `aria-selected` assertion after the XLSX BOM preview tab click with an `await waitFor(...)` block so the test no longer flakes in the parallel UI lane.

### Code health

- Removed five `!` non-null assertions in `FunctionalSchematicPanel.tsx` (`getSeedLabel`, `buildFunctionalSchematicLayout` root-resolution, BFS queue index, disconnected-row width fallback) and replaced them with explicit `undefined` checks.

### Quality gates

- Added `scripts/quality/hooks-modularization-gate-core.mjs` and `scripts/quality/check-hooks-modularization.mjs` that enforce a 500-line budget on `src/app/hooks/**` with documented oversize exceptions. Stale allow-list entries fail the gate.
- Added `npm run quality:hooks-modularization` to `package.json` and chained it into the `ci:blocking` pipeline next to `quality:ui-modularization` and `quality:store-modularization`.

### Dual-state sync invariant

- Extended `src/tests/store.reducer.sync-invariant.spec.ts` with a parametric test that fires one mutation per scoped domain prefix on a shared graph fixture and asserts that `networkStates[activeNetworkId]` stays aligned with the root slices.
- Added `asCatalogItemId` helper in `src/tests/helpers/store-reducer-test-utils.ts`.

### Coverage visibility

- Added `scripts/quality/report-full-coverage.mjs` and the `npm run coverage:full:report` script, which runs the full Vitest suite with coverage scope `src/core/** + src/store/** + src/app/**` and prints unified totals.
- The CI workflow wiring for this step is deferred to a follow-up commit (token-scope follow-up); the script is runnable locally today via `npm run coverage:full:report`.

### Architecture roadmap

- Added `logics/architecture/adr_009_app_controller_decomposition_plan.md` with the 4-wave decomposition plan, target line counts, validation evidence per wave, and follow-up work.
- Added the matching `logics/request/req_129_app_controller_decomposition_plan.md`, `logics/backlog/item_600_appcontroller_decomposition_plan.md`, and `logics/tasks/task_111_appcontroller_decomposition_plan.md` Logics docs.

## Validation and Regression Evidence

- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:hooks-modularization`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:ui-timeout-governance`
- `npm run -s quality:exceljs-boundary`
- `npm run -s quality:dependency-audit`
- `npm run -s test:ci:segmentation:check`
- `npm run -s test:ci:fast -- --coverage`
- `npm run -s test:ci:ui`
- `npm run -s test:e2e`
- `npm run -s build`
- `npm run -s quality:pwa`
- `python3 -m logics_manager lint --require-status`
- `python3 -m logics_manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`

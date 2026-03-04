# Changelog (`1.3.1 -> 1.3.3`)

## Major Highlights

- Delivered **req_104** architecture/runtime hardening:
  - deterministic UI preferences migration/normalization path,
  - callout text measurement lifecycle cleanup,
  - AppController hook-deps hardening (no `react-hooks/exhaustive-deps` suppression),
  - major decomposition of `AppController` and `NetworkSummaryPanel`.
- Delivered **req_105** post-review hardening:
  - locked CI line-budget guardrails for main UI orchestration files,
  - catalog CSV import atomicity protection after async confirmation,
  - runtime i18n coverage completion for impacted controller/catalog flows,
  - onboarding target-focus retry cancellation safety.
- Maintained behavior parity while reducing file-size risk:
  - `src/app/components/NetworkSummaryPanel.tsx`: `2811 -> 975` lines,
  - `src/app/AppController.tsx`: `2828 -> 1100` lines.

## Version 1.3.2 - Req_104 Delivery

### Architecture and Runtime Hardening

- Added deterministic migration/normalization for persisted UI preferences instead of broad reset behavior on legacy/corrupted payloads.
- Hardened default migration alignment for segment-name visibility in persistence compatibility paths.
- Cleaned up hidden callout measurement SVG nodes on unmount to prevent lifecycle leaks.
- Switched PNG export internals to blob-safe path for improved runtime robustness.

### AppController and NetworkSummaryPanel Decomposition

- Extracted network summary view-state synchronization into dedicated controller hook and removed lint suppression.
- Extracted network summary export pipeline/helpers into dedicated modules.
- Extracted callout model/layout/render layers into focused modules.
- Continued controller split into dedicated domain assembly hooks:
  - onboarding orchestration,
  - workspace/screen domain assembly,
  - canvas interaction/state sync,
  - selection/inspector/layout state,
  - shell props/domain binding composition.

### Maintainability Outcomes

- Finalized phase-1 extraction targets:
  - `NetworkSummaryPanel.tsx <= 1000` achieved (`975`).
  - `AppController.tsx <= 1100` achieved (`1100`).

## Version 1.3.3 - Req_105 Post-Review Hardening

### CI Guardrail Lock

- Extended UI modularization quality gate with locked deterministic budgets:
  - `src/app/AppController.tsx <= 1100`,
  - `src/app/components/NetworkSummaryPanel.tsx <= 1000`.
- Added targeted quality-gate regression test coverage for pass/fail enforcement behavior.

### Catalog CSV Import Atomicity

- Hardened `useCatalogCsvImportExport` so import apply rebases on **fresh post-confirmation state**.
- Prevented stale-snapshot overwrite risk when concurrent catalog edits occur while confirmation is open.
- Preserved import result semantics (`created`/`updated` counters and status/summary behavior).

### Runtime i18n Completion

- Extended runtime FR translation coverage for impacted catalog CSV status lines and home/controller confirmation copy.
- Added/updated deterministic runtime translation patterns for dynamic catalog import/export feedback messages.

### Onboarding Focus Lifecycle Safety

- Added cancel-safe ownership for RAF retry target-focus requests in onboarding controller.
- Canceled pending focus retries on:
  - onboarding close,
  - unmount,
  - superseded target-focus requests.
- Prevented late focus jumps after modal close.

## Validation and Regression Evidence

- Targeted suites updated/passed for req_104/req_105 paths, including:
  - `src/tests/quality.ui-modularization.spec.ts`
  - `src/tests/app.ui.catalog-csv-import-export.spec.tsx`
  - `src/tests/app.ui.onboarding.spec.tsx`
  - `src/tests/app.ui.settings-locale.spec.tsx`
  - `src/tests/app.ui.settings-canvas-callouts.spec.tsx`
- Full local CI-equivalent pipeline passed at closure:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s test:ci:segmentation:check`
  - `npm run -s quality:ui-modularization`
  - `npm run -s quality:ui-timeout-governance`
  - `npm run -s quality:store-modularization`
  - `npm run -s test:ci:fast -- --coverage`
  - `npm run -s test:ci:ui`
  - `npm run -s test:e2e`
  - `npm run -s build`
  - `npm run -s quality:pwa`


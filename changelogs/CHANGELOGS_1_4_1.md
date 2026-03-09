# Changelog (`1.4.0 -> 1.4.1`)

## Major Highlights

- Delivered **req_107** post-release hardening across CI parity, CSV export safety, persistence runtime feedback, and export-test signal quality.
- Local blocking validation is now shared between developer workflow and GitHub Actions through a canonical `ci:blocking` pipeline.
- The app now surfaces a visible persistence warning when browser storage writes fail, while keeping the current session usable in memory.

## Version 1.4.1 - Req_107 Delivery

### CI and Validation Parity

- Added `npm run ci:blocking` as the canonical blocking pipeline for:
  - Logics lint,
  - request sync closure checks,
  - blocking workflow audit,
  - Logics kit Python tests,
  - lint, typecheck, segmented tests, quality gates, E2E, build, and PWA checks.
- Rebased `npm run ci:local` onto `npm run ci:blocking` so local pre-release verification no longer drifts from GitHub blocking CI.
- Simplified `.github/workflows/ci.yml` to execute the same shared blocking command after Playwright browser installation.

### CSV Export Hardening

- Hardened CSV formula neutralization so dangerous spreadsheet payloads are escaped even when prefixed by leading whitespace or control characters.
- Preserved existing numeric-cell behavior and current quoting/escaping semantics.
- Added regression coverage for representative payloads such as:
  - leading-space `=...`
  - tab-prefixed `@...`
  - control-prefixed `-...`

### Persistence Runtime Feedback

- Refactored local persistence saves to return explicit success/failure results instead of swallowing write failures silently.
- Added store-level persistence sync feedback that:
  - keeps the app running in memory,
  - shows a visible runtime error when persistence is unavailable,
  - clears the warning automatically once saving succeeds again.
- Added regression coverage for both store-level persistence recovery and visible app-level error surfacing.

### Export and Test-Signal Hardening

- Centralized unsupported canvas text-measurement detection behind a shared helper.
- Export cartouche measurement, callout layout fallback, and PNG export paths now avoid repeated `canvas.getContext` noise under jsdom while preserving deterministic browser behavior.
- Added targeted regression tests to assert that SVG export and callout rendering no longer hit the noisy jsdom canvas path during normal successful runs.
- Documented the enlarged network-summary export regression suite as an approved temporary UI modularization oversize exception.

## Validation and Regression Evidence

- Documentation and workflow traceability validated:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `python3 logics/skills/logics-flow-manager/scripts/workflow_audit.py --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`
- Targeted req_107 regression suite passed:
  - `npm test -- --run src/tests/csv.export.spec.ts src/tests/store.create-store.spec.ts src/tests/app.ui.persistence-feedback.spec.tsx src/tests/app.ui.network-summary-bom-export.spec.tsx src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- Segmentation and quality guards passed:
  - `npm run -s test:ci:segmentation:check`
  - `npm run -s quality:ui-modularization`
- Canonical blocking pipeline passed:
  - `npm run -s ci:blocking`

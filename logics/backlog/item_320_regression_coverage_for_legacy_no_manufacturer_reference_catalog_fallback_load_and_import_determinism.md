## item_320_regression_coverage_for_legacy_no_manufacturer_reference_catalog_fallback_load_and_import_determinism - Regression Coverage for Legacy No-Manufacturer-Reference Catalog Fallback Load and Import Determinism
> From version: 0.9.5
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Verify generated placeholder fallback stability and parity across migration/load and import paths
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The generated placeholder fallback for missing manufacturer references is highly compatibility-sensitive. Without dedicated tests, duplicate churn, nondeterministic naming, or load/import parity drift can reappear unnoticed.

# Scope
- In:
  - Add migration/load tests for connector and splice legacy records missing `manufacturerReference`.
  - Add import-path parity tests for the same cases.
  - Verify deterministic placeholder naming and stable repeated bootstrap behavior (no duplicate churn).
  - Verify invalid capacity preserves safe skip behavior.
- Out:
  - UI behavior for generated placeholders.

# Acceptance criteria
- Tests cover connector and splice missing-manufacturer fallback generation.
- Tests confirm deterministic placeholder naming and no duplicate churn on repeated runs.
- Tests confirm import path parity with load/migration behavior.
- Tests confirm invalid capacity remains skipped.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_052`, item_319.
- Blocks: item_332.
- Related AC: AC4-AC6.
- References:
  - `logics/request/req_052_legacy_catalog_fallback_generate_deterministic_manufacturer_reference_when_missing.md`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/portability.network-file.spec.ts`


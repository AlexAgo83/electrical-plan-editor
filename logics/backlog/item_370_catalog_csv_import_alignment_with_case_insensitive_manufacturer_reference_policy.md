## item_370_catalog_csv_import_alignment_with_case_insensitive_manufacturer_reference_policy - Catalog CSV import alignment with case-insensitive manufacturer-reference policy
> From version: 0.9.10
> Understanding: 94%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Import-path consistency with catalog reference policy
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
If catalog `manufacturerReference` canonicalization rules are tightened only in live reducer/UI flows, CSV import can become an inconsistent side-channel that accepts or resolves conflicts differently.

# Scope
- In:
  - Apply the chosen catalog reference comparison policy (`trim + lower` default) to catalog CSV import flows.
  - Enforce consistent conflict behavior for explicit CSV import operations (default: fail/reject import with explicit error on conflicts).
  - Preserve current atomic import semantics where already expected.
  - Keep existing catalog CSV export format semantics unchanged unless explicitly necessary.
- Out:
  - Legacy workspace load conflict surfacing (handled in `item_371`)
  - CI/tooling reporting changes (handled in `item_372` / `item_373`)
  - Full regression suite updates (handled in `item_377`)

# Acceptance criteria
- Catalog CSV import applies the same manufacturer-reference comparison policy as runtime catalog validation.
- Explicit import conflict behavior is deterministic and clearly reported.
- Existing valid catalog CSV imports remain non-regressed.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_068`, `item_369`.
- Blocks: `item_377`, `task_066`.
- Related AC: AC2, AC7, AC9.
- References:
  - `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`
  - `src/app/lib/catalogCsv.ts`
  - `src/app/AppController.tsx`
  - `src/tests/catalog.csv-import-export.spec.ts`
  - `src/tests/app.ui.catalog-csv-import-export.spec.tsx`

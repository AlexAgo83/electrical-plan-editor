## item_322_validation_catalog_integrity_rules_and_connector_splice_catalog_link_audits - Validation Catalog Integrity Rules and Connector/Splice Catalog-Link Audits
> From version: 0.9.5
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: Add validation issue generation for catalog record corruption and connector/splice catalog link integrity mismatches
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The validation engine does not inspect `catalogItems` or connector/splice `catalogItemId` integrity, leaving corrupted/imported states invisible in the Validation screen.

# Scope
- In:
  - Add validation checks for catalog record integrity:
    - empty/whitespace `manufacturerReference`
    - duplicate `manufacturerReference` (per network)
    - invalid `connectionCount`
    - invalid non-empty URL (`http/https` absolute only)
  - Add connector/splice catalog-link integrity checks:
    - missing `catalogItemId`
    - broken `catalogItemId`
    - derived capacity mismatch vs linked catalog `connectionCount`
  - Emit deterministic issues with per-item duplicate issue granularity (one issue per offending catalog item).
  - Generate issue payloads compatible with catalog and connector/splice `Go to`.
- Out:
  - Validation UI grouping/filter chips (handled in item_323).

# Acceptance criteria
- Validation emits catalog integrity issues for invalid catalog records.
- Validation emits connector/splice catalog-link issues for missing/broken/mismatched links.
- Duplicate manufacturer references emit one issue per offending catalog item with deterministic ordering.
- Output is compatible with `Go to` navigation contracts.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_053`, item_321.
- Blocks: item_323, item_332.
- Related AC: AC1, AC2, AC3a, AC6, AC8.
- References:
  - `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
  - `src/app/hooks/validation/buildValidationIssues.ts`
  - `src/store/catalog.ts`


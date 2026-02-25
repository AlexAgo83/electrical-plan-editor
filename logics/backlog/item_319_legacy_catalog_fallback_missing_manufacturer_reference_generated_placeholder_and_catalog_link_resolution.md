## item_319_legacy_catalog_fallback_missing_manufacturer_reference_generated_placeholder_and_catalog_link_resolution - Legacy Catalog Fallback Missing Manufacturer Reference Generated Placeholder and Catalog Link Resolution
> From version: 0.9.5
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Deterministic placeholder manufacturer references for legacy connector/splice records missing manufacturer ref
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Legacy connectors/splices without `manufacturerReference` remain unresolved to `catalogItemId` after `req_051` fallback bootstrap, weakening the catalog-first model for older saves/imports.

# Scope
- In:
  - Extend legacy catalog bootstrap to generate catalog items for connectors/splices missing usable `manufacturerReference` when capacity is valid.
  - Enforce the mandated placeholder format:
    - `LEGACY-NOREF-C-{token} [<count>c]`
    - `LEGACY-NOREF-S-{token} [<count>p]`
  - Implement deterministic `stableSourceToken` derivation (`technicalId` first, fallback internal id).
  - Implement deterministic token slug normalization (ASCII uppercase, stable replacements).
  - Link legacy entities to generated catalog items via `catalogItemId`.
  - Keep connector/splice snapshot fields synchronized from generated catalog item (`manufacturerReference`, capacity).
  - Preserve current safe skip behavior for invalid capacities.
- Out:
  - UI surfacing/badging of generated legacy placeholders.
  - Bulk rename tools for generated placeholder references.

# Acceptance criteria
- Legacy connectors without manufacturer reference but valid `cavityCount` get generated catalog items and `catalogItemId`.
- Legacy splices without manufacturer reference but valid `portCount` get generated catalog items and `catalogItemId`.
- Generated references follow the mandated deterministic placeholder pattern.
- Token derivation and normalization are deterministic across repeated runs.
- Invalid capacities still skip catalog generation safely.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_052`, `req_051`.
- Blocks: item_320, item_332.
- Related AC: AC1-AC3, AC6, AC7.
- References:
  - `logics/request/req_052_legacy_catalog_fallback_generate_deterministic_manufacturer_reference_when_missing.md`
  - `src/store/catalog.ts`
  - `src/adapters/persistence/migrations.ts`
  - `src/adapters/portability/networkFile.ts`


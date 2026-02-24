## item_242_connector_splice_manufacturer_reference_legacy_persistence_import_compatibility_patch - Connector/Splice Manufacturer Reference Legacy Persistence/Import Compatibility Patch
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium-High
> Theme: Backward-Compatible Normalization for Optional Manufacturer Reference Fields
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Older saves/imports predate `manufacturerReference`. Once connector/splice contracts include the field, legacy payloads must remain loadable without inventing references or breaking normalization.

# Scope
- In:
  - Patch persistence migration/normalization paths so legacy connectors/splices missing `manufacturerReference` remain valid.
  - Patch portability/import normalization paths with equivalent handling.
  - Legacy behavior baseline:
    - missing `manufacturerReference` remains absent/empty (no invented default value)
  - Preserve backward-compatible loading for existing local saves and imported files.
  - Follow existing migration/versioning conventions if schema changes require a bump.
  - Optional defense-in-depth:
    - trim/normalize unexpected non-string legacy values safely to absent/empty.
- Out:
  - Adding default manufacturer references to legacy components.
  - UI display/search enhancements.
  - Any uniqueness/dedup migration logic.

# Acceptance criteria
- Legacy persisted workspaces without `manufacturerReference` on connectors/splices load successfully.
- Legacy imported data without `manufacturerReference` normalizes successfully.
- Compatibility patching does not invent manufacturer reference values.
- Normalized runtime entities remain valid after load/import.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_040`, item_240.
- Blocks: item_243, item_244.
- Related AC: AC3, AC6, AC7.
- References:
  - `logics/request/req_040_optional_manufacturer_reference_for_connectors_and_splices.md`
  - `src/adapters/persistence/migrations.ts`
  - `src/adapters/persistence/localStorage.ts`
  - `src/adapters/portability/networkFile.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/portability.network-file.spec.ts`


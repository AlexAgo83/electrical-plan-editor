## req_052_legacy_catalog_fallback_generate_deterministic_manufacturer_reference_when_missing - Legacy Catalog Fallback: Generate Deterministic Catalog Manufacturer References When Missing
> From version: 0.9.5
> Understanding: 100% (defaults clarified + backlog/task linkage added)
> Confidence: 98% (implementation choices narrowed and decomposed)
> Complexity: Medium
> Theme: Improve req_051 legacy compatibility by auto-bootstrapping catalog items even when connector/splice manufacturer references are missing
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Improve the `req_051` legacy fallback behavior for old saves/imports containing `Connectors` / `Splices` without `manufacturerReference`.
- Avoid leaving legacy entities without `catalogItemId` when they still have a valid `way/port count`.
- Generate a deterministic catalog `manufacturerReference` placeholder so these entities can be fully linked to the network-scoped `Catalog`.

# Context
`req_051` introduced a network-scoped `Catalog` and a catalog-first workflow for new connector/splice creation. The current legacy fallback bootstrap creates catalog items only when a legacy connector/splice has:
- a usable `manufacturerReference`, and
- a valid `cavityCount` / `portCount`.

When `manufacturerReference` is missing/empty, the fallback currently skips catalog bootstrap for that entity. The entity remains loadable, but it may stay without `catalogItemId`, which weakens the catalog-first transition for legacy datasets.

# Objective
- Extend legacy fallback bootstrap so connectors/splices with missing `manufacturerReference` still receive a generated catalog item and `catalogItemId` when capacity is valid.
- Keep generated references deterministic, readable, and unique within the network catalog.
- Preserve existing fallback behavior for entities that already have a valid manufacturer reference.

# Functional scope
## A. Missing manufacturer-reference fallback generation (high priority)
- During legacy catalog bootstrap (load/migration and import fallback paths), if a legacy connector/splice:
  - has no usable `manufacturerReference` (missing, empty, or whitespace),
  - and has a valid connection capacity:
    - connector: `cavityCount >= 1` integer
    - splice: `portCount >= 1` integer
- then auto-create (or reuse) a catalog item with a generated `manufacturerReference`.

## B. Generated manufacturer-reference format (high priority)
- Generated references must be:
  - deterministic across repeated loads/imports of the same payload,
  - unique within the network catalog,
  - readable enough for user cleanup/renaming later.
- V1 pattern is **mandated** (deterministic placeholder):
  - connector-derived: `LEGACY-NOREF-C-{stableSourceToken} [<count>c]`
  - splice-derived: `LEGACY-NOREF-S-{stableSourceToken} [<count>p]`
- `stableSourceToken` derivation contract (deterministic):
  - use legacy entity `technicalId` first (preferred when present),
  - otherwise fall back to internal entity id,
  - normalize via slugification for stable readability/safety.
- `stableSourceToken` normalization contract (V1):
  - ASCII uppercased slug
  - allowed characters: `A-Z`, `0-9`, `-`, `_`
  - collapse/replace unsupported characters deterministically
- If collision still occurs, append a deterministic suffix (`-2`, `-3`, etc.) using the same collision-resolution strategy as the existing legacy bootstrap.

## C. Catalog linking and entity synchronization (high priority)
- After generating the fallback catalog item, legacy connector/splice must be linked via `catalogItemId`.
- Connector/splice snapshot fields should remain synchronized from the generated catalog item:
  - `manufacturerReference`
  - connector `cavityCount` / splice `portCount` from catalog `connectionCount`

## D. Execution paths (high priority)
- Apply the same behavior in both:
  - persisted workspace load / migration fallback
  - import fallback for older networks/workspaces

## E. Non-goals / constraints (medium priority)
- Do not change fallback behavior for entities that already provide a valid `manufacturerReference`.
- Do not invent catalog items when capacity is invalid (`< 1` or non-integer).
- Do not require any UI changes in this request (runtime editing UX already exists via `req_051`).

# Non-functional requirements
- Deterministic output (no rename churn between repeated load/import runs on the same data).
- No duplicate catalog item churn for the same legacy entity source + capacity.
- Backward-compatible with `req_051` migration/import behavior and catalog uniqueness constraints.

# Validation and regression safety
- Add/extend tests for:
  - legacy connector without `manufacturerReference` + valid `cavityCount` -> generated catalog item + `catalogItemId`
  - legacy splice without `manufacturerReference` + valid `portCount` -> generated catalog item + `catalogItemId`
  - repeated bootstrap on the same payload remains stable (no duplicate churn)
  - import path parity with migration/load path
  - invalid capacity still skips bootstrap (existing safe behavior preserved)

# Acceptance criteria
- AC1: Legacy connectors without `manufacturerReference` but with valid `cavityCount` are backfilled to a generated catalog item and linked with `catalogItemId`.
- AC2: Legacy splices without `manufacturerReference` but with valid `portCount` are backfilled to a generated catalog item and linked with `catalogItemId`.
- AC3: Generated catalog `manufacturerReference` values are deterministic and unique within the network catalog.
- AC4: Repeated load/import of the same legacy payload does not create duplicate catalog items or rename churn.
- AC5: Import fallback behavior matches load/migration fallback behavior for missing manufacturer-reference legacy entities.
- AC6: Entities with invalid capacity still do not produce generated catalog items.
- AC7: Generated placeholder references follow the mandated `LEGACY-NOREF-{C|S}-{token} [<count>{c|p}]` pattern with deterministic token fallback and slug normalization.

# Out of scope
- UI surfacing/badging of generated legacy placeholders.
- Bulk user actions to rename generated placeholder references.
- Changes to catalog-first creation UX for new entities.

# Backlog
- `logics/backlog/item_319_legacy_catalog_fallback_missing_manufacturer_reference_generated_placeholder_and_catalog_link_resolution.md`
- `logics/backlog/item_320_regression_coverage_for_legacy_no_manufacturer_reference_catalog_fallback_load_and_import_determinism.md`
- `logics/backlog/item_332_req_052_to_req_056_catalog_follow_ups_bundle_closure_ci_build_and_ac_traceability.md`

# Orchestration task
- `logics/tasks/task_053_req_052_to_req_056_catalog_follow_ups_bundle_orchestration_and_delivery_control.md`

# References
- `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
- `src/store/catalog.ts`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/portability.network-file.spec.ts`

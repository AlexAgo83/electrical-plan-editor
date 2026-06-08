## item_332_req_052_to_req_056_catalog_follow_ups_bundle_closure_ci_build_and_ac_traceability - req_052 to req_056 Catalog Follow-ups Bundle Closure, CI/Build, and AC Traceability
> From version: 0.9.5
> Status: Done
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: Bundle-level closure item for catalog follow-up requests spanning legacy fallback, validation, seeded defaults, catalog analysis, and BOM export
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The `req_052`..`req_056` batch is cross-cutting and interdependent. Without a dedicated closure item, implementation may finish partially without full validation, docs sync, or AC traceability across the bundle.

# Scope
- In:
  - Execute final validation matrix (lint/typecheck/quality/build/tests/e2e as applicable).
  - Verify cross-request interaction risks:
    - req_054 seeded prices improve req_056 BOM smoke paths
    - req_052 legacy fallback compatibility with req_053 validation surfacing
    - req_055 Catalog analysis coexistence with req_051 catalog CRUD flows
  - Update `req_052`..`req_056`, related backlog items, and orchestration task progress/closure notes.
  - Record AC traceability and delivered test coverage by request.
- Out:
  - New feature scope beyond `req_052`..`req_056`.

# Acceptance criteria
- Final validation matrix passes for the delivered bundle.
- `req_052`..`req_056` docs and backlog/task artifacts are synchronized with progress and closure notes.
- AC traceability is documented across the bundle.
- Cross-request integration risks are checked and any defers are explicitly recorded.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_052`, `req_053`, `req_054`, `req_055`, `req_056`, item_319, item_320, item_321, item_322, item_323, item_324, item_325, item_326, item_327, item_328, item_329, item_330, item_331.
- Blocks: none (final closure item).
- Related AC: req_052 AC1-AC7; req_053 AC1-AC8; req_054 AC1-AC8; req_055 AC1-AC5; req_056 AC1-AC8.
- References:
  - `logics/request/req_052_legacy_catalog_fallback_generate_deterministic_manufacturer_reference_when_missing.md`
  - `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
  - `logics/request/req_054_default_seed_catalog_items_on_new_network_creation_for_catalog_first_bootstrap.md`
  - `logics/request/req_055_catalog_analysis_panel_linked_connectors_and_splices_usage_listing.md`
  - `logics/request/req_056_bom_csv_export_from_network_summary_header_for_rendered_catalog_backed_components.md`


# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: Legacy connectors without `manufacturerReference` but with valid `cavityCount` are backfilled to a generated catalog item and linked with `catalogItemId`.
- request-AC2 -> This backlog slice. Evidence needed: Legacy splices without `manufacturerReference` but with valid `portCount` are backfilled to a generated catalog item and linked with `catalogItemId`.
- request-AC3 -> This backlog slice. Evidence needed: Generated catalog `manufacturerReference` values are deterministic and unique within the network catalog.
- request-AC4 -> This backlog slice. Evidence needed: Repeated load/import of the same legacy payload does not create duplicate catalog items or rename churn.
- request-AC5 -> This backlog slice. Evidence needed: Import fallback behavior matches load/migration fallback behavior for missing manufacturer-reference legacy entities.
- request-AC6 -> This backlog slice. Evidence needed: Entities with invalid capacity still do not produce generated catalog items.
- request-AC7 -> This backlog slice. Evidence needed: Generated placeholder references follow the mandated `LEGACY-NOREF-{C|S}-{token} [<count>{c|p}]` pattern with deterministic token fallback and slug normalization.
- request-AC1 -> This backlog slice. Evidence needed: Validation pipeline inspects `catalogItems` and emits catalog integrity issues for invalid catalog records.
- request-AC2 -> This backlog slice. Evidence needed: Validation pipeline emits connector/splice catalog-link integrity issues (missing/broken/mismatched links).
- request-AC3 -> This backlog slice. Evidence needed: Validation UI exposes catalog-related issues in a clear category/filterable group without regressing existing validation groups.
- request-AC4 -> This backlog slice. Evidence needed: Validation `Go to` supports catalog-targeted issues by navigating to the `Catalog` screen and selecting the catalog item.
- request-AC5 -> This backlog slice. Evidence needed: Existing connector/splice/node/segment/wire validation behavior and navigation remain functional.
- request-AC6 -> This backlog slice. Evidence needed: Validation remains compatible with legacy/imported datasets that may include unresolved catalog links.
- request-AC7 -> This backlog slice. Evidence needed: Sample/demo datasets and test fixtures used by validation/import regression suites are updated (or extended with variants) to cover catalog-related validation without regressing the default valid sample flows.
- request-AC8 -> This backlog slice. Evidence needed: Duplicate catalog `manufacturerReference` validation emits one issue per offending catalog item (deterministic ordering), each with a usable `Go to` target.
- request-AC1 -> This backlog slice. Evidence needed: Creating a brand-new network initializes a default network-scoped catalog with exactly `3` valid catalog items.
- request-AC2 -> This backlog slice. Evidence needed: Seeded catalog items are immediately usable by connector/splice creation flows.
- request-AC3 -> This backlog slice. Evidence needed: Default seed items are editable/deletable like regular catalog items (subject to existing reference guards).
- request-AC4 -> This backlog slice. Evidence needed: Existing network load, migration, and import flows do not auto-inject default catalog seed items.
- request-AC5 -> This backlog slice. Evidence needed: Seed generation is deterministic and does not duplicate items for the same newly created network.
- request-AC6 -> This backlog slice. Evidence needed: Regression tests cover both seeded new-network behavior and no-reseed import/load behavior.
- request-AC7 -> This backlog slice. Evidence needed: The V1 seed set uses the mandated generic manufacturer references (`CAT-2W-STD`, `CAT-6P-STD`, `CAT-8W-STD`) and includes deterministic non-null `unitPriceExclTax` values.
- request-AC8 -> This backlog slice. Evidence needed: The V1 seed set includes deterministic human-readable `name` defaults (`2-way standard connector`, `6-port standard splice`, `8-way standard connector`).
- request-AC1 -> This backlog slice. Evidence needed: The `Catalog` screen includes an analysis panel/column consistent with other modeling screens.
- request-AC2 -> This backlog slice. Evidence needed: Selecting a catalog item displays linked `Connectors` and `Splices` that reference that item.
- request-AC3 -> This backlog slice. Evidence needed: Analysis entries support navigation to the corresponding connector/splice edit flow.
- request-AC4 -> This backlog slice. Evidence needed: The analysis panel handles no-selection and no-usage cases with clear empty states.
- request-AC5 -> This backlog slice. Evidence needed: Catalog CRUD behavior and catalog-first connector/splice creation workflow remain functional after the layout change.
- request-AC1 -> This backlog slice. Evidence needed: The 2D render (`Network summary`) header exposes an `Export BOM CSV` action positioned to the right of `Export PNG`.
- request-AC2 -> This backlog slice. Evidence needed: Exported CSV includes rendered connector/splice components that reference catalog items, grouped into BOM rows with quantity aggregation.
- request-AC3 -> This backlog slice. Evidence needed: CSV rows include unit price and line total fields derived from catalog `unitPriceExclTax` when available.
- request-AC4 -> This backlog slice. Evidence needed: Rows with missing unit price remain exported, with blank price/total fields (no crash/no forced zero).
- request-AC5 -> This backlog slice. Evidence needed: Broken or unresolved catalog links do not break BOM export; behavior is safe and deterministic.
- request-AC6 -> This backlog slice. Evidence needed: Existing PNG export and 2D render workflows remain functional after BOM export integration.
- request-AC7 -> This backlog slice. Evidence needed: CSV includes a `TOTAL (priced rows only)` summary row with deterministic formatting.
- request-AC8 -> This backlog slice. Evidence needed: Aggregated BOM rows expose connector/splice distribution via `Connector quantity` and `Splice quantity` columns and do not introduce a separate `Type` column in V1.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

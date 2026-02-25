## task_053_req_052_to_req_056_catalog_follow_ups_bundle_orchestration_and_delivery_control - req_052 to req_056 Orchestration: Catalog Follow-ups Bundle Delivery Control
> From version: 0.9.5
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Bundle orchestration for catalog follow-up requests covering legacy fallback placeholders, validation catalog integrity, seeded defaults, catalog analysis panel, and BOM CSV export
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
This orchestration task groups five related catalog follow-up requests:
- `req_052` legacy fallback placeholder generation for missing manufacturer references
- `req_053` validation support for catalog integrity and catalog-link issues
- `req_054` default seeded catalog items for new networks
- `req_055` catalog analysis panel showing linked connectors/splices
- `req_056` BOM CSV export from the 2D render header

These requests share common surfaces (`Catalog`, `Validation`, `Network summary`, samples/fixtures) and should be delivered in a controlled order to reduce rework and regression risk.

# Objective
- Deliver `req_052`..`req_056` in coordinated waves with deterministic behavior and regression safety.
- Preserve compatibility for legacy/imported data while improving catalog UX and operational outputs (validation + BOM).
- Finish with bundle-level closure, AC traceability, and synchronized `logics` artifacts.

# Scope
- In:
  - Wave orchestration for backlog items `item_319`..`item_332`
  - Cross-request dependency sequencing and regression gating
  - Bundle-level validation matrix and docs sync
- Out:
  - Implementing unrelated catalog roadmap items beyond `req_052`..`req_056`
  - Procurement/inventory workflows beyond CSV BOM export

# Backlog scope covered
- `logics/backlog/item_319_legacy_catalog_fallback_missing_manufacturer_reference_generated_placeholder_and_catalog_link_resolution.md`
- `logics/backlog/item_320_regression_coverage_for_legacy_no_manufacturer_reference_catalog_fallback_load_and_import_determinism.md`
- `logics/backlog/item_321_validation_catalog_target_selection_kind_and_go_to_navigation_support.md`
- `logics/backlog/item_322_validation_catalog_integrity_rules_and_connector_splice_catalog_link_audits.md`
- `logics/backlog/item_323_validation_catalog_integrity_ui_category_filters_samples_and_regression_coverage.md`
- `logics/backlog/item_324_new_network_catalog_seed_defaults_with_deterministic_names_prices_and_no_reseed_guards.md`
- `logics/backlog/item_325_regression_coverage_and_sample_alignment_for_catalog_seeded_new_network_bootstrap.md`
- `logics/backlog/item_326_catalog_analysis_panel_composition_usage_sections_and_usage_summary_for_selected_catalog_item.md`
- `logics/backlog/item_327_catalog_analysis_row_navigation_to_connector_splice_modeling_and_reactive_usage_refresh.md`
- `logics/backlog/item_328_regression_coverage_for_catalog_analysis_panel_usage_listing_and_navigation.md`
- `logics/backlog/item_329_bom_csv_catalog_aggregation_pricing_calculation_and_csv_serialization_for_active_network_components.md`
- `logics/backlog/item_330_network_summary_header_export_bom_csv_action_integration_and_download_workflow.md`
- `logics/backlog/item_331_regression_coverage_fixtures_and_png_non_regression_for_bom_csv_export.md`
- `logics/backlog/item_332_req_052_to_req_056_catalog_follow_ups_bundle_closure_ci_build_and_ac_traceability.md`

# Attention points (mandatory delivery discipline)
- **Sequence for leverage:** seeded catalog defaults (`req_054`) before BOM export (`req_056`) improves smoke paths and fixtures.
- **Compatibility first:** legacy placeholder fallback (`req_052`) must remain deterministic and safe across load/import.
- **Validation clarity:** `req_053` must not mix catalog-targeted vs connector/splice-targeted `Go to` semantics.
- **Catalog UX stability:** `req_055` adds analysis to Catalog without regressing req_051 CRUD flows.
- **Export robustness:** `req_056` CSV must be deterministic, escaped, and non-destructive to `Export PNG`.
- **Docs synchronization:** all requests/backlog/task artifacts must be updated during closure.

# Recommended execution strategy (wave order)
Rationale:
- Seed defaults early to stabilize baseline UX and later BOM fixtures.
- Implement legacy fallback placeholder generation before validation catalog-link audits to avoid false-positive churn in fixtures and imports.
- Deliver validation surfacing before catalog analysis/BOM so integrity issues are observable during subsequent development.
- Add Catalog analysis before BOM to finish catalog-screen follow-ups before Network summary export changes.
- Keep regressions and closure explicit rather than implicit.

# Plan
- [ ] Wave 0. New-network seeded catalog defaults with deterministic names/prices and no-reseed guards (`item_324`)
- [ ] Wave 1. Legacy missing-manufacturer fallback placeholder generation and catalog link resolution (`item_319`)
- [ ] Wave 2. Validation catalog target navigation + catalog integrity/link rules (`item_321`, `item_322`)
- [ ] Wave 3. Catalog analysis panel composition, usage listing, and row navigation/reactive updates (`item_326`, `item_327`)
- [ ] Wave 4. BOM CSV aggregation/serialization engine + Network summary header export action integration (`item_329`, `item_330`)
- [ ] Wave 5. Regression and fixture coverage across the bundle (`item_320`, `item_323`, `item_325`, `item_328`, `item_331`)
- [ ] Wave 6. Closure: full validation matrix, AC traceability, and `logics` synchronization (`item_332`)
- [ ] FINAL. Update related `.md` files to final state (requests/backlog/task progress + delivery summary)
- [ ] FINAL+. Update `README.md` to reflect delivered catalog follow-ups (seeded catalog defaults, catalog validation/analysis, BOM CSV export) if user-facing behavior changed

# Validation gates
## A. Minimum wave gate (apply after each Wave 0-5)
- Static checks:
  - `npm run -s typecheck`
- Tests:
  - targeted suites for touched surfaces
- Scope-specific checks:
  - persistence/import tests when touching fallback/bootstrap paths
  - UI integration tests when changing Validation/Catalog/Network summary screens

## B. Final closure gate (mandatory at Wave 6)
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:pwa`
- `npm run -s build`
- `npm run -s test:ci`
- `npm run -s test:e2e`

## C. Targeted test guidance (recommended during Waves 0-5)
- `npm run -s test -- src/tests/store.reducer.networks.spec.ts`
- `npm run -s test -- src/tests/persistence.localStorage.spec.ts src/tests/portability.network-file.spec.ts`
- `npm run -s test -- src/tests/app.ui.validation.spec.tsx`
- `npm run -s test -- src/tests/app.ui.catalog.spec.tsx`
- `npm run -s test -- src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `npm run -s test -- src/tests/sample-network.fixture.spec.ts`

## D. Commit gate (apply after each Wave 0-6 and FINAL docs sync if separate)
- Commit only after wave validation passes.
- Commit messages should reference the request(s) covered by the wave.
- Update this task with wave status, validation snapshot, commit SHA, and deviations/defers after each wave.

# Cross-feature dependency / collision watchlist
- **req_052 vs req_053 interplay**:
  - Risk: validation flags expected temporary legacy states differently before/after placeholder fallback behavior lands.
- **req_054 vs req_056 fixtures**:
  - Risk: seeded pricing assumptions diverge from BOM tests and sample expectations.
- **req_055 Catalog layout churn**:
  - Risk: analysis panel integration breaks catalog CRUD responsiveness or mobile layout.
- **req_056 header action layout**:
  - Risk: BOM button crowds/reshuffles `Export PNG` and regresses existing interaction tests.
- **Sample fixture drift across bundle**:
  - Risk: shared fixtures are over-mutated and lose happy-path coverage.

# Mitigation strategy
- Implement deterministic fallback/seed defaults first and codify them in tests.
- Prefer targeted fixture variants for invalid/corrupted states rather than mutating shared happy-path samples.
- Keep `Go to` semantics explicit per issue target type (catalog vs connector/splice).
- Add regression tests for header button ordering and PNG coexistence.
- Track bundle AC coverage in closure item `item_332`.

# Report
- Wave status:
  - Wave 0 (seeded catalog defaults): pending
  - Wave 1 (legacy no-ref placeholder fallback): pending
  - Wave 2 (validation catalog integrity/nav): pending
  - Wave 3 (catalog analysis panel): pending
  - Wave 4 (BOM CSV export): pending
  - Wave 5 (regression coverage bundle): pending
  - Wave 6 (closure + AC traceability): pending
  - FINAL (`.md` synchronization): pending
  - FINAL+ (`README.md` update): pending
- Current blockers:
  - None (specs are clarified and linted).
- Main risks to track:
  - Placeholder naming determinism, validation issue granularity stability, seeded-price fixture coupling, CSV escaping correctness.
- Validation snapshot:
  - Not started for implementation waves.
- Delivery summary:
  - Pending implementation.

# References
- `logics/request/req_052_legacy_catalog_fallback_generate_deterministic_manufacturer_reference_when_missing.md`
- `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
- `logics/request/req_054_default_seed_catalog_items_on_new_network_creation_for_catalog_first_bootstrap.md`
- `logics/request/req_055_catalog_analysis_panel_linked_connectors_and_splices_usage_listing.md`
- `logics/request/req_056_bom_csv_export_from_network_summary_header_for_rendered_catalog_backed_components.md`
- `logics/backlog/item_319_legacy_catalog_fallback_missing_manufacturer_reference_generated_placeholder_and_catalog_link_resolution.md`
- `logics/backlog/item_332_req_052_to_req_056_catalog_follow_ups_bundle_closure_ci_build_and_ac_traceability.md`

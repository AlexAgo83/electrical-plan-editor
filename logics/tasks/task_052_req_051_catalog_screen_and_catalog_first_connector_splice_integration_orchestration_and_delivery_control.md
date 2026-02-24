## task_052_req_051_catalog_screen_and_catalog_first_connector_splice_integration_orchestration_and_delivery_control - req_051 Orchestration: Catalog Screen and Catalog-First Connector/Splice Integration Delivery Control
> From version: 0.9.4
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Delivery orchestration for network-scoped catalog, connector/splice catalog-first workflow, legacy fallback, and onboarding updates
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_051`, which introduces a network-scoped `Catalog` and moves connector/splice creation to a catalog-first workflow. Delivery spans:
- store/domain schema changes (`catalogItems`, `catalogItemId` links),
- legacy persistence/import fallback bootstrap and deterministic collision naming,
- modeling navigation/screen composition for `Catalog`,
- catalog CRUD UI and V1 ergonomics,
- connector/splice form replacement and integrity guards,
- onboarding step insertion and guidance updates,
- regression coverage and closure validation.

This is a cross-cutting feature touching persistence, UI composition, interaction flows, and onboarding content. Controlled sequencing is required to minimize regressions.

# Objective
- Deliver `req_051` in controlled waves with safe migration/compatibility behavior.
- Enforce the catalog-first workflow for new connector/splice creation while preserving legacy data loadability.
- Protect model integrity when catalog connection counts change.
- Finish with regression coverage, full validation, and `logics` synchronization.

# Scope
- In:
  - Wave-based orchestration for `req_051` backlog items (`item_311`..`item_318`)
  - Domain/store schema + migration/import fallback coordination
  - Catalog screen/nav integration + CRUD UI
  - Connector/splice catalog-first integration + safety guards
  - Onboarding adaptation + contextual help targets
  - Regression coverage, closure validation, and AC traceability
- Out:
  - Procurement/inventory workflows, pricing currency models, catalog analytics panels
  - Cross-network/shared catalog abstraction

# Backlog scope covered
- `logics/backlog/item_311_network_scoped_catalog_domain_model_store_schema_and_catalog_item_id_link_contract.md`
- `logics/backlog/item_312_catalog_persistence_migration_legacy_bootstrap_and_import_fallback_resolution.md`
- `logics/backlog/item_313_catalog_modeling_subscreen_navigation_icon_quick_nav_and_panel_composition.md`
- `logics/backlog/item_314_catalog_list_edit_form_crud_validation_url_and_v1_ergonomics.md`
- `logics/backlog/item_315_connector_splice_catalog_first_selector_derived_counts_and_integrity_guards.md`
- `logics/backlog/item_316_onboarding_catalog_step_insertion_catalog_first_guidance_and_contextual_actions.md`
- `logics/backlog/item_317_regression_coverage_for_catalog_screen_catalog_first_connector_splice_integration_and_legacy_fallback.md`
- `logics/backlog/item_318_req_051_catalog_screen_catalog_first_integration_closure_ci_build_and_ac_traceability.md`

# Attention points (mandatory delivery discipline)
- **Protect legacy compatibility:** load/import fallback must be deterministic and non-destructive.
- **Enforce uniqueness correctly:** `manufacturerReference` uniqueness is per-network catalog.
- **Protect live data integrity:** block unsafe connection-count reductions and unsafe catalog reassignment.
- **Keep new-flow strictness scoped:** catalog-first must apply to new entities without breaking legacy loads.
- **Align onboarding wording with real behavior:** do not leave connector/splice onboarding instructions inconsistent.
- **Final docs sync required:** request/task/backlog progress and closure notes must be updated.

# Recommended execution strategy (wave order)
Rationale:
- Establish schema/linking contract first so UI and migrations target a stable model.
- Implement migration/import fallback early to preserve compatibility before UI starts enforcing catalog-first.
- Introduce Catalog screen/nav and CRUD UI before connector/splice form hard-coupling.
- Add connector/splice integration and integrity guards once catalog CRUD exists.
- Adapt onboarding after Catalog UI target exists.
- Add regressions after runtime behavior stabilizes.

# Plan
- [ ] Wave 0. Network-scoped catalog domain model, store schema, and `catalogItemId` contracts (`item_311`)
- [ ] Wave 1. Persistence migration/import fallback, legacy bootstrap, and deterministic collision handling (`item_312`)
- [ ] Wave 2. Catalog modeling sub-screen navigation, icon, quick-nav, and panel composition (`item_313`)
- [ ] Wave 3. Catalog list/edit CRUD UI, validation, strict URL handling, and V1 ergonomics (`item_314`)
- [ ] Wave 4. Connector/splice catalog-first form integration, derived counts, and integrity guards (`item_315`)
- [ ] Wave 5. Onboarding catalog-step insertion and catalog-first guidance updates (`item_316`)
- [ ] Wave 6. Regression coverage for catalog, legacy fallback, connector/splice integration, and onboarding (`item_317`)
- [ ] Wave 7. Closure: full validation matrix, AC traceability, and `logics` synchronization (`item_318`)
- [ ] FINAL. Update related `.md` files to final state (request/task/backlog progress + delivery summary)

# Validation gates
## A. Minimum wave gate (apply after Waves 0-6)
- Static checks:
  - `npm run -s lint`
  - `npm run -s typecheck`
- Tests:
  - targeted suites for touched surfaces
- Persistence safety:
  - migration/hydration/import tests when persistence or import fallback logic changes

## B. Final closure gate (mandatory at Wave 7)
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:pwa`
- `npm run -s build`
- `npm run -s test:ci`
- `npm run -s test:e2e`

## C. Targeted test guidance (recommended during Waves 1-6)
- `npm run -s test -- src/tests/persistence.localStorage.spec.ts`
- `npm run -s test -- src/tests/app.ui.workspace-shell-regression.spec.tsx`
- `npm run -s test -- src/tests/app.ui.onboarding.spec.tsx`
- `npm run -s test -- src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `npm run -s test -- src/tests/app.ui.list-ergonomics.spec.tsx`
- Add dedicated catalog UI integration tests under `src/tests/app.ui.*`

## D. Commit gate (apply after each Wave 0-7 and FINAL docs sync if separate)
- Commit only after wave validation passes.
- Commit messages should reference `req_051` wave/scope.
- Update this task with wave status, validation snapshot, commit SHA, and deviations/defers after each wave.

# Cross-feature dependency / collision watchlist
- **Legacy bootstrap naming collisions**:
  - Risk: non-deterministic suffixes create rename churn or duplicate items.
- **Connector/splice reassignment safety**:
  - Risk: derived count shrink breaks occupancy/wire endpoints silently.
- **Catalog-first gating UX**:
  - Risk: users hit blocked create paths without clear CTA to Catalog.
- **Onboarding sequence drift**:
  - Risk: step count/order and contextual actions become inconsistent with implemented Catalog UI targets.
- **Import path parity**:
  - Risk: load path and import path behave differently for older data fallback.

# Mitigation strategy
- Use a stable legacy suffix naming convention and test repeated load/import behavior.
- Centralize capacity validation checks shared by catalog edits and connector/splice reassignment.
- Implement explicit no-catalog empty-state messaging and CTA routing.
- Update onboarding content and target wiring in the same wave as Catalog UI target stabilization.
- Add regression coverage for both persisted load and import fallback paths.

# Report
- Wave status:
  - Wave 0 (schema/link contract): pending
  - Wave 1 (migration/import fallback): pending
  - Wave 2 (Catalog nav/screen composition): pending
  - Wave 3 (Catalog CRUD UI/validation): pending
  - Wave 4 (connector/splice catalog-first integration): pending
  - Wave 5 (onboarding adaptation): pending
  - Wave 6 (regression coverage): pending
  - Wave 7 (closure + AC traceability): pending
  - FINAL (`.md` synchronization): pending
- Current blockers:
  - None.
- Main risks to track:
  - Legacy bootstrap collision naming determinism.
  - Integrity-guard false negatives on occupancy/endpoint usage checks.
  - UX dead-ends if connector/splice creation is blocked without clear Catalog CTA.
- Validation snapshot:
  - Not started.
- AC traceability (`req_051`) target mapping (planned):
  - AC1-AC4 -> `item_313`, verified in `item_317`/`item_318`
  - AC5-AC7 -> `item_314`, verified in `item_317`/`item_318`
  - AC8/AC8a/AC15 -> `item_312`, verified in `item_317`/`item_318`
  - AC9-AC11/AC13/AC14/AC18 -> `item_315`, verified in `item_317`/`item_318`
  - AC12 -> `item_316`, verified in `item_317`/`item_318`
  - AC16/AC17 -> `item_314` and/or `item_313`, verified in `item_317`/`item_318`
  - AC19 -> `item_317`, verified in `item_318`

# References
- `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
- `logics/backlog/item_311_network_scoped_catalog_domain_model_store_schema_and_catalog_item_id_link_contract.md`
- `logics/backlog/item_312_catalog_persistence_migration_legacy_bootstrap_and_import_fallback_resolution.md`
- `logics/backlog/item_313_catalog_modeling_subscreen_navigation_icon_quick_nav_and_panel_composition.md`
- `logics/backlog/item_314_catalog_list_edit_form_crud_validation_url_and_v1_ergonomics.md`
- `logics/backlog/item_315_connector_splice_catalog_first_selector_derived_counts_and_integrity_guards.md`
- `logics/backlog/item_316_onboarding_catalog_step_insertion_catalog_first_guidance_and_contextual_actions.md`
- `logics/backlog/item_317_regression_coverage_for_catalog_screen_catalog_first_connector_splice_integration_and_legacy_fallback.md`
- `logics/backlog/item_318_req_051_catalog_screen_catalog_first_integration_closure_ci_build_and_ac_traceability.md`
- `src/app/lib/onboarding.ts`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingFormsColumn.tsx`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/persistence/localStorage.ts`
- `src/tests/app.ui.onboarding.spec.tsx`
- `src/tests/persistence.localStorage.spec.ts`


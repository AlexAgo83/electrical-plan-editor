## item_317_regression_coverage_for_catalog_screen_catalog_first_connector_splice_integration_and_legacy_fallback - Regression Coverage for Catalog Screen, Catalog-First Connector/Splice Integration, and Legacy Fallback
> From version: 0.9.4
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: Regression safety for catalog navigation/UI, legacy bootstrap, and connector/splice catalog integration rules
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_051` touches navigation, onboarding, persistence migration, and connector/splice safety rules. Without dedicated regression coverage, behavior may silently regress across multiple subsystems.

# Scope
- In:
  - Add UI regression tests for Catalog nav access and ordering (nav row, drawer, quick nav if implemented).
  - Add UI tests for Catalog panel composition (no analysis panel).
  - Add Catalog CRUD form validation tests (required fields, URL strict validation, optional fields).
  - Add connector/splice integration tests:
    - catalog selector replaces free-text manufacturer reference
    - derived way/port count from catalog `connectionCount`
    - create blocked without catalog selection / no-catalog empty-state messaging
    - delete blocked when catalog item referenced
    - blocking on unsafe `connectionCount` reduction / reassignment
  - Add persistence migration/import fallback tests for legacy bootstrap + deterministic collision naming + `catalogItemId` resolution.
  - Add onboarding order/step tests for Catalog insertion and target CTA behavior.
- Out:
  - Full closure validation matrix / CI traceability record (handled in closure item).

# Acceptance criteria
- Regression tests cover catalog navigation/order and panel composition.
- Regression tests cover catalog CRUD validation and optional metadata support.
- Regression tests cover connector/splice catalog-first integration and safety guards.
- Regression tests cover legacy fallback bootstrap on load and import.
- Regression tests cover onboarding Catalog step insertion/order and CTA behavior.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Delivery snapshot:
  - Added catalog UI regression coverage in `src/tests/app.ui.catalog.spec.tsx` (nav/order, quick-nav, catalog-first blocking, URL validation, catalog->connector flow).
  - Added catalog reducer safety coverage in `src/tests/store.reducer.catalog.spec.ts` (propagation, delete guard, unsafe reduction guard).
  - Updated existing UI regressions for catalog-first workflow and shortcut/onboarding changes:
    - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
    - `src/tests/app.ui.navigation-canvas.spec.tsx`
    - `src/tests/app.ui.home.spec.tsx`
    - `src/tests/app.ui.settings-wire-defaults.spec.tsx`
  - Updated E2E smoke flow to create a catalog item before connector/splice creation: `tests/e2e/smoke.spec.ts`
- Dependencies: `req_051`, item_312, item_313, item_314, item_315, item_316.
- Blocks: item_318.
- Related AC: AC1-AC19.
- References:
  - `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.onboarding.spec.tsx`
  - `src/tests/persistence.localStorage.spec.ts`

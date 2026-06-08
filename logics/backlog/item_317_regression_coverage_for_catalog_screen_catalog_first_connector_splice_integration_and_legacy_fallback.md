## item_317_regression_coverage_for_catalog_screen_catalog_first_connector_splice_integration_and_legacy_fallback - Regression Coverage for Catalog Screen, Catalog-First Connector/Splice Integration, and Legacy Fallback
> From version: 0.9.4
> Status: Done
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

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: A `Catalog` modeling sub-screen exists and is accessible from the nav bar and drawer menu.
- request-AC2 -> This backlog slice. Evidence needed: The `Catalog` nav entry is positioned before `Connectors` / `Splices` / other entity sub-screen entries.
- request-AC3 -> This backlog slice. Evidence needed: The `Catalog` workspace screen reuses the expected modeling look-and-feel and includes `Network summary`, `Route preview`, `Catalog`, and `Edit catalog item` panels.
- request-AC4 -> This backlog slice. Evidence needed: The catalog screen does not render the analysis panel/column.
- request-AC5 -> This backlog slice. Evidence needed: `Manufacturer reference` is mandatory to save a catalog item.
- request-AC6 -> This backlog slice. Evidence needed: `Connection count` is mandatory to save a catalog item.
- request-AC7 -> This backlog slice. Evidence needed: `Name`, `Unit price (excl. tax)`, and `URL` are supported as optional inputs.
- request-AC8 -> This backlog slice. Evidence needed: Legacy saves with connectors/splices using `manufacturerReference` are backfilled into `Catalog` (using manufacturer ref + way/port count -> `connectionCount`) without duplicate churn.
- request-AC9 -> This backlog slice. Evidence needed: Connector/Splice forms use a catalog-backed manufacturer selector instead of free-text manufacturer reference.
- request-AC10 -> This backlog slice. Evidence needed: Connector `way` count and Splice `port` count are derived from the selected catalog item `connectionCount`.
- request-AC11 -> This backlog slice. Evidence needed: New connector/splice creation follows a `catalog-first` workflow (catalog item created/selected first), with legacy entities still supported via fallback resolution.
- request-AC12 -> This backlog slice. Evidence needed: Onboarding includes a new `Catalog` step in 2nd position (before the connectors/splices library step) with contextual target action(s) consistent with existing onboarding behavior.
- request-AC13 -> This backlog slice. Evidence needed: Catalog item deletion is blocked while referenced by a connector/splice.
- request-AC14 -> This backlog slice. Evidence needed: Catalog item `connectionCount` reduction is blocked when it would invalidate linked connector/splice way/port usage.
- request-AC15 -> This backlog slice. Evidence needed: Legacy fallback bootstrap behavior is applied consistently on both persisted load and import of older data.
- request-AC16 -> This backlog slice. Evidence needed: (Recommended V1) Catalog supports default sort by `manufacturerReference` and basic filtering on `manufacturerReference`/`name`.
- request-AC17 -> This backlog slice. Evidence needed: (Recommended V1) Catalog can open connector/splice creation flows prefilled from the selected catalog item.
- request-AC18 -> This backlog slice. Evidence needed: When no catalog item exists, connector/splice creation UI provides a clear blocking message and CTA to open/create catalog items.
- request-AC19 -> This backlog slice. Evidence needed: Regression tests cover navigation access/order, required-field validation, legacy fallback bootstrap, connector/splice catalog integration behavior, and onboarding step/order integration.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC9 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC10 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC11 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC12 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC13 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC14 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC15 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC16 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC17 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC18 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC19 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

## req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count - Catalog Screen with Catalog Item CRUD, Modeling Navigation Integration, and Required Manufacturer Reference/Connection Count
> From version: 0.9.4
> Understanding: 100% (validated on implementation closure)
> Confidence: 100% (implemented and validated)
> Complexity: Medium-High
> Theme: Introduce a catalog-focused modeling sub-screen with connector-like workspace composition and generic connection-count metadata
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

## Delivery status
- Implemented (task execution complete via `task_052`).
- Final validation completed:
  - `logics_lint`, `lint`, `typecheck`, `quality:ui-modularization`, `quality:store-modularization`, `quality:pwa`, `build`, `test:ci`, `test:e2e` all passed.

# Needs
- Add a new `Catalog` concept to manage reusable catalog objects independently from connector/splice type-specific forms.
- Expose a dedicated `Catalog` screen/sub-screen with the same look-and-feel as the current connector modeling workspace composition:
  - `Network summary`
  - `Route preview`
  - `Catalog` (translated from "Catalogue")
  - `Edit catalog item` (translated from "Edit catalogue")
- Do **not** include the analysis panel/column on this screen (it is not useful for catalog management).
- Make the new screen accessible from workspace navigation (nav bar + drawer menu) like `Connectors`, `Splices`, etc.
- Place the `Catalog` navigation button before `Connectors` / `Splices` / other entity sub-screen buttons.
- Support catalog item editing with required and optional fields matching the requested business constraints.
- Adapt onboarding to introduce a `Catalog` step before the current connectors/splices library step.

# Context
The app currently provides a unified modeling workspace with entity sub-screens (`Connectors`, `Splices`, `Nodes`, `Segments`, `Wires`) and a shared navigation model. The user now needs a generic `Catalog` capability to register reusable objects without forcing immediate specialization as connector vs splice.

This requires:
- a new domain concept (catalog item),
- a new modeling sub-screen entry and workspace panel composition,
- a dedicated create/edit form,
- validation rules aligned with catalog usage (`manufacturer reference` and connection count mandatory).

The request also introduces a generic connection terminology (`connection`) suitable for catalog objects that are not yet typed as connector/splice.

## Scope decision (confirmed)
- `Catalog` is **network-scoped** (not workspace-global).
- Rationale: simpler persistence alignment with existing network-scoped snapshots and resume behavior.

## UI wording decisions (English)
- Screen / panel list name: `Catalog`
- Edit panel name: `Edit catalog item`
- (recommended if shared create/edit form exists) create panel name: `Create catalog item`
- Generic count field label: `Connection count`
- Required reference label: `Manufacturer reference`
- Visual icon for `Catalog` navigation/UI: use `public/icons/ico_catalog.svg`

# Objectives
- Add a first-class `Catalog` sub-screen to the modeling workspace navigation.
- Provide a catalog list panel and create/edit panel with a connector-like workspace layout but without analysis panel.
- Enforce required inputs for `Manufacturer reference` and `Connection count`.
- Support optional metadata fields (`Name`, `Unit price (excl. tax)`, `URL`) for catalog item records.
- Maintain navigation consistency and drawer/menu behavior with existing modeling sub-screens.
- V1 pricing scope note:
  - `unitPriceExclTax` intentionally stores only a numeric amount without currency/tax schema coupling.

# Functional Scope
## A. Catalog domain model (high priority)
- Introduce a new persisted **network-scoped** catalog entity collection (name TBD by implementation, e.g. `catalogItems` under `NetworkScopedState`).
- Minimum catalog item fields:
  - `id` (internal app identifier)
  - `manufacturerReference` (required, non-empty after trim, **unique within the active network catalog**)
  - `connectionCount` (required, numeric, positive integer or project-standard minimum >= 1)
  - `name` (optional)
  - `unitPriceExclTax` (optional numeric field; `HT`, no currency stored)
  - `url` (optional string, strict URL validation)
- Define normalization/validation behavior for trims, empty strings, and numeric parsing.
- `connectionCount` contract (confirmed):
  - integer only
  - `>= 1`
- `manufacturerReference` uniqueness contract (confirmed):
  - duplicates are not allowed in the catalog for the same network.
- `unitPriceExclTax` format recommendation (confirmed direction):
  - UI input: numeric (`type="number"`)
  - validation: finite number, `>= 0`
  - step recommendation: `0.01`
  - persistence: `number | null`
- `url` validation contract (confirmed):
  - strict validation (`http://` / `https://` only recommended).
  - explicit V1 rule: `URL` must be empty or a valid absolute `http://` or `https://` URL.

## A1. Data constraints (explicit contract) (high priority)
- `manufacturerReference` is unique **per network catalog**.
- `connectionCount` is an integer and must be `>= 1`.
- New (non-legacy) `Connectors` and `Splices` must store a valid `catalogItemId`.
- New (non-legacy) `Connectors` and `Splices` must not rely on free-text manufacturer reference persistence.

## A2. Backward-compat fallback bootstrapping from existing connectors/splices (high priority)
- For older saved workspaces that predate the `Catalog` concept:
  - if existing `Connectors` and/or `Splices` contain `manufacturerReference` values that are not yet represented in `Catalog`,
    automatically create corresponding catalog items during migration/defaulting/hydration fallback.
- Auto-created catalog item derivation rules (V1):
  - source key must include at least:
    - `manufacturerReference`
    - connection count source (`cavityCount` for connectors / `portCount` for splices)
  - populate catalog `manufacturerReference` from the source entity `manufacturerReference`
  - populate catalog `connectionCount` from:
    - connector `way` count (`cavityCount`)
    - splice `port` count (`portCount`)
- Deduplication behavior must be explicitly defined in implementation:
  - because catalog `manufacturerReference` must be unique, bootstrap must avoid duplicate churn and must resolve conflicts deterministically.
  - repeated loads/migrations must not create additional duplicate items.
- Auto-created catalog items should not require a name/price/url to be generated.
- Conflict rule for legacy fallback (confirmed intent):
  - if multiple legacy entities produce the same `manufacturerReference` with different counts, create distinct catalog items by making the generated `manufacturerReference` unique using a deterministic prefix/suffix strategy (e.g. a legacy marker/count suffix).
  - the strategy must be stable to avoid rename churn on subsequent loads.
- Recommended naming pattern for collision resolution (V1):
  - append a readable deterministic suffix to preserve the original reference while ensuring uniqueness, e.g.:
    - `REF [legacy-8c]` for connector-derived bootstrap (`8` connections from connector way count)
    - `REF [legacy-6p]` for splice-derived bootstrap (`6` connections from splice port count)
- Auto-created legacy catalog items should **not** carry a special tag/flag in V1 unless required by implementation internals.
- Fallback execution scope (recommended and preferred):
  - apply the same bootstrap/resolution behavior both on:
    - persisted workspace load/migration
    - import of older networks/workspaces that predate catalog support
- Legacy resolution target contract:
  - after fallback bootstrap/resolution, legacy connectors/splices should resolve to a concrete `catalogItemId` link whenever a matching/bootstrapped catalog item exists.

## B. Modeling workspace integration (high priority)
- Add a new modeling sub-screen navigation entry: `Catalog`.
- Place `Catalog` before entity entries like `Connectors`, `Splices`, `Nodes`, `Segments`, `Wires`.
- Ensure it is reachable both:
  - in the visible nav bar row,
  - in the drawer menu mode (mobile/narrow screens).
- Use the dedicated catalog icon asset `public/icons/ico_catalog.svg` to represent the `Catalog` entry (nav row + drawer/menu, and any matching action button where applicable).
- Preserve current drawer behavior semantics (same UX rules as other modeling entries).
- Quick entity navigation strip recommendation (accepted):
  - include `Catalog` in the quick navigation strip
  - place it first (before `Connectors`) to reinforce the `catalog-first` workflow.

## C. Catalog workspace composition (high priority)
- Reuse the connector-like modeling screen layout/look-and-feel:
  - `Network summary` panel present
  - `Route preview` panel present (or the same top utility stack used in modeling)
  - `Catalog` list/table panel present
  - `Edit catalog item` panel present (shared create/edit panel acceptable)
- Explicitly omit the analysis panel for catalog.
- Keep layout responsive and aligned with existing modeling panel styling conventions.

## D. Catalog list and form behavior (high priority)
- Provide list panel for catalog items (`Catalog`) with row selection behavior consistent with existing entity lists.
- Provide create/edit form panel (`Edit catalog item`) with required field validation:
  - `Manufacturer reference` required
  - `Connection count` required
- Optional fields:
  - `Name`
  - `Unit price (excl. tax)` (`HT`)
  - `URL`
- Expected save behavior:
  - prevent save when required fields invalid/missing,
  - show validation feedback consistent with existing forms,
  - persist changes in store.
- Recommended V1 list ergonomics:
  - default sort by `manufacturerReference` ascending
  - include a filter/search input (minimum scope: `manufacturerReference` + `name`)
- Recommended V1 row actions / linked creation actions:
  - provide `Create Connector` and `Create Splice` actions from the selected catalog item (or catalog row actions)
  - these actions should open the corresponding create form prefilled with `catalogItemId`
- Recommended V1 edit affordances:
  - if a valid `url` is present, provide an `Open link` action/button (`target="_blank"`, `rel="noopener noreferrer"`)
- Optional V1 enhancement (nice-to-have):
  - `Duplicate catalog item` action; if implemented, duplicated records must require a unique `manufacturerReference` before save.

## D2. Connector/Splice form integration with Catalog (high priority)
- Replace free-text `Manufacturer reference` input in `Connectors` and `Splices` forms with a selector bound to `Catalog` items (or to catalog manufacturer references, depending on implementation shape).
- Connector/Splice forms should persist `catalogItemId` (confirmed) instead of a free-typed manufacturer reference string.
- The displayed `Manufacturer reference` value in connector/splice forms should come from the selected catalog item.
- Selector display contract (confirmed):
  - show catalog item `manufacturerReference` in the selector UI.
- Replace manual `way/port count` entry in connector/splice create/edit forms with the `connectionCount` value from the selected catalog item:
  - connector `way` count derives from catalog `connectionCount`
  - splice `port` count derives from catalog `connectionCount`
- When catalog selection changes, the derived connector/splice count updates accordingly.
- `catalogItemId` reference design consequence (confirmed):
  - changing a catalog item `manufacturerReference` remains safe for referencing connectors/splices because links are ID-based.
- Validation rules must ensure:
  - a valid catalog selection is present when required by connector/splice form flow,
  - derived counts remain consistent with catalog source data.
- Backward compatibility behavior for existing connectors/splices:
  - hydrated legacy entities with `manufacturerReference` + existing `way/port` count must resolve to the bootstrapped/created catalog item when possible.
- Edit propagation contract (confirmed):
  - catalog item updates propagate to all linked connectors/splices (total propagation).
  - if `connectionCount` is reduced, implementation must validate that no linked connector/splice currently relies on ways/ports beyond the proposed new count.
  - if such usage exists, block the catalog save/update and show a clear validation message describing impacted entities/usages.
- Delete contract (confirmed):
  - deleting a catalog item is forbidden while it is referenced by any connector/splice.
- Connector/Splice catalog reassignment recommendation (V1):
  - changing `catalogItemId` in edit mode on an existing connector/splice is allowed only if it does not break existing way/port usage constraints.
  - if the newly selected catalog item has a smaller `connectionCount` than required by current occupancy/usage, block the reassignment and explain why.
- Occupancy/links safety rule (confirmed direction):
  - any operation (catalog edit or connector/splice catalog reassignment) that would reduce usable way/port range below already-used indices must be blocked.
- Breaking usage definition (explicit):
  - blocking validation must cover at least:
    - connector cavity occupancy / splice port occupancy on an index greater than the proposed/new `connectionCount`
    - wire endpoint references that target a way/port index greater than the proposed/new `connectionCount`

## D3. Workflow contract (Catalog-first) (high priority)
- Define and enforce a `catalog-first` creation workflow for new data:
  1. create/select a `Catalog` item first
  2. create a `Connector` or `Splice` from that catalog selection
- For newly created connectors/splices (non-legacy flows), catalog selection is the source of truth for:
  - `Manufacturer reference`
  - `way/port` count (via catalog `connectionCount`)
- Recommended UX behavior when no catalog item exists yet:
  - clearly guide the user to create a catalog item first (empty-state CTA or inline validation message).
  - recommended implementation:
    - disable `New` in `Connectors` / `Splices`
    - show message such as: `Create a catalog item first to define manufacturer reference and connection count.`
    - provide CTA(s): `Open Catalog` and optionally `Create catalog item`
- Legacy compatibility exception:
  - existing persisted connectors/splices remain loadable through fallback bootstrap/resolution and are not blocked by the new flow.
- New-flow restriction (confirmed):
  - creating a new connector/splice without a valid catalog selection is not allowed.

## E. Navigation and interaction consistency (medium priority)
- Switching into/out of `Catalog` should follow unified modeling navigation patterns (selection/form visibility behavior consistent with screen rules).
- Keyboard shortcuts and quick-nav interactions should not regress; explicit new shortcut mapping is optional unless required by current nav architecture.
- `Catalog` should participate in modeling navigation ergonomics similarly to other entity sub-screens (nav row, drawer, and quick-nav strip if implemented there).

## E2. Onboarding adaptation (high priority)
- Update the onboarding flow to add a new `Catalog` step in `2nd` position, immediately before the current step:
  - `Build the connectors and splices library`
- The onboarding full-flow sequence should therefore insert `Catalog` after network creation and before connector/splice creation guidance.
- The onboarding step count/progress label must be updated accordingly (e.g. `Step X of 6` if no other steps are added/removed).
- Add a contextual single-step onboarding entry point for the `Catalog` panel, using the same onboarding modal patterns as existing modeling panels.

### Proposed onboarding step content (for implementation guidance)
- Step title: `Create catalog items first`
- Badge: `CAT`
- Badge icon class (recommended): catalog-specific icon wiring aligned with `public/icons/ico_catalog.svg`
- Description (same style as existing onboarding descriptions):
  - "Create " + **catalog items** + " first to define reusable manufacturer references and connection counts before creating connectors or splices. New connector/splice creation then reuses the selected catalog item."
- Primary target (recommended):
  - screen: `modeling`
  - sub-screen: `catalog` (new)
  - panel selector: `[data-onboarding-panel="modeling-catalog"]`
  - panel label: `Catalog`
- Target actions (same spirit as existing onboarding target buttons):
  - `Open Catalog` / `Scroll to Catalog` (depending on whether already in context)
  - `Open Edit catalog item` / `Scroll to Edit catalog item` (recommended secondary action if the edit panel is distinct and visible)

### Onboarding flow wording adjustment (follow-up to existing step)
- The current `Build the connectors and splices library` onboarding step content should be updated to reflect the `catalog-first` workflow:
  - connectors/splices are created from catalog items rather than fully defining manufacturer reference and way/port counts directly in connector/splice forms.
- Full-flow confirmation (confirmed):
  - onboarding expands from `5` to `6` steps with the new `Catalog` step inserted at position `2`.

## F. Tests and regression coverage (high priority)
- Add regression/integration coverage for:
  - `Catalog` nav entry presence and order in modeling navigation
  - drawer/menu access to `Catalog`
  - catalog form required-field validation (`Manufacturer reference`, `Connection count`)
  - create/edit flow with optional fields (`Name`, `Unit price (excl. tax)`, `URL`)
  - workspace layout composition (analysis panel absent, expected panels present)
  - legacy save fallback bootstrap: connectors/splices with `manufacturerReference` create missing catalog items on load
  - connector/splice form replacement behavior:
    - manufacturer reference selector uses catalog data
    - way/port count is derived from selected catalog item `connectionCount`
    - connector/splice creation is blocked when no catalog item exists/selected (new-flow path)
    - catalog item deletion is blocked when referenced
    - catalog `connectionCount` reduction is blocked when it would break linked connector/splice way/port usage
    - connector/splice catalog reassignment is blocked when it would break linked way/port usage
  - onboarding adaptation:
    - new `Catalog` step exists in 2nd position (before connectors/splices library step)
    - onboarding progress count/order updates correctly
    - onboarding target CTA opens/scrolls to `Catalog` panel (and optional edit panel action if implemented)
  - recommended V1 catalog ergonomics (if adopted):
    - default sort + filter/search
    - `Create Connector` / `Create Splice` actions from catalog
    - legacy fallback execution on import path as well as load/migration
- Ensure responsive/nav regression tests remain deterministic.

# Non-functional requirements
- Preserve existing modeling workspace performance and navigation responsiveness.
- Keep UI wording consistent in English (`Catalog`, `Edit catalog item`).
- Reuse existing panel/list/form patterns where possible to reduce UI inconsistency and maintenance cost.
- Avoid introducing connector/splice terminology (`way`, `port`) in the catalog form; use generic `connection` wording.
- Preserve legacy data loading behavior through automatic catalog backfill and entity-to-catalog resolution.
- Keep legacy fallback bootstrap deterministic (no repeated rename/churn across reloads for auto-created catalog items).

# Validation and regression safety
- Targeted tests (minimum, depending on implementation split):
  - `src/tests/app.ui.navigation-canvas.spec.tsx` (if nav row behavior is touched)
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx` (drawer/nav behavior)
  - new/updated catalog UI integration tests under `src/tests/app.ui.*`
  - relevant store reducer tests if a new catalog entity collection is added
  - persistence migration/defaulting tests under `src/tests/persistence.*` for legacy connector/splice fallback bootstrap
- Recommended closure validation:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s test:ci`
  - `npm run -s build`

# Acceptance criteria
- AC1: A `Catalog` modeling sub-screen exists and is accessible from the nav bar and drawer menu.
- AC2: The `Catalog` nav entry is positioned before `Connectors` / `Splices` / other entity sub-screen entries.
- AC3: The `Catalog` workspace screen reuses the expected modeling look-and-feel and includes `Network summary`, `Route preview`, `Catalog`, and `Edit catalog item` panels.
- AC4: The catalog screen does not render the analysis panel/column.
- AC5: `Manufacturer reference` is mandatory to save a catalog item.
- AC6: `Connection count` is mandatory to save a catalog item.
- AC7: `Name`, `Unit price (excl. tax)`, and `URL` are supported as optional inputs.
- AC8: Legacy saves with connectors/splices using `manufacturerReference` are backfilled into `Catalog` (using manufacturer ref + way/port count -> `connectionCount`) without duplicate churn.
- AC8a: When legacy fallback would create multiple catalog items from the same legacy `manufacturerReference` with different counts, generated catalog `manufacturerReference` values are made uniquely and deterministically distinguishable.
- AC9: Connector/Splice forms use a catalog-backed manufacturer selector instead of free-text manufacturer reference.
- AC10: Connector `way` count and Splice `port` count are derived from the selected catalog item `connectionCount`.
- AC11: New connector/splice creation follows a `catalog-first` workflow (catalog item created/selected first), with legacy entities still supported via fallback resolution.
- AC12: Onboarding includes a new `Catalog` step in 2nd position (before the connectors/splices library step) with contextual target action(s) consistent with existing onboarding behavior.
- AC13: Catalog item deletion is blocked while referenced by a connector/splice.
- AC14: Catalog item `connectionCount` reduction is blocked when it would invalidate linked connector/splice way/port usage.
- AC15: Legacy fallback bootstrap behavior is applied consistently on both persisted load and import of older data.
- AC16: (Recommended V1) Catalog supports default sort by `manufacturerReference` and basic filtering on `manufacturerReference`/`name`.
- AC17: (Recommended V1) Catalog can open connector/splice creation flows prefilled from the selected catalog item.
- AC18: When no catalog item exists, connector/splice creation UI provides a clear blocking message and CTA to open/create catalog items.
- AC19: Regression tests cover navigation access/order, required-field validation, legacy fallback bootstrap, connector/splice catalog integration behavior, and onboarding step/order integration.

## Out of scope
- Automatic transformation of catalog items into connectors/splices.
- Pricing/tax engine behavior beyond storing an optional unit price excluding tax.
- Supplier management, stock/inventory, or procurement workflows.
- Import/export format for catalog items (unless explicitly requested later).
- Full catalog-to-connector/splice variant modeling (e.g. per-family compatibility rules) beyond basic manufacturer reference + connection count linkage.
- Catalog analysis panel/screen analytics (explicitly not needed in V1).

# Backlog
- `logics/backlog/item_311_network_scoped_catalog_domain_model_store_schema_and_catalog_item_id_link_contract.md`
- `logics/backlog/item_312_catalog_persistence_migration_legacy_bootstrap_and_import_fallback_resolution.md`
- `logics/backlog/item_313_catalog_modeling_subscreen_navigation_icon_quick_nav_and_panel_composition.md`
- `logics/backlog/item_314_catalog_list_edit_form_crud_validation_url_and_v1_ergonomics.md`
- `logics/backlog/item_315_connector_splice_catalog_first_selector_derived_counts_and_integrity_guards.md`
- `logics/backlog/item_316_onboarding_catalog_step_insertion_catalog_first_guidance_and_contextual_actions.md`
- `logics/backlog/item_317_regression_coverage_for_catalog_screen_catalog_first_connector_splice_integration_and_legacy_fallback.md`
- `logics/backlog/item_318_req_051_catalog_screen_catalog_first_integration_closure_ci_build_and_ac_traceability.md`

# Orchestration task
- `logics/tasks/task_052_req_051_catalog_screen_and_catalog_first_connector_splice_integration_orchestration_and_delivery_control.md`

# References
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingFormsColumn.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/components/network-summary/NetworkRoutePreviewPanel.tsx`
- `src/app/lib/onboarding.ts`
- `src/app/components/onboarding/OnboardingModal.tsx`
- `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.workspace-shell-regression.spec.tsx`

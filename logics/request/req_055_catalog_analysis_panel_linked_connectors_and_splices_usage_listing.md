## req_055_catalog_analysis_panel_linked_connectors_and_splices_usage_listing - Catalog Analysis Panel: Linked Connectors and Splices Usage Listing
> From version: 0.9.5
> Understanding: 100% (analysis defaults clarified + backlog/task linkage added)
> Confidence: 97% (analysis interaction contract narrowed and decomposed)
> Complexity: Medium
> Theme: Add an Analysis panel to the Catalog screen to inspect connector/splice usage of the selected catalog item
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- The current `Catalog` screen (introduced by `req_051`) intentionally omits the analysis panel.
- Users now need an analysis view in `Catalog` to understand where a catalog item is used.
- The analysis should list `Connectors` and `Splices` that reference the selected catalog item.

# Context
`req_051` introduced a network-scoped `Catalog` and `catalogItemId` links from `Connectors` / `Splices`. This makes usage analysis straightforward and valuable:
- impact analysis before editing a catalog item,
- visibility before attempting deletion (which is blocked when referenced),
- faster navigation from a catalog item to dependent entities.

This request reverses one UX decision from `req_051` ("no analysis panel for Catalog") and adds a focused `Catalog`-specific analysis panel.

# Objective
- Add a `Catalog` analysis panel to the `Catalog` screen, aligned with the look-and-feel of analysis panels in other modeling sub-screens.
- List linked `Connectors` and `Splices` for the selected catalog item.
- Support selection/navigation actions from the analysis list to the referenced entities.

# Functional scope
## A. Catalog screen layout update (high priority)
- Update the `Catalog` screen composition to include an analysis panel/column (like other modeling screens).
- Preserve existing `Catalog` list + edit panel behavior.
- Keep responsive behavior consistent with existing modeling/analysis layouts (desktop + drawer/mobile variants).

## B. Catalog usage analysis content (high priority)
- When a catalog item is selected, the analysis panel lists all linked entities referencing its `catalogItemId`, including:
  - `Connectors`
  - `Splices`
- Each entry should identify:
  - entity type (`Connector` / `Splice`)
  - user-visible label/name (or fallback technical identifier if unnamed)
  - technical identifier (`technicalId`)
  - key reference metadata useful for quick scanning (implementation choice, consistent with existing analysis rows)
- V1 row identity recommendation (accepted):
  - display `name` and `technicalId` together when available to reduce ambiguity in dense catalogs
- V1 grouping contract:
  - grouped sections by entity type (`Connectors`, `Splices`) (two distinct sections, not a single mixed table)
  - show empty-state text when no linked entities exist
- Recommended V1 summary (low-cost enhancement, include if layout permits without churn):
  - lightweight usage summary in the panel header/body (e.g. `X connectors / Y splices`)

## C. Interaction and navigation (high priority)
- Selecting/clicking an analysis row should navigate/open the corresponding entity edit panel (`Connector` or `Splice`) using existing modeling navigation patterns.
- V1 navigation mode contract:
  - open `Modeling` on the target entity sub-screen (connector/splice) with the selected entity focused
  - do not force a dedicated `analysis` screen transition for this interaction
- If the current app pattern uses `Go to` buttons in analysis tables, reuse the same interaction style for consistency.
- Returning to `Catalog` should preserve expected selection behavior where feasible (no regression requirement on existing navigation flows).

## D. Analysis state behavior (medium priority)
- If no catalog item is selected:
  - show a neutral placeholder/empty state in the analysis panel (e.g. `Select a catalog item to inspect usage.`).
- Analysis content must update immediately when:
  - selected catalog item changes,
  - connectors/splices are created/deleted/reassigned to another catalog item,
  - catalog item is deleted (panel should reset accordingly).

## E. Data integrity and consistency (medium priority)
- The analysis panel is read-only (no direct mutation actions required in V1).
- It should reflect current store state, including legacy/imported data after fallback resolution.
- If corrupted references exist (e.g. broken `catalogItemId`), behavior should remain safe:
  - do not crash the panel
  - simply omit non-resolvable links from usage list or surface a safe fallback row (implementation choice)
- If `req_053` is implemented, validation remains the primary place for catalog-link integrity errors; this panel is primarily usage visibility.

# Non-functional requirements
- Efficient filtering/indexing for linked entities (avoid full recomputation churn beyond typical app patterns).
- Consistent styling with existing analysis panels (theme-aware, responsive, table/list readability).
- No regressions to current `Catalog` screen CRUD flows or `catalog-first` connector/splice creation flow.

# Validation and regression safety
- Add/extend tests for:
  - selected catalog item shows linked connectors and linked splices in analysis panel
  - analysis rows expose enough identity to distinguish entities (`name` + `technicalId`, with fallback when name missing)
  - no selection -> analysis empty-state placeholder
  - no linked entities -> analysis empty-state for selected item
  - clicking a linked connector/splice in analysis opens the correct entity screen/panel
  - analysis refreshes after connector/splice reassignment to another catalog item
  - existing catalog CRUD and navigation behavior remain unchanged

# Acceptance criteria
- AC1: The `Catalog` screen includes an analysis panel/column consistent with other modeling screens.
- AC2: Selecting a catalog item displays linked `Connectors` and `Splices` that reference that item.
- AC3: Analysis entries support navigation to the corresponding connector/splice edit flow.
- AC3a: Catalog analysis row navigation opens the target entity in `Modeling` mode on the correct connector/splice sub-screen.
- AC4: The analysis panel handles no-selection and no-usage cases with clear empty states.
- AC5: Catalog CRUD behavior and catalog-first connector/splice creation workflow remain functional after the layout change.

# Out of scope
- Aggregated metrics/charts for catalog usage (counts by type, cost rollups, etc.).
- In-panel bulk operations on linked connectors/splices.
- Validation/error surfacing for broken catalog links (covered by `req_053` if implemented).

# Backlog
- `logics/backlog/item_326_catalog_analysis_panel_composition_usage_sections_and_usage_summary_for_selected_catalog_item.md`
- `logics/backlog/item_327_catalog_analysis_row_navigation_to_connector_splice_modeling_and_reactive_usage_refresh.md`
- `logics/backlog/item_328_regression_coverage_for_catalog_analysis_panel_usage_listing_and_navigation.md`
- `logics/backlog/item_332_req_052_to_req_056_catalog_follow_ups_bundle_closure_ci_build_and_ac_traceability.md`

# Orchestration task
- `logics/tasks/task_053_req_052_to_req_056_catalog_follow_ups_bundle_orchestration_and_delivery_control.md`

# References
- `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
- `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
- `src/app/components/workspace/ModelingCatalogListPanel.tsx`
- `src/app/components/workspace/ModelingCatalogFormPanel.tsx`
- `src/app/hooks/useCatalogHandlers.ts`
- `src/app/AppController.tsx`
- `src/tests/app.ui.catalog.spec.tsx`

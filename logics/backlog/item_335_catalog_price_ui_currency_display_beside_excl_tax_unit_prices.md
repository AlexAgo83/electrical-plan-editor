## item_335_catalog_price_ui_currency_display_beside_excl_tax_unit_prices - Catalog price UI currency display beside excl-tax unit prices
> From version: 0.9.6
> Understanding: 94%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Catalog UX pricing clarity with explicit currency display for excl-tax unit prices
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Catalog unit prices are shown as numeric excl-tax values without explicit currency context in the catalog UI. This creates ambiguity, especially once currency becomes configurable in settings.

# Scope
- In:
  - Show the selected workspace currency statically next to catalog `Unit price (excl. tax)` in catalog UI.
  - Apply display convention from `req_057`:
    - prefer symbol next to value (`€`)
    - allow code (`EUR`) in labels/headers/help text where clearer
  - Keep field semantics and storage unchanged (`unitPriceExclTax` remains numeric excl-tax).
  - Ensure catalog list/form rendering updates reflect settings changes.
  - Add/update UI tests for currency display in catalog surfaces.
- Out:
  - Currency/tax settings persistence and toggle behavior (handled in `item_333`).
  - BOM TTC export columns/totals (handled in `item_334`).

# Acceptance criteria
- Catalog UI displays explicit currency context next to `Unit price (excl. tax)` values/labels.
- Value-adjacent price rendering prefers the currency symbol where supported (e.g. `€` for `EUR`).
- Labels/metadata may use currency code (`EUR`) when more readable.
- Catalog CRUD flows continue to work without changing `unitPriceExclTax` storage semantics.
- Currency display responds to settings value changes without requiring data migration.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_057`, `item_333`, `req_051`.
- Blocks: `task_054` final validation/closure.
- Related AC: req_057 AC3, AC6.
- References:
  - `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
  - `logics/request/req_057_catalog_and_bom_settings_currency_and_tax_defaults.md`
  - `src/app/components/workspace/ModelingCatalogFormPanel.tsx`
  - `src/app/components/workspace/ModelingCatalogListPanel.tsx`
  - `src/tests/app.ui.catalog.spec.tsx`

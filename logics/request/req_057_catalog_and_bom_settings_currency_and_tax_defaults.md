## req_057_catalog_and_bom_settings_currency_and_tax_defaults - Catalog and BOM settings currency and tax defaults
> From version: 0.9.6
> Understanding: 95% (user intent captured: Settings-level currency + VAT/tax config for Catalog and BOM workflows)
> Confidence: 90% (UI placement clear, pricing semantics aligned with existing excl-tax catalog model)
> Complexity: Medium
> Theme: Settings / Catalog / BOM Pricing
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Users need a configurable `currency` and `tax rate` (e.g. VAT / `TVA`) in `Settings`.
- Users need tax configuration to be optional (tax can be disabled in `Settings`).
- These settings should be grouped in a dedicated configuration section for `Catalog` and `BOM` workflows (for example `Catalog & BOM setup`).
- The catalog/BOM pricing UX currently stores and exports `unitPriceExclTax` but lacks explicit currency/tax defaults, which limits clarity for pricing interpretation.
- Users need the selected currency to be displayed statically next to catalog `Unit price (excl. tax)` values/labels.
- Users need BOM outputs to include `TTC` pricing (a `TTC` column and a `Total TTC` summary).
- When tax is disabled in `Settings`, users no longer need `TTC` columns/totals in the BOM output.

# Context
`req_051` introduced catalog item pricing via `unitPriceExclTax` and explicitly kept pricing storage decoupled from currency/tax schema.
`req_056` added BOM CSV export with excl-tax totals, but the exported pricing remains currency-agnostic and tax-agnostic in V1.

The user now wants a settings-level configuration for:
- currency (display/export context),
- tax rate (e.g. VAT / `TVA` percentage),
and suggests a dedicated settings section focused on catalog/BOM setup.

This request should preserve the existing numeric `unitPriceExclTax` model while adding user-configurable pricing context and tax defaults for UI/BOM behavior.

# Objective
- Add a new `Settings` section (recommended label: `Catalog & BOM setup`) that lets users configure:
  - a default currency,
  - a default tax rate percentage (VAT / `TVA`).
- Persist these settings and reuse them in catalog/BOM pricing presentation and export metadata.
- Keep catalog item storage (`unitPriceExclTax`) tax-exclusive and numeric in V1.

# Functional scope
## A. New Settings section: Catalog & BOM setup (high priority)
- Add a dedicated settings panel/section for catalog/BOM pricing configuration.
- Recommended section title:
  - `Catalog & BOM setup`
- The section should be discoverable from the existing `Settings` screen and follow current settings layout/styling conventions.
- V1 fields:
  - `Currency` (required selection, deterministic default)
  - `Enable tax / VAT (TVA)` (boolean toggle)
  - `Tax rate (%)` (numeric input, `>= 0`, supports decimals; required only when tax is enabled)
- Tax field UX contract (V1):
  - when tax is disabled, `Tax rate (%)` remains visible but disabled/greyed out
  - the last configured tax value is preserved for fast re-enable
- V1 helper copy should clarify semantics:
  - catalog prices remain stored as `excl. tax` amounts
  - tax rate is used for BOM/display calculations (not for changing stored catalog unit prices)
  - disabling tax hides TTC pricing outputs in BOM workflows

## B. Currency configuration contract (high priority)
- Store currency as a stable code (recommended `ISO 4217`, e.g. `EUR`, `USD`, `GBP`).
- V1 should provide a small curated list of common currencies (at minimum):
  - `EUR`
  - `USD`
  - `GBP`
  - `CAD`
  - `CHF`
- V1 may optionally allow a broader list later, but this request only requires a stable selection contract and deterministic defaults.
- V1 default currency (mandated):
  - `EUR`
- Display convention (V1):
  - prefer currency symbol when shown directly next to a numeric value (e.g. `€`)
  - use currency code (`EUR`) in labels, settings selectors, headers, or export metadata where clarity is better than symbol-only display

## C. Tax rate configuration contract (high priority)
- Tax support is optional in V1 and controlled by a persisted setting toggle.
- Tax rate is stored as a numeric percentage (e.g. `20` for 20% VAT / `TVA`).
- Validation:
  - when tax is enabled: must be a valid number
  - when tax is enabled: must be `>= 0`
  - when tax is enabled: decimals allowed (e.g. `5.5`, `19.6`, `20`)
- When tax is disabled:
  - tax rate may remain stored as the last configured value for convenience
  - tax rate is ignored by BOM TTC calculations and TTC columns/totals are not shown/exported
  - settings UI keeps the tax rate field visible but disabled/greyed out
- Recommended V1 upper bound guardrail:
  - allow up to `1000` to avoid over-constraining edge cases while still rejecting malformed input
- V1 default tax rate (mandated):
  - `20` (French VAT / `TVA` baseline default)
- V1 default tax enabled state (mandated):
  - `enabled`

## D. Persistence and scope semantics (high priority)
- Persist currency and tax settings in the same persistence system as other settings/preferences (local persistence and restored on reload).
- V1 scope decision (mandated):
  - workspace-level persisted settings (not per-network)
- Changing currency/tax settings must not mutate catalog item raw stored prices (`unitPriceExclTax`) or network model entities.
- Import/export and migration behavior:
  - older saves without these settings should load with deterministic defaults
  - missing/malformed persisted values should be normalized to safe defaults

## E. Catalog UI interplay (medium priority)
- Catalog UI should reflect pricing context more clearly after settings are added.
- V1 minimum requirements:
  - surface selected currency and tax rate in catalog-related settings/help copy or panel annotations
  - display the selected currency statically next to catalog `Unit price (excl. tax)` pricing UI (list and/or form labels/value presentation)
- When tax is disabled:
  - catalog pricing remains HT-only with no TTC hints required in catalog UI
- V1 display contract (mandatory):
  - the currency display must be explicit and static in the catalog UI (not inferred only from settings)
  - keep stored field semantics as `Unit price (excl. tax)`
- Examples:
  - `Unit price (excl. tax, EUR)`
  - a value cell/label presentation showing currency next to the amount (prefer symbol next to value, e.g. `12.00 €`)
  - `Tax rate (VAT/TVA): 20%` shown in settings section
- Do not change the catalog data model field name in V1.

## F. BOM/UI export interplay (medium-high priority)
- BOM workflows should use the configured currency/tax defaults as pricing context.
- V1 minimum integration (mandatory):
  - expose currency and tax rate in BOM export metadata/context (e.g. header rows or summary rows)
  - make the exported pricing context explicit so CSV consumers know how to interpret totals
  - keep existing HT pricing columns/totals from `req_056`
  - when tax is enabled: add a `TTC` pricing column (recommended label: `Line total (incl. tax)` or explicit `Line total TTC`)
  - when tax is enabled: add a `Total TTC` summary row/value in the BOM export (in addition to existing HT totals)
- Calculation/display contract (mandatory):
  - when tax is enabled: compute TTC values from excl-tax prices using the configured tax rate
  - when tax is enabled: TTC calculations must be deterministic and clearly labeled with currency + tax rate context
  - when tax is disabled: BOM export remains HT-only and must omit TTC column/total
- Rows with missing `unitPriceExclTax`:
  - remain exported per `req_056` behavior
  - keep excl-tax and TTC totals blank for that row (no forced zero)

## G. Data model compatibility and migration guardrails (medium priority)
- Keep catalog item `unitPriceExclTax` unchanged as the source amount (numeric, excl-tax).
- Avoid coupling currency/tax directly into each catalog item in V1 (no per-item currency override, no mixed-currency catalog).
- Add backward-compatible migration/normalization for new settings keys.
- Ensure BOM generation remains safe when:
  - tax rate is missing/malformed in persisted settings,
  - currency is missing/unsupported,
  - catalog items are unpriced.

# Non-functional requirements
- Deterministic defaults and formatting for restored settings and exports.
- No regressions in existing `Catalog` CRUD flows or `BOM CSV` export when pricing settings are left at defaults.
- Minimal UX friction: fields should be understandable without accounting expertise.

# Validation and regression safety
- Add/extend tests for:
  - settings screen shows a dedicated `Catalog & BOM setup` section (or equivalent approved label)
  - currency selection persists across reload/remount
  - tax enable/disable toggle persists across reload/remount
  - tax rate input validates numeric values and persists across reload/remount (when enabled)
  - when tax is disabled, `Tax rate (%)` remains visible and disabled/greyed out, and preserves the previous value
  - invalid/malformed persisted currency/tax values normalize to safe defaults
  - catalog pricing flows remain functional with configured currency/tax defaults
  - catalog UI displays the selected currency statically next to `Unit price (excl. tax)` (label and/or rendered value presentation per chosen implementation contract)
  - BOM export remains functional and includes explicit pricing context (currency and tax rate metadata)
  - BOM export preserves existing HT columns/totals and conditionally adds TTC column/total only when tax is enabled
  - BOM export includes a TTC line column and a `Total TTC` summary with deterministic calculation from configured tax rate when tax is enabled
  - BOM export omits TTC column/total when tax is disabled
  - legacy saves without the new settings keys remain backward-compatible

# Acceptance criteria
- AC1: `Settings` includes a dedicated section for catalog/BOM pricing setup with configurable `Currency` and `Tax rate (%)`.
- AC1a: The section includes a tax enable/disable control, and `Tax rate (%)` is required only when tax is enabled.
- AC1b: When tax is disabled, the `Tax rate (%)` field remains visible but disabled/greyed out and preserves the last configured value.
- AC2: Currency, tax enabled state, and tax rate settings are persisted and restored across app reloads.
- AC2a: V1 defaults are `Currency = EUR`, `Tax enabled = true`, and `Tax rate = 20%` (French VAT / `TVA` baseline).
- AC3: Catalog UI displays the selected currency statically next to `Unit price (excl. tax)` while catalog item prices remain stored as excl-tax numeric amounts; value-adjacent displays prefer the currency symbol and labels/metadata may use the code.
- AC4: BOM workflows/export use the configured currency/tax values as explicit pricing context, preserve HT outputs, and include a TTC line column plus a `Total TTC` summary only when tax is enabled.
- AC4a: When tax is disabled in `Settings`, BOM workflows/export omit TTC column/total and remain HT-only.
- AC5: Missing or malformed persisted currency/tax settings fall back to deterministic safe defaults without breaking load.
- AC6: Existing catalog CRUD and BOM export behaviors remain functional under default and customized settings values.

# Out of scope
- Currency conversion / exchange-rate fetching.
- Per-network or per-catalog-item currency overrides.
- Country-specific tax rule engines (multiple tax bands, exemptions, compound taxes).
- Locale-specific invoicing/accounting formats beyond simple pricing context and deterministic labeling.

# Backlog
- `logics/backlog/item_333_settings_catalog_and_bom_pricing_setup_with_workspace_currency_and_optional_tax_persistence.md`
- `logics/backlog/item_334_bom_csv_ttc_column_and_total_with_tax_enabled_conditional_export_behavior.md`
- `logics/backlog/item_335_catalog_price_ui_currency_display_beside_excl_tax_unit_prices.md`

# Orchestration task
- `logics/tasks/task_054_req_057_catalog_and_bom_pricing_settings_orchestration_and_delivery_control.md`

# References
- `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
- `logics/request/req_054_default_seed_catalog_items_on_new_network_creation_for_catalog_first_bootstrap.md`
- `logics/request/req_056_bom_csv_export_from_network_summary_header_for_rendered_catalog_backed_components.md`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/components/workspace/ModelingCatalogFormPanel.tsx`
- `src/app/components/workspace/ModelingCatalogListPanel.tsx`
- `src/app/lib/networkSummaryBomCsv.ts`
- `src/store/catalog.ts`

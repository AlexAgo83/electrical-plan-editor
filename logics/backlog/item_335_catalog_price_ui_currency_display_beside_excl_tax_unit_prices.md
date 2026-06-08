## item_335_catalog_price_ui_currency_display_beside_excl_tax_unit_prices - Catalog price UI currency display beside excl-tax unit prices
> From version: 0.9.6
> Status: Done
> Understanding: 94%
> Confidence: 92%
> Progress: 100%
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
- request-AC1 -> This backlog slice. Evidence needed: `Settings` includes a dedicated section for catalog/BOM pricing setup with configurable `Currency` and `Tax rate (%)`.
- request-AC2 -> This backlog slice. Evidence needed: Currency, tax enabled state, and tax rate settings are persisted and restored across app reloads.
- request-AC3 -> This backlog slice. Evidence needed: Catalog UI displays the selected currency statically next to `Unit price (excl. tax)` while catalog item prices remain stored as excl-tax numeric amounts; value-adjacent displays prefer the currency symbol and labels/metadata may use the code.
- request-AC4 -> This backlog slice. Evidence needed: BOM workflows/export use the configured currency/tax values as explicit pricing context, preserve HT outputs, and include a TTC line column plus a `Total TTC` summary only when tax is enabled.
- request-AC5 -> This backlog slice. Evidence needed: Missing or malformed persisted currency/tax settings fall back to deterministic safe defaults without breaking load.
- request-AC6 -> This backlog slice. Evidence needed: Existing catalog CRUD and BOM export behaviors remain functional under default and customized settings values.
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

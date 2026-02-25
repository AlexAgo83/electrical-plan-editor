## task_054_req_057_catalog_and_bom_pricing_settings_orchestration_and_delivery_control - req_057 catalog and BOM pricing settings orchestration and delivery control
> From version: 0.9.6
> Understanding: 97% (scope decisions locked: EUR default, 20% TVA default, workspace scope, optional tax with greyed rate field)
> Confidence: 91% (delivery can be sequenced cleanly on top of req_051/req_056 surfaces)
> Progress: 0%
> Complexity: High
> Theme: Orchestration for req_057 settings + catalog pricing UI + conditional BOM TTC export
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
`req_057` extends the catalog/BOM pricing model with workspace-level pricing context:
- configurable currency (`EUR` default),
- optional tax/VAT toggle (`enabled` by default),
- tax rate (`20%` default, French TVA baseline),
- catalog UI static currency display beside excl-tax prices,
- BOM CSV TTC column/total only when tax is enabled.

The implementation spans shared surfaces:
- `Settings` persistence/UI,
- Catalog list/form price rendering,
- BOM CSV export generation and metadata.

This should be delivered in a controlled sequence to avoid regressions in existing `req_051` catalog CRUD and `req_056` BOM export behavior.

# Objective
- Deliver `req_057` in coordinated increments with clear separation between settings foundation, catalog UI display, and BOM TTC export behavior.
- Preserve backward compatibility for existing saves and current HT pricing semantics.
- Finish with a full validation pass and synchronized `logics` docs (request/backlog/task progress updates).

# Scope
- In:
  - Orchestrate delivery of `item_333`, `item_334`, `item_335`
  - Sequence shared-state changes before UI/export consumers
  - Run targeted and final validation gates
  - Keep `logics` artifacts synchronized during progress and closure
- Out:
  - New pricing features beyond `req_057` (currency conversion, per-network pricing settings, advanced tax rules)
  - Broader accounting/invoicing exports beyond BOM CSV

# Backlog scope covered
- `logics/backlog/item_333_settings_catalog_and_bom_pricing_setup_with_workspace_currency_and_optional_tax_persistence.md`
- `logics/backlog/item_334_bom_csv_ttc_column_and_total_with_tax_enabled_conditional_export_behavior.md`
- `logics/backlog/item_335_catalog_price_ui_currency_display_beside_excl_tax_unit_prices.md`

# Plan
- [ ] 1. Implement settings foundation (`item_333`): workspace pricing settings state/persistence, defaults, normalization, and disabled tax-rate field UX
- [ ] 2. Implement catalog UI currency display (`item_335`) using req_057 symbol/code display rules without changing HT storage semantics
- [ ] 3. Implement BOM TTC conditional export (`item_334`): preserve HT outputs, add TTC column/total only when tax is enabled, add pricing metadata context
- [ ] 4. Run targeted regression suites for settings/catalog/BOM and fix discovered issues
- [ ] 5. Run final validation matrix (lint/typecheck/quality/build/tests/e2e)
- [ ] FINAL: Update related Logics docs

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s build`
- `npm run -s quality:pwa`
- `npm run -s test:ci`
- `npm run -s test:e2e`

# Targeted validation guidance (recommended during implementation)
- `npx vitest run src/tests/app.ui.settings.spec.tsx`
- `npx vitest run src/tests/app.ui.catalog.spec.tsx`
- `npx vitest run src/tests/network-summary-bom-csv.spec.ts src/tests/app.ui.network-summary-bom-export.spec.tsx`
- `npx vitest run src/tests/persistence.localStorage.spec.ts`

# Report
- Current blockers: none.
- Risks to track:
  - Shared settings persistence changes may regress unrelated settings defaults or migration behavior.
  - BOM CSV schema changes may break existing HT-only tests if TTC columns are inserted without deterministic ordering/versioned expectations.
  - Catalog UI display updates may create inconsistent symbol/code formatting across list vs form.
- Delivery notes:
  - Update this task after each backlog item with validation snapshot and any scope clarifications.
  - If implementation reveals CSV schema compatibility concerns, record the chosen column order and metadata row contract explicitly in `req_057` and `item_334`.

# References
- `logics/request/req_057_catalog_and_bom_settings_currency_and_tax_defaults.md`
- `logics/backlog/item_333_settings_catalog_and_bom_pricing_setup_with_workspace_currency_and_optional_tax_persistence.md`
- `logics/backlog/item_334_bom_csv_ttc_column_and_total_with_tax_enabled_conditional_export_behavior.md`
- `logics/backlog/item_335_catalog_price_ui_currency_display_beside_excl_tax_unit_prices.md`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/components/workspace/ModelingCatalogListPanel.tsx`
- `src/app/components/workspace/ModelingCatalogFormPanel.tsx`
- `src/app/lib/networkSummaryBomCsv.ts`

## item_333_settings_catalog_and_bom_pricing_setup_with_workspace_currency_and_optional_tax_persistence - Settings catalog and BOM pricing setup with workspace currency and optional tax persistence
> From version: 0.9.6
> Understanding: 96%
> Confidence: 91%
> Progress: 0%
> Complexity: Medium
> Theme: Settings foundation for workspace pricing context (currency + optional VAT/TVA)
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The app has catalog pricing (`unitPriceExclTax`) and BOM export behavior but no workspace-level pricing context settings. Users cannot configure a default currency or optional tax/VAT behavior, which makes pricing interpretation inconsistent and blocks downstream UI/BOM improvements.

# Scope
- In:
  - Add a dedicated `Settings` section for Catalog/BOM pricing setup.
  - Add persisted workspace-level settings for:
    - `currency` (default `EUR`)
    - `tax enabled` (default `true`)
    - `tax rate (%)` (default `20`)
  - Implement tax toggle + tax-rate input validation semantics.
  - Keep `Tax rate (%)` visible but disabled/greyed out when tax is disabled, preserving the last entered value.
  - Add backward-compatible normalization for missing/malformed persisted settings.
  - Wire settings values into app state/preferences plumbing for downstream catalog/BOM consumers.
- Out:
  - Catalog UI currency display next to unit prices (handled in `item_335`).
  - BOM CSV TTC columns/totals and conditional export behavior (handled in `item_334`).

# Acceptance criteria
- `Settings` exposes a dedicated Catalog/BOM pricing setup section with currency, tax enable toggle, and tax rate controls.
- Defaults are `EUR`, `tax enabled = true`, `tax rate = 20`.
- Currency, tax enabled state, and tax rate persist across reload/remount.
- When tax is disabled, `Tax rate (%)` remains visible and disabled/greyed out, and preserves the previous value.
- Invalid/malformed persisted pricing settings normalize to safe defaults without breaking load.
- Existing catalog prices remain stored as excl-tax numeric values; no entity mutation occurs when settings change.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_057`, existing settings persistence patterns (`req_010`, `req_032`), `req_056` BOM pricing context usage.
- Blocks: `item_334`, `item_335`, `task_054`.
- Related AC: req_057 AC1, AC1a, AC1b, AC2, AC2a, AC5.
- References:
  - `logics/request/req_057_catalog_and_bom_settings_currency_and_tax_defaults.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/store/types.ts`
  - `src/tests/app.ui.settings.spec.tsx`

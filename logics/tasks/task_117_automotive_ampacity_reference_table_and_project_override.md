## task_117_automotive_ampacity_reference_table_and_project_override - Automotive ampacity reference table and per-project override

> From version: 1.13.1
> Schema version: 1.0
> Status: Ready
> Understanding: 80%
> Confidence: 80%
> Progress: 0%
> Complexity: Small
> Theme: Electrical analysis / Diagnostics
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [ ] Default copper ampacity table shipped next to `src/core/wireSizing.ts` (or sibling `src/core/wireAmpacity.ts`).
- [ ] Aluminum values derived from copper via the existing `MATERIAL_RESISTIVITY_OHM_MM2_PER_M` ratio.
- [ ] `Network` gains an optional `ampacityOverrides?: Partial<Record<number, number>>` (copper only for this release; aluminum is computed from copper at resolution time).
- [ ] New helper `resolveAmpacityA(sectionMm2, material, network)` returning the resolved value.
- [ ] Negative or non-finite override values rejected at normalization.
- [ ] Settings → Electrical surfaces an editable table with per-row reset and "Reset all" action.
- [ ] Persistence round-trip preserves `ampacityOverrides`. No `schemaVersion` bump.
- [ ] Tests cover default table, aluminum derivation, override precedence, invalid rejection, reset actions, persistence round-trip.

# Backlog
- `item_609_automotive_ampacity_reference_table_and_project_override`

# Acceptance criteria
- AC1: `resolveAmpacityA(0.5, "copper", network)` returns 11 with no overrides.
- AC2: `resolveAmpacityA(0.5, "aluminum", network)` returns the copper value scaled by `0.0175 / 0.0282` (rounded to one decimal).
- AC3: `network.ampacityOverrides[2.5] = 28` makes the copper resolution return 28; clearing restores 32.
- AC4: Negative or NaN override values are rejected at normalization.
- AC5: Settings → Electrical exposes "Reset row" and "Reset all".
- AC6: Persistence round-trip preserves overrides without schema bump.
- AC7: A network without overrides emits no warning and uses the shipped defaults.
- AC8: Tests cover AC1–AC7.

# Implementation Plan

## Step 1 — Default table + helper
- New file: `src/core/wireAmpacity.ts`.
- Export:
  ```ts
  export const DEFAULT_COPPER_AMPACITY_A_BY_SECTION_MM2 = {
    0.5: 11, 0.75: 15, 1: 19, 1.5: 24, 2.5: 32,
    4: 42, 6: 54, 10: 73, 16: 98, 25: 129,
    35: 158, 50: 198, 70: 245, 95: 292, 120: 344
  } as const;
  ```
- Aluminum derivation: `copperA * (RESISTIVITY_COPPER / RESISTIVITY_ALUMINUM)` from existing constants in `wireSizing.ts`.
- `resolveAmpacityA(sectionMm2, material, network)` — apply override only for `material === "copper"`; for aluminum, derive from the resolved copper value at the same section.
- `normalizeAmpacityOverrides(value): { value, warnings }` — drop entries where section is not in the standard list or where the override is negative / non-finite.

## Step 2 — Network type + reducer
- Extend `Network` in `src/core/entities.ts` with `ampacityOverrides?: Record<number, number>`.
- Add reducer actions `network/setAmpacityOverride` and `network/resetAmpacityOverride` (both `network/resetAllAmpacityOverrides`).

## Step 3 — Settings UI
- Add a new section "Electrical" under Settings, with a table of rows: section / shipped default / current value / override input / reset button. Header "Reset all".
- Reuse the existing Settings form components.

## Step 4 — Persistence + portability
- Hydration in `src/adapters/persistence/migrations.ts` calls the normalizer.
- Network file export/import preserves the field.

## Step 5 — Tests
- `src/tests/core.wire-ampacity.spec.ts` — default table, aluminum derivation, override resolution, invalid rejection.
- `src/tests/store.reducer.network-ampacity.spec.ts` — reducer set/reset.
- `src/tests/app.ui.settings-electrical.spec.tsx` — table render, edit, reset row, reset all.

# Validation
- `python3 -m logics_manager lint --require-status`
- `npm run -s lint && npm run -s typecheck`
- Focused vitest scope on the new specs, then `npm run ci:blocking`.

# Report
- TBD on completion.

# AI Context
- Summary: Ship the automotive copper ampacity table, aluminum derivation, Network override + Settings UI, persistence round-trip.
- Keywords: ampacity, ISO 6722, copper, aluminum, resistivity, override, Settings, electrical

# Links
- Request: `req_133_pin_level_source_consumer_currents_and_harness_dimensioning_diagnostics`
- Product brief(s): `docs/pin-level-source-consumer-currents-product-brief.md`
- Architecture decision(s): `adr_010_inter_network_current_bridge_semantics`

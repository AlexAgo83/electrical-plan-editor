## task_058_req_061_circle_mobility_brand_theme_presets_light_and_dark_orchestration_and_delivery_control - req_061 Circle Mobility brand theme presets (light and dark) orchestration and delivery control
> From version: 0.9.7
> Understanding: 100% (delivered: theme mode contract, Circle Mobility palette mapping, CSS surface overrides, regression coverage)
> Confidence: 96% (implementation validated on targeted theme/settings suites; remaining visual tuning can iterate without contract changes)
> Progress: 100%
> Complexity: Medium-High
> Theme: Orchestration for req_061 Circle Mobility branded theme preset rollout
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
`req_061` introduces two brand-driven theme presets based on Circle Mobility styling:
- one light preset,
- one dark preset.

The app already supports many theme variants with an existing theme-mode selector and CSS override packs, but branded preset additions can regress:
- `ThemeMode` typing and persistence,
- Settings selector wiring,
- representative surface styling consistency,
- theme regression tests.

The rollout should be sequenced to keep responsibilities clear:
- theme mode contract + palette mapping first,
- CSS surface coverage second,
- regression coverage third.

# Objective
- Deliver `req_061` with two integrated Circle Mobility presets (light + dark), coherent branded surface coverage, and regression safety.
- Preserve existing theme presets and theme persistence behavior.
- Synchronize `logics` docs after delivery.

# Scope
- In:
  - Orchestrate `item_345`, `item_346`, `item_347`
  - Run targeted theme regression suites during implementation
  - Run final validation matrix before closure
  - Update request/backlog/task progress and closure notes
- Out:
  - Typography/font replacement with proprietary brand assets
  - Full visual redesign outside the new presets

# Backlog scope covered
- `logics/backlog/item_345_circle_mobility_theme_mode_contract_and_brand_palette_mapping_for_light_and_dark_presets.md`
- `logics/backlog/item_346_circle_mobility_theme_css_overrides_and_surface_coverage_for_light_and_dark_presets.md`
- `logics/backlog/item_347_regression_coverage_for_circle_mobility_theme_selection_persistence_and_surface_rendering.md`

# Plan
- [x] 1. Add Circle Mobility theme mode contract and palette mapping (`item_345`)
- [x] 2. Implement CSS overrides and representative surface coverage for Circle Mobility light/dark presets (`item_346`)
- [x] 3. Extend regression coverage for selection, persistence, and representative rendering (`item_347`)
- [x] 4. Run targeted theme/settings UI suites and fix regressions
- [x] 5. Run final validation matrix (project gates rerun in this pass include restored `quality:store-modularization`)
- [x] FINAL: Update related Logics docs

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
- `npx vitest run src/tests/app.ui.theme.spec.tsx`
- `npx vitest run src/tests/app.ui.settings.spec.tsx`
- `npx vitest run src/tests/app.ui.validation.spec.tsx`
- `npx vitest run src/tests/app.ui.network-summary-workflow-polish.spec.tsx`

# Report
- Current blockers: none for `req_061` delivery. (Separate historical gate regression from `src/store/sampleNetwork.ts` line count was addressed by modularizing the catalog-validation sample factory.)
- Risks tracked / mitigations:
  - Shell-only wiring risk mitigated by Circle Mobility CSS override pack and representative surface assertions in `src/tests/app.ui.theme.spec.tsx`.
  - Theme persistence regression risk mitigated by `ThemeMode` normalization support in `useUiPreferences` (including alias tolerance) and remount coverage.
  - Theme override drift risk reduced by centralizing Circle Mobility palette/gradient tokens in `--cm-*` CSS variables.
- Delivery notes:
  - Added two presets (`circleMobilityLight`, `circleMobilityDark`) to the theme contract + Settings selector.
  - Implemented branded CSS overlays with shared Circle Mobility tokens and targeted surface overrides (header accents, active chips/buttons, badges, canvas floating chrome).
  - Extended theme UI tests for preset selection, persistence, and representative surfaces.
  - Synced `logics` backlog/task docs after implementation.

# References
- `logics/request/req_061_circle_mobility_brand_light_and_dark_theme_presets.md`
- `logics/backlog/item_345_circle_mobility_theme_mode_contract_and_brand_palette_mapping_for_light_and_dark_presets.md`
- `logics/backlog/item_346_circle_mobility_theme_css_overrides_and_surface_coverage_for_light_and_dark_presets.md`
- `logics/backlog/item_347_regression_coverage_for_circle_mobility_theme_selection_persistence_and_surface_rendering.md`
- `src/store/types.ts`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/styles/base/base-theme-overrides.css`
- `src/tests/app.ui.theme.spec.tsx`

## task_058_req_061_circle_mobility_brand_theme_presets_light_and_dark_orchestration_and_delivery_control - req_061 Circle Mobility brand theme presets (light and dark) orchestration and delivery control
> From version: 0.9.7
> Understanding: 97% (scope is a branded theming addition: 2 presets + palette mapping + CSS coverage + regression hardening)
> Confidence: 91% (theme system and tests are already established, but surface coverage breadth requires sequencing)
> Progress: 0%
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
- [ ] 1. Add Circle Mobility theme mode contract and palette mapping (`item_345`)
- [ ] 2. Implement CSS overrides and representative surface coverage for Circle Mobility light/dark presets (`item_346`)
- [ ] 3. Extend regression coverage for selection, persistence, and representative rendering (`item_347`)
- [ ] 4. Run targeted theme/settings UI suites and fix regressions
- [ ] 5. Run final validation matrix
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
- `npx vitest run src/tests/app.ui.theme.spec.tsx`
- `npx vitest run src/tests/app.ui.settings.spec.tsx`
- `npx vitest run src/tests/app.ui.validation.spec.tsx`
- `npx vitest run src/tests/app.ui.network-summary-workflow-polish.spec.tsx`

# Report
- Current blockers: none.
- Risks to track:
  - New presets may render only shell classes correctly while leaving representative surfaces unreadable or mismatched.
  - Adding `ThemeMode` values may break persistence normalization or settings selector coverage if wiring is incomplete.
  - Theme CSS layering can drift across split override files if the placement/import strategy is inconsistent.
- Delivery notes:
  - Prefer explicit palette mapping comments/notes when introducing Circle Mobility colors/gradients into existing override packs.
  - Keep gradients intentional (headers/active states/highlights) to avoid lowering readability on data-dense surfaces.

# References
- `logics/request/req_061_circle_mobility_brand_light_and_dark_theme_presets.md`
- `logics/backlog/item_345_circle_mobility_theme_mode_contract_and_brand_palette_mapping_for_light_and_dark_presets.md`
- `logics/backlog/item_346_circle_mobility_theme_css_overrides_and_surface_coverage_for_light_and_dark_presets.md`
- `logics/backlog/item_347_regression_coverage_for_circle_mobility_theme_selection_persistence_and_surface_rendering.md`
- `src/store/types.ts`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/styles/base/base-theme-overrides.css`
- `src/tests/app.ui.theme.spec.tsx`

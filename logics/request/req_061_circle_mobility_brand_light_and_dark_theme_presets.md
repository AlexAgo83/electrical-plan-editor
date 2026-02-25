## req_061_circle_mobility_brand_light_and_dark_theme_presets - Circle Mobility brand light and dark theme presets
> From version: 0.9.7
> Understanding: 97% (user requests 2 new presets: one light and one dark, both based on Circle Mobility branding palette/gradients)
> Confidence: 92% (theme system is already extensible with multiple custom presets and test coverage exists)
> Complexity: Medium-High
> Theme: Branding / Theme presets / UI visual system
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Add a new **light** theme preset and a new **dark** theme preset inspired by the Circle Mobility visual identity.
- Base both presets on the provided Circle Mobility palette, gradients, and UI usage recommendations.
- Expose the new presets in the existing `Settings > Theme mode` selector.
- Preserve current UX behavior while aligning key app surfaces (shell, panels, buttons, cards, badges/stats, tables, canvas chrome) with the new brand look.

# Context
The app already supports many theme presets (light, dark, and standalone custom variants), and the theme mode system is wired through:
- `ThemeMode` union typing,
- `Settings` selector options,
- app-shell theme classes,
- CSS override packs for surfaces/components.

This request introduces **brand-driven presets** for Circle Mobility, using the provided palette as the design source of truth for V1.

The user explicitly wants:
- `1` new clear/light preset
- `1` new dark preset
- both derived from Circle Mobility styling used by the company apps (Driver / Fleet / Dashboard)

# Objective
- Deliver two new theme presets (`Circle Mobility Light` and `Circle Mobility Dark`) integrated into the app theme system.
- Map the provided Circle Mobility palette/gradients to app UI tokens/surfaces consistently.
- Add regression coverage for theme switching/persistence and representative surface rendering under the new presets.

# Circle Mobility branding source (provided by user)
## Primary / Brand
- `Primary`: `#05082C`
- `Primary-hover`: `#032B6B`
- `Primary-active`: `#021E4A`
- `Primary-light`: `#0E369B`

## Accent / Highlight
- `Accent-blue`: `#48CAF3`
- `Accent-azur`: `#82F4EE`
- `Accent-pink`: `#BA0FB6`

## Backgrounds
- `Background-main`: `#05082C`
- `Background-elevated`: `#0A0F3E`
- `Background-card`: `#12175A`
- `Background-light (light mode)`: `#F7DFD7`

## Text
- Dark mode:
  - `Text-primary-dark`: `#FFFFFF`
  - `Text-secondary-dark`: `#C8CBE6`
  - `Text-disabled`: `#6E7396`
- Light mode:
  - `Text-primary-light`: `#05082C`
  - `Text-secondary-light`: `#4A4F6A`

## Borders / separators
- `Border-dark`: `#1E2466`
- `Border-light`: `#DDDCDB`

## Status / system
- `Success`: `#82F4EE`
- `Info`: `#48CAF3`
- `Warning`: `#FFF0D9`
- `Error`: `#BA0FB6`

## Gradients (signature Circle)
- `Primary gradient`: `#0E369B -> #05082C`
- `Tech gradient`: `#48CAF3 -> #0E369B -> #05082C`
- `Brand gradient`: `#BA0FB6 -> #05082C`

## UI recommendations (Circle apps)
- Navigation bar background: `#05082C`
- Primary button: background `#0E369B`, text `#FFFFFF`
- Secondary button: border/text `#48CAF3`
- Cards: background `#0A0F3E`
- Highlight elements (stats, graph, badges): `#48CAF3` or `#BA0FB6`

# Functional scope
## A. New theme mode presets and naming (high priority)
- Add two new theme presets to the `ThemeMode` system:
  - recommended internal ids:
    - `circleMobilityLight`
    - `circleMobilityDark`
- Add matching human-readable labels in `Settings > Theme mode`, for example:
  - `Circle Mobility (Light)`
  - `Circle Mobility (Dark)`
- The new presets must be selectable, persisted, and restored like existing theme modes.

## B. Palette-to-UI token mapping contract (high priority)
- Create a deterministic mapping from Circle Mobility palette values to app UI surfaces and theme variables.
- V1 must document/map at minimum:
  - shell background(s)
  - panel/card backgrounds
  - primary/secondary text
  - borders/separators
  - interactive buttons/tabs/chips
  - focus-visible / selection / highlighted states
  - status badges and validation accents
  - network summary floating UI chrome (controls/stats/subnetwork chips)
- When exact palette usage causes readability/contrast issues on specific surfaces, V1 may derive minimal adjusted shades, but the base palette identity must remain recognizable and consistent.

## C. Circle Mobility Dark preset implementation (high priority)
- Implement a dark preset using the provided dark palette core:
  - main shell/nav surfaces anchored by `#05082C`
  - elevated/card surfaces centered on `#0A0F3E` / `#12175A`
  - text `#FFFFFF` / `#C8CBE6`
  - borders `#1E2466`
  - highlights/badges using `#48CAF3` and/or `#BA0FB6`
- Recommended visual direction:
  - use Circle signature gradients selectively for headers, active chips/buttons, or decorative surfaces (not everywhere)
  - maintain clear contrast and interaction state legibility

## D. Circle Mobility Light preset implementation (high priority)
- Implement a light preset based on the same brand language, with:
  - light shell/page surfaces anchored by `#F7DFD7`
  - primary text `#05082C`
  - secondary text `#4A4F6A`
  - light borders `#DDDCDB`
  - brand/interactive accents using `#0E369B`, `#48CAF3`, `#BA0FB6`
- The light preset should feel clearly related to the dark Circle preset (same brand identity, different luminance strategy), not an unrelated pastel theme.

## E. Surface coverage expectations (medium-high priority)
- Apply the new presets beyond shell class wiring; representative app surfaces must render coherently.
- V1 target surfaces:
  - app shell and header/navigation
  - panels/cards
  - tabs/chips/buttons (including active/selected states)
  - tables (headers, rows, selected rows, wire-highlight rows)
  - forms (inputs/selects/textarea)
  - validation and settings panels
  - network summary canvas shell + floating controls/stat cards + key entity highlights
  - ops/header badges where visible
- Full exhaustive surface tuning is not required in V1, but obvious unreadable/mismatched surfaces are not acceptable.

## F. Persistence and behavior compatibility (medium priority)
- Theme selection for the new presets must persist through the existing preferences persistence flow.
- Changing to either Circle Mobility preset must not mutate domain entities or network data.
- Existing theme presets must remain unaffected.

## G. Regression coverage and visual-contract checks (medium priority)
- Extend theme UI regression coverage to include:
  - selecting `Circle Mobility (Light)` and `Circle Mobility (Dark)` in settings
  - expected app-shell classes for both presets
  - persistence across remount
  - representative surface rendering checks (not only shell class wiring)
- If needed, add focused structural/CSS assertions for critical themed surfaces (buttons, panels, badges) without introducing brittle snapshots.

# Non-functional requirements
- Preserve UI responsiveness; no heavy runtime theming logic or dynamic color computation loops in render paths.
- Keep theme implementation maintainable using existing theme override organization/patterns.
- Avoid excessive duplication across theme override files when shared Circle Mobility styling primitives can be reused.

# Validation and regression safety
- Add/extend tests for:
  - `Theme mode` selector includes the 2 new Circle Mobility presets
  - switching to each preset updates app-shell classes as expected
  - both presets persist across remount
  - representative workspace surfaces render under the new presets (settings/validation/analysis or equivalent)
  - existing theme presets still work after adding new `ThemeMode` values
- Run full validation pipeline after implementation (`lint`, `typecheck`, `quality:*`, `test:ci`, `test:e2e`, `build`, `logics_lint`)

# Acceptance criteria
- AC1: The app exposes two new theme presets in `Settings > Theme mode`: one Circle Mobility light preset and one Circle Mobility dark preset.
- AC2: Both presets are visually based on the provided Circle Mobility palette/gradients and match the brand direction across primary surfaces (shell, panels/cards, buttons/chips, highlights).
- AC3: The new presets are selectable and persist across reload/remount using the existing theme preference mechanism.
- AC4: Representative app surfaces render coherently under both presets (not only shell class wiring), including settings/validation/table/canvas-adjacent UI.
- AC5: Existing theme presets and theme switching behavior remain functional.

# Out of scope
- Replacing app typography with proprietary Circle Mobility fonts (unless separately provided/licensed and requested).
- Full visual redesign of every screen component beyond the new theme presets.
- Runtime user-customizable color editors or theme builder UI.
- Brand logo/iconography changes.

# Backlog
- `logics/backlog/item_345_circle_mobility_theme_mode_contract_and_brand_palette_mapping_for_light_and_dark_presets.md`
- `logics/backlog/item_346_circle_mobility_theme_css_overrides_and_surface_coverage_for_light_and_dark_presets.md`
- `logics/backlog/item_347_regression_coverage_for_circle_mobility_theme_selection_persistence_and_surface_rendering.md`

# Orchestration task
- `logics/tasks/task_058_req_061_circle_mobility_brand_theme_presets_light_and_dark_orchestration_and_delivery_control.md`

# References
- `src/store/types.ts`
- `src/store/reducer/uiReducer.ts`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/styles/base/base-theme-overrides.css`
- `src/app/styles/base/base-theme-overrides/legacy-themes-core-surfaces.css`
- `src/app/styles/base/base-theme-overrides/standalone-custom-light-themes-palettes-a.css`
- `src/app/styles/base/base-theme-overrides/standalone-custom-midrange-themes-palettes-a.css`
- `src/app/styles/base/base-theme-overrides/network-canvas-entity-theme-variables.css`
- `src/app/styles/validation-settings/validation-and-settings-tables/settings-theme-overrides-variants.css`
- `src/tests/app.ui.theme.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`

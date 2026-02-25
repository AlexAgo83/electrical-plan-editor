## item_346_circle_mobility_theme_css_overrides_and_surface_coverage_for_light_and_dark_presets - Circle Mobility theme CSS overrides and surface coverage for light and dark presets
> From version: 0.9.7
> Understanding: 96%
> Confidence: 90%
> Progress: 0%
> Complexity: Medium-High
> Theme: CSS theme implementation and representative surface coverage for Circle Mobility branding
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with a theme-mode contract, Circle Mobility presets will feel incomplete if only shell classes are added. Key UI surfaces (panels, tables, forms, buttons/chips, validation/settings, canvas chrome) need coherent CSS overrides to reflect the brand identity and remain readable.

# Scope
- In:
  - Implement CSS theme overrides for the 2 new Circle Mobility presets (1 light, 1 dark).
  - Cover representative app surfaces: shell/header/nav, panels/cards, buttons/chips, tables, forms, validation/settings, network summary chrome, badges/highlights.
  - Apply Circle gradients intentionally on selected surfaces (e.g. active states, header accents, badges) without overwhelming the UI.
  - Preserve readability/contrast and interaction state clarity.
- Out:
  - Theme-mode type/selector contract changes (handled in `item_345`, though small integration glue may occur here if needed).
  - Regression test additions (handled in `item_347`).

# Acceptance criteria
- Both Circle Mobility presets have implemented CSS overrides and render coherent branded visuals on representative surfaces.
- The dark preset uses the provided dark palette core (`#05082C`, `#0A0F3E`, `#12175A`, `#48CAF3`, `#BA0FB6`) in a recognizable way.
- The light preset is clearly brand-related and uses the provided light/background/text/border values appropriately.
- Primary/secondary interaction states remain visually legible and consistent.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_061`, `item_345`.
- Blocks: `item_347`, `task_058`.
- Related AC: req_061 AC2, AC4.
- References:
  - `logics/request/req_061_circle_mobility_brand_light_and_dark_theme_presets.md`
  - `src/app/styles/base/base-theme-overrides.css`
  - `src/app/styles/base/base-theme-overrides/standalone-custom-light-themes-palettes-a.css`
  - `src/app/styles/base/base-theme-overrides/standalone-custom-midrange-themes-palettes-a.css`
  - `src/app/styles/base/base-theme-overrides/network-canvas-entity-theme-variables.css`
  - `src/app/styles/validation-settings/validation-and-settings-tables/settings-theme-overrides-variants.css`

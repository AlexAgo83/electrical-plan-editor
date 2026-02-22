## item_086_css_modularization_wave_2_base_workspace_canvas_validation_settings - CSS Modularization Wave 2 (Base / Workspace / Canvas / Validation-Settings)
> From version: 0.5.0
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Complexity: High
> Theme: CSS Line-Budget Reduction and Styling Ownership
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Several CSS files remain oversized and are currently tolerated through documented quality-gate exceptions, which is acceptable short-term but increases long-term styling maintenance cost.

# Scope
- In:
  - Split large CSS files into scoped style modules:
    - `base.css`
    - `workspace.css`
    - `canvas.css`
    - `validation-settings.css`
  - Preserve theme variable contracts and current visual appearance.
  - Update imports and quality-gate exceptions accordingly.
  - Reduce at least one exception where practical in this wave.
- Out:
  - Full design-system rewrite.
  - Theme visual redesign.

# Acceptance criteria
- Large CSS responsibilities are split into clearer modules with coherent ownership.
- Visual behavior remains stable across available themes and key screens.
- `quality:ui-modularization` remains green and exception documentation is updated (reduced if possible).
- No regression in key UI flows after CSS split.

# Priority
- Impact: High (maintainability and style-layer clarity).
- Urgency: Medium-high (currently mitigated by documented exceptions, but growing risk).

# Notes
- Dependencies: item_084 (recommended for canvas-related style split timing), item_083/item_085 (optional parallel if component splits land first).
- Blocks: item_088 (exception cleanup and final validation).
- Related AC: AC6, AC8.
- References:
  - `logics/request/req_014_ui_modularization_wave_2_controller_analysis_canvas_and_bundle_optimization.md`
  - `src/app/styles/base.css`
  - `src/app/styles/base/base-foundation.css`
  - `src/app/styles/base/base-components.css`
  - `src/app/styles/base/base-theme-overrides.css`
  - `src/app/styles/workspace.css`
  - `src/app/styles/workspace/workspace-shell-and-nav.css`
  - `src/app/styles/workspace/workspace-panels-and-responsive.css`
  - `src/app/styles/canvas.css`
  - `src/app/styles/canvas/canvas-toolbar-and-shell.css`
  - `src/app/styles/canvas/canvas-diagram-and-overlays.css`
  - `src/app/styles/validation-settings.css`
  - `src/app/styles/validation-settings/validation-and-settings-layout.css`
  - `src/app/styles/validation-settings/validation-and-settings-tables.css`
  - `scripts/quality/check-ui-modularization.mjs`

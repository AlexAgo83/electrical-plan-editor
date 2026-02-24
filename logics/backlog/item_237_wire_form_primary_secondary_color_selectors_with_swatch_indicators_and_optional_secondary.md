## item_237_wire_form_primary_secondary_color_selectors_with_swatch_indicators_and_optional_secondary - Wire Form Primary/Secondary Color Selectors with Swatch Indicators and Optional Secondary
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Form-First Wire Color UX for No-Color, Mono-Color, and Bi-Color Wires
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Users need to assign wire colors in the wire form, but no UI exists for selecting a primary color, optional secondary color, or visualizing the selected colors with swatches.

# Scope
- In:
  - Add wire color controls to the wire form (create + edit):
    - primary color selector with `None` option
    - secondary color selector (optional)
  - Show visible swatch indicator(s) for selected color(s).
  - No-color support:
    - create-mode defaults to `No color` (`null/null`)
    - show neutral `No color` indicator/swatch state
  - Bicolor support:
    - allow optional secondary color only when primary color exists
    - disable secondary selector while primary is `None`
  - Load/save existing wire color values in edit mode.
  - Preserve other wire form behaviors (endpoints, technical ID, routing controls).
  - Optional low-risk enhancement:
    - show color swatches in wire row/inspector if trivial
- Out:
  - Custom catalog editing UI.
  - Full UI redesign across all wire displays.
  - Persistence/import compatibility migration logic (handled in item_238).

# Acceptance criteria
- Wire form supports `No color`, mono-color, and bi-color input states.
- Primary selector includes `None`; secondary selector is disabled when primary is `None`.
- Swatch indicators reflect selected colors (including neutral no-color state).
- Edit mode loads existing wire colors and saves changes without regressing other wire fields.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_039`, item_235, item_236.
- Blocks: item_239.
- Related AC: AC3, AC4, AC4a, AC4b, AC5, AC8.
- References:
  - `logics/request/req_039_wire_color_catalog_two_character_codes_and_bicolor_primary_secondary_support.md`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/app/hooks/useEntityFormsState.ts`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`


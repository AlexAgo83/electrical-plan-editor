## item_283_wire_form_explicit_color_mode_selector_and_free_color_label_input - Wire Form Explicit Color Mode Selector and Free Color Label Input
> From version: 0.8.1
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: Explicit wire color mode UX for no-color, catalog-color, and free-color identification
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Users currently assign wire colors through the catalog-based color controls introduced by `req_039`. `req_045` requires a third mode (`Free color`) with a text label, but the wire form has no explicit color-mode selector or safe mode-switching behavior to prevent stale catalog/free values from coexisting.

# Scope
- In:
  - Add an explicit wire color mode selector/toggle in create and edit flows:
    - `No color`
    - `Catalog color`
    - `Free color`
  - Add free-color text input (`freeColorLabel`) shown only in `Free color` mode.
  - Hide/disable catalog selectors in `Free color` mode.
  - Preserve existing primary/secondary catalog selectors and swatch behavior in `Catalog color` mode.
  - Clear incompatible values on mode switch (catalog IDs vs free label).
  - Load existing wire values into the correct mode in edit flow.
  - Keep form validation/submit behavior aligned with store invariants (trimmed value, max length 32, empty label invalid in free mode).
- Out:
  - Read-only wire color rendering in tables/analysis/callouts outside the form (handled in item_284).
  - Persistence/import/export compatibility updates (handled in item_285).
  - Full wire form redesign beyond the color section.

# Acceptance criteria
- Wire form exposes explicit `No color` / `Catalog color` / `Free color` modes.
- `Free color` mode provides a free-text label input and hides/disables catalog selectors.
- Switching modes clears incompatible color values to avoid mixed states.
- Edit mode correctly loads existing wires into the matching color mode.
- Create/edit save flows for free color labels work without regressing unrelated wire form fields.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_045`, item_282.
- Blocks: item_286.
- Related AC: AC2, AC3, AC4, AC5, AC8.
- References:
  - `logics/request/req_045_wire_cable_free_color_label_support_beyond_catalog_and_no_color_states.md`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/app/hooks/useEntityFormsState.ts`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

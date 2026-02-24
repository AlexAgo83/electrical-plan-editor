## item_288_wire_form_free_color_optional_empty_label_and_unspecified_copy - Wire Form Free Color Optional Empty Label and Unspecified Copy
> From version: 0.8.1
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Form UX refinement for deliberate free-color placeholders without mandatory text labels
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The `req_045` wire form requires a non-empty free-color label in `Free color` mode. This blocks the workflow where a designer intentionally leaves the cable color unspecified for downstream plan users while still marking the cable as free-color.

# Scope
- In:
  - Update wire form validation to allow saving `Free color` mode with an empty label.
  - Preserve max-length trimming/validation when a free-color label is provided.
  - Keep explicit `Color mode` selector behavior and mode-switch clearing rules.
  - Add/adjust UI copy to communicate the meaning of empty `Free color`:
    - color left open / unspecified / to be chosen later
  - Ensure edit mode loads and displays free unspecified wires correctly.
- Out:
  - Read-only display semantics outside the form (handled in item_289).
  - Persistence/import/export migration logic (handled in item_290).
  - New color picker or catalog management.

# Acceptance criteria
- `Free color` mode saves successfully when the label input is empty.
- Form UX clearly communicates empty free-color semantics (unspecified/free placeholder).
- Existing free-color labeled and catalog/no-color form flows remain functional.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_046`, item_287.
- Blocks: item_291.
- Related AC: AC1, AC3, AC6, AC8.
- References:
  - `logics/request/req_046_wire_free_color_mode_without_label_as_deliberate_unspecified_color_placeholder.md`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `src/app/hooks/useEntityFormsState.ts`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/tests/app.ui.wire-free-color-mode.spec.tsx`


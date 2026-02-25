## item_342_network_summary_2d_accessibility_semantics_and_segment_keyboard_activation_parity - Network summary 2D accessibility semantics and segment keyboard activation parity
> From version: 0.9.6
> Understanding: 97%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Interactive SVG accessibility semantics and keyboard parity for segments
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The `Network summary` 2D SVG is currently exposed with static-image semantics while containing interactive descendants, and segment interaction is mouse-only, creating a keyboard/screen-reader accessibility gap in a core workflow surface.

# Scope
- In:
  - Correct the accessibility semantics contract of the interactive `Network summary` SVG root surface (do not misrepresent it as a static image when interactive descendants are present).
  - Preserve a meaningful accessible name/description for the diagram region/surface.
  - Make selectable segments keyboard operable with focusability, accessible labeling, and keyboard activation (`Enter` / `Space` unless another pattern is explicitly justified).
  - Preserve existing node/callout keyboard semantics and pointer interactions while adding segment keyboard parity.
  - Keep pan/zoom and canvas interaction behavior intentional after segment focus/activation support is added.
- Out:
  - Onboarding modal focus-trap behavior (`item_343`).
  - Table/header/navigation semantics (`aria-sort`, Validation row keyboard selection, issue-count accessible names) covered in `item_344`.

# Acceptance criteria
- The `Network summary` interactive SVG no longer exposes misleading static-image semantics while retaining an accessible diagram label/description.
- Selectable segments are keyboard focusable and activatable, with accessible role/label semantics.
- Existing node/callout interactions and pan/zoom behavior remain functional after the change.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_060`.
- Blocks: `task_057`.
- Related AC: req_060 AC1, AC2.
- References:
  - `logics/request/req_060_accessibility_hardening_for_interactive_network_summary_modal_focus_sortable_tables_and_validation_navigation.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.navigation-canvas-validation-bridge.spec.tsx`


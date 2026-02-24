## item_289_wire_color_display_sort_filter_and_export_semantics_for_free_unspecified_vs_no_color - Wire Color Display/Sort/Filter/Export Semantics for Free-Unspecified vs No-Color
> From version: 0.8.1
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium-High
> Theme: User-visible semantic distinction between “No color” and “Free color (unspecified)”
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Read-only wire color surfaces and helper utilities currently treat wire color primarily as no-color, catalog-color, or free-color-with-label. They do not consistently distinguish `No color` from `Free color` without label, which can hide design intent in tables, analysis views, inspector context, sorting, filtering, and CSV exports.

# Scope
- In:
  - Update wire color presentation helpers and read-only UI surfaces to distinguish:
    - `No color`
    - `Free color` (unspecified)
    - `Free color: <label>`
    - catalog color(s)
  - Maintain neutral badge presentation for free-color mode (labeled and unlabeled).
  - Keep catalog swatches unchanged for catalog mode.
  - Update sort keys, search text, and CSV-export values so free unspecified does not collapse into no-color.
  - Ensure deterministic ordering and no runtime errors on mixed datasets.
- Out:
  - Form validation/mode save behavior (handled in item_288).
  - Persistence/import/export migration logic (handled in item_290).
  - Global terminology localization pass outside touched wire color surfaces.

# Acceptance criteria
- Read-only wire color surfaces visibly distinguish `No color` from `Free color` unspecified.
- Sorting/filter/search/export helpers distinguish free unspecified from no-color deterministically.
- Existing catalog-color and free-color-labeled display paths remain functional.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Delivery status: Delivered in `req_046` implementation (see `task_047` report and commits `3d1e12b`, `0e2c97b`).
- Dependencies: `req_046`, item_287.
- Blocks: item_291.
- Related AC: AC4, AC5, AC6, AC8.
- References:
  - `logics/request/req_046_wire_free_color_mode_without_label_as_deliberate_unspecified_color_placeholder.md`
  - `src/core/cableColors.ts`
  - `src/app/lib/wireColorPresentation.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/components/InspectorContextPanel.tsx`
  - `src/app/hooks/useEntityListModel.ts`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.wire-free-color-mode.spec.tsx`

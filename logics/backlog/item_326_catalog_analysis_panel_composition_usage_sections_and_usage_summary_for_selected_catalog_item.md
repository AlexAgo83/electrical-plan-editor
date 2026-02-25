## item_326_catalog_analysis_panel_composition_usage_sections_and_usage_summary_for_selected_catalog_item - Catalog Analysis Panel Composition, Usage Sections, and Usage Summary for Selected Catalog Item
> From version: 0.9.5
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Add Catalog analysis panel layout and read-only usage listing grouped by connectors/splices
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The current Catalog screen lacks an analysis panel, making it harder to inspect downstream usage before edits/deletes.

# Scope
- In:
  - Reintroduce an analysis panel/column into Catalog screen layout.
  - Build read-only usage listing for selected catalog item.
  - Group rows into two sections: `Connectors` and `Splices`.
  - Support no-selection and no-usage empty states.
  - Include lightweight usage summary (`X connectors / Y splices`) if layout permits without churn.
  - Display row identity with `name` + `technicalId` (fallback when name missing).
- Out:
  - Navigation behavior from analysis rows (handled in item_327).
  - Validation/error surfacing for broken links.

# Acceptance criteria
- Catalog screen includes an analysis panel.
- Selected catalog item shows linked connectors/splices in separate sections.
- No-selection and no-usage states are clear and safe.
- Rows expose unambiguous identity (`name` + `technicalId` fallback behavior).

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_055`, `req_051`.
- Blocks: item_327, item_328, item_332.
- Related AC: AC1, AC2, AC4.
- References:
  - `logics/request/req_055_catalog_analysis_panel_linked_connectors_and_splices_usage_listing.md`
  - `src/app/AppController.tsx`
  - `src/app/components/workspace/ModelingCatalogListPanel.tsx`
  - `src/app/components/workspace/ModelingCatalogFormPanel.tsx`


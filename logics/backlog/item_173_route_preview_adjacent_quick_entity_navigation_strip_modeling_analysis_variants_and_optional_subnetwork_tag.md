## item_173_route_preview_adjacent_quick_entity_navigation_strip_modeling_analysis_variants_and_optional_subnetwork_tag - Route-Preview-Adjacent Quick Entity Navigation Strip (Modeling/Analysis Variants and Optional Subnetwork Tag)
> From version: 0.6.3
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium-High
> Theme: Compact Inline Entity Switching Near Route Preview for Faster Inspection Loops
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Entity switching currently depends on the larger `Entity navigation` panel. Users need a compact, full-width quick navigation strip directly after `Route preview` to reduce pointer travel and accelerate context switching while inspecting route-related entities.

# Scope
- In:
  - Add a compact full-width quick navigation strip immediately after `Route preview`.
  - No title; items must fit on one line (compact chips/buttons; compact horizontal flow).
  - Reuse/adapt `Entity navigation` semantics and active-state behavior.
  - Support differing item sets/counts in `Modeling` vs `Analysis`.
  - If subnetwork metadata is shown, label it `Sub-network tag (optional)`.
- Out:
  - Replacing the existing `Entity navigation` panel entirely.
  - New business logic for selection unrelated to fast switching.

# Acceptance criteria
- Quick navigation strip appears immediately after `Route preview` and spans full width.
- Strip is compact, untitled, and supports fast entity switching.
- Modeling and Analysis variants render appropriate item sets without broken layout.
- Optional subnetwork metadata label is displayed as `Sub-network tag (optional)` when shown.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_030`.
- Blocks: item_177.
- Related AC: AC3, AC7.
- References:
  - `logics/request/req_030_network_summary_png_export_background_wires_length_sort_quick_entity_navigation_table_theming_and_2d_grid_negative_coordinates.md`
  - `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
  - `src/app/components/WorkspaceNavigation.tsx`
  - `src/app/hooks/useWorkspaceNavigation.ts`
  - `src/app/hooks/useIssueNavigatorModel.ts`


## item_284_wire_color_display_support_for_free_color_labels_in_tables_analysis_and_callouts - Wire Color Display Support for Free Color Labels in Tables, Analysis, and Callouts
> From version: 0.8.1
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium-High
> Theme: Readable wire identification when color is free-form text instead of catalog swatches
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Wire color read-only surfaces (tables, analysis rows, callouts) are tuned for catalog colors and swatches. When a wire uses `freeColorLabel`, these surfaces can become ambiguous, omit the color, or fail sorting/filter/search paths that currently assume catalog-derived display labels.

# Scope
- In:
  - Support `freeColorLabel` rendering in read-only wire color display surfaces already showing wire color metadata.
  - Display free color labels using the validated baseline:
    - neutral badge/tag + visible label text
    - no colored swatch in free-color mode
  - Preserve existing catalog swatch behavior for catalog mono/bi-color states.
  - Preserve no-color rendering semantics (`No color` / neutral fallback) where applicable.
  - Update wire color sort/filter/search display adapters/comparators to handle mixed datasets:
    - no-color
    - catalog color(s)
    - free color label
  - Ensure deterministic ordering and no runtime errors for mixed states.
- Out:
  - Wire form editing controls (handled in item_283).
  - Persistence/import/export schema changes (handled in item_285).
  - Color picker/custom swatch rendering for free-color mode.

# Acceptance criteria
- At least one existing read-only wire-identification surface that displays wire color correctly renders free color labels with neutral badge + text.
- Catalog swatches remain unchanged for catalog color modes and no-color fallback remains clear.
- Wire color sort/filter/search logic on touched surfaces handles mixed no-color/catalog/free-color datasets deterministically and without crashes.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_045`, item_282.
- Blocks: item_286.
- Related AC: AC4, AC5, AC6, AC8.
- References:
  - `logics/request/req_045_wire_cable_free_color_label_support_beyond_catalog_and_no_color_states.md`
  - `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

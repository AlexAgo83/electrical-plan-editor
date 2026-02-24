## item_276_callout_wire_length_and_section_display_enrichment - Callout Wire Length and Section Display Enrichment
> From version: 0.8.1
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Callout readability improvement with length + section pairing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Callouts show wire length but not wire section, which hides a key physical characteristic and reduces the usefulness of callouts for quick diagnostics.

# Scope
- In:
  - Append wire section display after wire length in callout surfaces.
  - Keep formatting concise and readable.
  - Handle missing/legacy section values safely without breaking layout.
  - Preserve existing callout interactions and layout stability.
- Out:
  - Wires analysis panel enrichment (item_273).
  - Connector/splice analysis swatch rendering (item_275).
  - Sub-network default display cleanup (item_277).

# Acceptance criteria
- Callouts display wire section after length.
- Formatting remains readable and theme-consistent.
- Missing section values do not crash callout rendering.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_044`.
- Blocks: item_281.
- Related AC: AC15, AC17.
- References:
  - `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
  - `src/app/lib/app-utils-networking.ts`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/components/workspace/NetworkSummaryWorkspaceContent.tsx`

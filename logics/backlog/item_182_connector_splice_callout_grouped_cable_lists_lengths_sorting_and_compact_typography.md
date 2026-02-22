## item_182_connector_splice_callout_grouped_cable_lists_lengths_sorting_and_compact_typography - Connector/Splice Callout Grouped Cable Lists, Lengths, Sorting, and Compact Typography
> From version: 0.6.4
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium-High
> Theme: Readable In-Canvas Cable Inventories with Grouping, Stable Ordering, and Smaller Typography
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The value of the callout feature depends on readable, structured cable content. A flat or unstable list would be hard to scan. The request requires grouped rendering (prefer cavity/port grouping), all entries visible, lengths shown, and smaller typography than the main 2D labels.

# Scope
- In:
  - Build callout content models for connector/splice connected cables.
  - Group entries by cavity/port when available; fallback to unified list otherwise.
  - Display lengths (`mm`) and readable identifier format (`Name (TECH-ID) — {length} mm` baseline).
  - Apply stable sorting (`name`, then `technicalId`) within relevant groups.
  - Use smaller typography than main 2D labels; allow wrapping/auto sizing of callout content.
  - Implement explicit empty-state copy when no connected cables exist.
- Out:
  - Truncation/virtualization (`+N more`) patterns.
  - Rich interactive controls inside callout content.

# Acceptance criteria
- Callouts display grouped cable entries when grouping metadata is available and fallback cleanly when not.
- Each entry includes length and stable readable labeling.
- All connected entries are displayed with compact typography and wrapping as needed.
- Ordering is stable and documented (name, then technical ID).
- Empty-state rendering is explicit and styled.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_031`.
- Blocks: item_186.
- Related AC: AC5, AC10.
- References:
  - `logics/request/req_031_network_summary_2d_connector_and_splice_cable_info_frames_with_draggable_callouts.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/hooks/useWireEndpointDescriptions.ts`
  - `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`


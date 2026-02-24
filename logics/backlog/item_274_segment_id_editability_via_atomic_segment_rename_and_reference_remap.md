## item_274_segment_id_editability_via_atomic_segment_rename_and_reference_remap - Segment ID Editability via Atomic Segment Rename and Reference Remap
> From version: 0.8.1
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Referentially safe Segment ID rename aligned with Node ID rename pattern
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`segmentId` is not editable safely today. Enabling edits without an atomic rename path risks broken wire routes, selection state, and other segment-ID references.

# Scope
- In:
  - Add a dedicated `segment/rename` action and reducer handling path.
  - Perform atomic segment ID rename with in-store reference remap in one transaction.
  - Enable segment edit-form `Segment ID` changes in edit mode.
  - Handle collisions/invalid IDs with clear UI/store errors.
  - Remap selection/local UI references where required for continuity.
- Out:
  - Nodes/Segments analysis panels creation (items_271-272).
  - Table header theming changes (item_278).
  - Callout section display (item_276).

# Acceptance criteria
- `segmentId` can be edited safely in the segment edit flow.
- Rename uses atomic remap semantics (no partial invalid state).
- Collision and invalid-ID cases are rejected cleanly.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_044`.
- Blocks: item_281.
- Related AC: AC6, AC17.
- References:
  - `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
  - `src/store/actions.ts`
  - `src/store/reducer/segmentReducer.ts`
  - `src/app/hooks/useSegmentHandlers.ts`
  - `src/tests/store.reducer.entities.spec.ts`

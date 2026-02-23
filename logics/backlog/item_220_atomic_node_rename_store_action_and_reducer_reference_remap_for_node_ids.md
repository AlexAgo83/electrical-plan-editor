## item_220_atomic_node_rename_store_action_and_reducer_reference_remap_for_node_ids - Atomic Node Rename Store Action and Reducer Reference Remap for Node IDs
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Referentially Safe Node ID Rename in Store/Reducer Layer
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`node.id` is currently the primary key across graph state (`nodes`, `segments`, `nodePositions`, selection). There is no dedicated atomic rename path, so enabling Node ID edits without store support risks broken references and fragmented history.

# Scope
- In:
  - Add `node/rename` action and action creator (`fromId`, `toId`).
  - Wire `node/rename` into root reducer routing/finalization flow.
  - Implement atomic rename behavior in node reducer:
    - validate source exists and target is non-empty/trimmed
    - no-op safety for same ID
    - collision rejection for existing target ID
    - move node entity key and update embedded `id`
    - remap `segments.nodeA` / `segments.nodeB`
    - remap `nodePositions`
    - remap selected node in `ui.selected`
    - preserve deterministic `nodes.allIds` ordering
    - bump revision once
  - Preserve store-level error guard behavior (`ui.lastError`) on failures.
- Out:
  - Node form/UI wiring for editable input and submit orchestration.
  - Local UI state remap outside store (route preview and similar).
  - Regression tests beyond minimal reducer sanity if added later in dedicated test item.

# Acceptance criteria
- A `node/rename` action exists and is handled in the same domain finalization path as other node actions.
- Successful rename atomically updates node store entities and all in-store node-ID references (segments, positions, selection).
- Duplicate target ID rename is rejected without partial state mutation.
- No-op rename (`fromId === toId` after normalization) is safe.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_036`.
- Blocks: item_221, item_222, item_223, item_224.
- Related AC: AC2, AC3, AC4, AC5, AC6, AC7.
- References:
  - `logics/request/req_036_node_id_editability_via_atomic_node_rename_and_reference_remap.md`
  - `src/store/actions.ts`
  - `src/store/reducer.ts`
  - `src/store/reducer/nodeReducer.ts`
  - `src/store/reducer/segmentReducer.ts`
  - `src/store/types.ts`


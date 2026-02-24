## item_222_local_ui_node_id_state_sync_or_safe_reset_after_node_rename - Local UI Node-ID State Sync (or Explicit Safe Reset) After Node Rename
> From version: 0.7.3
> Understanding: 96%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: UI State Coherence for Node-ID-Based Local Selections After Rename
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Some UI state is stored locally outside the centralized store and may keep raw `nodeId` strings (for example route preview start/end node selectors). A successful node rename can leave these values stale unless explicitly remapped.

# Scope
- In:
  - Audit local UI state holders that persist/select `nodeId` strings outside store state.
  - Implement automatic remap of old node ID to new node ID for affected local states (confirmed behavior for `req_036`).
  - At minimum, handle route preview start/end node selections if they are active in current UI architecture.
  - If any local state cannot be safely remapped, implement explicit reset behavior and document rationale.
  - Keep behavior coherent with user context preservation expectations.
- Out:
  - Store-managed `ui.selected` remap (covered by store/reducer item).
  - Broad redesign of screen-local state management.
  - Non-node local state changes unrelated to rename.

# Acceptance criteria
- Local UI states holding renamed `nodeId` values are remapped automatically to the new ID where applicable.
- Route preview start/end node selectors (if active) remain coherent after node rename, or are explicitly reset with documented rationale.
- No stale local `nodeId` value causes obvious broken UI state after rename.

# Priority
- Impact: Medium-High.
- Urgency: High.

# Notes
- Dependencies: `req_036`, item_220, item_221.
- Blocks: item_223, item_224.
- Related AC: AC8, AC9.
- References:
  - `logics/request/req_036_node_id_editability_via_atomic_node_rename_and_reference_remap.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useAppControllerCanvasDisplayState.ts`
  - `src/app/components/network-summary/NetworkRoutePreviewPanel.tsx`
  - `src/app/hooks/useAppControllerLayoutDerivedState.ts`


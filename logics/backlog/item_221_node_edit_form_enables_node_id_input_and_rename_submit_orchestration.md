## item_221_node_edit_form_enables_node_id_input_and_rename_submit_orchestration - Node Edit Form Enables Node ID Input and Rename Submit Orchestration
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: Node Form UX and Submit Flow Support for Safe Node ID Editing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The Node form disables `Node ID` in edit mode and `useNodeHandlers` ignores edited ID input while editing, preventing any node rename flow even if reducer support exists.

# Scope
- In:
  - Enable `Node ID` input in `Edit Node` mode.
  - Replace immutable helper copy with rename-aware constraints/help text.
  - Update `useNodeHandlers` submit flow to:
    - detect `editingNodeId` -> `nodeIdInput` changes
    - dispatch `node/rename` atomically before `node/upsert` when needed
    - update local `editingNodeId` after successful rename
    - preserve selection/focus behavior on saved node
    - keep create-mode behavior unchanged
  - Surface rename failures as inline Node form errors while retaining reducer/store error guards.
- Out:
  - Broader form architecture refactors.
  - Connector/splice/segment/wire ID editability.
  - Local UI state remap outside the Node form workflow (handled separately).

# Acceptance criteria
- `Edit Node` mode allows typing a new `Node ID`.
- Submitting a changed `Node ID` triggers rename behavior (not silent ignore of input).
- Rename collisions/failures are shown in the Node form inline error area and do not corrupt form state.
- Existing create-node flow and non-ID node edits remain functional.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_036`, item_220.
- Blocks: item_222, item_223, item_224.
- Related AC: AC1, AC2, AC5, AC5a, AC6.
- References:
  - `logics/request/req_036_node_id_editability_via_atomic_node_rename_and_reference_remap.md`
  - `src/app/components/workspace/ModelingNodeFormPanel.tsx`
  - `src/app/hooks/useNodeHandlers.ts`
  - `src/app/hooks/useEntityFormsState.ts`
  - `src/store/actions.ts`
  - `src/store/reducer/nodeReducer.ts`


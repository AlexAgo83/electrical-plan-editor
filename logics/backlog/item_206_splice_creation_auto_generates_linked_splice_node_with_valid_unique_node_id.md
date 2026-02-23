## item_206_splice_creation_auto_generates_linked_splice_node_with_valid_unique_node_id - Splice Creation Auto-Generates Linked Splice Node with Valid Unique Node ID
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: Splice Creation Bootstrap Automation for Graph Readiness
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Creating a splice currently requires a separate manual node creation step, adding friction before the splice can participate naturally in graph workflows.

# Scope
- In:
  - Automatically create a linked splice node upon successful splice creation.
  - Ensure generated node ID is unique and valid.
  - Link node to the created splice correctly (`kind: splice`, `spliceId`).
  - Preserve existing splice creation validation behavior.
  - Reuse shared automation patterns/helpers from connector flow where practical.
- Out:
  - Connector auto-node creation (handled separately).
  - Automatic advanced placement heuristics for the created node.

# Acceptance criteria
- Successful splice creation produces a corresponding splice node automatically.
- The auto-created node references the splice correctly and has a unique node ID.
- Normal modeling workflows can edit/delete the created node afterward.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_034`.
- Blocks: item_207, item_208, item_209, item_210.
- Related AC: AC5, AC6, AC7, AC8.
- References:
  - `logics/request/req_034_creation_form_auto_technical_id_suggestions_and_connector_splice_auto_node_creation.md`
  - `src/app/hooks/useSpliceHandlers.ts`
  - `src/app/hooks/useNodeHandlers.ts`
  - `src/store/actions.ts`
  - `src/store/reducer/spliceReducer.ts`
  - `src/store/reducer/nodeReducer.ts`


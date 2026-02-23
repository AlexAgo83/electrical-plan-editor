## item_205_connector_creation_auto_generates_linked_connector_node_with_valid_unique_node_id - Connector Creation Auto-Generates Linked Connector Node with Valid Unique Node ID
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: Connector Creation Bootstrap Automation for Graph Readiness
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Creating a connector currently requires an additional manual node creation step before it is fully usable in graph modeling workflows.

# Scope
- In:
  - Automatically create a linked connector node upon successful connector creation.
  - Ensure generated node ID is unique and valid.
  - Link node to the created connector correctly (`kind: connector`, `connectorId`).
  - Preserve existing connector creation validation behavior.
  - Define where the orchestration lives (handler, reducer, or coordinated action flow) for maintainability.
- Out:
  - Splice auto-node creation (handled separately).
  - Automatic node positioning beyond existing/default behavior (unless required for correctness).

# Acceptance criteria
- Successful connector creation produces a corresponding connector node automatically.
- The auto-created node references the connector correctly and has a unique node ID.
- Normal modeling workflows can edit/delete the created node afterward.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_034`.
- Blocks: item_207, item_208, item_209, item_210.
- Related AC: AC4, AC6, AC7, AC8.
- References:
  - `logics/request/req_034_creation_form_auto_technical_id_suggestions_and_connector_splice_auto_node_creation.md`
  - `src/app/hooks/useConnectorHandlers.ts`
  - `src/app/hooks/useNodeHandlers.ts`
  - `src/store/actions.ts`
  - `src/store/reducer/connectorReducer.ts`
  - `src/store/reducer/nodeReducer.ts`


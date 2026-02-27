## item_383_delete_confirmation_orchestration_across_catalog_and_modeling_handlers - Delete confirmation orchestration across catalog and modeling handlers
> From version: 0.9.14
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium-High
> Theme: Destructive-action guardrails in app handler layer
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Several delete flows still dispatch mutations directly from handler hooks, which allows one-click deletion without explicit user confirmation.

# Scope
- In:
  - Route delete actions through the shared confirmation requester before any delete dispatch.
  - Cover all targeted entities in req_074: network, catalog item, connector, splice, node, segment, wire.
  - Preserve existing reducer-level constraints and error reporting semantics.
  - Keep cancel branch side-effect free.
- Out:
  - Redesign of the confirm modal component itself.
  - Non-delete confirmations already covered by other requests.

# Acceptance criteria
- All listed delete handlers require user confirmation before dispatching delete mutations.
- Cancel path performs no delete mutation.
- Confirm path preserves existing deletion and validation behavior.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_074`.
- Blocks: `item_384`, `item_385`, `item_386`, `task_068`.
- Related AC: AC1, AC2, AC3, AC5.
- References:
  - `logics/request/req_074_all_delete_actions_require_styled_confirmation_modal.md`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/app/hooks/useCatalogHandlers.ts`
  - `src/app/hooks/useConnectorHandlers.ts`
  - `src/app/hooks/useSpliceHandlers.ts`
  - `src/app/hooks/useNodeHandlers.ts`
  - `src/app/hooks/useSegmentHandlers.ts`
  - `src/app/hooks/useWireHandlers.ts`

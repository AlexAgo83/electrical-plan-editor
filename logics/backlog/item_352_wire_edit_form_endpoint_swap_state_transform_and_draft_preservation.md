## item_352_wire_edit_form_endpoint_swap_state_transform_and_draft_preservation - Wire edit form endpoint swap state transform and draft preservation
> From version: 0.9.8
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Wire edit form state manipulation for endpoint A/B inversion
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The wire edit form has no deterministic one-click state transform to invert `Endpoint A` and `Endpoint B`, forcing manual edits across multiple interdependent fields.

# Scope
- In:
  - Implement a draft-only endpoint swap state transform for wire edit mode.
  - Swap all endpoint-side editable fields (kind, target ids, indexes, connection/seal refs).
  - Preserve non-endpoint wire fields.
  - Ensure derived endpoint slot hints/conditional field rendering remain coherent after swap.
- Out:
  - UI button placement/wiring (handled in `item_353`)
  - Regression test coverage (handled in `item_354`)

# Acceptance criteria
- Swap transform correctly exchanges all endpoint A/B draft fields.
- Swap does not auto-submit or mutate persisted wire data until `Save`.
- Non-endpoint wire fields remain unchanged by the swap.
- Endpoint hints and type-specific controls remain coherent after swap.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_063`.
- Blocks: `item_353`, `item_354`, `task_060`.
- Related AC: AC2, AC3, AC4.
- References:
  - `logics/request/req_063_wire_edit_swap_endpoint_a_b_action_between_save_and_cancel.md`
  - `src/app/hooks/useModelingFormsState.ts`
  - `src/app/hooks/useWireFormHandlers.ts`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`

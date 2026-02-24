## item_226_wire_create_mode_next_free_way_port_prefill_with_manual_edit_guards - Wire Create-Mode Next-Free Way/Port Prefill with Manual Edit Guards
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Smart Wire Create Prefill Without Fighting User Input
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Wire creation currently defaults endpoint indices to generic values (`1`) and does not prefill the next available `way`/`port`. Users must manually search for free slots and can be disrupted if future auto-suggestion behavior overwrites typed values.

# Scope
- In:
  - Add create-mode-only next-free slot prefill for wire endpoints A and B.
  - Prefill triggers:
    - create-mode reset/open
    - endpoint type change
    - endpoint target entity selection change (connector/splice)
  - Implement endpoint-local manual-edit guards (e.g. `endpointAIndexTouchedByUser`, `endpointBIndexTouchedByUser`) to prevent unwanted overwrite after typing.
  - Reset endpoint touched guard when endpoint type or selected target changes (new context).
  - If user manually enters an occupied index, keep the value and show occupancy warning + suggestion (no forced replacement).
  - If no slot is available, provide safe UX state/message and avoid misleading prefill.
  - Preserve current wire edit behavior (no auto-prefill in edit mode).
- Out:
  - Generalized prefill behavior for non-wire forms.
  - Submit-time auto-correction of endpoint indices.
  - Connector/splice capacity model changes.

# Acceptance criteria
- In create mode, selecting endpoint connector/splice can prefill the next available `way`/`port` for endpoints A and B.
- Manual endpoint index edits are not silently overwritten in the same endpoint context.
- Changing endpoint type/target resets the relevant touched guard and allows new contextual prefill.
- No-available-slot case is clearly indicated and handled safely.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_037`, item_227, item_225.
- Blocks: item_228, item_229.
- Related AC: AC2, AC3, AC4, AC4a, AC5.
- References:
  - `logics/request/req_037_wire_creation_endpoint_occupancy_validation_and_next_free_way_port_prefill.md`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/app/hooks/useEntityFormsState.ts`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`


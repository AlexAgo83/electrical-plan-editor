## item_366_wire_form_fuse_mode_controls_conditional_reference_inputs_and_save_cancel_semantics - Wire form fuse-mode controls, conditional reference inputs, and save/cancel semantics
> From version: 0.9.8
> Understanding: 96%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Wire form UX for fuse mode and required catalog association
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even if the wire data model supports fuse metadata, users still need a clear wire-form workflow to enable fuse mode and provide the required catalog association (`manufacturerReference` source) during create/edit.

# Scope
- In:
  - Add fuse/protection controls to wire create/edit form flows using a V1 `Fuse` checkbox.
  - Show conditional required catalog-item selection when fuse mode is enabled (displaying catalog `manufacturerReference`).
  - Allow selecting from all active-network catalog items (no fuse-specific filtering in V1).
  - Surface validation feedback for missing catalog association.
  - Preserve draft-only semantics and normal `Save` / `Cancel edit` behavior.
  - Keep non-protection wire fields unaffected unless explicitly edited.
- Out:
  - Underlying wire entity/reducer validation contract (handled in `item_365`)
  - List/analysis visibility after save (handled in `item_367`)
  - Regression suite expansion (handled in `item_368`)

# Acceptance criteria
- Users can enable/disable fuse mode in wire create/edit flows.
- Fuse mode uses a `checkbox` control in V1.
- Fuse catalog selection appears only when relevant and is required for save.
- Canceling an edit discards fuse draft changes as expected.
- Normal wire create/edit flow remains non-regressed.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_067`, `item_365`.
- Blocks: `item_367`, `item_368`, `task_065`.
- Related AC: AC2, AC3.
- References:
  - `logics/request/req_067_wire_protection_metadata_v1_fuse_kind_with_required_reference.md`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/app/hooks/useEntityFormsState.ts`
  - `src/app/AppController.tsx`
  - `src/app/components/workspace/ModelingFormsColumn.types.ts`

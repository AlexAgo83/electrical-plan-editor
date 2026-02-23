## item_246_wire_form_side_a_side_b_connection_and_seal_reference_inputs_create_edit_clear_flow - Wire Form Side A/Side B Connection and Seal Reference Inputs (Create/Edit/Clear Flow)
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Form-First Wire Endpoint Metadata UX Grouped by Side
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with domain support, users cannot enter or clear per-side connection/seal references without wire form UI and handler wiring. The UX also needs clear grouping to avoid confusion with existing endpoint topology inputs.

# Scope
- In:
  - Add wire form inputs for:
    - Side A connection reference
    - Side A seal reference
    - Side B connection reference
    - Side B seal reference
  - Group the inputs by side (recommended):
    - Side A metadata
    - Side B metadata
  - Create mode behavior:
    - fields default empty
  - Edit mode behavior:
    - existing values load
    - values can be edited/cleared
  - Keep fields available for both endpoint types (`connectorCavity` and `splicePort`) on each side.
  - Preserve values when endpoint type changes (non-destructive behavior).
  - Apply lightweight validation/normalization in form submit pipeline:
    - free-text
    - trim
    - empty -> `undefined`
    - max length `120`
  - Preserve existing wire form behaviors for other fields.
- Out:
  - Wire entity/reducer contract changes (handled in item_245).
  - Legacy persistence/import compatibility patching (handled in item_247).
  - Inspector/table/export display enhancements unless trivial and explicitly included.

# Acceptance criteria
- Wire form supports entering/editing/clearing per-side connection/seal references for sides A and B.
- Inputs remain available for both endpoint types.
- Values are preserved when endpoint types change.
- Grouped UI by side reduces ambiguity and does not break existing wire form workflows.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_041`, item_245.
- Blocks: item_248, item_249.
- Related AC: AC2, AC3, AC3a, AC4, AC7.
- References:
  - `logics/request/req_041_wire_endpoint_connection_reference_and_seal_reference_per_side.md`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/app/hooks/useEntityFormsState.ts`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`


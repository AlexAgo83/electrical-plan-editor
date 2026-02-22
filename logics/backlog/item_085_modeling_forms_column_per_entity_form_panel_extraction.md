## item_085_modeling_forms_column_per_entity_form_panel_extraction - Modeling Forms Column Per-Entity Form Panel Extraction
> From version: 0.5.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Modeling Form Surface Decomposition
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`ModelingFormsColumn.tsx` contains all entity form panels and shared mode logic (`idle/create/edit`) in one large file, making routine changes to one entity form riskier than necessary.

# Scope
- In:
  - Extract per-entity modeling form panels (connector/splice/node/segment/wire).
  - Extract shared form header/mode chip/idle-state scaffolding.
  - Preserve current mode transitions and cancel/create/edit semantics.
  - Preserve focus/selection synchronization expectations after create/save/cancel.
- Out:
  - New form features or schema changes.
  - UX redesign of form layouts.

# Acceptance criteria
- `ModelingFormsColumn.tsx` is reduced to composition logic.
- Per-entity form panels are isolated into dedicated modules.
- `idle/create/edit` behavior remains stable across all entity screens.
- Modeling integration tests and E2E smoke flows continue to pass.

# Priority
- Impact: High (broad modeling surface maintainability).
- Urgency: High (supports future entity-level iteration).

# Notes
- Dependencies: item_082 (recommended), item_081 (optional parallel).
- Blocks: item_088.
- Related AC: AC5, AC8, AC9.
- References:
  - `logics/request/req_014_ui_modularization_wave_2_controller_analysis_canvas_and_bundle_optimization.md`
  - `src/app/components/workspace/ModelingFormsColumn.tsx`
  - `src/app/components/workspace/ModelingFormsColumn.types.ts`
  - `src/app/components/workspace/ModelingFormsColumn.shared.tsx`
  - `src/app/components/workspace/ModelingConnectorFormPanel.tsx`
  - `src/app/components/workspace/ModelingSpliceFormPanel.tsx`
  - `src/app/components/workspace/ModelingNodeFormPanel.tsx`
  - `src/app/components/workspace/ModelingSegmentFormPanel.tsx`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/hooks/useConnectorHandlers.ts`
  - `src/app/hooks/useSpliceHandlers.ts`
  - `src/app/hooks/useNodeHandlers.ts`
  - `src/app/hooks/useSegmentHandlers.ts`
  - `src/app/hooks/useWireHandlers.ts`

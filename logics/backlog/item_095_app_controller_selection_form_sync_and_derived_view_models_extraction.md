## item_095_app_controller_selection_form_sync_and_derived_view_models_extraction - AppController Selection/Form Sync and Derived View Models Extraction
> From version: 0.5.1
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Selection-Driven Form Semantics and Derived UI Models
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`AppController.tsx` still contains selection-to-form synchronization rules and several derived view-model builders (`useMemo`/`useCallback`) that couple selection semantics, editing behavior, and panel display logic in one place.

# Scope
- In:
  - Extract selection/form synchronization policies into focused hooks/modules.
  - Extract grouped derived view-model logic (route preview, endpoint labels/descriptions, panel display helpers) where it improves clarity.
  - Preserve current cancel/edit/clear-selection behavior across modeling/analysis screens.
  - Keep explicit data flow (no hidden global coupling).
- Out:
  - New inspector/form features.
  - UX changes to selection behavior.

# Acceptance criteria
- Selection/form sync behavior is moved out of `AppController.tsx` into focused modules with explicit contracts.
- Derived view-model helpers are grouped into clearer modules/hooks.
- No regression in edit cancellation, focus synchronization, or inspector-driven edit flows.
- Relevant integration/E2E tests remain green.

# Priority
- Impact: High (behavior-sensitive orchestration logic).
- Urgency: High (major remaining controller complexity source).

# Notes
- Dependencies: item_094 (recommended), item_096 (optional parallel).
- Blocks: item_099.
- Related AC: AC1, AC2, AC7.
- References:
  - `logics/request/req_016_app_controller_and_layout_engine_modularization_wave_3.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useSelectionHandlers.ts`
  - `src/app/hooks/useConnectorHandlers.ts`
  - `src/app/hooks/useSpliceHandlers.ts`
  - `src/app/hooks/useNodeHandlers.ts`
  - `src/app/hooks/useSegmentHandlers.ts`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`


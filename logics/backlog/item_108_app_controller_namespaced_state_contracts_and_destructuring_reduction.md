## item_108_app_controller_namespaced_state_contracts_and_destructuring_reduction - AppController Namespaced State Contracts and Destructuring Reduction
> From version: 0.5.3
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: Local State Contract Compaction
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`AppController.tsx` still contains very large flat destructuring blocks from state hooks (`useEntityFormsState`, `useCanvasState`, and related packs), which consume many lines and make ownership difficult to scan.

# Scope
- In:
  - Refactor high-volume local state hooks/contracts to support namespaced/grouped returns where it improves readability.
  - Reduce flat destructuring footprint in `AppController`.
  - Preserve setter semantics, defaults, and type precision.
- Out:
  - Moving store-managed state into local state.
  - Behavior changes to forms/canvas/preferences flows.

# Acceptance criteria
- `AppController` flat destructuring volume is materially reduced via namespaced/cohesive state contracts.
- Types remain explicit and setter usage remains clear.
- Behavior parity is preserved for modeling forms, canvas interactions, and preferences.
- Readability improves without hidden coupling.

# Priority
- Impact: Very high (one of the largest remaining line-count contributors).
- Urgency: High (core wave-5 LOC reduction lever).

# Notes
- Dependencies: item_107 recommended (align state compaction with domain call-site boundaries).
- Blocks: item_112, item_113.
- Related AC: AC1, AC3, AC4, AC7, AC8.
- References:
  - `logics/request/req_018_app_controller_decomposition_wave_5_real_loc_reduction_and_composition_root_slimming.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useEntityFormsState.ts`
  - `src/app/hooks/useCanvasState.ts`
  - `src/app/hooks/useAppControllerPreferencesState.ts`
  - `src/app/hooks/useAppControllerCanvasDisplayState.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.settings.spec.tsx`


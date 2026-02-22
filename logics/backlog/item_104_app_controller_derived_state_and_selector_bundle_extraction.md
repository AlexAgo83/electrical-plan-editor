## item_104_app_controller_derived_state_and_selector_bundle_extraction - AppController Derived State and Selector Bundle Extraction
> From version: 0.5.2
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium-High
> Theme: Read-Only Derived Model Separation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`AppController.tsx` still mixes read-only derived models (selection-resolved entities, display counters, labels, navigator display text, etc.) with event orchestration and render composition, which obscures intent and increases cognitive load.

# Scope
- In:
  - Extract grouped derived-state/selector bundles into focused hooks/helpers.
  - Separate “computed/read-only” models from imperative event handling.
  - Preserve selector semantics and behavior.
  - Keep naming/contracts explicit and screen/domain aligned.
- Out:
  - Store selector redesign.
  - Behavioral changes to validation/selection/display semantics.

# Acceptance criteria
- Major derived read-only model clusters are no longer inlined in `AppController`.
- `AppController` more clearly separates orchestration/event wiring from computed display state.
- No regression in selection display, issue navigator, inspector context, or network summary displays.
- Relevant integration tests remain green.

# Priority
- Impact: Medium-High (clarity and reviewability improvement).
- Urgency: Medium-High (pairs naturally with slice extraction).

# Notes
- Dependencies: item_102 recommended; item_103 optional parallel if boundaries are stable.
- Blocks: item_106.
- Related AC: AC1, AC4, AC6, AC7.
- References:
  - `logics/request/req_017_app_controller_decomposition_wave_4_screen_containers_and_controller_slices.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useIssueNavigatorModel.ts`
  - `src/app/hooks/useInspectorPanelVisibility.ts`
  - `src/app/hooks/useWireEndpointDescriptions.ts`
  - `src/app/hooks/useValidationModel.ts`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - `src/tests/app.ui.validation.spec.tsx`


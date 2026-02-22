## item_103_app_controller_local_ui_state_pack_extraction - AppController Local UI State Pack Extraction
> From version: 0.5.2
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium-High
> Theme: Local State Cohesion and Noise Reduction
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`AppController.tsx` still declares many independent local `useState` hooks and related setters, making ownership and intent hard to track and increasing refactor risk when modifying UI behavior.

# Scope
- In:
  - Group cohesive local UI state into dedicated state-pack hooks/modules (preferences, canvas/UI toggles, screen-local UI state, etc.) where it improves clarity.
  - Preserve behavior, persistence integration, and default value semantics.
  - Maintain explicit ownership and avoid hidden state coupling.
- Out:
  - Reworking store-managed state into local state.
  - UX changes to preferences/canvas behavior.

# Acceptance criteria
- Multiple related local UI states are consolidated into explicit state-pack hooks/modules.
- `AppController` local state declarations are significantly reduced and easier to reason about.
- Preferences/canvas/inspector/network-scope UI behavior remains stable.
- Type safety and explicit state contracts are preserved.

# Priority
- Impact: High (major readability and maintenance gain).
- Urgency: Medium-High (best after container/slice boundaries exist).

# Notes
- Dependencies: item_102 recommended (state packs should align with slice boundaries).
- Blocks: item_106.
- Related AC: AC1, AC4, AC6, AC7.
- References:
  - `logics/request/req_017_app_controller_decomposition_wave_4_screen_containers_and_controller_slices.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useNetworkScopeFormState.ts`
  - `src/app/hooks/useCanvasState.ts`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`


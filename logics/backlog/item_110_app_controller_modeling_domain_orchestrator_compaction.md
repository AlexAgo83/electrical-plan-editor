## item_110_app_controller_modeling_domain_orchestrator_compaction - AppController Modeling Domain Orchestrator Compaction
> From version: 0.5.3
> Understanding: 98%
> Confidence: 94%
> Progress: 100%
> Complexity: High
> Theme: Modeling Handler Wiring Compaction Without Hidden Coupling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`AppController.tsx` still wires multiple modeling-domain handler hooks (`connector`, `splice`, `node`, `segment`, `wire`) and related dependencies directly, creating high line volume and repetitive plumbing.

# Scope
- In:
  - Introduce an explicit modeling-domain orchestrator layer (hook or equivalent) that compacts handler integration and shared dependencies.
  - Preserve explicit subcontracts for connector/splice/node/segment/wire behaviors.
  - Reduce repetitive AppController plumbing without hiding ownership.
- Out:
  - Merging all modeling logic into one opaque abstraction.
  - Behavioral changes to modeling flows.

# Acceptance criteria
- Modeling handler wiring volume in `AppController` is materially reduced.
- Ownership remains explicit through typed subcontracts and clear dependency boundaries.
- Modeling/canvas/edit flows remain behaviorally stable in integration and E2E tests.
- No hidden-coupling regressions are introduced.

# Priority
- Impact: High (major orchestration noise reduction).
- Urgency: Medium-High (best after state and screen-domain boundaries are stabilized).

# Notes
- Dependencies: item_107 and item_108 recommended; may interact with item_109.
- Blocks: item_112, item_113.
- Related AC: AC1, AC3, AC5, AC7, AC8.
- References:
  - `logics/request/req_018_app_controller_decomposition_wave_5_real_loc_reduction_and_composition_root_slimming.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useConnectorHandlers.ts`
  - `src/app/hooks/useSpliceHandlers.ts`
  - `src/app/hooks/useNodeHandlers.ts`
  - `src/app/hooks/useSegmentHandlers.ts`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `tests/e2e/smoke.spec.ts`


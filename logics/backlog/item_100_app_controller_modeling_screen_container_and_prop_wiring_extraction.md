## item_100_app_controller_modeling_screen_container_and_prop_wiring_extraction - AppController Modeling Screen Container and Prop Wiring Extraction
> From version: 0.5.2
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Modeling Screen Composition Decoupling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`src/app/AppController.tsx` still contains the largest screen-specific JSX branch and prop wiring for the modeling workspace (tables, forms, network summary composition), which keeps the controller noisy and difficult to review.

# Scope
- In:
  - Extract modeling screen JSX and heavyweight prop wiring from `AppController` into a dedicated screen container module.
  - Preserve current rendering order and layout structure (`ModelingPrimaryTables`, `ModelingFormsColumn`, `NetworkSummaryPanel`).
  - Preserve lazy-loading behavior and test-safe eager branch behavior.
  - Keep explicit props/interfaces (avoid hidden global coupling).
- Out:
  - Modeling UI redesign.
  - Entity form behavior changes.
  - Store/reducer changes.

# Acceptance criteria
- Modeling screen composition is moved out of `AppController.tsx` into a dedicated container (or equivalent focused module).
- Prop wiring for modeling tables/forms/network summary is no longer inlined in `AppController`.
- Modeling/canvas/edit flows remain behaviorally stable in integration and E2E smoke tests.
- `AppController.tsx` becomes materially easier to scan after extraction.

# Priority
- Impact: Very high (largest remaining JSX branch in controller).
- Urgency: High (best first-line reduction lever for wave-4).

# Notes
- Dependencies: none mandatory; foundational for follow-up screen-container and slice extraction.
- Blocks: item_106.
- Related AC: AC1, AC2, AC6, AC8.
- References:
  - `logics/request/req_017_app_controller_decomposition_wave_4_screen_containers_and_controller_slices.md`
  - `src/app/AppController.tsx`
  - `src/app/components/screens/ModelingScreen.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/ModelingFormsColumn.tsx`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `tests/e2e/smoke.spec.ts`


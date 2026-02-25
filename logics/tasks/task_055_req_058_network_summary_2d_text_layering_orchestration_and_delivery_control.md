## task_055_req_058_network_summary_2d_text_layering_orchestration_and_delivery_control - req_058 network summary 2d text layering orchestration and delivery control
> From version: 0.9.6
> Understanding: 97% (scope localized to 2D layer order + interaction safety + regression coverage)
> Confidence: 92% (delivery sequence is straightforward with `NetworkSummaryPanel` + tests)
> Progress: 0%
> Complexity: Medium
> Theme: Orchestration for req_058 2D text layering readability fix and regression safety
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
`req_058` introduces a strict visual contract for the `Network summary` 2D render: text labels must always render above nodes and segments.

This affects shared 2D rendering behavior in `NetworkSummaryPanel` and can regress interaction behavior if text layers intercept pointer events after layer-order changes.

The work should be delivered in a controlled order:
- render layer ordering first,
- interaction hardening second,
- regression coverage third.

# Objective
- Implement `req_058` with deterministic 2D layer ordering and no regressions in selection/pan/zoom behavior.
- Add maintainable regression coverage that protects the text-on-top contract.
- Synchronize `logics` docs when done.

# Scope
- In:
  - Orchestrate delivery of `item_336`, `item_337`, `item_338`
  - Run targeted 2D rendering and interaction tests during implementation
  - Run final project validation before closure
- Out:
  - Label collision avoidance or broader 2D layout redesign
  - Unrelated `Network summary` feature additions

# Backlog scope covered
- `logics/backlog/item_336_network_summary_2d_render_layer_ordering_so_labels_paint_above_nodes_and_segments.md`
- `logics/backlog/item_337_network_summary_2d_text_on_top_pointer_and_interaction_non_regression_hardening.md`
- `logics/backlog/item_338_regression_coverage_for_network_summary_2d_text_layering_order_and_occlusion_cases.md`

# Plan
- [ ] 1. Implement deterministic 2D SVG layer ordering so labels/text paint above nodes and segments (`item_336`)
- [ ] 2. Validate/harden pointer and interaction behavior after layering changes (`item_337`)
- [ ] 3. Add regression coverage for text layering order and occlusion scenarios (`item_338`)
- [ ] 4. Run targeted 2D render/interaction test suites and fix regressions
- [ ] 5. Run final validation matrix
- [ ] FINAL: Update related Logics docs

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s build`
- `npm run -s test:ci`
- `npm run -s test:e2e`

# Targeted validation guidance (recommended during implementation)
- `npx vitest run src/tests/app.ui.navigation-canvas.spec.tsx`
- `npx vitest run src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `npx vitest run src/tests/core.layout.spec.ts`

# Report
- Current blockers: none.
- Risks to track:
  - Text-on-top fix may alter pointer event routing if text becomes interactive unintentionally.
  - Structural test assertions may become brittle if tied to low-level DOM details instead of stable layer groups.
- Delivery notes:
  - Record the chosen layer/group ordering contract explicitly in code comments or component structure if non-obvious.
  - If a representative visual bug case is reproduced, document it in the tests added under `item_338`.

# References
- `logics/request/req_058_network_summary_2d_text_labels_must_render_above_nodes_and_segments.md`
- `logics/backlog/item_336_network_summary_2d_render_layer_ordering_so_labels_paint_above_nodes_and_segments.md`
- `logics/backlog/item_337_network_summary_2d_text_on_top_pointer_and_interaction_non_regression_hardening.md`
- `logics/backlog/item_338_regression_coverage_for_network_summary_2d_text_layering_order_and_occlusion_cases.md`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`

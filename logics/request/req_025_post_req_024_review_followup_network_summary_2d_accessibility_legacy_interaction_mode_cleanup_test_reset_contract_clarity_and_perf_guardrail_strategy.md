## req_025_post_req_024_review_followup_network_summary_2d_accessibility_legacy_interaction_mode_cleanup_test_reset_contract_clarity_and_perf_guardrail_strategy - Post-req_024 Review Follow-up for Network Summary 2D Accessibility, Legacy Interaction Mode Cleanup, Test Reset Contract Clarity, and Perf Guardrail Strategy
> From version: 0.5.10
> Understanding: 100%
> Confidence: 98%
> Complexity: Medium
> Theme: Follow-up Hardening for 2D Canvas Accessibility and Legacy/Test Contract Clarity
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Address post-`req_024` review findings (requalified with product decision that only `select` interaction mode is supported in UI).
- Improve keyboard accessibility of interactive nodes in the 2D network view.
- Reduce confusion from legacy `interactionMode` branches (`addSegment`, `route`, `connect`) that are no longer product-supported.
- Clarify the test helper/reset contract for `appUiModules` mutable controls.
- Revisit/document the wall-clock layout responsiveness guardrail strategy for long-term CI reliability.

# Context
After `req_024`, a follow-up review identified several points:

1. The previously suspected 2D click regression for non-`select` interaction modes is not a product bug because only `select` mode remains supported in the UI. However, legacy `interactionMode` branches are still present in code and can mislead future maintenance/reviews.
2. Interactive 2D nodes in `NetworkSummaryPanel` remain mouse-only (no keyboard semantics/focus path), leaving a notable accessibility gap.
3. `resetAppUiModulesTestControls()` resets only a subset of mutable test controls (`mode`, `delay`), while eager-registry reset happens separately in `tests/setup.ts`, making the reset contract ambiguous.
4. The layout responsiveness test remains wall-clock based; threshold tuning improved reliability, but the long-term strategy should be clarified/hardened to preserve signal without CI noise.

Related delivered context:
- `logics/request/req_024_post_req_023_review_followup_canvas_node_click_event_dedup_mouse_button_guards_empty_state_coverage_and_test_isolation_guardrails.md`
- `logics/tasks/task_023_post_req_023_review_followup_canvas_node_click_event_dedup_mouse_button_guards_empty_state_coverage_and_test_isolation_guardrails_orchestration_and_delivery_control.md`

## Objectives
- Improve keyboard accessibility for 2D network node interactions (or explicitly define constraints if partial).
- Make legacy interaction-mode code status explicit (cleanup or documented deactivation) to reduce maintenance confusion.
- Clarify and/or improve `appUiModules` test-reset semantics.
- Preserve a meaningful, documented strategy for the layout responsiveness guardrail.

## Functional Scope
### A. 2D network node accessibility follow-up (high priority)
- Add keyboard/focus semantics to interactive 2D nodes where feasible (or equivalent accessible affordance).
- Preserve existing mouse interactions and recent click dedup behavior.
- Add regression coverage for keyboard-triggered selection if implemented.

### B. Legacy `interactionMode` cleanup / contract clarity (medium priority)
- Remove unsupported legacy branches (`addSegment`, `route`, `connect`) from runtime paths if safe, or explicitly document/deactivate them to prevent confusion.
- Align types/comments with the product decision that only `select` remains UI-supported.

### C. `appUiModules` test reset contract clarity (medium priority)
- Clarify naming/behavior of reset helpers (partial vs full reset), or centralize a complete reset contract.
- Preserve current test setup behavior and lazy-loading regression reliability.

### D. Layout responsiveness guardrail strategy follow-up (medium priority)
- Document or refine the wall-clock guardrail strategy so the intent/tradeoffs are explicit and maintainable.
- Keep a pragmatic performance regression signal without excessive CI flakiness.

### E. Documentation and closure traceability (closure target)
- Document fixes/decisions in Logics artifacts.
- Record validation snapshots and `req_025` AC traceability.

## Non-functional requirements
- Preserve passing `lint`, `typecheck`, `test:ci`, `test:e2e`, `build`, and `quality:pwa`.
- Keep changes localized and reviewable.
- Avoid broad rewrites of the canvas rendering architecture.
- Respect the product decision that only `select` interaction mode is supported in UI.

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/core.layout.spec.ts`
  - Any new/updated tests for keyboard interaction on the 2D view
  - `src/tests/app.ui.lazy-loading-regression.spec.tsx` if reset contract changes
- Closure validation (recommended):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: 2D node interaction accessibility is improved with explicit keyboard/focus support (or an explicitly documented/validated alternative constraint).
- AC2: Legacy unsupported `interactionMode` branches/status are cleaned up or explicitly documented/deactivated to reduce maintenance ambiguity.
- AC3: `appUiModules` test-reset helper contract is clearer (behavior/naming/documentation and/or implementation).
- AC4: Layout responsiveness guardrail strategy is better documented/refined while preserving useful regression signal.
- AC5: Targeted and full validation suites pass.
- AC6: `req_025` AC traceability and closure docs are completed.

## Out of scope
- Reintroducing removed interaction modes into the product UI.
- Full accessibility redesign of the entire 2D canvas subsystem.
- Full performance benchmarking infrastructure replacement.
- Broad testing framework migration.

# Backlog
- Created from this request:
  - `item_145_network_summary_2d_node_keyboard_accessibility_and_focus_semantics.md`
  - `item_146_legacy_interaction_mode_runtime_cleanup_or_explicit_deactivation_contract.md`
  - `item_147_app_ui_modules_test_reset_helper_contract_clarity_and_naming_alignment.md`
  - `item_148_layout_responsiveness_guardrail_strategy_documentation_or_refinement.md`
  - `item_149_req_025_followup_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# References
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/hooks/useCanvasInteractionHandlers.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/app/components/appUiModules.tsx`
- `src/tests/setup.ts`
- `src/tests/app.ui.lazy-loading-regression.spec.tsx`
- `src/tests/core.layout.spec.ts`
- `logics/request/req_024_post_req_023_review_followup_canvas_node_click_event_dedup_mouse_button_guards_empty_state_coverage_and_test_isolation_guardrails.md`
- `logics/tasks/task_023_post_req_023_review_followup_canvas_node_click_event_dedup_mouse_button_guards_empty_state_coverage_and_test_isolation_guardrails_orchestration_and_delivery_control.md`

## req_024_post_req_023_review_followup_canvas_node_click_event_dedup_mouse_button_guards_empty_state_coverage_and_test_isolation_guardrails - Post-req_023 Review Follow-up for Canvas Node Click Event Dedup, Mouse Button Guards, Empty-State Coverage, and Test Isolation Guardrails
> From version: 0.5.9
> Understanding: 100%
> Confidence: 98%
> Complexity: Medium
> Theme: Canvas Interaction Hardening and Test Reliability Follow-up
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Address post-`req_023` review findings around duplicated canvas node click handling, missing mouse-button guards, residual empty-state regression coverage gaps, and test isolation/reliability guardrails.
- Prevent duplicate selection/edit logic execution on a single 2D node click.
- Ensure canvas drag/pan behaviors only respond to intended mouse buttons.
- Strengthen regression coverage for no-active-network empty-state behavior on non-settings screens.
- Improve test harness isolation for `appUiModules` mutable test controls and document/contain wall-clock perf test flakiness risk.

# Context
The latest review identified the following follow-up concerns after `req_023`:

1. A 2D node click can trigger selection/edit logic twice because node `<g>` handlers call canvas node logic on both `mousedown` and `click`.
2. Canvas node drag and shift-pan interactions do not guard on mouse button (`event.button`), so right/middle click can trigger unintended behavior.
3. The `Settings` no-active-network regression path is covered, but there is no focused regression coverage ensuring non-settings screens still show the no-active-network empty-state branch.
4. `appUiModules` lazy/eager test knobs remain mutable globals with reset behavior handled only in specific suites, not centrally guarded in shared test setup.
5. The layout responsiveness test remains wall-clock based and can still be noisy under CI load despite the relaxed threshold.

These are follow-up hardening items rather than release-blocking functional regressions, but they affect interaction correctness, reliability of test signal, and long-term maintainability.

Related delivered context:
- `logics/request/req_023_post_req_022_review_followup_settings_empty_state_precedence_remaining_compute_scoping_lazy_registry_tla_portability_and_test_helper_signal.md`
- `logics/tasks/task_022_post_req_022_review_followup_settings_empty_state_precedence_remaining_compute_scoping_lazy_registry_tla_portability_and_test_helper_signal_orchestration_and_delivery_control.md`

## Objectives
- Eliminate duplicate node-click side effects from 2D canvas interactions.
- Restrict canvas drag/pan interactions to intentional mouse buttons.
- Add explicit regression coverage for non-settings no-active-network empty-state behavior.
- Improve test isolation for `appUiModules` mutable test controls.
- Reassess and harden the layout responsiveness test guardrail without hiding real regressions.

## Functional Scope
### A. Canvas node click event deduplication
- Ensure a normal 2D node click triggers selection/edit logic once.
- Preserve drag initiation and current interaction mode semantics.
- Avoid changing selection/edit behavior across modeling/analysis paths beyond deduplication.

### B. Canvas mouse-button guardrails
- Add button guards to node drag start and shift-pan start handlers.
- Preserve primary-button workflows and avoid breaking current keyboard modifiers.

### C. No-active-network empty-state regression coverage (non-settings)
- Add focused tests for modeling/analysis/validation empty-state behavior when no active network exists.
- Preserve the `Settings` no-active-network accessible path delivered in `req_023`.

### D. Test isolation for `appUiModules` mutable controls
- Centralize or strengthen cleanup/reset behavior for lazy/eager test knobs (`mode`, `delay`, eager registry setup if needed).
- Prevent cross-test leakage from suites that manipulate these globals.

### E. Layout responsiveness test reliability follow-up
- Improve robustness of the responsiveness regression guardrail (documentation and/or implementation refinements) while keeping it useful for catching major regressions.
- Keep the signal explicit and reviewable.

### F. Documentation and closure traceability
- Document fixes and validation snapshots in Logics docs.
- Complete `req_024` AC traceability and backlog/task closure updates.

## Non-functional requirements
- Preserve passing `lint`, `typecheck`, `test:ci`, `test:e2e`, `build`, and `quality:pwa`.
- Keep changes localized and reviewable.
- Avoid broad canvas architecture redesign.
- Preserve recent fixes from `req_023`.

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.networks.spec.tsx` and/or a new shell-focused no-active-network regression test
  - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
  - `src/tests/core.layout.spec.ts`
- Closure validation (recommended):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: A normal click on a 2D node triggers selection/edit logic once (no duplicate side effects).
- AC2: Canvas node drag and shift-pan handlers ignore non-primary mouse buttons (or equivalent explicit intended-button policy).
- AC3: Regression coverage explicitly protects non-settings no-active-network empty-state behavior while preserving Settings access.
- AC4: `appUiModules` mutable test controls have stronger cleanup/isolation guardrails across tests.
- AC5: Layout responsiveness test guardrail remains meaningful and less flaky/noisy under CI load (implementation or documented strategy).
- AC6: Targeted and full validation suites pass.
- AC7: `req_024` AC traceability and closure docs are completed.

## Out of scope
- New canvas features or interaction modes.
- Large refactors of the AppController/canvas architecture.
- Full replacement of performance testing strategy beyond pragmatic hardening.
- Broad test framework migration.

# Backlog
- Created from this request:
  - `item_139_canvas_2d_node_click_event_dedup_and_single_dispatch_behavior.md`
  - `item_140_canvas_mouse_button_guards_for_node_drag_and_shift_pan.md`
  - `item_141_no_active_network_empty_state_non_settings_regression_coverage.md`
  - `item_142_app_ui_modules_test_global_control_cleanup_centralization.md`
  - `item_143_layout_responsiveness_test_guardrail_reliability_followup.md`
  - `item_144_req_024_followup_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# References
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/hooks/useCanvasInteractionHandlers.ts`
- `src/app/components/layout/AppShellLayout.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `src/tests/app.ui.networks.spec.tsx`
- `src/tests/app.ui.lazy-loading-regression.spec.tsx`
- `src/tests/setup.ts`
- `src/app/components/appUiModules.tsx`
- `src/tests/core.layout.spec.ts`
- `logics/request/req_023_post_req_022_review_followup_settings_empty_state_precedence_remaining_compute_scoping_lazy_registry_tla_portability_and_test_helper_signal.md`
- `logics/tasks/task_022_post_req_022_review_followup_settings_empty_state_precedence_remaining_compute_scoping_lazy_registry_tla_portability_and_test_helper_signal_orchestration_and_delivery_control.md`

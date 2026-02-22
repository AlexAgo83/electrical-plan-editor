## req_019_app_controller_post_wave_5_hardening_accessibility_loading_and_contract_clarity - AppController Post-Wave-5 Hardening (Accessibility, Loading Behavior, and Contract Clarity)
> From version: 0.5.4
> Understanding: 99%
> Confidence: 97%
> Complexity: Medium
> Theme: Post-refactor behavior hardening and API contract clarification
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Address post-wave-5 review findings that can still cause UX/accessibility regressions despite green tests and successful build/CI.
- Harden shell overlay behavior (`drawer`, `operations panel`) so hidden UI is not keyboard-focusable or screen-reader exposed.
- Prevent full-app visual blanking during lazy screen/content chunk loading triggered by the new UI module registry.
- Clarify/refine namespaced state helper APIs to avoid accidental duplicate local state instantiation in future refactors.
- Add regression tests for the uncovered keyboard/focus scenarios.

# Context
Wave-5 (`req_018`) successfully reduced `src/app/AppController.tsx` LOC and preserved functional behavior across current tests, but review findings identified several hardening gaps:

1. Hidden overlays remain mounted and visually hidden via CSS (`opacity`, `pointer-events`, transforms), without explicit accessibility/focus isolation.
2. A root-level `Suspense` with `fallback={null}` wraps the full app shell while wave-5 introduced lazy component registry indirection, which can blank the whole UI on cold chunk loads.
3. `useAppControllerNamespacedFormsState()` and `useAppControllerNamespacedCanvasState()` currently instantiate independent local state internally, which creates a misleading API contract and future misuse risk.
4. Existing shell regression tests cover Escape/focus-loss flows but not keyboard tab traversal against closed overlays.

These are primarily robustness/a11y/maintainability issues (not current compile/test failures), and should be addressed before further AppController decomposition waves.

Related baseline and delivered context:
- `logics/request/req_018_app_controller_decomposition_wave_5_real_loc_reduction_and_composition_root_slimming.md`
- `logics/tasks/task_017_app_controller_decomposition_wave_5_real_loc_reduction_and_composition_root_slimming_orchestration_and_delivery_control.md`

## Objectives
- Preserve wave-5 structure/LOC gains while hardening overlay focus and assistive-technology behavior.
- Improve lazy-loading UX resilience without regressing chunk splitting or test-safe eager loading behavior.
- Make namespaced state helper contracts unambiguous (builders vs hooks) to avoid accidental duplicate state trees.
- Close test coverage gaps for keyboard traversal around hidden overlays.

## Functional Scope
### A. Overlay accessibility and focus isolation hardening (high priority)
- Ensure closed navigation drawer and operations panel are not keyboard-focusable and are hidden from assistive technologies when not visible.
- Harden associated backdrops so closed backdrops do not participate in tab order or screen-reader navigation.
- Acceptable implementation strategies include conditional mounting, `inert`, `aria-hidden`, or equivalent explicit focus/AT isolation; preserve current pointer and animation behavior.
- Preserve existing Escape/focus-loss behavior and focus restoration semantics.

### B. Lazy loading UX resilience for shell composition (high priority)
- Prevent full-shell blanking caused by root `Suspense` fallback behavior when lazy UI modules are loading.
- Keep header/navigation/critical shell visible while screen-specific/workspace-specific lazy chunks resolve.
- Preserve current prod chunk boundaries and test-safe eager behavior (`import.meta.env.VITEST` path).
- Avoid introducing loading flicker loops or hydration/runtime mismatch risks.

### C. Namespaced state helper contract clarity (medium priority)
- Clarify the API surface of namespaced state helpers introduced in wave-5 so future usage does not accidentally create duplicate form/canvas local state.
- Preferred direction: keep pure builder/adapter helpers for namespacing existing state, and either remove/rename/guard misleading `use*Namespaced*State()` wrappers that allocate fresh state.
- Update usage/docs/types as needed to make intent explicit and safe for future refactors.

### D. Regression tests for hidden overlay keyboard traversal (medium priority)
- Add tests covering tab/focus traversal with closed drawer/ops panel to ensure hidden overlays/backdrops are not focusable.
- Extend existing workspace-shell regression coverage rather than weakening current assertions.
- Add targeted tests for any new loading behavior if shell-level suspense boundaries change materially.

### E. Documentation and closure traceability (closure target)
- Document applied fixes and rationale in Logics artifacts (request/task/backlog if created from this request).
- Record validation snapshots for UI regressions, CI tests, and any accessibility-focused additions.

## Non-functional requirements
- No user-facing feature expansion unrelated to hardening findings.
- Preserve keyboard shortcuts, drawer/ops interactions, inspector behavior, and shell layout semantics.
- Maintain lazy/eager module behavior and successful `build`/`quality:pwa` outcomes.
- Prefer small, reviewable patches with explicit behavior-preservation intent.

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx` (if shell focus/overlay behavior touched)
  - any added loading/suspense regression tests
- Closure validation (recommended):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: Closed navigation drawer / operations panel and their backdrops are not reachable via keyboard tab order and are hidden from assistive technologies when closed.
- AC2: Existing drawer/ops Escape, focus-loss, and focus restoration behaviors remain stable.
- AC3: Lazy screen/content loading no longer blanks the entire shell UI due to root-level `Suspense` fallback behavior.
- AC4: Lazy/eager UI module behavior remains compatible with tests and production build chunking/PWA generation.
- AC5: Namespaced forms/canvas helper APIs are clarified so they do not encourage accidental duplicate local state instantiation.
- AC6: Regression tests cover hidden-overlay keyboard traversal (and loading behavior if changed) and pass.
- AC7: Full validation pipeline passes at closure.

## Out of scope
- New app features unrelated to shell hardening.
- A broad AppController decomposition wave beyond the specific hardening findings listed here.
- Store architecture changes.
- Rewriting all shell components purely for stylistic reasons.

# Backlog
- To create from this request (proposed):
  - `item_114_app_shell_overlay_accessibility_and_focus_isolation_hardening.md`
  - `item_115_app_shell_suspense_boundary_and_lazy_loading_blank_screen_resilience.md`
  - `item_116_namespaced_state_helper_contract_clarity_and_duplicate_state_guardrails.md`
  - `item_117_workspace_shell_regression_tests_hidden_overlay_tab_focus_coverage.md`
  - `item_118_post_wave_5_hardening_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# References
- `src/app/AppController.tsx`
- `src/app/components/layout/AppShellLayout.tsx`
- `src/app/components/appUiModules.tsx`
- `src/app/styles/workspace/workspace-shell-and-nav.css`
- `src/app/hooks/useAppControllerNamespacedFormsState.ts`
- `src/app/hooks/useAppControllerNamespacedCanvasState.ts`
- `src/tests/app.ui.workspace-shell-regression.spec.tsx`
- `src/tests/app.ui.inspector-shell.spec.tsx`
- `tests/e2e/smoke.spec.ts`
- `logics/request/req_018_app_controller_decomposition_wave_5_real_loc_reduction_and_composition_root_slimming.md`
- `logics/tasks/task_017_app_controller_decomposition_wave_5_real_loc_reduction_and_composition_root_slimming_orchestration_and_delivery_control.md`

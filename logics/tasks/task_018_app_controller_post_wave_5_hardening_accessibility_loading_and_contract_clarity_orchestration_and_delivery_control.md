## task_018_app_controller_post_wave_5_hardening_accessibility_loading_and_contract_clarity_orchestration_and_delivery_control - AppController Post-Wave-5 Hardening (Accessibility, Loading, and Contract Clarity) Orchestration and Delivery Control
> From version: 0.5.4
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Post-Refactor Hardening and Regression Coverage Sequencing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for post-wave-5 hardening introduced by `req_019`. This task coordinates sequencing and validation for overlay accessibility/focus isolation, shell lazy-loading resilience, namespaced state helper contract clarity, regression-test coverage additions, and final closure/AC traceability.

Backlog scope covered:
- `item_114_app_shell_overlay_accessibility_and_focus_isolation_hardening.md`
- `item_115_app_shell_suspense_boundary_and_lazy_loading_blank_screen_resilience.md`
- `item_116_namespaced_state_helper_contract_clarity_and_duplicate_state_guardrails.md`
- `item_117_workspace_shell_regression_tests_hidden_overlay_tab_focus_coverage.md`
- `item_118_post_wave_5_hardening_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 overlay accessibility/focus isolation hardening for closed drawer/ops panel/backdrops (`item_114`)
- [ ] 2. Deliver Wave 1 shell lazy-loading UX resilience by adjusting `Suspense` boundaries/fallback strategy without breaking chunking (`item_115`)
- [ ] 3. Deliver Wave 2 namespaced helper contract clarity/guardrails to prevent accidental duplicate local state allocation (`item_116`)
- [ ] 4. Deliver Wave 3 regression tests for hidden-overlay keyboard tab/focus behavior (+ loading behavior coverage if needed) (`item_117`)
- [ ] 5. Deliver Wave 4 closure: full validation/build/PWA pass and `req_019` AC traceability (`item_118`)
- [ ] FINAL: Update related Logics docs

# Validation
- Documentation / Logics:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static analysis / compile safety:
  - `npm run lint`
  - `npm run typecheck`
- Automated tests (unit + integration):
  - `npm run test:ci`
  - Targeted runs during hardening (recommended):
    - `npx vitest run src/tests/app.ui.workspace-shell-regression.spec.tsx`
    - `npx vitest run src/tests/app.ui.inspector-shell.spec.tsx`
    - `npx vitest run src/tests/app.ui.settings.spec.tsx` (if settings/shell loading paths affected)
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 planned: harden closed drawer/ops overlays and backdrops so hidden UI is not keyboard-focusable and not exposed to assistive technologies while preserving Escape/focus restoration flows.
  - Wave 1 planned: prevent full-shell blanking caused by root `Suspense` fallback during lazy screen/content chunk resolution while preserving prod chunking and test-safe eager behavior.
  - Wave 2 planned: clarify namespaced forms/canvas helper contracts (builders vs state-allocating hooks) to reduce future misuse risk and duplicate state instantiation.
  - Wave 3 planned: extend workspace-shell regression tests for hidden-overlay keyboard traversal and add loading-behavior regression coverage if shell suspense behavior changes materially.
  - Wave 4 planned: run full closure validation and document `req_019` AC1..AC7 traceability.
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Accessibility hardening changes break existing drawer/ops Escape or focus restoration semantics.
  - `Suspense` boundary changes alter shell mounting behavior and invalidate existing test assumptions.
  - Contract-clarity refactor introduces accidental behavior changes while renaming/removing helper wrappers.
  - Tests overfit to DOM structure instead of behavior.
- Mitigation strategy:
  - Prefer explicit, behavior-preserving hardening (conditional mount / `inert` / `aria-hidden`) with targeted shell regression tests after each change.
  - Keep lazy/eager registry behavior stable; validate with `build` and `quality:pwa` after suspense changes.
  - Treat namespaced helper changes as API-clarity work; avoid broad state refactors in the same step.
  - Add regression tests for keyboard traversal before closure to lock the intended behavior.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` pending
  - Wave-5 baseline build/tests already green prior to hardening task start

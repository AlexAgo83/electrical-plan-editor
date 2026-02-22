## task_019_app_shell_desktop_overlay_hardening_alignment_and_workspace_suspense_scoping_orchestration_and_delivery_control - App Shell Desktop Overlay Hardening Alignment and Workspace Suspense Scoping Orchestration and Delivery Control
> From version: 0.5.5
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Follow-up Shell Hardening and Suspense Scoping Delivery
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_020`. This task coordinates follow-up hardening for drawer accessibility/breakpoint alignment, workspace `Suspense` scoping to active screens, desktop breakpoint regression coverage, viewport mutation test cleanup guardrails, and final closure/AC traceability.

Backlog scope covered:
- `item_119_app_shell_drawer_hardening_breakpoint_visibility_contract_alignment.md`
- `item_120_workspace_suspense_active_screen_scoping_and_inactive_lazy_isolation.md`
- `item_121_workspace_shell_regression_desktop_breakpoint_overlay_accessibility_coverage.md`
- `item_122_shell_test_viewport_mutation_cleanup_guardrails.md`
- `item_123_req_020_followup_hardening_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 drawer hardening/breakpoint contract alignment across desktop and mobile hidden states (`item_119`)
- [ ] 2. Deliver Wave 1 workspace `Suspense` scoping so inactive lazy screens cannot suspend active workspace area (`item_120`)
- [ ] 3. Deliver Wave 2 shell regression coverage for desktop/breakpoint drawer accessibility semantics (`item_121`)
- [ ] 4. Deliver Wave 3 test robustness guardrails for viewport mutation cleanup (`item_122`)
- [ ] 5. Deliver Wave 4 closure: validation/build/PWA pass and `req_020` AC traceability (`item_123`)
- [ ] FINAL: Update related Logics docs

# Validation
- Documentation / Logics:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static analysis / compile safety:
  - `npm run lint`
  - `npm run typecheck`
- Automated tests (unit + integration):
  - `npm run test:ci`
  - Targeted runs during implementation (recommended):
    - `npx vitest run src/tests/app.ui.workspace-shell-regression.spec.tsx`
    - `npx vitest run src/tests/app.ui.inspector-shell.spec.tsx`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 planned: align drawer accessibility hardening with actual CSS/visibility behavior across breakpoints so hidden desktop drawer UI cannot remain focusable/AT-visible.
  - Wave 1 planned: scope workspace loading boundaries so inactive lazy screens cannot suspend the active workspace area while preserving shell-level resilience introduced in `req_019`.
  - Wave 2 planned: add desktop/breakpoint shell regression coverage for drawer accessibility semantics and breakpoint transitions.
  - Wave 3 planned: harden viewport mutation cleanup patterns in shell tests to avoid leaking `window.innerWidth` on failures.
  - Wave 4 planned: execute full closure validation and document `req_020` AC1..AC7 traceability.
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Drawer breakpoint alignment changes break intended desktop navigation behavior.
  - `Suspense` scoping changes alter screen mounting semantics or introduce loading flicker.
  - New tests overfit to DOM structure rather than user-visible behavior.
  - Viewport cleanup refactor changes test readability without improving reliability.
- Mitigation strategy:
  - Define explicit drawer visibility/breakpoint contract first, then align JS and CSS behavior.
  - Prefer incremental `Suspense` scoping with targeted regressions before full suite.
  - Keep tests behavior-first and isolate viewport mutation helpers/cleanup patterns.
  - Re-run build/PWA validation after suspense changes to confirm lazy chunking remains healthy.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` pending
  - `req_019` closure pipeline was green before this follow-up task

## task_156_orchestrate_runtime_rendering_and_initial_bundle_performance_overhaul - Orchestrate runtime rendering and initial bundle performance overhaul
> From version: 1.17.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Land the locale-observer gating slice first (lowest risk, immediate win multiplied by every render): implement, run i18n suites, close.
- [ ] 2. Land the bundle code-splitting slice: remove app manualChunks, verify exceljs boundary and e2e screens, re-baseline budgets in report-bundle-metrics.mjs, record before/after metrics.
- [ ] 3. Land the render-containment slice: rAF coalescing in useCanvasInteractionHandlers, memo boundaries on workspace containers with stabilized props at the AppController seam, render-count regression harness; validate drag/pan feel via the built app on the sample networks.
- [ ] 4. Land the persistence idle-scheduling slice last: idle-scheduled steady-state writes, unchanged sync flush semantics, duration instrumentation.
- [ ] 5. Run the full ci:blocking pipeline; capture final bundle metrics and render-count evidence in the task closeout; validate and close the request chain.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_647_contain_canvas_drag_pan_and_form_re_renders_with_raf_coalescing_and_memo_boundaries`
- `item_648_gate_the_locale_dom_translation_observer_in_base_locale_and_scope_attribute_re_walks`
- `item_649_restore_route_level_code_splitting_and_re_baseline_bundle_budgets`
- `item_650_move_steady_state_persistence_serialization_off_the_critical_input_path`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete.

# AI Context
- Summary: Orchestrate runtime rendering and initial bundle performance overhaul
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_161_runtime_rendering_and_initial_bundle_performance_overhaul`
- Product brief(s): `prod_012_editor_responsiveness_and_load_time_performance`
- Architecture decision(s): (none yet)

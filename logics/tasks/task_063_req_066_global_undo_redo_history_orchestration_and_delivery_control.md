## task_063_req_066_global_undo_redo_history_orchestration_and_delivery_control - req_066 Global undo/redo history orchestration and delivery control
> From version: 0.9.8
> Understanding: 97% (V1 scope is a global undo/redo feature for workspace-domain mutations with UI actions, shortcuts, history boundaries, and explicit UI-state exclusions)
> Confidence: 92% (cross-cutting state/history work is tractable but requires careful sequencing and regression coverage)
> Progress: 0%
> Complexity: High
> Theme: Orchestration for global undo/redo delivery
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
`req_066` introduces a high-impact editing safety feature: global `Undo / Redo` for workspace-domain mutations.

The feature is cross-cutting and touches:
- workspace state/history infrastructure
- UI action integration and keyboard shortcuts
- bulk-operation grouping and reset boundaries
- regression coverage across multiple editing domains

V1 scope intentionally excludes UI-only state (theme/preferences/navigation/selection/viewport) and does not require history persistence across reloads.

# Objective
- Deliver a deterministic global undo/redo capability for representative modeling and catalog mutations.
- Provide discoverable UI actions and keyboard shortcuts with safe focus guards.
- Preserve existing form save/cancel semantics and avoid history contamination by UI-only state.
- Synchronize `logics` docs after delivery.

# Scope
- In:
  - Orchestrate `item_361`..`item_364`
  - Sequence history foundation before UX integration and regression hardening
  - Run targeted and final validation gates
  - Update request/backlog/task progress and delivery notes
- Out:
  - Persisted history across reloads
  - Advanced history timeline UI / labels
  - Collaborative undo semantics

# Backlog scope covered
- `logics/backlog/item_361_workspace_history_snapshot_contract_and_domain_mutation_tracking_for_undo_redo.md`
- `logics/backlog/item_362_undo_redo_ui_actions_shortcuts_and_input_focus_guard_integration.md`
- `logics/backlog/item_363_undo_redo_history_grouping_no_op_filtering_and_reset_boundaries.md`
- `logics/backlog/item_364_regression_coverage_for_global_undo_redo_mutations_shortcuts_and_scope_exclusions.md`

# Plan
- [ ] 1. Implement history foundation for workspace-domain mutation tracking and deterministic undo/redo transitions (`item_361`)
- [ ] 2. Integrate visible undo/redo UI actions plus keyboard shortcuts with input-focus guards (`item_362`)
- [ ] 3. Harden history grouping, no-op filtering, and reset boundaries for bulk/replacement flows (`item_363`)
- [ ] 4. Add regression coverage for representative mutations, shortcuts, scope exclusions, and redo-branch semantics (`item_364`)
- [ ] 5. Run targeted undo/redo validation suites and fix regressions
- [ ] 6. Run final validation matrix
- [ ] FINAL: Update related `logics` docs (request/backlog/task progress + delivery summary)

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:pwa`
- `npm run -s build`
- `npm run -s test:ci`
- `npm run -s test:e2e`

# Targeted validation guidance (recommended during implementation)
- `npx vitest run src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `npx vitest run src/tests/app.ui.navigation-canvas.spec.tsx`
- `npx vitest run src/tests/app.ui.catalog.spec.tsx`
- `npx vitest run src/tests/app.ui.settings-samples.spec.tsx`

# Report
- Current blockers: none.
- Risks to track:
  - History captures transient UI state and creates confusing undo/redo behavior.
  - Shortcut listeners conflict with text input editing or existing keyboard handlers.
  - Bulk operations create many history entries instead of one atomic step.
  - Snapshot-based history impacts performance/memory if not bounded for normal workloads.
  - Undo/redo interacts poorly with form-local draft state vs persisted mutations.
- Delivery notes:
  - Prefer a safe V1 (bounded snapshot history + explicit UI-state exclusions) over a fragile command-based system.
  - Define history stack size cap and grouping behavior early to prevent churn during test hardening.
  - Treat bulk mutations (samples/imports) as atomic undo steps in V1 for predictable UX.
  - Add focused shortcut tests with input-focus guards to avoid common regressions.

# References
- `logics/request/req_066_global_undo_redo_history_for_modeling_and_catalog_mutations.md`
- `logics/backlog/item_361_workspace_history_snapshot_contract_and_domain_mutation_tracking_for_undo_redo.md`
- `logics/backlog/item_362_undo_redo_ui_actions_shortcuts_and_input_focus_guard_integration.md`
- `logics/backlog/item_363_undo_redo_history_grouping_no_op_filtering_and_reset_boundaries.md`
- `logics/backlog/item_364_regression_coverage_for_global_undo_redo_mutations_shortcuts_and_scope_exclusions.md`
- `src/app/AppController.tsx`
- `src/store/index.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`

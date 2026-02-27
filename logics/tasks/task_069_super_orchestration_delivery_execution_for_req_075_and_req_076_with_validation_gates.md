## task_069_super_orchestration_delivery_execution_for_req_075_and_req_076_with_validation_gates - Super orchestration delivery execution for req_075 and req_076 with validation gates
> From version: 0.9.14
> Understanding: 98% (coordinate two coupled requests: active-network recent-changes panel from undo history and global Ctrl/Cmd+S export override)
> Confidence: 95% (scope is well-bounded with existing history/shortcut/export infrastructure)
> Progress: 100%
> Complexity: High
> Theme: Cross-request delivery orchestration for history observability and keyboard save behavior
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
This super-orchestration task coordinates the current two-request queue:
- `req_075`: Network Scope `Recent changes` panel based on undo-tracked mutations.
- `req_076`: Override `Ctrl/Cmd+S` to export the active plan and prevent browser page save.

Cross-cutting risk exists because both requests touch shared infrastructure:
- history and mutation tracking (`useStoreHistory`),
- global keyboard handling (`useKeyboardShortcuts`),
- app-level export wiring.

This task does not replace detailed request scopes. It defines execution order, validation gates, and closure discipline across both requests.

# Objective
- Deliver `req_075` and `req_076` in a controlled sequence with explicit checkpoints.
- Minimize regressions in undo/redo behavior, Network Scope UX, and keyboard shortcuts.
- Keep one shared report for queue-level status, blockers, validations, and closure readiness.

# Scope
- In:
  - Orchestrate backlog items `item_387`..`item_393`
  - Define order, validation gates, and commit/report discipline
  - Track cross-request collision risks (history metadata, shortcut routing, export behavior)
  - Require request/backlog/task doc status updates at closure
- Out:
  - New feature scope beyond `req_075` and `req_076`
  - Git history rewrite strategy

# Backlog scope covered
- `logics/backlog/item_387_network_scope_history_metadata_sidecar_for_recent_changes.md`
- `logics/backlog/item_388_network_scope_recent_changes_panel_layout_and_visibility_rules.md`
- `logics/backlog/item_389_recent_changes_entry_labeling_and_time_format_contract.md`
- `logics/backlog/item_390_req_075_recent_changes_panel_closure_validation_and_traceability.md`
- `logics/backlog/item_391_ctrl_cmd_s_global_interception_and_default_prevent_contract.md`
- `logics/backlog/item_392_ctrl_cmd_s_export_wiring_to_network_scope_export_path.md`
- `logics/backlog/item_393_req_076_ctrl_cmd_s_override_closure_validation_and_traceability.md`

# Attention points (mandatory delivery discipline)
- Validation gate after each step before advancing.
- Checkpoint commit after each completed step when possible.
- No hidden carry-over changes across steps without explicit report note.
- Keep shortcut behavior deterministic and always prevent browser save on `Ctrl/Cmd+S`.

# Recommended execution strategy
Rationale:
- Start with req_075 history metadata foundation so UI panel data is reliable.
- Complete req_075 panel/list rendering and labeling before moving to shortcut overrides.
- Deliver req_076 interception first, then wire to export path, then run broad closure validation.

# Plan
- [x] Step 1. Deliver req_075 history metadata sidecar and stack synchronization (`item_387`)
- [x] Step 2. Deliver req_075 Network Scope panel placement/visibility and entry rendering (`item_388`, `item_389`)
- [x] Step 3. Deliver req_076 global `Ctrl/Cmd+S` interception contract (`item_391`)
- [x] Step 4. Deliver req_076 export-path wiring and no-active-network behavior (`item_392`)
- [x] Step 5. Run req_075/req_076 targeted + full validation matrix and close traceability (`item_390`, `item_393`)
- [x] FINAL. Update all related `logics` docs (request/backlog/task progress + delivery summary)

# Validation gates
## A. Minimum step gate (after each Step 1-4)
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` (if logics docs changed)
- `npm run -s typecheck`
- targeted tests for touched scope

## B. Final integration gate (Step 5 mandatory)
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:pwa`
- `npm run -s build`
- `npm run -s test:ci`
- `npm run -s test:e2e`

# Targeted validation guidance
- `npm run -s test -- src/tests/app.ui.networks.spec.tsx`
- `npm run -s test -- src/tests/app.ui.undo-redo-global.spec.tsx`
- `npm run -s test -- src/tests/app.ui.settings.spec.tsx`

# Cross-request dependency / collision watchlist
- History metadata alignment with undo/redo stack boundaries and no-op filtering.
- Network Scope layout regression risk when inserting conditional panel between existing panels.
- Keyboard shortcut collisions with existing undo/redo/navigation bindings.
- Export double-fire risk if shortcut and existing handlers are not routed through a single path.

# Mitigation strategy
- Keep metadata model minimal and deterministic (no expensive diff).
- Validate panel hidden state (`X=0`) and active-network-only filtering early.
- Route `Ctrl/Cmd+S` through existing export handler path, not duplicated logic.
- Re-run shortcut regression suite after adding interception and export wiring.

# Report
- Current blockers: none.
- Current status: delivered and validated.
- Validation snapshot:
  - `npx vitest run src/tests/app.ui.networks.spec.tsx src/tests/app.ui.undo-redo-global.spec.tsx src/tests/app.ui.settings.spec.tsx` ✅

# References
- `logics/request/req_075_network_scope_recent_changes_panel_from_undo_history.md`
- `logics/request/req_076_ctrl_cmd_s_override_to_export_active_plan.md`
- `src/app/hooks/useStoreHistory.ts`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/hooks/useKeyboardShortcuts.ts`
- `src/app/hooks/useNetworkImportExport.ts`
- `src/app/AppController.tsx`
- `src/tests/app.ui.networks.spec.tsx`
- `src/tests/app.ui.undo-redo-global.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`

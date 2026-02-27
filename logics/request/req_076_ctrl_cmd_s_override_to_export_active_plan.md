## req_076_ctrl_cmd_s_override_to_export_active_plan - Override Ctrl/Cmd+S to export active plan instead of browser page save
> From version: 0.9.14
> Understanding: 100% (scope and delivered behavior are confirmed: Ctrl/Cmd+S now routes to app export and blocks browser save)
> Confidence: 99% (shortcut interception and no-active-network behavior are covered by targeted UI tests)
> Complexity: Small-Medium
> Theme: Keyboard productivity and UX consistency
> Reminder: Update Understanding/Confidence and references when editing this doc.

# Needs
- `Ctrl/Cmd+S` currently resolves to browser page save behavior.
- Expected behavior is product-centric save/export of the active plan.
- The action must be deterministic and available from anywhere in the app.

# Context
- Keyboard shortcut orchestration:
  - `src/app/hooks/useKeyboardShortcuts.ts`
- Main controller wiring and action refs:
  - `src/app/AppController.tsx`
- Existing network export handlers:
  - `src/app/hooks/useNetworkImportExport.ts`
  - `src/app/hooks/useWorkspaceHandlers.ts`

# Objective
- Capture `Ctrl+S` / `Cmd+S` globally in the app.
- Prevent native browser page-save dialog.
- Trigger export/download for the active network plan using existing export pipeline.

# Default decisions (V1)
- Shortcut mapping:
  - Windows/Linux: `Ctrl+S`
  - macOS: `Cmd+S`
- Activation policy:
  - Always active, independent from the `Enable keyboard shortcuts` preference.
- Event behavior:
  - Always `preventDefault()` and `stopPropagation()` when shortcut matches.
  - Apply even when focus is inside text inputs/textareas/contenteditable elements.
- Action target:
  - Trigger exactly the same action path as the `Export` button in Network Scope (same payload/format/file naming/message behavior).
- No-active-network behavior:
  - Do not open browser save.
  - Surface existing app-level feedback/error state only (no extra modal/confirmation).
- Integration policy:
  - Reuse existing export handler; no duplicate export implementation path.
- Scope:
  - Available across screens (home/modeling/network scope/validation/settings), with the same active-network rule.

# Functional scope
## A. Keyboard interception (high priority)
- Extend keyboard shortcut handler to include `Ctrl/Cmd+S`.
- Ensure the combination is detected reliably via `event.key` normalization.

## B. Export action wiring (high priority)
- Route shortcut to active-network export handler already used by UI actions.
- Keep filename and file-content behavior unchanged from current export implementation.

## C. Feedback consistency (medium priority)
- Keep success/failure messages consistent with existing export workflow.
- Preserve non-blocking UX (no native browser dialog).

## D. Regression safety (medium priority)
- Do not break undo/redo/navigation/view shortcuts.
- Do not change existing export formats or schema versions.

# Non-functional requirements
- No browser-native “Save page” dialog on `Ctrl/Cmd+S`.
- No duplicate event firing.
- No extra export side effects beyond existing active export action.

# Validation and regression safety
- Add/update tests to verify:
  - `Ctrl/Cmd+S` triggers active network export action.
  - Browser default save is prevented.
  - no-active-network path shows expected app-level error feedback and still prevents browser save.
  - existing shortcuts remain functional.
- Run quality/test matrix:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s test -- src/tests/app.ui.settings.spec.tsx`
  - `npm run -s test -- src/tests/app.ui.networks.spec.tsx`
  - `npm run -s test:ci`

# Acceptance criteria
- AC1: Pressing `Ctrl/Cmd+S` does not trigger browser page save.
- AC2: Pressing `Ctrl/Cmd+S` triggers export/download of the active network plan.
- AC3: `Ctrl/Cmd+S` interception applies even when an input/textarea/contenteditable field is focused.
- AC4: If no active network is selected, app shows existing export error feedback only and no browser save occurs.
- AC5: Existing keyboard shortcuts (undo/redo/navigation/issues/view) continue to work.

# Out of scope
- Changing export format or file naming strategy.
- Introducing backend/cloud save.
- Intercepting browser menu actions outside keyboard events.

# Delivery status
- Status: delivered.
- Task: `logics/tasks/task_069_super_orchestration_delivery_execution_for_req_075_and_req_076_with_validation_gates.md`.

# Backlog
- `logics/backlog/item_391_ctrl_cmd_s_global_interception_and_default_prevent_contract.md` (done)
- `logics/backlog/item_392_ctrl_cmd_s_export_wiring_to_network_scope_export_path.md` (done)
- `logics/backlog/item_393_req_076_ctrl_cmd_s_override_closure_validation_and_traceability.md` (done)

# References
- `src/app/hooks/useKeyboardShortcuts.ts`
- `src/app/AppController.tsx`
- `src/app/hooks/useNetworkImportExport.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/tests/app.ui.settings.spec.tsx`
- `src/tests/app.ui.networks.spec.tsx`

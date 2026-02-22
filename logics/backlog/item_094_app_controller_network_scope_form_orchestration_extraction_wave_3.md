## item_094_app_controller_network_scope_form_orchestration_extraction_wave_3 - AppController Network Scope Form Orchestration Extraction (Wave 3)
> From version: 0.5.1
> Understanding: 100%
> Confidence: 99%
> Progress: 100%
> Complexity: High
> Theme: Network Scope Form Lifecycle Decoupling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`src/app/AppController.tsx` still directly manages a large Network Scope form lifecycle (create/edit/cancel/submit, auto-open, focus restore), which makes the controller harder to review and increases regression risk for network management flows.

# Scope
- In:
  - Extract Network Scope form orchestration from `AppController.tsx` into a focused hook/module.
  - Cover create/edit/cancel/submit behavior, error state handling, and form target tracking.
  - Preserve auto-open edit behavior for active network on Network Scope entry.
  - Preserve focus request behavior after create/save.
- Out:
  - Network Scope UI redesign.
  - Store/network reducer behavior changes.

# Acceptance criteria
- Network Scope form orchestration logic is extracted from `AppController.tsx` into a focused module with explicit inputs/outputs.
- Existing create/edit/cancel/submit network flows behave identically.
- Auto-open edit behavior on first Network Scope entry remains stable.
- Integration tests covering network management remain green.

# Priority
- Impact: High (frequent flow, controller complexity hotspot).
- Urgency: High (early wave-3 controller reduction target).

# Notes
- Blocks: item_099.
- Dependencies: item_081 completion from `req_014` (satisfied), item_095 (completed in same wave).
- Related AC: AC1, AC2, AC7.
- Delivery status: Completed via `useNetworkScopeFormState` and `useNetworkScopeFormOrchestration`; preserved create/edit/cancel/submit flow, focus restore, and auto-open edit behavior.
- References:
  - `logics/request/req_016_app_controller_and_layout_engine_modularization_wave_3.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useNetworkScopeFormState.ts`
  - `src/app/hooks/useNetworkScopeFormOrchestration.ts`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/tests/app.ui.networks.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

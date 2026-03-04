## item_510_app_controller_network_summary_view_state_sync_hook_extraction_and_exhaustive_deps_removal - AppController network summary view-state sync extraction and exhaustive-deps removal
> From version: 1.3.1
> Status: Draft
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: Controller / React correctness
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`AppController.tsx` currently contains inlined per-network view restore/persist effects with `eslint-disable-next-line react-hooks/exhaustive-deps`, creating maintainability and correctness risk.

# Scope
- In:
  - extract network summary view-state sync logic into dedicated hook (`restore`/`persist` pair);
  - remove `exhaustive-deps` suppression in `AppController`;
  - keep per-network restore behavior and persistence semantics unchanged;
  - add regression tests for network switch and settings-default fallback behavior.
- Out:
  - broader controller decomposition beyond sync effects.

# Acceptance criteria
- AC1: `AppController.tsx` no longer contains `eslint-disable-next-line react-hooks/exhaustive-deps` for this flow.
- AC2: View-state restore/persist logic lives in a dedicated tested hook.
- AC3: Network switch behavior remains equivalent to current UX contract.
- AC4: Hook linting passes without suppression.

# AC Traceability
- AC1 -> Lint suppression is removed.
- AC2 -> Responsibility is isolated.
- AC3 -> Behavioral parity is guaranteed.
- AC4 -> React dependency correctness is enforced.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_104_post_release_architecture_and_runtime_hardening_for_preferences_measurement_and_controller_split.md`.
- Orchestrated by `logics/tasks/task_080_req_104_post_release_architecture_and_runtime_hardening_orchestration_and_delivery_control.md`.

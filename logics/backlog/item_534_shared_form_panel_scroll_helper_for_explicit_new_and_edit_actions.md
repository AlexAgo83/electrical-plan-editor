## item_534_shared_form_panel_scroll_helper_for_explicit_new_and_edit_actions - Shared form-panel scroll helper for explicit New and Edit actions
> From version: 1.4.2
> Understanding: 100%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: UX / Shared interaction helper
> Reminder: Update understanding/confidence/progress and linked task references when you edit this doc.
> Schema version: 1.0

# Problem
`New` and `Edit` flows need an intentional viewport scroll to the opened form panel, but implementing this ad hoc in each screen risks inconsistent timing, duplicated visibility checks, and regressions against existing non-scroll focus behavior.

# Scope
- In:
  - define a shared helper for action-driven scroll-to-panel behavior;
  - resolve the actual target element after the create/edit panel is mounted;
  - avoid unnecessary movement when the panel is already sufficiently visible;
  - support safe invocation from multiple workspace flows without coupling to one specific entity type;
  - preserve compatibility with existing focus helpers and non-scroll selection flows.
- Out:
  - per-screen button wiring and handler integration;
  - regression test authoring beyond helper-level support needs;
  - generic auto-scroll for passive state changes.

# Acceptance criteria
- AC1: A shared utility exists for scrolling to a target form panel after an explicit `New` or `Edit` action.
- AC2: The helper waits until the target panel is present and scrollable before attempting viewport movement.
- AC3: The helper can no-op when the target panel is already sufficiently visible.
- AC4: The helper does not change existing indirect selection/canvas-origin scroll rules.
- AC5: The helper is reusable across modeling, catalog, and network-scope list/form flows.

# AC Traceability
- AC1/AC2/AC3/AC4/AC5 -> shared helper implementation and its call contract.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_109_new_and_edit_actions_scroll_to_corresponding_form_panel.md`.
- Orchestrated by `logics/tasks/task_088_req_109_new_and_edit_scroll_to_corresponding_form_panel_orchestration_and_delivery_control.md`.
- Risks:
  - target-panel lookup may race with React render timing if the helper is called too early;
  - over-broad helper behavior could accidentally recreate disruptive auto-scroll in non-explicit flows.
- References:
  - `src/app/lib/app-utils-shared.ts`
  - `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
  - `logics/backlog/item_279_render2d_selection_sync_without_forced_table_autoscroll.md`

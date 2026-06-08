## item_534_shared_form_panel_scroll_helper_for_explicit_new_and_edit_actions - Shared form-panel scroll helper for explicit New and Edit actions
> From version: 1.4.2
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
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
- request-AC1 -> This backlog slice. Evidence needed: Clicking `New` on an in-scope list panel opens the expected create form and scrolls the page to make that form panel visible.
- request-AC2 -> This backlog slice. Evidence needed: Clicking `Edit` on an in-scope list/table row opens the expected edit form and scrolls the page to make that form panel visible.
- request-AC3 -> This backlog slice. Evidence needed: The behavior works across the shared list/form workspace patterns in scope, including `Modeling`, `Catalog`, and `Network Scope` where applicable.
- request-AC4 -> This backlog slice. Evidence needed: The scroll is tied to explicit user actions only and does not reintroduce unwanted auto-scroll for indirect selection/canvas-origin flows.
- request-AC5 -> This backlog slice. Evidence needed: If the destination form panel is already visible, the behavior does not produce an unnecessary disruptive jump.
- request-AC6 -> This backlog slice. Evidence needed: Existing create/edit state, validation messages, and selection synchronization remain non-regressed.
- request-AC7 -> This backlog slice. Evidence needed: Automated tests cover at least one `New` path and one `Edit` path with viewport-scroll assertions for representative in-scope screens.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

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

# Delivery
- Added a shared helper dedicated to explicit form-panel scroll behavior.
- The helper resolves the target form panel after render and no-ops when the panel is already sufficiently visible.
- The helper does not alter indirect selection or canvas-origin scroll behavior.

# Validation
- `npm test -- --run src/tests/app.ui.creation-flow-ergonomics.spec.tsx src/tests/app.ui.catalog.spec.tsx src/tests/app.ui.networks.spec.tsx`
- `npm run -s lint`
- `npm run -s typecheck`

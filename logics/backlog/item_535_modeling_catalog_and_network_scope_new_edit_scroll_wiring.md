## item_535_modeling_catalog_and_network_scope_new_edit_scroll_wiring - Modeling, Catalog, and Network Scope New/Edit scroll wiring
> From version: 1.4.2
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium-High
> Theme: UX / Workspace wiring
> Reminder: Update understanding/confidence/progress and linked task references when you edit this doc.
> Schema version: 1.0

# Problem
Even with a shared helper, the app still needs consistent integration across the in-scope list/form screens so that `New` and `Edit` actions actually scroll to the correct create/edit panel in each workflow.

# Scope
- In:
  - wire `New` actions to scroll to the corresponding create panel for:
    - modeling entity flows;
    - catalog list/form flows;
    - network scope list/form flows where the form opens on the same page;
  - wire `Edit` actions to scroll to the corresponding edit panel in the same in-scope flows;
  - ensure the scroll target matches the form that actually opens after the action;
  - preserve current create/edit mode changes, selection state, and validation rendering.
- Out:
  - new routing/navigation across screens not already opened by the action;
  - redesign of panel layout/order;
  - save/cancel scroll behavior.

# Acceptance criteria
- AC1: Clicking `New` in an in-scope modeling list scrolls to the matching create form panel.
- AC2: Clicking `Edit` in an in-scope modeling list/table scrolls to the matching edit form panel.
- AC3: Equivalent `New`/`Edit` behavior is wired for `Catalog` and `Network Scope` flows when their forms render in the current page.
- AC4: The resolved target panel matches the action context, not just the nearest form column wrapper.
- AC5: Existing create/edit transitions, validation states, and selected-entity synchronization remain non-regressed.

# AC Traceability
- AC1/AC2 -> Modeling workspace wiring.
- AC3 -> Catalog and Network Scope wiring.
- AC4 -> Target-resolution contract.
- AC5 -> Existing form-state orchestration remains intact.
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
- Depends on: `item_534`.
- Orchestrated by `logics/tasks/task_088_req_109_new_and_edit_scroll_to_corresponding_form_panel_orchestration_and_delivery_control.md`.
- Risks:
  - screen-specific handler assembly may have multiple entry points for `New`/`Edit`, causing partial wiring if one path is missed;
  - network scope and catalog flows may require different panel-resolution selectors than modeling forms.
- References:
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/ModelingCatalogListPanel.tsx`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
  - `src/app/hooks/controller/useAppControllerCatalogScreenDomains.tsx`

# Delivery
- Wired explicit `New` and `Edit` actions in `Modeling`, `Catalog`, and `Network Scope` to scroll to the corresponding form panel.
- Added explicit form-panel targets so the scroll destination matches the opened create/edit panel rather than a generic column wrapper.
- Preserved existing create/edit mode transitions and selection state without adding row-click auto-scroll.

# Validation
- `npm test -- --run src/tests/app.ui.creation-flow-ergonomics.spec.tsx src/tests/app.ui.catalog.spec.tsx src/tests/app.ui.networks.spec.tsx`
- `npm run -s lint`
- `npm run -s typecheck`

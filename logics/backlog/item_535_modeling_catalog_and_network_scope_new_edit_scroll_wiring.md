## item_535_modeling_catalog_and_network_scope_new_edit_scroll_wiring - Modeling, Catalog, and Network Scope New/Edit scroll wiring
> From version: 1.4.2
> Understanding: 100%
> Confidence: 97%
> Progress: 0%
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

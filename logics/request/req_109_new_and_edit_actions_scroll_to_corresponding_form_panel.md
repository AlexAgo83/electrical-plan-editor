## req_109_new_and_edit_actions_scroll_to_corresponding_form_panel - New and Edit actions scroll to the corresponding form panel
> From version: 1.4.2
> Status: Draft
> Understanding: 100%
> Confidence: 98%
> Complexity: Medium
> Theme: UX / explicit form navigation ergonomics
> Reminder: Update status/understanding/confidence and references when you edit this doc.
> Schema version: 1.0

# Needs
- When a user clicks `New` or `Edit`, the opened form panel can remain outside the current viewport, especially in long multi-column workspace layouts.
- This creates avoidable friction because the UI changes state correctly, but the user does not immediately see where to continue the workflow.
- Explicit user actions that open a create/edit form should bring that target panel into view automatically.

# Context
- The app uses multiple list-to-form workspace compositions where a list panel and its corresponding form panel are rendered on the same page.
- This applies at least to:
  - `Modeling` entity flows (`Connectors`, `Splices`, `Nodes`, `Segments`, `Wires`);
  - `Catalog` list/form flows;
  - `Network Scope` list/form flows.
- Existing UX already distinguishes between:
  - intentional navigation/focus behavior after explicit user actions;
  - unwanted automatic viewport jumps from indirect selection sources (for example canvas-origin selection sync).
- The requested behavior is an intentional navigation aid tied only to direct `New` / `Edit` actions.

# Objective
- Make create/edit workflows immediately visible by scrolling the viewport to the corresponding form panel after the user clicks `New` or `Edit`.
- Preserve current form-mode behavior and selection state while removing the need for manual page searching after the action.
- Keep the scroll behavior explicit, predictable, and limited to user-triggered form-opening actions.

# Scope
- In:
  - detect explicit clicks on `New` and `Edit` actions that open a form panel on the same page;
  - scroll the page so the corresponding create/edit panel becomes visible;
  - apply the behavior consistently across in-scope list/form screens following the shared workspace pattern;
  - preserve existing create/edit mode transitions, selection sync, and validation behavior;
  - add regression coverage for the new scroll contract.
- Out:
  - auto-scroll caused by passive state synchronization, canvas selection, or background updates;
  - redesign of workspace layout or panel ordering;
  - adding cross-screen routing/navigation beyond the current screen/sub-screen transitions;
  - forced scrolling on `Save`, `Cancel`, or non-form actions unless specified later.

# Locked execution decisions
- Decision 1: The scroll behavior is triggered only by explicit user activation of `New` or `Edit`.
- Decision 2: The target is the form panel that actually opened as a result of the action:
  - `New` scrolls to the corresponding create form;
  - `Edit` scrolls to the corresponding edit form.
- Decision 3: The behavior applies only when the form panel is rendered within the current page/workspace composition.
- Decision 4: The implementation must not reintroduce generic automatic scroll jumps for indirect selection flows.
- Decision 5: If the target panel is already sufficiently visible, the behavior should avoid an unnecessary disruptive jump.
- Decision 6: The scroll should respect platform/browser accessibility expectations, including reduced-motion-safe behavior where practical.

# Functional behavior contract
## A. Triggering behavior
- When the user clicks a visible `New` button that opens a create form in the current workspace, the page scrolls to that create form panel.
- When the user clicks a visible `Edit` action that opens an edit form in the current workspace, the page scrolls to that edit form panel.
- The scroll happens after the target panel becomes available in the DOM.

## B. Target resolution
- The scroll target is the opened form container/panel, not an arbitrary column wrapper.
- The target must match the action context:
  - `Connectors -> New` => `Create Connector`
  - `Connectors -> Edit` => `Edit Connector`
  - same rule for the equivalent entity/network/catalog flows.

## C. Viewport behavior
- The target panel should end up clearly visible without requiring manual follow-up scrolling.
- Recommended baseline:
  - align the panel near the top of the visible workspace area while respecting sticky header offsets if relevant;
  - avoid a second compensating jump immediately after render.
- If the panel is already visible enough for immediate interaction, no aggressive repositioning is required.

## D. Non-triggering cases
- Selecting an entity from the canvas, analysis tables, or other indirect flows must not gain this new page-scroll behavior unless they explicitly use a `New` or `Edit` action.
- Existing row-focus or selection-highlighting behavior may continue independently from this request.

# Acceptance criteria
- AC1: Clicking `New` on an in-scope list panel opens the expected create form and scrolls the page to make that form panel visible.
- AC2: Clicking `Edit` on an in-scope list/table row opens the expected edit form and scrolls the page to make that form panel visible.
- AC3: The behavior works across the shared list/form workspace patterns in scope, including `Modeling`, `Catalog`, and `Network Scope` where applicable.
- AC4: The scroll is tied to explicit user actions only and does not reintroduce unwanted auto-scroll for indirect selection/canvas-origin flows.
- AC5: If the destination form panel is already visible, the behavior does not produce an unnecessary disruptive jump.
- AC6: Existing create/edit state, validation messages, and selection synchronization remain non-regressed.
- AC7: Automated tests cover at least one `New` path and one `Edit` path with viewport-scroll assertions for representative in-scope screens.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm test -- --run src/tests/app.ui.creation-flow-ergonomics.spec.tsx src/tests/app.ui.catalog.spec.tsx src/tests/app.ui.networks.spec.tsx`
- targeted checks around:
  - `New` action scroll-to-form behavior;
  - `Edit` action scroll-to-form behavior;
  - non-regression of canvas-origin/noisy auto-scroll rules;
  - sticky-header/viewport offset behavior where relevant.

# Definition of Ready (DoR)
- [x] User intent is explicit: `New` and `Edit` should reveal the corresponding form panel automatically.
- [x] Scope boundaries are explicit between intentional action-driven scroll and indirect auto-scroll.
- [x] Acceptance criteria are testable.
- [x] Related UX constraints and likely touchpoints are referenced.

# Risks
- Scroll timing can become flaky if triggered before the form panel is mounted or fully laid out.
- Shared helper changes may affect screens that currently rely on non-scrolling focus behavior.
- Tests may need DOM scroll mocking/stubbing in jsdom to make the behavior deterministic.

# Backlog
- To create from this request:
  - `item_534_shared_form_panel_scroll_helper_for_explicit_new_and_edit_actions.md`
  - `item_535_modeling_catalog_and_network_scope_new_edit_scroll_wiring.md`
  - `item_536_regression_tests_for_action_driven_scroll_to_create_and_edit_panels.md`
  - `item_537_req_109_validation_matrix_and_closure_traceability.md`

# Delivery status
- Status: planned.
- Task: `logics/tasks/task_088_req_109_new_and_edit_scroll_to_corresponding_form_panel_orchestration_and_delivery_control.md`.

# References
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/ModelingFormsColumn.tsx`
- `src/app/components/workspace/ModelingCatalogListPanel.tsx`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/app.ui.catalog.spec.tsx`
- `src/tests/app.ui.networks.spec.tsx`
- `logics/request/req_034_creation_form_auto_technical_id_suggestions_and_connector_splice_auto_node_creation.md`
- `logics/request/req_048_merge_modeling_and_analysis_by_migrating_analysis_panels_into_modeling_workspace.md`
- `logics/backlog/item_279_render2d_selection_sync_without_forced_table_autoscroll.md`

## item_536_regression_tests_for_action_driven_scroll_to_create_and_edit_panels - Regression tests for action-driven scroll to create and edit panels
> From version: 1.4.2
> Status: Done
> Understanding: 100%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Quality / UI regression coverage
> Reminder: Update understanding/confidence/progress and linked task references when you edit this doc.
> Schema version: 1.0

# Problem
Action-driven scroll behavior is timing-sensitive and easy to regress silently. Without explicit UI coverage, future refactors can break `New`/`Edit` scroll behavior or accidentally reintroduce noisy auto-scroll in unrelated flows.

# Scope
- In:
  - add representative regression tests for `New` -> create-panel scroll behavior;
  - add representative regression tests for `Edit` -> edit-panel scroll behavior;
  - validate that scroll assertions are deterministic in test environments (mock/stub scroll APIs as needed);
  - preserve coverage for indirect-selection non-scroll behavior when relevant to touched helpers.
- Out:
  - broad end-to-end coverage for every entity combination;
  - unrelated visual/layout snapshot coverage.

# Acceptance criteria
- AC1: Automated tests assert that at least one representative `New` flow requests scroll to the opened create panel.
- AC2: Automated tests assert that at least one representative `Edit` flow requests scroll to the opened edit panel.
- AC3: Tests cover at least two different in-scope screen families or justify a representative shared-path strategy.
- AC4: Scroll assertions are deterministic and do not rely on flaky browser-layout assumptions in jsdom.
- AC5: Existing protections against unwanted indirect auto-scroll remain non-regressed where shared helpers are touched.

# AC Traceability
- AC1/AC2 -> UI tests with explicit scroll assertions.
- AC3 -> Representative screen-family coverage.
- AC4 -> Stable scroll mocking/stubbing contract.
- AC5 -> Non-scroll regression guard for indirect flows.
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
- Depends on: `item_534`, `item_535`.
- Orchestrated by `logics/tasks/task_088_req_109_new_and_edit_scroll_to_corresponding_form_panel_orchestration_and_delivery_control.md`.
- Risks:
  - jsdom does not model real layout, so the test strategy must assert scroll intent rather than pixel-perfect viewport results;
  - tests may become brittle if tied to implementation details instead of action/result contracts.
- References:
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/tests/app.ui.catalog.spec.tsx`
  - `src/tests/app.ui.networks.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

# Delivery
- Added deterministic scroll-intent assertions for representative `New` and `Edit` flows.
- Added non-regression coverage to confirm direct row selection does not trigger the new page scroll behavior.
- Kept the assertions based on scroll requests rather than layout-pixel assumptions in jsdom.

# Validation
- `npm test -- --run src/tests/app.ui.creation-flow-ergonomics.spec.tsx src/tests/app.ui.catalog.spec.tsx src/tests/app.ui.networks.spec.tsx`
- `npm run -s lint`
- `npm run -s typecheck`

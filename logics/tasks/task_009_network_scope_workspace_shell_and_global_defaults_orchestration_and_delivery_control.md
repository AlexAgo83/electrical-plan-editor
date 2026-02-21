## task_009_network_scope_workspace_shell_and_global_defaults_orchestration_and_delivery_control - Network Scope Workspace Shell and Global Defaults Orchestration and Delivery Control
> From version: 0.3.0
> Understanding: 100%
> Confidence: 98%
> Progress: 63%
> Complexity: High
> Theme: Workspace Shell and Navigation Delivery
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for workspace shell and navigation restructuring introduced by `req_010`. This task coordinates sequencing, dependency control, validation cadence, and delivery safety across `Network Scope`, header/drawer shell, settings entrypoint changes, floating operational controls, and contextual inspector behavior.

Backlog scope covered:
- `item_055_network_scope_screen_and_primary_navigation_restructure.md`
- `item_056_workspace_header_sticky_and_navigation_drawer_overlay.md`
- `item_057_network_scope_lifecycle_ui_extraction_and_safeguards.md`
- `item_058_global_settings_relocation_and_default_preference_update.md`
- `item_059_workspace_shell_regression_accessibility_and_scroll_behavior.md`
- `item_060_operations_health_floating_panel_and_header_badge.md`
- `item_061_network_scope_summary_capsules_relocation.md`
- `item_062_settings_header_right_entrypoint_and_left_nav_cleanup.md`
- `item_063_inspector_context_floating_bottom_right_panel.md`

# Plan
- [x] 1. Deliver Wave 0 navigation foundation: `Network Scope` primary entry and ordering (`item_055`)
- [x] 2. Deliver Wave 1 shell refactor: sticky header + drawer overlay behavior (`item_056`)
- [x] 3. Deliver Wave 2 network lifecycle consolidation in `Network Scope` with safeguards (`item_057`)
- [x] 4. Deliver Wave 3 global settings relocation and defaults (`dark` + snap enabled) with persistence compatibility (`item_058`)
- [x] 5. Deliver Wave 4 operational controls extraction: floating operations/health panel + header issue badge (`item_060`)
- [ ] 6. Deliver Wave 5 information placement cleanup: summary capsules moved to `Network Scope` and `Settings` header entrypoint cleanup (`item_061`, `item_062`)
- [ ] 7. Deliver Wave 6 contextual inspector floating panel (`open` / `collapsed` / `hidden`) anchored bottom-right (`item_063`)
- [ ] 8. Deliver Wave 7 regression, accessibility, scroll-layering, and AC traceability closure (`item_059`)
- [ ] FINAL: Update related Logics docs

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run lint`
- `npm run typecheck`
- `npm run test:ci`
- `npm run test:e2e`
- `npm run quality:ui-modularization`
- `npm run quality:store-modularization`

# Report
- Wave status:
  - Wave 0 completed: added `Network Scope` primary workspace entry, updated navigation order, and introduced explicit separation from entity-level tabs.
  - Wave 1 completed: implemented sticky header, header menu toggle, overlay drawer behavior, outside click/focus close, and escape-to-close with focus return.
  - Wave 2 completed: moved active-network lifecycle controls (select/create/rename/duplicate/delete) into `Network Scope` workspace with existing safeguards preserved.
  - Wave 3 completed: relocated global preferences to `Network Scope`, kept `Settings` for sample/import-export tools, and switched fresh/reset defaults to dark mode + snap enabled.
  - Wave 4 completed: moved undo/redo + model health actions into a floating panel opened from header right, with issue-count badge and outside/focus/escape close behavior.
  - Wave 5 pending: summary capsule relocation and settings entrypoint cleanup not started.
  - Wave 6 pending: contextual inspector floating panel behavior not started.
  - Wave 7 pending: regression/accessibility/traceability closure not started.
- Current blockers:
  - None. Sequence dependencies between shell waves remain mandatory.
- Main risks to track:
  - Focus/keyboard regressions from overlay drawer and multiple floating panels.
  - Scroll/layering conflicts between sticky header, content viewport, and bottom-right inspector.
  - Behavioral drift in persistence defaults and existing user-preference migration paths.
  - Increased shell complexity causing UI test flakiness if wave sequencing is bypassed.
- Mitigation strategy:
  - Enforce wave-by-wave delivery with full quality gate execution at each boundary.
  - Keep accessibility checks explicit for open/close/focus-return interactions.
  - Validate preference migration and local persistence invariants before closing defaults wave.
  - Maintain AC traceability matrix closure in final regression wave (`item_059`).
- Validation snapshot (Wave 0):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` OK
  - `npm run typecheck` OK
  - `npm run lint` OK
  - `npm test -- src/tests/app.ui.navigation-canvas.spec.tsx src/tests/app.ui.settings.spec.tsx src/tests/app.ui.theme.spec.tsx` OK
- Validation snapshot (Wave 1):
  - `npm run typecheck` OK
  - `npm run lint` OK
  - `npm test -- src/tests/app.ui.navigation-canvas.spec.tsx` OK
- Validation snapshot (Wave 2):
  - `npm run typecheck` OK
  - `npm run lint` OK
  - `npm test -- src/tests/app.ui.networks.spec.tsx src/tests/app.ui.navigation-canvas.spec.tsx` OK
- Validation snapshot (Wave 3):
  - `npm run typecheck` OK
  - `npm run lint` OK
  - `npm test -- src/tests/app.ui.settings.spec.tsx src/tests/app.ui.theme.spec.tsx src/tests/app.ui.networks.spec.tsx src/tests/app.ui.navigation-canvas.spec.tsx` OK
- Validation snapshot (Wave 4):
  - `npm run typecheck` OK
  - `npm run lint` OK
  - `npm test -- src/tests/app.ui.navigation-canvas.spec.tsx src/tests/app.ui.validation.spec.tsx` OK

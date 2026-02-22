## task_028_network_summary_2d_zoom_invariant_labels_with_size_and_rotation_preferences_orchestration_and_delivery_control - Network Summary 2D Zoom-Invariant Labels with Size and Rotation Preferences Orchestration and Delivery Control
> From version: 0.6.2
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: Delivery Orchestration for 2D Label Readability Controls (Zoom Invariance + Size/Rotation Preferences)
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_029`. This task coordinates delivery of zoom-invariant 2D label rendering in `Network summary`, label anchoring stability during pan/zoom, `Settings` preferences for label size (`Small / Normal / Large`) and rotation (`0° / 20° / 45° / 90°`), defaults/normalization handling, regression/theme/readability verification, and final closure traceability.

Backlog scope covered:
- `item_166_network_summary_2d_zoom_invariant_label_rendering_and_entity_anchoring.md`
- `item_167_settings_2d_label_size_and_rotation_preferences_ui_and_persistence_wiring.md`
- `item_168_2d_label_preference_defaults_normalization_and_center_rotation_application.md`
- `item_169_2d_label_theme_readability_and_regression_coverage_for_zoom_invariant_behavior.md`
- `item_170_req_029_2d_label_readability_controls_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 zoom-invariant 2D label rendering and entity anchoring stability in `Network summary` (`item_166`)
- [ ] 2. Deliver Wave 1 `Settings` controls and UI-preference wiring for 2D label size and rotation (`item_167`)
- [ ] 3. Deliver Wave 2 defaults/normalization safety and center-based rotation application (`item_168`)
- [ ] 4. Deliver Wave 3 regression/theme/readability coverage for zoom-invariant labels and settings controls (`item_169`)
- [ ] 5. Deliver Wave 4 closure: CI/E2E/build/PWA pass and `req_029` AC traceability (`item_170`)
- [ ] FINAL: Update related Logics docs (request/task/backlog statuses + delivery summary)

# Validation
- Documentation / Logics:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static analysis / compile safety:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run quality:ui-modularization`
  - `npm run quality:store-modularization`
- Automated tests:
  - Targeted runs during implementation (recommended):
    - `src/tests/app.ui.navigation-canvas.spec.tsx`
    - `src/tests/app.ui.settings.spec.tsx`
    - any preference-schema tests touched by normalization changes
  - `npm run test:ci`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 pending: implement zoom-invariant 2D label sizing while preserving pan/zoom anchoring to entities.
  - Wave 1 pending: add `Settings` controls for label size and rotation with runtime + persistence wiring.
  - Wave 2 pending: enforce defaults (`Normal`, `0°`), normalization safety, and center-based label rotation geometry.
  - Wave 3 pending: add regression coverage and verify theme/readability behavior across representative zoom/theme scenarios.
  - Wave 4 pending: run closure validation suite and document AC traceability.
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Zoom-invariant implementation introduces label jitter or anchoring drift during pan/zoom.
  - Label transforms (size + rotation) conflict with SVG text positioning and reduce readability.
  - Preference wiring/persistence introduces invalid stored values without normalization.
  - Tests only validate presence of controls and miss actual render/transform behavior.
- Mitigation strategy:
  - Implement and validate label transform math incrementally with targeted canvas assertions.
  - Keep rotation origin explicit (center-based transform) and isolate transform composition.
  - Normalize preference values at the UI preference boundary and test stale/invalid cases if touched.
  - Verify readability across representative themes after transform changes.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` OK (`req_029` + backlog items)
- Delivery snapshot:
  - To be completed during implementation.
- AC traceability (`req_029`) target mapping:
  - AC1 target: Wave 0 (`item_166`) + Wave 3 (`item_169`) + Wave 4 (`item_170`)
  - AC2 target: Wave 0 (`item_166`) + Wave 2 (`item_168`) + Wave 4 (`item_170`)
  - AC3 target: Wave 1 (`item_167`) + Wave 3 (`item_169`) + Wave 4 (`item_170`)
  - AC4 target: Wave 1 (`item_167`) + Wave 2 (`item_168`) + Wave 3 (`item_169`) + Wave 4 (`item_170`)
  - AC5 target: Wave 2 (`item_168`) + Wave 4 (`item_170`)
  - AC6 target: Wave 3 (`item_169`) + Wave 4 (`item_170`) + FINAL docs update

# References
- `logics/request/req_029_network_summary_2d_zoom_invariant_labels_with_size_and_rotation_preferences.md`
- `logics/backlog/item_166_network_summary_2d_zoom_invariant_label_rendering_and_entity_anchoring.md`
- `logics/backlog/item_167_settings_2d_label_size_and_rotation_preferences_ui_and_persistence_wiring.md`
- `logics/backlog/item_168_2d_label_preference_defaults_normalization_and_center_rotation_application.md`
- `logics/backlog/item_169_2d_label_theme_readability_and_regression_coverage_for_zoom_invariant_behavior.md`
- `logics/backlog/item_170_req_029_2d_label_readability_controls_closure_ci_e2e_build_pwa_and_ac_traceability.md`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/styles/canvas/canvas-diagram-and-overlays.css`
- `src/app/styles/base/base-theme-overrides/network-canvas-entity-theme-variables.css`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `package.json`


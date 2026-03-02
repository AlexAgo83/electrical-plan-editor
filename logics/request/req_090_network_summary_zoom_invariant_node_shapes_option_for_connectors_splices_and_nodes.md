## req_090_network_summary_zoom_invariant_node_shapes_option_for_connectors_splices_and_nodes - Network summary zoom-invariant node shapes option for connectors, splices, and nodes
> From version: 0.9.18
> Status: Draft
> Understanding: 100%
> Confidence: 97%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- In 2D plan view, users need connector/splice/node shapes to remain readable when zoomed out.
- Add a settings option to keep connector squares, splice diamonds, and node circles visually stable across zoom/de-zoom.
- Preserve existing behavior as default unless user enables the new mode.

# Context
- Current shape rendering scales with the canvas zoom transform.
- At strong zoom-out levels, users can still read labels but shape geometry becomes too small to identify quickly.
- Labels already support zoom-invariant rendering behavior; users now ask for a similar readability aid for node shapes.

# Objective
- Introduce an optional zoom-invariant shape mode for node geometries (`connector`, `splice`, `intermediate node`) in `Network summary`.
- Improve topology legibility at far zoom-out without changing topology/model data.
- Keep interaction behavior predictable and non-regressive.

# Scope
- In:
  - add a `Settings` option for zoom-invariant node shapes in the 2D plan (Canvas-related settings area);
  - apply this mode to connector square, splice diamond, and node circle rendering;
  - keep this option independent from label-size/label-rotation settings;
  - ensure runtime toggle applies immediately;
  - persist and restore the preference via existing UI preferences flow.
- Out:
  - topology/data model changes;
  - per-entity custom size editing;
  - redesign of node visual style beyond scaling behavior.

# Locked execution decisions
- Decision 1: Feature is user-controlled by a dedicated settings toggle (or equivalent explicit option).
- Decision 2: Default is `disabled` to preserve current zoom-coupled node-size behavior.
- Decision 3: When enabled, node shapes target screen-space stability (zoom-invariant feel) with practical bounds to avoid extreme sizes.
- Decision 4: Applies globally to all three node shape families (square/diamond/circle), not only connectors.
- Decision 5: Rendering change is visual only; entity positions, routing, and graph semantics remain unchanged.
- Decision 6: Hit-testing/interaction areas must stay aligned with rendered shape size in both modes.

# Functional behavior contract
- Settings:
  - new Canvas setting exists for zoom-invariant node shapes.
  - default state is off for users without existing preference.
- Runtime rendering:
  - off: current behavior (node shapes scale with zoom).
  - on: node shapes remain approximately constant on screen during zoom in/out.
  - enabled mode must use safe min/max size bounds so shapes are neither tiny nor overly large at extreme zoom levels.
- Interactions:
  - selection, hover, click, keyboard activation, and drag behavior remain functional.
  - hit-target/hitbox behavior remains coherent with rendered shapes (no mismatch between visual size and interactive area).
- Persistence:
  - preference persists and restores across reload/relaunch.

# Acceptance criteria
- AC1: A new Canvas setting exists to enable/disable zoom-invariant node shapes.
- AC2: Default value is disabled when no prior preference exists.
- AC3: When enabled, connector/splice/node shapes remain visually stable during zoom in/out compared to current behavior.
- AC4: When disabled, current zoom-coupled shape scaling behavior is unchanged.
- AC5: Enabled mode applies to squares (connectors), diamonds (splices), and circles (nodes).
- AC6: Selection/drag/hit interactions remain non-regressed in both modes, with hitboxes aligned to displayed shape size.
- AC7: Preference persists/restores correctly across reload/relaunch.
- AC8: `lint`, `typecheck`, and relevant UI tests pass after implementation.

# Validation and regression safety
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted checks around:
  - settings control rendering and persistence
  - node-shape visual behavior matrix (option off/on, zoom in/out)
  - interaction regression (select/drag/hit) with zoom-invariant mode enabled
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Divergence between rendered shape size and interaction hit areas can create UX confusion if not aligned.
- Extreme zoom scenarios can look crowded if size clamping is not tuned.
- Existing visual/snapshot tests may assume zoom-coupled node sizes.

# Backlog
- To create from this request:
  - `item_453_canvas_setting_for_zoom_invariant_node_shapes_preference_and_defaults.md`
  - `item_454_network_summary_node_shape_render_scaling_mode_for_connector_splice_node_geometries.md`
  - `item_455_zoom_invariant_node_shapes_interaction_hitbox_and_regression_coverage.md`
  - `item_456_req_090_validation_matrix_and_closure_traceability.md`

# References
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useAppControllerPreferencesState.ts`
- `src/app/AppController.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.settings-canvas-render.spec.tsx`
- `logics/request/req_029_network_summary_2d_zoom_invariant_labels_with_size_and_rotation_preferences.md`

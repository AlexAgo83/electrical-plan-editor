## req_028_network_summary_2d_subnetwork_visibility_filter_toggles_and_default_tag_labeling - Network Summary 2D Subnetwork Visibility Filter Toggles and Default Tag Labeling
> From version: 0.6.2
> Understanding: 99%
> Confidence: 100%
> Complexity: Medium
> Theme: Interactive Subnetwork Visibility Filtering in the 2D Network Summary Panel
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Improve the usability of sub-network tags in the 2D `Network summary` floating panel by turning them into interactive visibility controls.
- Allow fast focus on one or several sub-networks without fully hiding the rest of the graph.
- Keep default behavior unchanged for existing users (all subnetworks visible on first load).
- Improve labeling consistency for the default sub-network tag in the floating UI.

# Context
The 2D `Network summary` currently lists sub-network tags as informational chips in the floating sub-network panel. Users can read aggregate counts/lengths, but cannot use the list to visually isolate parts of the graph.

This makes analysis harder when the graph is dense, especially for mixed subnetworks. A lightweight visibility filter layer (toggle chips) would make the panel actionable without changing the underlying topology or data.

The requested behavior is intentionally non-destructive:
- non-selected subnetworks should become visually deemphasized (50% transparency),
- not removed from layout,
- and users must be free to activate one, several, or all subnetworks.

## Objectives
- Turn sub-network chips in the 2D floating panel into toggle buttons with visible `on/off` state.
- Apply sub-network visibility filtering to the 2D rendering using opacity/deemphasis (50%) rather than hard hide.
- Support multi-selection of active subnetworks and a one-click “enable all” control.
- Render the default tag as `DEFAULT` (italic) instead of `(default)`.
- Default to all subnetworks enabled.

## Functional Scope
### A. Sub-network chips become toggle buttons (high priority)
- Replace the informational chip display in the floating sub-network panel with stateful button controls (same interaction family as filter chips/toggles used elsewhere in the app).
- Each sub-network tag can be toggled independently `on/off`.
- Button visual states must clearly indicate active vs inactive.

### B. 2D rendering deemphasis behavior (high priority)
- When a sub-network is toggled `off`, entities not connected to any currently active sub-network should be rendered at **50% opacity**.
- “Connected to a sub-network” should be determined using segment sub-network tagging and the nodes/segments shown in the 2D graph.
- Deemphasis should affect relevant 2D entities (at minimum segments and associated nodes; labels should remain readable and coherent with the deemphasis behavior).
- Do not alter graph topology, selection state, or routing data; this is a visual filter only.

### C. Multi-activation and reset-all UX (high priority)
- Users can activate any subset of subnetworks (one, many, or all).
- Add a control at the top of the sub-network list to enable all subnetworks in one action.
- “Enable all” should not enlarge the panel unnecessarily and should follow the same compact UI language as the floating controls.

### D. Default tag formatting (medium priority)
- In the sub-network floating panel, the current default tag label `(default)` should be displayed as `DEFAULT`.
- `DEFAULT` should be rendered in *italic* style.
- This labeling change is specific to the display layer (no data migration / schema change).

### E. Initial state and persistence behavior (medium priority)
- By default, all subnetworks are active when the panel is first shown / screen opens.
- Unless explicitly decided during implementation, this filter state can remain ephemeral to the current screen session (no persistence required by this request).
- If persistence is introduced, it must be documented and covered by tests.

### F. Validation and delivery traceability (closure target)
- Add/adjust regression tests for subnetwork toggle behavior and default-tag rendering.
- Document behavior decisions and acceptance criteria traceability in Logics artifacts.

## Non-functional requirements
- Preserve current performance characteristics of the 2D rendering for typical graphs (no expensive recomputation on every render beyond lightweight set membership checks).
- Keep the floating panel compact and avoid widening the panel due to long tags or controls.
- Preserve theme compatibility across all supported themes (including composed themes such as `Amber Night`, `Burgundy Noir`, etc.).
- Keep accessibility semantics reasonable for the new toggle buttons (button role, pressed state or equivalent active-state semantics).

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/app.ui.navigation-canvas.spec.tsx` (subnetwork filter toggles + 2D deemphasis behavior)
  - any existing `Network summary`/analysis UI integration tests touched by floating panel interactions
- Visual/build checks (recommended):
  - `npm run build`
  - verify theme coverage in `Network summary` 2D panel across representative themes
- Closure validation (recommended):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: Sub-network chips in the floating 2D panel are interactive toggle buttons with visible active/inactive state.
- AC2: Users can activate any subset of subnetworks and use an “enable all” control at the top of the list.
- AC3: When one or more subnetworks are disabled, entities not connected to active subnetworks are visually deemphasized to 50% opacity (visual filter only).
- AC4: The default sub-network label is displayed as `DEFAULT` in italic style in the floating panel.
- AC5: All subnetworks are active by default.
- AC6: Theme compatibility and regression coverage are preserved, and validation suites / Logics lint pass.

## Out of scope
- Hard-hiding filtered entities (display: none / removal from SVG DOM) unless explicitly requested later.
- Changes to sub-network tagging data model, schema, or import/export format.
- New advanced filtering modes (invert selection, isolate only selected, save presets) beyond the requested toggles + “enable all”.
- Persistence of subnetwork filter state across sessions (unless explicitly added and documented during implementation).

# Backlog
- Implemented / tracked via:
  - `item_161_network_summary_subnetwork_toggle_buttons_and_active_state_ui_in_floating_panel.md`
  - `item_162_network_summary_2d_subnetwork_deemphasis_rendering_for_inactive_filters.md`
  - `item_163_subnetwork_multiselect_enable_all_control_and_default_tag_display_formatting.md`
  - `item_164_subnetwork_filter_theme_coverage_accessibility_and_navigation_canvas_regression_tests.md`
  - `item_165_req_028_subnetwork_filter_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# References
- `logics/tasks/task_027_network_summary_2d_subnetwork_visibility_filter_toggles_and_default_tag_labeling_orchestration_and_delivery_control.md`
- `src/app/components/network-summary/NetworkCanvasFloatingInfoPanels.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/styles/canvas/canvas-toolbar-and-shell.css`
- `src/app/styles/canvas/canvas-diagram-and-overlays.css`
- `src/app/styles/base/base-theme-overrides/network-canvas-entity-theme-variables.css`
- `src/tests/app.ui.navigation-canvas.spec.tsx`

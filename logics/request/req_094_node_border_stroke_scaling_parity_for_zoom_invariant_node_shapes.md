## req_094_node_border_stroke_scaling_parity_for_zoom_invariant_node_shapes - Node border stroke scaling parity for zoom-invariant node shapes
> From version: 1.1.0
> Status: Done
> Understanding: 100% (implemented with proportional stroke variables wired in network summary rendering)
> Confidence: 98% (validated through lint, typecheck, and canvas UI regression tests)
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Fix node border thickness behavior when zoom-invariant node shapes are enabled.
- Keep border/stroke visual weight coherent with node geometry for connector/splice/intermediate nodes.
- Preserve current interaction reliability (hitbox, selection, focus) while correcting stroke rendering.

# Context
- `req_090` introduced zoom-invariant node shape rendering.
- Current implementation keeps node geometry visually stable but node stroke widths still use fixed CSS values (`2` default, `3` selected/focus), creating inconsistent visual thickness depending on zoom/shape scale.
- This produces a visible mismatch:
  - border can look too heavy at small rendered sizes,
  - border can look too thin when size is increased.
- The issue is a follow-up refinement of `req_090` and should not change data model or user settings scope.

# Objective
- Ensure node stroke widths scale with node shape sizing logic so border weight remains visually proportional.
- Keep the selected/focus stroke hierarchy clear and accessible.
- Avoid regressions in pointer hit targets and keyboard focus affordances.

# Scope
- In:
  - align node stroke width computation with node shape scale in `NetworkSummary`;
  - apply parity to all node families (connector/splice/intermediate);
  - apply parity to all node border states (default, selected, focus-visible);
  - use bounded scaling (min/max clamp) to avoid extreme stroke widths;
  - keep hitbox geometry and pointer area unchanged;
  - update tests for expected styling behavior.
- Out:
  - redesign of node colors/fills;
  - changes to label-stroke system;
  - changes to zoom math, node positioning, or graph semantics.

# Locked execution decisions
- Decision 1: Node border stroke widths derive from the same node-shape scaling factor used for zoom-invariant sizing.
- Decision 2: Stroke scaling uses bounded clamp to prevent unreadable extremes.
- Decision 3: State hierarchy remains proportional:
  - selected and focus-visible border widths stay visually stronger than default border.
- Decision 4: Hitbox (`.network-node-hitbox`) remains unchanged and independent from visual stroke scaling.
- Decision 5: Feature is integrated directly into current behavior (no additional user-facing toggle).

# Functional behavior contract
- Rendering behavior:
  - when zoom-invariant node shapes are disabled, current stroke rendering remains unchanged;
  - when enabled, node border stroke width scales proportionally with rendered node size.
- State behavior:
  - default stroke, selected stroke, and focus-visible stroke all follow proportional scaling;
  - selected/focus strokes keep clear visual emphasis over default.
- Bounds:
  - stroke widths are clamped with practical min/max values to avoid “hairline” or “too bold” outlines.
- Interaction:
  - node selection, drag, and keyboard focus behavior remains non-regressed;
  - pointer hit area is unchanged from existing hitbox implementation.

# Acceptance criteria
- AC1: With zoom-invariant node shapes enabled, node border thickness remains visually proportional to node shape size across zoom/size changes.
- AC2: The proportional stroke behavior applies to connector, splice, and intermediate node shapes.
- AC3: Selected and focus-visible border states remain clearly stronger than default border after scaling.
- AC4: Hitbox interaction area remains unchanged (no regression in click/drag/focus activation reliability).
- AC5: With zoom-invariant node shapes disabled, existing stroke rendering behavior is unchanged.
- AC6: `logics_lint`, `lint`, `typecheck`, and relevant UI tests pass.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted checks around:
  - canvas rendering with zoom-invariant shapes on/off,
  - node stroke visual states (default/selected/focus),
  - non-regression of node hitbox interactions.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Over-aggressive stroke scaling can reduce contrast/readability in some themes if clamp values are poorly tuned.
- CSS/theme overrides may unintentionally bypass dynamic stroke values and cause style drift.
- Snapshot/UI tests may need updates due to expected visual stroke changes.

# Backlog
- To create from this request:
  - `item_470_network_summary_node_stroke_scaling_contract_for_zoom_invariant_shapes.md`
  - `item_471_theme_css_variable_wiring_for_node_border_state_scaling_and_clamps.md`
  - `item_472_ui_regression_coverage_for_node_stroke_scaling_default_selected_focus_states.md`
  - `item_473_req_094_closure_validation_and_traceability.md`

# References
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/styles/canvas/canvas-diagram-and-overlays.css`
- `src/app/styles/base/base-theme-overrides/network-canvas-entity-theme-variables.css`
- `src/app/AppController.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.settings-canvas-render.spec.tsx`
- `logics/request/req_090_network_summary_zoom_invariant_node_shapes_option_for_connectors_splices_and_nodes.md`

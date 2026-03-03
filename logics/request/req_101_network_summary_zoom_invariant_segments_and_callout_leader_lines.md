## req_101_network_summary_zoom_invariant_segments_and_callout_leader_lines - Network summary zoom-invariant segments and callout leader lines
> From version: 1.3.0
> Status: Draft
> Understanding: 97%
> Confidence: 94%
> Complexity: Medium
> Theme: UI / Canvas readability
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Extend zoom-invariant readability behavior to segment lines in the 2D network summary.
- Extend zoom-invariant readability behavior to connector/splice callout leader lines (dashed links).
- Keep visual consistency with existing zoom-invariant labels and node-shape behavior.

# Context
- Current 2D rendering already provides zoom-invariant behavior for text labels and node shapes.
- Segment strokes still scale geometrically with zoom, which causes readability loss when zooming out and visual overweight when zooming in.
- Dashed callout leader lines also scale geometrically, causing unstable dash rhythm and reduced legibility across zoom levels.
- Users perceive this as a visual contract gap: node/text readability is stabilized, but edge/link readability is not.

# Objective
- Make segment strokes and callout leader lines visually stable in screen space across zoom levels.
- Preserve topology semantics, selection clarity, and interaction reliability.
- Keep rendering behavior deterministic and theme-compatible.

# Scope
- In:
  - introduce zoom-invariant stroke behavior for segment lines in the network summary SVG;
  - introduce zoom-invariant stroke and dash-pattern behavior for callout leader lines;
  - apply bounded min/max clamps to avoid unusable extremes at very high/low zoom;
  - preserve state hierarchy (`default`, `selected`, `focus`/emphasis) with clear visual differentiation;
  - keep pointer interaction contracts reliable (no mismatch between visuals and hit targets);
  - add/update UI regression coverage for representative zoom states and themes.
- Out:
  - graph model/routing semantics changes;
  - redesign of callout content/table layout;
  - per-entity manual stroke-size editing controls;
  - unrelated canvas style redesign beyond segment/leader scaling behavior.

# Locked execution decisions
- Decision 1: Zoom-invariant behavior applies to both segment lines and callout leader lines as one coherent rendering contract.
- Decision 2: Segment and leader visual thickness use bounded scaling (clamp) to stay readable at extreme zoom levels.
- Decision 3: Dashed leader rhythm (dash length/gap) is also stabilized across zoom, not only stroke thickness.
- Decision 4: Selected/focus states remain visually stronger than default while respecting clamp bounds.
- Decision 5: Hit-testing and interaction zones remain coherent and non-regressed.
- Decision 6: Existing settings and persisted data contracts remain unchanged unless a dedicated control becomes strictly necessary.

# Functional behavior contract
## A. Segment stroke invariance
- Segment lines keep approximately stable on-screen thickness during zoom in/out.
- Visual hierarchy remains preserved:
  - default segment stroke;
  - selected segment stroke/emphasis;
  - any existing focused/highlighted state.
- Clamp bounds prevent segment strokes from becoming hairline-thin or excessively thick.

## B. Callout leader-line invariance
- Callout leader lines keep approximately stable on-screen thickness during zoom in/out.
- Dashed pattern remains readable and consistent (dash/gap does not collapse or explode with zoom).
- Deemphasized/non-selected callout leaders remain readable without overpowering primary geometry.

## C. Interaction and accessibility non-regression
- Segment selection and keyboard/pointer interaction remain functional and predictable.
- Callout interactions (including selection sync and drag-related visuals) remain non-regressed.
- Visual states continue to satisfy theme readability expectations in light and dark families.

## D. Export and rendering consistency
- Network summary exports (SVG/PNG) remain coherent with updated stroke contracts.
- No regression in deterministic rendering order/layering behavior introduced by prior requests.

# Acceptance criteria
- AC1: Segment strokes are visually stable across zoom in/out compared to current geometric scaling.
- AC2: Callout leader-line strokes are visually stable across zoom in/out.
- AC3: Callout dashed patterns remain readable and consistent at representative low/high zoom levels.
- AC4: Selected/focus segment and leader states remain clearly distinguishable from default states.
- AC5: Segment and callout interactions remain non-regressed (selection, hover/focus semantics, drag-linked behaviors).
- AC6: SVG/PNG export output remains coherent with updated visual contract.
- AC7: `logics_lint`, `lint`, `typecheck`, and relevant UI tests pass.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`
- targeted checks around:
  - segment/callout visual matrix at representative zoom levels (`very low`, `normal`, `high`);
  - dashed leader readability and state hierarchy (`default`, `selected`, deemphasized);
  - navigation/selection non-regression in network summary;
  - export coherence for updated stroke behavior.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Over-clamping can reduce visual nuance between states if min/max values are poorly tuned.
- Dash-pattern normalization may differ between browsers/SVG export consumers if not specified carefully.
- Performance risk on dense graphs if per-frame stroke recalculation is not optimized.

# Backlog
- To create from this request:
  - `item_487_segment_zoom_invariant_stroke_contract_and_bounds_definition.md`
  - `item_488_callout_leader_line_dash_and_stroke_zoom_invariant_rendering_alignment.md`
  - `item_489_canvas_interaction_and_export_non_regression_for_segment_and_callout_stroke_updates.md`
  - `item_490_req_101_validation_matrix_and_traceability_closure.md`

# References
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/styles/canvas/canvas-diagram-and-overlays.css`
- `src/app/styles/canvas/canvas-diagram-and-overlays/network-callouts.css`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.settings-canvas-render.spec.tsx`
- `src/tests/app.ui.settings-canvas-callouts.spec.tsx`
- `src/tests/app.ui.network-summary-layering.spec.tsx`
- `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `logics/request/req_090_network_summary_zoom_invariant_node_shapes_option_for_connectors_splices_and_nodes.md`
- `logics/request/req_094_node_border_stroke_scaling_parity_for_zoom_invariant_node_shapes.md`
- `logics/request/req_088_network_summary_export_quality_with_svg_default_and_png_switch_in_canvas_tools.md`

## req_058_network_summary_2d_text_labels_must_render_above_nodes_and_segments - Network summary 2D text labels must render above nodes and segments
> From version: 0.9.6
> Understanding: 97% (user intent is clear: 2D text readability must win over node/segment paint order)
> Confidence: 93% (scope is localized to render-layer ordering and regression coverage)
> Complexity: Medium
> Theme: 2D Render Visual Layering / Readability
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- In the `Network summary` 2D render, text must always remain visually in front of nodes and segments.
- A node or segment must not hide a text label (example: node paint should not cover a nearby/overlapping text).
- Text readability in the 2D render must remain stable across selection/highlight states and visual style options.

# Context
The 2D `Network summary` view renders multiple visual layers (segments, nodes, labels, callouts, highlights, overlays) in SVG and/or layered UI surfaces.
Because SVG visual stacking is determined by DOM paint order (and not CSS `z-index` inside the same SVG tree), a small rendering-order change can make text appear behind nodes/segments.

This creates a readability regression risk:
- labels become partially hidden,
- selected nodes/segment strokes visually mask text,
- zoom/pan interaction remains correct but the rendered plan becomes harder to read.

The user wants a strict visual rule: text should always be painted in front of nodes/segments in the 2D render.

# Objective
- Enforce a deterministic 2D render layering contract so text labels are always visually above nodes and segments.
- Preserve existing 2D interactions (selection, click targets, pan/zoom) while improving text readability.
- Add regression coverage that protects against future layer-order regressions.

# Functional scope
## A. Layering contract for 2D render text (high priority)
- In the `Network summary` 2D render, all text rendered within the visual graph surface must be painted above:
  - segment geometry/strokes,
  - node shapes/fills/strokes,
  - selection/deemphasis styling that belongs to node/segment layers.
- This contract applies regardless of:
  - active sub-screen (`connector`, `splice`, `node`, `segment`, `wire`, etc.) where the 2D render is shown,
  - current zoom/pan level,
  - label stroke mode / label size mode / label rotation settings,
  - selected entity highlight state.

## B. Text scope covered in V1 (high priority)
- V1 includes text that is part of the 2D graph render surface (SVG-rendered text or equivalent graph-layer text primitives), such as:
  - segment labels,
  - node labels/IDs,
  - other on-canvas graph text tied to rendered entities.
- If connector/splice callout text is rendered in the same SVG graph surface, it is included in this layering contract.
- If some text is rendered in separate DOM overlays already above the SVG (e.g. external panels/tooltips), it is not the primary focus of this request but must not regress.

## C. Implementation constraints (medium priority)
- Prefer explicit render-layer/group ordering (e.g. dedicated SVG groups for segments, nodes, labels, callouts) over ad-hoc per-element reordering.
- Do not rely on CSS `z-index` semantics inside a single SVG tree where they do not apply reliably to peer SVG elements.
- Keep paint order deterministic and easy to review/maintain.
- Avoid fragile "append text on every interaction" hacks if a stable layer structure can solve the issue.

## D. Interaction and hit-target non-regression (high priority)
- Fixing visual text layering must not break:
  - node click selection,
  - segment selection interactions (if applicable),
  - hover/focus behavior,
  - pan/zoom interactions,
  - keyboard accessibility semantics for interactive 2D nodes.
- If text moves above interactive shapes visually, pointer-event behavior must remain intentional:
  - clicks should still target the correct interactive entity (via hitboxes, pointer-events strategy, or equivalent).

## E. Visual readability/non-goals boundary (medium priority)
- This request is about paint-order visibility (text in front of nodes/segments), not a full label-layout engine rewrite.
- V1 does not require solving:
  - label-label overlap avoidance,
  - automatic collision-avoidance routing for text,
  - smart placement beyond current behavior.
- A text may still overlap another text in V1; the contract only ensures nodes/segments do not hide text.

# Non-functional requirements
- Deterministic visual layering across re-renders and screen switches.
- No noticeable performance regression in `Network summary` rendering from layer restructuring.
- Maintainability: layer intent should be clear in code structure (named groups/components or equivalent).

# Validation and regression safety
- Add/extend tests for:
  - 2D text remains visually above node/segment shapes in representative render states
  - selected/highlighted node/segment states do not visually cover text
  - zoom/pan and sub-screen switches do not regress the text-on-top layer order
  - existing 2D interactions (selection/pointer behavior) continue to work after layering changes
- If direct visual assertions are hard in unit/integration tests:
  - add structural assertions on SVG/group render order (labels group rendered after nodes/segments group)
  - keep at least one integration regression test covering the reported visual case indirectly

# Acceptance criteria
- AC1: In the `Network summary` 2D render, text labels are rendered visually above node and segment graphics.
- AC2: A node or segment (including selected/highlighted styling) does not visually hide text labels in normal usage states.
- AC3: Existing 2D interactions (click selection, pan/zoom, keyboard focus/activation where applicable) remain functional after the layering fix.
- AC4: Regression coverage protects the text-layer ordering contract (visual or structural assertions).

# Out of scope
- General label collision avoidance between text labels.
- Advanced label placement algorithms or leader-line routing redesign.
- Typography/style redesign of 2D labels (font, color, stroke look) beyond what is needed to preserve the layering contract.

# Backlog
- `logics/backlog/item_336_network_summary_2d_render_layer_ordering_so_labels_paint_above_nodes_and_segments.md`
- `logics/backlog/item_337_network_summary_2d_text_on_top_pointer_and_interaction_non_regression_hardening.md`
- `logics/backlog/item_338_regression_coverage_for_network_summary_2d_text_layering_order_and_occlusion_cases.md`

# Orchestration task
- `logics/tasks/task_055_req_058_network_summary_2d_text_layering_orchestration_and_delivery_control.md`

# References
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `logics/request/req_050_network_summary_2d_viewport_zoom_pan_persistence_per_network_resume_and_restore.md`
- `logics/request/req_056_bom_csv_export_from_network_summary_header_for_rendered_catalog_backed_components.md`

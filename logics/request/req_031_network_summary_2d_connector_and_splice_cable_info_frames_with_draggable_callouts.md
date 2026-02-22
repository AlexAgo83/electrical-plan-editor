## req_031_network_summary_2d_connector_and_splice_cable_info_frames_with_draggable_callouts - Network Summary 2D Connector/Splice Cable Info Frames with Draggable Callouts
> From version: 0.6.4
> Understanding: 97%
> Confidence: 96%
> Complexity: High
> Theme: 2D Visualization Enrichment with Draggable Callout Frames for Connector/Splice Cable Lists
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Add a new graphical element in the 2D `Network summary` rendering for each **connector** and **splice**.
- This element is a **frame/callout box** visually aligned with connector design language, but with:
  - thinner borders
  - non-rounded corners
- The callout should be placed by default **near the related connector/splice**, while trying to be positioned as far outward as possible (to reduce overlap with the network core).
- A **dashed line** must visually connect the callout frame to the associated connector/splice.
- The frame must display the list of cables (wires) that:
  - originate from and/or
  - arrive at
  the related connector/splice, including each cable length.
- The frame must be **draggable like a node**, with the same movement rules (including current grid/snap/lock behavior).
- Add a `Network summary` toolbar toggle (placed after `Length`) to show/hide these callout frames.
- Add a `Settings` preference to choose the default visibility of these callout frames; default must be **disabled**.

# Context
The `Network summary` 2D renderer already supports nodes, segments, labels, route preview, and interactive overlays. Users now need richer local cable context directly on the diagram for connectors and splices without switching back and forth to analysis/forms/tables.

The requested feature is a **diagram-level callout**:
- anchored to a connector or splice,
- connected by a leader line,
- readable in-context,
- and movable to avoid overlap in dense topologies.

This enables faster topology inspection while preserving the current interaction model (drag, lock, snap, grid, zoom/pan) and theme-aware rendering.

## Objectives
- Introduce per-connector/per-splice 2D cable info callouts as a first-class visual layer in `Network summary`.
- Make callouts readable, linked to the source entity with a dashed connector line, and draggable with current canvas movement rules.
- Use a visual design consistent with the existing connector geometry language while clearly distinguishing callouts from real entities.
- Keep the feature compatible with existing 2D interactions (selection, zoom, pan, grid, snap, lock movement, subnetwork deemphasis where relevant).
- Provide explicit runtime visibility control (toolbar toggle) and a persisted default visibility preference in `Settings`.

## Functional Scope
### A0. Visibility toggle + default preference (high priority)
- Add a new `Network summary` toolbar toggle button **immediately after `Length`** to show/hide cable info callouts.
- Add a `Settings` option controlling the default state of this visibility toggle.
- Default visibility must be **disabled** (callouts hidden by default on first load / after reset).
- When enabled, the feature shows **all** callouts (no partial filtering in this request).
- The setting should be persisted with UI preferences and included in UI preference reset/default flows.

### A. New 2D cable info callout frames for connectors and splices (high priority)
- Add a new renderable callout frame for each connector and splice in the 2D diagram.
- Visual design requirements:
  - same overall design language as connector boxes
  - thinner border than connector node shape
  - corners not rounded (square corners)
- The callout is a diagram overlay element (not a replacement for the connector/splice node itself).

### B. Default placement strategy near the source entity (high priority)
- On initial render (or when no explicit callout position is stored/available), place the callout:
  - close to the related connector/splice
  - but biased toward the outer side of the topology when possible (to reduce central clutter)
- Placement heuristics should be derived primarily from the geometry/orientation of the **connected segments** (preferred), not only from graph-center heuristics.
- The placement strategy should be deterministic enough to avoid visibly random jumps on rerender.
- If no strong “outer” direction is derivable, apply a documented fallback placement heuristic.

### C. Dashed leader line between callout and source entity (high priority)
- Render a dashed line connecting each callout frame to its related connector/splice.
- The leader line should remain attached while:
  - panning
  - zooming
  - dragging the callout
  - moving the related entity
- Styling should be theme-compatible and readable without overpowering segments.

### D. Callout content: cable list + lengths (high priority)
- Inside each callout, display the list of cables (`wires`) connected to the corresponding connector/splice.
- For each listed wire, display:
  - a stable identifier (name and/or technical ID, as implemented)
  - length (`mm`)
- The frame should support **grouped rendering** of connected cables (preferred over a flat list), using available model semantics (e.g. by cavity/port and/or in/out grouping depending on entity type/data availability).
- Line-item display format should be readable and stable; `Name (TECH-ID) — {length} mm` is an acceptable baseline format.
- Preferred grouping rule for V1:
  - group by `cavity/port` when available
  - otherwise fallback to a unified connected-wire list
- Empty-state behavior (if no connected cables) must be explicitly handled and styled.
- All connected entries should be displayed (no truncation / `+N more` pattern in this request).
- The font used for the cable list entries should be smaller than the main 2D label typography to preserve visual hierarchy.
- Typography recommendation (V1 baseline):
  - wire display name in regular UI text style
  - IDs and/or length values may use a smaller mono style (`IBM Plex Mono` family) for scanability
- Default ordering recommendation for entries:
  - sort by `name`, then `technicalId` (stable and readable)

### E. Draggable callouts with the same movement rules as nodes (high priority)
- Callouts must be draggable using the same movement interaction semantics as nodes:
  - same pointer interaction model
  - same snap-to-grid behavior (when enabled)
  - same movement lock behavior (when enabled)
  - same coordinate freedoms/limits as current node movement (including negative coordinates if currently supported)
- Dragging a callout must not accidentally drag the associated connector/splice node.
- Callout dragging should not break selection semantics for entities.
- Clicking/selecting a callout should also select/focus the associated connector/splice entity.
- Drag interaction should be available from the **entire callout frame area** (not only a dedicated drag handle) in V1.

### F. State model and persistence strategy (medium priority)
- Callout positions must be persisted in the **network model** (not only UI runtime state / preferences), so they survive reload/export/import of the model.
- Preferred storage location (V1 baseline):
  - persist callout position on the associated **connector/splice entity** (business entity), not on the technical `NetworkNode`.
- Document the model-field strategy and any normalization/migration implications.
- Runtime behavior must remain stable during a session and after persisted reloads.

### F2. Runtime visual interaction and stacking behavior (medium priority)
- When a connector/splice is selected, the linked callout should also render a selected/highlighted state.
- When a callout is clicked/selected, both the underlying connector/splice and the callout should appear selected/highlighted (consistent bidirectional visual linkage).
- Callouts should support automatic visual stacking priority (`z-index`-like behavior in SVG/render order) so the active/hovered/dragged callout is rendered on top in dense diagrams.
- Callout dimensions may auto-size and wrap according to content (no fixed-width requirement in V1), while remaining readable and draggable.

### G. Theme and readability compatibility (medium priority)
- Callout frame, dashed leader line, and callout text must follow active theme palettes/readability conventions.
- Cover all supported themes, including composed themes.
- Keep contrast sufficient over the canvas background/grid.
- If the linked connector/splice is deemphasized by subnetwork filtering, the callout frame and dashed leader line should also be deemphasized consistently (same transparency behavior target).

### G2. Export and defaults interoperability (medium priority)
- If callouts are visible, they should be included in PNG export output.
- If callouts are hidden, they should not be rendered into PNG export output.
- The callout visibility toggle should participate in `Apply canvas defaults now` semantics in the same way as other canvas display toggles (`Grid`, `Snap`, `Lock`, `Length`, etc.), using the `Settings` default value.

### H. Validation and delivery traceability (closure target)
- Add/adjust tests for:
  - rendering presence of connector/splice callouts
  - leader line rendering
  - callout content (wire list + lengths)
  - dragging behavior with lock/snap interactions (where testable)
- Document implementation decisions and AC traceability in Logics artifacts.

## Non-functional requirements
- Avoid heavy layout computation per frame; placement heuristics should be efficient and deterministic.
- Preserve current `Network summary` responsiveness and interaction fluidity.
- Keep callout rendering maintainable (clear separation between entity nodes and callout overlays).
- Ensure callouts do not significantly degrade readability in dense diagrams; overlap mitigation may be heuristic but should be explicit.

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/app.ui.navigation-canvas.spec.tsx` (2D rendering and drag interactions)
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx` (if callout workflow hooks into Network summary controls/state)
  - `src/tests/app.ui.settings.spec.tsx` (default visibility preference wiring/persistence if implemented there)
- Visual/build checks (recommended):
  - `npm run build`
  - manual verification in `Modeling` and `Analysis` on dense and sparse topologies
  - theme sweep on representative themes (light, dark, green-dominant, warm, composed)
  - PNG export verification with callouts shown/hidden
- Closure validation (recommended):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: `Network summary` includes a toolbar toggle (positioned after `Length`) to show/hide connector/splice cable callout frames, and `Settings` includes a persisted default visibility option whose default is disabled.
- AC2: Each connector and splice can render a dedicated cable info callout frame in the 2D `Network summary` when the feature is enabled.
- AC3: Callout frames use connector-like design language with thinner border and non-rounded corners, and are connected to their source entity via a dashed leader line.
- AC4: Callouts are placed by default near their associated connector/splice with an outward-placement bias derived from connected segment geometry (with deterministic fallback behavior).
- AC5: Callouts display grouped connected cable entries and lengths (`mm`) using a smaller list font, show all entries (no truncation), and handle empty-state explicitly.
- AC6: Callouts can be dragged independently using the same movement rules as nodes (including lock/snap behavior), persist their positions in the network model, and clicking a callout selects/focuses the associated connector/splice without dragging the underlying entity.
- AC7: Callout visuals (frame, dashed line, text) are theme-compatible across supported themes, remain readable over the canvas, and follow deemphasis state when the linked entity is deemphasized.
- AC8: Active/hovered/dragged callouts render above others in dense diagrams (auto stacking priority), and selected state is visually synchronized between callout and linked connector/splice.
- AC9: Callout visibility participates in PNG export output and `Apply canvas defaults now` semantics according to the persisted default visibility setting.
- AC10: Regression coverage, validation suites, and Logics lint pass, with AC traceability documented.

## Out of scope
- Full collision-avoidance engine for callout layout in dense diagrams.
- Manual resizing of callout frames.
- Rich inline editing inside callouts.
- Replacing existing analysis/detail panels; callouts are a complementary visualization aid.
- Per-wire custom styling inside callouts beyond readability needs (unless required for theme contrast).
- Partial callout filtering (per-entity/per-subset toggles) beyond the global show/hide control requested here.
- Dedicated resize handles or manual width management for callouts in V1 (auto-wrap/auto-size only).

# Backlog
- To be created

# References
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/hooks/useCanvasInteractionHandlers.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/app/hooks/useAppControllerCanvasDisplayState.ts`
- `src/app/styles/canvas/canvas-diagram-and-overlays.css`
- `src/app/styles/base/base-theme-overrides.css`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`

## item_647_contain_canvas_drag_pan_and_form_re_renders_with_raf_coalescing_and_memo_boundaries - Contain canvas drag/pan and form re-renders with rAF coalescing and memo boundaries
> From version: 1.17.2
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 60
> Complexity: High
> Theme: Runtime performance and bundle efficiency
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Owner: codex

# Problem
- All transient UI state (canvas offset/scale/manual node positions, every form field) lives in useState hooks called from AppController, the single subscriber to the full store snapshot.
- No component under src/app/components is wrapped in React.memo, so every keystroke and every raw mouse event during drag/pan reconciles the entire application tree.
- handleNetworkMouseMove dispatches setState once per mouse event with no requestAnimationFrame coalescing, so drag/pan degrades first on large networks.

# Scope
- In:
  - Coalesce pointer-move driven canvas state updates (manualNodePositions, networkOffset) to one commit per animation frame in useCanvasInteractionHandlers, flushing any pending frame on pointer-up so the committed positions are exact.
  - Introduce React.memo boundaries on the workspace containers (src/app/components/containers/*) and the heavy panels they host (NetworkSummaryPanel, modeling tables, forms columns), with stable prop objects (useMemo/useCallback) at the AppController seam so the boundaries actually hold.
  - Move canvas-transient state consumption below the memo boundary of the canvas panel so per-frame commits re-render only the canvas subtree.
  - Add a render-count regression test (React Profiler or render-spy components) proving that a form keystroke and a simulated drag frame do not re-render the other workspace containers.
- Out:
  - Selector-based store subscriptions (splitting useAppSnapshot into per-slice subscriptions) — larger refactor, only if memo boundaries prove insufficient.
  - Any behavior change to snap-to-grid, drag thresholds, selection, or undo/redo semantics.
  - Virtualization of tables or SVG element culling.

# Acceptance criteria
- AC1: A continuous drag or pan produces at most one canvas state commit per animation frame, verified by a test driving multiple synthetic mouse-move events inside one frame.
- AC2: Pointer-up flushes the last pending frame so final node positions match the last mouse position exactly (snap-to-grid behavior unchanged).
- AC3: A keystroke in a catalog or modeling form field does not re-render NetworkSummaryPanel, modeling tables, or other workspace containers, proven by a render-count regression test.
- AC4: A drag frame does not re-render workspace panels outside the canvas subtree, proven by the same regression harness.
- AC5: All existing canvas interaction, forms, and e2e suites pass without behavioral changes.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A continuous drag or pan produces at most one canvas state commit per animation frame, verified by a test driving multiple synthetic mouse-move events inside one frame.
- request-AC2 -> This backlog slice. Proof: AC2: Pointer-up flushes the last pending frame so final node positions match the last mouse position exactly (snap-to-grid behavior unchanged).
- request-AC8 -> This backlog slice. Proof: AC3: A keystroke in a catalog or modeling form field does not re-render NetworkSummaryPanel, modeling tables, or other workspace containers, proven by a render-count regression test.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_012_editor_responsiveness_and_load_time_performance`
- Architecture decision(s): (none yet)
- Request: `req_161_runtime_rendering_and_initial_bundle_performance_overhaul`
- Primary task(s): `task_156_orchestrate_runtime_rendering_and_initial_bundle_performance_overhaul`

# AI Context
- Summary: Contain canvas drag/pan and form re-renders with rAF coalescing and memo boundaries
- Keywords: scaffolded-backlog, contain canvas drag/pan and form re-renders with raf coalescing and memo boundaries, implementation-ready
- Use when: Implementing the scaffolded slice for Contain canvas drag/pan and form re-renders with rAF coalescing and memo boundaries.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

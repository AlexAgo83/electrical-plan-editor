## task_030_network_summary_2d_connector_and_splice_cable_info_frames_with_draggable_callouts_orchestration_and_delivery_control - Network Summary 2D Connector/Splice Cable Info Frames with Draggable Callouts Orchestration and Delivery Control
> From version: 0.6.4
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: Delivery Orchestration for Interactive 2D Connector/Splice Cable Callout Frames, Persistence, and Canvas Workflow Integration
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_031`. This task coordinates delivery of a new 2D `Network summary` visualization layer: connector/splice cable info callout frames with dashed leader lines, grouped cable content + lengths, default outward placement heuristics, drag interactions with node-like movement rules, persistence of callout positions in the network model, theme/deemphasis compatibility, and runtime/default visibility integration (toolbar toggle + `Settings`, plus PNG export/defaults interoperability).

Backlog scope covered:
- `item_178_network_summary_callout_visibility_toggle_and_settings_default_preference_for_connector_splice_cable_frames.md`
- `item_179_connector_splice_callout_position_persistence_in_network_model_and_schema_normalization.md`
- `item_180_connector_splice_callout_frame_rendering_dashed_leader_lines_and_theme_deemphasis_compatibility.md`
- `item_181_connector_splice_callout_default_outward_placement_heuristic_based_on_connected_segments.md`
- `item_182_connector_splice_callout_grouped_cable_lists_lengths_sorting_and_compact_typography.md`
- `item_183_connector_splice_callout_drag_interactions_selection_sync_lock_snap_and_auto_stacking_priority.md`
- `item_184_callout_visibility_png_export_and_canvas_default_apply_interoperability.md`
- `item_185_connector_splice_callout_theme_readability_and_navigation_canvas_regression_coverage.md`
- `item_186_req_031_connector_splice_callout_frames_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 callout visibility toggle in `Network summary` + `Settings` default preference wiring and runtime default-apply semantics (`item_178`)
- [ ] 2. Deliver Wave 1 network-model persistence for connector/splice callout positions with normalization/import-export compatibility (`item_179`)
- [ ] 3. Deliver Wave 2 SVG callout frame rendering + dashed leader lines + theme/deemphasis styling compatibility (`item_180`)
- [ ] 4. Deliver Wave 3 default outward placement heuristic based on connected segment geometry (deterministic fallback behavior) (`item_181`)
- [ ] 5. Deliver Wave 4 grouped cable-list content (+ lengths, ordering, empty-state, compact typography) for connector/splice callouts (`item_182`)
- [ ] 6. Deliver Wave 5 callout drag interactions with lock/snap, selection sync, and auto stacking priority (`item_183`)
- [ ] 7. Deliver Wave 6 interoperability with PNG export visibility and `Apply canvas defaults now` flow (`item_184`)
- [ ] 8. Deliver Wave 7 theme/readability verification + regression coverage for navigation-canvas and related workflows (`item_185`)
- [ ] 9. Deliver Wave 8 closure: CI/E2E/build/PWA pass and `req_031` AC traceability (`item_186`)
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
    - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
    - `src/tests/app.ui.settings.spec.tsx`
    - `src/tests/portability.network-file.spec.ts` (if model persistence/export-import schema changes)
  - `npm run test:ci`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 pending: callout visibility toolbar toggle + `Settings` default preference + runtime apply-default semantics.
  - Wave 1 pending: connector/splice model persistence fields for callout positions + normalization/import-export compatibility.
  - Wave 2 pending: callout frame and dashed leader line SVG rendering + theme/deemphasis visual compatibility.
  - Wave 3 pending: connected-segment-based outward placement heuristic with deterministic fallback.
  - Wave 4 pending: grouped callout content (`cavity/port` preferred, fallback unified list), lengths, ordering, compact typography, and empty-state handling.
  - Wave 5 pending: drag interactions (whole frame), lock/snap support, selection synchronization, and auto stacking priority.
  - Wave 6 pending: PNG export visibility interoperability + `Apply canvas defaults now` integration.
  - Wave 7 pending: regression tests and theme readability verification.
  - Wave 8 pending: closure validation suite and AC traceability.
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Model persistence field addition for callout positions complicates import/export compatibility or stale-schema handling.
  - Callout drag interactions conflict with existing node dragging/selection semantics.
  - Default placement heuristics based on connected segment geometry produce unstable or cluttered results in dense topologies.
  - Rendering many callouts degrades readability/performance without adequate stacking and deemphasis behavior.
  - Theme/deemphasis styling of frames/leader lines drifts across composed themes.
  - PNG export output diverges from visible callout state.
- Mitigation strategy:
  - Land visibility/persistence and rendering foundation in separate waves before drag interactions.
  - Reuse existing node drag rule paths (lock/snap/coordinate handling) instead of parallel bespoke logic.
  - Add deterministic placement tests/proxies and manual visual checks on sparse/dense graphs.
  - Validate export behavior with callouts shown/hidden as part of targeted workflow checks.
  - Add regression assertions for selection sync and deemphasis propagation to callouts/leader lines.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` OK (`req_031` + backlog planning artifacts)
- Delivery snapshot:
  - Not started.
- AC traceability (`req_031`) target mapping:
  - AC1 targeted by Waves 0, 6, 8 (`item_178`, `item_184`, `item_186`)
  - AC2 targeted by Waves 2, 8 (`item_180`, `item_186`)
  - AC3 targeted by Waves 2, 8 (`item_180`, `item_186`)
  - AC4 targeted by Waves 3, 8 (`item_181`, `item_186`)
  - AC5 targeted by Waves 4, 8 (`item_182`, `item_186`)
  - AC6 targeted by Waves 1, 5, 8 (`item_179`, `item_183`, `item_186`)
  - AC7 targeted by Waves 2, 7, 8 (`item_180`, `item_185`, `item_186`)
  - AC8 targeted by Waves 5, 7, 8 (`item_183`, `item_185`, `item_186`)
  - AC9 targeted by Waves 0, 6, 8 (`item_178`, `item_184`, `item_186`)
  - AC10 targeted by Waves 7, 8 + FINAL docs update (`item_185`, `item_186`)

# References
- `logics/request/req_031_network_summary_2d_connector_and_splice_cable_info_frames_with_draggable_callouts.md`
- `logics/backlog/item_178_network_summary_callout_visibility_toggle_and_settings_default_preference_for_connector_splice_cable_frames.md`
- `logics/backlog/item_179_connector_splice_callout_position_persistence_in_network_model_and_schema_normalization.md`
- `logics/backlog/item_180_connector_splice_callout_frame_rendering_dashed_leader_lines_and_theme_deemphasis_compatibility.md`
- `logics/backlog/item_181_connector_splice_callout_default_outward_placement_heuristic_based_on_connected_segments.md`
- `logics/backlog/item_182_connector_splice_callout_grouped_cable_lists_lengths_sorting_and_compact_typography.md`
- `logics/backlog/item_183_connector_splice_callout_drag_interactions_selection_sync_lock_snap_and_auto_stacking_priority.md`
- `logics/backlog/item_184_callout_visibility_png_export_and_canvas_default_apply_interoperability.md`
- `logics/backlog/item_185_connector_splice_callout_theme_readability_and_navigation_canvas_regression_coverage.md`
- `logics/backlog/item_186_req_031_connector_splice_callout_frames_closure_ci_e2e_build_pwa_and_ac_traceability.md`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/hooks/useCanvasInteractionHandlers.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/app/hooks/useUiPreferences.ts`
- `src/store/types.ts`
- `src/store/index.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `src/tests/portability.network-file.spec.ts`
- `package.json`

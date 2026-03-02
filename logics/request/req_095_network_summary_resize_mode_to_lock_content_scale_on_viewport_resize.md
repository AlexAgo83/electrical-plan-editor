## req_095_network_summary_resize_mode_to_lock_content_scale_on_viewport_resize - Network summary resize mode to lock content scale on viewport resize
> From version: 1.1.0
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Add a rendering mode where enlarging/reducing the window changes visible area only, not apparent content size.
- Keep current responsive behavior available for users who prefer existing scaling.
- Expose the option in Settings directly under `Reset zoom target (%)`.

# Context
- Current `Network summary` uses a fixed logical `viewBox` (`NETWORK_VIEW_WIDTH`/`NETWORK_VIEW_HEIGHT`) while the SVG is rendered with responsive width (`.network-svg { width: 100%; }`).
- As the container/window grows, content appears larger on screen even when user zoom/offset state did not change.
- User expectation for the new mode is camera-like behavior:
  - same zoom/content scale,
  - larger window shows more area,
  - smaller window shows less area.
- The setting placement requirement is explicit: add this option under `Reset zoom target (%)` in `Canvas render preferences`.

# Objective
- Introduce a viewport resize behavior mode for `Network summary` that can lock visual content scale during container/window resize.
- Preserve current behavior as default to avoid surprise regressions.
- Keep the mode persistent in UI preferences and immediately applied.

# Scope
- In:
  - add a new canvas render preference under `Reset zoom target (%)` in Settings;
  - implement two resize behaviors:
    - current responsive content scaling (default),
    - locked content scale on viewport resize;
  - persist/restore the preference through existing UI preferences storage;
  - ensure zoom/pan interactions, reset zoom, and fit-to-content remain functional in both modes;
  - add regression coverage for resize behavior and preference persistence.
- Out:
  - redesign of zoom controls or toolbar layout;
  - changing keyboard shortcut mappings;
  - export format redesign (SVG/PNG contracts stay unchanged).

# Locked execution decisions
- Decision 1: Add a user-facing toggle/select in `Canvas render preferences` immediately below `Reset zoom target (%)`.
- Decision 2: Default value preserves current behavior (responsive scaling of rendered content on container resize).
- Decision 3: New mode (`lock content scale on resize`) keeps current zoom transform (scale/offset semantics) and changes visible extent instead of apparent content size.
- Decision 4: Preference is persisted and restored with existing UI preference hydration.
- Decision 5: `Reset` action still uses `Reset zoom target (%)` semantics in both modes.
- Decision 6: `Fit to content` remains available and functional in both modes.
- Decision 7: User-facing label for the locked mode is `Resize changes visible area only`.
- Decision 8: Feature scope is limited to `Network summary` canvas; other panels/surfaces are unaffected.

# Functional behavior contract
- Settings UX:
  - a new control appears under `Reset zoom target (%)` in `Canvas render preferences`.
  - control wording clearly distinguishes:
    - responsive content scaling on resize,
    - `Resize changes visible area only`.
- Runtime behavior:
  - responsive mode (default): current behavior unchanged.
  - locked mode:
    - resizing viewport does not make graph content visually larger/smaller,
    - viewport resize changes how much of the graph is visible.
- Surface scope:
  - behavior applies only to `Network summary` canvas.
  - no behavior change is introduced for other UI panels or non-canvas surfaces.
- Interaction integrity:
  - node drag, pan, wheel zoom, selection, and focus continue to work.
  - pointer mapping between screen and model coordinates remains coherent after resize.
- Persistence:
  - selected mode is restored after reload/relaunch.

# Acceptance criteria
- AC1: A new canvas resize behavior option is present in Settings under `Reset zoom target (%)`.
- AC2: Default value keeps existing responsive behavior.
- AC2a: Locked mode option is labeled `Resize changes visible area only`.
- AC3: In locked mode, resizing window/container does not change apparent node/segment/wire size on screen.
- AC4: In locked mode, viewport resize changes visible graph extent (more area when larger, less when smaller).
- AC5: `Reset current view` and configured reset zoom target still work in both modes.
- AC6: `Fit network view to current graph` still works in both modes.
- AC7: Preference persists/restores correctly.
- AC8: Interaction behavior remains non-regressed after resize in both modes.
- AC9: Behavior change is scoped to `Network summary` canvas only (no cross-surface regression).
- AC10: `logics_lint`, `lint`, `typecheck`, and relevant tests pass.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted checks around:
  - settings control placement and persistence,
  - resize behavior matrix (mode A/B, window larger/smaller),
  - zoom/pan/select drag consistency after resize.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Coordinate mapping regressions can appear if view-space/model-space conversion is not fully aligned with new resize mode.
- Mixed behavior between mode implementations may create user confusion if labels are unclear.
- Snapshot/UI tests that assume current responsive scaling may require updates.

# Backlog
- To create from this request:
  - `item_474_canvas_render_setting_resize_mode_control_placement_under_reset_zoom_target.md`
  - `item_475_network_summary_viewport_resize_behavior_lock_content_scale_mode_implementation.md`
  - `item_476_ui_preferences_persistence_and_restore_for_canvas_resize_mode.md`
  - `item_477_req_095_resize_mode_validation_matrix_and_closure_traceability.md`

# References
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/styles/canvas/canvas-toolbar-and-shell.css`
- `src/app/hooks/useAppControllerCanvasDisplayState.ts`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/AppController.tsx`
- `src/tests/app.ui.settings-canvas-render.spec.tsx`
- `logics/request/req_050_network_summary_2d_viewport_zoom_pan_persistence_per_network_resume_and_restore.md`

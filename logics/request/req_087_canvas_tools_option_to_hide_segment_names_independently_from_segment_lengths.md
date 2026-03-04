## req_087_canvas_tools_option_to_hide_segment_names_independently_from_segment_lengths - Canvas tools option to hide segment names independently from segment lengths
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 98%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Add an option in `Canvas tools preferences` to control segment-name visibility in the 2D plan.
- Place this option directly above `Show segment lengths by default`.
- Segment-name visibility must be independent from segment-length visibility.

# Context
- In `Network summary`, segment name/ID labels are currently always rendered.
- Segment lengths are already controlled by a dedicated toggle/preference (`showSegmentLengths` / `Show segment lengths by default`).
- For some operators, segment names create visual noise while segment lengths remain important for analysis and validation.

# Objective
- Allow users to hide segment names on the 2D plan without losing access to segment lengths.
- Keep a clear and explicit separation between segment-name and segment-length display controls.
- Keep behavior predictable with existing settings and persistence patterns.

# Scope
- In:
  - add a new checkbox option in `Canvas tools preferences`:
    - label: `Show segment names by default` (or equivalent explicit wording);
    - placement: immediately above `Show segment lengths by default`;
  - introduce a dedicated visibility state/preference for segment names (separate from segment lengths);
  - wire 2D segment label rendering so segment names follow the new segment-name visibility control;
  - keep segment-length rendering controlled only by segment-length visibility state;
  - persist/restore the new preference through existing UI preferences flow;
  - keep `Apply canvas defaults now` behavior aligned with existing canvas default controls.
- Out:
  - changing segment IDs/naming model;
  - changing segment length semantics or units;
  - changing node label/callout visibility rules;
  - redesigning toolbar layout beyond adding this control.

# Locked execution decisions
- Decision 1: New segment-name control is an explicit, standalone toggle and does not reuse `showSegmentLengths`.
- Decision 2: Default value for segment-name visibility remains `enabled` to preserve current behavior for existing users.
- Decision 3: Segment lengths remain fully controlled by the existing length toggle/preference.
- Decision 4: The new settings control is placed directly above `Show segment lengths by default` in `Canvas tools preferences`.
- Decision 5: If segment names are disabled and lengths are enabled, only lengths are rendered for segments.

# Functional behavior contract
- Settings:
  - A new checkbox exists above `Show segment lengths by default` for segment-name visibility defaults.
  - Segment-name and segment-length controls are separate and can be configured independently.
- 2D runtime rendering:
  - `showSegmentNames = true`, `showSegmentLengths = false`: show names only.
  - `showSegmentNames = false`, `showSegmentLengths = true`: show lengths only.
  - `showSegmentNames = true`, `showSegmentLengths = true`: show names and lengths.
  - `showSegmentNames = false`, `showSegmentLengths = false`: show neither names nor lengths.
- Persistence:
  - Segment-name preference persists and restores independently of segment-length preference.

# Acceptance criteria
- AC1: `Canvas tools preferences` includes a new segment-name visibility option above `Show segment lengths by default`.
- AC2: The new segment-name preference default is `enabled` when no prior stored value exists.
- AC3: Disabling segment names hides segment name/ID labels in the 2D `Network summary`.
- AC4: Disabling segment names does not disable or alter segment-length visibility behavior.
- AC5: Enabling segment lengths while segment names are disabled renders lengths without rendering names.
- AC6: The new segment-name preference is persisted and restored across reload/relaunch.
- AC7: `Apply canvas defaults now` applies the segment-name default consistently with other canvas defaults.
- AC8: `lint`, `typecheck`, and relevant UI tests pass after the change.

# Validation and regression safety
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted checks around:
  - settings control placement and state wiring for segment names
  - segment label rendering behavior matrix (names/lengths combinations)
  - preference persistence and restore behavior
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Existing rendering/tests may implicitly assume segment names are always present.
- Incomplete state wiring can create drift between default preferences and runtime display behavior.
- Selector/snapshot-based tests may require updates if segment-label DOM presence becomes conditional.

# Backlog
- To create from this request:
  - `item_441_canvas_tools_segment_name_visibility_preference_and_settings_placement.md`
  - `item_442_network_summary_segment_name_render_gating_independent_from_length_labels.md`
  - `item_443_segment_name_visibility_persistence_apply_defaults_and_regression_coverage.md`
  - `item_444_req_087_validation_matrix_and_closure_traceability.md`

# References
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/hooks/useAppControllerCanvasDisplayState.ts`
- `src/app/hooks/useAppControllerPreferencesState.ts`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/app/AppController.tsx`
- `src/tests/app.ui.settings-canvas-render.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `logics/request/req_029_network_summary_2d_zoom_invariant_labels_with_size_and_rotation_preferences.md`
- `logics/request/req_050_network_summary_2d_viewport_zoom_pan_persistence_per_network_resume_and_restore.md`

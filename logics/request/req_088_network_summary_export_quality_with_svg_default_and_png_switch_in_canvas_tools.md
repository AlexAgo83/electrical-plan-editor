## req_088_network_summary_export_quality_with_svg_default_and_png_switch_in_canvas_tools - Network summary export quality with SVG default and PNG switch in Canvas tools
> From version: 0.9.18
> Status: Draft
> Understanding: 100%
> Confidence: 97%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Improve plan export quality for strong zoom usage.
- Add an export format switch (`SVG` / `PNG`) in `Settings` -> `Canvas tools preferences`.
- Use `SVG` as the default export format.

# Context
- Current export entrypoint in `Network summary` is PNG-oriented (raster output), which can look degraded when users zoom heavily after export.
- Users can still identify text at normal scale, but quality becomes poor under high zoom.
- The product need is explicit: users must access a much higher zoom level on exported plans without text/line degradation.

# Objective
- Provide a vector-first export path to preserve readability and geometry quality at high zoom.
- Keep PNG export available as an alternate format.
- Expose the format choice in Canvas tools settings with persistent default behavior.

# Scope
- In:
  - add a new `Canvas tools preferences` setting to choose export format (`SVG` or `PNG`);
  - default value is `SVG`;
  - wire network-plan export action to use the selected format;
  - keep PNG export available and functional when selected;
  - persist/restore selected export format via existing UI preferences flow;
  - preserve existing PNG background inclusion option behavior for PNG exports.
- Out:
  - introducing additional export formats beyond `SVG` and `PNG`;
  - full redesign of network summary toolbar composition;
  - PDF authoring pipeline;
  - per-export advanced print layout features (margins, page tiling, etc.).

# Locked execution decisions
- Decision 1: Export format selector lives in `Settings` -> `Canvas tools preferences`.
- Decision 2: Default export format is `SVG` for new users and for missing legacy preference values.
- Decision 3: Export action in `Network summary` follows the selected format at runtime.
- Decision 4: PNG mode remains supported and keeps the current background-include preference semantics.
- Decision 5: SVG mode is the primary quality path for high-zoom post-export inspection.
- Decision 6: `Network summary` keeps a single export control/button that follows the selected format (no dual SVG+PNG action buttons).

# Functional behavior contract
- Settings:
  - a new export format control exists with exactly two values: `SVG`, `PNG`;
  - default selected value is `SVG`;
  - preference persists and restores on reload/relaunch.
- Export behavior:
  - `Network summary` keeps one export action entrypoint bound to the selected format;
  - when format is `SVG`, export generates an `.svg` file preserving vector text/lines;
  - when format is `PNG`, export generates a `.png` file using current PNG flow;
  - switching format updates subsequent exports immediately (no reload required).
- Compatibility:
  - existing `Include background in PNG export` applies only to PNG output and does not block SVG export.

# Acceptance criteria
- AC1: `Canvas tools preferences` includes an export format selector with `SVG` and `PNG`.
- AC2: Default export format is `SVG` when no prior preference exists.
- AC3: Export action produces an SVG file when `SVG` is selected.
- AC4: Export action produces a PNG file when `PNG` is selected.
- AC5: SVG export output remains visually sharp at high zoom (vector quality; no raster blur from export pipeline).
- AC6: Export format preference persists and restores across reload/relaunch.
- AC7: Existing PNG background inclusion behavior remains functional for PNG mode.
- AC8: `lint`, `typecheck`, and relevant UI tests pass after the change.

# Validation and regression safety
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted checks around:
  - settings export-format control wiring and persistence
  - network-summary export action format switching (`svg` vs `png`)
  - regression on PNG background include option
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Existing tests and UI copy may assume PNG-only export and require controlled updates.
- SVG export can expose style inlining/font compatibility edge cases across browsers/viewers.
- Poorly isolated export-format wiring can accidentally couple with unrelated canvas settings.

# Backlog
- To create from this request:
  - `item_445_canvas_tools_export_format_preference_svg_png_with_svg_default.md`
  - `item_446_network_summary_export_action_format_switch_and_svg_download_path.md`
  - `item_447_export_preferences_persistence_and_png_background_option_compatibility.md`
  - `item_448_req_088_export_quality_validation_matrix_and_closure_traceability.md`

# References
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useAppControllerPreferencesState.ts`
- `src/app/hooks/controller/useAppControllerAuxScreenContentDomains.tsx`
- `src/app/AppController.tsx`
- `src/tests/app.ui.settings-canvas-render.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `logics/request/req_030_network_summary_png_export_background_wires_length_sort_quick_entity_navigation_table_theming_and_2d_grid_negative_coordinates.md`

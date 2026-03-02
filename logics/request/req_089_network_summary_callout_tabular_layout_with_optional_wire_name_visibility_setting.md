## req_089_network_summary_callout_tabular_layout_with_optional_wire_name_visibility_setting - Network summary callout tabular layout with optional wire-name visibility setting
> From version: 0.9.18
> Status: Draft
> Understanding: 100%
> Confidence: 97%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- In connector/splice callouts, present wire information as a table (not a free-form line format) so each value is clearly identified.
- Keep wire length visible (length is required and useful).
- Make wire name display optional via a dedicated setting.

# Context
- Current callout entries are rendered as concatenated text rows, which makes it harder to identify which value corresponds to which field when scanning dense callouts.
- In some datasets, wire names can be very long and make callouts visually large/noisy.
- Users still need fast access to length values, even when wire names are hidden.

# Objective
- Improve callout readability with an explicit column model.
- Reduce callout visual overload on long-name datasets.
- Keep wire length available regardless of wire-name visibility preference.

# Scope
- In:
  - replace current callout row text composition with a tabular callout content layout;
  - define explicit callout columns with stable headers;
  - add a `Settings` toggle in `Canvas tools preferences` to show/hide wire names in callouts;
  - keep length column always visible and independent from wire-name visibility;
  - persist/restore the new wire-name visibility preference via existing UI preferences flow.
- Out:
  - redesign of callout drag/position model;
  - changes to wire domain model/schema;
  - replacing connector/splice callout feature itself;
  - advanced per-column user customization beyond the requested name visibility toggle.

# Locked execution decisions
- Decision 1: Callout content is rendered as a structured table-like layout with explicit columns.
- Decision 2: Wire length remains visible in all modes (no dependency on wire-name setting).
- Decision 3: `Wire name` visibility is controlled by a dedicated `Canvas tools preferences` setting.
- Decision 4: Default for `Wire name` in callouts is `disabled` to keep callouts compact on dense/long-name datasets.
- Decision 5: Technical wire identity remains available when names are hidden (for example via technical ID column).
- Decision 6: Baseline callout columns are fixed as `Technical ID`, `Length (mm)`, `Section (mm²)`, with optional `Wire name` column.

# Functional behavior contract
- Settings:
  - add a new option in `Canvas tools preferences`:
    - `Show wire names in callouts` (wording may vary but meaning must be explicit);
  - option is persisted and restored;
  - default is off.
- Callout rendering:
  - callout content displays rows under explicit column labels (table semantics);
  - baseline columns are:
    - `Technical ID`,
    - `Length (mm)`,
    - `Section (mm²)`;
  - optional `Wire name` column appears only when the setting is enabled.
- Independence rule:
  - hiding wire names must not hide or modify length values;
  - length rendering remains stable whether wire names are on or off.

# Acceptance criteria
- AC1: Connector/splice callouts render wire info using a table-like layout with explicit columns.
- AC2: A new `Canvas tools preferences` option controls wire-name visibility in callouts.
- AC3: Wire-name visibility option default is disabled when no prior preference exists.
- AC4: When wire-name visibility is disabled, wire names are hidden and length values remain visible.
- AC5: When wire-name visibility is enabled, wire names are shown in the callout table alongside other columns.
- AC6: Wire-name preference persists and restores across reload/relaunch.
- AC7: Existing callout interactions (show/hide toggle, selection linkage, drag behavior) remain non-regressed.
- AC8: `lint`, `typecheck`, and relevant UI tests pass after the change.

# Validation and regression safety
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted checks around:
  - settings toggle wiring and persistence for callout wire-name visibility
  - callout rendering matrix with wire names on/off
  - confirmation that length values remain visible in both modes
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Callout layout change can affect spacing and overlap behavior in dense topologies.
- Existing tests may assume legacy free-form row text and require updates.
- Poor column-width handling could reduce readability on narrow viewports if not bounded.

# Backlog
- To create from this request:
  - `item_449_callout_tabular_content_structure_for_connector_splice_wire_entries.md`
  - `item_450_canvas_tools_preference_toggle_for_callout_wire_name_visibility.md`
  - `item_451_callout_length_visibility_independence_and_render_regression_coverage.md`
  - `item_452_req_089_callout_tabular_readability_validation_matrix_and_closure_traceability.md`

# References
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useAppControllerPreferencesState.ts`
- `src/app/AppController.tsx`
- `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `src/tests/app.ui.settings-canvas-render.spec.tsx`
- `logics/request/req_031_network_summary_2d_connector_and_splice_cable_info_frames_with_draggable_callouts.md`
- `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
- `logics/request/req_081_canvas_tools_preference_selected_callout_only_visibility_override.md`

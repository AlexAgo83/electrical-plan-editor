## req_082_import_export_networks_panel_two_column_compaction_and_right_side_selected_export_list - Import/Export networks panel two-column compaction with right-side selected export list
> From version: 0.9.18
> Status: Draft
> Understanding: 99%
> Confidence: 97%
> Complexity: Low
> Theme: UI
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Reduce vertical sprawl in the `Import / Export networks` settings panel.
- Make this panel use a two-column layout.
- Move `Selected networks for export` to the right side.
- Place `Import from file` below `Export all` in the left-side action flow.

# Context
- The current panel stacks export actions, selected-network list, and import action mostly vertically.
- On medium/large screens this creates unnecessary vertical spread and slows scanability.
- Users need denser grouping where export actions and import action stay together, while selection list is visible on the right.

# Objective
- Deliver a more compact and readable `Import / Export networks` panel with stable behavior parity.
- Preserve existing import/export logic and only change layout/composition order.

# Scope
- In:
  - convert the panel body to a two-column composition on desktop/tablet breakpoints;
  - move the `Selected networks for export` fieldset to the right column;
  - keep export actions in the left column and place `Import from file` directly below `Export all`;
  - keep status and import summary readable with the new composition (no overlap/truncation).
- Out:
  - changes to import/export business logic or file format;
  - changes to export scope semantics (`active`, `selected`, `all`);
  - redesign of unrelated settings panels.

# Locked execution decisions
- Decision 1: Primary layout is two-column for `Import / Export networks`.
- Decision 2: `Selected networks for export` lives in the right column.
- Decision 3: `Import from file` is grouped under export actions in the left column to reduce vertical spread.
- Decision 4: Keep two columns whenever space allows; collapse to one column only when two readable columns are no longer possible.

# Functional behavior contract
- Desktop/tablet:
  - panel content is split into two columns;
  - left column: intro/meta + export actions + `Import from file`;
  - right column: `Selected networks for export` fieldset.
- Mobile/narrow width:
  - columns collapse back to a single-column stack only when available width cannot sustain two readable columns.
- Functional behavior remains unchanged:
  - export buttons trigger existing handlers;
  - selection checkboxes still drive `Export selected`;
  - import picker and import result messages keep current behavior.

# Acceptance criteria
- AC1: `Import / Export networks` renders in two columns on desktop/tablet breakpoints.
- AC2: `Selected networks for export` is displayed in the right column.
- AC3: `Import from file` is positioned below the export actions (`Export active`, `Export selected`, `Export all`) in the left column.
- AC4: No regression in import/export actions, selected network export behavior, and import summary/status rendering.
- AC5: On mobile/narrow widths, layout collapses to a readable single-column flow without clipping/overflow.
- AC6: `lint`, `typecheck`, and relevant UI tests pass after the layout change.

# Validation and regression safety
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted:
  - `src/tests/app.ui.import-export.spec.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Responsive behavior can regress on mid-width breakpoints if column collapse thresholds are not tuned.
- Theme-specific overrides may need minor alignment updates for spacing consistency.
- Existing tests coupled to previous DOM ordering may require assertion updates.

# Backlog
- To create from this request:
  - `item_421_import_export_panel_two_column_layout_scaffold.md`
  - `item_422_import_export_panel_action_flow_reorder_with_import_under_export_all.md`
  - `item_423_import_export_panel_regression_coverage_and_responsive_guardrails.md`
  - `item_424_req_082_validation_matrix_and_closure_traceability.md`

# References
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/styles/validation-settings/validation-and-settings-layout.css`
- `src/tests/app.ui.import-export.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `logics/request/req_070_home_workspace_panel_reorder_and_right_column_scrollable_changelog_feed.md`

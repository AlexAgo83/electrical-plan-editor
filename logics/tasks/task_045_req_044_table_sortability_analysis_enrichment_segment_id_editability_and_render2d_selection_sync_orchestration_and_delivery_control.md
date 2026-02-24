## task_045_req_044_table_sortability_analysis_enrichment_segment_id_editability_and_render2d_selection_sync_orchestration_and_delivery_control - req_044 Orchestration: Table Sortability, Analysis Enrichment, Segment ID Editability, and Render2D Selection Sync Delivery Control
> From version: 0.8.1
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Very High
> Theme: Delivery Orchestration for Tabular UX Completion, Analysis Expansion, and Cross-Cutting Hardening in req_044
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_044`, which consolidates a large set of table/analysis improvements and cross-cutting UX/hardening updates:
- sortability completion across all in-scope workspace tables/columns
- connector/splice table `manufacturerReference` column surfacing
- dedicated `Nodes` and `Segments` analysis surfaces
- wire table column order alignment (`Section` before `Length`)
- wire analysis enrichment (minimum: section + colors + endpoint refs)
- `segmentId` editability via safe rename strategy
- connector/splice analysis wire color swatches (reuse wire-table design)
- sub-network `(default)` display cleanup in tables/render2d controls
- table header theming (including sort chevrons)
- render2d selection sync without forced table auto-scroll
- review follow-up hardening (reducers, `TableFilterBar` a11y, theme regression tests)
- callout wire `length + section` display enrichment

This task defines sequencing, checkpoint discipline, validation expectations, and closure traceability for the full `req_044` bundle.

# Objective
- Deliver `req_044` in controlled waves with minimal regression risk.
- Preserve existing table selection/edit/focus behavior while expanding sorting and analysis functionality.
- Handle the cross-cutting hardening items early to reduce cumulative risk during later UI rollout.
- Finish with full validation gates and synchronized `logics` documentation updates.

# Scope
- In:
  - Wave-based orchestration for all `req_044` backlog items (`item_269`..`item_281`)
  - Validation and commit gates between waves
  - Cross-feature sequencing/collision tracking (tables, analysis surfaces, theming, focus/scroll, reducers, tests)
  - Final AC traceability and `logics` status synchronization
- Out:
  - Features beyond `req_044` scope
  - Git history rewrite/squashing strategy (unless explicitly requested)
  - Post-req_044 follow-up planning (future request)

# Backlog scope covered
- `logics/backlog/item_269_shared_table_sortability_completion_audit_and_column_comparator_rollout.md`
- `logics/backlog/item_270_connectors_splices_tables_manufacturer_reference_column_and_sortability.md`
- `logics/backlog/item_271_nodes_analysis_panel_with_associated_segments_and_length_listing.md`
- `logics/backlog/item_272_segments_analysis_panel_with_traversing_wires_listing.md`
- `logics/backlog/item_273_wires_table_column_order_section_before_length_and_analysis_info_enrichment.md`
- `logics/backlog/item_274_segment_id_editability_via_atomic_segment_rename_and_reference_remap.md`
- `logics/backlog/item_275_connectors_splices_analysis_wire_color_swatches_reusing_wire_table_design.md`
- `logics/backlog/item_276_callout_wire_length_and_section_display_enrichment.md`
- `logics/backlog/item_277_sub_network_default_display_cleanup_in_tables_and_render2d_controls.md`
- `logics/backlog/item_278_table_header_theming_completion_including_sort_chevrons_across_all_themes.md`
- `logics/backlog/item_279_render2d_selection_sync_without_forced_table_autoscroll.md`
- `logics/backlog/item_280_review_followup_reducer_invariants_table_filterbar_a11y_and_theme_regression_tests.md`
- `logics/backlog/item_281_req_044_table_sortability_and_analysis_enrichment_closure_ci_build_and_ac_traceability.md`

# Attention points (mandatory delivery discipline)
- **Wave-based delivery is mandatory:** do not implement the entire `req_044` bundle in one batch.
- **Checkpoint commit after each wave:** commit after a wave passes its targeted validation gate.
- **Validation gate after every wave:** run and record the relevant checks before moving forward.
- **Final gate must include all validation types:** logics lint, static checks, tests, build, PWA quality, and E2E.
- **`logics` documentation sync is mandatory at the end:** update request/task/backlog statuses and closure notes to reflect delivered/deferred outcomes.

# Recommended execution strategy (wave order)
Rationale:
- Start with hardening and shared sortability groundwork before broad UI rollout.
- Land high-risk state integrity work (`segmentId` rename, reducer invariants) before panel/UI expansion.
- Add/expand analysis panels after shared sorting/comparator behavior is stable.
- Finish with theming and display polish once the major UI surfaces are in place.

# Plan
- [ ] Wave 0. Review follow-up hardening early pass (`item_280`): reducer invariants, `TableFilterBar` a11y labeling, theme regression-test baseline
- [ ] Wave 1. Shared sortability completion audit + comparator rollout (`item_269`)
- [ ] Wave 2. `segmentId` editability via atomic rename and reference remap (`item_274`)
- [ ] Wave 3. Connector/splice table `manufacturerReference` column + sortability (`item_270`)
- [ ] Wave 4. `Wires` table column order + wire analysis enrichment baseline (`item_273`)
- [ ] Wave 5. Dedicated `Nodes` and `Segments` analysis panels (`item_271`, `item_272`)
- [ ] Wave 6. Connector/splice analysis wire color swatches + callout length/section enrichment (`item_275`, `item_276`)
- [ ] Wave 7. Sub-network `(default)` display cleanup + render2d selection sync without forced auto-scroll (`item_277`, `item_279`)
- [ ] Wave 8. Table header theming completion including sort chevrons across all themes (`item_278`)
- [ ] Wave 9. Closure: final validation, AC traceability, and `logics` synchronization (`item_281`)
- [ ] FINAL. Update related `.md` files to final state (request/task/backlog progress + delivery summary + defer notes)

# Validation gates
## A. Minimum wave gate (apply after Waves 0-8)
- Documentation / Logics (when `.md` changed):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static checks:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:ui-modularization`
  - `npm run -s quality:store-modularization`
- Tests/build:
  - Targeted tests for touched features/panels (recommended first)
  - `npm run -s test:ci` (recommended at least on larger waves; can be deferred to closure if targeted coverage is sufficient and documented)
  - `npm run -s build`

## B. Final closure gate (mandatory at Wave 9)
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s test:ci`
- `npm run -s build`
- `npm run -s quality:pwa`
- `npm run -s test:e2e`

## C. Commit gate (apply after each Wave 0-9 and FINAL docs sync if separate)
- Commit only after the wave validation gate passes (green checkpoint preferred).
- Commit message should reference the delivered `req_044` wave/scope.
- Update this task report after each wave with:
  - wave status
  - validation snapshot
  - commit SHA
  - blockers/deviations/defers

# Cross-feature dependency / collision watchlist
- **Sortability + table theming + new columns** all touch table headers/cells:
  - Risk: comparator bugs, header icon/theme regressions, width/layout regressions
- **Analysis expansion** (`Nodes` + `Segments`) may require new shared view-model logic:
  - Risk: duplication and inconsistent sorting/filtering behavior versus existing analysis panels
- **`segmentId` rename** impacts referential integrity:
  - Risk: route data, selection state, local UI state, and analysis references not remapped consistently
- **Render2D selection sync change** overlaps existing row-focus ergonomics:
  - Risk: breaking table-origin focus behavior while removing canvas-origin auto-scroll
- **Theme coverage** for headers, analysis panels, callouts, badges:
  - Risk: standalone themes regress if coverage is patched locally instead of centrally

# Mitigation strategy
- Land reducer/a11y/theme-test hardening first (Wave 0) to catch regressions earlier.
- Centralize comparator logic and empty-value sort rules in shared helpers before panel rollouts.
- Reuse existing `nodeId` rename pattern for `segmentId` (atomic rename + remap).
- Stage UI changes by surface family (tables -> analysis panels -> callouts/render2d -> theme polish).
- Keep targeted tests close to each wave and reserve the full gate for closure.
- Document explicit defers if any panel/column cannot be made sortable safely in the current architecture.

# Report
- Wave status:
  - Wave 0 (review hardening): pending
  - Wave 1 (shared sortability audit/comparators): pending
  - Wave 2 (`segmentId` editability): pending
  - Wave 3 (connector/splice `Mfr Ref` columns): pending
  - Wave 4 (wires table order + wire analysis enrichment): pending
  - Wave 5 (nodes/segments analysis panels): pending
  - Wave 6 (analysis swatches + callout section): pending
  - Wave 7 (sub-network default cleanup + render2d no-autoscroll): pending
  - Wave 8 (table header theming/chevrons): pending
  - Wave 9 (closure + AC traceability): pending
  - FINAL (`.md` synchronization verification): pending
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - “All columns sortable” can become a hidden long-tail if there is no upfront audit and explicit defer list.
  - New analysis panels can diverge in interaction patterns from existing analysis panels if built ad hoc.
  - Render2D-origin focus/scroll logic may share helpers with table-origin focus and require origin-aware behavior.
  - Theme header/chevron fixes can become fragmented across theme files if not centralized.
  - `segmentId` rename can break route/callout/analysis references if remap coverage is incomplete.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` — recommended before/after task/item doc edits.
- Delivery snapshot:
  - Pending implementation.
- AC traceability (`req_044`) target mapping:
  - AC1 -> `item_269`, plus affected feature items and `item_281`
  - AC2 -> `item_270`, `item_281`
  - AC3 -> `item_271`, `item_281`
  - AC4 -> `item_272`, `item_281`
  - AC5 -> `item_273`, `item_281`
  - AC6 -> `item_274`, `item_281`
  - AC7 -> `item_273`, `item_281`
  - AC8 -> `item_275`, `item_281`
  - AC9 -> `item_277`, `item_281`
  - AC10 -> `item_278`, `item_281`
  - AC11 -> `item_279`, `item_281`
  - AC12 -> `item_280`, `item_281`
  - AC13 -> `item_280`, `item_281`
  - AC14 -> `item_280`, `item_281`
  - AC15 -> `item_276`, `item_281`
  - AC16 -> `item_269`, `item_281`
  - AC17 -> `item_269`..`item_280`, `item_281`

# References
- `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
- `logics/backlog/item_269_shared_table_sortability_completion_audit_and_column_comparator_rollout.md`
- `logics/backlog/item_270_connectors_splices_tables_manufacturer_reference_column_and_sortability.md`
- `logics/backlog/item_271_nodes_analysis_panel_with_associated_segments_and_length_listing.md`
- `logics/backlog/item_272_segments_analysis_panel_with_traversing_wires_listing.md`
- `logics/backlog/item_273_wires_table_column_order_section_before_length_and_analysis_info_enrichment.md`
- `logics/backlog/item_274_segment_id_editability_via_atomic_segment_rename_and_reference_remap.md`
- `logics/backlog/item_275_connectors_splices_analysis_wire_color_swatches_reusing_wire_table_design.md`
- `logics/backlog/item_276_callout_wire_length_and_section_display_enrichment.md`
- `logics/backlog/item_277_sub_network_default_display_cleanup_in_tables_and_render2d_controls.md`
- `logics/backlog/item_278_table_header_theming_completion_including_sort_chevrons_across_all_themes.md`
- `logics/backlog/item_279_render2d_selection_sync_without_forced_table_autoscroll.md`
- `logics/backlog/item_280_review_followup_reducer_invariants_table_filterbar_a11y_and_theme_regression_tests.md`
- `logics/backlog/item_281_req_044_table_sortability_and_analysis_enrichment_closure_ci_build_and_ac_traceability.md`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
- `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/app/components/workspace/TableFilterBar.tsx`
- `src/app/hooks/useEntityListModel.ts`
- `src/store/reducer/segmentReducer.ts`
- `src/app/hooks/useSegmentHandlers.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
- `src/tests/app.ui.theme.spec.tsx`
- `package.json`
- `.github/workflows/ci.yml`

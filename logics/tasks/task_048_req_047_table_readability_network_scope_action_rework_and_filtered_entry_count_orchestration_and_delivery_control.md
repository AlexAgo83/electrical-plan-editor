## task_048_req_047_table_readability_network_scope_action_rework_and_filtered_entry_count_orchestration_and_delivery_control - req_047 Orchestration: Table Readability, Filterable Table Entry Count Footers, and Network Scope Action Rework Delivery Control
> From version: 0.9.1
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Delivery orchestration for cross-surface UI readability polish and Network Scope operator-flow improvements in req_047
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_047`, which bundles a focused but cross-cutting UI ergonomics pass across `Wires`, `Connectors`/`Splices` analysis, filterable workspace tables, and `Network Scope` actions:
- split `Wires` table `Endpoints` into `Endpoint A` / `Endpoint B`
- add wire/cable name subrows under technical IDs in `Connectors` / `Splices` analysis (`Way` / `Port` wire lists)
- add right-aligned displayed-entry count footers under each **filterable** workspace table (live-updated after filtering)
- rework `Network Scope` action area with a new `Open` button and two-row button grouping

Important req_047 clarifications (validated by request updates):
- “Each table” means **filterable workspace tables only**.
- `Open` must perform `Set active` semantics for the selected network, then navigate to `Modeling`.

This task defines sequencing, validation gates, and closure traceability so the UI changes can ship without regressions across shared table infrastructure and navigation flows.

# Objective
- Deliver `req_047` in controlled waves with minimal regression risk across shared table/list patterns and `Network Scope` navigation actions.
- Preserve existing sort/filter/selection behaviors while adding readability improvements and visible-row count feedback.
- Keep `Open` semantics explicit (`set active` + navigate to `Modeling`) and non-regressive for existing network actions.
- Finish with final validation gates and synchronized `logics` documentation updates.

# Scope
- In:
  - Wave-based orchestration for `req_047` backlog items (`item_292`..`item_296`)
  - Validation/commit discipline between waves
  - Cross-surface sequencing and collision tracking (shared table footer rollout, wire-table layout, analysis row rendering, network action navigation)
  - Final AC traceability and `logics` synchronization
- Out:
  - Features beyond `req_047`
  - Data-model changes for wires or networks
  - Git history rewrite/squashing strategy (unless explicitly requested)

# Backlog scope covered
- `logics/backlog/item_292_wires_table_split_combined_endpoints_into_endpoint_a_and_endpoint_b_columns.md`
- `logics/backlog/item_293_connectors_splices_analysis_wire_entries_show_name_subrow_beneath_technical_id.md`
- `logics/backlog/item_294_shared_table_footer_displayed_entry_count_for_filtered_rows_across_workspace_tables.md`
- `logics/backlog/item_295_network_scope_action_area_open_button_and_two_row_grouping_rework.md`
- `logics/backlog/item_296_req_047_table_readability_network_scope_action_rework_and_filtered_entry_count_footer_closure_ci_build_and_ac_traceability.md`

# Attention points (mandatory delivery discipline)
- **`Open` semantics are strict:** `Open` must set the selected network active and navigate to `Modeling`; do not ship a navigation-only shortcut.
- **Footer scope is filterable tables only:** avoid adding counters to non-filterable tables/lists.
- **Shared footer implementation should reuse filtered-row state:** avoid duplicate filtering logic in each table component.
- **Table layout regression watch:** splitting wire endpoints into two columns can create width/wrapping regressions; validate on representative datasets.
- **Wave-based delivery + checkpoints required:** commit after each wave when targeted validations pass.
- **Final docs sync required:** update request/task/backlog statuses and closure notes after delivery.

# Recommended execution strategy (wave order)
Rationale:
- Land the shared filterable-table footer first because it affects many surfaces and establishes the count semantics (`visible filtered rows`) early.
- Then apply the `Wires` table endpoint split (localized table schema/layout change).
- Patch connector/splice analysis row rendering next (localized analysis presentation).
- Finish feature work with `Network Scope` action rework (`Open` semantics + layout), then run closure validation and AC traceability.

# Plan
- [x] Wave 0. Shared filterable-table displayed-entry count footer rollout (`item_294`)
- [x] Wave 1. `Wires` table endpoint column split (`item_292`)
- [x] Wave 2. Connector/splice analysis wire name subrow beneath technical ID (`item_293`)
- [x] Wave 3. `Network Scope` action area `Open` button + two-row grouping rework (`item_295`)
- [x] Wave 4. Closure: final validation, AC traceability, and `logics` synchronization (`item_296`)
- [x] FINAL. Update related `.md` files to final state (request/task/backlog progress + delivery summary + defer notes)

# Validation gates
## A. Minimum wave gate (apply after Waves 0-3)
- Documentation / Logics (when `.md` changed):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static checks:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:ui-modularization`
- Tests/build:
  - Targeted tests for touched surfaces (recommended first)
  - `npm run -s build`

## B. Final closure gate (mandatory at Wave 4)
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s test:ci`
- `npm run -s build`

## C. Targeted test guidance (recommended during Waves 0-3)
- `src/tests/app.ui.list-ergonomics.spec.tsx`
- `src/tests/app.ui.networks.spec.tsx`
- `src/tests/app.ui.home.spec.tsx` (if filterable table footer surfaces are touched there)
- `src/tests/app.ui.navigation-canvas.spec.tsx` (only if connector/splice analysis assertions are affected)

## D. Commit gate (apply after each Wave 0-4 and FINAL docs sync if separate)
- Commit only after the wave validation gate passes (green checkpoint preferred).
- Commit messages should reference `req_047` wave/scope.
- Update this task after each wave with wave status, validation snapshot, commit SHA, and blockers/deviations/defers.

# Cross-feature dependency / collision watchlist
- **Shared table footer rollout** touches many table containers:
  - Risk: inconsistent placement/styling or duplicate counters when some panels already have action/footer rows
- **Wire endpoint split** changes table column composition:
  - Risk: sort metadata, widths, or cell wrapping regressions in Modeling/Analysis `Wires` tables
- **Connector/splice analysis two-line rows** reuse existing swatch/metadata rendering:
  - Risk: spacing regressions, duplicated labels when name equals ID, or broken grouping row heights
- **Network Scope `Open` action** overlaps active-network and navigation flows:
  - Risk: navigation without active-network update, or active-network update without correct screen transition
- **Cross-surface tests**:
  - Risk: snapshot/text assertions become brittle after footer/count and two-line row rendering changes

# Mitigation strategy
- Centralize count-footer rendering in shared table shell/helpers where practical.
- Reuse existing endpoint formatting helpers/cell renderers and split only at column level.
- Implement analysis wire-name subrow as a small renderer extension with explicit “name missing” handling.
- Reuse existing `Set active` logic for `Open`, then compose navigation on top (avoid duplicate activation logic).
- Add targeted UI tests per wave and defer broad suite to closure gate if wave-specific checks are sufficient and documented.

# Report
- Wave status:
  - Wave 0 (shared filterable-table footer): completed
  - Wave 1 (`Wires` endpoint split): completed
  - Wave 2 (connector/splice analysis name subrow): completed
  - Wave 3 (`Network Scope` `Open` + action row grouping): completed
  - Wave 4 (closure + AC traceability): completed
  - FINAL (`.md` synchronization): completed
- Current blockers:
  - None.
- Main risks to track:
  - Footer rollout may require touching multiple table wrappers with slightly different markup/action-row structures.
  - `Open` action semantics (`set active` + navigate) may require coordination across network-scope handlers and workspace navigation helpers.
  - `Wires` endpoint split can expose latent column-width assumptions in desktop layouts.
- Validation snapshot:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅
  - `npm run -s typecheck` ✅
  - `npm run -s lint` ✅
  - `npm run -s quality:ui-modularization` ✅
  - `npm run -s quality:store-modularization` ✅
  - `npm run -s build` ✅
  - `npm run -s test:ci` ✅ (`34` files / `232` tests)
  - Targeted UI suites run during delivery/hardening (`list-ergonomics`, `networks`, `workspace-shell-regression`, `theme`, `network-summary-workflow-polish`, `navigation-canvas`) ✅
- Delivery snapshot:
  - `ed81e64` `ui: improve table readability and unify analysis into modeling` (delivered req_047 feature items alongside req_048 Phase 1 scaffolding)
  - `1086f80` `test: align workspace specs with modeling-analysis alias behavior` (closure regression alignment after merged navigation behavior)
- AC traceability (`req_047`) target mapping (planned):
  - AC1, AC2 -> `item_292`, `item_296`
  - AC3 -> `item_293`, `item_296`
  - AC4, AC5 -> `item_294`, `item_296`
  - AC6, AC7 -> `item_295`, `item_296`
  - AC8, AC9 -> `item_292`, `item_293`, `item_294`, `item_295`, `item_296`

# References
- `logics/request/req_047_table_readability_endpoint_column_split_analysis_wire_name_subrows_and_filtered_entry_count_footers.md`
- `logics/backlog/item_292_wires_table_split_combined_endpoints_into_endpoint_a_and_endpoint_b_columns.md`
- `logics/backlog/item_293_connectors_splices_analysis_wire_entries_show_name_subrow_beneath_technical_id.md`
- `logics/backlog/item_294_shared_table_footer_displayed_entry_count_for_filtered_rows_across_workspace_tables.md`
- `logics/backlog/item_295_network_scope_action_area_open_button_and_two_row_grouping_rework.md`
- `logics/backlog/item_296_req_047_table_readability_network_scope_action_rework_and_filtered_entry_count_footer_closure_ci_build_and_ac_traceability.md`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/components/workspace/TableFilterBar.tsx`
- `src/app/hooks/useEntityListModel.ts`
- `src/app/hooks/useWorkspaceNavigation.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
- `src/tests/app.ui.networks.spec.tsx`
- `package.json`

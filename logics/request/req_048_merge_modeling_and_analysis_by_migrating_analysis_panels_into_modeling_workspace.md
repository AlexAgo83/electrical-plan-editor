## req_048_merge_modeling_and_analysis_by_migrating_analysis_panels_into_modeling_workspace - Merge Modeling and Analysis by Migrating Analysis Panels into the Modeling Workspace
> From version: 0.9.1
> Understanding: 96%
> Confidence: 93%
> Complexity: High
> Theme: Workspace Simplification Through Modeling/Analysis Unification
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Merge `Modeling` and `Analysis` into a unified workspace experience.
- Migrate the additional panels currently available in `Analysis` into `Modeling`.
- Preserve the ability to inspect the same analytical information (wires/connectors/splices/nodes/segments analysis surfaces) without requiring a separate screen switch.

# Context
The app currently exposes `Modeling` and `Analysis` as separate workspace screens. This separation helped modularize delivery and enabled dedicated analysis surfaces, but it also creates friction:

- users must switch screens to inspect information that is closely related to modeling actions,
- selection/focus context is split across two screen mental models,
- navigation complexity increases as analytical panels expand.

Recent deliveries enriched `Analysis` significantly (wire, connector/splice, node/segment analysis views), making the separation more expensive in day-to-day workflows when users iterate between editing and inspection.

This request aims to simplify the workflow by making `Modeling` the primary unified surface and migrating `Analysis` capabilities into it.

## Objectives
- Reduce screen-switching between edit and inspection tasks.
- Make `Modeling` the single primary workspace for both entity editing and analytical panel inspection.
- Preserve existing analysis capabilities and data visibility while improving operator flow.
- Minimize regression risk by reusing existing analysis panel components and shared list models where possible.
- Keep navigation and selection behavior coherent during and after the merge.

## Scope clarification (important)
- “Merge `Modeling` and `Analysis`” in this request means:
  - `Analysis` panels become accessible from the `Modeling` workspace,
  - users no longer need a separate `Analysis` screen to access those panels.
- The request does **not** mandate immediate hard deletion of all `Analysis` code paths on day one; implementation may use a compatibility phase (redirect/alias/integrated composition) if that reduces risk.
- Recommended rollout shape for this request:
  - **Phase 1**: unified UX delivered via `Modeling` + `Analysis` alias/redirect compatibility path
  - **Phase 2** (follow-up cleanup, if needed): remove redundant legacy `Analysis` screen paths after stabilization
- This request targets **workspace UX/navigation and panel composition**, not analytical model semantics.
- Existing analysis content scope (connectors/splices/wires/nodes/segments analysis panels) remains functionally in scope after migration.

## Recommended UX decisions (baseline)
- Unified workspace strategy:
  - `Modeling` becomes the main destination for both editing and analysis tasks.
  - Analysis-specific panels are integrated into the `Modeling` workspace layout (same shell, same selection context).
- Navigation strategy (recommended baseline):
  - keep the top-level `Analysis` screen entry temporarily as a **compatibility alias/redirect** to `Modeling` (Phase 1)
  - standard navigation actions (including `Open`) should target `Modeling`
  - legacy `Analysis` navigation should open `Modeling` with an analysis-oriented panel focus state
- Panel access strategy:
  - preserve discoverability of analysis panels via **sub-navigation** inside `Modeling` (recommended over rendering all panels simultaneously)
  - in unified `Modeling`, show one panel family/focus area at a time rather than visually stacking all analysis + modeling panels
  - avoid burying analysis panels behind hidden toggles with no clear affordance
- `Analysis` alias landing behavior (recommended baseline):
  - redirect to `Modeling` and activate an **analysis-focused mode**
  - restore the last selected analysis sub-panel when available
  - fallback default analysis sub-panel: `Wires`
- Selection/focus behavior:
  - preserve current selection synchronization across tables, forms, and analytical panels
  - opening/using analysis panels in `Modeling` should not reset modeling form context unnecessarily
- Panel-local state behavior:
  - preserve filter/sort state per panel where existing architecture allows (recommended: memory by panel family/view)
- Form visibility / density management:
  - when entering an analysis-focused view inside `Modeling`, forms may be hidden/collapsed by default to reduce visual overload
  - provide a quick path back to editing-oriented panels/forms
- Performance strategy:
  - preserve lazy-loading/code-splitting benefits where practical even if the UI is unified
  - avoid loading all heavy analysis UI upfront when not visible, if existing architecture supports deferred loading
- Responsive strategy:
  - on mobile/tablet, show one panel family at a time (sub-navigation-driven) to avoid a dense merged layout

## Functional Scope
### A. Modeling/Analysis workspace unification (high priority)
- Recompose the workspace so `Modeling` includes access to the panels currently exclusive to `Analysis`.
- Ensure users can reach analytical panels without switching to a distinct `Analysis` screen.
- Preserve existing `Modeling` capabilities (primary/secondary tables, forms, action flows) while adding analysis access.
- Keep the unified experience consistent with current shell layout, panel theming, and responsive behavior.

### B. Migration of analysis panels into Modeling (high priority)
- Integrate the existing analysis panel surfaces into the `Modeling` workspace composition, including current analysis coverage:
  - connectors analysis panels
  - splices analysis panels
  - wires analysis panels
  - nodes/segments analysis panels
- Reuse existing panel components (`Analysis*WorkspacePanels`) when feasible to minimize duplicate logic and regression risk.
- Preserve analysis panel functionality during migration:
  - filtering
  - sorting
  - focused-row/selection interactions
  - wire/connector/splice analysis enrichments already delivered

### C. Navigation and sub-navigation behavior update (high priority)
- Update workspace navigation so the user flow reflects the merged experience.
- If `Analysis` remains temporarily visible as a nav entry during migration:
  - it should redirect/alias into the unified `Modeling` workspace (required baseline for Phase 1)
  - it should enter an analysis-focused mode/sub-panel state in `Modeling`
  - it should restore the last analysis sub-panel when available, otherwise default to `Wires`
  - duplicate divergent states between `Modeling` and `Analysis` must be avoided
- Update sub-screen/entity navigation labels and routing state as needed so users can still quickly target the intended panel family.
- Preserve keyboard navigation and focus behavior in the workspace sidebar/navigation controls.

### D. Selection, focus, and state continuity across unified panels (high priority)
- Preserve shared selection context across modeling tables/forms and migrated analysis panels.
- Switching between modeling-oriented panels and analysis-oriented panels within the unified workspace should:
  - keep the selected entity when relevant
  - avoid unnecessary filter resets
  - preserve panel-local sort/filter state where supported (recommended baseline)
  - avoid disruptive scroll jumps beyond existing intended behavior
- Ensure panel-local UI state (sorting/filter text/expanded groups where applicable) remains deterministic and does not conflict due to the composition change.
- Ensure switching into analysis-focused mode does not destroy the user's in-progress modeling context unless a current architecture limitation is explicitly documented.

### E. Screen/component architecture consolidation (medium-high priority)
- Consolidate screen/container composition to reflect the merged workspace architecture.
- Reduce duplication between `ModelingScreen` and `AnalysisScreen` composition paths where possible.
- Update lazy module registration/import wiring if screen boundaries change.
- If `AnalysisScreen` becomes a compatibility wrapper/redirect (recommended Phase 1 baseline), document the final role and planned cleanup path.

### F. Regression safety and UX continuity (high priority)
- Add/update tests covering:
  - access to migrated analysis panels from `Modeling`
  - preserved analysis panel functionality (filter/sort/render baselines)
  - navigation behavior for `Analysis` entry alias/redirect into `Modeling` analysis-focused mode
  - alias landing behavior restores last analysis sub-panel and falls back to `Wires`
  - selection continuity when moving between modeling and migrated analysis panels
  - analysis-focused mode density behavior (forms hidden/collapsed by default if implemented)
- Validate no regressions in:
  - modeling forms and table interactions
  - analysis list rendering and enrichment
  - workspace shell navigation

## Non-functional requirements
- Preserve usability: unified workspace must remain scannable and not become visually overloaded.
- Preserve maintainability: prefer composition/reuse over duplicating panel logic under new names.
- Preserve performance characteristics as much as practical (especially lazy-loading and render cost).
- Keep the migration architecture explicit and documented if delivered in phases (alias/redirect before hard removal).
- Favor a low-risk Phase 1 integration (reuse + composition) before any deeper cleanup/removal of legacy `Analysis` wrappers.

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx` (if shared selection/navigation assertions are affected)
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.home.spec.tsx` (only if top-level navigation behavior or empty-state routing is affected)
  - `src/tests/app.ui.networks.spec.tsx` (if screen-switching assumptions are present there)
- Recommended checks:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:ui-modularization`
  - `npm run -s test:ci`
  - `npm run -s build`
- Optional closure validation:
  - `npm run -s test:e2e`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: Users can access the analysis panels currently available in `Analysis` from within the `Modeling` workspace.
- AC2: Migrated analysis panels preserve their core functionality (rendering, filtering, sorting, and selection interactions) after integration into `Modeling`.
- AC3: The workspace navigation flow no longer requires a separate `Analysis` screen switch to perform analysis tasks.
- AC4: In Phase 1, if an `Analysis` navigation entry remains for compatibility, it redirects/aliases into `Modeling` in analysis-focused mode without creating divergent screen state.
- AC5: The `Analysis` alias/redirect restores the last selected analysis sub-panel when available and otherwise defaults to the `Wires` analysis sub-panel.
- AC6: Selection/focus context remains coherent when moving between modeling and migrated analysis panels within the unified workspace.
- AC7: Panel-local filter/sort state remains stable/preserved across panel switching within the unified workspace where supported by the architecture.
- AC8: Existing `Modeling` forms/tables interactions remain functional and non-regressed.
- AC9: Unified workspace composition remains theme-consistent and usable across supported screen sizes, including mobile/tablet one-panel-at-a-time behavior.
- AC10: Regression coverage is updated for the merged navigation/panel composition behavior and alias/redirect compatibility path.

## Out of scope
- Rewriting analysis algorithms or changing analysis data semantics.
- Large visual redesign of the entire workspace shell beyond what is needed for unification.
- New analysis features unrelated to the migration (for example new panel types not already present in `Analysis`).
- Full removal of all legacy `Analysis` code paths in the same iteration if a compatibility phase is chosen (can be follow-up cleanup).
- Final post-stabilization cleanup/removal of the compatibility `Analysis` alias entry (if deferred to a follow-up phase).

# Backlog
- `logics/backlog/item_297_modeling_workspace_composition_adds_access_to_analysis_panels.md`
- `logics/backlog/item_298_migrate_analysis_panel_components_into_unified_modeling_workspace_flow.md`
- `logics/backlog/item_299_workspace_navigation_and_analysis_screen_alias_redirect_for_modeling_analysis_merge.md`
- `logics/backlog/item_300_unified_modeling_analysis_selection_state_and_regression_hardening.md`
- `logics/backlog/item_301_req_048_modeling_analysis_merge_closure_ci_build_and_ac_traceability.md`

# References
- `logics/request/req_014_ui_modularization_wave_2_controller_analysis_canvas_and_bundle_optimization.md`
- `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
- `src/app/components/screens/ModelingScreen.tsx`
- `src/app/components/screens/AnalysisScreen.tsx`
- `src/app/components/layout/AppShellLayout.tsx`
- `src/app/components/WorkspaceNavigation.tsx`
- `src/app/components/containers/ModelingWorkspaceContainer.tsx`
- `src/app/components/containers/AnalysisWorkspaceContainer.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
- `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/app/components/appUiModules.tsx`
- `src/tests/app.ui.workspace-shell-regression.spec.tsx`
- `src/tests/app.ui.list-ergonomics.spec.tsx`

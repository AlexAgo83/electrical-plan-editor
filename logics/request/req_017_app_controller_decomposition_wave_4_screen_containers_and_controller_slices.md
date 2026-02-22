## req_017_app_controller_decomposition_wave_4_screen_containers_and_controller_slices - AppController Decomposition Wave 4 (Screen Containers and Controller Slices)
> From version: 0.5.2
> Understanding: 99%
> Confidence: 97%
> Complexity: High
> Theme: Composition Root Reduction and Screen-Oriented Controller Decomposition
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Further reduce `src/app/AppController.tsx` after wave-3 refactor closure (`req_016`) to improve long-term maintainability and reviewability.
- Move `AppController` toward a true composition-root role rather than a large multi-screen orchestrator and prop assembler.
- Reduce blast radius of future UI changes by isolating screen-specific wiring into dedicated containers and controller slices.
- Preserve current UX/runtime behavior (including lazy-loaded screens, PWA/static build compatibility, keyboard/focus behaviors, and inspector/canvas interactions).

# Context
Wave-3 (`req_016`) successfully split `app-utils-layout.ts` and extracted several orchestration hooks from `AppController`, but `src/app/AppController.tsx` remains a major hotspot:

- `src/app/AppController.tsx` is still ~1840 lines after wave-3 closure.

Current remaining size/concentration is primarily driven by:
- high volume of local UI state and destructuring
- large hook dependency/config objects
- screen-level render composition and prop wiring across modeling / analysis / validation / settings / network-scope
- derived read-only UI models mixed with orchestration and rendering

Wave-4 should focus on structural decomposition of `AppController` itself, not on new end-user features.

Related delivered baseline to preserve:
- `logics/request/req_014_ui_modularization_wave_2_controller_analysis_canvas_and_bundle_optimization.md`
- `logics/request/req_016_app_controller_and_layout_engine_modularization_wave_3.md`
- `logics/request/req_015_runtime_robustness_persistence_empty_workspace_semantics_and_ci_release_safety.md`

## Objectives
- Make `AppController` primarily a composition root (store snapshot + global shell composition + screen container mounting).
- Extract screen-specific JSX and prop-wiring into dedicated container components/modules.
- Introduce screen/domain controller slices to localize behavior wiring and data contracts.
- Group remaining local UI state into cohesive state packs (instead of many unrelated `useState` declarations).
- Separate derived read-only UI models from imperative orchestration for clearer reasoning and testability.
- Reduce `AppController.tsx` line count substantially (targeted phased reductions, behavior-first).

## Functional Scope
### A. Screen container extraction (highest priority)
- Create dedicated container modules for screen-specific composition/wiring:
  - `NetworkScopeWorkspaceContainer`
  - `ModelingWorkspaceContainer`
  - `AnalysisWorkspaceContainer`
  - `ValidationWorkspaceContainer`
  - `SettingsWorkspaceContainer`
- Move screen JSX and heavyweight prop composition from `AppController` into these containers.
- Preserve current lazy-loading boundaries and test-safe eager behavior.
- Preserve screen render order, shell layout, and fallback behavior.

### B. Controller slices by screen/domain (high priority)
- Introduce explicit screen/domain controller slices (exact names may vary if equivalent and clearer), e.g.:
  - `useModelingControllerSlice`
  - `useAnalysisControllerSlice`
  - `useValidationControllerSlice`
  - `useSettingsControllerSlice`
- Each slice should accept explicit dependencies and return a narrow contract consumed by its screen container.
- Avoid replacing `AppController` with a single mega-hook that merely relocates complexity.

### C. State pack extraction (high priority)
- Group local UI state into cohesive hooks/state packs where it improves readability, e.g.:
  - preferences state
  - canvas/UI toggles state
  - network-scope UI state (continuing wave-3 pattern)
- Keep state ownership explicit and avoid hidden coupling.
- Preserve persistence/focus/keyboard semantics.

### D. Derived state and selector bundling (medium-high priority)
- Extract read-only derived models into dedicated hooks/helpers (without changing behavior), e.g.:
  - resolved selected entities / selection display models
  - issue navigator display model
  - network summary derived chips/counters
  - screen-specific display helpers
- Separate “computed/read-only” data from “event handlers/orchestration”.

### E. Hook dependency config simplification (medium priority)
- Reduce large inline hook parameter objects in `AppController` by:
  - dedicated builder helpers, and/or
  - intermediate hooks that encapsulate config assembly
- Keep dependency injection explicit and traceable.
- Do not introduce implicit global state or opaque indirection.

### F. AppController end-state contract (closure target)
- `AppController` should retain:
  - store snapshot integration
  - top-level shell/navigation/ops panel composition
  - shared cross-screen wiring that must remain centralized
  - mounting of screen containers
- `AppController` should not retain:
  - large screen JSX branches
  - screen-specific form/list prop wiring blocks
  - deeply screen-specific derived display logic

## Reduction targets (guidance, not hard blockers unless validated by task/backlog)
- Phase 1 target (containers + slices): reduce `AppController.tsx` from ~1840 to ~1200 lines.
- Phase 2 target (state packs + derived state extraction): reduce to ~850-1000 lines.
- Stretch target: <800 lines only if achieved without introducing opaque abstractions or behavior risk.

## Non-functional requirements
- Favor incremental, reviewable refactors over a large rewrite.
- Preserve deterministic local-first behavior and persistence compatibility.
- Keep behavior-first tests meaningful; do not weaken assertions to accommodate refactor internals.
- Maintain accessibility, keyboard shortcuts, focus management, and inspector behavior.
- Preserve static build chunking / lazy-loading / PWA artifact health.

## Validation and regression safety
- Run targeted tests after each extraction wave (especially modeling/canvas/inspector/navigation flows).
- Run full validation at closure:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run quality:ui-modularization`
  - `npm run quality:store-modularization`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: `AppController.tsx` is substantially reduced and acts primarily as a composition root.
- AC2: Screen-specific render composition and heavyweight prop wiring are moved into dedicated screen containers (or equivalent modules) with behavior parity.
- AC3: Screen/domain controller slices are introduced with explicit contracts and without mega-hook regressions.
- AC4: Cohesive local UI state packs and/or derived-state hooks reduce `AppController` state/dependency noise while preserving behavior.
- AC5: Lazy-loading boundaries, build chunking, static hosting compatibility, and PWA artifact health remain intact.
- AC6: Modeling/canvas/inspector/navigation behaviors remain stable across integration and E2E regression coverage.
- AC7: No new circular-import or hidden-coupling regressions are introduced by the decomposition.
- AC8: Full validation pipeline passes after closure.

## Out of scope
- New end-user features unrelated to controller decomposition.
- Major UI redesign or routing/navigation semantic changes.
- Store architecture redesign in `src/store`.
- “Magic” abstraction layers (e.g., one mega `useAppControllerLogic()` hook) that only move complexity without clarifying ownership.
- Context proliferation solely to avoid prop passing where explicit contracts are clearer.

# Backlog
- To create from this request:
  - `item_100_app_controller_modeling_screen_container_and_prop_wiring_extraction.md`
  - `item_101_app_controller_analysis_validation_settings_networkscope_screen_containers_extraction.md`
  - `item_102_app_controller_screen_domain_controller_slices_extraction.md`
  - `item_103_app_controller_local_ui_state_pack_extraction.md`
  - `item_104_app_controller_derived_state_and_selector_bundle_extraction.md`
  - `item_105_app_controller_hook_dependency_config_builder_simplification.md`
  - `item_106_app_controller_wave_4_closure_regression_and_ac_traceability.md`

# References
- `src/app/AppController.tsx`
- `src/app/components/screens/ModelingScreen.tsx`
- `src/app/components/screens/AnalysisScreen.tsx`
- `src/app/components/screens/ValidationScreen.tsx`
- `src/app/components/screens/SettingsScreen.tsx`
- `src/app/components/screens/NetworkScopeScreen.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingFormsColumn.tsx`
- `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
- `src/app/components/workspace/ValidationWorkspaceContent.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/hooks/useCanvasInteractionHandlers.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/app/hooks/useSelectionHandlers.ts`
- `src/app/hooks/useValidationModel.ts`
- `src/app/hooks/useNetworkScopeFormState.ts`
- `src/app/hooks/useNetworkScopeFormOrchestration.ts`
- `src/app/hooks/useModelingFormSelectionSync.ts`
- `src/app/hooks/useWireEndpointDescriptions.ts`
- `src/app/hooks/useIssueNavigatorModel.ts`
- `src/app/hooks/useInspectorPanelVisibility.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.workspace-shell-regression.spec.tsx`
- `src/tests/app.ui.inspector-shell.spec.tsx`
- `tests/e2e/smoke.spec.ts`
- `scripts/quality/check-ui-modularization.mjs`
- `package.json`
- `.github/workflows/ci.yml`

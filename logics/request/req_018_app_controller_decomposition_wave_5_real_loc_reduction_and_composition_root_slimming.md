## req_018_app_controller_decomposition_wave_5_real_loc_reduction_and_composition_root_slimming - AppController Decomposition Wave 5 (Real LOC Reduction and Composition Root Slimming)
> From version: 0.5.3
> Understanding: 99%
> Confidence: 97%
> Complexity: High
> Theme: Real AppController LOC Reduction Without Opaque Abstractions
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Continue `AppController` decomposition after wave-4 (`req_017`) with a focus on measurable line-count reduction, not only structural extraction.
- Reduce `src/app/AppController.tsx` review cost by shrinking explicit wiring/destructuring noise while preserving traceable ownership.
- Keep the composition-root model (explicit contracts, behavior parity) without collapsing logic into a mega-hook.

# Context
Wave-4 (`req_017`) improved boundaries (screen containers, controller slices, state packs, derived hooks, heavy-hook assemblers), but `src/app/AppController.tsx` remains large:

- `src/app/AppController.tsx` is still ~1818 lines after wave-4 closure.

Why the file remains large despite valid refactors:
- `AppController` still owns top-level shell composition (`header`, drawers, operations panel, footer, inspector).
- Explicit dependency injection remains verbose (large hook/slice invocations are now clearer, but still many lines).
- Large `useState`/hook destructurings remain flat and line-heavy (`useEntityFormsState`, `useCanvasState`, others).
- Import block is large due to eager/lazy screen + workspace-content dual loading and many orchestration helpers.
- Modeling domain orchestration is still spread across multiple handler hooks and AppController wiring.

This request targets the next step: reduce LOC materially while preserving the clarity gains from wave-4.

Related delivered baseline to preserve:
- `logics/request/req_016_app_controller_and_layout_engine_modularization_wave_3.md`
- `logics/request/req_017_app_controller_decomposition_wave_4_screen_containers_and_controller_slices.md`

## Objectives
- Achieve a substantial `AppController.tsx` LOC reduction (not just responsibility redistribution with equal LOC).
- Keep `AppController` focused on store snapshot + top-level composition root duties.
- Reduce flat destructuring and prop/wiring volume through namespaced contracts and domain orchestrators.
- Extract shell layout composition where it improves readability without hiding behavior ownership.
- Preserve lazy-loading/PWA/build behavior and current integration/E2E semantics.

## Functional Scope
### A. Screen-content slice call-site reduction (high priority)
- Move large `use*ScreenContentSlice(...)` call-site assemblies out of `AppController` into screen-domain controller hooks (or equivalent modules) with narrow return contracts.
- Keep screen-specific dependencies explicit, but grouped by domain (`modeling`, `analysis`, `validation`, `settings`, `networkScope`).
- Avoid replacing explicit composition with a single monolithic `useAppControllerLogic()`.

### B. Local state contract compaction via namespaced packs (high priority)
- Reduce flat destructuring noise from high-volume hooks (`useEntityFormsState`, `useCanvasState`, etc.) by returning namespaced/grouped contracts where practical.
- Examples (exact names may vary if equivalent and clearer):
  - `forms.connector`, `forms.splice`, `forms.node`, `forms.segment`, `forms.wire`
  - `canvas.viewport`, `canvas.interaction`, `canvas.display`
- Preserve typing precision and setter semantics.

### C. Shell layout extraction from AppController (medium-high priority)
- Extract top-level shell JSX composition (`header`, navigation drawer, operations panel, footer, inspector`) into a dedicated layout component/module (e.g. `AppShellLayout`) if it reduces `AppController` LOC and keeps contracts explicit.
- `AppController` should still decide high-level visibility/state transitions, but not own long shell markup blocks inline.
- Preserve focus, accessibility, overlay, and keyboard behavior.

### D. Modeling domain orchestration compaction (medium-high priority)
- Reduce AppController wiring for connector/splice/node/segment/wire handler integration by introducing a modeling-domain orchestrator hook (or equivalent layered contracts), with explicit subcontracts and no hidden global state.
- Goal: remove repetitive cross-hook plumbing from `AppController`, not to merge all modeling behavior into one opaque abstraction.

### E. Import footprint / lazy wiring compaction (medium priority)
- Reduce import-line noise where practical through explicit module registries/facades for eager/lazy screen/content components (while preserving chunk boundaries and test-safe eager behavior).
- Avoid obscuring lazy-loading behavior or creating brittle dynamic import indirection.

### F. End-state composition-root contract (closure target)
- `AppController` should retain:
  - store snapshot integration
  - top-level orchestration that must remain centralized
  - cross-screen coordination and global refs/shortcuts
  - mounting of high-level shell + screen-domain outputs
- `AppController` should not retain (or should contain much less of):
  - long shell JSX markup blocks
  - repeated flat destructuring noise for domain-local state
  - large screen/domain slice call-site assembly blocks
  - repetitive modeling-domain handler plumbing

## Reduction Targets (guidance)
- Baseline after wave-4 closure: ~1818 LOC in `src/app/AppController.tsx`
- Phase 1 target (screen call-site reduction + shell extraction): ~1400-1550 LOC
- Phase 2 target (namespaced state packs + modeling orchestrator compaction): ~1050-1300 LOC
- Stretch target: `<1000` LOC only if achieved without opaque abstractions or behavior risk

## Non-functional requirements
- Preserve behavior-first architecture and explicit dependency flow.
- Prefer incremental, reviewable refactors over a broad rewrite.
- Do not weaken tests to match refactor internals.
- Maintain accessibility, keyboard shortcuts, overlay/focus handling, and inspector behavior.
- Preserve lazy-loading chunking, static build compatibility, and PWA artifact health.

## Validation and regression safety
- Run targeted integration tests after each major extraction step (navigation/canvas, inspector shell, workspace shell, validation/settings as impacted).
- Run full closure validation:
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
- AC1: `AppController.tsx` is materially reduced in LOC versus wave-4 closure baseline (~1818) and remains a composition root.
- AC2: Large screen-domain slice call-site assembly blocks are reduced/moved behind explicit domain contracts without mega-hook regression.
- AC3: Local state/destructuring noise is significantly reduced via namespaced/cohesive state contracts while preserving behavior.
- AC4: Shell layout JSX is extracted or otherwise compacted with preserved accessibility/focus/overlay behavior.
- AC5: Modeling-domain handler wiring in `AppController` is materially simplified without hidden coupling.
- AC6: Lazy-loading/test-safe eager behavior, build chunking, and PWA artifact health remain intact.
- AC7: Navigation/canvas/inspector/workspace-shell behaviors remain stable across integration + E2E regressions.
- AC8: Full validation pipeline passes after closure.

## Out of scope
- New end-user features unrelated to controller decomposition.
- Store architecture redesign.
- Routing/navigation semantic redesign.
- A single mega `useAppControllerLogic()` abstraction that hides ownership.
- Context proliferation solely to avoid explicit prop/dependency passing.

# Backlog
- To create from this request:
  - `item_107_app_controller_screen_slice_callsite_compaction_and_domain_hooks.md`
  - `item_108_app_controller_namespaced_state_contracts_and_destructuring_reduction.md`
  - `item_109_app_controller_shell_layout_extraction_and_markup_compaction.md`
  - `item_110_app_controller_modeling_domain_orchestrator_compaction.md`
  - `item_111_app_controller_lazy_import_registry_and_component_wiring_compaction.md`
  - `item_112_app_controller_wave_5_loc_reduction_measurement_and_regression_tracking.md`
  - `item_113_app_controller_wave_5_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# References
- `src/app/AppController.tsx`
- `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`
- `src/app/hooks/controller/useAppControllerHeavyHookAssemblers.ts`
- `src/app/hooks/useEntityFormsState.ts`
- `src/app/hooks/useCanvasState.ts`
- `src/app/hooks/useConnectorHandlers.ts`
- `src/app/hooks/useSpliceHandlers.ts`
- `src/app/hooks/useNodeHandlers.ts`
- `src/app/hooks/useSegmentHandlers.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/hooks/useWorkspaceShellChrome.ts`
- `src/app/components/containers/ModelingWorkspaceContainer.tsx`
- `src/app/components/containers/AnalysisWorkspaceContainer.tsx`
- `src/app/components/containers/ValidationWorkspaceContainer.tsx`
- `src/app/components/containers/SettingsWorkspaceContainer.tsx`
- `src/app/components/containers/NetworkScopeWorkspaceContainer.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.workspace-shell-regression.spec.tsx`
- `src/tests/app.ui.inspector-shell.spec.tsx`
- `tests/e2e/smoke.spec.ts`
- `scripts/quality/check-ui-modularization.mjs`
- `package.json`
- `.github/workflows/ci.yml`

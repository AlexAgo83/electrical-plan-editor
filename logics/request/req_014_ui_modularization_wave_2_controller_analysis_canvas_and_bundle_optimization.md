## req_014_ui_modularization_wave_2_controller_analysis_canvas_and_bundle_optimization - UI Modularization Wave 2 (Controller / Analysis / Canvas / Bundle Optimization)
> From version: 0.5.0
> Understanding: 97%
> Confidence: 94%
> Complexity: High
> Theme: Maintainability, Line-Budget Control, and Runtime Delivery Efficiency
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Reduce maintenance risk caused by very large UI/controller files (especially `AppController.tsx`).
- Continue modularization work after the first line-budget waves (`req_005`, `req_006`, `req_008`, `req_013`).
- Split large analysis and canvas-related components without changing current UX behavior.
- Refactor "god utility" modules into domain-focused helpers.
- Improve bundle delivery ergonomics by introducing code-splitting on heavy screens where safe.
- Keep current UX and interaction behavior stable while refactoring internals.
- Preserve compatibility with existing quality gates and CI pipeline.

# Context
The project has reached a rich UX state (network scope, modeling/analysis harmonization, 2D canvas overlays, floating inspector, PWA features), but several files now concentrate too much responsibility and exceed practical review/maintenance thresholds.

Recent work already introduced modularization quality gates and documented oversize exceptions for CSS. This request aims to reduce future drift by performing a second wave of targeted modularization on the biggest and most coupled UI files.

Observed large files (current state, approximate):
- `src/app/AppController.tsx` (~2200+ lines)
- `src/app/lib/app-utils.ts` (~1000+ lines)
- `src/app/components/workspace/AnalysisWorkspaceContent.tsx` (~800+ lines)
- `src/app/components/NetworkSummaryPanel.tsx` (~580+ lines)
- `src/app/components/workspace/ModelingFormsColumn.tsx` (~500+ lines)
- Large CSS modules already documented as temporary oversize exceptions (`base.css`, `workspace.css`, `canvas.css`, `validation-settings.css`)

Architecture references to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`
- `logics/request/req_005_large_ui_files_split_and_hook_extraction.md`
- `logics/request/req_008_app_orchestration_shell_completion_and_final_line_budget.md`
- `logics/request/req_013_list_form_workspace_harmonization_based_on_network_scope.md`

## Objectives
- Reduce size and responsibility concentration of `AppController.tsx` while keeping it as a composition/orchestration entrypoint.
- Split `app-utils.ts` into focused modules (sorting/parsing/labels/canvas/form helpers) with clearer ownership.
- Split `AnalysisWorkspaceContent.tsx` into dedicated sub-screen components (`connector`, `splice`, `wire`) plus shared table/panel helpers.
- Split `NetworkSummaryPanel.tsx` into rendering and overlay subcomponents (toolbar, floating panels, legend, SVG layers).
- Split `ModelingFormsColumn.tsx` into per-entity form panels and shared form scaffolding.
- Progressively reduce oversized CSS exceptions by extracting reusable style modules without destabilizing themes.
- Introduce code splitting (`React.lazy`) for heavyweight screens where UX impact is minimal and predictable.
- Maintain current behavior parity validated by unit/integration/E2E tests.

## Functional Scope
### A. App controller decomposition (high priority)
- Refactor `src/app/AppController.tsx` into smaller orchestration hooks/modules.
- Keep `AppController.tsx` as the top-level coordinator, but extract responsibility clusters such as:
  - workspace shell/drawer/header overlay behavior,
  - network scope form orchestration,
  - selection-to-form synchronization,
  - canvas controls/layout orchestration,
  - inspector and operations panel visibility policies,
  - PWA install/update lifecycle integration.
- Preserve existing public component behavior and event flows.
- Avoid introducing new global state containers solely for this refactor.

### B. Utility module decomposition (`app-utils.ts`)
- Split `src/app/lib/app-utils.ts` into domain-oriented utility modules with explicit naming.
- Candidate groups:
  - sorting/table helpers,
  - parsing/coercion/normalization helpers,
  - display labels / formatting helpers,
  - canvas math / geometry helpers,
  - entity/form helper utilities.
- Keep exports discoverable and avoid circular imports.
- Update imports incrementally to minimize regression risk.

### C. Analysis workspace modularization
- Split `src/app/components/workspace/AnalysisWorkspaceContent.tsx` into:
  - `AnalysisConnectorWorkspace` (list + merged connector analysis panel),
  - `AnalysisSpliceWorkspace` (list + merged splice analysis panel),
  - `AnalysisWireWorkspace` (list + wire analysis panel),
  - shared UI helpers (filter chips, table headers, CSV export trigger, empty states) when useful.
- Preserve current UX:
  - list-first layout,
  - filter chip placement,
  - CSV exports,
  - wire route control behavior,
  - analysis-specific naming and panels.
- Keep `Network summary` row behavior and placement intact.

### D. 2D network summary panel modularization
- Split `src/app/components/NetworkSummaryPanel.tsx` into focused subcomponents/modules:
  - header action controls (`Info`, `Length`, `Grid`, `Snap`, `Export PNG`),
  - floating canvas controls panel (zoom/fit/generate),
  - floating stats/sub-network panels,
  - legend,
  - route preview panel (if still owned there),
  - SVG render layers (segments, nodes, labels, hitboxes).
- Preserve all existing interaction behavior:
  - selection hitboxes,
  - highlighting,
  - label stroke options,
  - grid/snap/info/length toggles,
  - export PNG.

### E. Modeling forms column modularization
- Split `src/app/components/workspace/ModelingFormsColumn.tsx` into per-entity form panels:
  - connector,
  - splice,
  - node,
  - segment,
  - wire.
- Extract shared form header / mode chip / idle state scaffolding into reusable local components.
- Preserve current semantics:
  - `idle` / `create` / `edit` modes,
  - "Create" entrypoint from idle state,
  - cancel behavior and focus/selection synchronization.

### F. CSS modularization wave 2 (progressive)
- Reduce dependency on oversized CSS exceptions by splitting large style files into scoped modules.
- Prioritized split targets:
  - `base.css`: tokens/themes/foundations/common primitives,
  - `workspace.css`: shell/header/drawer/nav/panel layout regions,
  - `canvas.css`: canvas core/overlays/legend/floating panels,
  - `validation-settings.css`: validation vs settings styling blocks where separation is clean.
- Preserve visual parity across all themes (`Light`, `Dark`, additional palettes).
- Keep CSS variable contracts stable unless intentionally versioned.

### G. Bundle and loading optimization (safe code splitting)
- Introduce `React.lazy` + `Suspense` for heavy screens/components where appropriate (e.g. `Settings`, `Validation`, `Analysis` content blocks).
- Keep first render and navigation behavior deterministic.
- Avoid code-splitting highly coupled low-level primitives if it increases complexity.
- Ensure PWA build and static deployment remain functional after chunking changes.

### H. Quality gates and observability updates
- Update/extend line-budget quality gates if module boundaries change.
- Reduce documented oversize exceptions when actual file sizes are brought below threshold.
- Keep test coverage and E2E smoke aligned with any renamed internal headings or structural changes (behavior parity expected).
- Ensure no CI regressions due to import cycles, lazy-loading fallback issues, or routing/focus behavior drift.

## Acceptance criteria
- AC1: `AppController.tsx` is significantly reduced and acts primarily as composition/orchestration shell.
- AC2: `src/app/lib/app-utils.ts` is decomposed into smaller domain-oriented modules with equivalent behavior.
- AC3: `AnalysisWorkspaceContent.tsx` is split into sub-screen modules while preserving current analysis UX behavior.
- AC4: `NetworkSummaryPanel.tsx` is split into focused subcomponents/modules with no regression in 2D interactions and overlays.
- AC5: `ModelingFormsColumn.tsx` is split into per-entity form panels with preserved `idle/create/edit` flows.
- AC6: At least one oversized CSS exception is reduced or split (or the exceptions list is explicitly re-documented with updated rationale if deferred).
- AC7: Optional code splitting for heavy screens is implemented without breaking static hosting, PWA build, or navigation UX.
- AC8: `npm run lint`, `npm run typecheck`, `npm run quality:ui-modularization`, `npm run quality:store-modularization`, `npm run test:ci`, and `npm run test:e2e` pass after refactor.
- AC9: No user-visible behavior regression in list/form harmonized screens, network summary interactions, and inspector/selection synchronization.

## Non-functional requirements
- Favor incremental, reviewable refactors over a single large rewrite.
- Preserve readability and explicitness of orchestration flows.
- Avoid introducing hidden coupling or circular imports during splits.
- Maintain deterministic local-first behavior and persistence compatibility.
- Keep accessibility behavior intact for drawer, floating panels, tables, and forms.
- Keep static deployment compatibility (Render/static hosting) and PWA build outputs intact.

## Out of scope
- Domain model redesign (`core/` graph/pathfinding logic).
- Visual redesign of current UX layouts/themes.
- New end-user features unrelated to modularization/perf (except minimal lazy-loading fallbacks).
- Full migration to a different state management solution.

# Backlog
- To create from this request:
  - `item_081_app_controller_orchestration_hook_extraction_wave_2.md`
  - `item_082_app_utils_domain_split_and_import_cleanup.md`
  - `item_083_analysis_workspace_content_split_by_subscreen.md`
  - `item_084_network_summary_panel_svg_overlay_and_toolbar_modularization.md`
  - `item_085_modeling_forms_column_per_entity_form_panel_extraction.md`
  - `item_086_css_modularization_wave_2_base_workspace_canvas_validation_settings.md`
  - `item_087_safe_code_splitting_for_heavy_workspaces_and_chunk_regression_checks.md`
  - `item_088_ui_ci_regression_pass_line_budget_exception_cleanup_and_e2e_alignment.md`

# References
- `src/app/AppController.tsx`
- `src/app/lib/app-utils.ts`
- `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/components/workspace/ModelingFormsColumn.tsx`
- `src/app/styles/base.css`
- `src/app/styles/workspace.css`
- `src/app/styles/canvas.css`
- `src/app/styles/validation-settings.css`
- `scripts/quality/check-ui-modularization.mjs`
- `package.json`
- `.github/workflows/ci.yml`
- `tests/e2e/smoke.spec.ts`

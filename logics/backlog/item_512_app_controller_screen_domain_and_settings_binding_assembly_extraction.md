## item_512_app_controller_screen_domain_and_settings_binding_assembly_extraction - AppController screen-domain and settings-binding assembly extraction
> From version: 1.3.1
> Status: Done
> Understanding: 99%
> Confidence: 98%
> Progress: 100%
> Complexity: High
> Theme: Controller / Modularity
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`AppController.tsx` contains large inline assembly blocks for screen content and settings/canvas binding maps, generating high cognitive load and high edit risk.

# Scope
- In:
  - extract screen-domain content assembly into dedicated hook/module;
  - extract settings/canvas binding bundles into typed helper modules;
  - keep downstream component contracts unchanged;
  - reduce controller file size toward phase-1 line budget.
- Out:
  - major redesign of screen composition architecture.

# Acceptance criteria
- AC1: Screen-domain assembly moves out of `AppController.tsx` into dedicated module(s).
- AC2: Settings/canvas binding maps are extracted into typed reusable bundles.
- AC3: `AppController.tsx` line count decreases strongly toward `<= 1100` target.
- AC4: Existing screens/settings behavior remains equivalent under test.

# AC Traceability
- AC1 -> Composition concern is separated.
- AC2 -> Binding noise is reduced and typed.
- AC3 -> Size-reduction objective is measurable.
- AC4 -> Behavior parity remains protected.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_104_post_release_architecture_and_runtime_hardening_for_preferences_measurement_and_controller_split.md`.
- Orchestrated by `logics/tasks/task_080_req_104_post_release_architecture_and_runtime_hardening_orchestration_and_delivery_control.md`.
- Delivered in current increments:
  - catalog-specific modeling/analysis domain assembly extracted to `src/app/hooks/controller/useAppControllerCatalogScreenDomains.tsx`;
  - `AppController` now passes typed state models directly for settings bindings (`prefs: preferencesState`, `canvasDisplay: canvasDisplayState`) instead of rebuilding large inline maps;
  - network-scope auxiliary binding now passes `formState: networkScopeFormState` directly;
  - modeling/analysis domain input assembly extracted to `src/app/hooks/controller/useAppControllerModelingAnalysisDomainAssembly.tsx` (including selection/go-to wiring and onboarding target callbacks);
  - auxiliary screen-domain binding assembly extracted into `src/app/hooks/controller/useAppControllerAuxDomainAssembly.tsx`;
  - catalog CSV import/export orchestration extracted from `AppController` into `src/app/hooks/useCatalogCsvImportExport.ts`;
  - workspace screen navigation callbacks extracted into `src/app/hooks/controller/useAppControllerWorkspaceScreenController.ts`;
  - `AppShellLayout` prop mapping extracted into `src/app/hooks/controller/buildAppControllerShellLayoutProps.ts`;
  - UI preference binding orchestration extracted into `src/app/hooks/controller/useAppControllerUiPreferencesBindings.ts`;
  - workspace-handlers domain assembly extracted into `src/app/hooks/controller/useAppControllerWorkspaceHandlersDomainAssembly.ts`;
  - home workspace content orchestration extracted into `src/app/hooks/controller/useAppControllerHomeWorkspaceContent.tsx`;
  - network summary panel domain assembly extracted into `src/app/hooks/controller/useAppControllerNetworkSummaryPanelDomain.tsx`;
  - selection handlers domain assembly extracted into `src/app/hooks/controller/useAppControllerSelectionHandlersDomainAssembly.ts`;
  - canvas interaction domain assembly extracted into `src/app/hooks/controller/useAppControllerCanvasInteractionDomainAssembly.ts`;
  - inspector/issue/layout state assembly extracted into `src/app/hooks/controller/useAppControllerInspectorIssueLayoutState.tsx`;
  - network summary viewport sizing assembly extracted into `src/app/hooks/controller/useAppControllerNetworkViewportState.ts`;
  - shell header offset observer extracted into `src/app/hooks/controller/useAppControllerHeaderOffsetState.ts`;
  - canvas state synchronization effects extracted into `src/app/hooks/controller/useAppControllerCanvasStateSyncEffects.ts`;
  - uniqueness flags extraction into `src/app/hooks/controller/useAppControllerUniquenessFlags.ts`;
  - regenerate-layout workflow extraction into `src/app/hooks/controller/useAppControllerRegenerateLayoutAction.ts`;
  - controller lifecycle effects extraction into `src/app/hooks/controller/useAppControllerLifecycleEffects.ts`;
  - workspace network-domain orchestration extraction into `src/app/hooks/controller/useAppControllerWorkspaceNetworkDomainAssembly.ts`;
  - workspace content-domain assembly extraction into `src/app/hooks/controller/useAppControllerWorkspaceContentAssembly.tsx`;
  - AppController overlays rendering extracted into `src/app/components/layout/AppControllerOverlays.tsx`;
  - app snapshot subscription extracted into `src/app/hooks/useAppSnapshot.ts`;
  - `AppController.tsx` reduced from `2524` to `1100` lines across these steps (`2702` baseline in req_104 scope).
- Remaining for full closure:
  - none (phase-1 objective reached for this backlog item).
- Validation evidence:
  - `npm run -s lint` ✅
  - `npm run -s typecheck` ✅
  - `npx vitest run src/tests/app.ui.catalog-csv-import-export.spec.tsx src/tests/app.ui.settings.spec.tsx src/tests/app.ui.home.spec.tsx` ✅
  - `npx vitest run src/tests/app.ui.onboarding.spec.tsx src/tests/app.ui.inspector-shell.spec.tsx src/tests/app.ui.network-summary-workflow-polish.spec.tsx src/tests/app.ui.analysis-go-to-wire.spec.tsx` ✅
  - `npx vitest run src/tests/app.ui.settings-canvas-callouts.spec.tsx src/tests/app.ui.network-summary-workflow-polish.spec.tsx src/tests/app.ui.onboarding.spec.tsx` ✅
  - `npx vitest run src/tests/app.ui.home.spec.tsx src/tests/app.ui.settings.spec.tsx src/tests/app.ui.onboarding.spec.tsx src/tests/app.ui.network-summary-workflow-polish.spec.tsx src/tests/app.ui.settings-canvas-render.spec.tsx` ✅
  - `npx vitest run src/tests/app.ui.home.spec.tsx src/tests/app.ui.settings.spec.tsx src/tests/app.ui.onboarding.spec.tsx src/tests/app.ui.network-summary-workflow-polish.spec.tsx src/tests/app.ui.settings-canvas-render.spec.tsx` ✅ (post-refactor pass)
  - `wc -l src/app/AppController.tsx src/app/components/NetworkSummaryPanel.tsx` -> `1100` / `975` ✅

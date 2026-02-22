## item_107_app_controller_screen_slice_callsite_compaction_and_domain_hooks - AppController Screen Slice Call-Site Compaction and Domain Hooks
> From version: 0.5.3
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: Screen-Domain Call-Site Volume Reduction
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`AppController.tsx` still contains large call-site assembly blocks for `use*ScreenContentSlice(...)` hooks, which preserves substantial line volume and review noise even though prop-building logic moved out in wave-4.

# Scope
- In:
  - Introduce screen-domain hooks/contracts (or equivalent modules) that compact `use*ScreenContentSlice(...)` call-site assembly in `AppController`.
  - Preserve explicit dependency flow by domain (`modeling`, `analysis`, `validation`, `settings`, `networkScope`).
  - Keep behavior parity and avoid mega-hook indirection.
- Out:
  - Reworking child screen/workspace component public prop contracts unless necessary for compaction.
  - New features.

# Acceptance criteria
- Large screen-slice call-site assembly blocks are materially reduced in `AppController.tsx`.
- Explicit screen-domain contracts remain traceable and typed.
- No behavior regressions in screen composition, selection, or screen-specific actions.
- `AppController` becomes easier to scan due to reduced screen call-site volume.

# Priority
- Impact: Very high (major remaining LOC source after wave-4).
- Urgency: High (first step toward measurable LOC reduction).

# Notes
- Dependencies: builds on `req_017` screen slices (`useAppControllerScreenContentSlices`).
- Blocks: item_112, item_113.
- Related AC: AC1, AC2, AC3, AC7, AC8.
- References:
  - `logics/request/req_018_app_controller_decomposition_wave_5_real_loc_reduction_and_composition_root_slimming.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`
  - `src/app/components/containers/ModelingWorkspaceContainer.tsx`
  - `src/app/components/containers/AnalysisWorkspaceContainer.tsx`
  - `src/app/components/containers/ValidationWorkspaceContainer.tsx`
  - `src/app/components/containers/SettingsWorkspaceContainer.tsx`
  - `src/app/components/containers/NetworkScopeWorkspaceContainer.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`


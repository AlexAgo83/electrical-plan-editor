## item_082_app_utils_domain_split_and_import_cleanup - App Utils Domain Split and Import Cleanup
> From version: 0.5.0
> Understanding: 100%
> Confidence: 99%
> Progress: 100%
> Complexity: High
> Theme: Utility Ownership and Import Clarity
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`src/app/lib/app-utils.ts` has grown into a mixed-purpose utility module, which obscures ownership, increases accidental coupling, and makes targeted reuse harder.

# Scope
- In:
  - Split `app-utils.ts` into domain-oriented utility files (sorting/parsing/labels/canvas/form helpers).
  - Clean up imports across the app to reference the new modules explicitly.
  - Preserve helper behavior and signatures when possible to minimize regression risk.
  - Prevent circular dependencies during split.
- Out:
  - Broad refactors of call sites unrelated to import migration.
  - New feature behavior hidden behind utility changes.

# Acceptance criteria
- `app-utils.ts` is replaced or substantially reduced in favor of focused modules.
- Utility imports are clearer and domain-specific across impacted files.
- No circular import issues are introduced.
- Lint/typecheck/tests remain green.

# Priority
- Impact: High (cross-cutting maintainability and future refactor enablement).
- Urgency: High (supports `AppController` and analysis/canvas splits).

# Notes
- Blocks: item_081, item_083, item_084, item_085 (recommended sequencing support).
- Related AC: AC2, AC8.
- References:
  - `logics/request/req_014_ui_modularization_wave_2_controller_analysis_canvas_and_bundle_optimization.md`
  - `src/app/lib/app-utils.ts`
  - `src/app/lib/app-utils-shared.ts`
  - `src/app/lib/app-utils-networking.ts`
  - `src/app/lib/app-utils-layout.ts`
  - `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/components/workspace/ModelingFormsColumn.tsx`

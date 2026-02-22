## item_097_layout_utils_domain_split_geometry_grid_scoring_generation_postprocess - Layout Utils Domain Split (Geometry / Grid / Scoring / Generation / Postprocess)
> From version: 0.5.1
> Understanding: 100%
> Confidence: 99%
> Progress: 100%
> Complexity: High
> Theme: Layout Engine Ownership Boundaries
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`src/app/lib/app-utils-layout.ts` centralizes multiple layout responsibilities (geometry helpers, grid helpers, scoring/conflict logic, generation orchestration, post-processing), which slows changes and increases regression risk for 2D layout behavior.

# Scope
- In:
  - Split `app-utils-layout.ts` into layout-domain modules (exact names may vary):
    - types
    - geometry
    - grid
    - scoring
    - generation
    - postprocess
  - Preserve current exported behavior/signatures where possible.
  - Avoid circular imports and unclear dependency direction.
  - Keep algorithm semantics stable.
- Out:
  - Layout algorithm redesign or heuristic changes.
  - Worker/off-main-thread execution migration.

# Acceptance criteria
- `app-utils-layout.ts` is significantly reduced or replaced by a thin façade over focused layout modules.
- Layout responsibilities are split into coherent files with explicit ownership.
- No circular import issues are introduced.
- `core.layout` and dependent integration flows remain green with stable behavior.

# Priority
- Impact: Very high (core layout maintainability hotspot).
- Urgency: High (foundation for safer future layout work).

# Notes
- Blocks: item_098, item_099.
- Dependencies: none mandatory (completed).
- Related AC: AC3, AC4, AC5, AC7.
- Delivery status: Completed with `src/app/lib/layout/*` domain split and `src/app/lib/app-utils-layout.ts` compatibility façade preserving public exports.
- References:
  - `logics/request/req_016_app_controller_and_layout_engine_modularization_wave_3.md`
  - `src/app/lib/app-utils-layout.ts`
  - `src/app/lib/layout/index.ts`
  - `src/app/lib/layout/generation.ts`
  - `src/app/lib/layout/geometry.ts`
  - `src/app/lib/layout/grid.ts`
  - `src/app/lib/layout/scoring.ts`
  - `src/app/lib/layout/postprocess.ts`
  - `src/app/lib/layout/types.ts`
  - `src/app/lib/app-utils-shared.ts`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/tests/core.layout.spec.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

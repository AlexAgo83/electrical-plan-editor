## item_030_app_component_composition_split - App Component Composition Split
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Frontend Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`src/app/App.tsx` centralizes too many UI concerns in one file. This slows feature delivery, increases merge conflicts, and raises regression risk.

# Scope
- In:
  - Split `App.tsx` into composable UI components by workspace concern.
  - Keep `App.tsx` as orchestration/composition entry point.
  - Preserve current behavior across modeling, analysis, validation, and settings screens.
  - Define clear component boundaries and data flow contracts.
- Out:
  - Domain behavior changes in reducer/store logic.
  - UX redesign unrelated to modularization.

# Acceptance criteria
- `App.tsx` is reduced to composition logic and no longer hosts all feature blocks inline.
- Extracted components map to major workspace areas with explicit props/contracts.
- No behavioral regression on existing screen/sub-screen flows.
- Build and UI tests remain green after split.

# Priority
- Impact: Very high (core maintainability gain).
- Urgency: Immediate (foundation for UI modularization wave).

# Notes
- Dependencies: item_009, item_010.
- Blocks: item_031, item_032, item_033, item_034.
- Related AC: AC1, AC2.
- References:
  - `logics/request/req_005_large_ui_files_split_and_hook_extraction.md`
  - `src/app/App.tsx`


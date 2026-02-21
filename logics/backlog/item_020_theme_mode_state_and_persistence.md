## item_020_theme_mode_state_and_persistence - Theme Mode State and Persistence
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: UX/UI Theming Foundation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Theme switching requires a deterministic source of truth. Without a dedicated state contract and persistence rules, mode changes will be inconsistent and lost on reload.

# Scope
- In:
  - Define global theme mode contract (`normal`, `dark`) in store/settings state.
  - Add actions/reducer logic to switch theme mode deterministically.
  - Persist theme preference in local storage and restore at startup.
  - Guarantee that theme preference is stored independently from electrical model entities.
- Out:
  - UI placement/design of switch control.
  - Full visual restyling of all workspace surfaces.

# Acceptance criteria
- Theme mode is represented by a strict enum/union with only `normal` and `dark`.
- Toggling mode updates app state immediately and consistently.
- Reload restores the last selected mode from persisted settings.
- Switching theme mode never mutates domain entities (`Connector`, `Splice`, `Node`, `Segment`, `Wire`, `Network`).

# Priority
- Impact: Very high (foundation for all theme work).
- Urgency: Immediate (must be implemented first).

# Notes
- Dependencies: item_007, item_010.
- Blocks: item_021, item_022, item_024.
- Related AC: AC1, AC2, AC5.
- References:
  - `logics/request/req_003_theme_mode_switch_normal_dark.md`
  - `src/store/types.ts`
  - `src/store/actions.ts`
  - `src/store/reducer.ts`
  - `src/store/selectors.ts`
  - `src/adapters/persistence/localStorage.ts`
  - `src/adapters/persistence/migrations.ts`


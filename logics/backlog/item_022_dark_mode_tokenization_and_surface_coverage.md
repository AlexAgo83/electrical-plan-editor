## item_022_dark_mode_tokenization_and_surface_coverage - Dark Mode Tokenization and Surface Coverage
> From version: 0.1.0
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: UX/UI Visual System
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Enabling dark mode requires coherent design tokens and full surface coverage. Partial style overrides create inconsistent readability and visual regressions.

# Scope
- In:
  - Define theme tokens for `normal` and `dark` modes (backgrounds, text, borders, status colors).
  - Apply tokens to workspace chrome, lists/tables, inspector forms, validation panels, and canvas-side UI.
  - Preserve state semantics in both modes (`selected`, `focused`, `warning`, `error`, `active`).
  - Ensure technical information hierarchy remains clear (`Name` primary, `Technical ID` secondary).
- Out:
  - New branding language unrelated to mode support.
  - Additional modes beyond `normal` and `dark`.

# Acceptance criteria
- Dark mode styling is applied consistently across all main workspace surfaces.
- Visual hierarchy is preserved in both modes for critical labels and statuses.
- No unreadable text/background combinations are introduced in covered screens.
- Canvas companion UI (legend/controls/side panels) respects mode tokens.

# Priority
- Impact: High (quality and usability in dark mode).
- Urgency: High after switch integration.

# Notes
- Dependencies: item_011, item_013, item_020, item_021.
- Blocks: item_023, item_024.
- Related AC: AC3, AC4.
- References:
  - `logics/request/req_003_theme_mode_switch_normal_dark.md`
  - `src/app/styles.css`
  - `src/app/App.tsx`


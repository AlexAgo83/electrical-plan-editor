## item_015_network_selector_and_active_scope_navigation - Network Selector and Active Scope Navigation
> From version: 0.1.0
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Multi-Network UX Navigation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Operators need a deterministic and always-visible way to switch between networks. Without active-scope navigation, edits and analysis cannot be trusted in multi-network mode.

# Scope
- In:
  - Add a persistent network selector in workspace chrome.
  - Display `name` and `technicalId` for each network option.
  - Switch active context across lists, canvas, inspector, and validation views.
  - Persist and restore active network context across page reloads.
  - Add explicit empty state when no network exists with `Create network` primary action.
- Out:
  - Full lifecycle actions (`duplicate`, `delete`, fallback behavior) beyond scope navigation.
  - Multi-user/shared navigation state.

# Acceptance criteria
- Users can switch between at least two networks from a persistent selector.
- All visible modeling/analysis data updates to active network scope after selection.
- Reload restores the previously active network when it still exists.
- No-network state is explicit and provides a direct creation action.

# Priority
- Impact: High (critical for day-to-day usability).
- Urgency: High after item_014.

# Notes
- Dependencies: item_009, item_010, item_014.
- Blocks: item_018.
- Related AC: AC1, AC2, AC6, AC7.
- References:
  - `logics/request/req_002_multi_network_management_and_navigation.md`
  - `src/app/App.tsx`
  - `src/app/styles.css`
  - `src/store/selectors.ts`


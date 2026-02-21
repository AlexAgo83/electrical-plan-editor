## item_013_v1_list_ergonomics_search_filter_action_consistency - V1 List Ergonomics (Search, Filter, Action Consistency)
> From version: 0.1.0
> Understanding: 98%
> Confidence: 95%
> Progress: 80%
> Complexity: Medium
> Theme: UX/UI Data Ergonomics
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Entity lists are improving with sorting, but operators still need faster lookup and consistent action patterns to manage medium-size datasets efficiently.

# Scope
- In:
  - Add fast text search to all entity lists.
  - Add entity-specific filter chips (kind/status/sub-network/occupancy where relevant).
  - Standardize row action patterns and placement across all lists.
  - Enforce visual hierarchy: `Name` primary, `Technical ID` secondary monospace.
- Out:
  - Server-side pagination.
  - Complex saved view presets beyond basic filter persistence.

# Acceptance criteria
- All entity lists support sort + search at minimum.
- Relevant lists expose filter chips aligned with domain semantics.
- Action buttons are consistent in order and labeling across entities.
- Technical IDs are readable and visually distinct from names in list rows.

# Priority
- Impact: Medium-High (daily operator productivity).
- Urgency: Medium (can progress in parallel with validation center).

# Notes
- Dependencies: item_009.
- Related AC: AC5, AC7.
- Status update:
  - Sort + search is available across all core entity lists.
  - Filter chips are available for node kind and wire route mode.
  - Technical IDs are visually differentiated with monospace styling in list tables.
  - Additional filter chips for connector/splice/segment dimensions remain possible.
- References:
  - `logics/request/req_001_v1_ux_ui_operator_workspace.md`
  - `src/app/App.tsx`
  - `src/app/styles.css`

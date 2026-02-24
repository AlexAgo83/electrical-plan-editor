## item_295_network_scope_action_area_open_button_and_two_row_grouping_rework - Network Scope Action Area `Open` Button and Two-Row Grouping Rework
> From version: 0.9.1
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Faster network navigation and clearer action grouping in Network Scope
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The `Network Scope` action area can be improved for operator flow and clarity. There is no dedicated `Open` shortcut to jump directly into `Modeling` for the focused network, and the current action-button arrangement does not reflect a clear grouping between creation/destructive actions and navigation/state/export actions.

# Scope
- In:
  - Add an `Open` button in the `Network Scope` action area.
  - `Open` action semantics:
    - target the currently focused/selected network
    - perform `Set active` semantics for that network
    - navigate to the `Modeling` screen for that network
  - Rework button layout into two rows:
    - Row 1: `New` / `Duplicate` / `Delete`
    - Row 2: `Open` / `Set active` / `Export`
  - Preserve existing disabled/enabled guards and selection requirements.
  - Preserve keyboard focus order and accessibility semantics after reordering.
  - Maintain theme consistency and readable button layout on supported desktop widths.
- Out:
  - Changes to `Set active` behavior beyond the `Open` shortcut semantics.
  - Network creation/duplication/deletion/export business logic changes.
  - Broader `Network Scope` table/filter redesign.

# Acceptance criteria
- `Network Scope` action area includes an `Open` button for the focused/selected network.
- Clicking `Open` sets the selected network as active and navigates to the `Modeling` screen for that network.
- Action buttons render in the requested two-row grouping and preserve existing action guards/behaviors.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_047`, `req_002` (multi-network management/navigation baseline).
- Blocks: item_296.
- Related AC: AC6, AC7, AC8, AC9.
- References:
  - `logics/request/req_047_table_readability_endpoint_column_split_analysis_wire_name_subrows_and_filtered_entry_count_footers.md`
  - `logics/request/req_002_multi_network_management_and_navigation.md`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/app/hooks/useWorkspaceNavigation.ts`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/tests/app.ui.networks.spec.tsx`

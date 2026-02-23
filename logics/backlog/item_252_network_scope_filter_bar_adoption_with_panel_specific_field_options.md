## item_252_network_scope_filter_bar_adoption_with_panel_specific_field_options - Network Scope Filter Bar Adoption with Panel-Specific Field Options
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium-High
> Theme: Second-Target Validation of Shared Table Filter Pattern in Network Scope
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_042` now explicitly includes `Network Scope` as an early non-wire adoption target. The filter-bar pattern must prove reusable beyond wire panels, with panel-specific filter fields and no regression to current Network Scope table interactions.

# Scope
- In:
  - Apply the shared filter-bar pattern to `Network Scope` table UI:
    - `Filter` label
    - field selector
    - full-width input within existing panel width constraints
  - Provide panel-specific field selector options (recommended examples: `Name`, `Technical ID`, `Description`, optional `Any`) aligned to actual Network Scope data shown.
  - Implement filtering behavior for selected Network Scope fields.
  - Keep interaction consistency with wire panel pattern (layout, labeling, keyboard/focus behavior).
  - Document any deviations if Network Scope data shape requires panel-specific behavior.
- Out:
  - Full rollout to all remaining table panels (`Connectors`, `Splices`, `Nodes`, `Segments`) unless explicitly expanded later.
  - Advanced query syntax.
  - Regression test suite additions (handled in item_253).

# Acceptance criteria
- `Network Scope` adopts the same filter-bar pattern (label + selector + full-width input) without panel width growth.
- Network Scope field selector options are panel-appropriate and filtering follows selected field.
- Network Scope table interactions remain functional after adoption.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_042`, item_250.
- Blocks: item_253, item_254.
- Related AC: AC3, AC8, AC9.
- References:
  - `logics/request/req_042_wire_list_filter_bar_field_selector_and_full_width_input_without_panel_growth.md`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`
  - `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`


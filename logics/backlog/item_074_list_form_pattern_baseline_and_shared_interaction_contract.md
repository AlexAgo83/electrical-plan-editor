## item_074_list_form_pattern_baseline_and_shared_interaction_contract - List/Form Pattern Baseline and Shared Interaction Contract
> From version: 0.4.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Interaction Contract Standardization
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
List + form screens currently follow mixed interaction patterns, making behavior inconsistent and harder to predict across Modeling/Analysis workspaces.

# Scope
- In:
  - Define the canonical UX contract based on `Network Scope`:
    - focused row drives context,
    - action row under list drives operations,
    - create/edit form reflects focused context and explicit mode.
  - Align shared terminology and states (`idle`, `create`, `edit`, focused row, selected row).
  - Define shared disabled-state rules for under-list actions.
  - Define shared visual and keyboard interaction rules to be reused across migrated screens.
- Out:
  - Entity-specific migration implementation details (covered by item_075..item_077).
  - Final regression closure and E2E sweep (covered by item_080).

# Acceptance criteria
- A documented interaction contract exists and is applied as implementation reference for migrated list/form screens.
- Focused-row semantics are explicitly defined and consistent with current `Network Scope` behavior.
- Under-list action-row behavior and disabled-state rules are explicitly defined.
- Create/edit mode transitions are explicitly defined and reusable across entities.

# Priority
- Impact: Very high (foundation for all migration items).
- Urgency: High (must be completed first to avoid inconsistent rewrites).

# Notes
- Blocks: item_075, item_076, item_077, item_078, item_079, item_080.
- Related AC: AC1, AC3, AC4.
- References:
  - `logics/request/req_013_list_form_workspace_harmonization_based_on_network_scope.md`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/ModelingFormsColumn.tsx`
  - `src/app/styles/workspace.css`
  - `src/app/styles/tables.css`

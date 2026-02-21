## item_076_nodes_segments_list_action_row_and_form_alignment - Nodes/Segments List Action Row and Form Alignment
> From version: 0.4.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Structural Entity Workflow Consistency
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Node and segment screens still embed per-row action controls in table columns, leading to inconsistent interaction flow and reduced scanability compared with `Network Scope`.

# Scope
- In:
  - Remove `Actions` columns for node and segment tables.
  - Add under-list action rows for node/segment operations.
  - Use focused row as single action target.
  - Preserve special node/segment rules:
    - immutable IDs in edit mode,
    - connected-segment guards on delete,
    - endpoint validation and segment constraints.
  - Keep current search/filter/sort and route-highlight context stable.
- Out:
  - Wire-specific route workflow migration (covered by item_077).
  - Cross-entity regression suite consolidation (covered by item_078 and item_080).

# Acceptance criteria
- Node and segment tables no longer show an `Actions` column.
- Node and segment actions are moved below the list and operate on focused row.
- Row focus/selection is keyboard-accessible and consistent with migrated connector/splice behavior.
- Existing domain guards and validation messages remain unchanged.
- Segment route-highlight and selection visuals remain coherent after migration.

# Priority
- Impact: High (graph structure editing reliability).
- Urgency: High (core modeling flow dependency).

# Notes
- Dependencies: item_074.
- Blocks: item_078, item_080.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC8.
- References:
  - `logics/request/req_013_list_form_workspace_harmonization_based_on_network_scope.md`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/ModelingFormsColumn.tsx`
  - `src/app/AppController.tsx`
  - `src/app/styles/workspace.css`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

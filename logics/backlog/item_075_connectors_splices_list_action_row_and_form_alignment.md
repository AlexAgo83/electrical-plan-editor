## item_075_connectors_splices_list_action_row_and_form_alignment - Connectors/Splices List Action Row and Form Alignment
> From version: 0.4.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Primary Entity UX Harmonization
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Connector and splice tables still rely on inline row action stacks and `Actions` columns, which conflicts with the new list/form model used in `Network Scope`.

# Scope
- In:
  - Remove `Actions` columns for connector/splice tables.
  - Introduce under-list action row for connector/splice operations.
  - Make focused row the target for edit/delete/select-like operations.
  - Ensure create mode disables operations that should not run during creation.
  - Align form mode transitions and copy with `Network Scope`-style behavior.
  - Keep existing search/filter/sort behavior unchanged.
- Out:
  - Nodes/segments/wires migration (covered by item_076 and item_077).
  - Cross-screen responsive/a11y hardening (covered by item_079).

# Acceptance criteria
- Connector and splice tables no longer expose an `Actions` column.
- Connector and splice operations are available in a dedicated action row below each list.
- Clicking/keyboard-activating a row sets focus and drives edit form context.
- Create/edit form behavior remains functionally stable and deterministic.
- No regression in connector/splice validation constraints and occupancy rules.

# Priority
- Impact: High (high-frequency entity workflows).
- Urgency: High (first concrete migration wave).

# Notes
- Dependencies: item_074.
- Blocks: item_078, item_080.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC8.
- References:
  - `logics/request/req_013_list_form_workspace_harmonization_based_on_network_scope.md`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingFormsColumn.tsx`
  - `src/app/AppController.tsx`
  - `src/app/styles/workspace.css`
  - `src/app/styles/tables.css`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`

## req_034_creation_form_auto_technical_id_suggestions_and_connector_splice_auto_node_creation - Creation Form Auto Technical ID Suggestions and Connector/Splice Auto-Node Creation
> From version: 0.7.3
> Understanding: 98%
> Confidence: 97%
> Complexity: Medium
> Theme: Creation Flow Ergonomics and Modeling Bootstrap Automation
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- In creation forms, pre-fill `Technical ID` fields with the next available/suggested ID so users do not need to type them manually every time.
- When creating a `Connector` or a `Splice`, automatically create a corresponding `Node` representing it in the network graph (users may later delete or edit that node if needed).

# Context
User feedback highlights friction in the modeling creation workflow:

1. Repetitive manual entry of `Technical ID` values in create forms slows down data entry and increases the chance of collisions/format inconsistencies.
2. Creating connectors/splices without automatically creating their graph nodes adds extra steps before they become usable in segments/wires/routing workflows.

This request targets ergonomics improvements in the creation flow while preserving editability and user control.

## Objectives
- Reduce data-entry friction by suggesting/pre-filling valid next available `Technical ID` values in create forms.
- Speed up graph modeling by auto-creating connector/splice nodes when those entities are created.
- Preserve current manual control (users can edit generated IDs and can modify/delete auto-created nodes later).
- Avoid breaking existing edit flows, validation rules, and uniqueness constraints.

## Functional Scope
### A. Auto-suggest / pre-fill `Technical ID` in creation forms (high priority)
- For supported create forms (at minimum `Connector` and `Splice`; evaluate also `Network`, `Wire`, `Segment` if consistent), pre-fill the `Technical ID` input with a suggested next available ID.
- Suggestion requirements:
  - must be unique among existing entities of the same type
  - must be deterministic and stable enough for user trust
  - should follow the existing naming conventions/prefixes used in the app (or documented fallback format)
- UX behavior:
  - pre-fill only in `create` mode (not when editing an existing entity)
  - users can override the suggested value manually
  - if the suggested ID becomes invalid due to concurrent local changes in the same session, normal validation still applies
- Clarify regeneration behavior:
  - when reopening a fresh create form, compute a new suggestion
  - do not overwrite user manual edits while the form is already open and being edited

### B. Auto-create node when creating a `Connector` (high priority)
- On successful connector creation, automatically create a `Node` of kind `connector` linked to the created connector.
- Behavior requirements:
  - the auto-created node must reference the new connector correctly
  - node ID must be unique (define generation strategy)
  - creation should happen as part of the same user workflow (atomic behavior from the user's perspective)
- UX expectations:
  - user should be able to later edit or delete the auto-created node
  - existing node validation/selection/form sync should continue to work

### C. Auto-create node when creating a `Splice` (high priority)
- On successful splice creation, automatically create a `Node` of kind `splice` linked to the created splice.
- Apply the same expectations as connector auto-node creation:
  - unique node ID generation
  - valid reference wiring
  - user can later modify/delete the node

### D. Duplicate/edge-case handling for auto-node creation (medium-high priority)
- Define and handle edge cases explicitly:
  - if connector/splice creation succeeds but auto-node creation would fail (ID collision, invalid state)
  - if a node for the same connector/splice already exists (should not happen in create flow, but guard behavior must be defined)
- Preferred behavior:
  - avoid partial success that leaves the entity created but the node missing without user feedback
  - surface a clear error/status if the auto-node step cannot complete
- If true atomicity is difficult with current reducer/action design, specify compensating behavior and user-visible messaging.

### E. Selection/focus/form behavior after auto-created entity + node flows (medium priority)
- Ensure post-create UX remains coherent with recent table focus improvements:
  - created connector/splice remains selected/focused in its table
  - create form transitions appropriately (per current product behavior)
  - no unexpected focus stealing
- Auto-created node should not break current selection assumptions in Modeling/Analysis switching flows.

## Non-functional requirements
- Preserve uniqueness validation and existing user overrides of `Technical ID`.
- Do not regress form validation or selection/focus synchronization.
- Keep auto-ID suggestion logic predictable and easy to extend to other entities later.
- Keep auto-node creation implementation maintainable (prefer shared helper(s) for connector/splice symmetry).

## Validation and regression safety
- Targeted tests (minimum, depending on touched areas):
  - modeling UI tests covering create-form behavior and post-create focus/selection:
    - `src/tests/app.ui.navigation-canvas.spec.tsx`
    - other modeling-focused UI specs if touched
  - store/reducer tests if auto-node creation is implemented in reducer/action flows:
    - `src/tests/store.reducer.entities.spec.ts` (or equivalent)
- Additional recommended coverage:
  - unit tests for technical ID suggestion helper(s)
  - tests ensuring suggestions do not overwrite manual edits after user typing
- Closure validation (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`

## Acceptance criteria
- AC1: In supported create forms, `Technical ID` is pre-filled with a valid next available suggestion by default.
- AC2: Users can override the suggested `Technical ID`, and validation still enforces uniqueness/format rules.
- AC3: Opening a new create form computes a fresh suggestion without overwriting user edits in an already-open form.
- AC4: Creating a `Connector` automatically creates a corresponding connector `Node` linked to it.
- AC5: Creating a `Splice` automatically creates a corresponding splice `Node` linked to it.
- AC6: Auto-created nodes are editable/deletable through normal modeling workflows.
- AC7: Failure/edge-case behavior for auto-node creation is handled safely with explicit user-visible feedback or compensated behavior.
- AC8: Existing focus/selection/form behavior remains coherent after creation flows (no regressions in post-create UX).

## Out of scope
- Full redesign of all entity ID conventions across the app.
- Automatic creation of segments/wires/routes after entity creation.
- Bulk-create workflows or multi-entity wizards.
- Forced immutability of auto-generated IDs (users must still be able to edit them unless specified later).

# Backlog
- `logics/backlog/item_203_create_form_technical_id_suggestion_strategy_and_shared_next_available_id_helpers.md`
- `logics/backlog/item_204_connector_and_splice_create_form_technical_id_prefill_wiring_without_overwriting_manual_edits.md`
- `logics/backlog/item_205_connector_creation_auto_generates_linked_connector_node_with_valid_unique_node_id.md`
- `logics/backlog/item_206_splice_creation_auto_generates_linked_splice_node_with_valid_unique_node_id.md`
- `logics/backlog/item_207_auto_node_creation_failure_handling_atomicity_or_compensation_and_user_feedback.md`
- `logics/backlog/item_208_post_create_selection_focus_and_form_mode_coherence_with_auto_generated_nodes.md`
- `logics/backlog/item_209_creation_flow_regression_tests_for_id_suggestions_and_connector_splice_auto_node_bootstrap.md`
- `logics/backlog/item_210_req_034_creation_flow_ergonomics_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# References
- `src/app/hooks/useConnectorHandlers.ts`
- `src/app/hooks/useSpliceHandlers.ts`
- `src/app/hooks/useNodeHandlers.ts`
- `src/app/components/workspace/ModelingConnectorFormPanel.tsx`
- `src/app/components/workspace/ModelingSpliceFormPanel.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/hooks/useEntityFormsState.ts`
- `src/store/actions.ts`
- `src/store/reducer/connectorReducer.ts`
- `src/store/reducer/spliceReducer.ts`
- `src/store/reducer/nodeReducer.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/store.reducer.entities.spec.ts`

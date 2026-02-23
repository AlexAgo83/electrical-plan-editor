## item_203_create_form_technical_id_suggestion_strategy_and_shared_next_available_id_helpers - Create-Form Technical ID Suggestion Strategy and Shared Next-Available ID Helpers
> From version: 0.7.3
> Understanding: 97%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Deterministic Auto-Suggest ID Generation for Creation Flows
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Creation forms currently require manual `Technical ID` entry, increasing repetitive work and error risk. A shared, deterministic ID suggestion strategy is needed before wiring UI prefill behavior.

# Scope
- In:
  - Define a consistent strategy for generating next-available suggested `Technical ID` values (initially for connector/splice, extensible to other entities).
  - Implement shared helper(s) for next-available ID suggestions based on existing entity lists.
  - Document fallback behavior when existing IDs do not match expected numeric suffix patterns.
  - Ensure helpers preserve uniqueness and stable output for the same input set.
- Out:
  - Form prefill wiring and lifecycle behavior.
  - Auto-node creation behavior.

# Acceptance criteria
- Shared helper(s) generate unique suggested `Technical ID` values for supported entity types.
- Suggestion behavior is deterministic and documented for non-standard existing IDs.
- Helpers are structured for reuse by create forms without duplicating logic.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_034`.
- Blocks: item_204, item_209, item_210.
- Related AC: AC1, AC2, AC3.
- References:
  - `logics/request/req_034_creation_form_auto_technical_id_suggestions_and_connector_splice_auto_node_creation.md`
  - `src/app/hooks/useConnectorHandlers.ts`
  - `src/app/hooks/useSpliceHandlers.ts`
  - `src/app/hooks/useEntityFormsState.ts`


## item_385_regression_coverage_for_delete_confirmation_across_entities - Regression coverage for delete-confirmation behavior across entities
> From version: 0.9.14
> Understanding: 96%
> Confidence: 93%
> Progress: 100%
> Complexity: Medium-High
> Theme: Regression safety for destructive-action confirmation policy
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without targeted regression coverage, one or more delete entrypoints can silently bypass confirmation in future refactors.

# Scope
- In:
  - Add/extend UI integration tests for delete-capable entities:
    - modal opens before delete,
    - cancel does not mutate,
    - confirm applies deletion when valid.
  - Verify guarded delete semantics remain intact when reducer constraints prevent deletion.
  - Add a lightweight guardrail against reintroducing direct system confirms in delete paths.
- Out:
  - Broad E2E suite expansion unrelated to delete flows.
  - Store-level mutation semantics changes not required by req_074.

# Acceptance criteria
- Automated tests cover delete-confirm behavior for network, catalog item, connector, splice, node, segment, and wire.
- Guarded deletion scenarios remain covered and non-regressed.
- Test suite fails if delete actions bypass required confirmation.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_074`, `item_383`, `item_384`.
- Blocks: `item_386`, `task_068`.
- Related AC: AC1, AC2, AC3, AC5.
- References:
  - `logics/request/req_074_all_delete_actions_require_styled_confirmation_modal.md`
  - `src/tests/app.ui.catalog.spec.tsx`
  - `src/tests/app.ui.modeling-actions.spec.tsx`
  - `src/tests/app.ui.networks.spec.tsx`
  - `src/tests/`

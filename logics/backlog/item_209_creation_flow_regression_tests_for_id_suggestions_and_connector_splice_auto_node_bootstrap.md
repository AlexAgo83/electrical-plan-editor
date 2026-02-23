## item_209_creation_flow_regression_tests_for_id_suggestions_and_connector_splice_auto_node_bootstrap - Creation Flow Regression Tests for ID Suggestions and Connector/Splice Auto-Node Bootstrap
> From version: 0.7.3
> Understanding: 98%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Regression Coverage for Creation Ergonomics and Auto-Bootstrap Graph Nodes
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The requested creation-flow improvements affect form defaults, selection/focus behavior, and graph entity generation. Without targeted tests, regressions are likely.

# Scope
- In:
  - Add/adjust tests for technical ID prefill suggestions in connector/splice create forms.
  - Test that user manual edits to suggested IDs are not overwritten during the same create session.
  - Add/adjust tests for connector creation auto-generating a linked connector node.
  - Add/adjust tests for splice creation auto-generating a linked splice node.
  - Cover relevant post-create focus/form coherence assertions where behavior is user-visible.
- Out:
  - Full CI closure reporting (handled separately).
  - Unrelated UI regression expansions.

# Acceptance criteria
- Automated tests cover ID suggestion prefill and manual override retention.
- Automated tests cover connector/splice auto-node creation behavior.
- Tests cover at least one visible post-create UX coherence path (focus/form/selection).

# Priority
- Impact: Very High.
- Urgency: High.

# Notes
- Dependencies: `req_034`, item_204, item_205, item_206, item_207, item_208.
- Blocks: item_210.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8.
- References:
  - `logics/request/req_034_creation_form_auto_technical_id_suggestions_and_connector_splice_auto_node_creation.md`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/store.reducer.entities.spec.ts`


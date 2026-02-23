## item_208_post_create_selection_focus_and_form_mode_coherence_with_auto_generated_nodes - Post-Create Selection, Focus, and Form-Mode Coherence with Auto-Generated Nodes
> From version: 0.7.3
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: UX Coherence for Creation Flows After Auto-ID and Auto-Node Automation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Recent work improved post-create row focus and form transitions. Auto-ID prefill and auto-node creation may unintentionally disrupt these behaviors or create new focus/selection ambiguities.

# Scope
- In:
  - Verify and preserve post-create UX for connector/splice creation after automation changes.
  - Ensure the created connector/splice remains selected/focused in its table and form state remains coherent.
  - Ensure auto-created nodes do not unexpectedly steal selection/focus from the primary created entity.
  - Confirm Modeling/Analysis selection synchronization remains coherent after automated node creation.
- Out:
  - New selection paradigms or multi-select workflows.
  - Broad focus-management refactors unrelated to req_034.

# Acceptance criteria
- Post-create focus remains on the created connector/splice row (per current UX expectations).
- Form mode transition behavior remains coherent and predictable after creation.
- Auto-created node presence does not break selection/focus synchronization across screens.

# Priority
- Impact: High.
- Urgency: Medium.

# Notes
- Dependencies: `req_034`, item_204, item_205, item_206, item_207.
- Blocks: item_209, item_210.
- Related AC: AC4, AC5, AC6, AC8.
- References:
  - `logics/request/req_034_creation_form_auto_technical_id_suggestions_and_connector_splice_auto_node_creation.md`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/hooks/useConnectorHandlers.ts`
  - `src/app/hooks/useSpliceHandlers.ts`
  - `src/app/AppController.tsx`


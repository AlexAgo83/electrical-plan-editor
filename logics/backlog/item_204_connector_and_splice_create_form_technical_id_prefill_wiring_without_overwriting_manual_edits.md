## item_204_connector_and_splice_create_form_technical_id_prefill_wiring_without_overwriting_manual_edits - Connector/Splice Create Form Technical ID Prefill Wiring Without Overwriting Manual Edits
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Creation Form UX Wiring for Suggested Technical IDs
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with a suggestion helper, creation forms need careful lifecycle wiring so suggested IDs appear in create mode without overriding user manual edits while the form is open.

# Scope
- In:
  - Wire suggested `Technical ID` prefill into connector/splice create forms.
  - Apply prefill in `create` mode only.
  - Regenerate suggestions when opening a fresh create form (new session of creation).
  - Do not overwrite user manual edits after the user starts typing.
  - Keep edit mode behavior unchanged (existing entity IDs remain loaded as-is).
- Out:
  - Auto-node creation logic.
  - Cross-entity rollout beyond connector/splice (unless trivially included and tested).

# Acceptance criteria
- Connector/splice create forms pre-fill `Technical ID` with a valid suggestion by default.
- Users can override the suggested value and it is not overwritten during the same create session.
- Reopening create form produces a fresh suggestion when appropriate.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_034`, item_203.
- Blocks: item_208, item_209, item_210.
- Related AC: AC1, AC2, AC3, AC8.
- References:
  - `logics/request/req_034_creation_form_auto_technical_id_suggestions_and_connector_splice_auto_node_creation.md`
  - `src/app/components/workspace/ModelingConnectorFormPanel.tsx`
  - `src/app/components/workspace/ModelingSpliceFormPanel.tsx`
  - `src/app/hooks/useEntityFormsState.ts`

